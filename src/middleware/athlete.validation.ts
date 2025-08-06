import z from "zod";

export class AthleteValidation {
    createIndividualAthleteSchema = {
        body: z.object({
            code: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            dateOfBirth: z.string().transform((date) => new Date(date)),
            nationality: z.string(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const).default('MALE'),
            height: z.number().optional(),
            weight: z.number().optional(),
            bio: z.string().optional(),
            isActive: z.boolean().optional().default(true),
            sportType: z.enum(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'ATHLETICS', 'SWIMMING', 'TENNIS', 'BADMINTON', 'TABLE_TENNIS', 'CHESS', 'SCRABBLE'] as const),
            disciplines: z.array(z.object({
                code: z.string(),
                currentRank: z.number().optional()
            }))
        }),
    };

    createTeamAthleteSchema = {
        body: z.object({
            code: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            teamCode: z.string(),
            positionCode: z.string(),
            dateOfBirth: z.string().transform((date) => new Date(date)),
            nationality: z.string(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const).default('MALE'),
            height: z.number().optional(),
            weight: z.number().optional(),
            bio: z.string().optional(),
            isActive: z.boolean().optional().default(true),
            sportType: z.enum(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'ATHLETICS', 'SWIMMING', 'TENNIS', 'BADMINTON', 'TABLE_TENNIS', 'CHESS', 'SCRABBLE'] as const)
        }),
    };

    updateAthleteSchema = {
        body: z.object({
            code: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            dateOfBirth: z.string().transform((date) => new Date(date)).optional(),
            nationality: z.string().optional(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const).optional(),
            height: z.number().optional(),
            weight: z.number().optional(),
            bio: z.string().optional(),
            isActive: z.boolean().optional(),
            sportType: z.enum(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'ATHLETICS', 'SWIMMING', 'TENNIS', 'BADMINTON', 'TABLE_TENNIS', 'CHESS', 'SCRABBLE'] as const).optional(),
            teamCode: z.string().optional(),
            positionId: z.number().optional()
        }),
    };

    // Legacy schema for backward compatibility
    createAthleteSchema = {
        body: z.object({
            firstName: z.string(),
            lastName: z.string(),
            dateOfBirth: z.string().transform((date) => new Date(date)),
            nationality: z.string(),
            gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const).default('MALE'),
            height: z.number().optional(),
            weight: z.number().optional(),
            bio: z.string().optional(),
            isActive: z.boolean().optional().default(true),
            sportType: z.enum(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'ATHLETICS', 'SWIMMING', 'TENNIS', 'BADMINTON', 'TABLE_TENNIS', 'CHESS', 'SCRABBLE'] as const).optional(),
            code: z.string().optional(),
            disciplines: z.array(z.object({
                code: z.string(),
                currentRank: z.number().optional()
            })).optional(),
            teamCode: z.string().optional(),
            positionCode: z.string().optional()
        }),
    };
}






