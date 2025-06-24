import { Controller, Get, Post, Body, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamsService.create(createTeamDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams for current user' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.teamsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addMember(
    @Param('id') teamId: string,
    @Body() addMemberDto: AddTeamMemberDto,
    @Request() req,
  ) {
    return this.teamsService.addMember(teamId, addMemberDto, req.user.userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from team' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found in team' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    await this.teamsService.removeMember(teamId, userId, req.user.userId);
    return { message: 'Member removed successfully' };
  }
}
