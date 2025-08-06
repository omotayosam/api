import { PrismaClient, Prisma, Performance, SportType } from "@prisma/client";

const prisma = new PrismaClient();

// Type definitions for sport-specific performance data
interface FootballPerformanceData {
    minutesPlayed?: number;
    goalsScored?: number;
    goalsConceded?: number;
    yellowCards?: number;
    redCards?: number;
    assists?: number;
    saves?: number; // for goalkeepers
}

interface BasketballPerformanceData {
    minutesPlayed?: number;
    twoPoints?: number;
    threePoints?: number;
    freeThrows?: number;
    fieldGoals?: number;
    rebounds?: number;
    assists?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;
    points?: number; // total points
}

interface AthleticsPerformanceData {
    time?: number; // in seconds
    distance?: number; // in meters
    height?: number; // in meters for jumps
    position?: number; // final ranking
}

interface WrestlingPerformanceData {
    wins?: number;
    losses?: number;
    pins?: number;
    technicalFalls?: number;
    decisions?: number;
    points?: number;
}

interface BoxingPerformanceData {
    rounds?: number;
    knockouts?: number;
    knockdowns?: number;
    punchesLanded?: number;
    punchesThrown?: number;
    points?: number;
}

interface BasePerformanceData {
    athleteId: number;
    eventId: number;
    disciplineId?: number; // Required for individual sports
    date: Date;
    position?: number; // Overall position/rank
    notes?: string;
    isPersonalBest?: boolean;
    isSeasonBest?: boolean;
}

// All possible performance fields combined
interface AllPerformanceFields extends BasePerformanceData {
    // Common
    points?: number;

    // Team sports common
    minutesPlayed?: number;
    assists?: number;

    // Track and Field
    time?: number;
    distance?: number;
    height?: number;

    // Football
    goalsScored?: number;
    goalsConceded?: number;
    yellowCards?: number;
    redCards?: number;
    saves?: number;

    // Basketball
    twoPoints?: number;
    threePoints?: number;
    freeThrows?: number;
    fieldGoals?: number;
    rebounds?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;

    // Wrestling
    wins?: number;
    losses?: number;
    pins?: number;
    technicalFalls?: number;
    decisions?: number;

    // Boxing
    rounds?: number;
    knockouts?: number;
    knockdowns?: number;
    punchesLanded?: number;
    punchesThrown?: number;
}

type CreatePerformanceData = AllPerformanceFields;

export class AthleteStatsModel {

    /**
     * Find all performances with optional filtering
     */
    async findAll(filter?: Prisma.PerformanceWhereInput): Promise<Performance[]> {
        return prisma.performance.findMany({
            where: filter,
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
            orderBy: {
                date: 'desc'
            }
        });
    }

