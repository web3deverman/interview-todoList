import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Team name',
    example: 'Development Team',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Team description',
    example: 'A team for frontend development tasks',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
