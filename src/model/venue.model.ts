import { Prisma, PrismaClient, Venue } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateVenueData {
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    isHome?: boolean;
}

export class VenueModel {

    async findAll(): Promise<Venue[]> {
        return prisma.venue.findMany({
            include: {
                events: {
                    include: {
                        sport: true,
                        season: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findById(venueId: number): Promise<Venue | null> {
        return prisma.venue.findUnique({
            where: { venueId },
            include: {
                events: {
                    include: {
                        sport: true,
                        season: true,
                        gameday: true
                    },
                    orderBy: { startDate: 'desc' }
                }
            }
        });
    }

    async findHomeVenues(): Promise<Venue[]> {
        return prisma.venue.findMany({
            where: { isHome: true },
            include: {
                events: {
                    include: {
                        sport: true,
                        season: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async create(data: CreateVenueData): Promise<Venue> {
        return prisma.venue.create({
            data,
            include: {
                events: true
            }
        });
    }

    async update(venueId: number, data: Partial<CreateVenueData>): Promise<Venue> {
        return prisma.venue.update({
            where: { venueId },
            data,
            include: {
                events: true
            }
        });
    }

    async delete(venueId: number): Promise<Venue> {
        // Check if venue has events
        const eventCount = await prisma.event.count({
            where: { venueId }
        });

        if (eventCount > 0) {
            throw new Error('Cannot delete venue with existing events');
        }

        return prisma.venue.delete({
            where: { venueId },
            include: {
                events: true
            }
        });
    }

    // async getVenueStats(venueId: number): Promise<{
    //     venue: Venue | null;
    //     totalEvents: number;
    //     upcomingEvents: number;
    //     sportBreakdown: { [sport: string]: number };
    // }> {
    //     // Define a specific type for the venue object that includes its event relations
    //     type VenueWithEvents = Prisma.VenueGetPayload<{
    //         include: {
    //             events: {
    //                 include: {
    //                     sport: true
    //                 }
    //             }
    //         }
    //     }>

    //     // Fetch the venue and type it correctly
    //     const venue: VenueWithEvents | null = await this.findById(venueId);

    //     if (!venue) {
    //         return {
    //             venue: null,
    //             totalEvents: 0,
    //             upcomingEvents: 0,
    //             sportBreakdown: {}
    //         };
    //     }

    //     const upcomingEvents = await prisma.event.count({
    //         where: {
    //             venueId,
    //             status: 'SCHEDULED', // More reliable than date for "upcoming"
    //             startDate: { gte: new Date() }
    //         }
    //     });

    //     // Sport breakdown
    //     const sportBreakdown: { [sport: string]: number } = {};
    //     // Now TypeScript knows that venue.events exists and what it contains
    //     venue.events.forEach(event => {
    //         const sportName = event.sport.name;
    //         sportBreakdown[sportName] = (sportBreakdown[sportName] || 0) + 1;
    //     });

    //     return {
    //         venue,
    //         totalEvents: venue.events.length, // More efficient than a separate DB call
    //         upcomingEvents,
    //         sportBreakdown
    //     };
    // }
}

