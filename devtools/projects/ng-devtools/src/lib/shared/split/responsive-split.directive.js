/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Directive, ElementRef, inject, input, DestroyRef, output} from '@angular/core';
import {WINDOW} from '../../application-providers/window_provider';
import {Debouncer} from '../utils/debouncer';
import {SplitComponent} from './split.component';
export const RESIZE_DEBOUNCE = 50; // in milliseconds
/** Make as-split direction responsive. */
let ResponsiveSplitDirective = class ResponsiveSplitDirective {
  constructor() {
    this.host = inject(SplitComponent);
    this.elementRef = inject(ElementRef);
    this.window = inject(WINDOW);
    this.config = input.required({
      alias: 'ngResponsiveSplit',
    });
    this.directionChange = output();
    const debouncer = new Debouncer();
    // We use the ResizeObserver from the injected window object to allow mocking in tests.
    const resizeObserver = new this.window.ResizeObserver(
      debouncer.debounce(([entry]) => {
        if (entry.contentBoxSize) {
          const [{inlineSize, blockSize}] = entry.contentBoxSize;
          this.applyDirection(inlineSize, blockSize);
        }
      }, RESIZE_DEBOUNCE),
    );
    resizeObserver.observe(this.elementRef.nativeElement);
    inject(DestroyRef).onDestroy(() => {
      debouncer.cancel();
      resizeObserver.unobserve(this.elementRef.nativeElement);
    });
  }
  applyDirection(width, height) {
    const ratio = width / height;
    const {defaultDirection, breakpointDirection, aspectRatioBreakpoint} = this.config();
    let newDir = defaultDirection;
    if (ratio >= aspectRatioBreakpoint) {
      newDir = breakpointDirection;
    }
    if (this.host.direction() !== newDir) {
      this.host.direction.set(newDir);
      this.directionChange.emit(newDir);
    }
  }
};
ResponsiveSplitDirective = __decorate(
  [
    Directive({
      selector: 'as-split[ngResponsiveSplit]',
    }),
  ],
  ResponsiveSplitDirective,
);
export {ResponsiveSplitDirective};
//# sourceMappingURL=responsive-split.directive.js.map
