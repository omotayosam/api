// src/routes/venue.route.ts
import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller';

const router: Router = Router();
const venueController = new VenueController();

// Venue CRUD operations
router.post('/', venueController.createVenue.bind(venueController));
router.get('/', venueController.getAllVenues.bind(venueController));
router.get('/:id', venueController.getVenueById.bind(venueController));
router.put('/:id', venueController.updateVenue.bind(venueController));
router.delete('/:id', venueController.deleteVenue.bind(venueController));

// Venue queries
//router.get('/city/:city', venueController.getVenuesByCity.bind(venueController));
router.get('/home', venueController.getHomeVenues.bind(venueController));
//router.get('/search', venueController.searchVenues.bind(venueController));

export default router; 