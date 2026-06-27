const request = require('supertest');
const app = require('../index');

// Mock mongoose to avoid real DB in tests
jest.mock('../config/database', () => jest.fn());
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

describe('Health Check', () => {
  it('GET /health should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('Auth Routes', () => {
  it('POST /api/auth/register - should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - should fail with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notanemail', password: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Protected Routes', () => {
  it('GET /api/sessions/user/123 - should require auth', async () => {
    const res = await request(app).get('/api/sessions/user/123');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/analytics/123 - should require auth', async () => {
    const res = await request(app).get('/api/analytics/123');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/insights/123 - should require auth', async () => {
    const res = await request(app).get('/api/insights/123');
    expect(res.statusCode).toBe(401);
  });
});

describe('Analytics Service Unit Tests', () => {
  const AnalyticsService = require('../services/analyticsService');

  it('should return empty analytics when no sessions', async () => {
    const Session = require('../models/Session');
    // Mock find to return empty
    jest.spyOn(Session, 'find').mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    const result = await AnalyticsService.computeAnalytics('mockUserId');
    expect(result.totalSessions).toBe(0);
    expect(result.avgAccuracy).toBe(0);
    expect(result.timeMasteryScore).toBe(0);
  });
});

describe('Perception Measurement Unit Tests', () => {
  const { computePerception } = require('../utils/perception');

  it('flags compressed time when the user underestimates', () => {
    const { ratio, direction } = computePerception(600, 300); // felt like 5m, was 10m
    expect(ratio).toBe(0.5);
    expect(direction).toBe('compressed');
  });

  it('flags expanded time when the user overestimates', () => {
    const { direction } = computePerception(300, 600); // felt like 10m, was 5m
    expect(direction).toBe('expanded');
  });

  it('scores a perfect estimate at 100 accuracy and calibrated', () => {
    const { accuracy, direction } = computePerception(300, 300);
    expect(accuracy).toBe(100);
    expect(direction).toBe('calibrated');
  });
});
