class AppContainerElement extends HTMLElement {
  private appContainerTemplate: HTMLTemplateElement;

  constructor() {
    super();

    this.appContainerTemplate = document.createElement("template");
    this.appContainerTemplate.innerHTML = `<slot><em>Application Container (placeholder)</em></slot>`;
  }

  static elementName(): string {
    return 'kdex-ui-app-container';
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(this.appContainerTemplate.content.cloneNode(true));
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
};