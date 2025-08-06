// src/enums/index.ts

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum SportType {
    BASKETBALL = 'BASKETBALL',
    FOOTBALL = 'FOOTBALL',
    ATHLETICS = 'ATHLETICS',
    WRESTLING = 'WRESTLING',
    BOXING = 'BOXING',
}

export enum TeamSportType {
    BASKETBALL = 'BASKETBALL',
    FOOTBALL = 'FOOTBALL',
}

export enum IndividualSportType {
    ATHLETICS = 'ATHLETICS',
    WRESTLING = 'WRESTLING',
    BOXING = 'BOXING',
}

export enum EventStatus {
    SCHEDULED = 'SCHEDULED',
    LIVE = 'LIVE',
    FINISHED = 'FINISHED',
    POSTPONED = 'POSTPONED',
    CANCELED = 'CANCELED',
    SUSPENDED = 'SUSPENDED',
}

export enum SeasonType {
    SPRING = 'SPRING',
    FALL = 'FALL',
    SUMMER = 'SUMMER',
    INDOOR = 'INDOOR',
    OUTDOOR = 'OUTDOOR',
    REGULAR = 'REGULAR',
    PLAYOFF = 'PLAYOFF',
}

export enum GamedayStatus {
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
}

export enum EventType {
    TOURNAMENT = "TOURNAMENT",
    LEAGUE = "LEAGUE",
    CHAMPIONSHIP = "CHAMPIONSHIP",
    FRIENDLY = "FRIENDLY",
    QUALIFIER = "QUALIFIER",
    EXHIBITION = "EXHIBITION",
}