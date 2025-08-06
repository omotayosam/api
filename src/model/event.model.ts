import {
    Gender,
    PrismaClient,
    SportType,
    Team,
    Event,
    Gameday,
    EventStatus,
    Season,
    Sport,
    Venue,
    Performance,
    Athlete
} from "@prisma/client";

const prisma = new PrismaClient();

// Type for event with relations
type EventWithRelations = Event & {
    sport: Sport;
    season: Season;
    gameday: Gameday;
    venue?: Venue | null;
    performances: Performance[];
};

// Type for gameday with relations
type GamedayWithRelations = Gameday & {
    season: Season;
    events: Event[];
};

export class EventModel {

    async findAll(filter?: {
        status?: EventStatus;
        gamedayId?: number;
        seasonId?: number;
        sportType?: SportType;
    }): Promise<EventWithRelations[]> {
        return prisma.event.findMany({
            where: {
                ...(filter?.gamedayId && { gamedayId: filter.gamedayId }),
                ...(filter?.seasonId && { seasonId: filter.seasonId }),
                ...(filter?.status && { status: filter.status }),
                ...(filter?.sportType && { sport: { name: filter.sportType } })
            },
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: {
                    include: {
                        athlete: true,
                        discipline: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });
    }

    async findById(eventId: number): Promise<EventWithRelations | null> {
        return prisma.event.findUnique({
            where: { eventId: eventId }, // Fixed: use eventId
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: {
                    include: {
                        athlete: true,
                        discipline: true
                    }
                }
            }
        });
    }

    async findByCode(code: string): Promise<EventWithRelations | null> {
        return prisma.event.findUnique({
            where: { code: code },
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: {
                    include: {
                        athlete: true,
                        discipline: true
                    }
                }
            }
        });
    }

    async findGameday(gamedayId: number): Promise<GamedayWithRelations | null> {
        return prisma.gameday.findUnique({
            where: { gamedayId: gamedayId }, // Fixed: use gamedayId
            include: {
                season: true,
                events: {
                    include: {
                        sport: true,
                        venue: true
                    }
                }
            }
        });
    }

    async findGamedays(gamedayIds: number[]): Promise<GamedayWithRelations[]> {
        return prisma.gameday.findMany({
            where: { gamedayId: { in: gamedayIds } }, // Fixed: use gamedayId
            include: {
                season: true,
                events: {
                    include: {
                        sport: true,
                        venue: true
                    }
                }
            }
        });
    }

    async findCurrentGameday(seasonId?: number): Promise<GamedayWithRelations | null> {
        return prisma.gameday.findFirst({
            where: {
                isCurrent: true,
                ...(seasonId && { seasonId: seasonId })
            },
            include: {
                season: true,
                events: {
                    include: {
                        sport: true,
                        venue: true
                    }
                }
            }
        });
    }

    async findNextGameday(seasonId?: number): Promise<GamedayWithRelations | null> {
        return prisma.gameday.findFirst({
            where: {
                isNext: true,
                ...(seasonId && { seasonId: seasonId })
            },
            include: {
                season: true,
                events: {
                    include: {
                        sport: true,
                        venue: true
                    }
                }
            }
        });
    }

    async findTeam(teamCode: string): Promise<Team | null> {
        return await prisma.team.findUnique({
            where: { code: teamCode },
            include: {
                sport: true,
                athletes: true
            }
        });
    }

    async create(data: {
        name: string
        code: string
        sportType: SportType
        year: number
        seasonId: number
        gamedayId: number
        venueId?: number
        gender?: Gender
        startDate: Date
        endDate?: Date
        location?: string
        description?: string
        status?: EventStatus
    }): Promise<EventWithRelations> {
        // Verify sport exists
        const sport = await prisma.sport.findUnique({
            where: { name: data.sportType }
        });

        if (!sport) {
            throw new Error(`Sport ${data.sportType} not found`);
        }

        // Verify season exists
        const season = await prisma.season.findUnique({
            where: { seasonId: data.seasonId }
        });

        if (!season) {
            throw new Error(`Season with ID ${data.seasonId} not found`);
        }

        // Verify gameday exists
        const gameday = await prisma.gameday.findUnique({
            where: { gamedayId: data.gamedayId }
        });

        if (!gameday) {
            throw new Error(`Gameday with ID ${data.gamedayId} not found`);
        }

        // Verify venue exists if provided
        if (data.venueId) {
            const venue = await prisma.venue.findUnique({
                where: { venueId: data.venueId }
            });

            if (!venue) {
                throw new Error(`Venue with ID ${data.venueId} not found`);
            }
        }

        const event = await prisma.event.create({
            data: {
                name: data.name,
                code: data.code,
                sportId: sport.sportId, // Fixed: use sportId
                year: data.year,
                seasonId: data.seasonId,
                gamedayId: data.gamedayId,
                venueId: data.venueId,
                gender: data.gender,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                description: data.description,
                status: data.status || EventStatus.SCHEDULED
            },
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: true
            }
        });

