# Athlete Management System API Documentation

This API provides comprehensive management for athletes across multiple sports including Basketball, Football, Athletics, Wrestling, and Boxing.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints require proper authentication (to be implemented).

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

## Error Response Format

```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error message"
}
```

---

## Athletes

### Get All Athletes

```
GET /athletes
```

### Get Athlete by ID

```
GET /athletes/:id
```

### Create Athlete

```
POST /athletes
```

**Body:**

```json
{
    "code": "ATH001",
    "firstName": "John",
    "lastName": "Doe",
    "teamCode": "TEAM001", // Optional for team sports
    "dateOfBirth": "1995-01-01",
    "nationality": "USA",
    "gender": "MALE",
    "height": 180, // in cm
    "weight": 75.5, // in kg
    "bio": "Professional athlete",
    "positionId": 1, // Required for team sports
    "isActive": true
}
```

### Update Athlete

```
PUT /athletes/:id
```

### Delete Athlete

```
DELETE /athletes/:id
```

### Get Athlete by Code

```
GET /athletes/code/:code
```

### Get Athletes by Team

```
GET /athletes/team/:teamCode
```

### Get Athletes by Sport

```
GET /athletes/sport/:sportId
```

---

## Teams

### Get All Teams

```
GET /teams
```

### Get Team by ID

```
GET /teams/:id
```

### Create Team

```
POST /teams
```

**Body:**

```json
{
    "code": "TEAM001",
    "name": "Lakers",
    "sportId": 1
}
```

### Update Team

```
PUT /teams/:id
```

### Delete Team

```
DELETE /teams/:id
```

### Get Teams by Sport

```
GET /teams/sport/:sportId
```

### Add Team Member

```
POST /teams/members
```

**Body:**

```json
{
    "teamId": 1,
    "athleteId": 1
}
```

### Remove Team Member

```
DELETE /teams/members/:memberId
```

---

## Performances

### Get All Performances

```
GET /performances
```

### Get Performance by ID

```
GET /performances/:id
```

### Create Performance

```
POST /performances
```

**Body:**

```json
{
    "athleteId": 1,
    "eventId": 1,
    "disciplineId": 1, // Required for individual sports
    "date": "2025-01-15",
    "position": 1,
    "points": 100,

    // Track and Field specific
    "time": 10.5, // in seconds
    "distance": 100, // in meters
    "height": 2.1, // in meters

    // Team sports common
    "minutesPlayed": 90,

    // Football specific
    "goalsScored": 2,
    "goalsConceded": 0,
    "yellowCards": 1,
    "redCards": 0,
    "assists": 1,
    "saves": 5,

    // Basketball specific
    "twoPoints": 5,
    "threePoints": 3,
    "freeThrows": 2,
    "fieldGoals": 8,
    "rebounds": 10,
    "steals": 2,
    "blocks": 1,
    "turnovers": 3,

    // Wrestling specific
    "wins": 1,
    "losses": 0,
    "pins": 1,
    "technicalFalls": 0,
    "decisions": 0,

    // Boxing specific
    "rounds": 12,
    "knockouts": 1,
    "knockdowns": 2,
    "punchesLanded": 150,
    "punchesThrown": 300,

    "notes": "Excellent performance",
    "isPersonalBest": false,
    "isSeasonBest": false
}
```

### Update Performance

```
PUT /performances/:id
```

### Delete Performance

```
DELETE /performances/:id
```

### Bulk Create Performances

```
POST /performances/bulk
```

### Get Performances by Athlete

```
GET /performances/athlete/:athleteId
```

### Get Personal Bests

```
GET /performances/athlete/:athleteId/personal-bests
```

### Get Season Bests

```
GET /performances/athlete/:athleteId/season/:seasonId/bests
```

### Get Athlete Performance Summary

```
GET /performances/athlete/:athleteId/summary
```

### Get Event Results

```
GET /performances/event/:eventId/results
```

### Get Top Performances

```
GET /performances/discipline/:disciplineId/top?limit=10&seasonId=1
```

### Get Discipline Records

```
GET /performances/discipline/:disciplineId/records?recordType=all-time&seasonId=1
```

### Get Team Stats

```
GET /performances/team/:teamCode/event/:eventId/stats
```

### Get Performances by Sport

```
GET /performances/sport/:sportType
```

