/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
  Input,
  Inject,
  Directive,
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatInkBar} from './ink-bar';
import {MatTabLabelWrapper} from './tab-label-wrapper';
import {Platform} from '@angular/cdk/platform';
import {MatPaginatedTabHeader} from './paginated-tab-header';

/**
 * Base class with all of the `MatTabHeader` functionality.
 * @docs-private
 */
@Directive()
export abstract class _MatTabHeaderBase
  extends MatPaginatedTabHeader
  implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy
{
  /** Whether the ripple effect is disabled or not. */
  @Input()
  get disableRipple(): boolean {
    return this._disableRipple;
  }
  set disableRipple(value: BooleanInput) {
    this._disableRipple = coerceBooleanProperty(value);
  }
  private _disableRipple: boolean = false;

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    viewportRuler: ViewportRuler,
    @Optional() dir: Directionality,
    ngZone: NgZone,
    platform: Platform,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode);
  }

  protected _itemSelected(event: KeyboardEvent) {
    event.preventDefault();
  }
}

/**
 * The header of the tab group which displays a list of all the tabs in the tab group. Includes
 * an ink bar that follows the currently selected tab. When the tabs list's width exceeds the
 * width of the header container, then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
  selector: 'mat-tab-header',
  templateUrl: 'tab-header.html',
  styleUrls: ['tab-header.css'],
  inputs: ['selectedIndex'],
  outputs: ['selectFocusedIndex', 'indexFocused'],
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    'class': 'mat-tab-header',
    '[class.mat-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
  },
})
export class MatTabHeader extends _MatTabHeaderBase {
  @ContentChildren(MatTabLabelWrapper, {descendants: false}) _items: QueryList<MatTabLabelWrapper>;
  @ViewChild(MatInkBar, {static: true}) _inkBar: MatInkBar;
  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('tabListInner', {static: true}) _tabListInner: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    viewportRuler: ViewportRuler,
    @Optional() dir: Directionality,
    ngZone: NgZone,
    platform: Platform,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode);
  }
}
