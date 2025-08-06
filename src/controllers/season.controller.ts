// src/controllers/season.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SeasonService } from '../service/season.service';

const prisma = new PrismaClient();
export class SeasonController {
    private seasonService: SeasonService;

    constructor() {
        this.seasonService = new SeasonService();
    }

    async createSeason(req: Request, res: Response): Promise<void> {
        try {
            const season = await this.seasonService.createSeason(req.body);
            res.status(201).json({
                success: true,
                message: 'Season created successfully',
                data: season
            });
        } catch (error) {
            console.error('Error creating season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllSeasons(req: Request, res: Response): Promise<void> {
        try {
            const seasons = await this.seasonService.getAllSeasons();
            res.status(200).json({
                success: true,
                message: 'Seasons retrieved successfully',
                data: seasons
            });
        } catch (error) {
            console.error('Error getting seasons:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getSeasonById(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = parseInt(req.params.id);

            if (isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid season ID'
                });
                return;
            }

            const season = await this.seasonService.getSeasonById(seasonId);

            if (!season) {
                res.status(404).json({
                    success: false,
                    message: 'Season not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Season retrieved successfully',
                data: season
            });
        } catch (error) {
            console.error('Error getting season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateSeason(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = parseInt(req.params.id);

            if (isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid season ID'
                });
                return;
            }

            const season = await this.seasonService.updateSeason(seasonId, req.body);
            res.status(200).json({
                success: true,
                message: 'Season updated successfully',
                data: season
            });
        } catch (error) {
            console.error('Error updating season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteSeason(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = parseInt(req.params.id);

            if (isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid season ID'
                });
                return;
            }

            await this.seasonService.deleteSeason(seasonId);
            res.status(200).json({
                success: true,
                message: 'Season deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getActiveSeason(req: Request, res: Response): Promise<void> {
        try {
            const season = await this.seasonService.getActiveSeason();
            res.status(200).json({
                success: true,
                message: 'Active season retrieved successfully',
                data: season
            });
        } catch (error) {
            console.error('Error getting active season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async setActiveSeason(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = parseInt(req.params.id);

            if (isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid season ID'
                });
                return;
            }

            const season = await this.seasonService.setActiveSeason(seasonId);
            res.status(200).json({
                success: true,
                message: 'Season activated successfully',
                data: season
            });
        } catch (error) {
            console.error('Error setting active season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getSeasonsByYear(req: Request, res: Response): Promise<void> {
        try {
            const year = parseInt(req.params.year);

            if (isNaN(year)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid year'
                });
                return;
            }

            const seasons = await this.seasonService.getSeasonsByYear(year);
            res.status(200).json({
                success: true,
                message: 'Seasons retrieved successfully',
                data: seasons
            });
        } catch (error) {
            console.error('Error getting seasons by year:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 