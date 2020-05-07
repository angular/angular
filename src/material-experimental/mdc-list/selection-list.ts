/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  forwardRef,
  NgZone,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatLine} from '@angular/material/core';
import {MatListBase, MatListItemBase} from './list-base';

const MAT_SELECTION_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSelectionList),
  multi: true
};

/** Change event that is being fired whenever the selected state of an option changes. */
export class MatSelectionListChange {
  constructor(
      /** Reference to the selection list that emitted the event. */
      public source: MatSelectionList,
      /** Reference to the option that has been changed. */
      public option: MatListOption) {}
}

@Component({
  selector: 'mat-selection-list',
  exportAs: 'matSelectionList',
  host: {
    'class': 'mat-mdc-selection-list mat-mdc-list-base'
  },
  templateUrl: 'selection-list.html',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    MAT_SELECTION_LIST_VALUE_ACCESSOR,
    {provide: MatListBase, useExisting: MatSelectionList}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSelectionList extends MatListBase {}

@Component({
  selector: 'mat-list-option',
  exportAs: 'matListOption',
  host: {
    'class': 'mat-mdc-list-item mat-mdc-list-option',
  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListOption extends MatListItemBase {
  @ContentChildren(MatLine, {read: ElementRef, descendants: true}) lines:
      QueryList<ElementRef<Element>>;

  constructor(element: ElementRef, ngZone: NgZone, listBase: MatListBase, platform: Platform) {
    super(element, ngZone, listBase, platform);
  }
}
