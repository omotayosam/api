// src/routes/event.route.ts
import { Router } from 'express';
import { EventController } from '../controllers/event.controller';

const router: Router = Router();
const eventController = new EventController();

// Event CRUD operations
router.post('/', eventController.createEvent.bind(eventController));
router.get('/', eventController.getAllEvents.bind(eventController));
router.get('/:id', eventController.getEventById.bind(eventController));
router.put('/:id', eventController.updateEvent.bind(eventController));
router.delete('/:id', eventController.deleteEvent.bind(eventController));

// Event status management
router.patch('/:id/status', eventController.updateEventStatus.bind(eventController));

// Event queries by different criteria
router.get('/sport/:sportType', eventController.getEventsBySport.bind(eventController));
router.get('/season/:seasonId', eventController.getEventsBySeason.bind(eventController));
router.get('/gameday/:gamedayId', eventController.getEventsByGameday.bind(eventController));

// Special event queries
router.get('/upcoming', eventController.getUpcomingEvents.bind(eventController));
router.get('/active', eventController.getActiveEvents.bind(eventController));

export default router; 