// src/controllers/event.controller.ts
import { Request, Response } from 'express';
import { EventService } from '../service/event.service';

export class EventController {
    private eventService: EventService;

    constructor() {
        this.eventService = new EventService();
    }

    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const event = await this.eventService.createEvent(req.body);
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: event
            });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const events = await this.eventService.getAllEvents(req.query);
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: events
            });
        } catch (error) {
            console.error('Error getting events:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.id);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            const event = await this.eventService.getEventById(eventId);

            if (!event) {
                res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Event retrieved successfully',
                data: event
            });
        } catch (error) {
            console.error('Error getting event:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.id);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            const event = await this.eventService.updateEvent(eventId, req.body);
            res.status(200).json({
                success: true,
                message: 'Event updated successfully',
                data: event
            });
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.id);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            await this.eventService.deleteEvent(eventId);
            res.status(200).json({
                success: true,
                message: 'Event deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getEventsBySport(req: Request, res: Response): Promise<void> {
        try {
            const sportType = req.params.sportType as any;
            const filter = {
                sportType,
                ...req.query
            };
            const events = await this.eventService.getAllEvents(filter);
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: events
            });
        } catch (error) {
            console.error('Error getting events by sport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getEventsBySeason(req: Request, res: Response): Promise<void> {
        try {
            const seasonId = parseInt(req.params.seasonId);

            if (isNaN(seasonId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid season ID'
                });
                return;
            }

            const filter = {
                seasonId,
                ...req.query
            };
            const events = await this.eventService.getAllEvents(filter);
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: events
            });
        } catch (error) {
            console.error('Error getting events by season:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getEventsByGameday(req: Request, res: Response): Promise<void> {
        try {
            const gamedayId = parseInt(req.params.gamedayId);

            if (isNaN(gamedayId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid gameday ID'
                });
                return;
            }

            const events = await this.eventService.findActiveEventsByGameday(gamedayId);
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: events
            });
        } catch (error) {
            console.error('Error getting events by gameday:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getUpcomingEvents(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const events = await this.eventService.getUpcomingEvents(limit);
            res.status(200).json({
                success: true,
                message: 'Upcoming events retrieved successfully',
                data: events
            });
        } catch (error) {
            console.error('Error getting upcoming events:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getActiveEvents(req: Request, res: Response): Promise<void> {
        try {
            const events = await this.eventService.getLiveEvents();
            res.status(200).json({
                success: true,
                message: 'Active events retrieved successfully',
                data: events
            });
        } catch (error) {
            console.error('Error getting active events:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateEventStatus(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.id);
            const { status } = req.body;

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            if (!status) {
                res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
                return;
            }

            const event = await this.eventService.updateEventStatus(eventId, status);
            res.status(200).json({
                success: true,
                message: 'Event status updated successfully',
                data: event
            });
        } catch (error) {
            console.error('Error updating event status:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}