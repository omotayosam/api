// src/services/team.service.ts
import { Team } from '@prisma/client';
import { TeamModel } from '../model/team.model';

interface CreateTeamDto {
    code: string;
    name: string;
    sportId: number;
}

interface UpdateTeamDto {
    code?: string;
    name?: string;
    sportId?: number;
}

interface AddTeamMemberDto {
    teamId: number;
    athleteId: number;
    joinDate?: Date;
}

export class TeamService {
    private teamModel: TeamModel;

    constructor() {
        this.teamModel = new TeamModel();
    }

    async createTeam(data: CreateTeamDto): Promise<Team> {
        return await this.teamModel.create(data);
    }

    async getAllTeams(sportId?: number): Promise<Team[]> {
        return await this.teamModel.findAll(sportId);
    }

    async getTeamById(teamId: number): Promise<Team | null> {
        return await this.teamModel.findById(teamId);
    }

    async updateTeam(teamId: number, data: UpdateTeamDto): Promise<Team> {
        return await this.teamModel.update(teamId, data);
    }

    async deleteTeam(teamId: number): Promise<Team> {
        return await this.teamModel.delete(teamId);
    }

    async getTeamsBySport(sportId: number): Promise<Team[]> {
        return await this.teamModel.findBySport(sportId);
    }

    async getTeamByCode(code: string): Promise<Team | null> {
        return await this.teamModel.findByCode(code);
    }

    async getRoster(teamCode: string): Promise<Team | null> {
        return await this.teamModel.getRoster(teamCode);
    }

    async getTeamStats(teamCode: string, seasonId?: number): Promise<{
        team: Team | null;
        totalAthletes: number;
        activeAthletes: number;
        totalPerformances: number;
        recentPerformances: any[];
        positionBreakdown: { [position: string]: number };
    }> {
        return await this.teamModel.getTeamStats(teamCode, seasonId);
    }

    async addTeamMember(teamCode: string, athleteId: number, positionId?: number): Promise<void> {
        return await this.teamModel.addAthlete(teamCode, athleteId, positionId);
    }

    async removeTeamMember(athleteId: number): Promise<void> {
        return await this.teamModel.removeAthlete(athleteId);
    }

    async getEventPerformance(teamCode: string, eventId: number): Promise<{
        team: Team | null;
        performances: any[];
        teamStats: {
            totalPoints?: number;
            totalGoals?: number;
            totalAssists?: number;
            averageMinutesPlayed?: number;
        };
    }> {
        return await this.teamModel.getEventPerformance(teamCode, eventId);
    }
}