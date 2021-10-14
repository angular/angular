/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {
  CdkColumnDef,
  _CoalescedStyleScheduler,
  _COALESCED_STYLE_SCHEDULER,
} from '@angular/cdk/table';
import {Directionality} from '@angular/cdk/bidi';
import {
  ColumnResize,
  ColumnResizeNotifierSource,
  HeaderRowEventDispatcher,
  ResizeOverlayHandle,
  ResizeRef,
} from '@angular/cdk-experimental/column-resize';

import {AbstractMatColumnResize} from './column-resize-directives/common';

/**
 * Component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying a vertical line along the column edge.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {'class': 'mat-column-resize-overlay-thumb'},
  template: '',
})
export class MatColumnResizeOverlayHandle extends ResizeOverlayHandle {
  protected readonly document: Document;

  constructor(
    protected readonly columnDef: CdkColumnDef,
    protected readonly columnResize: ColumnResize,
    protected readonly directionality: Directionality,
    protected readonly elementRef: ElementRef,
    protected readonly eventDispatcher: HeaderRowEventDispatcher,
    protected readonly ngZone: NgZone,
    protected readonly resizeNotifier: ColumnResizeNotifierSource,
    protected readonly resizeRef: ResizeRef,
    @Inject(_COALESCED_STYLE_SCHEDULER)
    protected readonly styleScheduler: _CoalescedStyleScheduler,
    @Inject(DOCUMENT) document: any,
  ) {
    super();
    this.document = document;
  }

  protected override updateResizeActive(active: boolean): void {
    super.updateResizeActive(active);

    this.resizeRef.overlayRef.updateSize({
      height: active
        ? (this.columnResize as AbstractMatColumnResize).getTableHeight()
        : this.resizeRef.origin.nativeElement!.offsetHeight,
    });
  }
}