### Compare Athletes

```
POST /performances/compare
```

**Body:**

```json
{
    "athleteIds": [1, 2, 3],
    "disciplineId": 1,
    "seasonId": 1
}
```

### Get Performance Trends

```
GET /performances/athlete/:athleteId/discipline/:disciplineId/trends?timeframe=season
```

---

## Events

### Get All Events

```
GET /events
```

### Get Event by ID

```
GET /events/:id
```

### Create Event

```
POST /events
```

**Body:**

```json
{
    "name": "2025 Indoor Championship",
    "code": "IND2025",
    "sportId": 1,
    "year": 2025,
    "seasonId": 1,
    "gamedayId": 1,
    "venueId": 1,
    "gender": "MALE",
    "startDate": "2025-01-15T09:00:00Z",
    "endDate": "2025-01-15T17:00:00Z",
    "location": "Main Stadium",
    "description": "Annual indoor championship",
    "status": "SCHEDULED"
}
```

### Update Event

```
PUT /events/:id
```

### Delete Event

```
DELETE /events/:id
```

### Update Event Status

```
PATCH /events/:id/status
```

**Body:**

```json
{
    "status": "LIVE"
}
```

### Get Events by Sport

```
GET /events/sport/:sportType
```

### Get Events by Season

```
GET /events/season/:seasonId
```

### Get Events by Gameday

```
GET /events/gameday/:gamedayId
```

### Get Upcoming Events

```
GET /events/upcoming?limit=10
```

### Get Active Events

```
GET /events/active
```

---

## Seasons

### Get All Seasons

```
GET /seasons
```

### Get Season by ID

```
GET /seasons/:id
```

### Create Season

```
POST /seasons
```

**Body:**

```json
{
    "name": "2025 Season",
    "seasonType": "REGULAR",
    "startYear": 2025,
    "endYear": 2025,
    "isActive": true
}
```

### Update Season

```
PUT /seasons/:id
```

### Delete Season

```
DELETE /seasons/:id
```

### Get Active Season

```
GET /seasons/active
```

### Set Active Season

```
PATCH /seasons/:id/activate
```

### Get Seasons by Year

```
GET /seasons/year/:year
```

---

## Gamedays

### Get All Gamedays

```
GET /gamedays
```

### Get Gameday by ID

```
GET /gamedays/:id
```

### Create Gameday

```
POST /gamedays
```

**Body:**

```json
{
    "name": "Week 1",
    "gameNumber": 1,
    "seasonId": 1,
    "scheduledDate": "2025-01-15T09:00:00Z"
}
```

### Update Gameday

```
PUT /gamedays/:id
```

### Delete Gameday

```
DELETE /gamedays/:id
```

### Get Gamedays by Season

```
GET /gamedays/season/:seasonId
```

### Get Current Gameday

```
GET /gamedays/current?seasonId=1
```

### Get Next Gameday

```
GET /gamedays/next?seasonId=1
```

### Get Previous Gameday

```
GET /gamedays/previous?seasonId=1
```

### Set Current Gameday

```
PATCH /gamedays/:id/set-current
```

### Finish Gameday

```
PATCH /gamedays/:id/finish
```

---

## Venues

### Get All Venues

```
GET /venues
```

### Get Venue by ID

```
GET /venues/:id
```

### Create Venue

```
POST /venues
```

**Body:**

```json
{
    "name": "Main Stadium",
    "address": "123 Sports Ave",
    "city": "Los Angeles",
    "capacity": 50000,
    "isHome": true
}
```

### Update Venue

```
PUT /venues/:id
```

### Delete Venue

```
DELETE /venues/:id
```

### Get Venues by City

```
GET /venues/city/:city
```

### Get Home Venues

```
GET /venues/home
```

### Search Venues

```
GET /venues/search?q=stadium
```

---

## Positions

### Get All Positions

```
GET /positions
```

### Get Position by ID

```
GET /positions/:id
```

### Create Position

```
POST /positions
```

**Body:**

```json
{
    "name": "Point Guard",
    "code": "PG",
    "sportId": 1,
    "description": "Primary ball handler"
}
```

### Update Position

```
PUT /positions/:id
```

### Delete Position

```
DELETE /positions/:id
```

### Get Positions by Sport

```
GET /positions/sport/:sportId
```

---

