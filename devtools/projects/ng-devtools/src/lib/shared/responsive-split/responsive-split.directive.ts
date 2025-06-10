/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, input, NgZone, OnDestroy, output} from '@angular/core';
import {SplitComponent} from '../../vendor/angular-split/public_api';
import {WINDOW} from '../../application-providers/window_provider';
import {Debouncer} from '../utils/debouncer';

export const RESIZE_DEBOUNCE = 50; // in milliseconds

export type Direction = 'vertical' | 'horizontal';

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
export class ResponsiveSplitDirective implements OnDestroy {
  private readonly host = inject(SplitComponent);
  private readonly elementRef = inject(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly window = inject<typeof globalThis>(WINDOW);
  private resizeObserver: ResizeObserver;
  private debouncer: Debouncer;

  protected readonly config = input.required<ResponsiveSplitConfig>({
    alias: 'ngResponsiveSplit',
  });

  protected readonly directionChange = output<Direction>();

  constructor() {
    this.debouncer = new Debouncer();
    this.resizeObserver = new this.window.ResizeObserver(
      this.debouncer.debounce(([entry]) => {
        // Since used in a ResizeObserver which is not
        // patched by zone.js, run inside a zone.
        this.zone.run(() => {
          if (entry.contentBoxSize) {
            const [{inlineSize, blockSize}] = entry.contentBoxSize;
            this.applyDirection(inlineSize, blockSize);
          }
        });
      }, RESIZE_DEBOUNCE),
    );

    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.debouncer.cancel();
    this.resizeObserver.unobserve(this.elementRef.nativeElement);
  }

  private applyDirection(width: number, height: number) {
    const ratio = width / height;
    const {defaultDirection, breakpointDirection, aspectRatioBreakpoint} = this.config();
    let newDir: Direction = defaultDirection;

    if (ratio >= aspectRatioBreakpoint) {
      newDir = breakpointDirection;
    }

    if (this.host.direction !== newDir) {
      this.host.direction = newDir;
      this.directionChange.emit(newDir);
    }
  }
}
