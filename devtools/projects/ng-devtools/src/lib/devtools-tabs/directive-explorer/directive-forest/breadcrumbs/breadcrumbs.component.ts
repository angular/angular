/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {FlatNode} from '../component-data-source';
import {Debouncer} from '../../../../shared/utils/debouncer';

const RESIZE_DEBOUNCE = 100;

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  imports: [MatIcon],
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

  constructor(destroyRef: DestroyRef) {
    const debouncer = new Debouncer();
    const observer = new ResizeObserver(
      debouncer.debounce(() => {
        this.updateScrollButtonVisibility();
      }, RESIZE_DEBOUNCE),
    );

    afterNextRender(() => {
      observer.observe(this.breadcrumbsScrollContent().nativeElement);
    });

    afterRenderEffect({
      read: () => {
        // We use the parents as a dependency to trigger a layout
        // update that would show the navigation buttons.
        this.parents();
        untracked(() => this.updateScrollButtonVisibility());
      },
    });

    destroyRef.onDestroy(() => {
      debouncer.cancel();
      observer.disconnect();
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
