
// src/middleware/validation.ts

import z from 'zod';
import { CompetitionLevel, EventStatus, EventType } from '../generated/prisma';


export class EventValidation {
    createEventSchema = {
        body: z.object({
            name: z.string().min(2).max(100),
            seasonId: z.number(),
            eventDate: z.string().transform((str) => new Date(str)),
            endDate: z.string().transform((str) => new Date(str)),
            location: z.string().min(2).max(100),
            eventType: z.enum(Object.values(EventType) as [string, ...string[]]),
            level: z.enum(Object.values(CompetitionLevel) as [string, ...string[]]),
            sportId: z.number().int().positive(),
            disciplineId: z.number().int().positive().optional(),
            status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELED', 'SUSPENDED'] as const),
        }),
    }


    updateEventSchema = {
        body: z.object({
            eventId: z.number().min(1, 'ID is required').optional(),
            status: z.enum(Object.values(EventStatus) as [string, ...string[]]).optional(),
            finished: z.boolean().optional(),
            started: z.boolean().optional(),
            statsProcessed: z.boolean().optional(),
            location: z.string().optional(),
            eventDate: z.string().transform((str) => new Date(str)).optional(),
            endDate: z.string().transform((str) => new Date(str)).optional(),
            name: z.string().min(2).max(100).optional(),
            seasonId: z.number().int().positive().optional(),
            sportId: z.number().int().positive().optional(),
            disciplineId: z.number().int().positive().optional(),
            eventType: z.enum(Object.values(EventType) as [string, ...string[]]).optional(),
            level: z.enum(Object.values(CompetitionLevel) as [string, ...string[]]).optional(),
        }),
    };

    updateEventStatusSchema = {
        body: z.object({
            status: z.enum(Object.values(EventStatus) as [string, ...string[]]),
        }),
    };

}

export class PerformanceValidation {
    createPerformanceSchema = {
        body: z.object({
            athleteId: z.number().int().positive(),
            eventId: z.number().int().positive(),
            disciplineId: z.number().int().positive(),
            result: z.string().min(1).max(100),
            position: z.number().int().positive().optional(),
            points: z.number().nonnegative().optional(),
            time: z.number().nonnegative().optional(),
            distance: z.number().nonnegative().optional(),
            notes: z.string().max(500).optional(),
        }),
    };
}


export class TeamValidation {
    createTeamSchema = {
        body: z.object({
            name: z.string().min(2).max(100),
            city: z.string().min(2).max(50).optional(),
            country: z.string().min(2).max(50).optional(),
            foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
            logo: z.string().url().optional(),
        }),
    };

    addTeamMemberSchema = {
        body: z.object({
            athleteId: z.number().int().positive(),
            teamId: z.number().int().positive(),
            position: z.string().max(50).optional(),
            jerseyNumber: z.number().int().min(0).max(999).optional(),
            joinDate: z.string().transform((str) => new Date(str)).optional(),
        }),
    };
}

// Export all validations
export const validations = {
    EventValidation: new EventValidation(),
    PerformanceValidation: new PerformanceValidation(),
    TeamValidation: new TeamValidation(),
};

