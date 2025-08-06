import express from 'express';
import rootRouter from './routes/routes';


const app = express();

// ... other middleware and route setup ...

// Register all routes
app.use('/api', rootRouter);

// ... rest of your app setup ... 