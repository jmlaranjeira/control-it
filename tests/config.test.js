describe('Basic Config Tests', () => {
  it('should have basic config structure', () => {
    expect(process.env.USERNAME).toBe('testuser');
    expect(process.env.PASSWORD).toBe('testpass');
    expect(process.env.API_BASE_URL).toMatch(/^https?:\/\//);
  });

  it('should have test database config', () => {
    expect(process.env.DB_HOST).toBe('localhost');
    expect(process.env.DB_PASSWORD).toBe('test_password');
    expect(process.env.DB_NAME).toBe('controlit_test');
  });
});

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should load default values when environment variables are not set', () => {
    // Clear environment variables
    delete process.env.CONTROLIT_USERNAME;
    delete process.env.CONTROLIT_PASSWORD;

    // Re-import config to get fresh values
    const freshConfig = jest.requireActual('../config.js').default;

    expect(freshConfig.username).toBe('');
    expect(freshConfig.password).toBe('');
    expect(freshConfig.apiBaseUrl).toBe('https://api.controlit.es/api');
  });

  test('should load environment variables when set', () => {
    process.env.CONTROLIT_USERNAME = 'testuser';
    process.env.CONTROLIT_PASSWORD = 'testpass';
    process.env.CONTROLIT_API_BASE_URL = 'https://test.api.com/api';

    const freshConfig = jest.requireActual('../config.js').default;

    expect(freshConfig.username).toBe('testuser');
    expect(freshConfig.password).toBe('testpass');
    expect(freshConfig.apiBaseUrl).toBe('https://test.api.com/api');
  });

  test('should have correct work schedule configuration', () => {
    const workSchedule = config.workSchedule;

    expect(workSchedule.winter.start.hour).toBe(8);
    expect(workSchedule.winter.length.hours).toBe(8);
    expect(workSchedule.lunch.start.hour).toBe(14);
    expect(workSchedule.summer.length.hours).toBe(7);
  });

  test('should have correct summer schedule dates', () => {
    expect(config.summerStartDay).toBe(15);
    expect(config.summerStartMonth).toBe(6);
    expect(config.summerEndDay).toBe(15);
    expect(config.summerEndMonth).toBe(9);
  });
});