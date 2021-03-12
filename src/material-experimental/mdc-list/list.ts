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
  Inject,
  NgZone,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  MatLine,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
} from '@angular/material-experimental/mdc-core';
import {MatListBase, MatListItemBase} from './list-base';

@Component({
  selector: 'mat-list',
  exportAs: 'matList',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-mdc-list mat-mdc-list-base mdc-deprecated-list',
  },
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MatListBase, useExisting: MatList},
  ]
})
export class MatList extends MatListBase {}

@Component({
  selector: 'mat-list-item, a[mat-list-item], button[mat-list-item]',
  exportAs: 'matListItem',
  host: {
    'class': 'mat-mdc-list-item mdc-deprecated-list-item',
    '[class.mat-mdc-list-item-with-avatar]': '_hasIconOrAvatar()',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListItem extends MatListItemBase {
  @ContentChildren(MatLine, {read: ElementRef, descendants: true}) lines:
      QueryList<ElementRef<Element>>;
  @ViewChild('text') _itemText: ElementRef<HTMLElement>;

  constructor(
    element: ElementRef,
    ngZone: NgZone,
    listBase: MatListBase,
    platform: Platform,
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS) globalRippleOptions?: RippleGlobalOptions) {
    super(element, ngZone, listBase, platform, globalRippleOptions);
  }
}
