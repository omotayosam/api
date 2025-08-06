// src/services/venue.service.ts
import { Venue } from '@prisma/client';
import { VenueModel } from '../model/venue.model';

interface CreateVenueDto {
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    isHome?: boolean;
}

interface UpdateVenueDto {
    name?: string;
    address?: string;
    city?: string;
    capacity?: number;
    isHome?: boolean;
}

export class VenueService {
    private venueModel: VenueModel;

    constructor() {
        this.venueModel = new VenueModel();
    }

    async createVenue(data: CreateVenueDto): Promise<Venue> {
        return await this.venueModel.create(data);
    }

    async getAllVenues(): Promise<Venue[]> {
        return await this.venueModel.findAll();
    }

    async getVenueById(venueId: number): Promise<Venue | null> {
        return await this.venueModel.findById(venueId);
    }

    async updateVenue(venueId: number, data: UpdateVenueDto): Promise<Venue> {
        return await this.venueModel.update(venueId, data);
    }

    async deleteVenue(venueId: number): Promise<Venue> {
        return await this.venueModel.delete(venueId);
    }

    async getHomeVenues(): Promise<Venue[]> {
        return await this.venueModel.findHomeVenues();
    }
} 