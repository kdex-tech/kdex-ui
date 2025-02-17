import {appMeta} from './app-meta';
import {createBrowserHistory, History} from 'history';

class AppRouteItem {
  constructor(
    private config: {
      host?: HTMLElement;
      id: string;
      path: string;
    }
  ) {
    this.host = config.host;
    this.id = config.id;
    this.path = config.path;
  }

  host?: HTMLElement;
  id: string;
  path: string;
}

class AppRouteRegistry {
  private items: AppRouteItem[] = [];
  private callbacks: ((items: AppRouteItem[]) => void)[] = [];
  private history: History;

  constructor() {
    this.history = createBrowserHistory();

    this.history.listen(() => {
      this._navigateToAppRoutePath();
    });

    document.addEventListener("DOMContentLoaded", this._resetNavigationLinks.bind(this));
    document.addEventListener("DOMContentLoaded", this._navigateToAppRoutePath.bind(this));
  }

  _navigateToAppRoutePath(): void {
    const currentRoute = this.currentRoutepath();
    const apps = new Set(this.getItems().map(item => item.host).filter(host => host !== undefined));

    for (const app of apps) {
      if (currentRoute && app.id === currentRoute.id) {
        app.setAttribute('route-path', `/${currentRoute.path}`);
      }
      else {
        app.setAttribute('route-path', '');
      }
    }
  }

  _resetNavigationLinks(): void {
    for (let link of document.querySelectorAll('a')) {
      if (link.href.startsWith(document.location.origin + this.basepath() + appMeta.pathSeparator)) {
        const url = new URL(link.href);
        link.onclick = () => {
          this.history.push(url.pathname);
          return false;
        };
        link.href = 'javascript:void(0)';
      }
    }
  }

  addItem(item: AppRouteItem): void {
    this.items.push(item);
    this.callbacks.forEach(callback => callback(this.items));
  }

  basepath(): string {
    if (window.location.pathname.includes(appMeta.pathSeparator)) {
      return window.location.pathname.split(appMeta.pathSeparator, 2)[0];
    }
    if (window.location.pathname.endsWith('/')) {
      return window.location.pathname.slice(0, -1);
    }
    return window.location.pathname;
  }

  currentRoutepath(): AppRouteItem | null {
    if (window.location.pathname.includes(appMeta.pathSeparator)) {
      const routePath = window.location.pathname.split(appMeta.pathSeparator, 2)[1];

      const [id, path] = routePath.split('/', 2);
      return new AppRouteItem({
        id,
        path,
      });
    }

    return null;
  }

  findItem(id: string, path: string): AppRouteItem | null {
    return this.items.find(item => item.id === id && item.path === path) || null;
  }

  getItems(): AppRouteItem[] {
    return this.items;
  }

  navigate(location: string): void {
    this.history.push(location);
  }

  onItemAdded(callback: (items: AppRouteItem[]) => void): void {
    this.callbacks.push(callback);
  }

  registerRoutes(host: HTMLElement, ...paths: string[]): void {
    for (const path of paths) {
      this.addItem(new AppRouteItem({
        host,
        id: host.id,
        path,
      }));
    }
  }

  removeItem(item: AppRouteItem): void {
    this.items = this.items.filter(i => i !== item);
    this.callbacks.forEach(callback => callback(this.items));
  }
}

const appRouteRegistry = new AppRouteRegistry();

export {
  AppRouteItem,
  AppRouteRegistry,
  appRouteRegistry,
};
