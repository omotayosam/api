// src/controllers/position.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PositionService } from '../service/position.service';


export class PositionController {
    private positionService: PositionService;

    constructor() {
        const prisma = new PrismaClient();
        this.positionService = new PositionService();
    }

    async createPosition(req: Request, res: Response): Promise<void> {
        try {
            const position = await this.positionService.createPosition(req.body);
            res.status(201).json({
                success: true,
                message: 'Position created successfully',
                data: position
            });
        } catch (error) {
            console.error('Error creating position:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllPositions(req: Request, res: Response): Promise<void> {
        try {
            const positions = await this.positionService.getAllPositions();
            res.status(200).json({
                success: true,
                message: 'Positions retrieved successfully',
                data: positions
            });
        } catch (error) {
            console.error('Error getting positions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPositionById(req: Request, res: Response): Promise<void> {
        try {
            const positionId = parseInt(req.params.id);

            if (isNaN(positionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid position ID'
                });
                return;
            }

            const position = await this.positionService.getPositionById(positionId);

            if (!position) {
                res.status(404).json({
                    success: false,
                    message: 'Position not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Position retrieved successfully',
                data: position
            });
        } catch (error) {
            console.error('Error getting position:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updatePosition(req: Request, res: Response): Promise<void> {
        try {
            const positionId = parseInt(req.params.id);

            if (isNaN(positionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid position ID'
                });
                return;
            }

            const position = await this.positionService.updatePosition(positionId, req.body);
            res.status(200).json({
                success: true,
                message: 'Position updated successfully',
                data: position
            });
        } catch (error) {
            console.error('Error updating position:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deletePosition(req: Request, res: Response): Promise<void> {
        try {
            const positionId = parseInt(req.params.id);

            if (isNaN(positionId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid position ID'
                });
                return;
            }

            await this.positionService.deletePosition(positionId);
            res.status(200).json({
                success: true,
                message: 'Position deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting position:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPositionsBySport(req: Request, res: Response): Promise<void> {
        try {
            const sportId = parseInt(req.params.sportId);

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID'
                });
                return;
            }

            const positions = await this.positionService.getPositionsBySport(sportId);
            res.status(200).json({
                success: true,
                message: 'Positions retrieved successfully',
                data: positions
            });
        } catch (error) {
            console.error('Error getting positions by sport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 