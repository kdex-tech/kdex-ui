class AppMeta {
  public readonly checkEndpoint: string;
  public readonly loginEndpoint: string;
  public readonly logoutEndpoint: string;
  public readonly navigationEndpoint: string;
  public readonly pathSeparator: string;
  public readonly schemaEndpoint: string;
  public readonly stateEndpoint: string;
  public readonly translationEndpoint: string;

  public readonly collectiveEndpoints: Array<string>;

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

    this.collectiveEndpoints = [
      this.checkEndpoint,
      this.loginEndpoint,
      this.logoutEndpoint,
      this.navigationEndpoint,
      this.schemaEndpoint,
      this.stateEndpoint,
      this.translationEndpoint
    ]
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
type UserState = {                 // OIDC SCOPE
  // Registered claims
  at_hash?: string;                // openid
  aud?: string;                    // openid
  exp?: string;                    // openid
  iat?: string;                    // openid
  iss?: string;                    // openid
  sub: string;                     // openid

  // Public claims
  email: string;                   // email
  email_verified?: boolean;        // email

  birthdate?: string;              // profile (ISO 8601)
  family_name?: string;            // profile
  gender?: string;                 // profile
  given_name?: string;             // profile
  locale?: string;                 // profile
  middle_name?: string;            // profile
  name?: string;                   // profile
  nickname?: string;               // profile
  picture?: string;                // profile (URL)
  preferred_username?: string;     // profile
  profile?: string;                // profile
  updated_at?: number;             // profile
  website?: string;                // profile (URL)
  zoneinfo?: string;               // profile

  address?: {
    country?: string;
    formatted?: string;
    locality?: string;
    postal_code?: string;
    region?: string;
    street_address?: string;
  };                               // address

  phone_number?: string;           // phone
  phone_number_verified?: boolean; // phone

  // Custom claims
  entitlements: Array<string>;      // custom
  roles: Array<string>;            // custom
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
