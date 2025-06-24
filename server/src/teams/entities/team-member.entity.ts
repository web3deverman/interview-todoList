import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

@Entity('team_members')
@Unique(['team_id', 'user_id'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  team_id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.MEMBER
  })
  role: TeamRole;

  @CreateDateColumn()
  joined_at: Date;

  @ManyToOne(() => Team, team => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, user => user.teamMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
