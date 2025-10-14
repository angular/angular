/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, ElementRef, Input, inject, input, signal} from '@angular/core';
let SearchItem = (() => {
  let _classDecorators = [
    Directive({
      selector: '[docsSearchItem]',
      host: {
        '[class.active]': 'isActive',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _disabled_decorators;
  let _disabled_initializers = [];
  let _disabled_extraInitializers = [];
  var SearchItem = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _disabled_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _disabled_decorators,
        {
          kind: 'field',
          name: 'disabled',
          static: false,
          private: false,
          access: {
            has: (obj) => 'disabled' in obj,
            get: (obj) => obj.disabled,
            set: (obj, value) => {
              obj.disabled = value;
            },
          },
          metadata: _metadata,
        },
        _disabled_initializers,
        _disabled_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      SearchItem = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Those inputs are required by the Highlightable interface
    // We can't migrate them to signals yet
    disabled = __runInitializers(this, _disabled_initializers, false);
    item = (__runInitializers(this, _disabled_extraInitializers), input());
    elementRef = inject(ElementRef);
    _isActive = signal(false);
    get isActive() {
      return this._isActive();
    }
    setActiveStyles() {
      this._isActive.set(true);
    }
    setInactiveStyles() {
      this._isActive.set(false);
    }
    scrollIntoView() {
      this.elementRef?.nativeElement.scrollIntoView({block: 'nearest'});
    }
  };
  return (SearchItem = _classThis);
})();
export {SearchItem};
//# sourceMappingURL=search-item.directive.js.map
