import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/entities/user.entity';
import { Team } from './teams/entities/team.entity';
import { TeamMember } from './teams/entities/team-member.entity';
import { Task } from './tasks/entities/task.entity';
import { TaskWatcher } from './tasks/entities/task-watcher.entity';
import { TaskHistory } from './tasks/entities/task-history.entity';
import { TaskComment } from './tasks/entities/task-comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'todolist',
      password: process.env.DB_PASSWORD || 'todolist123',
      database: process.env.DB_DATABASE || 'todolist_db',
      entities: [User, Team, TeamMember, Task, TaskWatcher, TaskHistory, TaskComment],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 300000, // 5 minutes in milliseconds
        max: 100, // maximum number of items in cache
      }),
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    TasksModule,
  ],
})
export class AppModule {}
