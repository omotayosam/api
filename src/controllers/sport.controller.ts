// src/controllers/sport.controller.ts
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import { SportService } from '../service/sport.service';

export class SportController {
    private sportService: SportService;

    constructor() {
        const prisma = new PrismaClient();
        this.sportService = new SportService();
    }

    async createSport(req: Request, res: Response): Promise<void> {
        try {
            const sport = await this.sportService.createSport(req.body);
            res.status(201).json({
                success: true,
                message: 'Sport created successfully',
                data: sport
            });
        } catch (error) {
            console.error('Error creating sport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllSports(req: Request, res: Response): Promise<void> {
        try {
            const sports = await this.sportService.getAllSports();
            res.status(200).json({
                success: true,
                message: 'Sports retrieved successfully',
                data: sports
            });
        } catch (error) {
            console.error('Error getting sports:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getSportById(req: Request, res: Response): Promise<void> {
        try {
            const sportId = parseInt(req.params.id);

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID'
                });
                return;
            }

            const sport = await this.sportService.getSportById(sportId);

            if (!sport) {
                res.status(404).json({
                    success: false,
                    message: 'Sport not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Sport retrieved successfully',
                data: sport
            });
        } catch (error) {
            console.error('Error getting sport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // async createDiscipline(req: Request, res: Response): Promise<void> {
    //     try {
    //         const sportId = parseInt(req.params.sportId);

    //         if (isNaN(sportId)) {
    //             res.status(400).json({
    //                 success: false,
    //                 message: 'Invalid sport ID'
    //             });
    //             return;
    //         }

    //         const discipline = await this.sportService.createDiscipline(sportId, req.body);
    //         res.status(201).json({
    //             success: true,
    //             message: 'Discipline created successfully',
    //             data: discipline
    //         });
    //     } catch (error) {
    //         console.error('Error creating discipline:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Internal server error',
    //             error: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // }

    // async getDisciplinesBySport(req: Request, res: Response): Promise<void> {
    //     try {
    //         const sportId = parseInt(req.params.sportId);

    //         if (isNaN(sportId)) {
    //             res.status(400).json({
    //                 success: false,
    //                 message: 'Invalid sport ID'
    //             });
    //             return;
    //         }

    //         const disciplines = await this.sportService.getDisciplinesBySport(sportId);
    //         res.status(200).json({
    //             success: true,
    //             message: 'Disciplines retrieved successfully',
    //             data: disciplines
    //         });
    //     } catch (error) {
    //         console.error('Error getting disciplines:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Internal server error',
    //             error: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // }
}
