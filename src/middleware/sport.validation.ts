import z from "zod";

export class SportValidation {
    // Sport validations can be added here
    createSportSchema = z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500).optional()
    });

    updateSportSchema = z.object({
        name: z.string().min(2).max(100).optional(),
        description: z.string().max(500).optional()
    });

}

export const DisciplineValidation = {
    // Discipline validations can be added here
    createDisciplineSchema: z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500).optional(),
        measurementUnit: z.string().min(1).max(20).optional(),
        isTimed: z.boolean().optional(),
        isWeightClass: z.boolean().optional()
    }),
}


