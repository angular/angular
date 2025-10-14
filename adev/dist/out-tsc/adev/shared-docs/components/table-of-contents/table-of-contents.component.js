/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  input,
  inject,
  afterNextRender,
  signal,
} from '@angular/core';
import {Location, ViewportScroller} from '@angular/common';
import {TableOfContentsLevel} from '../../interfaces/index';
import {TableOfContentsLoader} from '../../services';
import {IconComponent} from '../icon/icon.component';
let TableOfContents = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-table-of-contents',
      changeDetection: ChangeDetectionStrategy.OnPush,
      templateUrl: './table-of-contents.component.html',
      styleUrls: ['./table-of-contents.component.scss'],
      imports: [IconComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TableOfContents = class {
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
      TableOfContents = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Element that contains the content from which the Table of Contents is built
    contentSourceElement = input.required();
    location = inject(Location);
    tableOfContentsLoader = inject(TableOfContentsLoader);
    viewportScroller = inject(ViewportScroller);
    destroyRef = inject(DestroyRef);
    tableOfContentItems = this.tableOfContentsLoader.tableOfContentItems;
    activeItemId = signal(null);
    TableOfContentsLevel = TableOfContentsLevel;
    constructor() {
      afterNextRender({
        read: () => {
          this.tableOfContentsLoader.buildTableOfContent(this.contentSourceElement());
          this.setupActiveItemListener(this.contentSourceElement());
        },
      });
    }
    scrollToTop() {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
    setupActiveItemListener(contentSourceElement) {
      if (contentSourceElement) {
        this.tableOfContentsLoader.setupIntersectionObserver(
          contentSourceElement,
          this.destroyRef,
          (id) => {
            this.activeItemId.set(id);
          },
        );
      }
    }
  };
  return (TableOfContents = _classThis);
})();
export {TableOfContents};
//# sourceMappingURL=table-of-contents.component.js.map
