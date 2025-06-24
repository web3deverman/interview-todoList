import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

export enum ActionType {
  CREATED = 'created',
  UPDATED = 'updated',
  COMPLETED = 'completed',
  ASSIGNED = 'assigned',
  COMMENTED = 'commented',
  STATUS_CHANGED = 'status_changed'
}

@Entity('task_history')
export class TaskHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  task_id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: ActionType
  })
  action_type: ActionType;

  @Column('text', { nullable: true })
  old_value: string;

  @Column('text', { nullable: true })
  new_value: string;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Task, task => task.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, user => user.taskHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