## Disciplines

### Get All Disciplines

```
GET /disciplines
```

### Get Discipline by ID

```
GET /disciplines/:id
```

### Create Discipline

```
POST /disciplines
```

**Body:**

```json
{
    "name": "100m Sprint",
    "code": "100M",
    "sportId": 1,
    "description": "100 meter sprint",
    "unit": "seconds"
}
```

### Update Discipline

```
PUT /disciplines/:id
```

### Delete Discipline

```
DELETE /disciplines/:id
```

### Get Disciplines by Sport

```
GET /disciplines/sport/:sportId
```

### Get Discipline Athletes

```
GET /disciplines/:disciplineId/athletes
```

### Add Athlete to Discipline

```
POST /disciplines/athletes
```

**Body:**

```json
{
    "disciplineId": 1,
    "athleteId": 1,
    "currentRank": 1
}
```

### Remove Athlete from Discipline

```
DELETE /disciplines/:disciplineId/athletes/:athleteId
```

### Update Athlete Rank

```
PATCH /disciplines/:disciplineId/athletes/:athleteId/rank
```

**Body:**

```json
{
    "currentRank": 2
}
```

---

## Sports

### Get All Sports

```
GET /sports
```

### Get Sport by ID

```
GET /sports/:id
```

### Create Sport

```
POST /sports
```

**Body:**

```json
{
    "name": "BASKETBALL",
    "isTeamSport": true
}
```

### Create Discipline for Sport

```
POST /sports/:sportId/disciplines
```

### Get Disciplines by Sport

```
GET /sports/:sportId/disciplines
```

---

## Data Models

### Athlete

-   `athleteId` (integer, primary key)
-   `code` (string, unique)
-   `firstName` (string)
-   `lastName` (string)
-   `teamCode` (string, optional - for team sports)
-   `dateOfBirth` (date)
-   `nationality` (string)
-   `gender` (enum: MALE, FEMALE, OTHER)
-   `height` (integer, cm)
-   `weight` (float, kg)
-   `bio` (string, optional)
-   `isActive` (boolean)
-   `positionId` (integer, optional - for team sports)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Performance

-   `performanceId` (integer, primary key)
-   `athleteId` (integer, foreign key)
-   `eventId` (integer, foreign key)
-   `disciplineId` (integer, foreign key, optional)
-   `date` (datetime)
-   `position` (integer, optional)
-   `points` (float, optional)
-   `time` (float, optional - for track events)
-   `distance` (float, optional - for field events)
-   `height` (float, optional - for jumping events)
-   `minutesPlayed` (integer, optional - for team sports)
-   `goalsScored` (integer, optional - for football)
-   `goalsConceded` (integer, optional - for football)
-   `yellowCards` (integer, optional - for football)
-   `redCards` (integer, optional - for football)
-   `assists` (integer, optional - for team sports)
-   `saves` (integer, optional - for football goalkeepers)
-   `twoPoints` (integer, optional - for basketball)
-   `threePoints` (integer, optional - for basketball)
-   `freeThrows` (integer, optional - for basketball)
-   `fieldGoals` (integer, optional - for basketball)
-   `rebounds` (integer, optional - for basketball)
-   `steals` (integer, optional - for basketball)
-   `blocks` (integer, optional - for basketball)
-   `turnovers` (integer, optional - for basketball)
-   `wins` (integer, optional - for wrestling)
-   `losses` (integer, optional - for wrestling)
-   `pins` (integer, optional - for wrestling)
-   `technicalFalls` (integer, optional - for wrestling)
-   `decisions` (integer, optional - for wrestling)
-   `rounds` (integer, optional - for boxing)
-   `knockouts` (integer, optional - for boxing)
-   `knockdowns` (integer, optional - for boxing)
-   `punchesLanded` (integer, optional - for boxing)
-   `punchesThrown` (integer, optional - for boxing)
-   `notes` (string, optional)
-   `isPersonalBest` (boolean)
-   `isSeasonBest` (boolean)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Event

-   `eventId` (integer, primary key)
-   `name` (string)
-   `code` (string, unique)
-   `sportId` (integer, foreign key)
-   `year` (integer)
-   `seasonId` (integer, foreign key)
-   `gamedayId` (integer, foreign key)
-   `venueId` (integer, foreign key, optional)
-   `gender` (enum, optional)
-   `startDate` (datetime)
-   `endDate` (datetime, optional)
-   `location` (string, optional)
-   `description` (string, optional)
-   `isActive` (boolean)
-   `status` (enum: SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELED, SUSPENDED)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Team

