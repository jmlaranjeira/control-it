import request from 'supertest';
import app from '../server.js';

describe('Server', () => {
  describe('GET /', () => {
    it('should return 200', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/health/live');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GET /health/cache', () => {
    it('should return cache statistics', async () => {
      const response = await request(app).get('/health/cache');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'cache_stats');
      expect(response.body).toHaveProperty('cache');
    });
  });

  describe('POST /submit', () => {
    it('should handle form submission', async () => {
      const response = await request(app)
        .post('/submit')
        .send('startDate=2023-01-01&endDate=2023-01-02&dryRun=on');
      expect(response.status).toBe(200);
    });

    it('should validate date range', async () => {
      const response = await request(app)
        .post('/submit')
        .send('startDate=invalid&endDate=2023-01-02');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/plain/);
      expect(response.text).toContain('# HELP');
    });
  });
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