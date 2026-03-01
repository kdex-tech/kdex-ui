import { describe, expect, it } from 'vitest';
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

  it('should call onRouteActivated when active', () => {
    const el = document.createElement('app-element') as AppElement;
    el.appPath = '/test';
    el.active = true;
    expect(el.dataset.lastPath).toBe('/test');
  });
});