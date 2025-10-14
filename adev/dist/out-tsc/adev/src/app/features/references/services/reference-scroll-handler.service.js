/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {DestroyRef, Injectable, PLATFORM_ID, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent} from 'rxjs';
import {MEMBER_ID_ATTRIBUTE} from '../constants/api-reference-prerender.constants';
import {Router} from '@angular/router';
let ReferenceScrollHandler = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ReferenceScrollHandler = class {
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
      ReferenceScrollHandler = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    destroyRef = inject(DestroyRef);
    document = inject(DOCUMENT);
    router = inject(Router);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    setupListeners(tocClass) {
      if (!this.isBrowser) {
        return;
      }
      this.setupCodeToCListeners(tocClass);
    }
    setupCodeToCListeners(tocClass) {
      const tocContainer = this.document.querySelector(`.${tocClass}`);
      if (!tocContainer) {
        return;
      }
      fromEvent(tocContainer, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          if (event.target instanceof HTMLAnchorElement) {
            event.stopPropagation();
            return;
          }
          // Get the card member ID from the attributes
          const target =
            event.target instanceof HTMLButtonElement
              ? event.target
              : this.findButtonElement(event.target);
          const memberId = this.getMemberId(target);
          if (memberId) {
            this.router.navigate([], {fragment: memberId, replaceUrl: true});
          }
        });
    }
    getMemberId(lineButton) {
      if (!lineButton) {
        return undefined;
      }
      return lineButton.attributes.getNamedItem(MEMBER_ID_ATTRIBUTE)?.value;
    }
    findButtonElement(element) {
      let parent = element.parentElement;
      while (parent) {
        if (parent instanceof HTMLButtonElement) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    }
  };
  return (ReferenceScrollHandler = _classThis);
})();
export {ReferenceScrollHandler};
//# sourceMappingURL=reference-scroll-handler.service.js.map
