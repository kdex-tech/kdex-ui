import { AppRouteItem, AppElement } from '/src/index.js';

export class KDexExample extends AppElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.registerRoute(new AppRouteItem({
      path: '/foo',
    }));
  }

  connectedCallback() {
    var body = `<p>This is a test component to verify the module loading works.</p>`;
    if (this.routePath === 'kdex-example') {
      body = `<h1>I've been routed to.</h1>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
        }
      </style>
      <div>
        <h3>KDex Example Component</h3>
        <pre>
basepath: ${this.basepath()}
routepath: ${this.routePath}
id: ${this.id()}
        </pre>
        ${body}
      </div>
    `;
  }
}

// Register the component
customElements.define('kdex-example', KDexExample);