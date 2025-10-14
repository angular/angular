/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {isPlatformBrowser} from '@angular/common';
import {Directive, ElementRef, PLATFORM_ID, inject} from '@angular/core';
import {isExternalLink} from '../../utils/index';
/**
 * The directive will set target of anchor elements to '_blank' for the external links.
 * We can opt-out this behavior by adding `noBlankForExternalLink` attribute to anchor element.
 */
let ExternalLink = (() => {
  let _classDecorators = [
    Directive({
      selector: 'a[href]:not([noBlankForExternalLink])',
      host: {
        '[attr.target]': 'target',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExternalLink = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ExternalLink = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    anchor = inject(ElementRef);
    platformId = inject(PLATFORM_ID);
    target;
    constructor() {
      this.setAnchorTarget();
    }
    setAnchorTarget() {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (isExternalLink(this.anchor.nativeElement.href)) {
        this.target = '_blank';
      }
    }
  };
  return (ExternalLink = _classThis);
})();
export {ExternalLink};
//# sourceMappingURL=external-link.directive.js.map
