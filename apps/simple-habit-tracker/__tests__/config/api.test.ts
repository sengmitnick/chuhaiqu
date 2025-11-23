import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

describe('API Configuration', () => {
  it('should have a valid API base URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('should have health endpoint defined', () => {
    expect(API_ENDPOINTS.health).toBeDefined();
    expect(API_ENDPOINTS.health).toContain('/api/v1/health');
  });

  it('should construct correct health endpoint URL', () => {
    expect(API_ENDPOINTS.health).toBe(`${API_BASE_URL}/api/v1/health`);
  });
});
