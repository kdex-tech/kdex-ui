import { AppElement } from '@kdex/ui';

export class KDexExample extends AppElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
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
                <code>${this.basepath}</code>
                <p>This is a test component to verify the module loading works.</p>
            </div>
        `;
    }
}

// Register the component
customElements.define('kdex-example', KDexExample);