import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember])],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
