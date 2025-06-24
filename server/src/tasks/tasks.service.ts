import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { TaskWatcher } from './entities/task-watcher.entity';
import { TaskHistory, ActionType } from './entities/task-history.entity';
import { TaskComment } from './entities/task-comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskWatcher)
    private taskWatcherRepository: Repository<TaskWatcher>,
    @InjectRepository(TaskHistory)
    private taskHistoryRepository: Repository<TaskHistory>,
    @InjectRepository(TaskComment)
    private taskCommentRepository: Repository<TaskComment>,
    private teamsService: TeamsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // Check if user is member of the team
    const membership = await this.teamsService.checkMembership(createTaskDto.team_id, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // If parent task specified, check if it exists and user has access
    if (createTaskDto.parent_task_id) {
      const parentTask = await this.findOne(createTaskDto.parent_task_id);
      if (parentTask.team_id !== createTaskDto.team_id) {
        throw new BadRequestException('Parent task must be in the same team');
      }
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      created_by: userId,
      due_date: createTaskDto.due_date ? new Date(createTaskDto.due_date) : null,
    });

    const savedTask = await this.taskRepository.save(task);

    // Create history entry
    await this.createHistoryEntry(savedTask.id, userId, ActionType.CREATED, null, null, 'Task created');

    // Add creator as watcher
    await this.addWatcher(savedTask.id, userId);

    return this.findOne(savedTask.id);
  }

  async findAll(userId: string, filters: TaskFilterDto): Promise<Task[]> {
    // Get user's teams
    const userTeams = await this.teamsService.findAll(userId);
    const teamIds = userTeams.map(team => team.id);

    if (teamIds.length === 0) {
      return [];
    }

    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.team', 'team')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('task.parentTask', 'parentTask')
      .leftJoinAndSelect('task.watchers', 'watchers')
      .leftJoinAndSelect('watchers.user', 'watcherUser')
      .where('task.team_id IN (:...teamIds)', { teamIds });

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters.assigned_to) {
      queryBuilder.andWhere('task.assigned_to = :assigned_to', { assigned_to: filters.assigned_to });
    }

    if (filters.created_by) {
      queryBuilder.andWhere('task.created_by = :created_by', { created_by: filters.created_by });
    }

    if (filters.team_id) {
      queryBuilder.andWhere('task.team_id = :team_id', { team_id: filters.team_id });
    }

    if (filters.start_date && filters.end_date) {
      queryBuilder.andWhere('task.created_at BETWEEN :start_date AND :end_date', {
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'DESC';
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder);

    return queryBuilder.getMany();
  }

  async findMyTasks(userId: string): Promise<{
    created: Task[];
    assigned: Task[];
    watching: Task[];
  }> {
    const [created, assigned, watchedTasks] = await Promise.all([
      this.taskRepository.find({
        where: { created_by: userId },
        relations: ['creator', 'assignee', 'team', 'subtasks', 'parentTask'],
        order: { created_at: 'DESC' },
      }),
      this.taskRepository.find({
        where: { assigned_to: userId },
        relations: ['creator', 'assignee', 'team', 'subtasks', 'parentTask'],
        order: { created_at: 'DESC' },
      }),
      this.taskWatcherRepository.find({
        where: { user_id: userId },
        relations: ['task', 'task.creator', 'task.assignee', 'task.team', 'task.subtasks', 'task.parentTask'],
      }),
    ]);

    const watching = watchedTasks.map(watcher => watcher.task);

    return { created, assigned, watching };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'assignee',
        'team',
        'subtasks',
        'subtasks.creator',
        'subtasks.assignee',
        'parentTask',
        'watchers',
        'watchers.user',
        'history',
        'history.user',
        'comments',
        'comments.user',
      ],
      order: {
        history: { created_at: 'DESC' },
        comments: { created_at: 'ASC' },
        subtasks: { created_at: 'ASC' },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id);

    // Check if user can update the task (team member)
    const membership = await this.teamsService.checkMembership(task.team_id, userId);
    if (!membership) {
      throw new ForbiddenException('You do not have permission to update this task');
    }    const oldValues: any = {};
    const newValues: any = {};

    // Create update data object
    const updateData: any = { ...updateTaskDto };

    // Track changes for history
    Object.keys(updateTaskDto).forEach(key => {
      if (updateTaskDto[key] !== undefined && task[key] !== updateTaskDto[key]) {
        oldValues[key] = task[key];
        newValues[key] = updateTaskDto[key];
      }
    });

    // Special handling for status change
    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      if (updateTaskDto.status === TaskStatus.COMPLETED) {
        updateData.completed_at = new Date();
        // Auto-complete parent task if all subtasks are completed
        if (task.parent_task_id) {
          await this.checkAndCompleteParentTask(task.parent_task_id);
        }
      } else if (task.status === TaskStatus.COMPLETED) {
        updateData.completed_at = null;
      }
    }

    // Handle due_date conversion
    if (updateTaskDto.due_date) {
      updateData.due_date = new Date(updateTaskDto.due_date);
    }

    await this.taskRepository.update(id, updateData);

    // Create history entries for changes
    for (const key of Object.keys(newValues)) {
      await this.createHistoryEntry(
        id,
        userId,
        key === 'status' ? ActionType.STATUS_CHANGED : ActionType.UPDATED,
        oldValues[key]?.toString(),
        newValues[key]?.toString(),
        `Updated ${key} from ${oldValues[key]} to ${newValues[key]}`,
      );
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);

    // Check if user can delete the task (creator or team admin/owner)
    const membership = await this.teamsService.checkMembership(task.team_id, userId);
    if (!membership || (task.created_by !== userId && membership.role === 'member')) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.taskRepository.remove(task);
  }

  async addWatcher(taskId: string, userId: string): Promise<void> {
    const task = await this.findOne(taskId);
    
    // Check if user can watch the task (team member)
    const membership = await this.teamsService.checkMembership(task.team_id, userId);
    if (!membership) {
      throw new ForbiddenException('You do not have permission to watch this task');
    }

    // Check if already watching
    const existingWatcher = await this.taskWatcherRepository.findOne({
      where: { task_id: taskId, user_id: userId },
    });

    if (!existingWatcher) {
      const watcher = this.taskWatcherRepository.create({
        task_id: taskId,
        user_id: userId,
      });
      await this.taskWatcherRepository.save(watcher);
    }
  }

  async removeWatcher(taskId: string, userId: string): Promise<void> {
    const watcher = await this.taskWatcherRepository.findOne({
      where: { task_id: taskId, user_id: userId },
    });

    if (watcher) {
      await this.taskWatcherRepository.remove(watcher);
    }
  }

  async addComment(taskId: string, createCommentDto: CreateCommentDto, userId: string): Promise<TaskComment> {
    const task = await this.findOne(taskId);

    // Check if user can comment on the task (team member)
    const membership = await this.teamsService.checkMembership(task.team_id, userId);
    if (!membership) {
      throw new ForbiddenException('You do not have permission to comment on this task');
    }

    const comment = this.taskCommentRepository.create({
      task_id: taskId,
      user_id: userId,
      content: createCommentDto.content,
    });

    const savedComment = await this.taskCommentRepository.save(comment);

    // Create history entry
    await this.createHistoryEntry(taskId, userId, ActionType.COMMENTED, null, null, createCommentDto.content);

    return this.taskCommentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  private async createHistoryEntry(
    taskId: string,
    userId: string,
    actionType: ActionType,
    oldValue: string | null,
    newValue: string | null,
    comment: string | null,
  ): Promise<void> {
    const history = this.taskHistoryRepository.create({
      task_id: taskId,
      user_id: userId,
      action_type: actionType,
      old_value: oldValue,
      new_value: newValue,
      comment,
    });

    await this.taskHistoryRepository.save(history);
  }

  private async checkAndCompleteParentTask(parentTaskId: string): Promise<void> {
    const parentTask = await this.taskRepository.findOne({
      where: { id: parentTaskId },
      relations: ['subtasks'],
    });

    if (!parentTask) return;

    const allSubtasksCompleted = parentTask.subtasks.every(
      subtask => subtask.status === TaskStatus.COMPLETED,
    );

    if (allSubtasksCompleted && parentTask.status !== TaskStatus.COMPLETED) {
      await this.taskRepository.update(parentTaskId, {
        status: TaskStatus.COMPLETED,
        completed_at: new Date(),
      });

      // Create history entry for auto-completion
      await this.createHistoryEntry(
        parentTaskId,
        parentTask.created_by, // Use creator as the user for auto-completion
        ActionType.COMPLETED,
        TaskStatus.IN_PROGRESS,
        TaskStatus.COMPLETED,
        'Auto-completed when all subtasks were completed',
      );

      // Check if this parent task also has a parent
      if (parentTask.parent_task_id) {
        await this.checkAndCompleteParentTask(parentTask.parent_task_id);
      }
    }
  }
}
