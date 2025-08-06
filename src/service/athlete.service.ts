import { AppError } from "../middleware/error";
import {
    Athlete,
    Gender,
    Position,
    Prisma,
    PrismaClient,
    SportType,
    Team,
    AthleteDiscipline,
    Discipline,
    Performance,
    Sport
} from '@prisma/client';
import { AthleteModel } from "../model/athlete.model";

// Type definitions for better type safety
type AthleteWithRelations = Athlete & {
    team: Team | null;
    position: Position | null;
    disciplines: (AthleteDiscipline & { discipline: Discipline })[];
};

type CreateTeamAthleteData = {
    code: string;
    firstName: string;
    lastName: string;
    teamCode: string;
    positionCode: string;
    sportType: SportType;
    dateOfBirth: Date;
    nationality: string;
    gender: Gender;
    height: number;
    weight: number;
    bio?: string;
};

type CreateIndividualAthleteData = {
    code: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    gender: Gender;
    height: number;
    weight: number;
    bio?: string;
    disciplines: { code: string; currentRank?: number }[];
    sportType: SportType;
};

type AthleteSearchParams = {
    search?: string;
    page?: string;
    limit?: string;
    positionCode?: string;
    teamCode?: string;
    sportType?: SportType;
    gender?: Gender;
    isActive?: boolean;
    disciplineCode?: string;
};

type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

// Simple logging utility (replace with your actual logger)
const logging = {
    log: (message: string, data?: any) => {
        console.log(`[AthleteService] ${message}`, data || '');
    },
    error: (message: string, error?: any) => {
        console.error(`[AthleteService] ${message}`, error || '');
    }
};

export class AthleteService {
    private athleteModel: AthleteModel;
    private prisma: PrismaClient;

    constructor() {
        this.athleteModel = new AthleteModel();
        this.prisma = new PrismaClient();
    }