        return event;
    }

    async update(eventId: number, data: Partial<Omit<Event, 'eventId' | 'createdAt' | 'updatedAt'>>): Promise<EventWithRelations> {
        return prisma.event.update({
            where: { eventId: eventId }, // Fixed: use eventId
            data,
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: {
                    include: {
                        athlete: true,
                        discipline: true
                    }
                }
            }
        });
    }

    async delete(eventId: number): Promise<Event> {
        // First delete related performances
        await this.deleteRelatedRecords(eventId);

        return prisma.event.delete({
            where: { eventId: eventId } // Fixed: use eventId
        });
    }

    async findActiveEventsByGameday(gamedayId: number): Promise<EventWithRelations[]> {
        return prisma.event.findMany({
            where: {
                gamedayId,
                status: EventStatus.LIVE
            },
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: {
                    include: {
                        athlete: true,
                        discipline: true
                    }
                }
            }
        });
    }

    async findEventsByStatus(status: EventStatus, gamedayId?: number): Promise<EventWithRelations[]> {
        return prisma.event.findMany({
            where: {
                status: status,
                ...(gamedayId && { gamedayId: gamedayId })
            },
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: true
            }
        });
    }

    async checkAllEventsCompleted(gamedayId: number): Promise<boolean> {
        const incompleteEvents = await prisma.event.findMany({
            where: {
                gamedayId,
                status: { not: EventStatus.FINISHED }
            }
        });
        return incompleteEvents.length === 0;
    }

    async updateStatus(eventId: number, status: EventStatus): Promise<EventWithRelations> {
        return prisma.event.update({
            where: { eventId: eventId }, // Fixed: use eventId
            data: { status },
            include: {
                sport: true,
                season: true,
                gameday: true,
                venue: true,
                performances: true
            }
        });
    }

    async findTeamAthletes(teamCode: string): Promise<(Athlete & { team: Team | null; position: any })[]> {
        return prisma.athlete.findMany({
            where: { teamCode: teamCode }, // Fixed: use teamCode instead of teamId
            include: {
                team: true,
                position: true
            }
        });
    }

    async findEventAthletes(eventId: number): Promise<(Performance & { athlete: Athlete })[]> {
        return prisma.performance.findMany({
            where: { eventId: eventId },
            include: {
                athlete: {
                    include: {
                        team: true,
                        position: true
                    }
                },
                discipline: true,
                event: true
            }
        });
    }

    async deleteRelatedRecords(eventId: number): Promise<void> {
        // Delete related performances
        await prisma.performance.deleteMany({
            where: { eventId: eventId }
        });
    }

    // Gameday management methods
    async createGameday(data: {
        name: string
        seasonId: number
        gameNumber?: number
        scheduledDate?: Date
        isCurrent?: boolean
        isNext?: boolean
    }): Promise<GamedayWithRelations> {
        // If setting as current or next, update other gamedays
        if (data.isCurrent) {
            await prisma.gameday.updateMany({
                where: { seasonId: data.seasonId, isCurrent: true },
                data: { isCurrent: false }
            });
        }

        if (data.isNext) {
            await prisma.gameday.updateMany({
                where: { seasonId: data.seasonId, isNext: true },
                data: { isNext: false }
            });
        }

        return prisma.gameday.create({
            data: {
                name: data.name,
                seasonId: data.seasonId,
                gameNumber: data.gameNumber,
                scheduledDate: data.scheduledDate,
                isCurrent: data.isCurrent || false,
                isNext: data.isNext || false
            },
            include: {
                season: true,
                events: true
            }
        });
    }

    async setCurrentGameday(gamedayId: number): Promise<GamedayWithRelations> {
        const gameday = await prisma.gameday.findUnique({
            where: { gamedayId: gamedayId }
        });

        if (!gameday) {
            throw new Error(`Gameday with ID ${gamedayId} not found`);
        }

        // Remove current flag from other gamedays in the same season
        await prisma.gameday.updateMany({
            where: {
                seasonId: gameday.seasonId,
                isCurrent: true
            },
            data: { isCurrent: false }
        });

        // Set this gameday as current
        return prisma.gameday.update({
            where: { gamedayId: gamedayId },
            data: { isCurrent: true },
            include: {
                season: true,
                events: true
            }
        });
    }

    async finishGameday(gamedayId: number): Promise<GamedayWithRelations> {
        return prisma.gameday.update({
            where: { gamedayId: gamedayId },
            data: {
                finished: true,
                isCurrent: false
            },
            include: {
                season: true,
                events: true
            }
        });
    }

    // Venue methods
    async createVenue(data: {
        name: string
        address?: string
        city?: string
        capacity?: number
        isHome?: boolean
    }): Promise<Venue> {
        return prisma.venue.create({
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                capacity: data.capacity,
                isHome: data.isHome || false
            }
        });
    }

    async findVenues(): Promise<Venue[]> {
        return prisma.venue.findMany({
            orderBy: { name: 'asc' }
        });
    }
}