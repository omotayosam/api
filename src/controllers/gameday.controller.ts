// src/controllers/gameday.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GamedayService } from '../service/gameday.service';



export class GamedayController {
    private gamedayService: GamedayService;

    constructor() {
        const prisma = new PrismaClient();
        this.gamedayService = new GamedayService();
    }

    async createGameday(req: Request, res: Response): Promise<void> {
        try {
            const gameday = await this.gamedayService.createGameday(req.body);
            res.status(201).json({
                success: true,
                message: 'Gameday created successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error creating gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllGamedays(req: Request, res: Response): Promise<void> {
        try {
            const gamedays = await this.gamedayService.getAllGamedays(req.query);
            res.status(200).json({
                success: true,
                message: 'Gamedays retrieved successfully',
                data: gamedays
            });
        } catch (error) {
            console.error('Error getting gamedays:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getGamedayById(req: Request, res: Response): Promise<void> {
        try {
            const gamedayId = parseInt(req.params.id);

            if (isNaN(gamedayId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid gameday ID'
                });
                return;
            }

            const gameday = await this.gamedayService.getGamedayById(gamedayId);

            if (!gameday) {
                res.status(404).json({
                    success: false,
                    message: 'Gameday not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Gameday retrieved successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error getting gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateGameday(req: Request, res: Response): Promise<void> {
        try {
            const gamedayId = parseInt(req.params.id);

            if (isNaN(gamedayId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid gameday ID'
                });
                return;
            }

            const gameday = await this.gamedayService.updateGameday(gamedayId, req.body);
            res.status(200).json({
                success: true,
                message: 'Gameday updated successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error updating gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteGameday(req: Request, res: Response): Promise<void> {
        try {
            const gamedayId = parseInt(req.params.id);

            if (isNaN(gamedayId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid gameday ID'
                });
                return;
            }

            await this.gamedayService.deleteGameday(gamedayId);
            res.status(200).json({
                success: true,
                message: 'Gameday deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getGamedaysBySeason(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = parseInt(req.params.seasonId);

            if (isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid season ID'
                });
                return;
            }

            const gamedays = await this.gamedayService.getGamedaysBySeason(seasonId);
            res.status(200).json({
                success: true,
                message: 'Gamedays retrieved successfully',
                data: gamedays
            });
        } catch (error) {
            console.error('Error getting gamedays by season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getCurrentGameday(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;
            const gameday = await this.gamedayService.getCurrentGameday(seasonId);
            res.status(200).json({
                success: true,
                message: 'Current gameday retrieved successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error getting current gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getNextGameday(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;
            const gameday = await this.gamedayService.getNextGameday(seasonId);
            res.status(200).json({
                success: true,
                message: 'Next gameday retrieved successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error getting next gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPreviousGameday(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;
            const gameday = await this.gamedayService.getPreviousGameday(seasonId);
            res.status(200).json({
                success: true,
                message: 'Previous gameday retrieved successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error getting previous gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async setCurrentGameday(req: Request, res: Response): Promise<void> {
        try {
            const gamedayId = parseInt(req.params.id);

            if (isNaN(gamedayId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid gameday ID'
                });
                return;
            }

            const gameday = await this.gamedayService.setCurrentGameday(gamedayId);
            res.status(200).json({
                success: true,
                message: 'Current gameday set successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error setting current gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async finishGameday(req: Request, res: Response): Promise<void> {
        try {
            const gamedayId = parseInt(req.params.id);

            if (isNaN(gamedayId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid gameday ID'
                });
                return;
            }

            const gameday = await this.gamedayService.finishGameday(gamedayId);
            res.status(200).json({
                success: true,
                message: 'Gameday finished successfully',
                data: gameday
            });
        } catch (error) {
            console.error('Error finishing gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 