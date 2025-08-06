// src/services/sport.service.ts
import { Sport, SportType } from '@prisma/client';
import { SportModel } from '../model/sport.model';

interface CreateSportDto {
    name: SportType;
    isTeamSport: boolean;
}

interface UpdateSportDto {
    name?: SportType;
    isTeamSport?: boolean;
}

export class SportService {
    private sportModel: SportModel;

    constructor() {
        this.sportModel = new SportModel();
    }

    async createSport(data: CreateSportDto): Promise<Sport> {
        return await this.sportModel.create(data);
    }

    async getAllSports(): Promise<Sport[]> {
        return await this.sportModel.findAll();
    }

    async getSportById(sportId: number): Promise<Sport | null> {
        return await this.sportModel.findById(sportId);
    }

    async updateSport(sportId: number, data: UpdateSportDto): Promise<Sport> {
        return await this.sportModel.update(sportId, data);
    }

    async deleteSport(sportId: number): Promise<Sport> {
        return await this.sportModel.delete(sportId);
    }

    async getSportByName(name: SportType): Promise<Sport | null> {
        return await this.sportModel.findByName(name);
    }

    async getTeamSports(): Promise<Sport[]> {
        return await this.sportModel.findTeamSports();
    }

    async getIndividualSports(): Promise<Sport[]> {
        return await this.sportModel.findIndividualSports();
    }

    async getSportStats(sportId: number): Promise<{
        sport: Sport | null;
        totalTeams: number;
        totalAthletes: number;
        totalEvents: number;
        totalDisciplines: number;
        totalPositions: number;
    }> {
        return await this.sportModel.getSportStats(sportId);
    }
}