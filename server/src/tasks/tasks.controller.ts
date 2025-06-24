import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a team member' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'assigned_to', required: false, description: 'Filter by assigned user' })
  @ApiQuery({ name: 'created_by', required: false, description: 'Filter by creator' })
  @ApiQuery({ name: 'team_id', required: false, description: 'Filter by team' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req, @Query() filters: TaskFilterDto) {
    return this.tasksService.findAll(req.user.userId, filters);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get current user\'s tasks (created, assigned, watching)' })
  @ApiResponse({ status: 200, description: 'User tasks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTasks(@Request() req) {
    return this.tasksService.findMyTasks(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.tasksService.remove(id, req.user.userId);
    return { message: 'Task deleted successfully' };
  }

  @Post(':id/watchers')
  @ApiOperation({ summary: 'Add current user as task watcher' })
  @ApiResponse({ status: 201, description: 'Watcher added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a team member' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addWatcher(@Param('id') taskId: string, @Request() req) {
    await this.tasksService.addWatcher(taskId, req.user.userId);
    return { message: 'Watcher added successfully' };
  }

  @Delete(':id/watchers')
  @ApiOperation({ summary: 'Remove current user as task watcher' })
  @ApiResponse({ status: 200, description: 'Watcher removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeWatcher(@Param('id') taskId: string, @Request() req) {
    await this.tasksService.removeWatcher(taskId, req.user.userId);
    return { message: 'Watcher removed successfully' };
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a team member' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.tasksService.addComment(taskId, createCommentDto, req.user.userId);
  }
}
