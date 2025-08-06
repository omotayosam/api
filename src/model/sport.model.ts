import { PrismaClient, Prisma, Sport, SportType } from "@prisma/client";

const prisma = new PrismaClient();



const sportWithRelations = Prisma.validator<Prisma.SportDefaultArgs>()({
    include: {
        disciplines: true,
        positions: true,
        teams: {
            include: {
                athletes: true
            }
        },
        events: {
            include: {
                season: true,
                gameday: true,
                venue: true
            }
        }
    }
});

type SportWithRelations = Prisma.SportGetPayload<typeof sportWithRelations>;


interface CreateSportData {
    name: SportType;
    isTeamSport: boolean;
}


export class SportModel {

    /**
     * Get all sports
     */
    async findAll(): Promise<Sport[]> {
        return prisma.sport.findMany({
            include: {
                disciplines: true,
                positions: true,
                teams: {
                    include: {
                        athletes: true
                    }
                },
                events: {
                    include: {
                        season: true,
                        gameday: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    /**
     * Get sport by ID
     */
    async findById(sportId: number): Promise<SportWithRelations | null> {
        return prisma.sport.findUnique({
            where: { sportId },
            include: {
                disciplines: true,
                positions: true,
                teams: {
                    include: {
                        athletes: true
                    }
                },
                events: {
                    include: {
                        season: true,
                        gameday: true,
                        venue: true
                    }
                }
            }
        });
    }
    /**
     * Get sport by name/type
     */
    async findByName(name: SportType): Promise<Sport | null> {
        return prisma.sport.findUnique({
            where: { name },
            include: {
                disciplines: true,
                positions: true,
                teams: {
                    include: {
                        athletes: true
                    }
                }
            }
        });
    }

    /**
     * Get all team sports
     */
    async findTeamSports(): Promise<Sport[]> {
        return prisma.sport.findMany({
            where: { isTeamSport: true },
            include: {
                positions: true,
                teams: {
                    include: {
                        athletes: true
                    }
                }
            }
        });
    }

    /**
     * Get all individual sports
     */
    async findIndividualSports(): Promise<Sport[]> {
        return prisma.sport.findMany({
            where: { isTeamSport: false },
            include: {
                disciplines: true
            }
        });
    }

    /**
     * Create a new sport
     */
    async create(data: CreateSportData): Promise<Sport> {
        return prisma.sport.create({
            data,
            include: {
                disciplines: true,
                positions: true,
                teams: true,
                events: true
            }
        });
    }

    /**
     * Update sport
     */
    async update(sportId: number, data: Partial<CreateSportData>): Promise<Sport> {
        return prisma.sport.update({
            where: { sportId },
            data,
            include: {
                disciplines: true,
                positions: true,
                teams: true,
                events: true
            }
        });
    }

    /**
     * Delete sport (cascades to related data)
     */
    async delete(sportId: number): Promise<Sport> {
        return prisma.sport.delete({
            where: { sportId },
            include: {
                disciplines: true,
                positions: true,
                teams: true,
                events: true
            }
        });
    }

    /**
         * Get sport statistics
         */
    async getSportStats(sportId: number): Promise<{
        sport: SportWithRelations | null;
        totalTeams: number;
        totalAthletes: number;
        totalEvents: number;
        totalDisciplines: number;
        totalPositions: number;
    }> {
        const sport = await this.findById(sportId);

        if (!sport) {
            return {
                sport: null,
                totalTeams: 0,
                totalAthletes: 0,
                totalEvents: 0,
                totalDisciplines: 0,
                totalPositions: 0
            };
        }

        const [totalTeams, totalAthletes, totalEvents] = await Promise.all([
            prisma.team.count({ where: { sportId } }),
            prisma.athlete.count({
                where: {
                    team: { sportId }
                }
            }),
            prisma.event.count({ where: { sportId } })
        ]);

        return {
            sport,
            totalTeams,
            totalAthletes,
            totalEvents,
            totalDisciplines: sport.disciplines.length,
            totalPositions: sport.positions.length
        };
    }


}