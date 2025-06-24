import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TeamMember } from '../../teams/entities/team-member.entity';
import { Task } from '../../tasks/entities/task.entity';
import { TaskWatcher } from '../../tasks/entities/task-watcher.entity';
import { TaskHistory } from '../../tasks/entities/task-history.entity';
import { TaskComment } from '../../tasks/entities/task-comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TeamMember, teamMember => teamMember.user)
  teamMemberships: TeamMember[];

  @OneToMany(() => Task, task => task.creator)
  createdTasks: Task[];

  @OneToMany(() => Task, task => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => TaskWatcher, watcher => watcher.user)
  watchedTasks: TaskWatcher[];

  @OneToMany(() => TaskHistory, history => history.user)
  taskHistories: TaskHistory[];

  @OneToMany(() => TaskComment, comment => comment.user)
  taskComments: TaskComment[];
}
