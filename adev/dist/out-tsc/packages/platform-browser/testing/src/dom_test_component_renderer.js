/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ɵgetDOM as getDOM} from '@angular/common';
import {Injectable} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
/**
 * A DOM based implementation of the TestComponentRenderer.
 */
let DOMTestComponentRenderer = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = TestComponentRenderer;
  var DOMTestComponentRenderer = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      DOMTestComponentRenderer = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _doc;
    constructor(_doc) {
      super();
      this._doc = _doc;
    }
    insertRootElement(rootElId, tagName = 'div') {
      this.removeAllRootElementsImpl();
      const rootElement = getDOM().getDefaultDocument().createElement(tagName);
      rootElement.setAttribute('id', rootElId);
      this._doc.body.appendChild(rootElement);
    }
    removeAllRootElements() {
      // Check whether the `DOCUMENT` instance retrieved from DI contains
      // the necessary function to complete the cleanup. In tests that don't
      // interact with DOM, the `DOCUMENT` might be mocked and some functions
      // might be missing. For such tests, DOM cleanup is not required and
      // we skip the logic if there are missing functions.
      if (typeof this._doc.querySelectorAll === 'function') {
        this.removeAllRootElementsImpl();
      }
    }
    removeAllRootElementsImpl() {
      const oldRoots = this._doc.querySelectorAll('[id^=root]');
      for (let i = 0; i < oldRoots.length; i++) {
        getDOM().remove(oldRoots[i]);
      }
    }
  };
  return (DOMTestComponentRenderer = _classThis);
})();
export {DOMTestComponentRenderer};
//# sourceMappingURL=dom_test_component_renderer.js.map
