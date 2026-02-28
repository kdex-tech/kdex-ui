# kdex-ui

## 🧩 Integration Guide: Building for the Framework

Our application server uses Custom Elements as the primary unit of UI abstraction. To ensure your element stays in sync with the server-side router, it should adhere to the following lifecycle and property contract.

### 1. The Core Contract (Standard Properties)

The framework's client-side router will actively manage two properties on your element. You can either implement these manually or use our AppBridge mixin.

|Property|Type|Description|
|---|---|---|
|`active`|`boolean`|Set to true when the element's slot is the primary target of the current URL.|
|`appPath`|`string`|The portion of the URI following the `/-/` separator (e.g., `/profile/settings`).|

### 2. Standard Events

The router dispatches these events directly on your element. Use these for global state cleanup or analytics.

- `app-route-change`: Fired when the appPath is updated.
- `app-route-deactivated`: Fired when the user navigates away to a different app slot.

### 3. Implementation Options

#### Option A: Using the AppBridge Mixin (Recommended)

The easiest way to integrate is to wrap your class in our Mixin. It handles the attribute-to-property mirroring and provides clean lifecycle hooks.

```javascript
import { AppBridge } from '@your-framework/client';

class MyProfileApp extends AppBridge(HTMLElement) {
  // Triggered when the app becomes the URL target
  onRouteActivated(path) {
    console.log("Navigated to:", path);
    this.render();
  }

  // Triggered when another app slot takes over the URL
  onRouteDeactivated() {
    this.cleanup();
  }
}

customElements.define('profile-app', MyProfileApp);
```

#### Option B: Manual Implementation (Vanilla or Lit)

If you prefer not to use our Mixin, simply ensure your component reacts to attribute changes or defines the relevant setters.

```javascript
class ManualApp extends HTMLElement {
  static get observedAttributes() { return ['active-route', 'app-path']; }

  attributeChangedCallback(name, old, value) {
    if (name === 'active-route') {
      this.isFocused = (value !== null);
    }
  }
}
```

### 4. How the Router Communicates

When a user navigates, the framework performs a "Handshake" with your component's lifecycle:

1. Discovery:
    - Parses the URI to find the target element via the `data-app-slot` attribute.
    - Calculates the `appPath` from the URI.
2. Deactivation:
    - Clears the `active-route` and `app-path` attributes on the previous occupant.
    - Clears `active` status and `appPath` property on the previous occupant.
    - Dispatches `app-route-deactivated` on the previous occupant.
3. Activation:
    - Sets `active-route` and `app-path` attributes on the new target.
    - Sets `active` and `appPath` property on the new target.
    - Dispatches `app-route-change` event on the new target.
