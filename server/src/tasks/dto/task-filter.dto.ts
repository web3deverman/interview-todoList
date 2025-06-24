import { IsOptional, IsEnum, IsDateString, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class TaskFilterDto {
  @ApiProperty({
    description: 'Filter by task status',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Filter by task priority',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Filter by assigned user ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assigned_to?: string;

  @ApiProperty({
    description: 'Filter by creator user ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  created_by?: string;

  @ApiProperty({
    description: 'Filter by team ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  team_id?: string;

  @ApiProperty({
    description: 'Filter by start date',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'Filter by end date',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Sort by field (created_at, due_date, priority, title)',
    example: 'created_at',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiProperty({
    description: 'Sort order (ASC or DESC)',
    example: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC';
}
