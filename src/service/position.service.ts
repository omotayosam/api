// src/services/position.service.ts
import { Position } from '@prisma/client';
import { PositionModel } from '../model/position.model';

interface CreatePositionDto {
    name: string;
    code: string;
    sportId: number;
    description?: string;
}

interface UpdatePositionDto {
    name?: string;
    code?: string;
    sportId?: number;
    description?: string;
}

export class PositionService {
    private positionModel: PositionModel;

    constructor() {
        this.positionModel = new PositionModel();
    }

    async createPosition(data: CreatePositionDto): Promise<Position> {
        return await this.positionModel.create(data);
    }

    async getAllPositions(sportId?: number): Promise<Position[]> {
        return await this.positionModel.findAll(sportId);
    }

    async getPositionById(positionId: number): Promise<Position | null> {
        return await this.positionModel.findById(positionId);
    }

    async updatePosition(positionId: number, data: UpdatePositionDto): Promise<Position> {
        return await this.positionModel.update(positionId, data);
    }

    async deletePosition(positionId: number): Promise<Position> {
        return await this.positionModel.delete(positionId);
    }

    async getPositionsBySport(sportId: number): Promise<Position[]> {
        return await this.positionModel.findBySport(sportId);
    }

    async getPositionStats(positionId: number): Promise<{
        position: Position | null;
        totalAthletes: number;
        activeAthletes: number;
    }> {
        return await this.positionModel.getPositionStats(positionId);
    }
} 