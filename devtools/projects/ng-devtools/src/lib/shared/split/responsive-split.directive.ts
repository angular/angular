/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, input, DestroyRef, output} from '@angular/core';
import {WINDOW} from '../../application-providers/window_provider';
import {Debouncer} from '../utils/debouncer';
import {SplitComponent} from './split.component';
import {Direction} from './interface';

export const RESIZE_DEBOUNCE = 50; // in milliseconds

export type ResponsiveSplitConfig = {
  /** Default direction of the as-split (when < `aspectRatioBreakpoint`) */
  defaultDirection: Direction;
  /** Width to height ratio. If greater than or equal, `breakpointDirection` is applied. */
  aspectRatioBreakpoint: number;
  /** Default direction of the as-split (when >= `aspectRatioBreakpoint`) */
  breakpointDirection: Direction;
};

/** Make as-split direction responsive. */
@Directive({
  selector: 'as-split[ngResponsiveSplit]',
})
export class ResponsiveSplitDirective {
  private readonly host = inject(SplitComponent);
  private readonly elementRef = inject(ElementRef);
  private readonly window = inject<typeof globalThis>(WINDOW);

  protected readonly config = input.required<ResponsiveSplitConfig>({
    alias: 'ngResponsiveSplit',
  });

  protected readonly directionChange = output<Direction>();

  constructor() {
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

  private applyDirection(width: number, height: number) {
    const ratio = width / height;
    const {defaultDirection, breakpointDirection, aspectRatioBreakpoint} = this.config();
    let newDir: Direction = defaultDirection;

    if (ratio >= aspectRatioBreakpoint) {
      newDir = breakpointDirection;
    }

    if (this.host.direction() !== newDir) {
      this.host.direction.set(newDir);
      this.directionChange.emit(newDir);
    }
  }
}
