import { appMeta } from './app-meta';
import { createBrowserHistory, History } from 'history';

class AppRouteItem {
  constructor(
    private config: {
      host: HTMLElement;
      id: string;
      label: string;
      path: string;
    }
  ) {
    this.host = config.host;
    this.id = config.id;
    this.label = config.label;
    this.path = config.path;
  }

  host: HTMLElement;
  id: string;
  label: string;
  path: string;
}

class AppRouteRegistry {
  private callbacks: ((items: AppRouteItem[]) => void)[] = [];
  private items: AppRouteItem[] = [];
  private history: History;
  private uniqueHosts: Set<HTMLElement> = new Set();

  constructor() {
    this.history = createBrowserHistory();

    this.history.listen(() => {
      this._navigateToAppRoutePath();
    });

    document.addEventListener("click", this._handleGlobalClick.bind(this));
    document.addEventListener("DOMContentLoaded", this._navigateToAppRoutePath.bind(this));
  }

  _navigateToAppRoutePath(): void {
    const currentRoute = this.currentRoutepath();
    if (!currentRoute) {
      return
    }

    for (const host of this.uniqueHosts) {
      const targetPath = host.id === currentRoute.id ? currentRoute.path : '';
      if (host.getAttribute('route-path') !== targetPath) {
        host.setAttribute('route-path', targetPath);
      }
    }
  }

  _refreshHosts(): void {
    this.uniqueHosts.clear();
    for (const item of this.items) {
      this.uniqueHosts.add(item.host);
    }
  }

  _handleGlobalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Walk up the DOM to find the anchor tag (handles clicks on <span> inside <a>)
    const link = target.closest('a');

    if (link && link.href.startsWith(document.location.origin + this.basepath() + appMeta.pathSeparator)) {
      event.preventDefault();
      const url = new URL(link.href);
      this.history.push(url.pathname);
    }
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

  currentRoutepath(): { id: string, label: string, path: string } | null {
    if (window.location.pathname.includes(appMeta.pathSeparator)) {
      const routePath = window.location.pathname.split(appMeta.pathSeparator, 2)[1];

      const [id, path] = routePath.split('/', 2);
      return {
        id,
        label: document.title,
        path: `/${path}`,
      };
    }

    return null;
  }

  findRoute(predicate: (item: AppRouteItem) => boolean): AppRouteItem | undefined {
    return this.items.find(predicate);
  }

  filterRoutes(predicate: (item: AppRouteItem) => boolean): Array<AppRouteItem> {
    return this.items.filter(predicate);
  }

  navigate(location: string): void {
    this.history.push(location);
  }

  onRoutesChanged(callback: (items: AppRouteItem[]) => void): void {
    this.callbacks.push(callback);
    callback(this.items)
  }

  registerRoutes(host: HTMLElement, ...paths: { label: string, path: string }[]): void {
    for (const path of paths) {
      this.items.push(new AppRouteItem({
        host,
        id: `${host.id}-${path.path}`,
        label: path.label,
        path: path.path,
      }));
    }
    this._refreshHosts();
    this.callbacks.forEach(callback => callback(this.items));
  }

  unregisterRoutes(host: HTMLElement): void {
    this.items = this.items.filter(item => item.host !== host);
    this._refreshHosts();
    this.callbacks.forEach(callback => callback(this.items));
  }
}

const appRouteRegistry = new AppRouteRegistry();
const navigate = appRouteRegistry.navigate.bind(appRouteRegistry)
const onRoutesChanged = appRouteRegistry.onRoutesChanged.bind(appRouteRegistry)

export {
  AppRouteItem,
  AppRouteRegistry,
  appRouteRegistry,
  navigate,
  onRoutesChanged
};
