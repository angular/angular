/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, NgZone} from '@angular/core';
import {CdkTable} from '@angular/cdk/table';

import {ColumnResize} from '../column-resize';
import {ColumnResizeNotifier, ColumnResizeNotifierSource} from '../column-resize-notifier';
import {HeaderRowEventDispatcher} from '../event-dispatcher';
import {TABLE_PROVIDERS} from './constants';

/**
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
@Directive({
  selector: 'table[cdk-table]',
  providers: [
    ...TABLE_PROVIDERS,
    {provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize},
  ],
})
export class CdkDefaultEnabledColumnResize extends ColumnResize {
  constructor(
    readonly columnResizeNotifier: ColumnResizeNotifier,
    readonly elementRef: ElementRef<HTMLElement>,
    protected readonly eventDispatcher: HeaderRowEventDispatcher,
    protected readonly ngZone: NgZone,
    protected readonly notifier: ColumnResizeNotifierSource,
    protected readonly table: CdkTable<unknown>,
  ) {
    super();
  }
}
