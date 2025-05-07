/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Directive, ElementRef, inject, input, OnInit, output} from '@angular/core';
import {SplitComponent} from '../../vendor/angular-split/public_api';

const RESIZE_DEBOUNCE = 50; // in milliseconds

export type Direction = 'vertical' | 'horizontal';

export type ResponsiveSplitConfig = {
  /** Default direction of the as-split */
  defaultDirection: Direction;
  /** Rules that describe the responsive behavior of the as-split. If the ratio is equal or grater than `aboveRatio`, the provided `direction` will be applied. */
  rules: {
    aboveRatio: number;
    direction: Direction;
  }[];
};

/** Make as-split direction responsive. */
@Directive({
  selector: 'as-split[ngResponsiveSplit]',
  host: {
    '(window:resize)': 'onWindowResize()',
  },
})
export class ResponsiveSplitDirective implements OnInit {
  private readonly host = inject(SplitComponent);
  private readonly elementRef = inject(ElementRef);
  private resizeTimeout?: ReturnType<typeof setTimeout>;

  protected readonly config = input.required<ResponsiveSplitConfig>({
    alias: 'ngResponsiveSplit',
  });

  private readonly rules = computed(() =>
    this.config().rules.sort((a, b) => b.aboveRatio - a.aboveRatio),
  );

  protected readonly directionChange = output<Direction>();

  ngOnInit() {
    this.applyDirection();
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
    let newDir: Direction = this.config().defaultDirection;

    for (const rule of this.rules()) {
      if (ratio >= rule.aboveRatio) {
        newDir = rule.direction;
        break;
      }
    }

    if (this.host.direction !== newDir) {
      this.host.direction = newDir;
      this.directionChange.emit(newDir);
    }
  }
}