    /**
     * Find performance by ID
     */
    async findById(performanceId: number): Promise<Performance | null> {
        return prisma.performance.findUnique({
            where: { performanceId },
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
            }
        });
    }

    /**
     * Find all performances by athlete
     */
    async findByAthlete(
        athleteId: number,
        options?: {
            eventId?: number;
            disciplineId?: number;
            seasonId?: number;
            limit?: number;
        }
    ): Promise<Performance[]> {
        const where: Prisma.PerformanceWhereInput = { athleteId };

        if (options?.eventId) where.eventId = options.eventId;
        if (options?.disciplineId) where.disciplineId = options.disciplineId;
        if (options?.seasonId) where.event = { seasonId: options.seasonId };

        return prisma.performance.findMany({
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
                        gameday: true
                    }
                },
                discipline: true
            },
            orderBy: {
                date: 'desc'
            },
            take: options?.limit
        });
    }

    /**
     * Find all performances by event
     */
    async findByEvent(eventId: number): Promise<Performance[]> {
        return prisma.performance.findMany({
            where: { eventId },
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
                        gameday: true
                    }
                },
                discipline: true
            },
            orderBy: [
                { position: 'asc' },
                { points: 'desc' }
            ]
        });
    }

    /**
     * Find performances by sport type
     */
    async findBySport(
        sportType: SportType,
        options?: {
            seasonId?: number;
            athleteId?: number;
            limit?: number;
        }
    ): Promise<Performance[]> {
        // Define the filter for the related Event model
        const eventFilter: Prisma.EventWhereInput = {
            sport: {
                name: sportType
            }
        };

        // Conditionally add seasonId to the event filter if it exists
        if (options?.seasonId) {
            eventFilter.seasonId = options.seasonId;
        }

        // Construct the main 'where' clause using the eventFilter
        const where: Prisma.PerformanceWhereInput = {
            event: eventFilter
        };

        if (options?.athleteId) {
            where.athleteId = options.athleteId;
        }

        return prisma.performance.findMany({
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
                        season: true
                    }
                },
                discipline: true
            },
            orderBy: {
                date: 'desc'
            },
            take: options?.limit
        });
    }

    /**
     * Find performances by discipline (for individual sports)
     */
    async findByDiscipline(
        disciplineId: number,
        options?: {
            seasonId?: number;
            limit?: number;
        }
    ): Promise<Performance[]> {
        const where: Prisma.PerformanceWhereInput = { disciplineId };

        if (options?.seasonId) {
            where.event = { seasonId: options.seasonId };
        }

        return prisma.performance.findMany({
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
                        season: true
                    }
                },
                discipline: true
            },
            orderBy: [
                { time: 'asc' }, // For track events (faster is better)
                { distance: 'desc' }, // For field events (farther is better)
                { height: 'desc' }, // For jumping events
                { position: 'asc' } // For general ranking
            ],
            take: options?.limit
        });
    }

    /**
     * Get athlete's personal bests
     */
    async getPersonalBests(athleteId: number, disciplineId?: number): Promise<Performance[]> {
        const where: Prisma.PerformanceWhereInput = {
            athleteId,
            isPersonalBest: true
        };

        if (disciplineId) {
            where.disciplineId = disciplineId;
        }

        return prisma.performance.findMany({
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
                        season: true
                    }
                },
                discipline: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }

    /**
     * Get season bests for an athlete
     */
    async getSeasonBests(athleteId: number, seasonId: number): Promise<Performance[]> {
        return prisma.performance.findMany({
            where: {
                athleteId,
                isSeasonBest: true,
                event: {
                    seasonId
                }
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
                        season: true
                    }
                },
                discipline: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }

    /**
     * Create a new performance record
     */
    async create(data: CreatePerformanceData): Promise<Performance> {
        // Validate that disciplineId is provided for individual sports
        const event = await prisma.event.findUnique({
            where: { eventId: data.eventId },
            include: { sport: true }
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // For individual sports, disciplineId is required
        if (!event.sport.isTeamSport && !data.disciplineId) {
            throw new Error('Discipline ID is required for individual sports');
        }

        // For team sports, disciplineId should not be provided
        if (event.sport.isTeamSport && data.disciplineId) {
            throw new Error('Discipline ID should not be provided for team sports');
        }

        return prisma.performance.create({
            data: {
                athleteId: data.athleteId,
                eventId: data.eventId,
                disciplineId: data.disciplineId,
                date: data.date,
                position: data.position,
                points: data.points,

                // Track and Field
                time: data.time,
                distance: data.distance,
                height: data.height,

                // Team sports common
                minutesPlayed: data.minutesPlayed,

                // Football
                goalsScored: data.goalsScored,
                goalsConceded: data.goalsConceded,
                yellowCards: data.yellowCards,
                redCards: data.redCards,
                assists: data.assists,
                saves: data.saves,

                // Basketball
                twoPoints: data.twoPoints,
                threePoints: data.threePoints,
                freeThrows: data.freeThrows,
                fieldGoals: data.fieldGoals,
                rebounds: data.rebounds,
                steals: data.steals,
                blocks: data.blocks,
                turnovers: data.turnovers,

                // Wrestling
                wins: data.wins,
                losses: data.losses,
                pins: data.pins,
                technicalFalls: data.technicalFalls,
                decisions: data.decisions,

                // Boxing
                rounds: data.rounds,
                knockouts: data.knockouts,
                knockdowns: data.knockdowns,
                punchesLanded: data.punchesLanded,
                punchesThrown: data.punchesThrown,

                // Common fields
                notes: data.notes,
                isPersonalBest: data.isPersonalBest || false,
                isSeasonBest: data.isSeasonBest || false
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
                        season: true
                    }
                },
                discipline: true
            }
        });
    }

    /**
     * Update a performance record
     */
    async update(performanceId: number, data: Partial<CreatePerformanceData>): Promise<Performance> {
        return prisma.performance.update({
            where: { performanceId },
            data: {
                position: data.position,
                points: data.points,

                // Track and Field
                time: data.time,
                distance: data.distance,
                height: data.height,

                // Team sports common
                minutesPlayed: data.minutesPlayed,

                // Football
                goalsScored: data.goalsScored,
                goalsConceded: data.goalsConceded,
                yellowCards: data.yellowCards,
                redCards: data.redCards,
                assists: data.assists,
                saves: data.saves,

                // Basketball
                twoPoints: data.twoPoints,
                threePoints: data.threePoints,
                freeThrows: data.freeThrows,
                fieldGoals: data.fieldGoals,
                rebounds: data.rebounds,
                steals: data.steals,
                blocks: data.blocks,
                turnovers: data.turnovers,

                // Wrestling
                wins: data.wins,
                losses: data.losses,
                pins: data.pins,
                technicalFalls: data.technicalFalls,
                decisions: data.decisions,

                // Boxing
                rounds: data.rounds,
                knockouts: data.knockouts,
                knockdowns: data.knockdowns,
                punchesLanded: data.punchesLanded,
                punchesThrown: data.punchesThrown,

                // Common fields
                notes: data.notes,
                isPersonalBest: data.isPersonalBest,
                isSeasonBest: data.isSeasonBest
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
                        season: true
                    }
                },
                discipline: true
            }
        });
    }

    /**
     * Delete a performance record
     */
    async delete(performanceId: number): Promise<Performance> {
        return prisma.performance.delete({
            where: { performanceId },
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
                        season: true
                    }
                },
                discipline: true
            }
        });
    }

    /**
     * Get team statistics for a specific event (team sports)
     */
    async getTeamStats(teamCode: string, eventId: number): Promise<Performance[]> {
        return prisma.performance.findMany({
            where: {
                eventId,
                athlete: {
                    teamCode
                }
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
                        sport: true
                    }
                }
            }
        });
    }

    /**
     * Get leaderboard for a specific discipline
     */
    async getDisciplineLeaderboard(
        disciplineId: number,
        seasonId?: number,
        limit: number = 10
    ): Promise<Performance[]> {
        const where: Prisma.PerformanceWhereInput = { disciplineId };

        if (seasonId) {
            where.event = { seasonId };
        }

        const discipline = await prisma.discipline.findUnique({
            where: { disciplineId }
        });

        if (!discipline) {
            throw new Error('Discipline not found');
        }

        // Different ordering based on discipline type
        const orderBy: Prisma.PerformanceOrderByWithRelationInput[] = [];

        if (discipline.unit === 'seconds') {
            // For time-based events, lower is better
            orderBy.push({ time: 'asc' });
        } else if (discipline.unit === 'meters') {
            // For distance-based events, higher is better
            orderBy.push({ distance: 'desc' });
        } else {
            // Default to position ranking
            orderBy.push({ position: 'asc' });
        }

        return prisma.performance.findMany({
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
                        season: true
                    }
                },
                discipline: true
            },
            orderBy,
            take: limit
        });
    }
}