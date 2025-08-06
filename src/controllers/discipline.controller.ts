// src/controllers/discipline.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DisciplineService } from '../service/discipline.service';


export class DisciplineController {
    private disciplineService: DisciplineService;

    constructor() {
        const prisma = new PrismaClient();
        this.disciplineService = new DisciplineService();
    }

    async createDiscipline(req: Request, res: Response): Promise<void> {
        try {
            const discipline = await this.disciplineService.createDiscipline(req.body);
            res.status(201).json({
                success: true,
                message: 'Discipline created successfully',
                data: discipline
            });
        } catch (error) {
            console.error('Error creating discipline:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllDisciplines(req: Request, res: Response): Promise<void> {
        try {
            const disciplines = await this.disciplineService.getAllDisciplines();
            res.status(200).json({
                success: true,
                message: 'Disciplines retrieved successfully',
                data: disciplines
            });
        } catch (error) {
            console.error('Error getting disciplines:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getDisciplineById(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.id);

            if (isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID'
                });
                return;
            }

            const discipline = await this.disciplineService.getDisciplineById(disciplineId);

            if (!discipline) {
                res.status(404).json({
                    success: false,
                    message: 'Discipline not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Discipline retrieved successfully',
                data: discipline
            });
        } catch (error) {
            console.error('Error getting discipline:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateDiscipline(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.id);

            if (isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID'
                });
                return;
            }

            const discipline = await this.disciplineService.updateDiscipline(disciplineId, req.body);
            res.status(200).json({
                success: true,
                message: 'Discipline updated successfully',
                data: discipline
            });
        } catch (error) {
            console.error('Error updating discipline:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteDiscipline(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.id);

            if (isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID'
                });
                return;
            }

            await this.disciplineService.deleteDiscipline(disciplineId);
            res.status(200).json({
                success: true,
                message: 'Discipline deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting discipline:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getDisciplinesBySport(req: Request, res: Response): Promise<void> {
        try {
            const sportId = parseInt(req.params.sportId);

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID'
                });
                return;
            }

            const disciplines = await this.disciplineService.getDisciplinesBySport(sportId);
            res.status(200).json({
                success: true,
                message: 'Disciplines retrieved successfully',
                data: disciplines
            });
        } catch (error) {
            console.error('Error getting disciplines by sport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getDisciplineAthletes(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.disciplineId);

            if (isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID'
                });
                return;
            }

            const athletes = await this.disciplineService.getDisciplineAthletes(disciplineId);
            res.status(200).json({
                success: true,
                message: 'Discipline athletes retrieved successfully',
                data: athletes
            });
        } catch (error) {
            console.error('Error getting discipline athletes:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async addAthleteToDiscipline(req: Request, res: Response): Promise<void> {
        try {
            const { disciplineId, athleteId, currentRank } = req.body;

            if (!disciplineId || !athleteId) {
                res.status(400).json({
                    success: false,
                    message: 'Discipline ID and Athlete ID are required'
                });
                return;
            }

            const athleteDiscipline = await this.disciplineService.addAthleteToDiscipline(disciplineId, athleteId, currentRank);
            res.status(201).json({
                success: true,
                message: 'Athlete added to discipline successfully',
                data: athleteDiscipline
            });
        } catch (error) {
            console.error('Error adding athlete to discipline:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async removeAthleteFromDiscipline(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.disciplineId);
            const athleteId = parseInt(req.params.athleteId);

            if (isNaN(disciplineId) || isNaN(athleteId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID or athlete ID'
                });
                return;
            }

            await this.disciplineService.removeAthleteFromDiscipline(disciplineId, athleteId);
            res.status(200).json({
                success: true,
                message: 'Athlete removed from discipline successfully'
            });
        } catch (error) {
            console.error('Error removing athlete from discipline:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateAthleteRank(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.disciplineId);
            const athleteId = parseInt(req.params.athleteId);
            const { currentRank } = req.body;

            if (isNaN(disciplineId) || isNaN(athleteId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID or athlete ID'
                });
                return;
            }

            const athleteDiscipline = await this.disciplineService.updateAthleteRank(disciplineId, athleteId, currentRank);
            res.status(200).json({
                success: true,
                message: 'Athlete rank updated successfully',
                data: athleteDiscipline
            });
        } catch (error) {
            console.error('Error updating athlete rank:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 