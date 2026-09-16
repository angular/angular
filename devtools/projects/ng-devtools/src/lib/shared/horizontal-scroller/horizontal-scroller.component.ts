/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {Debouncer} from '../utils/debouncer';

const RESIZE_DEBOUNCE = 100;
const DEFAULT_SCROLL_STEP = 100; // in pixels

interface ScrollLayout {
  clientWidth: number;
  scrollWidth: number;
  scrollLeft: number;
}

/**
 * Horizontal scroller with scroll arrows.
 *
 * Use `--horizontal-scroller-height` CSS var to adjust the height.
 * Default: `24px`
 */
@Component({
  selector: 'ng-horizontal-scroller',
  templateUrl: './horizontal-scroller.component.html',
  styleUrls: ['./horizontal-scroller.component.scss'],
  imports: [MatIcon],
})
export class HorizontalScrollerComponent {
  readonly scrollContent = viewChild.required<ElementRef>('content');

  /** The scroll step size in pixels. Default: `100` */
  readonly scrollStep = input<number>(DEFAULT_SCROLL_STEP);

  /**
   * Select the scroll buttons behavior when they are not visible:
   * - `hidden` (default) – buttons take up space but are invisible/hidden
   * - `display-none` – buttons are completely removed from the viewport
   */
  readonly buttonHidingStrategy = input<'hidden' | 'display-none'>('hidden');

  protected readonly showScrollLeftButton = computed(() => {
    const value = this.scrollLayout();
    return value && value.scrollLeft > 0;
  });

  protected readonly showScrollRightButton = computed(() => {
    const value = this.scrollLayout();
    if (!value) {
      return false;
    }
    const {clientWidth, scrollWidth, scrollLeft} = value;
    return scrollWidth > scrollLeft + clientWidth;
  });

  private readonly scrollLayout = signal<ScrollLayout | undefined>(undefined);

  constructor(destroyRef: DestroyRef) {
    const debouncer = new Debouncer();
    const observer = new ResizeObserver(
      debouncer.debounce(() => {
        this.updateScrollButtonVisibility();
      }, RESIZE_DEBOUNCE),
    );

    afterNextRender(() => {
      observer.observe(this.scrollContent().nativeElement);
    });

    destroyRef.onDestroy(() => {
      debouncer.cancel();
      observer.disconnect();
    });
  }

  scroll(pixels: number): void {
    this.scrollContent().nativeElement.scrollLeft += pixels;
    this.updateScrollButtonVisibility();
  }

  updateScrollButtonVisibility(): void {
    const {clientWidth, scrollWidth, scrollLeft} = this.scrollContent().nativeElement;

    // Sometimes the values can be decimal numbers,
    // like `scrollLeft` being always -0.5 off the total
    // scroll width. This is why, we round up the values.
    this.scrollLayout.set({
      clientWidth: Math.ceil(clientWidth),
      scrollWidth: Math.ceil(scrollWidth),
      scrollLeft: Math.ceil(scrollLeft),
    });
  }
}
