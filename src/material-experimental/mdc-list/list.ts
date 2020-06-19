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
  Directive,
  ElementRef,
  NgZone,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {MatLine} from '@angular/material/core';
import {MatListBase, MatListItemBase} from './list-base';

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar]',
  host: {'class': 'mat-mdc-list-avatar mdc-list-item__graphic'}
})
export class MatListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-icon], [matListIcon]',
  host: {'class': 'mat-mdc-list-icon mdc-list-item__graphic'}
})
export class MatListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  // TODO(mmalerba): MDC's subheader font looks identical to the list item font, figure out why and
  //  make a change in one of the repos to visually distinguish.
  host: {'class': 'mat-mdc-subheader mdc-list-group__subheader'}
})
export class MatListSubheaderCssMatStyler {}

@Component({
  selector: 'mat-list',
  exportAs: 'matList',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-mdc-list mat-mdc-list-base mdc-list',
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
    'class': 'mat-mdc-list-item mdc-list-item',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MatListItemBase, useExisting: MatListItem},
  ]
})
export class MatListItem extends MatListItemBase {
  @ContentChildren(MatLine, {read: ElementRef, descendants: true}) lines:
      QueryList<ElementRef<Element>>;

  constructor(element: ElementRef, ngZone: NgZone, listBase: MatListBase, platform: Platform) {
    super(element, ngZone, listBase, platform);
  }
}
