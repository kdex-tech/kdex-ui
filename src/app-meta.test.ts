import { describe, expect, it, vi } from 'vitest';
import { appMeta, check, userState } from './app-meta';

describe('AppMeta', () => {
  it('should have correct configuration from head meta tag', () => {
    expect(appMeta.checkEndpoint).toBe('/-/check');
    expect(appMeta.loginEndpoint).toBe('/-/login');
    expect(appMeta.logoutEndpoint).toBe('/-/logout');
    expect(appMeta.navigationEndpoint).toBe('/-/navigation');
    expect(appMeta.pathSeparator).toBe('/-/');
    expect(appMeta.schemaEndpoint).toBe('/-/schema');
    expect(appMeta.stateEndpoint).toBe('/-/state');
    expect(appMeta.translationEndpoint).toBe('/-/translation');
  });

  it('should have collectiveEndpoints', () => {
    expect(appMeta.collectiveEndpoints).toContain('/-/check');
    expect(appMeta.collectiveEndpoints).toContain('/-/login');
    expect(appMeta.collectiveEndpoints).toContain('/-/logout');
  });

  it('should call fetch for check method', async () => {
    const mockResponse = [{ resource: 'res1', allowed: true, error: undefined }];
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await check({ action: 'read', resource: 'res1' });
    
    expect(global.fetch).toHaveBeenCalledWith('/-/check', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify([{ action: 'read', resource: 'res1' }])
    }));
    expect(result).toEqual(mockResponse);
  });

  it('should call fetch for userState method', async () => {
    const mockUser = { sub: 'user1', email: 'user@example.com', entitlements: [], roles: [] };
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockUser)
    } as Response);

    const result = await userState();
    
    expect(global.fetch).toHaveBeenCalledWith('/-/state', expect.objectContaining({
      method: 'GET'
    }));
    expect(result).toEqual(mockUser);
  });

  it('should return undefined for userState when 401 Unauthorized', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 401
    } as Response);

    const result = await userState();
    
    expect(result).toBeUndefined();
  });
});
