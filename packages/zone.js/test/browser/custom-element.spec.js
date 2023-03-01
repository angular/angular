/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * check that document.registerElement(name, { prototype: proto });
 * is properly patched
 */

function customElementsSupport() {
  return 'registerElement' in document;
}
customElementsSupport.message = 'window.customElements';

describe('customElements', function() {
  const testZone = Zone.current.fork({name: 'test'});
  const bridge = {
    connectedCallback: () => {},
    disconnectedCallback: () => {},
    adoptedCallback: () => {},
    attributeChangedCallback: () => {}
  };

  class TestCustomElement extends HTMLElement {
    constructor() {
      super();
    }

    static get observedAttributes() {
      return ['attr1', 'attr2'];
    }

    connectedCallback() {
      return bridge.connectedCallback();
    }

    disconnectedCallback() {
      return bridge.disconnectedCallback();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      return bridge.attributeChangedCallback(attrName, oldVal, newVal);
    }

    adoptedCallback() {
      return bridge.adoptedCallback();
    }
  }

  testZone.run(() => {
    customElements.define('x-test', TestCustomElement);
  });

  let elt;

  beforeEach(() => {
    bridge.connectedCallback = () => {};
    bridge.disconnectedCallback = () => {};
    bridge.attributeChangedCallback = () => {};
    bridge.adoptedCallback = () => {};
  });

  afterEach(() => {
    if (elt) {
      document.body.removeChild(elt);
      elt = null;
    }
  });

  it('should work with connectedCallback', function(done) {
    bridge.connectedCallback = function() {
      expect(Zone.current.name).toBe(testZone.name);
      done();
    };

    elt = document.createElement('x-test');
    document.body.appendChild(elt);
  });

  it('should work with disconnectedCallback', function(done) {
    bridge.disconnectedCallback = function() {
      expect(Zone.current.name).toBe(testZone.name);
      done();
    };

    elt = document.createElement('x-test');
    document.body.appendChild(elt);
    document.body.removeChild(elt);
    elt = null;
  });

  it('should work with attributeChanged', function(done) {
    bridge.attributeChangedCallback = function(attrName, oldVal, newVal) {
      expect(Zone.current.name).toBe(testZone.name);
      expect(attrName).toEqual('attr1');
      expect(newVal).toEqual('value1');
      done();
    };

    elt = document.createElement('x-test');
    document.body.appendChild(elt);
    elt.setAttribute('attr1', 'value1');
  });
});
