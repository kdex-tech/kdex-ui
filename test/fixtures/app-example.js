import { AppElement } from '@kdex/ui';

export class AppExample extends AppElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.registerRoutes({ label: 'Foo', path: '/foo', weight: 1 }, { label: 'Bar', path: '/bar', weight: 2 });
  }

  connectedCallback() {
    var body = `<p>This is a test component to verify the module loading works.</p>`;

    if (this.routePath === '/foo') {
      body = `<h1>I've been routed to as /foo</h1>`;
    }

    if (this.routePath === '/bar') {
      body = `<h1>I've been routed to as /bar</h1>`;
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
id: ${this.id}
        </pre>
        ${body}
        <button class="navigate-button-one">Navigate to /foo</button>
        <button class="navigate-button-two">Navigate to /bar</button>
      </div>
    `;

    this.shadowRoot.querySelector('.navigate-button-one')?.addEventListener('click', () => {
      this.navigate('/foo');
    });

    this.shadowRoot.querySelector('.navigate-button-two')?.addEventListener('click', () => {
      this.navigate('/bar');
    });
  }
}

// Register the component
customElements.define('app-example', AppExample);