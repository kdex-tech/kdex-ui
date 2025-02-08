class AppRouteItem {
  constructor(
    private config: {
      basepath: string;
      id: string;
      path: string;
    }
  ) {
    this.basepath = config.basepath;
    this.id = config.id;
    this.path = config.path;
  }

  basepath: string;
  id: string;
  path: string;
}

class AppRouteRegistry {
  private items: AppRouteItem[] = [];
  private callbacks: ((items: AppRouteItem[]) => void)[] = [];

  addItem(item: AppRouteItem): void {
    if (item instanceof AppRouteItem) {
      this.items.push(item);
      this.callbacks.forEach(callback => callback(this.items));
    }
  }

  removeItem(item: AppRouteItem): void {
    if (item instanceof AppRouteItem) {
      this.items = this.items.filter(i => i !== item);
      this.callbacks.forEach(callback => callback(this.items));
    }
  }

  onItemAdded(callback: (items: AppRouteItem[]) => void): void {
    this.callbacks.push(callback);
  }

  getItems(): AppRouteItem[] {
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

  static get observedAttributes(): string[] {
    return ['path-separator'];
  }

  static elementName(): string {
    return 'kdex-ui-app-container';
  }

  basepath(): string {
    if (window.location.pathname.includes(this.pathSeparator)) {
      return window.location.pathname.split(this.pathSeparator, 2)[0];
    }
    if (window.location.pathname.endsWith('/')) {
      return window.location.pathname.slice(0, -1);
    }
    return window.location.pathname;
  }

  get pathSeparator(): string {
    return this.getAttribute('path-separator') || '/_/';
  }

  routepath(): string {
    if (window.location.pathname.includes(this.pathSeparator)) {
      return window.location.pathname.split(this.pathSeparator, 2)[1];
    }
    return '';
  }

  set pathSeparator(value: string | null) {
    if (value) {
      this.setAttribute('path-separator', value);
    } else {
      this.removeAttribute('path-separator');
    }
  }
}

class AppElement extends HTMLElement {
  #id: string | null;

  constructor() {
    super();

    const parent = this.parentElement;
    if (!(parent instanceof AppContainerElement)) {
      throw new Error(`Parent of AppElement must be of type AppContainerElement`);
    }

    this.#id = this.getAttribute('id') || null;
  }

  static get observedAttributes(): string[] {
    return ['id', 'route-path'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'route-path') {
      this.routePath = newValue;
    }
    this.connectedCallback();
  }

  basepath(): string {
    return this.getParentContainer().basepath();
  }

  getId(): string {
    return this.#id || '';
  }

  getParentContainer(): AppContainerElement {
    const parent = this.parentElement;
    if (!(parent instanceof AppContainerElement)) {
      throw new Error('Parent container not found');
    }
    return parent;
  }

  registerRoute(item: AppRouteItem): void {
    if (item instanceof AppRouteItem && this.getId()) {
      item.id = this.getId();
      item.basepath = this.basepath();
      appRouteRegistry.addItem(item);
    }
  }

  // Add this property to satisfy the attributeChangedCallback
  routePath: string | null = null;

  connectedCallback(): void {
    // Default implementation - can be overridden by subclasses
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kdex-ui-app-container': AppContainerElement;
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