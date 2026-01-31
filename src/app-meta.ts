class AppMeta {
  public readonly checkEndpoint: string;
  public readonly loginEndpoint: string;
  public readonly logoutEndpoint: string;
  public readonly navigationEndpoint: string;
  public readonly pathSeparator: string;
  public readonly schemaEndpoint: string;
  public readonly stateEndpoint: string;
  public readonly translationEndpoint: string;

  constructor() {
    const kdexUIMeta = document.querySelector('html head meta[name="kdex-ui"]');

    if (!kdexUIMeta) {
      throw new Error('kdex-ui meta tag not found');
    }

    this.checkEndpoint = kdexUIMeta.getAttribute('data-check-endpoint') || '/-/check';
    this.loginEndpoint = kdexUIMeta.getAttribute('data-login-endpoint') || '/-/login';
    this.logoutEndpoint = kdexUIMeta.getAttribute('data-logout-endpoint') || '/-/logout';
    this.navigationEndpoint = kdexUIMeta.getAttribute('data-navigation-endpoint') || '/-/navigation';
    this.pathSeparator = kdexUIMeta.getAttribute('data-path-separator') || '/-/';
    this.schemaEndpoint = kdexUIMeta.getAttribute('data-schema-endpoint') || '/-/schema';
    this.stateEndpoint = kdexUIMeta.getAttribute('data-state-endpoint') || '/-/state';
    this.translationEndpoint = kdexUIMeta.getAttribute('data-translation-endpoint') || '/-/translation';
  }

  async check(...tuples: {
    action: string;
    resource: string;
  }[]
  ): Promise<{
    resource: string;
    allowed: boolean;
    error: string | undefined;
  }[]> {
    const response = await fetch(
      this.checkEndpoint,
      {
        body: JSON.stringify(tuples),
        credentials: "same-origin",
        method: 'POST',
      }
    );
    return await response.json();
  }

  async userState(): Promise<UserState | undefined> {
    const response = await fetch(
      this.stateEndpoint,
      {
        credentials: "same-origin",
        method: 'GET',
      }
    );
    if (response.status === 401) {
      return;
    }
    return await response.json();
  }
}

// OIDC SCOPE
type UserState = {                // OIDC SCOPE
  sub: string;                    // openid
  iss?: string;                    // openid
  aud?: string;                    // openid
  exp?: string;                    // openid
  iat?: string;                    // openid
  at_hash?: string;                // openid

  email: string;                  // email
  email_verified?: boolean;        // email

  name?: string;                   // profile
  family_name?: string;            // profile
  given_name?: string;             // profile
  middle_name?: string;            // profile
  nickname?: string;               // profile
  picture?: string;                // profile
  preferred_username?: string;     // profile
  profile?: string;                // profile
  website?: string;                // profile
  gender?: string;                 // profile
  birthdate?: string;              // profile
  zoneinfo?: string;               // profile
  locale?: string;                 // profile
  updated_at?: number;             // profile

  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };                              // address

  phone_number?: string;           // phone
  phone_number_verified?: boolean; // phone

  permissions: Array<string>;
} & Record<string, any>;

const appMeta = new AppMeta();
const check = appMeta.check.bind(appMeta);
const userState = appMeta.userState.bind(appMeta);

export {
  AppMeta,
  UserState,
  appMeta,
  check,
  userState,
};
