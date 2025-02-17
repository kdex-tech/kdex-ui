class AppMeta {
  public readonly pathSeparator: string;
  public readonly loginPath: string;
  public readonly logoutPath: string;
  public readonly loginLabel: string;
  public readonly logoutLabel: string;
  public readonly loginCssQuery: string;
  public readonly logoutCssQuery: string;
  public readonly stateEndpoint: string;

  constructor() {
    const kdexUIMeta = document.querySelector('html head meta[name="kdex-ui"]');

    if (!kdexUIMeta) {
      throw new Error('kdex-ui meta tag not found');
    }

    this.pathSeparator = kdexUIMeta.getAttribute('data-path-separator') || '/_/';
    this.loginPath = kdexUIMeta.getAttribute('data-login-path') || '/~/oauth/login';
    this.logoutPath = kdexUIMeta.getAttribute('data-logout-path') || '/~/oauth/logout';
    this.loginLabel = kdexUIMeta.getAttribute('data-login-label') || 'Login';
    this.logoutLabel = kdexUIMeta.getAttribute('data-logout-label') || 'Logout';
    this.loginCssQuery = kdexUIMeta.getAttribute('data-login-css-query') || 'nav.nav .nav-dropdown a.login';
    this.logoutCssQuery = kdexUIMeta.getAttribute('data-logout-css-query') || 'nav.nav .nav-dropdown a.logout';
    this.stateEndpoint = kdexUIMeta.getAttribute('data-state-endpoint') || '/~/state';

    document.addEventListener("DOMContentLoaded", this._setLoginLogoutLinks.bind(this));
  }

  _setLoginLogoutLinks(): void {
    if (this.stateEndpoint) {
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

const appMeta = new AppMeta();

export {
  AppMeta,
  appMeta,
};
