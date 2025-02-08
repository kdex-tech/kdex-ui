class AppNavigationItem {
  constructor({
    basepath,
    id,
    label,
    path
  }) {
    this.basepath = basepath;
    this.id = id;
    this.label = label;
    this.path = path;
  }
}

class AppNavigationRegistry {
  constructor() {
    this.items = [];
    this.callbacks = [];
  }

  addItem(item) {
    console.log('addItem', item, item instanceof AppNavigationItem);
    if (item instanceof AppNavigationItem) {
      this.items.push(item);
      this.callbacks.forEach(callback => callback(this.items));
    }
  }

  removeItem(item) {
    this.items = this.items.filter(i => i !== item);
    this.callbacks.forEach(callback => callback(this.items));
  }

  onItemAdded(callback) {
    this.callbacks.push(callback);
  }

  getItems() {
    return this.items;
  }
}

const registry = new AppNavigationRegistry();

class AppNavigationElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    registry.onItemAdded(items => {
      this.renderItems(items);
    });
  }

  static elementName() {
    return 'kdex-ui-nav';
  }

  connectedCallback() {
    // TODO: extract the styles so they can be set externally
    this.shadowRoot.innerHTML = `
      <style>
        .dropbtn {
          background-color: #04AA6D;
          color: white;
          padding: 16px;
          font-size: 16px;
          border: none;
        }

        .dropdown {
          position: relative;
          display: inline-block;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          background-color: #f1f1f1;
          min-width: 160px;
          box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .dropdown-content a {
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
        }

        .dropdown-content a:hover {
          background-color: #ddd;
        }

        .dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown:hover .dropbtn {
          background-color: #3e8e41;
        }
      </style>

      <div class="dropdown">
        <button class="dropbtn">App</button>
        <div class="dropdown-content">
        </div>
      </div>
    `;

    this.addEventListener('route-change', event => {
      // TODO: this is still not finished. The elements should be updated to match the new route.
      console.log('route-change', event.detail);
    }); 
  }

  renderItems(items) {
    this.shadowRoot.querySelector('.dropdown-content').innerHTML = items.map(item => `<a href="javascript:void(0)" data-path="${item.path}" data-id="${item.id}" data-basepath="${item.basepath}">${item.label}</a>`).join('');
    for (const child of this.shadowRoot.querySelectorAll('.dropdown-content a')) {
      child.addEventListener('click', event => {
        const el = event.target;
        this.dispatchEvent(new CustomEvent('route-change', { detail: { path: el.getAttribute('data-path'), id: el.getAttribute('data-id'), basepath: el.getAttribute('data-basepath') } }));
      });
    }
  }
}

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

  registerNavigationItem(item) {
    const id = this.id();
    if (id) {
      item.id = id;
      // if (item.path.startsWith('/')) {
      //   item.path = item.path.substring(1);
      // }
      // item.path = `${this.basepath()}${this.parentContainer().pathSeparator}${id}/${item.path}`;
      registry.addItem(item);
    }
  }

  // routepath() {
  //   if (this.parentElement.routepath().startsWith(this.id() + '/')) {
  //     return this.parentElement.routepath().substring(this.id().length + 1);
  //   }
  //   return null;
  // }
}

if (!customElements.get(AppNavigationElement.elementName())) {
  customElements.define(AppNavigationElement.elementName(), AppNavigationElement);
}

if (!customElements.get(AppContainerElement.elementName())) {
  customElements.define(AppContainerElement.elementName(), AppContainerElement);
}

export {
  AppNavigationElement,
  AppContainerElement,
  AppElement,
  AppNavigationItem,
  AppNavigationRegistry
};