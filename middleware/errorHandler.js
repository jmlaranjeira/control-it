import { DateTime } from 'luxon';
import config from '../config.js';
import { logError } from '../utils/logger.js';

/**
 * Custom Error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error class for input validation errors
 */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Async error handler wrapper
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logError(err, req);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Validation middleware for date inputs
 */
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(new ValidationError('Start date and end date are required'));
  }

  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  if (!start.isValid || !end.isValid) {
    return next(new ValidationError('Invalid date format. Use YYYY-MM-DD format.'));
  }

  if (start > end) {
    return next(new ValidationError('Start date must be before or equal to end date'));
  }

  const today = DateTime.now();
  if (end > today) {
    return next(new ValidationError('End date cannot be in the future'));
  }

  if (start < today.minus({ years: config.maxDateRangeYears })) {
    return next(new ValidationError(`Start date cannot be more than ${config.maxDateRangeYears} year(s) in the past`));
  }

  // Add validated dates to request object
  req.validatedDates = { start, end, startISO: startDate, endISO: endDate };
  next();
};