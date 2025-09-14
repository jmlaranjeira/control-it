import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock the logic module
jest.mock('../logic.js', () => ({
  getRegisteredDays: jest.fn(),
}));

import app from '../server.js';
import { getRegisteredDays } from '../logic.js';

describe('Server Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('should render index page successfully', async () => {
      // Mock the getRegisteredDays function
      getRegisteredDays.mockResolvedValue([
        { date: '2023-01-01', status: 'registered', isHoliday: false },
        { date: '2023-01-02', status: 'pending', isHoliday: false },
      ]);

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('Registro de Horas');
      expect(getRegisteredDays).toHaveBeenCalled();
    });

    test('should handle errors gracefully', async () => {
      getRegisteredDays.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/')
        .expect(500);

      expect(response.text).toContain('Error al cargar el calendario');
    });
  });

  describe('POST /submit', () => {
    test('should reject requests without dates', async () => {
      const response = await request(app)
        .post('/submit')
        .send({})
        .expect(400);

      expect(response.text).toContain('Start date and end date are required');
    });

    test('should reject invalid date formats', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          startDate: 'invalid-date',
          endDate: '2023-12-31'
        })
        .expect(400);

      expect(response.text).toContain('Invalid date format');
    });

    test('should reject future end dates', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post('/submit')
        .send({
          startDate: '2023-01-01',
          endDate: futureDate.toISOString().split('T')[0]
        })
        .expect(400);

      expect(response.text).toContain('cannot be in the future');
    });
  });
});