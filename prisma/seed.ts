// setup-database.ts
// Run this script to initialize your database with seed data

import { PrismaClient, SportType, Gender } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDatabase() {
    try {
        console.log('Starting database seeding...')

        // Create Sports (use upsert to handle existing data)
        const basketball = await prisma.sport.upsert({
            where: { name: SportType.BASKETBALL },
            update: {},
            create: {
                name: SportType.BASKETBALL,
                isTeamSport: true,
            }
        })

        const football = await prisma.sport.upsert({
            where: { name: SportType.FOOTBALL },
            update: {},
            create: {
                name: SportType.FOOTBALL,
                isTeamSport: true,
            }
        })

        const athletics = await prisma.sport.upsert({
            where: { name: SportType.ATHLETICS },
            update: {},
            create: {
                name: SportType.ATHLETICS,
                isTeamSport: false,
            }
        })

        const wrestling = await prisma.sport.upsert({
            where: { name: SportType.WRESTLING },
            update: {},
            create: {
                name: SportType.WRESTLING,
                isTeamSport: false,
            }
        })

        const boxing = await prisma.sport.upsert({
            where: { name: SportType.BOXING },
            update: {},
            create: {
                name: SportType.BOXING,
                isTeamSport: false,
            }
        })

        console.log('Sports created:', { basketball: basketball.sportId, football: football.sportId, athletics: athletics.sportId })

        // Create Basketball Positions
        const basketballPositions = [
            { name: 'Point Guard', code: 'PG' },
            { name: 'Shooting Guard', code: 'SG' },
            { name: 'Small Forward', code: 'SF' },
            { name: 'Power Forward', code: 'PF' },
            { name: 'Center', code: 'C' },
        ];

        for (const position of basketballPositions) {
            await prisma.position.upsert({
                where: { code_sportId: { code: position.code, sportId: basketball.sportId } },
                update: {},
                create: {
                    name: position.name,
                    code: position.code,
                    sportId: basketball.sportId,
                }
            });
        }

        // Create Football Positions
        const footballPositions = [
            { name: 'Goalkeeper', code: 'GK' },
            { name: 'Defender', code: 'DEF' },
            { name: 'Midfielder', code: 'MID' },
            { name: 'Forward', code: 'FWD' },
        ];

        for (const position of footballPositions) {
            await prisma.position.upsert({
                where: { code_sportId: { code: position.code, sportId: football.sportId } },
                update: {},
                create: {
                    name: position.name,
                    code: position.code,
                    sportId: football.sportId,
                }
            });
        }

        // Create Athletics Disciplines
        const athleticsDisciplines = [
            { name: '100 Meters', code: '100M', unit: 'seconds' },
            { name: '200 Meters', code: '200M', unit: 'seconds' },
            { name: '400 Meters', code: '400M', unit: 'seconds' },
            { name: '800 Meters', code: '800M', unit: 'seconds' },
            { name: '1500 Meters', code: '1500M', unit: 'seconds' },
            { name: '110m Hurdles', code: '110H', unit: 'seconds' },
            { name: 'Long Jump', code: 'LJ', unit: 'meters' },
            { name: 'High Jump', code: 'HJ', unit: 'meters' },
            { name: 'Shot Put', code: 'SP', unit: 'meters' },
            { name: 'Javelin', code: 'JAV', unit: 'meters' },
        ];

        for (const discipline of athleticsDisciplines) {
            await prisma.discipline.upsert({
                where: { code_sportId: { code: discipline.code, sportId: athletics.sportId } },
                update: {},
                create: {
                    name: discipline.name,
                    code: discipline.code,
                    sportId: athletics.sportId,
                    unit: discipline.unit,
                }
            });
        }

        // Create Wrestling Disciplines
        const wrestlingDisciplines = [
            { name: '57kg Freestyle', code: '57KG_FS' },
            { name: '61kg Freestyle', code: '61KG_FS' },
            { name: '65kg Freestyle', code: '65KG_FS' },
            { name: '70kg Freestyle', code: '70KG_FS' },
            { name: '74kg Freestyle', code: '74KG_FS' },
        ];

        for (const discipline of wrestlingDisciplines) {
            await prisma.discipline.upsert({
                where: { code_sportId: { code: discipline.code, sportId: wrestling.sportId } },
                update: {},
                create: {
                    name: discipline.name,
                    code: discipline.code,
                    sportId: wrestling.sportId,
                }
            });
        }

        // Create Boxing Disciplines
        const boxingDisciplines = [
            { name: 'Flyweight', code: 'FLY' },
            { name: 'Bantamweight', code: 'BAN' },
            { name: 'Featherweight', code: 'FEA' },
            { name: 'Lightweight', code: 'LIG' },
            { name: 'Welterweight', code: 'WEL' },
        ];

        for (const discipline of boxingDisciplines) {
            await prisma.discipline.upsert({
                where: { code_sportId: { code: discipline.code, sportId: boxing.sportId } },
                update: {},
                create: {
                    name: discipline.name,
                    code: discipline.code,
                    sportId: boxing.sportId,
                }
            });
        }

        // Create Teams
        const teams = [
            { code: 'BBT001', name: 'University Eagles Basketball' },
            { code: 'FBT001', name: 'University Eagles Football' },
        ];

        for (const team of teams) {
            await prisma.team.upsert({
                where: { code: team.code },
                update: {},
                create: {
                    code: team.code,
                    name: team.name,
                    sportId: team.code === 'BBT001' ? basketball.sportId : football.sportId,
                }
            });
        }

        // Create test events
        const events = [
            {
                name: '2025 Indoor Track Championship',
                code: '2025_INDOOR_TF',
                sportId: athletics.sportId,
                year: 2025,
                startDate: new Date('2025-03-15'),
                endDate: new Date('2025-03-17'),
                location: 'University Sports Complex',
                description: 'Annual indoor track and field championship'
            },
            {
                name: '2025 Basketball Season Opener',
                code: '2025_BB_OPENER',
                sportId: basketball.sportId,
                year: 2025,
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-15'),
                location: 'University Arena',
                description: 'Season opening basketball game'
            },
            {
                name: '2025 Football Championship',
                code: '2025_FB_CHAMP',
                sportId: football.sportId,
                year: 2025,
                startDate: new Date('2025-05-20'),
                endDate: new Date('2025-05-20'),
                location: 'University Stadium',
                description: 'Annual football championship game'
            }
        ];

        for (const eventData of events) {
            // Create season for each event
            const season = await prisma.season.upsert({
                where: {
                    name: `${eventData.year} Regular Season`
                },
                update: {},
                create: {
                    name: `${eventData.year} Regular Season`,
                    seasonType: 'REGULAR',
                    startYear: eventData.year,
                    endYear: eventData.year,
                    isActive: true
                }
            });

            // Create gameday for each event
            const gameday = await prisma.gameday.create({
                data: {
                    name: `Gameday ${eventData.startDate.toDateString()}`,
                    scheduledDate: eventData.startDate,
                    seasonId: season.seasonId
                }
            });

            // Create the event
            await prisma.event.upsert({
                where: { code: eventData.code },
                update: {},
                create: {
                    name: eventData.name,
                    code: eventData.code,
                    sportId: eventData.sportId,
                    seasonId: season.seasonId,
                    gamedayId: gameday.gamedayId,
                    year: eventData.year,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                    location: eventData.location,
                    description: eventData.description,
                }
            });
        }

        console.log('Database seeded successfully!')
        console.log('Created sports:', [basketball.name, football.name, athletics.name, wrestling.name, boxing.name])
    } catch (error) {
        console.error('Error seeding database:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Example usage functions
export class SportsDatabase {
    constructor(private prisma: PrismaClient) { }

    // Create a team sport athlete (Basketball/Football)
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
    }) {
        const position = await this.prisma.position.findFirst({
            where: {
                code: data.positionCode,
                sport: { name: data.sportType }
            }
        })

        if (!position) {
            throw new Error(`Position ${data.positionCode} not found for ${data.sportType}`)
        }

        return await this.prisma.athlete.create({
            data: {
                code: data.code,
                firstName: data.firstName,
                lastName: data.lastName,
                teamCode: data.teamCode,
                positionId: position.positionId,
                dateOfBirth: data.dateOfBirth,
                nationality: data.nationality,
                gender: data.gender,
                height: data.height,
                weight: data.weight,
                bio: data.bio,
            }
        })
    }

    // Create an individual sport athlete with disciplines
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
    }) {
        // First create the athlete
        const athlete = await this.prisma.athlete.create({
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
        })

        // Then add their disciplines
        for (const disciplineData of data.disciplines) {
            const discipline = await this.prisma.discipline.findFirst({
                where: {
                    code: disciplineData.code,
                    sport: { name: data.sportType }
                }
            })

            if (discipline) {
                await this.prisma.athleteDiscipline.create({
                    data: {
                        athleteId: athlete.athleteId,
                        disciplineId: discipline.disciplineId,
                        currentRank: disciplineData.currentRank,
                    }
                })
            }
        }

        return athlete
    }

    // Create an event
    async createEvent(data: {
        name: string
        code: string
        sportType: SportType
        year: number
        season?: string
        gender?: Gender
        startDate: Date
        endDate?: Date
        location?: string
        description?: string
    }) {
        const sport = await this.prisma.sport.findUnique({
            where: { name: data.sportType }
        })

        if (!sport) {
            throw new Error(`Sport ${data.sportType} not found`)
        }

        // Create a default season if needed
        const season = await this.prisma.season.create({
            data: {
                name: `${data.year} ${data.season || 'Regular'} Season`,
                seasonType: 'REGULAR',
                startYear: data.year,
                endYear: data.year,
                isActive: true
            }
        })

        // Create a default gameday if needed
        const gameday = await this.prisma.gameday.create({
            data: {
                name: `Gameday ${data.startDate.toDateString()}`,
                scheduledDate: data.startDate,
                seasonId: season.seasonId
            }
        })

        return await this.prisma.event.create({
            data: {
                name: data.name,
                code: data.code,
                sportId: sport.sportId,
                seasonId: season.seasonId,
                gamedayId: gameday.gamedayId,
                year: data.year,
                gender: data.gender,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                description: data.description,
            }
        })
    }

    // Record track and field performance
    async recordTrackFieldPerformance(data: {
        athleteCode: string
        eventCode: string
        disciplineCode: string
        date: Date
        time?: number // in seconds
        distance?: number // in meters
        height?: number // in meters
        position?: number
        isPersonalBest?: boolean
        isSeasonBest?: boolean
        notes?: string
    }) {
        const athlete = await this.prisma.athlete.findUnique({
            where: { code: data.athleteCode }
        })
        const event = await this.prisma.event.findUnique({
            where: { code: data.eventCode }
        })
        const discipline = await this.prisma.discipline.findFirst({
            where: { code: data.disciplineCode }
        })

        if (!athlete || !event || !discipline) {
            throw new Error('Athlete, event, or discipline not found')
        }

        return await this.prisma.performance.create({
            data: {
                athleteId: athlete.athleteId,
                eventId: event.eventId,
                disciplineId: discipline.disciplineId,
                date: data.date,
                time: data.time,
                distance: data.distance,
                height: data.height,
                position: data.position,
                isPersonalBest: data.isPersonalBest || false,
                isSeasonBest: data.isSeasonBest || false,
                notes: data.notes,
            }
        })
    }

    // Record football performance
    async recordFootballPerformance(data: {
        athleteCode: string
        eventCode: string
        date: Date
        minutesPlayed?: number
        goalsScored?: number
        goalsConceded?: number
        yellowCards?: number
        redCards?: number
        assists?: number
        saves?: number
        notes?: string
    }) {
        const athlete = await this.prisma.athlete.findUnique({
            where: { code: data.athleteCode }
        })
        const event = await this.prisma.event.findUnique({
            where: { code: data.eventCode }
        })

        if (!athlete || !event) {
            throw new Error('Athlete or event not found')
        }

        return await this.prisma.performance.create({
            data: {
                athleteId: athlete.athleteId,
                eventId: event.eventId,
                date: data.date,
                minutesPlayed: data.minutesPlayed,
                goalsScored: data.goalsScored,
                goalsConceded: data.goalsConceded,
                yellowCards: data.yellowCards,
                redCards: data.redCards,
                assists: data.assists,
                saves: data.saves,
                notes: data.notes,
            }
        })
    }

    // Record basketball performance
    async recordBasketballPerformance(data: {
        athleteCode: string
        eventCode: string
        date: Date
        minutesPlayed?: number
        twoPoints?: number
        threePoints?: number
        freeThrows?: number
        fieldGoals?: number
        rebounds?: number
        assists?: number
        steals?: number
        blocks?: number
        turnovers?: number
        points?: number
        notes?: string
    }) {
        const athlete = await this.prisma.athlete.findUnique({
            where: { code: data.athleteCode }
        })
        const event = await this.prisma.event.findUnique({
            where: { code: data.eventCode }
        })

        if (!athlete || !event) {
            throw new Error('Athlete or event not found')
        }

        return await this.prisma.performance.create({
            data: {
                athleteId: athlete.athleteId,
                eventId: event.eventId,
                date: data.date,
                minutesPlayed: data.minutesPlayed,
                twoPoints: data.twoPoints,
                threePoints: data.threePoints,
                freeThrows: data.freeThrows,
                fieldGoals: data.fieldGoals,
                rebounds: data.rebounds,
                assists: data.assists,
                steals: data.steals,
                blocks: data.blocks,
                turnovers: data.turnovers,
                points: data.points,
                notes: data.notes,
            }
        })
    }

    // Get athlete with all their information
    async getAthleteDetails(athleteCode: string) {
        return await this.prisma.athlete.findUnique({
            where: { code: athleteCode },
            include: {
                team: {
                    include: {
                        sport: true
                    }
                },
                position: true,
                disciplines: {
                    include: {
                        discipline: {
                            include: {
                                sport: true
                            }
                        }
                    }
                },
                performances: {
                    include: {
                        event: true,
                        discipline: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        })
    }

    // Get leaderboard for a specific discipline
    async getDisciplineLeaderboard(disciplineCode: string, limit: number = 10) {
        const discipline = await this.prisma.discipline.findFirst({
            where: { code: disciplineCode },
            include: { sport: true }
        })

        if (!discipline) {
            throw new Error(`Discipline ${disciplineCode} not found`)
        }

        // For time-based events, order by time ASC (fastest first)
        // For distance/height events, order by distance/height DESC (furthest/highest first)
        let orderBy: any = {}

        if (discipline.unit === 'seconds') {
            orderBy = { time: 'asc' }
        } else if (discipline.unit === 'meters') {
            orderBy = [{ distance: 'desc' }, { height: 'desc' }]
        }

        return await this.prisma.performance.findMany({
            where: {
                disciplineId: discipline.disciplineId,
                OR: [
                    { time: { not: null } },
                    { distance: { not: null } },
                    { height: { not: null } }
                ]
            },
            include: {
                athlete: true,
                event: true
            },
            orderBy,
            take: limit
        })
    }
}

// Usage examples
async function examples() {
    const db = new SportsDatabase(prisma)

    // Create a basketball player
    const basketballPlayer = await db.createTeamAthlete({
        code: 'ATH001',
        firstName: 'John',
        lastName: 'Smith',
        teamCode: 'BBT001',
        positionCode: 'PG',
        sportType: SportType.BASKETBALL,
        dateOfBirth: new Date('2003-05-15'),
        nationality: 'USA',
        gender: Gender.MALE,
        height: 185,
        weight: 80.5,
        bio: 'Promising point guard with excellent court vision'
    })

    // Create a track and field athlete
    const trackAthlete = await db.createIndividualAthlete({
        code: 'ATH002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: new Date('2002-08-22'),
        nationality: 'USA',
        gender: Gender.FEMALE,
        height: 170,
        weight: 60.0,
        disciplines: [
            { code: '100M', currentRank: 3 },
            { code: '200M', currentRank: 5 }
        ],
        sportType: SportType.ATHLETICS
    })

    // Create an event
    const event = await db.createEvent({
        name: '2025 Indoor Track Championship',
        code: '2025_INDOOR_TF',
        sportType: SportType.ATHLETICS,
        year: 2025,
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-03-17'),
        location: 'University Sports Complex'
    })

    console.log('Examples completed successfully!')
}

// Run the seed function
seedDatabase()
    .then(() => {
        console.log('Seed completed successfully!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Seed failed:', error)
        process.exit(1)
    })
