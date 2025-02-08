import {createBrowserHistory, History} from 'history';

class AppMeta {
  public readonly pathSeparator: string;
  public readonly loginPath: string;
  public readonly logoutPath: string;
  public readonly loginLabel: string;
  public readonly logoutLabel: string;
  public readonly loginCssQuery: string;
  public readonly logoutCssQuery: string;
  public readonly loggedIn: boolean;

  constructor() {
    const kdexUIMeta = document.querySelector('html head meta[name="kdex-ui"]');

    if (!kdexUIMeta) {
      throw new Error('kdex-ui meta tag not found');
    }

    this.pathSeparator = kdexUIMeta.getAttribute('data-path-separator') || '/_/';
    this.loginPath = kdexUIMeta.getAttribute('data-login-path') || '/~/o/login';
    this.logoutPath = kdexUIMeta.getAttribute('data-logout-path') || '/~/o/logout';
    this.loginLabel = kdexUIMeta.getAttribute('data-login-label') || 'Login';
    this.logoutLabel = kdexUIMeta.getAttribute('data-logout-label') || 'Logout';
    this.loginCssQuery = kdexUIMeta.getAttribute('data-login-css-query') || 'nav.nav .nav-dropdown a.login';
    this.logoutCssQuery = kdexUIMeta.getAttribute('data-logout-css-query') || 'nav.nav .nav-dropdown a.logout';
    this.loggedIn = kdexUIMeta.getAttribute('data-logged-in') !== 'false';

    document.addEventListener("DOMContentLoaded", this._setLoginLogoutLinks.bind(this));
  }

  _setLoginLogoutLinks(): void {
    if (this.loggedIn) {
      const logoutLink = document.querySelector(this.logoutCssQuery);

      if (logoutLink) {
        logoutLink.textContent = this.logoutLabel;
        if (logoutLink instanceof HTMLAnchorElement) {
          logoutLink.href = this.logoutPath;
        }
        else {
          logoutLink.addEventListener('click', () => {
            const url = new URL(window.location.href);
            url.pathname = this.logoutPath;
            window.location.href = url.toString();
          });
        }
      }
    }
    else {
      const loginLink = document.querySelector(this.loginCssQuery);

      if (loginLink) {
        loginLink.textContent = this.loginLabel;
        if (loginLink instanceof HTMLAnchorElement) {
          loginLink.href = this.loginPath;
        }
        else {
          loginLink.addEventListener('click', () => {
            const url = new URL(window.location.href);
            url.pathname = this.loginPath;
            window.location.href = url.toString();
          });
        }
      }
    }
  }
}

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
      if (link.href.startsWith(document.location.origin + this.basepath())) {
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

const appMeta = new AppMeta();
const appRouteRegistry = new AppRouteRegistry();

export {
  AppMeta,
  AppRouteItem,
  AppRouteRegistry,
  appMeta,
  appRouteRegistry,
};
