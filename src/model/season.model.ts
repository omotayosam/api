
import { PrismaClient, Season, SeasonType } from "@prisma/client";

const prisma = new PrismaClient();
interface CreateSeasonData {
    name: string;
    seasonType: SeasonType;
    startYear: number;
    endYear: number;
    isActive?: boolean;
}

export class SeasonModel {

    async findAll(): Promise<Season[]> {
        return prisma.season.findMany({
            include: {
                events: {
                    include: {
                        sport: true,
                        venue: true
                    }
                },
                gamedays: {
                    include: {
                        events: true
                    }
                }
            },
            orderBy: [
                { startYear: 'desc' },
                { seasonType: 'asc' }
            ]
        });
    }

    async findById(seasonId: number): Promise<Season | null> {
        return prisma.season.findUnique({
            where: { seasonId },
            include: {
                events: {
                    include: {
                        sport: true,
                        venue: true,
                        gameday: true
                    }
                },
                gamedays: {
                    include: {
                        events: true
                    },
                    orderBy: { scheduledDate: 'asc' }
                }
            }
        });
    }

    async findActive(): Promise<Season | null> {
        return prisma.season.findFirst({
            where: { isActive: true },
            include: {
                events: {
                    include: {
                        sport: true,
                        venue: true
                    }
                },
                gamedays: {
                    include: {
                        events: true
                    }
                }
            }
        });
    }

    async findByYear(year: number): Promise<Season[]> {
        return prisma.season.findMany({
            where: {
                OR: [
                    { startYear: year },
                    { endYear: year }
                ]
            },
            include: {
                events: {
                    include: {
                        sport: true
                    }
                },
                gamedays: true
            },
            orderBy: { seasonType: 'asc' }
        });
    }

    async create(data: CreateSeasonData): Promise<Season> {
        // If this season is set as active, deactivate others
        if (data.isActive) {
            await prisma.season.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        return prisma.season.create({
            data,
            include: {
                events: true,
                gamedays: true
            }
        });
    }

    async update(seasonId: number, data: Partial<CreateSeasonData>): Promise<Season> {
        // If setting this season as active, deactivate others
        if (data.isActive) {
            await prisma.season.updateMany({
                where: {
                    isActive: true,
                    seasonId: { not: seasonId }
                },
                data: { isActive: false }
            });
        }

        return prisma.season.update({
            where: { seasonId },
            data,
            include: {
                events: true,
                gamedays: true
            }
        });
    }

    async delete(seasonId: number): Promise<Season> {
        // Check if season has events
        const eventCount = await prisma.event.count({
            where: { seasonId }
        });

        if (eventCount > 0) {
            throw new Error('Cannot delete season with existing events');
        }

        return prisma.season.delete({
            where: { seasonId },
            include: {
                events: true,
                gamedays: true
            }
        });
    }

    async getSeasonStats(seasonId: number): Promise<{
        season: Season | null;
        totalEvents: number;
        totalGamedays: number;
        totalPerformances: number;
        sportBreakdown: { [sport: string]: number };
    }> {
        const season = await this.findById(seasonId);

        if (!season) {
            return {
                season: null,
                totalEvents: 0,
                totalGamedays: 0,
                totalPerformances: 0,
                sportBreakdown: {}
            };
        }

        const [totalEvents, totalGamedays, totalPerformances] = await Promise.all([
            prisma.event.count({ where: { seasonId } }),
            prisma.gameday.count({ where: { seasonId } }),
            prisma.performance.count({
                where: { event: { seasonId } }
            })
        ]);

        // Sport breakdown
        const events = await prisma.event.findMany({
            where: { seasonId },
            include: { sport: true }
        });

        const sportBreakdown: { [sport: string]: number } = {};
        events.forEach(event => {
            const sportName = event.sport.name;
            sportBreakdown[sportName] = (sportBreakdown[sportName] || 0) + 1;
        });

        return {
            season,
            totalEvents,
            totalGamedays,
            totalPerformances,
            sportBreakdown
        };
    }
}