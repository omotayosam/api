import {
    Prisma,
    PrismaClient,
    Team,
    Position,
    Athlete,
    Gender,
    SportType,
    AthleteDiscipline,
    Discipline
} from "@prisma/client";

const prisma = new PrismaClient();

// Type for athlete with relations
type AthleteWithRelations = Athlete & {
    team: Team | null;
    position: Position | null;
    disciplines: (AthleteDiscipline & { discipline: Discipline })[];
};

export class AthleteModel {

    async findAll(filter?: Prisma.AthleteWhereInput, options?: {
        skip?: number;
        take?: number;
        orderBy?: Prisma.AthleteOrderByWithRelationInput;
    }): Promise<AthleteWithRelations[]> {
        return prisma.athlete.findMany({
            where: filter,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy || { athleteId: 'asc' }, // Fixed: use athleteId
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async count(filter?: Prisma.AthleteWhereInput): Promise<number> {
        return prisma.athlete.count({ where: filter });
    }

    async findById(athleteId: number): Promise<AthleteWithRelations | null> {
        return prisma.athlete.findUnique({
            where: { athleteId: athleteId }, // Fixed: use athleteId
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async findByCode(code: string): Promise<AthleteWithRelations | null> {
        return prisma.athlete.findUnique({
            where: { code: code },
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async createTeamAthlete(data: {
        code: string
        firstName: string
        lastName: string
        teamCode: string
        positionCode: string
        sportType: SportType
        dateOfBirth: Date
        nationality: string
        gender: Gender
        height: number
        weight: number
        bio?: string
    }): Promise<Athlete> {
        // Find position with updated field names
        const position = await prisma.position.findFirst({
            where: {
                code: data.positionCode,
                sport: { name: data.sportType }
            }
        });

        if (!position) {
            throw new Error(`Position ${data.positionCode} not found for ${data.sportType}`);
        }

        // Verify team exists
        const team = await prisma.team.findUnique({
            where: { code: data.teamCode }
        });

        if (!team) {
            throw new Error(`Team ${data.teamCode} not found`);
        }

        return await prisma.athlete.create({
            data: {
                code: data.code,
                firstName: data.firstName,
                lastName: data.lastName,
                teamCode: data.teamCode,
                positionId: position.positionId, // Fixed: use positionId
                dateOfBirth: data.dateOfBirth,
                nationality: data.nationality,
                gender: data.gender,
                height: data.height,
                weight: data.weight,
                bio: data.bio,
            },
            include: {
                team: true,
                position: true
            }
        });
    }

    async createIndividualAthlete(data: {
        code: string
        firstName: string
        lastName: string
        dateOfBirth: Date
        nationality: string
        gender: Gender
        height: number
        weight: number
        bio?: string
        disciplines: { code: string; currentRank?: number }[]
        sportType: SportType
    }): Promise<AthleteWithRelations> {
        // Use transaction to ensure data integrity
        return await prisma.$transaction(async (tx) => {
            // Create the athlete first
            const athlete = await tx.athlete.create({
                data: {
                    code: data.code,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth,
                    nationality: data.nationality,
                    gender: data.gender,
                    height: data.height,
                    weight: data.weight,
                    bio: data.bio,
                }
            });

            // Then add their disciplines
            for (const disciplineData of data.disciplines) {
                const discipline = await tx.discipline.findFirst({
                    where: {
                        code: disciplineData.code,
                        sport: { name: data.sportType }
                    }
                });

                if (discipline) {
                    await tx.athleteDiscipline.create({
                        data: {
                            athleteId: athlete.athleteId, // Fixed: use athleteId
                            disciplineId: discipline.disciplineId, // Fixed: use disciplineId
                            currentRank: disciplineData.currentRank,
                        }
                    });
                }
            }

            // Return athlete with relations
            return await tx.athlete.findUnique({
                where: { athleteId: athlete.athleteId },
                include: {
                    team: true,
                    position: true,
                    disciplines: {
                        include: {
                            discipline: true
                        }
                    }
                }
            }) as AthleteWithRelations;
        });
    }

    async update(athleteId: number, data: Partial<Omit<Athlete, 'athleteId' | 'createdAt' | 'updatedAt'>>): Promise<AthleteWithRelations> {
        return prisma.athlete.update({
            where: { athleteId: athleteId }, // Fixed: use athleteId
            data,
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async delete(athleteId: number): Promise<Athlete> {
        return prisma.athlete.delete({
            where: { athleteId: athleteId } // Fixed: use athleteId
        });
    }

    async findByTeam(teamCode: string): Promise<AthleteWithRelations[]> {
        return prisma.athlete.findMany({
            where: { teamCode: teamCode },
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async findByPosition(positionId: number): Promise<AthleteWithRelations[]> {
        return prisma.athlete.findMany({
            where: { positionId: positionId },
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async findBySport(sportType: SportType): Promise<AthleteWithRelations[]> {
        return prisma.athlete.findMany({
            where: {
                OR: [
                    // Team sport athletes
                    {
                        team: {
                            sport: { name: sportType }
                        }
                    },
                    // Individual sport athletes
                    {
                        disciplines: {
                            some: {
                                discipline: {
                                    sport: { name: sportType }
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async findByDiscipline(disciplineCode: string): Promise<AthleteWithRelations[]> {
        return prisma.athlete.findMany({
            where: {
                disciplines: {
                    some: {
                        discipline: { code: disciplineCode }
                    }
                }
            },
            include: {
                team: true,
                position: true,
                disciplines: {
                    include: {
                        discipline: true
                    }
                }
            }
        });
    }

    async updateDisciplineRank(athleteId: number, disciplineCode: string, newRank: number): Promise<AthleteDiscipline> {
        const discipline = await prisma.discipline.findFirst({
            where: { code: disciplineCode }
        });

        if (!discipline) {
            throw new Error(`Discipline ${disciplineCode} not found`);
        }

        return prisma.athleteDiscipline.update({
            where: {
                athleteId_disciplineId: {
                    athleteId: athleteId,
                    disciplineId: discipline.disciplineId
                }
            },
            data: { currentRank: newRank }
        });
    }

    async getAthleteStats(athleteId: number, seasonId?: number): Promise<any> {
        const whereClause: any = { athleteId: athleteId };
        if (seasonId) {
            whereClause.event = { seasonId: seasonId };
        }

        return prisma.performance.findMany({
            where: whereClause,
            include: {
                event: true,
                discipline: true
            },
            orderBy: { date: 'desc' }
        });
    }
}