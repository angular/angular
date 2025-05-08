/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
} from '@angular/core';
import {SplitComponent} from '../../vendor/angular-split/public_api';

const RESIZE_DEBOUNCE = 50; // in milliseconds

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
export class ResponsiveSplitDirective implements OnInit, OnDestroy {
  private readonly host = inject(SplitComponent);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private resizeTimeout?: ReturnType<typeof setTimeout>;
  private resizeUnlisten?: () => void;

  protected readonly config = input.required<ResponsiveSplitConfig>({
    alias: 'ngResponsiveSplit',
  });

  protected readonly directionChange = output<Direction>();

  constructor() {
    afterNextRender({
      write: () => this.applyDirection(),
    });
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.resizeUnlisten = this.renderer.listen('window', 'resize', () => this.onWindowResize());
    });
  }

  ngOnDestroy() {
    this.resizeUnlisten?.();
  }

  protected onWindowResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => this.applyDirection(), RESIZE_DEBOUNCE);
  }

  private applyDirection() {
    const {clientWidth, clientHeight} = this.elementRef.nativeElement;
    const ratio = clientWidth / clientHeight;
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
