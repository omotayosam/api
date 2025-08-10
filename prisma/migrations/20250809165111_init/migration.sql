-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SportType" AS ENUM ('BASKETBALL', 'FOOTBALL', 'ATHLETICS', 'WRESTLING', 'BOXING');

-- CreateEnum
CREATE TYPE "public"."TeamSportType" AS ENUM ('BASKETBALL', 'FOOTBALL');

-- CreateEnum
CREATE TYPE "public"."IndividualSportType" AS ENUM ('ATHLETICS', 'WRESTLING', 'BOXING');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."SeasonType" AS ENUM ('SPRING', 'FALL', 'SUMMER', 'INDOOR', 'OUTDOOR', 'REGULAR', 'PLAYOFF');

-- CreateEnum
CREATE TYPE "public"."GamedayStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."sports" (
    "sport_id" SERIAL NOT NULL,
    "name" "public"."SportType" NOT NULL,
    "is_team_sport" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("sport_id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "team_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "public"."positions" (
    "position_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "public"."disciplines" (
    "discipline_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "description" TEXT,
    "unit" TEXT,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("discipline_id")
);

-- CreateTable
CREATE TABLE "public"."athletes" (
    "athlete_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "team_code" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bio" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "position_id" INTEGER,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("athlete_id")
);

-- CreateTable
CREATE TABLE "public"."athlete_disciplines" (
    "id" SERIAL NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "discipline_id" INTEGER NOT NULL,
    "current_rank" INTEGER,

    CONSTRAINT "athlete_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seasons" (
    "season_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "season_type" "public"."SeasonType" NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("season_id")
);

-- CreateTable
CREATE TABLE "public"."gamedays" (
    "gameday_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "game_number" INTEGER,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "is_previous" BOOLEAN NOT NULL DEFAULT false,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "is_next" BOOLEAN NOT NULL DEFAULT false,
    "season_id" INTEGER NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gamedays_pkey" PRIMARY KEY ("gameday_id")
);

-- CreateTable
CREATE TABLE "public"."venues" (
    "venue_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "capacity" INTEGER,
    "is_home" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("venue_id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "event_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "season_id" INTEGER NOT NULL,
    "gameday_id" INTEGER NOT NULL,
    "venue_id" INTEGER,
    "gender" "public"."Gender",
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."performances" (
    "performance_id" SERIAL NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "discipline_id" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "position" INTEGER,
    "points" DOUBLE PRECISION,
    "time" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "minutes_played" INTEGER,
    "goals_scored" INTEGER,
    "goals_conceded" INTEGER,
    "yellow_cards" INTEGER,
    "red_cards" INTEGER,
    "assists" INTEGER,
    "saves" INTEGER,
    "two_points" INTEGER,
    "three_points" INTEGER,
    "free_throws" INTEGER,
    "field_goals" INTEGER,
    "rebounds" INTEGER,
    "steals" INTEGER,
    "blocks" INTEGER,
    "turnovers" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "pins" INTEGER,
    "technical_falls" INTEGER,
    "decisions" INTEGER,
    "rounds" INTEGER,
    "knockouts" INTEGER,
    "knockdowns" INTEGER,
    "punches_landed" INTEGER,
    "punches_thrown" INTEGER,
    "notes" TEXT,
    "is_personal_best" BOOLEAN NOT NULL DEFAULT false,
    "is_season_best" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performances_pkey" PRIMARY KEY ("performance_id")
);

-- CreateTable
CREATE TABLE "public"."universities" (
    "university_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("university_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sports_name_key" ON "public"."sports"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_code_key" ON "public"."teams"("code");

-- CreateIndex
CREATE INDEX "teams_sport_id_idx" ON "public"."teams"("sport_id");

-- CreateIndex
CREATE INDEX "positions_sport_id_idx" ON "public"."positions"("sport_id");

-- CreateIndex
CREATE UNIQUE INDEX "positions_code_sport_id_key" ON "public"."positions"("code", "sport_id");

-- CreateIndex
CREATE INDEX "disciplines_sport_id_idx" ON "public"."disciplines"("sport_id");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_code_sport_id_key" ON "public"."disciplines"("code", "sport_id");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_code_key" ON "public"."athletes"("code");

-- CreateIndex
CREATE INDEX "athletes_team_code_idx" ON "public"."athletes"("team_code");

-- CreateIndex
CREATE INDEX "athletes_is_active_idx" ON "public"."athletes"("is_active");

-- CreateIndex
CREATE INDEX "athletes_code_idx" ON "public"."athletes"("code");

-- CreateIndex
CREATE INDEX "athlete_disciplines_discipline_id_current_rank_idx" ON "public"."athlete_disciplines"("discipline_id", "current_rank");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_disciplines_athlete_id_discipline_id_key" ON "public"."athlete_disciplines"("athlete_id", "discipline_id");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_name_key" ON "public"."seasons"("name");

-- CreateIndex
CREATE INDEX "seasons_is_active_idx" ON "public"."seasons"("is_active");

-- CreateIndex
CREATE INDEX "seasons_start_year_end_year_idx" ON "public"."seasons"("start_year", "end_year");

-- CreateIndex
CREATE INDEX "gamedays_season_id_idx" ON "public"."gamedays"("season_id");

-- CreateIndex
CREATE INDEX "gamedays_is_current_idx" ON "public"."gamedays"("is_current");

-- CreateIndex
CREATE INDEX "gamedays_is_next_idx" ON "public"."gamedays"("is_next");

-- CreateIndex
CREATE UNIQUE INDEX "events_code_key" ON "public"."events"("code");

-- CreateIndex
CREATE INDEX "events_sport_id_idx" ON "public"."events"("sport_id");

-- CreateIndex
CREATE INDEX "events_season_id_idx" ON "public"."events"("season_id");

-- CreateIndex
CREATE INDEX "events_gameday_id_idx" ON "public"."events"("gameday_id");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "public"."events"("status");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "public"."events"("start_date");

-- CreateIndex
CREATE INDEX "performances_athlete_id_event_id_idx" ON "public"."performances"("athlete_id", "event_id");

-- CreateIndex
CREATE INDEX "performances_event_id_idx" ON "public"."performances"("event_id");

-- CreateIndex
CREATE INDEX "performances_date_idx" ON "public"."performances"("date");

-- CreateIndex
CREATE INDEX "performances_is_personal_best_idx" ON "public"."performances"("is_personal_best");

-- CreateIndex
CREATE INDEX "performances_is_season_best_idx" ON "public"."performances"("is_season_best");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "public"."universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "universities_code_key" ON "public"."universities"("code");

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("sport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."positions" ADD CONSTRAINT "positions_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("sport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."disciplines" ADD CONSTRAINT "disciplines_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("sport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athletes" ADD CONSTRAINT "athletes_team_code_fkey" FOREIGN KEY ("team_code") REFERENCES "public"."teams"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athletes" ADD CONSTRAINT "athletes_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("position_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athlete_disciplines" ADD CONSTRAINT "athlete_disciplines_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."athlete_disciplines" ADD CONSTRAINT "athlete_disciplines_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "public"."disciplines"("discipline_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gamedays" ADD CONSTRAINT "gamedays_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("season_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("sport_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("season_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_gameday_id_fkey" FOREIGN KEY ("gameday_id") REFERENCES "public"."gamedays"("gameday_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("venue_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performances" ADD CONSTRAINT "performances_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("athlete_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performances" ADD CONSTRAINT "performances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performances" ADD CONSTRAINT "performances_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "public"."disciplines"("discipline_id") ON DELETE SET NULL ON UPDATE CASCADE;
