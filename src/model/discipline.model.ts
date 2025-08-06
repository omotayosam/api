import { PrismaClient, Prisma, Discipline } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateDisciplineData {
    name: string;
    code: string;
    sportId: number;
    description?: string;
    unit?: string; // e.g., "seconds", "meters", "points"
}

export class DisciplineModel {

    /**
     * Get all disciplines
     */
    async findAll(sportId?: number): Promise<Discipline[]> {
        const where: Prisma.DisciplineWhereInput = {};
        if (sportId) where.sportId = sportId;

        return prisma.discipline.findMany({
            where,
            include: {
                sport: true,
                athletes: {
                    include: {
                        athlete: {
                            include: {
                                team: true
                            }
                        }
                    }
                },
                performances: {
                    include: {
                        athlete: true,
                        event: true
                    },
                    orderBy: {
                        date: 'desc'
                    },
                    take: 5 // Recent performances
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    /**
     * Get discipline by ID
     */
    async findById(disciplineId: number): Promise<Discipline | null> {
        return prisma.discipline.findUnique({
            where: { disciplineId },
            include: {
                sport: true,
                athletes: {
                    include: {
                        athlete: {
                            include: {
                                team: true
                            }
                        }
                    }
                },
                performances: {
                    include: {
                        athlete: {
                            include: {
                                team: true
                            }
                        },
                        event: {
                            include: {
                                season: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });
    }

    /**
     * Get discipline by code and sport
     */
    async findByCode(code: string, sportId: number): Promise<Discipline | null> {
        return prisma.discipline.findUnique({
            where: {
                code_sportId: {
                    code,
                    sportId
                }
            },
            include: {
                sport: true,
                athletes: {
                    include: {
                        athlete: true
                    }
                }
            }
        });
    }

    /**
     * Get disciplines by sport
     */
    async findBySport(sportId: number): Promise<Discipline[]> {
        return prisma.discipline.findMany({
            where: { sportId },
            include: {
                sport: true,
                athletes: {
                    include: {
                        athlete: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    /**
     * Create a new discipline
     */
    async create(data: CreateDisciplineData): Promise<Discipline> {
        // Check if sport exists and is individual sport
        const sport = await prisma.sport.findUnique({
            where: { sportId: data.sportId }
        });

        if (!sport) {
            throw new Error('Sport not found');
        }

        if (sport.isTeamSport) {
            throw new Error('Cannot create disciplines for team sports');
        }

        return prisma.discipline.create({
            data,
            include: {
                sport: true,
                athletes: true,
                performances: true
            }
        });
    }

    /**
     * Update discipline
     */
    async update(disciplineId: number, data: Partial<CreateDisciplineData>): Promise<Discipline> {
        return prisma.discipline.update({
            where: { disciplineId },
            data: {
                name: data.name,
                description: data.description,
                unit: data.unit
                // Note: code and sportId should not be updated to maintain integrity
            },
            include: {
                sport: true,
                athletes: {
                    include: {
                        athlete: true
                    }
                },
                performances: true
            }
        });
    }

    /**
     * Delete discipline
     */
    async delete(disciplineId: number): Promise<Discipline> {
        // Check if discipline has performances
        const performanceCount = await prisma.performance.count({
            where: { disciplineId }
        });

        if (performanceCount > 0) {
            throw new Error('Cannot delete discipline with existing performances');
        }

        return prisma.discipline.delete({
            where: { disciplineId },
            include: {
                sport: true,
                athletes: true,
                performances: true
            }
        });
    }

    /**
     * Add athlete to discipline
     */
    async addAthlete(disciplineId: number, athleteId: number, currentRank?: number): Promise<void> {
        // Check if athlete is already in this discipline
        const existing = await prisma.athleteDiscipline.findUnique({
            where: {
                athleteId_disciplineId: {
                    athleteId,
                    disciplineId
                }
            }
        });

        if (existing) {
            throw new Error('Athlete is already registered for this discipline');
        }

        await prisma.athleteDiscipline.create({
            data: {
                athleteId,
                disciplineId,
                currentRank
            }
        });
    }

    /**
     * Remove athlete from discipline
     */
    async removeAthlete(disciplineId: number, athleteId: number): Promise<void> {
        await prisma.athleteDiscipline.delete({
            where: {
                athleteId_disciplineId: {
                    athleteId,
                    disciplineId
                }
            }
        });
    }

    /**
     * Update athlete ranking in discipline
     */
    async updateAthleteRank(disciplineId: number, athleteId: number, currentRank: number): Promise<void> {
        await prisma.athleteDiscipline.update({
            where: {
                athleteId_disciplineId: {
                    athleteId,
                    disciplineId
                }
            },
            data: {
                currentRank
            }
        });
    }

    /**
     * Get discipline rankings
     */
    async getRankings(disciplineId: number, limit: number = 20): Promise<any[]> {
        return prisma.athleteDiscipline.findMany({
            where: {
                disciplineId,
                currentRank: {
                    not: null
                }
            },
            include: {
                athlete: {
                    include: {
                        team: true
                    }
                },
                discipline: true
            },
            orderBy: {
                currentRank: 'asc'
            },
            take: limit
        });
    }

    /**
     * Get discipline records and best performances
     */
    async getRecords(disciplineId: number, seasonId?: number): Promise<{
        discipline: Discipline | null;
        bestTime?: any;
        bestDistance?: any;
        bestHeight?: any;
        topPerformances: any[];
    }> {
        const discipline = await this.findById(disciplineId);

        if (!discipline) {
            return {
                discipline: null,
                topPerformances: []
            };
        }

        const where: Prisma.PerformanceWhereInput = { disciplineId };
        if (seasonId) {
            where.event = { seasonId };
        }

        // Get best performances based on discipline unit
        let bestPerformance = null;
        let orderBy: Prisma.PerformanceOrderByWithRelationInput = {};

        if (discipline.unit === 'seconds') {
            // For time-based events, lower is better
            orderBy = { time: 'asc' };
            bestPerformance = await prisma.performance.findFirst({
                where: { ...where, time: { not: null } },
                include: {
                    athlete: {
                        include: { team: true }
                    },
                    event: true
                },
                orderBy
            });
        } else if (discipline.unit === 'meters') {
            // For distance-based events, higher is better
            orderBy = { distance: 'desc' };
            bestPerformance = await prisma.performance.findFirst({
                where: { ...where, distance: { not: null } },
                include: {
                    athlete: {
                        include: { team: true }
                    },
                    event: true
                },
                orderBy
            });
        }

        // Get top 10 performances
        const topPerformances = await prisma.performance.findMany({
            where,
            include: {
                athlete: {
                    include: { team: true }
                },
                event: {
                    include: { season: true }
                }
            },
            orderBy: [orderBy, { date: 'desc' }],
            take: 10
        });

        const result: any = {
            discipline,
            topPerformances
        };

        if (discipline.unit === 'seconds') {
            result.bestTime = bestPerformance;
        } else if (discipline.unit === 'meters') {
            if (discipline.name.toLowerCase().includes('jump') ||
                discipline.name.toLowerCase().includes('vault')) {
                result.bestHeight = bestPerformance;
            } else {
                result.bestDistance = bestPerformance;
            }
        }

        return result;
    }

    /**
     * Get discipline statistics
     */
    async getDisciplineStats(disciplineId: number): Promise<{
        discipline: Discipline | null;
        totalAthletes: number;
        totalPerformances: number;
        averagePerformance: {
            time?: number;
            distance?: number;
            height?: number;
        };
        recordHolder?: any;
    }> {
        const discipline = await this.findById(disciplineId);

        if (!discipline) {
            return {
                discipline: null,
                totalAthletes: 0,
                totalPerformances: 0,
                averagePerformance: {},
                recordHolder: undefined
            };
        }

        const [totalAthletes, totalPerformances] = await Promise.all([
            prisma.athleteDiscipline.count({ where: { disciplineId } }),
            prisma.performance.count({ where: { disciplineId } })
        ]);

        // Calculate averages
        const averagePerformance: any = {};

        if (discipline.unit === 'seconds') {
            const avg = await prisma.performance.aggregate({
                where: { disciplineId, time: { not: null } },
                _avg: { time: true }
            });
            averagePerformance.time = avg._avg.time;
        } else if (discipline.unit === 'meters') {
            const avgDistance = await prisma.performance.aggregate({
                where: { disciplineId, distance: { not: null } },
                _avg: { distance: true }
            });
            const avgHeight = await prisma.performance.aggregate({
                where: { disciplineId, height: { not: null } },
                _avg: { height: true }
            });

            if (avgDistance._avg.distance) averagePerformance.distance = avgDistance._avg.distance;
            if (avgHeight._avg.height) averagePerformance.height = avgHeight._avg.height;
        }

        // Get record holder (top ranked athlete)
        const recordHolder = await prisma.athleteDiscipline.findFirst({
            where: {
                disciplineId,
                currentRank: 1
            },
            include: {
                athlete: {
                    include: { team: true }
                }
            }
        });

        return {
            discipline,
            totalAthletes,
            totalPerformances,
            averagePerformance,
            recordHolder
        };
    }

    /**
     * Search disciplines by name
     */
    async search(query: string, sportId?: number): Promise<Discipline[]> {
        const where: Prisma.DisciplineWhereInput = {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        };

        if (sportId) {
            where.sportId = sportId;
        }

        return prisma.discipline.findMany({
            where,
            include: {
                sport: true,
                athletes: {
                    include: {
                        athlete: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
}