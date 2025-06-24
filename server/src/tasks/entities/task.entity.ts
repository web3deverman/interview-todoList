import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';
import { TaskWatcher } from './task-watcher.entity';
import { TaskHistory } from './task-history.entity';
import { TaskComment } from './task-comment.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @Column({ nullable: true })
  parent_task_id: string;

  @Column()
  team_id: string;

  @Column()
  created_by: string;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ type: 'datetime', nullable: true })
  due_date: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Task, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_task_id' })
  parentTask: Task;

  @OneToMany(() => Task, task => task.parentTask)
  subtasks: Task[];

  @ManyToOne(() => Team, team => team.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, user => user.createdTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, user => user.assignedTasks, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @OneToMany(() => TaskWatcher, watcher => watcher.task)
  watchers: TaskWatcher[];

  @OneToMany(() => TaskHistory, history => history.task)
  history: TaskHistory[];

  @OneToMany(() => TaskComment, comment => comment.task)
  comments: TaskComment[];
}
