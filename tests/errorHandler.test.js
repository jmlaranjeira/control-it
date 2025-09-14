import request from 'supertest';
import express from 'express';
import { errorHandler, ValidationError, notFound, validateDateRange } from '../middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  test('should handle ValidationError correctly', () => {
    app.use((req, res, next) => {
      next(new ValidationError('Test validation error'));
    });
    app.use(errorHandler);

    return request(app)
      .get('/test')
      .expect(400)
      .then(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Test validation error');
      });
  });

  test('should handle 404 errors', () => {
    app.use(notFound);
    app.use(errorHandler);

    return request(app)
      .get('/nonexistent')
      .expect(404)
      .then(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Not found');
      });
  });

  test('should handle generic errors', () => {
    app.use((req, res, next) => {
      next(new Error('Generic error'));
    });
    app.use(errorHandler);

    return request(app)
      .get('/test')
      .expect(500)
      .then(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Generic error');
      });
  });
});

describe('Date Validation Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.urlencoded({ extended: true }));
  });

  test('should pass valid date range', () => {
    app.post('/test', validateDateRange, (req, res) => {
      res.json({ success: true, dates: req.validatedDates });
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return request(app)
      .post('/test')
      .send({
        startDate: yesterday.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      })
      .expect(200)
      .then(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.dates).toBeDefined();
      });
  });

  test('should reject missing dates', () => {
    app.post('/test', validateDateRange, (req, res) => {
      res.json({ success: true });
    });
    app.use(errorHandler);

    return request(app)
      .post('/test')
      .send({})
      .expect(400)
      .then(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('required');
      });
  });

  test('should reject invalid date format', () => {
    app.post('/test', validateDateRange, (req, res) => {
      res.json({ success: true });
    });
    app.use(errorHandler);

    return request(app)
      .post('/test')
      .send({
        startDate: 'invalid-date',
        endDate: '2023-12-31'
      })
      .expect(400)
      .then(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Invalid date format');
      });
  });

  test('should reject future end date', () => {
    app.post('/test', validateDateRange, (req, res) => {
      res.json({ success: true });
    });
    app.use(errorHandler);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    return request(app)
      .post('/test')
      .send({
        startDate: '2023-01-01',
        endDate: futureDate.toISOString().split('T')[0]
      })
      .expect(400)
      .then(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('cannot be in the future');
      });
  });
});