    async getAllAthletes(params?: AthleteSearchParams): Promise<PaginatedResponse<AthleteWithRelations>> {
        try {
            const page = parseInt(params?.page || '1');
            const limit = Math.min(parseInt(params?.limit || '10'), 100); // Max 100 per page
            const skip = (page - 1) * limit;

            const where: Prisma.AthleteWhereInput = {};

            // Search by name
            if (params?.search) {
                where.OR = [
                    { firstName: { contains: params.search, mode: 'insensitive' } },
                    { lastName: { contains: params.search, mode: 'insensitive' } },
                    { code: { contains: params.search, mode: 'insensitive' } },
                ];
            }

            // Filter by position (find position by code first)
            if (params?.positionCode) {
                const position = await this.prisma.position.findFirst({
                    where: { code: params.positionCode }
                });
                if (position) {
                    where.positionId = position.positionId;
                }
            }

            // Filter by team
            if (params?.teamCode) {
                where.teamCode = params.teamCode;
            }

            // Filter by gender
            if (params?.gender) {
                where.gender = params.gender;
            }

            // Filter by active status
            if (params?.isActive !== undefined) {
                where.isActive = params.isActive;
            }

            // Filter by sport type
            if (params?.sportType) {
                where.OR = [
                    // Team sport athletes
                    {
                        team: {
                            sport: { name: params.sportType }
                        }
                    },
                    // Individual sport athletes
                    {
                        disciplines: {
                            some: {
                                discipline: {
                                    sport: { name: params.sportType }
                                }
                            }
                        }
                    }
                ];
            }

            // Filter by discipline
            if (params?.disciplineCode) {
                where.disciplines = {
                    some: {
                        discipline: { code: params.disciplineCode }
                    }
                };
            }

            const [athletes, total] = await Promise.all([
                this.athleteModel.findAll(where, {
                    skip,
                    take: limit,
                    orderBy: { athleteId: 'asc' }
                }),
                this.athleteModel.count(where)
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: athletes,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        } catch (error) {
            logging.error('Error in getAllAthletes:', error);
            throw new AppError('Failed to fetch athletes', 500);
        }
    }

    async getAthleteById(athleteId: number): Promise<AthleteWithRelations> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }
            return athlete;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthleteById:', error);
            throw new AppError('Failed to fetch athlete', 500);
        }
    }

    async getAthleteByCode(code: string): Promise<AthleteWithRelations> {
        try {
            const athlete = await this.athleteModel.findByCode(code);
            if (!athlete) {
                throw new AppError(`Athlete with code ${code} not found`, 404);
            }
            return athlete;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthleteByCode:', error);
            throw new AppError('Failed to fetch athlete', 500);
        }
    }

    async createTeamAthlete(data: CreateTeamAthleteData): Promise<AthleteWithRelations> {
        try {
            logging.log('Creating team athlete:', JSON.stringify(data, null, 2));

            // Validate required fields
            this.validateRequiredFields(data, ['firstName', 'lastName', 'teamCode', 'positionCode', 'code']);

            // Check if athlete code already exists
            const existingAthlete = await this.prisma.athlete.findUnique({
                where: { code: data.code }
            });

            if (existingAthlete) {
                throw new AppError(`Athlete with code ${data.code} already exists`, 409);
            }

            // Validate team exists and matches sport
            const team = await this.prisma.team.findUnique({
                where: { code: data.teamCode },
                include: { sport: true }
            });

            if (!team) {
                throw new AppError(`Team with code ${data.teamCode} not found`, 404);
            }

            if (team.sport.name !== data.sportType) {
                throw new AppError(`Team sport ${team.sport.name} doesn't match provided sport ${data.sportType}`, 400);
            }

            // Validate position exists and matches sport
            const position = await this.prisma.position.findFirst({
                where: {
                    code: data.positionCode,
                    sport: { name: data.sportType }
                }
            });

            if (!position) {
                throw new AppError(`Position ${data.positionCode} not found for sport ${data.sportType}`, 404);
            }

            // Validate age (assuming minimum age of 16 for university sports)
            const age = this.calculateAge(data.dateOfBirth);
            if (age < 16) {
                throw new AppError('Athlete must be at least 16 years old', 400);
            }

            const athlete = await this.athleteModel.createTeamAthlete(data);
            logging.log('Team athlete created successfully:', athlete.athleteId);

            return await this.athleteModel.findById(athlete.athleteId) as AthleteWithRelations;
        } catch (error) {
            logging.error('Error in createTeamAthlete:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to create team athlete', 500);
        }
    }

    async createIndividualAthlete(data: CreateIndividualAthleteData): Promise<AthleteWithRelations> {
        try {
            logging.log('Creating individual athlete:', JSON.stringify(data, null, 2));

            // Validate required fields
            this.validateRequiredFields(data, ['firstName', 'lastName', 'code', 'disciplines']);

            if (!data.disciplines || data.disciplines.length === 0) {
                throw new AppError('At least one discipline is required for individual athletes', 400);
            }

            // Check if athlete code already exists
            const existingAthlete = await this.prisma.athlete.findUnique({
                where: { code: data.code }
            });

            if (existingAthlete) {
                throw new AppError(`Athlete with code ${data.code} already exists`, 409);
            }

            // Validate disciplines exist and match sport
            const sport = await this.prisma.sport.findUnique({
                where: { name: data.sportType },
                include: { disciplines: true }
            });

            if (!sport) {
                throw new AppError(`Sport ${data.sportType} not found`, 404);
            }

            if (sport.isTeamSport) {
                throw new AppError(`Sport ${data.sportType} is a team sport, use createTeamAthlete instead`, 400);
            }

            // Validate all disciplines belong to the sport
            const validDisciplineCodes = sport.disciplines.map(d => d.code);
            const invalidDisciplines = data.disciplines.filter(d => !validDisciplineCodes.includes(d.code));

            if (invalidDisciplines.length > 0) {
                throw new AppError(`Invalid disciplines for ${data.sportType}: ${invalidDisciplines.map(d => d.code).join(', ')}`, 400);
            }

            // Validate age
            const age = this.calculateAge(data.dateOfBirth);
            if (age < 16) {
                throw new AppError('Athlete must be at least 16 years old', 400);
            }

            const athlete = await this.athleteModel.createIndividualAthlete(data);
            logging.log('Individual athlete created successfully:', athlete.athleteId);

            return athlete;
        } catch (error) {
            logging.error('Error in createIndividualAthlete:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to create individual athlete', 500);
        }
    }

    async updateAthlete(athleteId: number, data: Partial<Omit<Athlete, 'athleteId' | 'createdAt' | 'updatedAt'>>): Promise<AthleteWithRelations> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            // If updating code, check it doesn't conflict
            if (data.code && data.code !== athlete.code) {
                const existingAthlete = await this.prisma.athlete.findUnique({
                    where: { code: data.code }
                });

                if (existingAthlete) {
                    throw new AppError(`Athlete with code ${data.code} already exists`, 409);
                }
            }

            // If updating team, validate it exists
            if (data.teamCode) {
                const team = await this.prisma.team.findUnique({
                    where: { code: data.teamCode }
                });

                if (!team) {
                    throw new AppError(`Team with code ${data.teamCode} not found`, 404);
                }
            }

            const updatedAthlete = await this.athleteModel.update(athleteId, data);
            logging.log('Athlete updated successfully:', athleteId);

            return updatedAthlete;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in updateAthlete:', error);
            throw new AppError('Failed to update athlete', 500);
        }
    }

    async deleteAthlete(athleteId: number): Promise<void> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            // Check if athlete has performances
            const performanceCount = await this.prisma.performance.count({
                where: { athleteId: athleteId }
            });

            if (performanceCount > 0) {
                // Soft delete by marking as inactive instead of hard delete
                await this.athleteModel.update(athleteId, { isActive: false });
                logging.log('Athlete soft deleted (marked inactive):', athleteId);
            } else {
                // Hard delete if no performances
                await this.athleteModel.delete(athleteId);
                logging.log('Athlete hard deleted:', athleteId);
            }
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in deleteAthlete:', error);
            throw new AppError('Failed to delete athlete', 500);
        }
    }

    async getAthletesByTeam(teamCode: string): Promise<AthleteWithRelations[]> {
        try {
            const team = await this.prisma.team.findUnique({
                where: { code: teamCode }
            });

            if (!team) {
                throw new AppError(`Team with code ${teamCode} not found`, 404);
            }

            return await this.athleteModel.findByTeam(teamCode);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthletesByTeam:', error);
            throw new AppError('Failed to fetch athletes by team', 500);
        }
    }

    async getAthletesByPosition(positionCode: string): Promise<AthleteWithRelations[]> {
        try {
            const position = await this.prisma.position.findFirst({
                where: { code: positionCode }
            });

            if (!position) {
                throw new AppError(`Position with code ${positionCode} not found`, 404);
            }

            return await this.athleteModel.findByPosition(position.positionId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthletesByPosition:', error);
            throw new AppError('Failed to fetch athletes by position', 500);
        }
    }

    async getAthletesBySport(sportType: SportType): Promise<AthleteWithRelations[]> {
        try {
            return await this.athleteModel.findBySport(sportType);
        } catch (error) {
            logging.error('Error in getAthletesBySport:', error);
            throw new AppError('Failed to fetch athletes by sport', 500);
        }
    }

    async getAthletesByDiscipline(disciplineCode: string): Promise<AthleteWithRelations[]> {
        try {
            const discipline = await this.prisma.discipline.findFirst({
                where: { code: disciplineCode }
            });

            if (!discipline) {
                throw new AppError(`Discipline with code ${disciplineCode} not found`, 404);
            }

            return await this.athleteModel.findByDiscipline(disciplineCode);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthletesByDiscipline:', error);
            throw new AppError('Failed to fetch athletes by discipline', 500);
        }
    }

    async updateDisciplineRank(athleteId: number, disciplineCode: string, newRank: number): Promise<AthleteDiscipline> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            if (newRank <= 0) {
                throw new AppError('Rank must be a positive number', 400);
            }

            const updatedRank = await this.athleteModel.updateDisciplineRank(athleteId, disciplineCode, newRank);
            logging.log(`Updated rank for athlete ${athleteId} in discipline ${disciplineCode} to ${newRank}`);

            return updatedRank;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in updateDisciplineRank:', error);
            throw new AppError('Failed to update discipline rank', 500);
        }
    }

    async getAthleteStats(athleteId: number, seasonId?: number): Promise<Performance[]> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            return await this.athleteModel.getAthleteStats(athleteId, seasonId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthleteStats:', error);
            throw new AppError('Failed to fetch athlete stats', 500);
        }
    }

    async getAthleteSeasonSummary(athleteId: number, seasonId: number): Promise<any> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            const performances = await this.athleteModel.getAthleteStats(athleteId, seasonId);

            if (performances.length === 0) {
                return {
                    athleteId,
                    athleteName: `${athlete.firstName} ${athlete.lastName}`,
                    seasonId,
                    totalEvents: 0,
                    averages: {},
                    totals: {},
                    bestPerformances: {}
                };
            }

            // Calculate statistics based on sport type
            const summary = this.calculateSeasonSummary(athlete, performances);

            return summary;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in getAthleteSeasonSummary:', error);
            throw new AppError('Failed to calculate season summary', 500);
        }
    }

    async addDisciplineToAthlete(athleteId: number, disciplineCode: string, currentRank?: number): Promise<AthleteDiscipline> {
        try {
            const athlete = await this.athleteModel.findById(athleteId);
            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            const discipline = await this.prisma.discipline.findFirst({
                where: { code: disciplineCode },
                include: { sport: true }
            });

            if (!discipline) {
                throw new AppError(`Discipline with code ${disciplineCode} not found`, 404);
            }

            // Check if athlete already has this discipline
            const existingDiscipline = await this.prisma.athleteDiscipline.findUnique({
                where: {
                    athleteId_disciplineId: {
                        athleteId: athleteId,
                        disciplineId: discipline.disciplineId
                    }
                }
            });

            if (existingDiscipline) {
                throw new AppError(`Athlete already has discipline ${disciplineCode}`, 409);
            }

            return await this.prisma.athleteDiscipline.create({
                data: {
                    athleteId: athleteId,
                    disciplineId: discipline.disciplineId,
                    currentRank: currentRank
                }
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in addDisciplineToAthlete:', error);
            throw new AppError('Failed to add discipline to athlete', 500);
        }
    }

    async removeDisciplineFromAthlete(athleteId: number, disciplineCode: string): Promise<void> {
        try {
            const discipline = await this.prisma.discipline.findFirst({
                where: { code: disciplineCode }
            });

            if (!discipline) {
                throw new AppError(`Discipline with code ${disciplineCode} not found`, 404);
            }

            const deletedCount = await this.prisma.athleteDiscipline.deleteMany({
                where: {
                    athleteId: athleteId,
                    disciplineId: discipline.disciplineId
                }
            });

            if (deletedCount.count === 0) {
                throw new AppError(`Athlete does not have discipline ${disciplineCode}`, 404);
            }

            logging.log(`Removed discipline ${disciplineCode} from athlete ${athleteId}`);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logging.error('Error in removeDisciplineFromAthlete:', error);
            throw new AppError('Failed to remove discipline from athlete', 500);
        }
    }

    // Utility methods
    private validateRequiredFields(data: any, fields: string[]): void {
        const missingFields = fields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
        }
    }

    private calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    private calculateSeasonSummary(athlete: AthleteWithRelations, performances: Performance[]): any {
        const totalEvents = performances.length;
        const summary: any = {
            athleteId: athlete.athleteId,
            athleteName: `${athlete.firstName} ${athlete.lastName}`,
            totalEvents,
            averages: {},
            totals: {},
            bestPerformances: {}
        };

        if (totalEvents === 0) return summary;

        // Calculate sport-specific statistics
        const totals: any = {};
        const counts: any = {};

        performances.forEach(perf => {
            // Track all numeric fields
            Object.keys(perf).forEach(key => {
                const value = (perf as any)[key];
                if (typeof value === 'number' && value !== null) {
                    totals[key] = (totals[key] || 0) + value;
                    counts[key] = (counts[key] || 0) + 1;
                }
            });
        });

        // Calculate averages
        Object.keys(totals).forEach(key => {
            if (counts[key] > 0) {
                summary.averages[key] = parseFloat((totals[key] / counts[key]).toFixed(2));
                summary.totals[key] = totals[key];
            }
        });

        // Find best performances
        const bestTime = performances
            .filter(p => p.time !== null)
            .sort((a, b) => (a.time || Infinity) - (b.time || Infinity))[0];

        const bestDistance = performances
            .filter(p => p.distance !== null)
            .sort((a, b) => (b.distance || 0) - (a.distance || 0))[0];

        const bestPosition = performances
            .filter(p => p.position !== null)
            .sort((a, b) => (a.position || Infinity) - (b.position || Infinity))[0];

        if (bestTime) summary.bestPerformances.bestTime = bestTime.time;
        if (bestDistance) summary.bestPerformances.bestDistance = bestDistance.distance;
        if (bestPosition) summary.bestPerformances.bestPosition = bestPosition.position;

        return summary;
    }

    async cleanup(): Promise<void> {
        await this.prisma.$disconnect();
    }
}