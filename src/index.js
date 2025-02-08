class AppRouteItem {
  constructor({
    basepath,
    id,
    path
  }) {
    this.basepath = basepath;
    this.id = id;
    this.path = path;
  }
}

class AppRouteRegistry {
  constructor() {
    this.items = [];
    this.callbacks = [];
  }

  addItem(item) {
    if (item instanceof AppRouteItem) {
      this.items.push(item);
      this.callbacks.forEach(callback => callback(this.items));
    }
  }

  removeItem(item) {
    if (item instanceof AppRouteItem) {
      this.items = this.items.filter(i => i !== item);
      this.callbacks.forEach(callback => callback(this.items));
    }
  }

  onItemAdded(callback) {
    this.callbacks.push(callback);
  }

  getItems() {
    return this.items;
  }
}

const appRouteRegistry = new AppRouteRegistry();

class AppContainerElement extends HTMLElement {
  constructor() {
    super();

    const appContainerTemplate = document.createElement("template");
    appContainerTemplate.innerHTML = `
        <slot><em>This container is empty.</em></slot>
    `;

    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(appContainerTemplate.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['path-separator'];
  }

  static elementName() {
    return 'kdex-ui-app-container';
  }

  basepath() {
    if (window.location.pathname.includes(this.pathSeparator)) {
      return window.location.pathname.split(this.pathSeparator, 2)[0];
    }
    if (window.location.pathname.endsWith('/')) {
      return window.location.pathname.slice(0, -1);
    }
    return window.location.pathname;
  }

  get pathSeparator() {
    return this.getAttribute('path-separator') || '/_/';
  }

  routepath() {
    if (window.location.pathname.includes(this.pathSeparator)) {
      return window.location.pathname.split(this.pathSeparator, 2)[1];
    }
    return '';
  }

  set pathSeparator(value) {
    if (value) {
      this.setAttribute('path-separator', value);
    } else {
      this.removeAttribute('path-separator');
    }
  }
}

class AppElement extends HTMLElement {
  #id;

  constructor() {
    super();

    if (!(this.parentElement instanceof AppContainerElement)) {
      throw new Error(`Parent of AppElement must be of type AppContainerElement`);
    }

    this.#id = this.getAttribute('id') || null;
  }

  static get observedAttributes() {
    return ['id', 'route-path'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'route-path') {
      this.routePath = newValue;
    }
    this.connectedCallback();
  }

  basepath() {
    return this.parentElement.basepath();
  }

  id() {
    return this.#id;
  }

  parentContainer() {
    return this.parentElement;
  }

  registerRoute(item) {
    if (item instanceof AppRouteItem && this.id()) {
      item.id = this.id();
      item.basepath = this.basepath();
      appRouteRegistry.addItem(item);
    }
  }
}

if (!customElements.get(AppContainerElement.elementName())) {
  customElements.define(AppContainerElement.elementName(), AppContainerElement);
}

export {
  AppContainerElement,
  AppElement,
  AppRouteItem,
  AppRouteRegistry,
};