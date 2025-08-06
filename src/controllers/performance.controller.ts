// src/controllers/performance.controller.ts
import { Request, Response } from 'express';
import { PerformanceService } from '../service/performance.service';

export class PerformanceController {
    private performanceService: PerformanceService;

    constructor() {
        this.performanceService = new PerformanceService();
    }

    async createPerformance(req: Request, res: Response): Promise<void> {
        try {
            const performance = await this.performanceService.createPerformance(req.body);
            res.status(201).json({
                success: true,
                message: 'Performance created successfully',
                data: performance
            });
        } catch (error) {
            console.error('Error creating performance:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updatePerformance(req: Request, res: Response): Promise<void> {
        try {
            const performanceId = parseInt(req.params.id);

            if (isNaN(performanceId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid performance ID'
                });
                return;
            }

            const performance = await this.performanceService.updatePerformance(performanceId, req.body);
            res.status(200).json({
                success: true,
                message: 'Performance updated successfully',
                data: performance
            });
        } catch (error) {
            console.error('Error updating performance:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deletePerformance(req: Request, res: Response): Promise<void> {
        try {
            const performanceId = parseInt(req.params.id);

            if (isNaN(performanceId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid performance ID'
                });
                return;
            }

            const result = await this.performanceService.deletePerformance(performanceId);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.deletedPerformance
            });
        } catch (error) {
            console.error('Error deleting performance:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPerformanceById(req: Request, res: Response): Promise<void> {
        try {
            const performanceId = parseInt(req.params.id);

            if (isNaN(performanceId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid performance ID'
                });
                return;
            }

            const performance = await this.performanceService.getPerformanceById(performanceId);
            res.status(200).json({
                success: true,
                message: 'Performance retrieved successfully',
                data: performance
            });
        } catch (error) {
            console.error('Error getting performance:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllPerformances(req: Request, res: Response): Promise<void> {
        try {
            const query = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
                sortBy: (req.query.sortBy as 'date' | 'performance' | 'position') || 'date',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
                athleteId: req.query.athleteId ? parseInt(req.query.athleteId as string) : undefined,
                eventId: req.query.eventId ? parseInt(req.query.eventId as string) : undefined,
                disciplineId: req.query.disciplineId ? parseInt(req.query.disciplineId as string) : undefined,
                sportType: req.query.sportType as any,
                search: req.query.search as string
            };

            const result = await this.performanceService.getAllPerformances(query);
            res.status(200).json({
                success: true,
                message: 'Performances retrieved successfully',
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            });
        } catch (error) {
            console.error('Error getting all performances:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPerformancesByAthlete(req: Request, res: Response): Promise<void> {
        try {
            const athleteId = parseInt(req.params.athleteId);

            if (isNaN(athleteId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid athlete ID'
                });
                return;
            }

            const performances = await this.performanceService.getPerformancesByAthlete(athleteId, req.query);
            res.status(200).json({
                success: true,
                message: 'Athlete performances retrieved successfully',
                data: performances
            });
        } catch (error) {
            console.error('Error getting athlete performances:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getEventResults(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.eventId);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            const results = await this.performanceService.getEventResults(eventId);
            res.status(200).json({
                success: true,
                message: 'Event results retrieved successfully',
                data: results
            });
        } catch (error) {
            console.error('Error getting event results:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getTopPerformances(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.disciplineId);
            const limit = parseInt(req.query.limit as string) || 10;
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;

            if (isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID'
                });
                return;
            }

            const performances = await this.performanceService.getTopPerformances(disciplineId, limit, seasonId);
            res.status(200).json({
                success: true,
                message: 'Top performances retrieved successfully',
                data: performances
            });
        } catch (error) {
            console.error('Error getting top performances:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPersonalBests(req: Request, res: Response): Promise<void> {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const disciplineId = req.query.disciplineId ? parseInt(req.query.disciplineId as string) : undefined;

            if (isNaN(athleteId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid athlete ID'
                });
                return;
            }

            const personalBests = await this.performanceService.getPersonalBests(athleteId, disciplineId);
            res.status(200).json({
                success: true,
                message: 'Personal bests retrieved successfully',
                data: personalBests
            });
        } catch (error) {
            console.error('Error getting personal bests:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getSeasonBests(req: Request, res: Response): Promise<void> {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const seasonId = parseInt(req.params.seasonId);

            if (isNaN(athleteId) || isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid athlete ID or season ID'
                });
                return;
            }

            const seasonBests = await this.performanceService.getSeasonBests(athleteId, seasonId);
            res.status(200).json({
                success: true,
                message: 'Season bests retrieved successfully',
                data: seasonBests
            });
        } catch (error) {
            console.error('Error getting season bests:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getTeamStats(req: Request, res: Response): Promise<void> {
        try {
            const teamCode = req.params.teamCode;
            const eventId = parseInt(req.params.eventId);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            const teamStats = await this.performanceService.getTeamStats(teamCode, eventId);
            res.status(200).json({
                success: true,
                message: 'Team stats retrieved successfully',
                data: teamStats
            });
        } catch (error) {
            console.error('Error getting team stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPerformancesBySport(req: Request, res: Response): Promise<void> {
        try {
            const sportType = req.params.sportType as any;
            const performances = await this.performanceService.getPerformancesBySport(sportType, req.query);
            res.status(200).json({
                success: true,
                message: 'Sport performances retrieved successfully',
                data: performances
            });
        } catch (error) {
            console.error('Error getting sport performances:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAthletePerformanceSummary(req: Request, res: Response): Promise<void> {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;

            if (isNaN(athleteId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid athlete ID'
                });
                return;
            }

            const summary = await this.performanceService.getAthletePerformanceSummary(athleteId, seasonId);
            res.status(200).json({
                success: true,
                message: 'Athlete performance summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            console.error('Error getting athlete performance summary:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async bulkCreatePerformances(req: Request, res: Response): Promise<void> {
        try {
            const performances = await this.performanceService.bulkCreatePerformances(req.body);
            res.status(201).json({
                success: true,
                message: 'Performances created successfully',
                data: performances
            });
        } catch (error) {
            console.error('Error creating performances:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async compareAthletes(req: Request, res: Response): Promise<void> {
        try {
            const athleteIds = req.body.athleteIds;
            const disciplineId = req.body.disciplineId;
            const seasonId = req.body.seasonId;

            if (!Array.isArray(athleteIds) || athleteIds.length < 2) {
                res.status(400).json({
                    success: false,
                    message: 'At least 2 athlete IDs are required for comparison'
                });
                return;
            }

            const comparison = await this.performanceService.compareAthletes(athleteIds, disciplineId, seasonId);
            res.status(200).json({
                success: true,
                message: 'Athlete comparison retrieved successfully',
                data: comparison
            });
        } catch (error) {
            console.error('Error comparing athletes:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPerformanceTrends(req: Request, res: Response): Promise<void> {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const disciplineId = parseInt(req.params.disciplineId);
            const timeframe = req.query.timeframe as 'season' | 'year' | 'all' || 'season';

            if (isNaN(athleteId) || isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid athlete ID or discipline ID'
                });
                return;
            }

            const trends = await this.performanceService.getPerformanceTrends(athleteId, disciplineId, timeframe);
            res.status(200).json({
                success: true,
                message: 'Performance trends retrieved successfully',
                data: trends
            });
        } catch (error) {
            console.error('Error getting performance trends:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getDisciplineRecords(req: Request, res: Response): Promise<void> {
        try {
            const disciplineId = parseInt(req.params.disciplineId);
            const recordType = req.query.recordType as 'all-time' | 'season' | 'monthly' || 'all-time';
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;

            if (isNaN(disciplineId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid discipline ID'
                });
                return;
            }

            const records = await this.performanceService.getDisciplineRecords(disciplineId, recordType, seasonId);
            res.status(200).json({
                success: true,
                message: 'Discipline records retrieved successfully',
                data: records
            });
        } catch (error) {
            console.error('Error getting discipline records:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 