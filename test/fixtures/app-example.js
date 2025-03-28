import { AppElement, fetchNavigation } from '@kdex/ui';

export class AppExample extends AppElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.registerRoutes({label: 'Foo', path: '/foo', weight: 1}, {label: 'Bar', path: '/bar', weight: 2});
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

class NavExample extends HTMLElement {
  static instantiated = false;
  refresh = 0;

  constructor() {
    if (NavExample.instantiated) {
			throw new Error('NavExample already instantiated. Only one instance is allowed.');
		}
    super();
    NavExample.instantiated = true;
  }

  static get observedAttributes() {
    return ['refresh'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'refresh' && newValue !== oldValue) {
      this.refresh = newValue;
      this.connectedCallback ();
    }
  }

  connectedCallback() {
    fetchNavigation().then(navigation => {
      navigation.sort((a, b) => a.weight - b.weight);

      this.innerHTML = `
        <nav class="nav">
          ${navigation.map(item => {
            const children = item.children.sort((a, b) => a.weight - b.weight);
            const childrenHTML = children.length > 0 ? `
              <div class="nav-items">
                ${children.map(child => `<a href="${child.path}">${child.label}</a>`).join('')}
              </div>` : '';
            return `
              <div class="nav-dropdown">
                <a class="nav-button" href="${item.path}">${item.label}</a>
                ${childrenHTML}
              </div>`;
          }).join('')}
        </nav>
      `;
    });
  }

}

// Register the component
customElements.define('app-example', AppExample);
customElements.define('nav-example', NavExample);