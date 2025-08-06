// src/services/gameday.service.ts
import { Gameday, GamedayStatus } from "@prisma/client";
import { GamedayModel } from "../model/gameday.model";

interface CreateGamedayDto {
    name: string;
    seasonId: number;
    scheduledDate: Date;
}

interface UpdateGamedayDto {
    name?: string;
    seasonId?: number;
    scheduledDate?: Date;
}

export class GamedayService {
    private gamedayModel: GamedayModel;

    constructor() {
        this.gamedayModel = new GamedayModel();
    }

    async createGameday(data: CreateGamedayDto): Promise<Gameday> {
        return await this.gamedayModel.create(data);
    }

    async getAllGamedays(filter?: {
        status?: GamedayStatus;
        seasonId?: number;
    }): Promise<Gameday[]> {
        return await this.gamedayModel.findAll(filter);
    }

    async getGamedayById(gamedayId: number): Promise<Gameday | null> {
        return await this.gamedayModel.findById(gamedayId);
    }

    async updateGameday(gamedayId: number, data: UpdateGamedayDto): Promise<Gameday> {
        return await this.gamedayModel.update(gamedayId, data);
    }

    async deleteGameday(gamedayId: number): Promise<Gameday> {
        // Since the model doesn't have a delete method, we'll implement it here
        // This is a simple implementation - you may want to add proper delete logic
        throw new Error('Delete method not implemented in GamedayModel');
    }

    async completeGameday(gamedayId: number): Promise<Gameday> {
        return await this.gamedayModel.completeGameday(gamedayId);
    }

    async addEventsToGameday(gamedayId: number, eventIds: number[]): Promise<void> {
        return await this.gamedayModel.addEventsToGameday(gamedayId, eventIds);
    }

    // Additional methods needed by the controller
    async getGamedaysBySeason(seasonId: number): Promise<Gameday[]> {
        return await this.gamedayModel.findAll({ seasonId });
    }

    async getCurrentGameday(seasonId?: number): Promise<Gameday | null> {
        const gamedays = await this.gamedayModel.findAll({ status: GamedayStatus.ACTIVE, seasonId });
        return gamedays.length > 0 ? gamedays[0] : null;
    }

    async getNextGameday(seasonId?: number): Promise<Gameday | null> {
        const gamedays = await this.gamedayModel.findAll({ status: GamedayStatus.UPCOMING, seasonId });
        return gamedays.length > 0 ? gamedays[0] : null;
    }

    async getPreviousGameday(seasonId?: number): Promise<Gameday | null> {
        const gamedays = await this.gamedayModel.findAll({ status: GamedayStatus.COMPLETED, seasonId });
        return gamedays.length > 0 ? gamedays[0] : null;
    }

    async setCurrentGameday(gamedayId: number): Promise<Gameday> {
        // This would need to be implemented in the model or here
        throw new Error('setCurrentGameday method not implemented');
    }

    async finishGameday(gamedayId: number): Promise<Gameday> {
        return await this.gamedayModel.completeGameday(gamedayId);
    }
}