/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {FlatNode} from '../component-data-source';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  imports: [MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  readonly parents = input.required<FlatNode[]>();
  readonly handleSelect = output<FlatNode>();
  readonly mouseOverNode = output<FlatNode>();
  readonly mouseLeaveNode = output<FlatNode>();

  readonly breadcrumbsScrollContent = viewChild.required<ElementRef>('breadcrumbs');

  readonly showScrollLeftButton = computed(() => {
    const value = this.breadcrumbsScrollLayout();
    return value && value.scrollLeft > 0;
  });

  readonly showScrollRightButton = computed(() => {
    const value = this.breadcrumbsScrollLayout();
    if (!value) {
      return false;
    }
    const {clientWidth, scrollWidth, scrollLeft} = value;
    return scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth;
  });

  private readonly breadcrumbsScrollLayout = signal<
    | {
        clientWidth: number;
        scrollWidth: number;
        scrollLeft: number;
      }
    | undefined
  >(undefined);

  constructor() {
    effect((cleanup) => {
      const observer = new ResizeObserver(() => this.updateScrollButtonVisibility());
      observer.observe(this.breadcrumbsScrollContent().nativeElement);
      cleanup(() => observer.disconnect());
    });
  }

  scroll(pixels: number): void {
    this.breadcrumbsScrollContent().nativeElement.scrollLeft += pixels;
    this.updateScrollButtonVisibility();
  }

  updateScrollButtonVisibility(): void {
    const {clientWidth, scrollWidth, scrollLeft} = this.breadcrumbsScrollContent().nativeElement;
    this.breadcrumbsScrollLayout.set({clientWidth, scrollWidth, scrollLeft});
  }
}
