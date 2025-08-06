// src/controllers/venue.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { VenueService } from '../service/venue.service';


export class VenueController {
    private venueService: VenueService;

    constructor() {
        const prisma = new PrismaClient();
        this.venueService = new VenueService();
    }

    async createVenue(req: Request, res: Response): Promise<void> {
        try {
            const venue = await this.venueService.createVenue(req.body);
            res.status(201).json({
                success: true,
                message: 'Venue created successfully',
                data: venue
            });
        } catch (error) {
            console.error('Error creating venue:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllVenues(req: Request, res: Response): Promise<void> {
        try {
            const venues = await this.venueService.getAllVenues();
            res.status(200).json({
                success: true,
                message: 'Venues retrieved successfully',
                data: venues
            });
        } catch (error) {
            console.error('Error getting venues:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getVenueById(req: Request, res: Response): Promise<void> {
        try {
            const venueId = parseInt(req.params.id);

            if (isNaN(venueId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid venue ID'
                });
                return;
            }

            const venue = await this.venueService.getVenueById(venueId);

            if (!venue) {
                res.status(404).json({
                    success: false,
                    message: 'Venue not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Venue retrieved successfully',
                data: venue
            });
        } catch (error) {
            console.error('Error getting venue:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateVenue(req: Request, res: Response): Promise<void> {
        try {
            const venueId = parseInt(req.params.id);

            if (isNaN(venueId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid venue ID'
                });
                return;
            }

            const venue = await this.venueService.updateVenue(venueId, req.body);
            res.status(200).json({
                success: true,
                message: 'Venue updated successfully',
                data: venue
            });
        } catch (error) {
            console.error('Error updating venue:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteVenue(req: Request, res: Response): Promise<void> {
        try {
            const venueId = parseInt(req.params.id);

            if (isNaN(venueId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid venue ID'
                });
                return;
            }

            await this.venueService.deleteVenue(venueId);
            res.status(200).json({
                success: true,
                message: 'Venue deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting venue:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // async getVenuesByCity(req: Request, res: Response): Promise<void> {
    //     try {
    //         const city = req.params.city;
    //         const venues = await this.venueService.getVenuesByCity(city);
    //         res.status(200).json({
    //             success: true,
    //             message: 'Venues retrieved successfully',
    //             data: venues
    //         });
    //     } catch (error) {
    //         console.error('Error getting venues by city:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Internal server error',
    //             error: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // }

    async getHomeVenues(req: Request, res: Response): Promise<void> {
        try {
            const venues = await this.venueService.getHomeVenues();
            res.status(200).json({
                success: true,
                message: 'Home venues retrieved successfully',
                data: venues
            });
        } catch (error) {
            console.error('Error getting home venues:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // async searchVenues(req: Request, res: Response): Promise<void> {
    //     try {
    //         const query = req.query.q as string;
    //         const venues = await this.venueService.searchVenues(query);
    //         res.status(200).json({
    //             success: true,
    //             message: 'Venues search completed successfully',
    //             data: venues
    //         });
    //     } catch (error) {
    //         console.error('Error searching venues:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Internal server error',
    //             error: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // }
} 