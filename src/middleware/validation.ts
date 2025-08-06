
// src/middleware/validation.ts

import z from 'zod';


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

    PerformanceValidation: new PerformanceValidation(),
    TeamValidation: new TeamValidation(),
};

