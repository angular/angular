/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT} from '@angular/common';
import {Directive, ElementRef, Input, inject, output} from '@angular/core';
let ClickOutside = (() => {
  let _classDecorators = [
    Directive({
      selector: '[docsClickOutside]',
      host: {
        '(document:click)': 'onClick($event)',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _ignoredElementsIds_decorators;
  let _ignoredElementsIds_initializers = [];
  let _ignoredElementsIds_extraInitializers = [];
  var ClickOutside = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _ignoredElementsIds_decorators = [Input('docsClickOutsideIgnore')];
      __esDecorate(
        null,
        null,
        _ignoredElementsIds_decorators,
        {
          kind: 'field',
          name: 'ignoredElementsIds',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ignoredElementsIds' in obj,
            get: (obj) => obj.ignoredElementsIds,
            set: (obj, value) => {
              obj.ignoredElementsIds = value;
            },
          },
          metadata: _metadata,
        },
        _ignoredElementsIds_initializers,
        _ignoredElementsIds_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ClickOutside = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // TODO: Understand why replacing this @Input with a signal input breaks the tests
    ignoredElementsIds = __runInitializers(this, _ignoredElementsIds_initializers, []);
    clickOutside =
      (__runInitializers(this, _ignoredElementsIds_extraInitializers),
      output({alias: 'docsClickOutside'}));
    document = inject(DOCUMENT);
    elementRef = inject(ElementRef);
    onClick(event) {
      if (
        !this.elementRef.nativeElement.contains(event.target) &&
        !this.wasClickedOnIgnoredElement(event)
      ) {
        this.clickOutside.emit();
      }
    }
    wasClickedOnIgnoredElement(event) {
      if (this.ignoredElementsIds.length === 0) {
        return false;
      }
      return this.ignoredElementsIds.some((elementId) => {
        const element = this.document.getElementById(elementId);
        const target = event.target;
        const contains = element?.contains(target);
        return contains;
      });
    }
  };
  return (ClickOutside = _classThis);
})();
export {ClickOutside};
//# sourceMappingURL=click-outside.directive.js.map