-   `teamId` (integer, primary key)
-   `code` (string, unique)
-   `name` (string)
-   `sportId` (integer, foreign key)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Season

-   `seasonId` (integer, primary key)
-   `name` (string, unique)
-   `seasonType` (enum: SPRING, FALL, SUMMER, INDOOR, OUTDOOR, REGULAR, PLAYOFF)
-   `startYear` (integer)
-   `endYear` (integer)
-   `isActive` (boolean)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Gameday

-   `gamedayId` (integer, primary key)
-   `name` (string)
-   `gameNumber` (integer, optional)
-   `finished` (boolean)
-   `isPrevious` (boolean)
-   `isCurrent` (boolean)
-   `isNext` (boolean)
-   `seasonId` (integer, foreign key)
-   `scheduledDate` (datetime, optional)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Venue

-   `venueId` (integer, primary key)
-   `name` (string)
-   `address` (string, optional)
-   `city` (string, optional)
-   `capacity` (integer, optional)
-   `isHome` (boolean)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### Position

-   `positionId` (integer, primary key)
-   `name` (string)
-   `code` (string)
-   `sportId` (integer, foreign key)
-   `description` (string, optional)

### Discipline

-   `disciplineId` (integer, primary key)
-   `name` (string)
-   `code` (string)
-   `sportId` (integer, foreign key)
-   `description` (string, optional)
-   `unit` (string, optional)

### Sport

-   `sportId` (integer, primary key)
-   `name` (enum: BASKETBALL, FOOTBALL, ATHLETICS, WRESTLING, BOXING)
-   `isTeamSport` (boolean)
-   `createdAt` (datetime)
-   `updatedAt` (datetime)

### AthleteDiscipline (Junction Table)

-   `id` (integer, primary key)
-   `athleteId` (integer, foreign key)
-   `disciplineId` (integer, foreign key)
-   `currentRank` (integer, optional)

---

## Usage Examples

### Creating a Basketball Player

```bash
curl -X POST http://localhost:3000/api/athletes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BASK001",
    "firstName": "LeBron",
    "lastName": "James",
    "teamCode": "LAKERS",
    "dateOfBirth": "1984-12-30",
    "nationality": "USA",
    "gender": "MALE",
    "height": 206,
    "weight": 113.4,
    "bio": "Professional basketball player",
    "positionId": 1,
    "isActive": true
  }'
```

### Recording a Basketball Performance

```bash
curl -X POST http://localhost:3000/api/performances \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": 1,
    "eventId": 1,
    "date": "2025-01-15",
    "minutesPlayed": 35,
    "twoPoints": 8,
    "threePoints": 2,
    "freeThrows": 4,
    "rebounds": 10,
    "assists": 8,
    "steals": 2,
    "blocks": 1,
    "turnovers": 3,
    "position": 1,
    "points": 30
  }'
```

### Recording a Track Performance

```bash
curl -X POST http://localhost:3000/api/performances \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": 2,
    "eventId": 2,
    "disciplineId": 1,
    "date": "2025-01-15",
    "time": 10.2,
    "position": 1,
    "isPersonalBest": true,
    "isSeasonBest": true
  }'
```

---

## Error Codes

-   `400` - Bad Request (Invalid input data)
-   `404` - Not Found (Resource not found)
-   `409` - Conflict (Resource already exists)
-   `500` - Internal Server Error

---

## Notes

1. **Team Sports vs Individual Sports**:

    - Team sports (Basketball, Football) require `positionId` and `teamCode`
    - Individual sports (Athletics, Wrestling, Boxing) use `disciplineId` and `currentRank`

2. **Performance Tracking**:

    - Each sport has specific performance metrics
    - Personal and season bests are automatically calculated
    - Performance trends and comparisons are available

3. **Event Management**:

    - Events can be scheduled, live, or finished
    - Events are organized by seasons and gamedays
    - Venues can be assigned to events

4. **Data Integrity**:
    - Foreign key constraints ensure data consistency
    - Soft deletes are used where appropriate
    - Validation prevents invalid data entry
