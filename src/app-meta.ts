class UserStateSync {
  private userState: UserState | null = null;
  private callbacks: ((userState: UserState) => void)[] = [];

  public getUserState(): UserState | null {
    return this.userState;
  }

  public onUserStateChange(callback: (userState: UserState) => void): void {
    if (this.userState) {
      callback(this.userState);
    }

    this.callbacks.push(callback);
  }

  public setUserState(userState: UserState): void {
    this.userState = userState;
    this.callbacks.forEach(callback => callback(userState));
  }

  public unregisterUserStateChange(callback: (userState: UserState) => void): void {
    this.callbacks = this.callbacks.filter(c => c !== callback);
  }
}

const userStateSync = new UserStateSync();

class AppMeta {
  public readonly checkBatchEndpoint: string;
  public readonly checkSingleEndpoint: string;
  public readonly loginPath: string;
  public readonly loginLabel: string;
  public readonly loginCssQuery: string;
  public readonly logoutPath: string;
  public readonly logoutLabel: string;
  public readonly logoutCssQuery: string;
  public readonly navigationEndpoint: string;
  public readonly pathSeparator: string;
  public readonly stateEndpoint: string;

  constructor() {
    const kdexUIMeta = document.querySelector('html head meta[name="kdex-ui"]');

    if (!kdexUIMeta) {
      throw new Error('kdex-ui meta tag not found');
    }

    this.checkBatchEndpoint = kdexUIMeta.getAttribute('data-check-batch-endpoint') || '/~/check/batch';
    this.checkSingleEndpoint = kdexUIMeta.getAttribute('data-check-single-endpoint') || '/~/check/single';
    this.loginPath = kdexUIMeta.getAttribute('data-login-path') || '/~/oauth/login';
    this.loginLabel = kdexUIMeta.getAttribute('data-login-label') || 'Login';
    this.loginCssQuery = kdexUIMeta.getAttribute('data-login-css-query') || 'nav.nav .nav-dropdown a.login';
    this.logoutPath = kdexUIMeta.getAttribute('data-logout-path') || '/~/oauth/logout';
    this.logoutLabel = kdexUIMeta.getAttribute('data-logout-label') || 'Logout';
    this.logoutCssQuery = kdexUIMeta.getAttribute('data-logout-css-query') || 'nav.nav .nav-dropdown a.logout';
    this.navigationEndpoint = kdexUIMeta.getAttribute('data-navigation-endpoint') || '/~/navigation';
    this.pathSeparator = kdexUIMeta.getAttribute('data-path-separator') || '/_/';
    this.stateEndpoint = kdexUIMeta.getAttribute('data-state-endpoint') || '/~/state';

    document.addEventListener("DOMContentLoaded", () => {
      fetch(this.stateEndpoint).then(
        r => r.json()
      ).then(
        (us: UserState) => {
          userStateSync.setUserState(us);
        }
      );
    });
  }

  checkBatch(tuples: [
    {
      action: string;
      resource: string;
    }
  ]): Promise<{
    resource: string;
    allowed: boolean;
    error: string | null;
  }[]> {
    return fetch(
      this.checkBatchEndpoint,
      {
        method: 'POST',
        body: JSON.stringify(tuples),
      }
    ).then(r => r.json());
  }

  checkSingle(tuple: {
    action: string;
    resource: string;
  }): Promise<{
    allowed: boolean;
    error: string | null;
  }> {
    return fetch(
      this.checkSingleEndpoint,
      {
        method: 'POST',
        body: JSON.stringify(tuple),
      }
    ).then(r => r.json());
  }
}

type UserState = {
  data: Record<string, any>;
  principal: string;
  roles: string[];
};

const appMeta = new AppMeta();

export {
  AppMeta,
  appMeta,
  UserState,
  userStateSync,
};
