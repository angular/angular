/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {FlatNode} from '../component-data-source';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  standalone: true,
  imports: [MatCard, MatIcon, MatButton],
})
export class BreadcrumbsComponent {
  readonly parents = input.required<FlatNode[]>();
  readonly handleSelect = output<FlatNode>();
  readonly mouseOverNode = output<FlatNode>();
  readonly mouseLeaveNode = output<FlatNode>();

  readonly breadcrumbsScrollContent = viewChild.required<ElementRef>('breadcrumbs');

  readonly showScrollLeftButton = computed(() => {
    const _ = this.parents();
    const __ = this.scrollUpdate();
    const {scrollLeft} = this.breadcrumbsScrollContent().nativeElement;
    return scrollLeft > 0;
  });

  readonly showScrollRightButton = computed(() => {
    const _ = this.parents();
    const __ = this.scrollUpdate();
    const {clientWidth, scrollWidth, scrollLeft} = this.breadcrumbsScrollContent().nativeElement;
    return scrollLeft + clientWidth < scrollWidth;
  });

  readonly updateScrollButtonVisibility$ = new Subject<void>();
  private readonly scrollUpdate = signal<number>(0);

  constructor() {
    this.updateScrollButtonVisibility$
      .pipe(debounceTime(100))
      .subscribe(() => this.updateScrollButtonVisibility());
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateScrollButtonVisibility$.next();
  }

  scroll(pixels: number): void {
    this.breadcrumbsScrollContent().nativeElement.scrollLeft += pixels;
    this.updateScrollButtonVisibility$.next();
  }

  updateScrollButtonVisibility(): void {
    this.scrollUpdate.update((x) => x + 1);
  }
}
