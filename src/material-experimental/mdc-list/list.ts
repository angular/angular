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
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MatListBase, MatListItemBase} from './list-base';

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
    '[class.mdc-list-item--with-leading-avatar]': '_avatars.length !== 0',
    '[class.mdc-list-item--with-leading-icon]': '_icons.length !== 0',
    // If there are projected lines, we project the remaining content into the `mdc-list-item__end`
    // container. In order to make sure the container aligns properly (if there is content), we add
    // the trailing meta class. Note that we also add this even if there is no projected `meta`
    // content. This is because there is no good way to check for remaining projected content.
    '[class.mdc-list-item--with-trailing-meta]': 'lines.length !== 0',
    '[class._mat-animation-noopable]': '_noopAnimations',
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
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS) globalRippleOptions?: RippleGlobalOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(element, ngZone, listBase, platform, globalRippleOptions, animationMode);
  }
}
