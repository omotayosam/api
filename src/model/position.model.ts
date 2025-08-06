import { Position, Prisma, PrismaClient } from "@prisma/client";

interface CreatePositionData {
    name: string;
    code: string;
    sportId: number;
    description?: string;
}
const prisma = new PrismaClient();


export class PositionModel {

    async findAll(sportId?: number): Promise<Position[]> {
        const where: Prisma.PositionWhereInput = {};
        if (sportId) where.sportId = sportId;

        return prisma.position.findMany({
            where,
            include: {
                sport: true,
                athletes: {
                    where: { isActive: true },
                    include: { team: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findById(positionId: number): Promise<Position | null> {
        return prisma.position.findUnique({
            where: { positionId },
            include: {
                sport: true,
                athletes: {
                    include: { team: true }
                }
            }
        });
    }

    async findBySport(sportId: number): Promise<Position[]> {
        return prisma.position.findMany({
            where: { sportId },
            include: {
                sport: true,
                athletes: {
                    where: { isActive: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async create(data: CreatePositionData): Promise<Position> {
        // Verify sport exists and is a team sport
        const sport = await prisma.sport.findUnique({
            where: { sportId: data.sportId }
        });

        if (!sport) {
            throw new Error('Sport not found');
        }

        if (!sport.isTeamSport) {
            throw new Error('Positions can only be created for team sports');
        }

        return prisma.position.create({
            data,
            include: {
                sport: true,
                athletes: true
            }
        });
    }

    async update(positionId: number, data: Partial<CreatePositionData>): Promise<Position> {
        return prisma.position.update({
            where: { positionId },
            data: {
                name: data.name,
                description: data.description
                // code and sportId should not be updated
            },
            include: {
                sport: true,
                athletes: true
            }
        });
    }

    async delete(positionId: number): Promise<Position> {
        // Check if position has athletes
        const athleteCount = await prisma.athlete.count({
            where: { positionId, isActive: true }
        });

        if (athleteCount > 0) {
            throw new Error('Cannot delete position with active athletes');
        }

        return prisma.position.delete({
            where: { positionId },
            include: {
                sport: true,
                athletes: true
            }
        });
    }

    async getPositionStats(positionId: number): Promise<{
        position: Position | null;
        totalAthletes: number;
        activeAthletes: number;
    }> {
        const position = await this.findById(positionId);

        if (!position) {
            return {
                position: null,
                totalAthletes: 0,
                activeAthletes: 0
            };
        }

        const [totalAthletes, activeAthletes] = await Promise.all([
            prisma.athlete.count({ where: { positionId } }),
            prisma.athlete.count({ where: { positionId, isActive: true } })
        ]);

        return {
            position,
            totalAthletes,
            activeAthletes
        };
    }
}
