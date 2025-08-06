// src/services/discipline.service.ts
import { Discipline } from '@prisma/client';
import { DisciplineModel } from '../model/discipline.model';

interface CreateDisciplineDto {
    name: string;
    code: string;
    sportId: number;
    description?: string;
    unit?: string;
}

interface UpdateDisciplineDto {
    name?: string;
    code?: string;
    sportId?: number;
    description?: string;
    unit?: string;
}

export class DisciplineService {
    private disciplineModel: DisciplineModel;

    constructor() {
        this.disciplineModel = new DisciplineModel();
    }

    async createDiscipline(data: CreateDisciplineDto): Promise<Discipline> {
        return await this.disciplineModel.create(data);
    }

    async getAllDisciplines(sportId?: number): Promise<Discipline[]> {
        return await this.disciplineModel.findAll(sportId);
    }

    async getDisciplineById(disciplineId: number): Promise<Discipline | null> {
        return await this.disciplineModel.findById(disciplineId);
    }

    async updateDiscipline(disciplineId: number, data: UpdateDisciplineDto): Promise<Discipline> {
        return await this.disciplineModel.update(disciplineId, data);
    }

    async deleteDiscipline(disciplineId: number): Promise<Discipline> {
        return await this.disciplineModel.delete(disciplineId);
    }

    async getDisciplinesBySport(sportId: number): Promise<Discipline[]> {
        return await this.disciplineModel.findBySport(sportId);
    }

    async addAthleteToDiscipline(disciplineId: number, athleteId: number, currentRank?: number): Promise<void> {
        return await this.disciplineModel.addAthlete(disciplineId, athleteId, currentRank);
    }

    async removeAthleteFromDiscipline(disciplineId: number, athleteId: number): Promise<void> {
        return await this.disciplineModel.removeAthlete(disciplineId, athleteId);
    }

    async updateAthleteRank(disciplineId: number, athleteId: number, currentRank: number): Promise<void> {
        return await this.disciplineModel.updateAthleteRank(disciplineId, athleteId, currentRank);
    }

    async getDisciplineAthletes(disciplineId: number): Promise<any[]> {
        const discipline = await this.disciplineModel.findById(disciplineId);
        return (discipline as any)?.athletes || [];
    }

    async getRankings(disciplineId: number, limit: number = 20): Promise<any[]> {
        return await this.disciplineModel.getRankings(disciplineId, limit);
    }

    async getRecords(disciplineId: number, seasonId?: number): Promise<{
        discipline: Discipline | null;
        bestTime?: any;
        bestDistance?: any;
        bestHeight?: any;
        topPerformances: any[];
    }> {
        return await this.disciplineModel.getRecords(disciplineId, seasonId);
    }

    async getDisciplineStats(disciplineId: number): Promise<{
        discipline: Discipline | null;
        totalAthletes: number;
        totalPerformances: number;
        averagePerformance: {
            time?: number;
            distance?: number;
            height?: number;
        };
        recordHolder?: any;
    }> {
        return await this.disciplineModel.getDisciplineStats(disciplineId);
    }

    async search(query: string, sportId?: number): Promise<Discipline[]> {
        return await this.disciplineModel.search(query, sportId);
    }
} 