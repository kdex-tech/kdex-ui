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
  public readonly pathSeparator: string;
  public readonly stateEndpoint: string;

  constructor() {
    const kdexUIMeta = document.querySelector('html head meta[name="kdex-ui"]');

    if (!kdexUIMeta) {
      throw new Error('kdex-ui meta tag not found');
    }

    this.checkBatchEndpoint = kdexUIMeta.getAttribute('data-check-batch-endpoint') || '/~/check/batch';
    this.checkSingleEndpoint = kdexUIMeta.getAttribute('data-check-single-endpoint') || '/~/check/single';
    this.pathSeparator = kdexUIMeta.getAttribute('data-path-separator') || '/_/';
    this.stateEndpoint = kdexUIMeta.getAttribute('data-state-endpoint') || '/~/state';

    document.addEventListener("DOMContentLoaded", async () => {
      const response = await fetch(this.stateEndpoint);
      if (response.status === 401) {
        return;
      }
      const data = await response.json() as UserState;
      userStateSync.setUserState(data);
    });
  }

  async checkBatch(tuples: [
    {
      action: string;
      resource: string;
    }
  ]): Promise<{
    resource: string;
    allowed: boolean;
    error: string | null;
  }[]> {
    const r = await fetch(
      this.checkBatchEndpoint,
      {
        method: 'POST',
        body: JSON.stringify(tuples),
      }
    );
    return await r.json();
  }

  async checkSingle(tuple: {
    action: string;
    resource: string;
  }): Promise<{
    allowed: boolean;
    error: string | null;
  }> {
    const r = await fetch(
      this.checkSingleEndpoint,
      {
        method: 'POST',
        body: JSON.stringify(tuple),
      }
    );
    return await r.json();
  }
}

type UserState = {
  email: string;
  family_name: string;
  given_name: string;
  middle_name: string;
  name: string;
  nickname: string;
  picture: string;
  scopes: Array<string>;
  uid: string;
  updated_at: number;
} & Record<string, any>;

const appMeta = new AppMeta();

export {
  AppMeta,
  appMeta,
  UserState,
  userStateSync,
};
