import { Router } from "express";
import athleteRoutes from "./athlete.route";
import teamRoutes from "./team.route";
import performanceRoutes from "./performance.route";
import eventRoutes from "./event.route";
import seasonRoutes from "./season.route";
import gamedayRoutes from "./gameday.route";
import venueRoutes from "./venue.route";
import positionRoutes from "./position.route";
import disciplineRoutes from "./discipline.route";
import sportRoutes from "./sport.route";
import aiRoutes from "./ai.route";


const rootRouter: Router = Router()

// Core entity routes
rootRouter.use('/athletes', athleteRoutes)
rootRouter.use('/teams', teamRoutes)
rootRouter.use('/performances', performanceRoutes)
rootRouter.use('/events', eventRoutes)
rootRouter.use('/seasons', seasonRoutes)
rootRouter.use('/gamedays', gamedayRoutes)
rootRouter.use('/venues', venueRoutes)
rootRouter.use('/positions', positionRoutes)
rootRouter.use('/disciplines', disciplineRoutes)
rootRouter.use('/sports', sportRoutes)
rootRouter.use('/ai', aiRoutes)

export default rootRouter