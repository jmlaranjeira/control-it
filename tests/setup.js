// Test setup file
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for tests
process.env.USERNAME = 'testuser';
process.env.PASSWORD = 'testpass';
process.env.API_BASE_URL = 'https://test.api.com';
process.env.REPORTS_BASE_URL = 'https://test.reports.com';
process.env.DB_HOST = 'localhost';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'controlit_test';

// Mock fetch for tests
global.fetch = jest.fn();

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};