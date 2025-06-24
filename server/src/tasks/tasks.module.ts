import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TaskWatcher } from './entities/task-watcher.entity';
import { TaskHistory } from './entities/task-history.entity';
import { TaskComment } from './entities/task-comment.entity';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskWatcher, TaskHistory, TaskComment]),
    TeamsModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
