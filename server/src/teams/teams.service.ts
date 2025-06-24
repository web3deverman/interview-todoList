import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember, TeamRole } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  async create(createTeamDto: CreateTeamDto, userId: string): Promise<Team> {
    const team = this.teamRepository.create({
      ...createTeamDto,
      created_by: userId,
    });

    const savedTeam = await this.teamRepository.save(team);

    // Add creator as owner
    const teamMember = this.teamMemberRepository.create({
      team_id: savedTeam.id,
      user_id: userId,
      role: TeamRole.OWNER,
    });

    await this.teamMemberRepository.save(teamMember);

    return this.findOne(savedTeam.id);
  }

  async findAll(userId: string): Promise<Team[]> {
    const userTeams = await this.teamMemberRepository.find({
      where: { user_id: userId },
      relations: ['team', 'team.members', 'team.members.user'],
    });

    return userTeams.map(userTeam => userTeam.team);
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'creator'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async addMember(teamId: string, addMemberDto: AddTeamMemberDto, requestUserId: string): Promise<TeamMember> {
    // Check if requester has permission (owner or admin)
    const requesterMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: requestUserId },
    });

    if (!requesterMembership || (requesterMembership.role !== TeamRole.OWNER && requesterMembership.role !== TeamRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to add members to this team');
    }

    // Check if user is already a member
    const existingMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: addMemberDto.userId },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this team');
    }

    const teamMember = this.teamMemberRepository.create({
      team_id: teamId,
      user_id: addMemberDto.userId,
      role: addMemberDto.role,
    });

    return this.teamMemberRepository.save(teamMember);
  }

  async removeMember(teamId: string, userId: string, requestUserId: string): Promise<void> {
    // Check if requester has permission (owner or admin)
    const requesterMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: requestUserId },
    });

    if (!requesterMembership || (requesterMembership.role !== TeamRole.OWNER && requesterMembership.role !== TeamRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to remove members from this team');
    }

    // Cannot remove team owner
    const targetMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: userId },
    });

    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this team');
    }

    if (targetMembership.role === TeamRole.OWNER) {
      throw new ForbiddenException('Cannot remove team owner');
    }

    await this.teamMemberRepository.remove(targetMembership);
  }

  async checkMembership(teamId: string, userId: string): Promise<TeamMember | null> {
    return this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: userId },
      relations: ['team'],
    });
  }
}
