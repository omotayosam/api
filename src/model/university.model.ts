import { PrismaClient, University } from "@prisma/client";

interface CreateUniversityData {
    name: string;
    code: string;
    location: string;
}
const prisma = new PrismaClient();
export class UniversityModel {

    async findAll(): Promise<University[]> {
        return prisma.university.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async findById(universityId: number): Promise<University | null> {
        return prisma.university.findUnique({
            where: { universityId }
        });
    }

    async findByCode(code: string): Promise<University | null> {
        return prisma.university.findUnique({
            where: { code }
        });
    }

    async create(data: CreateUniversityData): Promise<University> {
        return prisma.university.create({
            data
        });
    }

    async update(universityId: number, data: Partial<CreateUniversityData>): Promise<University> {
        return prisma.university.update({
            where: { universityId },
            data
        });
    }

    async delete(universityId: number): Promise<University> {
        return prisma.university.delete({
            where: { universityId }
        });
    }

    async search(query: string): Promise<University[]> {
        return prisma.university.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { code: { contains: query, mode: 'insensitive' } },
                    { location: { contains: query, mode: 'insensitive' } }
                ]
            },
            orderBy: { name: 'asc' }
        });
    }
}