describe('Config', () => {
  let config;

  beforeEach(async () => {
    // Clear module cache to get fresh config
    delete require.cache[require.resolve('../config.js')];
    config = (await import('../config.js')).default;
  });

  it('should have required properties', () => {
    expect(config).toHaveProperty('username');
    expect(config).toHaveProperty('password');
    expect(config).toHaveProperty('apiBaseUrl');
    expect(config).toHaveProperty('reportsBaseUrl');
  });

  it('should have valid URLs', () => {
    expect(config.apiBaseUrl).toMatch(/^https?:\/\//);
    expect(config.reportsBaseUrl).toMatch(/^https?:\/\//);
  });

  it('should have default values for optional properties', () => {
    expect(config).toHaveProperty('jitterMinutes');
    expect(config).toHaveProperty('workSchedule');
    expect(config).toHaveProperty('summerStartDay');
    expect(config).toHaveProperty('summerStartMonth');
  });

  it('should have valid work schedule configuration', () => {
    expect(config.workSchedule).toHaveProperty('winter');
    expect(config.workSchedule).toHaveProperty('summer');
    expect(config.workSchedule).toHaveProperty('lunch');

    expect(config.workSchedule.winter).toHaveProperty('start');
    expect(config.workSchedule.winter).toHaveProperty('length');
    expect(config.workSchedule.summer).toHaveProperty('start');
    expect(config.workSchedule.summer).toHaveProperty('length');
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