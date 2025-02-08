import { AppRouteItem, AppRouteRegistry, history } from './app-route';

const appRouteRegistry = new AppRouteRegistry();

class AppContainerElement extends HTMLElement {
  private appContainerTemplate: HTMLTemplateElement;

  constructor() {
    super();

    this.appContainerTemplate = document.createElement("template");
    this.appContainerTemplate.innerHTML = `
    <slot><em>Application Container (placeholder)</em></slot>
    `;
  }

  static elementName(): string {
    return 'kdex-ui-app-container';
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(this.appContainerTemplate.content.cloneNode(true));
  }
}

class AppElement extends HTMLElement {
  public routePath: string | null = null;

  constructor() {
    super();

    const parent = this.parentElement;
    if (!(parent instanceof AppContainerElement)) {
      throw new Error('Parent AppContainerElement not found');
    }
  }

  static get observedAttributes(): string[] {
    return ['route-path'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'route-path') {
      this.routePath = newValue;
    }
    this.connectedCallback();
  }
  
  basepath(): string {
    return appRouteRegistry.basepath();
  }

  connectedCallback(): void {
    // Default implementation - can be overridden by subclasses
  }

  navigate(path: string): void {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    history.push(`${this.basepath()}${appRouteRegistry.pathSeparator}${this.id}${path}`);
  }

  registerRoutes(...paths: string[]): void {
    if (this.id) {
      appRouteRegistry.registerRoutes(this, ...paths);
    }
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