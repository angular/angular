/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
let BreadcrumbsComponent = class BreadcrumbsComponent {
  constructor() {
    this.parents = input.required();
    this.handleSelect = output();
    this.mouseOverNode = output();
    this.mouseLeaveNode = output();
    this.breadcrumbsScrollContent = viewChild.required('breadcrumbs');
    this.showScrollLeftButton = computed(() => {
      const value = this.breadcrumbsScrollLayout();
      return value && value.scrollLeft > 0;
    });
    this.showScrollRightButton = computed(() => {
      const value = this.breadcrumbsScrollLayout();
      if (!value) {
        return false;
      }
      const {clientWidth, scrollWidth, scrollLeft} = value;
      return scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth;
    });
    this.breadcrumbsScrollLayout = signal(undefined);
    effect((cleanup) => {
      const observer = new ResizeObserver(() => this.updateScrollButtonVisibility());
      observer.observe(this.breadcrumbsScrollContent().nativeElement);
      cleanup(() => observer.disconnect());
    });
  }
  scroll(pixels) {
    this.breadcrumbsScrollContent().nativeElement.scrollLeft += pixels;
    this.updateScrollButtonVisibility();
  }
  updateScrollButtonVisibility() {
    const {clientWidth, scrollWidth, scrollLeft} = this.breadcrumbsScrollContent().nativeElement;
    this.breadcrumbsScrollLayout.set({clientWidth, scrollWidth, scrollLeft});
  }
};
BreadcrumbsComponent = __decorate(
  [
    Component({
      selector: 'ng-breadcrumbs',
      templateUrl: './breadcrumbs.component.html',
      styleUrls: ['./breadcrumbs.component.scss'],
      imports: [MatIcon],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  BreadcrumbsComponent,
);
export {BreadcrumbsComponent};
//# sourceMappingURL=breadcrumbs.component.js.map
