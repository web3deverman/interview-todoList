import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Implement user authentication',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Implement JWT-based authentication system',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Team ID',
    example: 'uuid-string',
  })
  @IsNotEmpty()
  @IsUUID()
  team_id: string;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assigned_to?: string;

  @ApiProperty({
    description: 'Parent task ID for subtasks',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parent_task_id?: string;

  @ApiProperty({
    description: 'Due date',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}
