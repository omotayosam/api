import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/error';
import { AthleteService } from '../service/athlete.service';

export class AthleteController {
    private athleteService: AthleteService;

    constructor() {
        this.athleteService = new AthleteService();
    }

    getAllAthletes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { search, page, limit, positionCode, teamCode, sportType, gender, isActive, disciplineCode } = req.query;
            const result = await this.athleteService.getAllAthletes({
                search: search as string,
                page: page as string,
                limit: limit as string,
                positionCode: positionCode as string,
                teamCode: teamCode as string,
                sportType: sportType as any,
                gender: gender as any,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                disciplineCode: disciplineCode as string
            });

            const host = req.protocol + '://' + req.get('host');

            const athletesWithImageUrl = result.data.map(athlete => ({
                ...athlete,
                avatarUrl: `${host}/avatars/${athlete.code}.png`,
            }));
            res.json({
                ...result,
                data: athletesWithImageUrl
            });
        } catch (error) {
            console.error('Error in getAllAthletes controller:', error);
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }

    getAthleteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.id);
            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            const athlete = await this.athleteService.getAthleteById(athleteId);

            const host = req.protocol + '://' + req.get('host');
            const athleteWithImageUrl = {
                ...athlete,
                avatarUrl: `${host}/avatars/${athlete.code}.png`,
            };

            res.json(athleteWithImageUrl);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    getAthleteByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const code = req.params.code;
            const athlete = await this.athleteService.getAthleteByCode(code);

            const host = req.protocol + '://' + req.get('host');
            const athleteWithImageUrl = {
                ...athlete,
                avatarUrl: `${host}/avatars/p${athlete.code}.png`,
            };

            res.json(athleteWithImageUrl);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    createIndividualAthlete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athlete = await this.athleteService.createIndividualAthlete(req.body);
            res.status(201).json(athlete);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // FIXED: Now correctly calls createTeamAthlete service method
    createTeamAthlete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athlete = await this.athleteService.createTeamAthlete(req.body);
            res.status(201).json(athlete);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    updateAthlete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.id);
            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            const athlete = await this.athleteService.updateAthlete(athleteId, req.body);
            res.json(athlete);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // FIXED: Now correctly calls the service method
    getAthletesByTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teamCode = req.params.teamCode; // Keep as string, not parseInt
            const athletes = await this.athleteService.getAthletesByTeam(teamCode);

            const host = req.protocol + '://' + req.get('host');

            // Transform athletes to include avatar URLs
            const athletesWithImageUrl = athletes.map(athlete => ({
                ...athlete,
                avatarUrl: `${host}/avatars/p${athlete.code}.png`,
            }));

            res.json({
                success: true,
                data: athletesWithImageUrl
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    getAthletesByPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const positionCode = req.params.positionCode;
            const athletes = await this.athleteService.getAthletesByPosition(positionCode);

            const host = req.protocol + '://' + req.get('host');
            const athletesWithImageUrl = athletes.map(athlete => ({
                ...athlete,
                avatarUrl: `${host}/avatars/p${athlete.code}.png`,
            }));

            res.json({
                success: true,
                data: athletesWithImageUrl
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    getAthletesBySport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sportType = req.params.sportType as any;
            const athletes = await this.athleteService.getAthletesBySport(sportType);

            const host = req.protocol + '://' + req.get('host');
            const athletesWithImageUrl = athletes.map(athlete => ({
                ...athlete,
                avatarUrl: `${host}/avatars/p${athlete.code}.png`,
            }));

            res.json({
                success: true,
                data: athletesWithImageUrl
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    getAthletesByDiscipline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const disciplineCode = req.params.disciplineCode;
            const athletes = await this.athleteService.getAthletesByDiscipline(disciplineCode);

            const host = req.protocol + '://' + req.get('host');
            const athletesWithImageUrl = athletes.map(athlete => ({
                ...athlete,
                avatarUrl: `${host}/avatars/p${athlete.code}.png`,
            }));

            res.json({
                success: true,
                data: athletesWithImageUrl
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    updateDisciplineRank = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const { disciplineCode, newRank } = req.body;

            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            if (!disciplineCode || !newRank) {
                throw new AppError('Discipline code and new rank are required', 400);
            }

            const updatedRank = await this.athleteService.updateDisciplineRank(athleteId, disciplineCode, newRank);
            res.json({
                success: true,
                data: updatedRank
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    getAthleteStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;

            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            const stats = await this.athleteService.getAthleteStats(athleteId, seasonId);
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    getAthleteSeasonSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const seasonId = parseInt(req.params.seasonId);

            if (isNaN(athleteId) || isNaN(seasonId)) {
                throw new AppError('Invalid athlete ID or season ID', 400);
            }

            const summary = await this.athleteService.getAthleteSeasonSummary(athleteId, seasonId);
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    addDisciplineToAthlete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const { disciplineCode, currentRank } = req.body;

            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            if (!disciplineCode) {
                throw new AppError('Discipline code is required', 400);
            }

            const athleteDiscipline = await this.athleteService.addDisciplineToAthlete(
                athleteId,
                disciplineCode,
                currentRank
            );

            res.status(201).json({
                success: true,
                data: athleteDiscipline
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    // NEW: Missing implementation
    removeDisciplineFromAthlete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.athleteId);
            const disciplineCode = req.params.disciplineCode;

            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            await this.athleteService.removeDisciplineFromAthlete(athleteId, disciplineCode);
            res.json({
                success: true,
                message: 'Discipline removed from athlete successfully'
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    deleteAthlete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const athleteId = parseInt(req.params.id);
            if (isNaN(athleteId)) {
                throw new AppError('Invalid athlete ID', 400);
            }

            await this.athleteService.deleteAthlete(athleteId);
            res.status(200).json({
                success: true,
                message: 'Athlete deleted successfully'
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete Athlete' });
            }
        }
    }
}