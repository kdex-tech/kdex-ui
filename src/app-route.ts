import { appMeta } from './app-meta';

class AppRouter {
  private currentActiveRoute: { appId: string, appPath: string } | undefined;

  constructor() {
    window.addEventListener('popstate', () => this._navigateToAppRoutePath());
    this._wrapHistoryMethods();
    document.addEventListener("click", this._handleGlobalClick.bind(this));
    this._navigateToAppRoutePath();
  }

  _navigateToAppRoutePath(): void {
    const currentAppRoute = this.currentAppRoute();

    // Guard: Do nothing if we are already exactly here
    if (this.currentActiveRoute?.appId === currentAppRoute?.appId &&
      this.currentActiveRoute?.appPath === currentAppRoute?.appPath) {
      return;
    }

    // 1. Cleanup previous occupant
    if (this.currentActiveRoute && this.currentActiveRoute.appId !== currentAppRoute?.appId) {
      const activeEl = document.querySelector(`[data-app-slot="${this.currentActiveRoute.appId}"]`);
      if (activeEl) {
        activeEl.removeAttribute('active-route');
        activeEl.removeAttribute('app-path');

        if ('active' in activeEl) activeEl.active = false;
        if ('appPath' in activeEl) activeEl.appPath = '';

        activeEl.dispatchEvent(new CustomEvent('app-route-deactivated', {
          bubbles: true,
          composed: true
        }));
      }
    }

    if (!currentAppRoute) {
      this.currentActiveRoute = undefined;
      return
    }

    const targetEl = document.querySelector(`[data-app-slot="${currentAppRoute.appId}"]`);
    if (targetEl) {
      targetEl.setAttribute('active-route', '');
      targetEl.setAttribute('app-path', currentAppRoute.appPath);

      if ('active' in targetEl) targetEl.active = true;
      if ('appPath' in targetEl) targetEl.appPath = currentAppRoute.appPath;

      targetEl.dispatchEvent(new CustomEvent('app-route-change', {
        detail: { path: currentAppRoute.appPath },
        bubbles: true,
        composed: true
      }));
    }

    this.currentActiveRoute = currentAppRoute;
  }

  _handleGlobalClick(event: MouseEvent): void {
    const link = event.composedPath().find((el): el is HTMLAnchorElement =>
      el instanceof HTMLElement && el.tagName === 'A'
    );

    if (link && link.href.startsWith(document.location.origin + this.basepath() + appMeta.pathSeparator)) {
      const url = new URL(link.href);
      // also make sure link.href path is not in appMeta.collectiveEndpoints
      if (appMeta.collectiveEndpoints.includes(url.pathname)) {
        return
      }
      event.preventDefault();
      this.navigate(url.pathname);
    }
  }

  /**
     * Overrides native history methods so they trigger our router.
     */
  private _wrapHistoryMethods(): void {
    const registry = this;
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPush.apply(window.history, args); // Explicit context
      registry._navigateToAppRoutePath();
    };

    window.history.replaceState = function (...args) {
      originalReplace.apply(window.history, args);
      registry._navigateToAppRoutePath();
    };
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

  currentAppRoute(): { appId: string, appPath: string } | undefined {
    if (window.location.pathname.includes(appMeta.pathSeparator)) {
      const routePath = window.location.pathname.split(appMeta.pathSeparator, 2)[1];

      const parts = routePath.split('/');
      const appId = parts.shift() || '';
      const appPath = '/' + parts.join('/');
      return { appId, appPath };
    }
  }

  navigate(location: string): void {
    window.history.pushState({}, '', location);
  }
}

// 1. Define what a "Constructor" looks like in TS
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * AppBridge Mixin
 * 
 * Example for Vanilla:
 * ```
 * import { AppBridge } from '@kdex-tech/ui';
 * 
 * class MyVanillaApp extends AppBridge(HTMLElement) {
 *   onRouteActivated(path) {
 *     this.innerHTML = `<h1>Welcome to ${path}</h1>`;
 *   }
 * }
 * customElements.define('vanilla-app', MyVanillaApp);
 * ```
 * 
 * Example for Lit:
 * ```
 * import { AppBridge } from '@kdex-tech/ui';
 * import { LitElement, html } from 'lit';
 * 
 * class MyLitApp extends AppBridge(LitElement) {
 *   render() {
 *     return this.active
 *       ? html`<div>Current Path: ${this.appPath}</div>`
 *       : html`<div>Sleeping...</div>`;
 *   }
 * }
 * customElements.define('lit-app', MyLitApp);
 * ```
 * 
 * @param {Constructor} BaseClass - The class to extend (HTMLElement, LitElement, etc.)
 */
const AppBridge = <T extends Constructor<HTMLElement>>(BaseClass: T) => {
  return class extends BaseClass {
    // 1. Internal state
    _active = false;
    _appPath = '';

    // 2. Define Properties (Standard getters/setters)
    get active() { return this._active; }
    set active(value: any) {
      const old = this._active;
      this._active = !!value;
      if (old !== this._active) {
        // @ts-ignore - Assuming these exist or are optional on the consumer
        this._active ? this.onRouteActivated?.(this._appPath) : this.onRouteDeactivated?.();
        // @ts-ignore - Support for Lit re-renders
        if (typeof (this as any).requestUpdate === 'function') (this as any).requestUpdate('active', old);
      }
    }

    get appPath() { return this._appPath; }
    set appPath(value: string) {
      const old = this._appPath;
      this._appPath = value;
      // @ts-ignore
      if (old !== this._appPath && typeof (this as any).requestUpdate === 'function') {
        (this as any).requestUpdate('appPath', old);
      }
    }

    // 3. Automated Attribute Observation
    static get observedAttributes() {
      // @ts-ignore - Access static member of base class if it exists
      const baseAttrs = (BaseClass as any).observedAttributes || [];
      return [...baseAttrs, 'active-route', 'app-path'];
    }

    attributeChangedCallback(name: string, old: string | null, value: string | null) {
      if (name === 'active-route') this.active = value !== null;
      if (name === 'app-path') this.appPath = value || '';
      // @ts-ignore
      super.attributeChangedCallback?.(name, old, value);
    }

    // Optional: Declare the hooks so TS knows they might exist
    onRouteActivated?(path: string): void;
    onRouteDeactivated?(): void;
  };
};

const appRouter = new AppRouter();
const navigate = appRouter.navigate.bind(appRouter)

export {
  AppBridge,
  AppRouter,
  appRouter,
  navigate,
};
