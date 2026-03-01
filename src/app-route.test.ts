import { describe, expect, it, vi } from 'vitest';
import { AppBridge } from './app-route';

class AppElement extends AppBridge(HTMLElement) {
  onRouteActivated(path: string) {
    this.dataset.lastPath = path;
  }
}

if (!customElements.get('app-element')) {
  customElements.define('app-element', AppElement);
}

describe('AppBridge Integration', () => {
  it('should upgrade correctly', () => {
    const el = document.createElement('app-element') as AppElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect('active' in el).toBe(true);
  });

  it('should call onRouteActivated when active property is set', () => {
    const el = document.createElement('app-element') as AppElement;
    el.appPath = '/test';
    el.active = true;
    expect(el.dataset.lastPath).toBe('/test');
  });

  it('should update active property when active-route attribute changes', () => {
    const el = document.createElement('app-element') as AppElement;
    el.setAttribute('active-route', '');
    expect(el.active).toBe(true);
    
    el.removeAttribute('active-route');
    expect(el.active).toBe(false);
  });

  it('should update appPath property when app-path attribute changes', () => {
    const el = document.createElement('app-element') as AppElement;
    el.setAttribute('app-path', '/new-path');
    expect(el.appPath).toBe('/new-path');
  });

  it('should call onRouteDeactivated when active set to false', () => {
    const deactivatedSpy = vi.fn();
    class DeactivateApp extends AppBridge(HTMLElement) {
      onRouteDeactivated() {
        deactivatedSpy();
      }
    }
    customElements.define('deactivate-app', DeactivateApp);
    const el = document.createElement('deactivate-app') as any;
    el.active = true;
    el.active = false;
    expect(deactivatedSpy).toHaveBeenCalled();
  });

  it('should provide navigate method', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const el = document.createElement('app-element') as AppElement;
    el.setAttribute('data-content-id', 'test-app');
    
    const viewport = document.createElement('div');
    viewport.setAttribute('data-viewport', 'main');
    viewport.appendChild(el);
    document.body.appendChild(viewport);

    el.navigate('/nav-path');
    
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', expect.stringContaining('/main/test-app/nav-path'));
  });
});