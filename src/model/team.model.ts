import { PrismaClient, Prisma, Team } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateTeamData {
    code: string;
    name: string;
    sportId: number;
}

export class TeamModel {

    /**
     * Get all teams
     */
    async findAll(sportId?: number): Promise<Team[]> {
        const where: Prisma.TeamWhereInput = {};
        if (sportId) where.sportId = sportId;

        return prisma.team.findMany({
            where,
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true
                    },
                    where: {
                        isActive: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    /**
     * Get team by ID
     */
    async findById(teamId: number): Promise<Team | null> {
        return prisma.team.findUnique({
            where: { teamId },
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true,
                        performances: {
                            include: {
                                event: true
                            },
                            orderBy: {
                                date: 'desc'
                            },
                            take: 10 // Recent performances
                        }
                    },
                    where: {
                        isActive: true
                    }
                }
            }
        });
    }

    /**
     * Get team by code
     */
    async findByCode(code: string): Promise<Team | null> {
        return prisma.team.findUnique({
            where: { code },
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true
                    },
                    where: {
                        isActive: true
                    }
                }
            }
        });
    }

    /**
     * Get teams by sport
     */
    async findBySport(sportId: number): Promise<Team[]> {
        return prisma.team.findMany({
            where: { sportId },
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true
                    },
                    where: {
                        isActive: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    /**
     * Create a new team
     */
    async create(data: CreateTeamData): Promise<Team> {
        // Check if sport exists and is a team sport
        const sport = await prisma.sport.findUnique({
            where: { sportId: data.sportId }
        });

        if (!sport) {
            throw new Error('Sport not found');
        }

        if (!sport.isTeamSport) {
            throw new Error('Cannot create team for individual sport');
        }

        return prisma.team.create({
            data,
            include: {
                sport: true,
                athletes: true
            }
        });
    }

    /**
     * Update team
     */
    async update(teamId: number, data: Partial<CreateTeamData>): Promise<Team> {
        return prisma.team.update({
            where: { teamId },
            data,
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true
                    }
                }
            }
        });
    }

    /**
     * Delete team
     */
    async delete(teamId: number): Promise<Team> {
        // First, check if team has active athletes
        const athleteCount = await prisma.athlete.count({
            where: {
                team: { teamId },
                isActive: true
            }
        });

        if (athleteCount > 0) {
            throw new Error('Cannot delete team with active athletes. Please transfer or deactivate athletes first.');
        }

        return prisma.team.delete({
            where: { teamId },
            include: {
                sport: true,
                athletes: true
            }
        });
    }

    /**
     * Get team roster with positions
     */
    async getRoster(teamCode: string): Promise<Team | null> {
        return prisma.team.findUnique({
            where: { code: teamCode },
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true
                    },
                    where: {
                        isActive: true
                    },
                    orderBy: [
                        { position: { name: 'asc' } },
                        { lastName: 'asc' },
                        { firstName: 'asc' }
                    ]
                }
            }
        });
    }

    /**
     * Get team statistics
     */
    async getTeamStats(teamCode: string, seasonId?: number): Promise<{
        team: Team | null;
        totalAthletes: number;
        activeAthletes: number;
        totalPerformances: number;
        recentPerformances: any[];
        positionBreakdown: { [position: string]: number };
    }> {
        const team = await prisma.team.findUnique({
            where: { code: teamCode },
            include: {
                sport: true,
                athletes: {
                    include: {
                        position: true,
                        performances: {
                            include: {
                                event: true
                            },
                            where: seasonId ? {
                                event: { seasonId }
                            } : undefined,
                            orderBy: {
                                date: 'desc'
                            }
                        }
                    }
                }
            }
        });

        if (!team) {
            return {
                team: null,
                totalAthletes: 0,
                activeAthletes: 0,
                totalPerformances: 0,
                recentPerformances: [],
                positionBreakdown: {}
            };
        }

        const totalAthletes = team.athletes.length;
        const activeAthletes = team.athletes.filter(a => a.isActive).length;
        const allPerformances = team.athletes.flatMap(a => a.performances);
        const recentPerformances = allPerformances
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 10);

        // Position breakdown
        const positionBreakdown: { [position: string]: number } = {};
        team.athletes.forEach(athlete => {
            if (athlete.isActive && athlete.position) {
                const positionName = athlete.position.name;
                positionBreakdown[positionName] = (positionBreakdown[positionName] || 0) + 1;
            }
        });

        return {
            team,
            totalAthletes,
            activeAthletes,
            totalPerformances: allPerformances.length,
            recentPerformances,
            positionBreakdown
        };
    }

    /**
     * Add athlete to team
     */
    async addAthlete(teamCode: string, athleteId: number, positionId?: number): Promise<void> {
        const team = await prisma.team.findUnique({
            where: { code: teamCode },
            include: { sport: true }
        });

        if (!team) {
            throw new Error('Team not found');
        }

        // Validate position belongs to the same sport
        if (positionId) {
            const position = await prisma.position.findUnique({
                where: { positionId }
            });

            if (!position || position.sportId !== team.sportId) {
                throw new Error('Position does not belong to the team\'s sport');
            }
        }

        await prisma.athlete.update({
            where: { athleteId },
            data: {
                teamCode: team.code,
                positionId: positionId
            }
        });
    }

    /**
     * Remove athlete from team
     */
    async removeAthlete(athleteId: number): Promise<void> {
        await prisma.athlete.update({
            where: { athleteId },
            data: {
                teamCode: null,
                positionId: null
            }
        });
    }

    /**
     * Get team performance summary for an event
     */
    async getEventPerformance(teamCode: string, eventId: number): Promise<{
        team: Team | null;
        performances: any[];
        teamStats: {
            totalPoints?: number;
            totalGoals?: number;
            totalAssists?: number;
            averageMinutesPlayed?: number;
        };
    }> {
        const team = await prisma.team.findUnique({
            where: { code: teamCode }
        });

        if (!team) {
            return {
                team: null,
                performances: [],
                teamStats: {}
            };
        }

        const performances = await prisma.performance.findMany({
            where: {
                eventId,
                athlete: {
                    teamCode
                }
            },
            include: {
                athlete: {
                    include: {
                        position: true
                    }
                }
            }
        });

        // Calculate team statistics
        const teamStats: any = {};

        if (performances.length > 0) {
            const totalPoints = performances.reduce((sum, p) => sum + (p.points || 0), 0);
            const totalGoals = performances.reduce((sum, p) => sum + (p.goalsScored || 0), 0);
            const totalAssists = performances.reduce((sum, p) => sum + (p.assists || 0), 0);
            const totalMinutes = performances.reduce((sum, p) => sum + (p.minutesPlayed || 0), 0);

            teamStats.totalPoints = totalPoints;
            teamStats.totalGoals = totalGoals;
            teamStats.totalAssists = totalAssists;
            teamStats.averageMinutesPlayed = totalMinutes / performances.length;
        }

        return {
            team,
            performances,
            teamStats
        };
    }
}