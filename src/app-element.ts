import { AppContainerElement } from './app-container';
import { appMeta } from './app-meta';
import { appRouteRegistry } from './app-route';

class AppElement extends HTMLElement {
  public routePath: string | null = null;

  constructor() {
    super();

    const parent = this.parentElement;
    if (!(parent instanceof AppContainerElement)) {
      throw new Error('Parent AppContainerElement not found');
    }
  }

  static get observedAttributes(): string[] {
    return ['route-path'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'route-path') {
      this.routePath = newValue;
    }
    this.connectedCallback();
  }

  basepath(): string {
    return appRouteRegistry.basepath();
  }

  connectedCallback(): void {
    // Default implementation - can be overridden by subclasses
  }

  navigate(path: string): void {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    appRouteRegistry.navigate(`${this.basepath()}${appMeta.pathSeparator}${this.id}${path}`);
  }

  registerRoutes(...paths: string[]): void {
    if (this.id) {
      appRouteRegistry.registerRoutes(this, ...paths);
    }
  }
}

export {
  AppElement,
};
