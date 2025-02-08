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

  static elementName() {
    return 'kdex-ui-app-container';
  }

  basepath() {
    return window.location.pathname;
  }
}

class AppElement extends HTMLElement {
  constructor() {
    super();

    if (!(this.parentElement instanceof AppContainerElement)) {
      throw new Error(`Parent of AppElement must be of type AppContainerElement`);
    }
  }

  get basepath() {
    return this.parentElement.basepath();
  }

  get parentContainer() {
    return this.parentElement;
  }
}

if (!customElements.get(AppContainerElement.elementName())) {
  customElements.define(AppContainerElement.elementName(), AppContainerElement);
}

export { AppContainerElement, AppElement };
