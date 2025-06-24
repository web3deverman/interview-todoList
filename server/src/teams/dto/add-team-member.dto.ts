import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamRole } from '../entities/team-member.entity';

export class AddTeamMemberDto {
  @ApiProperty({
    description: 'User ID to add to team',
    example: 'uuid-string',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Role for the team member',
    enum: TeamRole,
    example: TeamRole.MEMBER,
  })
  @IsNotEmpty()
  @IsEnum(TeamRole)
  role: TeamRole;
}
