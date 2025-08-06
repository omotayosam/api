// src/models/gameday.model.ts

import { Gameday, GamedayStatus, PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export class GamedayModel {
    async findAll(filter?: { status?: GamedayStatus; seasonId?: number }): Promise<Gameday[]> {
        return prisma.gameday.findMany({
            where: {
                ...(filter?.status === GamedayStatus.UPCOMING && { isNext: true }),
                ...(filter?.status === GamedayStatus.ACTIVE && { isCurrent: true }),
                ...(filter?.status === GamedayStatus.COMPLETED && { isPrevious: true })
            },
            include: {
                events: true
            },
            orderBy: {
                gameNumber: 'asc'
            }
        });
    }

    async findById(id: number): Promise<Gameday | null> {
        return prisma.gameday.findUnique({
            where: { gamedayId: id },
            include: {
                events: true
            }
        });
    }

    async create(data: {
        name: string;
        seasonId: number;
        //startDate: Date;
        scheduledDate: Date;
    }): Promise<Gameday> {
        return prisma.gameday.create({
            data: {
                name: data.name,
                seasonId: data.seasonId,
                //startDate: data.startDate,
                scheduledDate: data.scheduledDate,
                isNext: true
            }
        });
    }



    async update(id: number, data: Partial<Gameday>): Promise<Gameday> {
        return prisma.gameday.update({
            where: { gamedayId: id },
            data
        });
    }


    async completeGameday(id: number): Promise<Gameday> {
        return prisma.gameday.update({
            where: { gamedayId: id },
            data: {
                isPrevious: true,
                isCurrent: false,
                finished: true
            }
        });
    }


    async addEventsToGameday(gamedayId: number, eventIds: number[]): Promise<void> {
        // Update all specified events to be associated with this gameday
        await prisma.event.updateMany({
            where: {
                eventId: {
                    in: eventIds
                }
            },
            data: {
                gamedayId
            }
        });
    }
}
