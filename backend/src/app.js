/**
 * Express application setup: middleware, routes, error handling.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');
const { authRoutes, userRoutes, resumeRoutes, templateRoutes, coverLetterRoutes, jobTrackerRoutes } = require('./routes');

const app = express();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Security & parsing
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/resumes`, resumeRoutes);
app.use(`${API_PREFIX}/templates`, templateRoutes);
app.use(`${API_PREFIX}/cover-letters`, coverLetterRoutes);
app.use(`${API_PREFIX}/job-tracker`, jobTrackerRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
