// src/services/performance.service.ts
import { PrismaClient, Performance, SportType, EventStatus } from '@prisma/client';
import { AppError } from '../middleware/error';
import { AthleteStatsModel } from '../model/performance.model';

// Define DTOs to match your system
interface CreatePerformanceDto {
    athleteId: number;
    eventId: number;
    disciplineId?: number; // Required for individual sports
    seasonId?: number; // Add seasonId for filtering
    date?: Date;
    position?: number;
    points?: number;
    notes?: string;

    // Track and Field
    time?: number; // in seconds
    distance?: number; // in meters
    height?: number; // in meters

    // Team sports common
    minutesPlayed?: number;
    assists?: number;

    // Football specific
    goalsScored?: number;
    goalsConceded?: number;
    yellowCards?: number;
    redCards?: number;
    saves?: number;

    // Basketball specific
    twoPoints?: number;
    threePoints?: number;
    freeThrows?: number;
    fieldGoals?: number;
    rebounds?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;

    // Wrestling specific
    wins?: number;
    losses?: number;
    pins?: number;
    technicalFalls?: number;
    decisions?: number;

    // Boxing specific
    rounds?: number;
    knockouts?: number;
    knockdowns?: number;
    punchesLanded?: number;
    punchesThrown?: number;
}

interface PerformanceQueryDto {
    disciplineId?: number;
    eventId?: number;
    seasonId?: number;
    sportType?: SportType;
    athleteId?: number;
    teamCode?: string;
    limit?: number;
    offset?: number;
    page?: number;
    sortBy?: 'date' | 'performance' | 'position';
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

interface UpdatePerformanceDto extends Partial<CreatePerformanceDto> {
    // All fields from CreatePerformanceDto are optional for updates
}

// Updated type for performance with all relations - matches what AthleteStatsModel returns
type PerformanceWithRelations = Performance & {
    athlete: {
        athleteId: number;
        code: string;
        firstName: string;
        lastName: string;
        teamCode: string | null;
        dateOfBirth: Date;
        nationality: string;
        gender: string;
        height: number;
        weight: number;
        bio: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        positionId: number | null;
        team: {
            teamId: number;
            code: string;
            name: string;
            sportId: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        position: {
            positionId: number;
            name: string;
            code: string;
            sportId: number;
            description: string | null;
        } | null;
    };
    event: {
        eventId: number;
        name: string;
        code: string;
        sportId: number;
        year: number;
        seasonId: number;
        gamedayId: number;
        venueId: number | null;
        gender: string | null;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        description: string | null;
        isActive: boolean;
        status: EventStatus;
        createdAt: Date;
        updatedAt: Date;
        sport: {
            sportId: number;
            name: SportType;
            isTeamSport: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        season: {
            seasonId: number;
            name: string;
            seasonType: string;
            startYear: number;
            endYear: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        gameday?: {
            gamedayId: number;
            name: string;
            gameNumber: number | null;
            finished: boolean;
            isPrevious: boolean;
            isCurrent: boolean;
            isNext: boolean;
            seasonId: number;
            scheduledDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        venue?: {
            venueId: number;
            name: string;
            address: string | null;
            city: string | null;
            capacity: number | null;
            isHome: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    };
    discipline?: {
        disciplineId: number;
        name: string;
        code: string;
        sportId: number;
        description: string | null;
        unit: string | null;
    } | null;
};

export class PerformanceService {
    private performanceModel: AthleteStatsModel;
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
        this.performanceModel = new AthleteStatsModel();
    }

    async createPerformance(data: CreatePerformanceDto): Promise<PerformanceWithRelations> {
        try {
            // Validate required fields
            if (!data.athleteId || !data.eventId) {
                throw new AppError('Athlete ID and Event ID are required', 400);
            }

            // Validate that athlete exists and is active
            const athlete = await this.prisma.athlete.findUnique({
                where: { athleteId: data.athleteId },
                include: { team: true }
            });

            if (!athlete) {
                throw new AppError(`Athlete with ID ${data.athleteId} not found`, 404);
            }

            if (!athlete.isActive) {
                throw new AppError(`Athlete with ID ${data.athleteId} is not active`, 400);
            }

            // Validate that event exists and is in appropriate status
            const event = await this.prisma.event.findUnique({
                where: { eventId: data.eventId },
                include: {
                    sport: true,
                    season: true // Include season info
                }
            });

            if (!event) {
                throw new AppError(`Event with ID ${data.eventId} not found`, 404);
            }

            // Only allow performance recording for LIVE or FINISHED events
            if (event.status === EventStatus.SCHEDULED) {
                throw new AppError('Cannot record performance for scheduled events', 400);
            }

            if (event.status === EventStatus.CANCELED) {
                throw new AppError('Cannot record performance for cancelled events', 400);
            }

            // Validate discipline requirements
            if (!event.sport.isTeamSport && !data.disciplineId) {
                throw new AppError('Discipline ID is required for individual sports', 400);
            }

            if (event.sport.isTeamSport && data.disciplineId) {
                throw new AppError('Discipline ID should not be provided for team sports', 400);
            }

            // Validate discipline exists if provided
            let discipline = null;
            if (data.disciplineId) {
                discipline = await this.prisma.discipline.findUnique({
                    where: { disciplineId: data.disciplineId },
                    include: { sport: true }
                });

                if (!discipline) {
                    throw new AppError(`Discipline with ID ${data.disciplineId} not found`, 404);
                }

                // Ensure discipline belongs to the same sport as the event
                if (discipline.sportId !== event.sportId) {
                    throw new AppError('Discipline does not belong to the event sport', 400);
                }
            }

            // Validate sport-specific data
            await this.validateSportSpecificData(event.sport.name, data);

            // Check for existing performance (prevent duplicates)
            const existingPerformance = await this.prisma.performance.findFirst({
                where: {
                    athleteId: data.athleteId,
                    eventId: data.eventId,
                    ...(data.disciplineId && { disciplineId: data.disciplineId })
                }
            });

            if (existingPerformance) {
                throw new AppError('Performance already exists for this athlete in this event/discipline', 409);
            }

            // Set seasonId from event if not provided
            const performanceData = {
                ...data,
                date: data.date || new Date(),
                seasonId: data.seasonId || event.seasonId
            };

            // Check if this is a personal best or season best for individual sports
            let bestFlags = { isPersonalBest: false, isSeasonBest: false };
            if (data.disciplineId && discipline) {
                bestFlags = await this.calculateBestFlags(performanceData, discipline);
            }

            const finalPerformanceData = {
                ...performanceData,
                isPersonalBest: bestFlags.isPersonalBest,
                isSeasonBest: bestFlags.isSeasonBest
            };

            // Create the performance
            const performance = await this.performanceModel.create(finalPerformanceData);

            // Update existing personal bests if this is a new PB
            if (bestFlags.isPersonalBest && data.disciplineId) {
                await this.updatePersonalBestFlags(
                    data.athleteId,
                    data.disciplineId,
                    performance.performanceId
                );
            }

            return performance as PerformanceWithRelations;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error creating performance:', error);
            throw new AppError('Failed to create performance', 500);
        }
    }

    async updatePerformance(
        performanceId: number,
        data: UpdatePerformanceDto
    ): Promise<PerformanceWithRelations> {
        try {
            // Check if performance exists
            const existingPerformance = await this.performanceModel.findById(performanceId);
            if (!existingPerformance) {
                throw new AppError(`Performance with ID ${performanceId} not found`, 404);
            }

            // Cast to our expected type to access nested properties
            const typedPerformance = existingPerformance as PerformanceWithRelations;

            // Validate that event is not finished if trying to update critical data
            if (typedPerformance.event.status === EventStatus.FINISHED) {
                // Only allow notes updates for finished events
                const allowedFields = ['notes'];
                const hasRestrictedUpdates = Object.keys(data).some(key => !allowedFields.includes(key));

                if (hasRestrictedUpdates) {
                    throw new AppError('Only notes can be updated for performances in finished events', 400);
                }
            }

            // Validate sport-specific data if provided
            if (this.hasPerformanceMetricsChanged(data)) {
                await this.validateSportSpecificData(typedPerformance.event.sport.name, data);
            }

            // Recalculate best flags if performance metrics changed and it's an individual sport
            const updatedData: any = { ...data };
            if (this.hasPerformanceMetricsChanged(data) && typedPerformance.disciplineId) {
                const discipline = await this.prisma.discipline.findUnique({
                    where: { disciplineId: typedPerformance.disciplineId }
                });

                if (discipline) {
                    // Create merged data with proper typing
                    const mergedData = {
                        athleteId: typedPerformance.athleteId,
                        disciplineId: typedPerformance.disciplineId,
                        seasonId: typedPerformance.event.seasonId,
                        time: data.time ?? typedPerformance.time,
                        distance: data.distance ?? typedPerformance.distance,
                        height: data.height ?? typedPerformance.height,
                        points: data.points ?? typedPerformance.points,
                        position: data.position ?? typedPerformance.position,
                        // Add other relevant performance metrics
                        goalsScored: data.goalsScored ?? typedPerformance.goalsScored,
                        assists: data.assists ?? typedPerformance.assists,
                        twoPoints: data.twoPoints ?? typedPerformance.twoPoints,
                        threePoints: data.threePoints ?? typedPerformance.threePoints,
                        wins: data.wins ?? typedPerformance.wins,
                        losses: data.losses ?? typedPerformance.losses,
                        knockouts: data.knockouts ?? typedPerformance.knockouts
                    };

                    const bestFlags = await this.calculateBestFlags(mergedData, discipline);
                    updatedData.isPersonalBest = bestFlags.isPersonalBest;
                    updatedData.isSeasonBest = bestFlags.isSeasonBest;
                }
            }

            const updatedPerformance = await this.performanceModel.update(performanceId, updatedData);

            // Update personal best flags if necessary
            if (updatedData.isPersonalBest && typedPerformance.disciplineId) {
                await this.updatePersonalBestFlags(
                    typedPerformance.athleteId,
                    typedPerformance.disciplineId,
                    performanceId
                );
            }

            return updatedPerformance as PerformanceWithRelations;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error updating performance:', error);
            throw new AppError('Failed to update performance', 500);
        }
    }

    async deletePerformance(performanceId: number): Promise<{ message: string; deletedPerformance: PerformanceWithRelations }> {
        try {
            const performance = await this.performanceModel.findById(performanceId);

            if (!performance) {
                throw new AppError(`Performance with ID ${performanceId} not found`, 404);
            }

            const typedPerformance = performance as PerformanceWithRelations;
            // Only allow deletion if event is not finished
            if (typedPerformance.event.status === EventStatus.FINISHED) {
                throw new AppError('Cannot delete performance from finished events', 400);
            }

            const deletedPerformance = await this.performanceModel.delete(performanceId);

            // Recalculate personal bests for this athlete/discipline
            if (performance.disciplineId) {
                await this.recalculatePersonalBests(performance.athleteId, performance.disciplineId);
            }

            return {
                message: 'Performance successfully deleted',
                deletedPerformance: deletedPerformance as PerformanceWithRelations
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error deleting performance:', error);
            throw new AppError('Failed to delete performance', 500);
        }
    }

    async getPerformanceById(performanceId: number): Promise<PerformanceWithRelations> {
        try {
            const performance = await this.performanceModel.findById(performanceId);
            if (!performance) {
                throw new AppError(`Performance with ID ${performanceId} not found`, 404);
            }
            return performance as PerformanceWithRelations;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting performance:', error);
            throw new AppError('Failed to get performance', 500);
        }
    }

    async getPerformancesByAthlete(
        athleteId: number,
        query: PerformanceQueryDto = {}
    ): Promise<PerformanceWithRelations[]> {
        try {
            // Validate athlete exists
            const athlete = await this.prisma.athlete.findUnique({
                where: { athleteId }
            });

            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            const {
                disciplineId,
                eventId,
                seasonId,
                limit = 20
            } = query;

            const performances = await this.performanceModel.findByAthlete(athleteId, {
                disciplineId,
                eventId,
                seasonId,
                limit
            });

            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting athlete performances:', error);
            throw new AppError('Failed to get athlete performances', 500);
        }
    }

    async getEventResults(eventId: number): Promise<PerformanceWithRelations[]> {
        try {
            // Validate event exists
            const event = await this.prisma.event.findUnique({
                where: { eventId },
                include: { sport: true }
            });

            if (!event) {
                throw new AppError(`Event with ID ${eventId} not found`, 404);
            }

            const performances = await this.performanceModel.findByEvent(eventId);
            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting event results:', error);
            throw new AppError('Failed to get event results', 500);
        }
    }

    async getTopPerformances(
        disciplineId: number,
        limit: number = 10,
        seasonId?: number
    ): Promise<PerformanceWithRelations[]> {
        try {
            // Validate discipline exists
            const discipline = await this.prisma.discipline.findUnique({
                where: { disciplineId }
            });

            if (!discipline) {
                throw new AppError(`Discipline with ID ${disciplineId} not found`, 404);
            }

            const performances = await this.performanceModel.getDisciplineLeaderboard(disciplineId, seasonId, limit);
            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting top performances:', error);
            throw new AppError('Failed to get top performances', 500);
        }
    }

    async getPersonalBests(
        athleteId: number,
        disciplineId?: number
    ): Promise<PerformanceWithRelations[]> {
        try {
            // Validate athlete exists
            const athlete = await this.prisma.athlete.findUnique({
                where: { athleteId }
            });

            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            const performances = await this.performanceModel.getPersonalBests(athleteId, disciplineId);
            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting personal bests:', error);
            throw new AppError('Failed to get personal bests', 500);
        }
    }

    async getSeasonBests(athleteId: number, seasonId: number): Promise<PerformanceWithRelations[]> {
        try {
            // Validate athlete exists
            const athlete = await this.prisma.athlete.findUnique({
                where: { athleteId }
            });

            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            // Validate season exists
            const season = await this.prisma.season.findUnique({
                where: { seasonId }
            });

            if (!season) {
                throw new AppError(`Season with ID ${seasonId} not found`, 404);
            }

            const performances = await this.performanceModel.getSeasonBests(athleteId, seasonId);
            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting season bests:', error);
            throw new AppError('Failed to get season bests', 500);
        }
    }

    async getTeamStats(teamCode: string, eventId: number): Promise<PerformanceWithRelations[]> {
        try {
            // Validate team exists
            const team = await this.prisma.team.findUnique({
                where: { code: teamCode }
            });

            if (!team) {
                throw new AppError(`Team with code ${teamCode} not found`, 404);
            }

            // Validate event exists and is a team sport
            const event = await this.prisma.event.findUnique({
                where: { eventId },
                include: { sport: true }
            });

            if (!event) {
                throw new AppError(`Event with ID ${eventId} not found`, 404);
            }

            if (!event.sport.isTeamSport) {
                throw new AppError('Team stats are only available for team sports', 400);
            }

            const performances = await this.performanceModel.getTeamStats(teamCode, eventId);
            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting team stats:', error);
            throw new AppError('Failed to get team stats', 500);
        }
    }

    async getPerformancesBySport(
        sportType: SportType,
        query: PerformanceQueryDto = {}
    ): Promise<PerformanceWithRelations[]> {
        try {
            const { seasonId, athleteId, limit = 50 } = query;

            const performances = await this.performanceModel.findBySport(sportType, {
                seasonId,
                athleteId,
                limit
            });

            return performances as PerformanceWithRelations[];
        } catch (error) {
            console.error('Error getting performances by sport:', error);
            throw new AppError('Failed to get performances by sport', 500);
        }
    }

    async getAllPerformances(query: PerformanceQueryDto = {}): Promise<{
        data: PerformanceWithRelations[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            console.log('getAllPerformances called with query:', query);

            const {
                page = 1,
                limit = 10,
                offset = 0,
                sortBy = 'date',
                sortOrder = 'desc',
                athleteId,
                eventId,
                disciplineId,
                sportType,
                search
            } = query;

            const skip = offset || (page - 1) * limit;

            // Build where clause
            const where: any = {};

            if (athleteId) {
                where.athleteId = athleteId;
            }

            if (eventId) {
                where.eventId = eventId;
            }

            if (disciplineId) {
                where.disciplineId = disciplineId;
            }

            console.log('Where clause:', where);

            // Get total count
            const total = await this.prisma.performance.count({ where });
            console.log('Total count:', total);

            // Get performances with relations
            const performances = await this.prisma.performance.findMany({
                where,
                include: {
                    athlete: {
                        include: {
                            team: true,
                            position: true
                        }
                    },
                    event: {
                        include: {
                            sport: true,
                            season: true,
                            gameday: true,
                            venue: true
                        }
                    },
                    discipline: true
                },
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder
                }
            });

            console.log('Found performances:', performances.length);

            const totalPages = Math.ceil(total / limit);

            return {
                data: performances as PerformanceWithRelations[],
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages
            };
        } catch (error) {
            console.error('Error in getAllPerformances:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to get performances', 500);
        }
    }

    // New method to get athlete performance summary
    async getAthletePerformanceSummary(
        athleteId: number,
        seasonId?: number
    ): Promise<{
        totalPerformances: number;
        personalBests: number;
        seasonBests: number;
        averagePosition?: number;
        bestPosition?: number;
        recentPerformances: PerformanceWithRelations[];
    }> {
        try {
            const athlete = await this.prisma.athlete.findUnique({
                where: { athleteId }
            });

            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            const performances = await this.performanceModel.findByAthlete(athleteId, {
                seasonId,
                limit: 1000 // Get all performances for summary
            });

            const personalBests = performances.filter(p => p.isPersonalBest).length;
            const seasonBests = performances.filter(p => p.isSeasonBest).length;

            const performancesWithPosition = performances.filter(p => p.position);
            const averagePosition = performancesWithPosition.length > 0
                ? performancesWithPosition.reduce((sum, p) => sum + (p.position || 0), 0) / performancesWithPosition.length
                : undefined;

            const bestPosition = performancesWithPosition.length > 0
                ? Math.min(...performancesWithPosition.map(p => p.position || Infinity))
                : undefined;

            const recentPerformances = await this.performanceModel.findByAthlete(athleteId, {
                seasonId,
                limit: 5
            });

            return {
                totalPerformances: performances.length,
                personalBests,
                seasonBests,
                averagePosition,
                bestPosition: bestPosition === Infinity ? undefined : bestPosition,
                recentPerformances: recentPerformances as PerformanceWithRelations[]
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting athlete performance summary:', error);
            throw new AppError('Failed to get athlete performance summary', 500);
        }
    }

    // Private helper methods

    private async validateSportSpecificData(sportType: SportType, data: any): Promise<void> {
        switch (sportType) {
            case SportType.ATHLETICS:
                this.validateAthleticsData(data);
                break;
            case SportType.FOOTBALL:
                this.validateFootballData(data);
                break;
            case SportType.BASKETBALL:
                this.validateBasketballData(data);
                break;
            case SportType.WRESTLING:
                this.validateWrestlingData(data);
                break;
            case SportType.BOXING:
                this.validateBoxingData(data);
                break;
            default:
                throw new AppError(`Unsupported sport type: ${sportType}`, 400);
        }
    }

    private validateAthleticsData(data: any): void {
        // Validate that at least one performance metric is provided
        if (!data.time && !data.distance && !data.height && !data.position) {
            throw new AppError('At least one performance metric (time, distance, height, or position) is required for athletics', 400);
        }

        // Validate positive values
        if (data.time !== undefined && data.time <= 0) {
            throw new AppError('Time must be positive', 400);
        }
        if (data.distance !== undefined && data.distance <= 0) {
            throw new AppError('Distance must be positive', 400);
        }
        if (data.height !== undefined && data.height <= 0) {
            throw new AppError('Height must be positive', 400);
        }
        if (data.position !== undefined && data.position <= 0) {
            throw new AppError('Position must be positive', 400);
        }

        // Validate reasonable ranges
        if (data.time && data.time > 86400) { // 24 hours in seconds
            throw new AppError('Time seems unreasonably high', 400);
        }
        if (data.distance && data.distance > 100000) { // 100km in meters
            throw new AppError('Distance seems unreasonably high', 400);
        }
        if (data.height && data.height > 10) { // 10 meters
            throw new AppError('Height seems unreasonably high', 400);
        }
    }

    private validateFootballData(data: any): void {
        // Validate non-negative values
        const fields = ['minutesPlayed', 'goalsScored', 'goalsConceded', 'yellowCards', 'redCards', 'assists', 'saves'];
        fields.forEach(field => {
            if (data[field] !== undefined && data[field] < 0) {
                throw new AppError(`${field} cannot be negative`, 400);
            }
        });

        // Validate minutes played doesn't exceed match duration (90 + extra time, max ~120)
        if (data.minutesPlayed !== undefined && data.minutesPlayed > 130) {
            throw new AppError('Minutes played cannot exceed 130', 400);
        }

        // Validate reasonable card limits
        if (data.yellowCards !== undefined && data.yellowCards > 2) {
            throw new AppError('Yellow cards cannot exceed 2 per player', 400);
        }
        if (data.redCards !== undefined && data.redCards > 1) {
            throw new AppError('Red cards cannot exceed 1 per player', 400);
        }

        // Validate goals reasonable range
        if (data.goalsScored !== undefined && data.goalsScored > 10) {
            throw new AppError('Goals scored seems unreasonably high', 400);
        }
    }

    private validateBasketballData(data: any): void {
        // Validate non-negative values
        const fields = ['minutesPlayed', 'twoPoints', 'threePoints', 'freeThrows', 'fieldGoals', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'points'];
        fields.forEach(field => {
            if (data[field] !== undefined && data[field] < 0) {
                throw new AppError(`${field} cannot be negative`, 400);
            }
        });

        // Validate minutes played doesn't exceed game duration (48 minutes + overtime)
        if (data.minutesPlayed !== undefined && data.minutesPlayed > 65) {
            throw new AppError('Minutes played cannot exceed 65', 400);
        }

        // Validate shot consistency
        if (data.fieldGoals !== undefined && data.twoPoints !== undefined && data.threePoints !== undefined) {
            if (data.fieldGoals > (data.twoPoints + data.threePoints)) {
                throw new AppError('Field goals cannot exceed sum of two-points and three-points', 400);
            }
        }

        // Validate reasonable ranges
        if (data.points !== undefined && data.points > 100) {
            throw new AppError('Points scored seems unreasonably high', 400);
        }
    }

    private validateWrestlingData(data: any): void {
        const fields = ['wins', 'losses', 'pins', 'technicalFalls', 'decisions', 'points'];
        fields.forEach(field => {
            if (data[field] !== undefined && data[field] < 0) {
                throw new AppError(`${field} cannot be negative`, 400);
            }
        });

        // Validate that wins/losses make sense
        if (data.wins !== undefined && data.losses !== undefined) {
            if ((data.wins > 0 && data.losses > 0) || (data.wins === 0 && data.losses === 0)) {
                throw new AppError('A wrestling match should have exactly one winner and one loser', 400);
            }
        }

        // Validate that victory types don't exceed total wins
        if (data.wins !== undefined && data.wins > 0) {
            const victoryTypes = (data.pins || 0) + (data.technicalFalls || 0) + (data.decisions || 0);
            if (victoryTypes > data.wins) {
                throw new AppError('Sum of victory types cannot exceed total wins', 400);
            }
        }
    }

    private validateBoxingData(data: any): void {
        const fields = ['rounds', 'knockouts', 'knockdowns', 'punchesLanded', 'punchesThrown', 'points'];
        fields.forEach(field => {
            if (data[field] !== undefined && data[field] < 0) {
                throw new AppError(`${field} cannot be negative`, 400);
            }
        });

        // Validate punches landed doesn't exceed punches thrown
        if (data.punchesLanded !== undefined && data.punchesThrown !== undefined &&
            data.punchesLanded > data.punchesThrown) {
            throw new AppError('Punches landed cannot exceed punches thrown', 400);
        }

        // Validate reasonable rounds limit
        if (data.rounds !== undefined && data.rounds > 12) {
            throw new AppError('Rounds cannot exceed 12', 400);
        }

        // Validate knockout/knockdown consistency
        if (data.knockouts !== undefined && data.knockdowns !== undefined &&
            data.knockouts > data.knockdowns) {
            throw new AppError('Knockouts cannot exceed knockdowns', 400);
        }
    }

    private async calculateBestFlags(
        data: any,
        discipline: any
    ): Promise<{ isPersonalBest: boolean; isSeasonBest: boolean }> {
        if (!data.disciplineId) {
            return { isPersonalBest: false, isSeasonBest: false };
        }

        // Get existing performances for comparison
        const existingPerformances = await this.performanceModel.findByAthlete(data.athleteId, {
            disciplineId: data.disciplineId
        });

        const seasonPerformances = data.seasonId ? await this.performanceModel.findByAthlete(data.athleteId, {
            disciplineId: data.disciplineId,
            seasonId: data.seasonId
        }) : [];

        let isPersonalBest = existingPerformances.length === 0;
        let isSeasonBest = seasonPerformances.length === 0;

        if (existingPerformances.length > 0) {
            isPersonalBest = this.isNewBest(data, existingPerformances, discipline);
        }

        if (seasonPerformances.length > 0) {
            isSeasonBest = this.isNewBest(data, seasonPerformances, discipline);
        }

        return { isPersonalBest, isSeasonBest };
    }

    private isNewBest(newPerformance: any, existingPerformances: any[], discipline: any): boolean {
        // Handle different measurement types
        if (discipline.unit === 'seconds' && newPerformance.time) {
            // For time-based events, lower is better
            const bestTime = Math.min(...existingPerformances.map(p => p.time || Infinity));
            return newPerformance.time < bestTime;
        } else if ((discipline.unit === 'meters' || discipline.unit === 'cm') && newPerformance.distance) {
            // For distance-based events, higher is better
            const bestDistance = Math.max(...existingPerformances.map(p => p.distance || 0));
            return newPerformance.distance > bestDistance;
        } else if (discipline.unit === 'meters' && newPerformance.height) {
            // For height-based events, higher is better
            const bestHeight = Math.max(...existingPerformances.map(p => p.height || 0));
            return newPerformance.height > bestHeight;
        } else if (newPerformance.points) {
            // For points-based events, higher is better
            const bestPoints = Math.max(...existingPerformances.map(p => p.points || 0));
            return newPerformance.points > bestPoints;
        } else if (newPerformance.position) {
            // For position-based events, lower position number is better
            const bestPosition = Math.min(...existingPerformances.map(p => p.position || Infinity));
            return newPerformance.position < bestPosition;
        }

        return false;
    }

    private hasPerformanceMetricsChanged(data: any): boolean {
        const performanceFields = ['time', 'distance', 'height', 'points', 'position',
            'goalsScored', 'assists', 'twoPoints', 'threePoints',
            'wins', 'losses', 'knockouts'];
        return performanceFields.some(field => data[field] !== undefined);
    }

    private async updatePersonalBestFlags(athleteId: number, disciplineId: number, excludeId?: number): Promise<void> {
        // Reset all personal best flags for this athlete/discipline
        await this.prisma.performance.updateMany({
            where: {
                athleteId,
                disciplineId,
                ...(excludeId && { performanceId: { not: excludeId } })
            },
            data: { isPersonalBest: false }
        });
    }

    private async recalculatePersonalBests(athleteId: number, disciplineId: number): Promise<void> {
        const performances = await this.performanceModel.findByAthlete(athleteId, {
            disciplineId,
            limit: 1000
        });

        if (performances.length === 0) return;

        const discipline = await this.prisma.discipline.findUnique({
            where: { disciplineId }
        });

        if (!discipline) return;

        let bestPerformance = performances[0];

        for (const performance of performances) {
            if (this.isNewBest(performance, [bestPerformance], discipline)) {
                bestPerformance = performance;
            }
        }

        // Reset all personal best flags for this discipline
        await this.prisma.performance.updateMany({
            where: {
                athleteId,
                disciplineId
            },
            data: { isPersonalBest: false }
        });

        // Set the best performance as personal best
        await this.prisma.performance.update({
            where: { performanceId: bestPerformance.performanceId },
            data: { isPersonalBest: true }
        });
    }

    // Additional helper methods for advanced functionality

    /**
     * Bulk create performances for team events
     */
    async bulkCreatePerformances(performances: CreatePerformanceDto[]): Promise<PerformanceWithRelations[]> {
        try {
            const results: PerformanceWithRelations[] = [];

            // Validate all performances first
            for (const performance of performances) {
                if (!performance.athleteId || !performance.eventId) {
                    throw new AppError('All performances must have athleteId and eventId', 400);
                }
            }

            // Create performances in transaction
            for (const performanceData of performances) {
                const result = await this.createPerformance(performanceData);
                results.push(result);
            }

            return results;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error bulk creating performances:', error);
            throw new AppError('Failed to bulk create performances', 500);
        }
    }

    /**
     * Get performances comparison between athletes
     */
    async compareAthletes(
        athleteIds: number[],
        disciplineId?: number,
        seasonId?: number
    ): Promise<{
        athletes: { [key: number]: PerformanceWithRelations[] };
        comparison: any;
    }> {
        try {
            if (athleteIds.length < 2) {
                throw new AppError('At least 2 athletes are required for comparison', 400);
            }

            const athletes: { [key: number]: PerformanceWithRelations[] } = {};

            for (const athleteId of athleteIds) {
                const performances = await this.performanceModel.findByAthlete(athleteId, {
                    disciplineId,
                    seasonId,
                    limit: 100
                });
                athletes[athleteId] = performances as PerformanceWithRelations[];
            }

            // Basic comparison logic - can be expanded based on requirements
            const comparison = this.generateAthleteComparison(athletes, disciplineId);

            return { athletes, comparison };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error comparing athletes:', error);
            throw new AppError('Failed to compare athletes', 500);
        }
    }

    /**
     * Get performance trends for an athlete
     */
    async getPerformanceTrends(
        athleteId: number,
        disciplineId: number,
        timeframe: 'season' | 'year' | 'all' = 'season'
    ): Promise<{
        performances: PerformanceWithRelations[];
        trend: 'improving' | 'declining' | 'stable';
        averageImprovement?: number;
    }> {
        try {
            const athlete = await this.prisma.athlete.findUnique({
                where: { athleteId }
            });

            if (!athlete) {
                throw new AppError(`Athlete with ID ${athleteId} not found`, 404);
            }

            let dateFilter = {};
            const now = new Date();

            switch (timeframe) {
                case 'season':
                    // Current season - this would need to be adapted based on your season logic
                    const startOfSeason = new Date(now.getFullYear(), 0, 1); // Simplified
                    dateFilter = { date: { gte: startOfSeason } };
                    break;
                case 'year':
                    const startOfYear = new Date(now.getFullYear(), 0, 1);
                    dateFilter = { date: { gte: startOfYear } };
                    break;
                case 'all':
                    dateFilter = {};
                    break;
            }

            const performances = await this.prisma.performance.findMany({
                where: {
                    athleteId,
                    disciplineId,
                    ...dateFilter
                },
                include: {
                    athlete: {
                        include: {
                            team: true,
                            position: true
                        }
                    },
                    event: {
                        include: {
                            sport: true,
                            season: true,
                            gameday: true,
                            venue: true
                        }
                    },
                    discipline: true
                },
                orderBy: { date: 'asc' }
            }) as PerformanceWithRelations[];

            const trend = this.calculatePerformanceTrend(performances);

            return { performances, trend: trend.direction, averageImprovement: trend.averageImprovement };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting performance trends:', error);
            throw new AppError('Failed to get performance trends', 500);
        }
    }

    /**
     * Get records (best performances) for a discipline
     */
    async getDisciplineRecords(
        disciplineId: number,
        recordType: 'all-time' | 'season' | 'monthly' = 'all-time',
        seasonId?: number
    ): Promise<PerformanceWithRelations[]> {
        try {
            const discipline = await this.prisma.discipline.findUnique({
                where: { disciplineId }
            });

            if (!discipline) {
                throw new AppError(`Discipline with ID ${disciplineId} not found`, 404);
            }

            const performances = await this.performanceModel.getDisciplineLeaderboard(disciplineId, seasonId, 10);
            return performances as PerformanceWithRelations[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error getting discipline records:', error);
            throw new AppError('Failed to get discipline records', 500);
        }
    }

    // Private helper methods for new functionality

    private generateAthleteComparison(
        athletes: { [key: number]: PerformanceWithRelations[] },
        disciplineId?: number
    ): any {
        const comparison: any = {};

        for (const [athleteId, performances] of Object.entries(athletes)) {
            const numPerformances = performances.length;
            const personalBests = performances.filter(p => p.isPersonalBest).length;
            const averagePosition = performances
                .filter(p => p.position)
                .reduce((sum, p) => sum + (p.position || 0), 0) / numPerformances || null;

            comparison[athleteId] = {
                totalPerformances: numPerformances,
                personalBests,
                averagePosition,
                bestPosition: performances.length > 0
                    ? Math.min(...performances.filter(p => p.position).map(p => p.position || Infinity))
                    : null
            };
        }

        return comparison;
    }

    private calculatePerformanceTrend(performances: PerformanceWithRelations[]): {
        direction: 'improving' | 'declining' | 'stable';
        averageImprovement?: number;
    } {
        if (performances.length < 2) {
            return { direction: 'stable' };
        }

        // Simple trend calculation based on the primary performance metric
        const values: number[] = [];

        for (const performance of performances) {
            if (performance.time) values.push(performance.time);
            else if (performance.distance) values.push(performance.distance);
            else if (performance.height) values.push(performance.height);
            else if (performance.points) values.push(performance.points);
            else if (performance.position) values.push(-performance.position); // Negative because lower position is better
        }

        if (values.length < 2) {
            return { direction: 'stable' };
        }

        // Calculate trend using linear regression slope
        const n = values.length;
        const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        const threshold = 0.01; // Minimum slope to consider as trend

        if (Math.abs(slope) < threshold) {
            return { direction: 'stable' };
        }

        return {
            direction: slope > 0 ? 'improving' : 'declining',
            averageImprovement: Math.abs(slope)
        };
    }
}