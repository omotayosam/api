// src/services/season.service.ts
import { Season, SeasonType } from '@prisma/client';
import { SeasonModel } from '../model/season.model';

interface CreateSeasonDto {
    name: string;
    seasonType: SeasonType;
    startYear: number;
    endYear: number;
    isActive?: boolean;
}

interface UpdateSeasonDto {
    name?: string;
    seasonType?: SeasonType;
    startYear?: number;
    endYear?: number;
    isActive?: boolean;
}

export class SeasonService {
    private seasonModel: SeasonModel;

    constructor() {
        this.seasonModel = new SeasonModel();
    }

    async createSeason(data: CreateSeasonDto): Promise<Season> {
        return await this.seasonModel.create(data);
    }

    async getAllSeasons(): Promise<Season[]> {
        return await this.seasonModel.findAll();
    }

    async getSeasonById(seasonId: number): Promise<Season | null> {
        return await this.seasonModel.findById(seasonId);
    }

    async updateSeason(seasonId: number, data: UpdateSeasonDto): Promise<Season> {
        return await this.seasonModel.update(seasonId, data);
    }

    async deleteSeason(seasonId: number): Promise<Season> {
        return await this.seasonModel.delete(seasonId);
    }

    async getActiveSeason(): Promise<Season | null> {
        return await this.seasonModel.findActive();
    }

    async setActiveSeason(seasonId: number): Promise<Season> {
        // First, deactivate all seasons
        await this.seasonModel.update(seasonId, { isActive: true });
        return await this.seasonModel.findById(seasonId) as Season;
    }

    async getSeasonsByYear(year: number): Promise<Season[]> {
        return await this.seasonModel.findByYear(year);
    }

    async getSeasonStats(seasonId: number): Promise<{
        season: Season | null;
        totalEvents: number;
        totalGamedays: number;
        totalPerformances: number;
        sportBreakdown: { [sport: string]: number };
    }> {
        return await this.seasonModel.getSeasonStats(seasonId);
    }
} 