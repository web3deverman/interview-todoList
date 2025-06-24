import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('task_watchers')
@Unique(['task_id', 'user_id'])
export class TaskWatcher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  task_id: string;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Task, task => task.watchers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, user => user.watchedTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
