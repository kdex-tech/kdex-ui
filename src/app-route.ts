import { appMeta } from './app-meta';

type AppRoute = { appId: string, appPath: string, viewport: string };

class AppRouter {
  private currentActiveRoute: AppRoute | undefined;

  constructor() {
    window.addEventListener('popstate', () => this._navigateToAppRoutePath());
    this._wrapHistoryMethods();
    document.addEventListener("click", this._handleGlobalClick.bind(this));
    this._navigateToAppRoutePath();
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

  currentAppRoute(): AppRoute | undefined {
    if (window.location.pathname.includes(appMeta.pathSeparator)) {
      const routePath = window.location.pathname.split(appMeta.pathSeparator, 2)[1];

      const parts = routePath.split('/');
      const viewport = parts.shift() || 'main';
      const appId = parts.shift() || '';
      const appPath = '/' + parts.join('/');
      return { appId, appPath, viewport };
    }
  }

  navigate(appRoute: AppRoute): void {
    if (!appRoute.appPath.startsWith('/')) {
      appRoute.appPath = '/' + appRoute.appPath;
    }
    window.history.pushState({}, '', this.basepath() + appMeta.pathSeparator + appRoute.viewport + '/' + appRoute.appId + appRoute.appPath);
  }

  /**
   * Dynamically registers or updates an app template.
   * If the app is currently active, it triggers a re-mount.
   */
  registerApp(appId: string, templateHtml: string): void {
    // 1. Create or Update the Template in the "Library"
    let template = document.querySelector(`template[id="content-${appId}"]`) as HTMLTemplateElement;

    if (!template) {
      template = document.createElement('template');
      template.id = `content-${appId}`;
      document.body.appendChild(template);
    }

    template.innerHTML = templateHtml;

    // 2. Hot-Swap: If this app is currently active, force a re-navigation
    // to swap the live instance with the new version.
    if (this.currentActiveRoute?.appId === appId) {
      console.log(`App Router: Hot-swapping active app "${appId}"`);
      // Clearing the tracker forces the guard to allow the re-mount
      const savedRoute = { ...this.currentActiveRoute };
      this.currentActiveRoute = undefined;
      this._navigateToAppRoutePath();
    }
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
      window.history.pushState({}, '', url.pathname);
    }
  }

  _navigateToAppRoutePath(): void {
    const currentAppRoute = this.currentAppRoute();

    // Guard: Do nothing if we are already exactly here
    if (this.currentActiveRoute?.viewport === currentAppRoute?.viewport &&
      this.currentActiveRoute?.appId === currentAppRoute?.appId &&
      this.currentActiveRoute?.appPath === currentAppRoute?.appPath) {

      return;
    }

    // Cleanup previous occupant
    if (this.currentActiveRoute &&
      this.currentActiveRoute.appId !== currentAppRoute?.appId) {

      const activeEl = document.querySelector(`[data-content-id="${this.currentActiveRoute.appId}"]`);
      if (activeEl) {
        activeEl.removeAttribute('active-route');
        activeEl.removeAttribute('app-path');

        if ('appPath' in activeEl) activeEl.appPath = '';
        if ('active' in activeEl) activeEl.active = false;

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

    const viewport = document.querySelector(`[data-viewport="${currentAppRoute.viewport}"]`);
    if (!viewport) return;

    let targetEl = viewport.querySelector(`[data-content-id="${currentAppRoute.appId}"]`);

    if (!targetEl) {
      let pendingEl = document.querySelector(`template[id="content-${currentAppRoute.appId}"]`) as HTMLTemplateElement;

      // 3. THE FALLBACK: If the requested app is missing, find the 404 template
      if (!pendingEl) {
        console.warn(`App Router: ID "${currentAppRoute.appId}" not found. Falling back to 404.`);
        pendingEl = document.querySelector(`template[id="content-404"]`) as HTMLTemplateElement;
      }

      if (pendingEl) {
        viewport.innerHTML = '';
        const clone = pendingEl.content.cloneNode(true);
        targetEl = (clone as DocumentFragment).firstElementChild as HTMLElement;
        viewport.appendChild(clone);
      }
    }

    if (targetEl) {
      targetEl.setAttribute('active-route', '');
      targetEl.setAttribute('app-path', currentAppRoute.appPath);

      if ('appPath' in targetEl) targetEl.appPath = currentAppRoute.appPath;
      if ('active' in targetEl) targetEl.active = true;

      targetEl.dispatchEvent(new CustomEvent('app-route-change', {
        detail: { path: currentAppRoute.appPath },
        bubbles: true,
        composed: true
      }));
    }

    this.currentActiveRoute = currentAppRoute;
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
}

const appRouter = new AppRouter();

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

    navigate(appPath: string, viewport: string = this.parentElement?.getAttribute('data-viewport') || "error"): void {
      appRouter.navigate({ appId: this.getAttribute('data-content-id') || "error", appPath, viewport });
    }

    // Optional: Declare the hooks so TS knows they might exist
    onRouteActivated?(path: string): void;
    onRouteDeactivated?(): void;
  };
};

const navigate = appRouter.navigate.bind(appRouter)

export {
  AppBridge,
  AppRoute,
  AppRouter,
  appRouter,
  navigate,
};
