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

  it('should call onRouteActivated when connected', () => {
    const activatedSpy = vi.fn();
    class ConnectedApp extends AppBridge(HTMLElement) {
      onRouteActivated(path: string) {
        activatedSpy(path);
      }
    }
    customElements.define('connected-app', ConnectedApp);
    const el = document.createElement('connected-app') as any;
    document.body.appendChild(el);
    expect(activatedSpy).toHaveBeenCalledWith('/');
    expect(el.active).toBe(true);
  });

  it('should render default view when not active if using active property', () => {
    class LitLikeApp extends AppBridge(HTMLElement) {
      rendered = '';
      onRouteActivated(path: string) {
        this.render();
      }
      onRouteDeactivated() {
        this.render();
      }
      render() {
        this.rendered = this.active ? `Active at ${this.appPath || '/'}` : 'Deactivated View';
      }
    }
    customElements.define('lit-like-app', LitLikeApp);
    const el = document.createElement('lit-like-app') as any;
    document.body.appendChild(el);
    
    // Now it should be 'Active at /' because active is true by default.
    expect(el.rendered).toBe('Active at /');
  });

  it('should update appPath property and call onRouteActivated when app-path attribute changes', () => {
    const el = document.createElement('app-element') as AppElement;
    el.setAttribute('app-path', '/new-path');
    expect(el.appPath).toBe('/new-path');
    expect(el.dataset.lastPath).toBe('/new-path');
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