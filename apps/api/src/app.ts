import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware } from './middlewares/error.middleware';

// Routes
import { authRoutes } from './modules/auth/auth.routes';
import { homeRoutes } from './modules/home/home.routes';
import { userRoutes } from './modules/user/user.routes';
import { transactionRoutes } from './modules/transaction/transaction.routes';
import { categoryRoutes } from './modules/category/category.routes';
import { creditCardRoutes } from './modules/credit-card/credit-card.routes';
import { loanRoutes } from './modules/loan/loan.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger JSON endpoint (must be before swagger-ui)
app.get('/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI docs
// @ts-expect-error - swagger-ui-express types mismatch with express
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/loans', loanRoutes);

// Error handler
app.use(errorMiddleware);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Route not found',
  });
});

export { app };
