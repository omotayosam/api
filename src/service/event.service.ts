import { EventStatus, Gender, SportType } from "@prisma/client";
import { AppError } from "../middleware/error";
import { EventModel } from "../model/event.model";
import { SportModel } from "../model/sport.model";

// Define the Event type with relations to match what EventModel returns
type EventWithRelations = {
    eventId: number;
    name: string;
    code: string;
    sportId: number;
    year: number;
    seasonId: number;
    gamedayId: number;
    venueId?: number | null;
    gender?: Gender | null;
    startDate: Date;
    endDate?: Date | null;
    location?: string | null;
    description?: string | null;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
    sport: {
        sportId: number;
        name: SportType;
        description?: string | null;
        isTeamSport: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
    season: any;
    gameday: any;
    venue?: any | null;
    performances: any[];
};

export class EventService {
    private eventModel: EventModel;
    private sportModel: SportModel;

    constructor() {
        this.eventModel = new EventModel();
        this.sportModel = new SportModel();
    }

    async getAllEvents(filter?: {
        status?: EventStatus;
        gamedayId?: number;
        seasonId?: number;
        sportType?: SportType;
    }): Promise<EventWithRelations[]> {
        try {
            return await this.eventModel.findAll(filter);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to fetch events', 500);
        }
    }

    async getEventById(id: number): Promise<EventWithRelations> {
        try {
            const event = await this.eventModel.findById(id);
            if (!event) {
                throw new AppError(`Event with ID ${id} not found`, 404);
            }
            return event;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to fetch event', 500);
        }
    }

    async getEventByCode(code: string): Promise<EventWithRelations> {
        try {
            const event = await this.eventModel.findByCode(code);
            if (!event) {
                throw new AppError(`Event with code ${code} not found`, 404);
            }
            return event;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to fetch event by code', 500);
        }
    }

    async createEvent(data: {
        name: string;
        code: string;
        sportType: SportType;
        year: number;
        seasonId: number;
        gamedayId: number;
        venueId?: number;
        gender?: Gender;
        startDate: Date;
        endDate?: Date;
        location?: string;
        description?: string;
        status?: EventStatus;
    }): Promise<EventWithRelations> {
        try {
            // Validate required fields
            if (!data.name || !data.code || !data.sportType) {
                throw new AppError('Name, code, and sport type are required', 400);
            }

            // Validate dates
            if (data.endDate && data.endDate < data.startDate) {
                throw new AppError('End date cannot be before start date', 400);
            }

            // Check if event code already exists
            const existingEvent = await this.eventModel.findByCode(data.code);
            if (existingEvent) {
                throw new AppError(`Event with code ${data.code} already exists`, 409);
            }

            // Validate gameday exists
            const gameday = await this.eventModel.findGameday(data.gamedayId);
            if (!gameday) {
                throw new AppError(`Gameday with ID ${data.gamedayId} not found`, 404);
            }

            // Validate venue if provided
            if (data.venueId) {
                const venues = await this.eventModel.findVenues();
                const venue = venues.find(v => v.venueId === data.venueId);
                if (!venue) {
                    throw new AppError(`Venue with ID ${data.venueId} not found`, 404);
                }
            }

            return await this.eventModel.create(data);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to create event', 500);
        }
    }

    async updateEvent(id: number, data: Partial<{
        name: string;
        code: string;
        sportId: number;
        sportType?: any; // Add sportType to handle frontend data
        year: number;
        seasonId: number;
        gamedayId: number;
        venueId?: number | null;
        gender?: Gender | null;
        startDate: Date;
        endDate?: Date | null;
        location?: string | null;
        description?: string | null;
        status: EventStatus;
    }>): Promise<EventWithRelations> {
        try {
            // Check if event exists
            const event = await this.eventModel.findById(id);
            if (!event) {
                throw new AppError(`Event with ID ${id} not found`, 404);
            }

            // Validate dates if both are provided
            const startDate = data.startDate || event.startDate;
            const endDate = data.endDate !== undefined ? data.endDate : event.endDate;

            if (endDate && endDate < startDate) {
                throw new AppError('End date cannot be before start date', 400);
            }

            // If updating code, check for duplicates (excluding current event)
            if (data.code && data.code !== event.code) {
                const existingEvent = await this.eventModel.findByCode(data.code);
                if (existingEvent && existingEvent.eventId !== id) {
                    throw new AppError(`Event with code ${data.code} already exists`, 409);
                }
            }

            // Validate gameday if provided
            if (data.gamedayId && data.gamedayId !== event.gamedayId) {
                const gameday = await this.eventModel.findGameday(data.gamedayId);
                if (!gameday) {
                    throw new AppError(`Gameday with ID ${data.gamedayId} not found`, 404);
                }
            }

            // Validate venue if provided
            if (data.venueId) {
                const venues = await this.eventModel.findVenues();
                const venue = venues.find(v => v.venueId === data.venueId);
                if (!venue) {
                    throw new AppError(`Venue with ID ${data.venueId} not found`, 404);
                }
            }

            // Filter out eventId and other invalid fields from the data to prevent Prisma errors
            const { eventId, sportType, createdAt, updatedAt, sport, season, gameday, venue, performances, ...updateData } = data as any;

            // If sportType is provided, we need to convert it to sportId
            if (data.sportType) {
                try {
                    // Find the sport by sportType to get the sportId
                    const sport = await this.sportModel.findByName(data.sportType);
                    if (sport) {
                        updateData.sportId = sport.sportId;
                    } else {
                        throw new AppError(`Sport type ${data.sportType} not found`, 400);
                    }
                } catch (error) {
                    if (error instanceof AppError) throw error;
                    throw new AppError(`Failed to find sport type ${data.sportType}`, 400);
                }
            }

            // Log the final update data for debugging
            console.log('Original data received:', data);
            console.log('Filtered update data:', updateData);

            // Convert date strings to Date objects if they exist
            if (updateData.startDate && typeof updateData.startDate === 'string') {
                updateData.startDate = new Date(updateData.startDate);
            }
            if (updateData.endDate && typeof updateData.endDate === 'string') {
                updateData.endDate = new Date(updateData.endDate);
            }

            return await this.eventModel.update(id, updateData);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to update event', 500);
        }
    }

    async deleteEvent(id: number): Promise<{ message: string; deletedEvent: any }> {
        try {
            const event = await this.eventModel.findById(id);
            if (!event) {
                throw new AppError(`Event with ID ${id} not found`, 404);
            }

            // Check if event can be deleted (e.g., not if it's currently live)
            if (event.status === EventStatus.LIVE) {
                throw new AppError('Cannot delete a live event', 400);
            }

            // Delete the event (related records are handled in the model)
            const deletedEvent = await this.eventModel.delete(id);

            return {
                message: `Event ${event.name} has been successfully deleted`,
                deletedEvent
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to delete event', 500);
        }
    }

    async findActiveEventsByGameday(gamedayId: number): Promise<EventWithRelations[]> {
        try {
            // Validate gameday exists
            const gameday = await this.eventModel.findGameday(gamedayId);
            if (!gameday) {
                throw new AppError(`Gameday with ID ${gamedayId} not found`, 404);
            }

            return await this.eventModel.findActiveEventsByGameday(gamedayId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to find active events by gameday', 500);
        }
    }

    async findEventsByStatus(status: EventStatus, gamedayId?: number): Promise<EventWithRelations[]> {
        try {
            // Validate gameday if provided
            if (gamedayId) {
                const gameday = await this.eventModel.findGameday(gamedayId);
                if (!gameday) {
                    throw new AppError(`Gameday with ID ${gamedayId} not found`, 404);
                }
            }

            return await this.eventModel.findEventsByStatus(status, gamedayId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to find events by status', 500);
        }
    }

    async checkAllEventsCompleted(gamedayId: number): Promise<boolean> {
        try {
            // Validate gameday exists
            const gameday = await this.eventModel.findGameday(gamedayId);
            if (!gameday) {
                throw new AppError(`Gameday with ID ${gamedayId} not found`, 404);
            }

            return await this.eventModel.checkAllEventsCompleted(gamedayId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to check all events completed', 500);
        }
    }

    async updateEventStatus(id: number, status: EventStatus): Promise<EventWithRelations> {
        try {
            const event = await this.eventModel.findById(id);
            if (!event) {
                throw new AppError(`Event with ID ${id} not found`, 404);
            }

            // Validate status transitions
            const validTransitions = this.getValidStatusTransitions(event.status);
            if (!validTransitions.includes(status)) {
                throw new AppError(
                    `Invalid status transition from ${event.status} to ${status}`,
                    400
                );
            }

            return await this.eventModel.updateStatus(id, status);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to update event status', 500);
        }
    }

    // Helper method to get valid status transitions
    private getValidStatusTransitions(currentStatus: EventStatus): EventStatus[] {
        const transitions: Record<EventStatus, EventStatus[]> = {
            [EventStatus.SCHEDULED]: [EventStatus.LIVE, EventStatus.POSTPONED, EventStatus.CANCELED],
            [EventStatus.LIVE]: [EventStatus.FINISHED, EventStatus.POSTPONED, EventStatus.CANCELED],
            [EventStatus.FINISHED]: [EventStatus.LIVE], // Allow re-opening if needed
            [EventStatus.POSTPONED]: [EventStatus.SCHEDULED, EventStatus.LIVE, EventStatus.CANCELED],
            [EventStatus.CANCELED]: [EventStatus.SCHEDULED], // Allow rescheduling
            [EventStatus.SUSPENDED]: [EventStatus.SCHEDULED]

        };

        return transitions[currentStatus] || [];
    }

    // Additional utility methods for event management

    async getEventAthletes(eventId: number): Promise<any[]> {
        try {
            const event = await this.eventModel.findById(eventId);
            if (!event) {
                throw new AppError(`Event with ID ${eventId} not found`, 404);
            }

            return await this.eventModel.findEventAthletes(eventId);
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to get event athletes', 500);
        }
    }

    async getUpcomingEvents(limit: number = 10): Promise<EventWithRelations[]> {
        try {
            return await this.eventModel.findAll({
                status: EventStatus.SCHEDULED
            });
        } catch (error) {
            console.log(error);
            throw new AppError('Failed to get upcoming events', 500);
        }
    }

    async getLiveEvents(): Promise<EventWithRelations[]> {
        try {
            return await this.eventModel.findEventsByStatus(EventStatus.LIVE);
        } catch (error) {
            console.log(error);
            throw new AppError('Failed to get live events', 500);
        }
    }

    // Gameday related methods (if needed in service layer)

    async getCurrentGameday(seasonId?: number): Promise<any> {
        try {
            const gameday = await this.eventModel.findCurrentGameday(seasonId);
            if (!gameday) {
                throw new AppError('No current gameday found', 404);
            }
            return gameday;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to get current gameday', 500);
        }
    }

    async getNextGameday(seasonId?: number): Promise<any> {
        try {
            const gameday = await this.eventModel.findNextGameday(seasonId);
            if (!gameday) {
                throw new AppError('No next gameday found', 404);
            }
            return gameday;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.log(error);
            throw new AppError('Failed to get next gameday', 500);
        }
    }
}