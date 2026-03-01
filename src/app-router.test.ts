import { describe, expect, it, vi, beforeEach } from 'vitest';
import { appRouter, navigate } from './app-route';

describe('AppRouter', () => {
  beforeEach(() => {
    // Reset window.location
    vi.stubGlobal('location', {
      pathname: '/',
      origin: 'http://localhost'
    });
    // Clear the body and templates
    document.body.innerHTML = '';
  });

  it('should compute correct basepath', () => {
    vi.stubGlobal('location', { pathname: '/base/-/app/path' });
    expect(appRouter.basepath()).toBe('/base');

    vi.stubGlobal('location', { pathname: '/base/' });
    expect(appRouter.basepath()).toBe('/base');

    vi.stubGlobal('location', { pathname: '/root' });
    expect(appRouter.basepath()).toBe('/root');
  });

  it('should parse currentAppRoute from URL', () => {
    vi.stubGlobal('location', { pathname: '/base/-/main/app1/sub/path' });
    const route = appRouter.currentAppRoute();
    expect(route).toEqual({
      viewport: 'main',
      appId: 'app1',
      appPath: '/sub/path'
    });
  });

  it('should parse currentAppRoute from URL with viewport', () => {
    vi.stubGlobal('location', { pathname: '/base/-/side/app2/' });
    const route = appRouter.currentAppRoute();
    expect(route).toEqual({
      viewport: 'side',
      appId: 'app2',
      appPath: '/'
    });
  });

  it('should navigate and update history', () => {
    vi.stubGlobal('location', { pathname: '/base' });
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    navigate({ appId: 'test-app', appPath: '/some-path', viewport: 'main' });
    
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/base/-/main/test-app/some-path');
  });

  it('should handle navigation correctly when appPath does not start with /', () => {
    vi.stubGlobal('location', { pathname: '/base' });
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    navigate({ appId: 'test-app', appPath: 'some-path', viewport: 'main' });
    
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/base/-/main/test-app/some-path');
  });

  it('should register and hot-swap apps', () => {
    const viewport = document.createElement('div');
    viewport.setAttribute('data-viewport', 'main');
    document.body.appendChild(viewport);

    // Initial setup
    vi.stubGlobal('location', { pathname: '/base/-/main/app-1/path' });
    appRouter.registerApp('app-1', '<div data-content-id="app-1">Original</div>');
    // Force the router to recognize the current route after registration
    (appRouter as any)._navigateToAppRoutePath();
    
    // Check if it's mounted
    expect(viewport.innerHTML).toContain('Original');
    const appEl = viewport.querySelector('[data-content-id="app-1"]');
    expect(appEl).not.toBeNull();
    expect(appEl?.getAttribute('app-path')).toBe('/path');

    // Register update
    appRouter.registerApp('app-1', '<div data-content-id="app-1">Updated</div>');
    
    // Check if it's updated
    expect(viewport.innerHTML).toContain('Updated');
    const updatedAppEl = viewport.querySelector('[data-content-id="app-1"]');
    expect(updatedAppEl?.getAttribute('app-path')).toBe('/path');
  });

  it('should fallback to 404 when app is not found', () => {
    const viewport = document.createElement('div');
    viewport.setAttribute('data-viewport', 'main');
    document.body.appendChild(viewport);

    appRouter.registerApp('404', '<div data-content-id="404">Not Found</div>');

    vi.stubGlobal('location', { pathname: '/base/-/main/missing-app/' });
    // Manually trigger navigation logic since we are just stubbing location
    (appRouter as any)._navigateToAppRoutePath();

    expect(viewport.innerHTML).toContain('Not Found');
  });

  it('should dispatch events on route change', () => {
    const viewport = document.createElement('div');
    viewport.setAttribute('data-viewport', 'main');
    document.body.appendChild(viewport);

    appRouter.registerApp('app-1', '<div data-content-id="app-1">App 1</div>');
    appRouter.registerApp('app-2', '<div data-content-id="app-2">App 2</div>');

    vi.stubGlobal('location', { pathname: '/base/-/main/app-1/' });
    (appRouter as any)._navigateToAppRoutePath();

    const app1El = viewport.querySelector('[data-content-id="app-1"]');
    const deactivatedSpy = vi.fn();
    app1El?.addEventListener('app-route-deactivated', deactivatedSpy);

    vi.stubGlobal('location', { pathname: '/base/-/main/app-2/' });
    (appRouter as any)._navigateToAppRoutePath();

    expect(deactivatedSpy).toHaveBeenCalled();
    expect(viewport.querySelector('[data-content-id="app-2"]')).not.toBeNull();
  });

  it('should intercept local links', () => {
    vi.stubGlobal('location', { 
      pathname: '/base',
      origin: 'http://localhost'
    });
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    const link = document.createElement('a');
    link.href = 'http://localhost/base/-/main/app-1/path';
    document.body.appendChild(link);
    
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    link.dispatchEvent(event);
    
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/base/-/main/app-1/path');
    expect(event.defaultPrevented).toBe(true);
  });

  it('should not intercept links to collective endpoints', () => {
    vi.stubGlobal('location', { 
      pathname: '/base',
      origin: 'http://localhost'
    });
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    const link = document.createElement('a');
    link.href = 'http://localhost/-/login'; // Assuming this is in collectiveEndpoints
    document.body.appendChild(link);
    
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    link.dispatchEvent(event);
    
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('should trigger navigation on manual pushState', () => {
    const navigateSpy = vi.spyOn(appRouter as any, '_navigateToAppRoutePath');
    
    window.history.pushState({}, '', '/base/-/main/app-manual/');
    
    expect(navigateSpy).toHaveBeenCalled();
  });
});
