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
  ContentChildren,
  ElementRef,
  forwardRef,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  Optional,
  Inject,
  Attribute,
  OnDestroy,
  AfterContentInit,
  NgZone,
  ChangeDetectorRef, OnInit, Input,
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {
  _MatTabNavBase,
  _MatTabLinkBase,
  MAT_TABS_CONFIG,
  MatTabsConfig
} from '@angular/material/tabs';
import {DOCUMENT} from '@angular/common';
import {Directionality} from '@angular/cdk/bidi';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Platform} from '@angular/cdk/platform';
import {MatInkBar, MatInkBarItem, MatInkBarFoundation} from '../ink-bar';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  selector: '[mat-tab-nav-bar]',
  exportAs: 'matTabNavBar, matTabNav',
  inputs: ['color'],
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
  host: {
    'class': 'mat-mdc-tab-nav-bar mat-mdc-tab-header',
    '[class.mat-mdc-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-mdc-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
    '[class.mat-primary]': 'color !== "warn" && color !== "accent"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTabNav extends _MatTabNavBase implements AfterContentInit {
  /** Whether the ink bar should fit its width to the size of the tab label content. */
  @Input()
  get fitInkBarToContent(): boolean { return this._fitInkBarToContent.value; }
  set fitInkBarToContent(v: boolean) {
    this._fitInkBarToContent.next(coerceBooleanProperty(v));
    this._changeDetectorRef.markForCheck();
  }
  _fitInkBarToContent = new BehaviorSubject(false);

  @ContentChildren(forwardRef(() => MatTabLink), {descendants: true}) _items: QueryList<MatTabLink>;
  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;
  _inkBar: MatInkBar;

  constructor(elementRef: ElementRef,
              @Optional() dir: Directionality,
              ngZone: NgZone,
              changeDetectorRef: ChangeDetectorRef,
              viewportRuler: ViewportRuler,
              /**
               * @deprecated @breaking-change 9.0.0 `platform` parameter to become required.
               */
              @Optional() platform?: Platform,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
              @Optional() @Inject(MAT_TABS_CONFIG) defaultConfig?: MatTabsConfig) {
    super(elementRef, dir, ngZone, changeDetectorRef, viewportRuler, platform, animationMode);
    this.disablePagination = defaultConfig && defaultConfig.disablePagination != null ?
        defaultConfig.disablePagination : false;
    this.fitInkBarToContent = defaultConfig && defaultConfig.fitInkBarToContent != null ?
        defaultConfig.fitInkBarToContent : false;
  }

  ngAfterContentInit() {
    this._inkBar = new MatInkBar(this._items);
    super.ngAfterContentInit();
  }

  static ngAcceptInputType_fitInkBarToContent: boolean | string | null | undefined;
  static ngAcceptInputType_disableRipple: boolean | string | null | undefined;
  static ngAcceptInputType_selectedIndex: number | string | null | undefined;
}

/**
 * Link inside of a `mat-tab-nav-bar`.
 */
@Component({
  selector: '[mat-tab-link], [matTabLink]',
  exportAs: 'matTabLink',
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'tab-link.html',
  styleUrls: ['tab-link.css'],
  host: {
    'class': 'mdc-tab mat-mdc-tab-link',
    '[attr.aria-current]': 'active ? "page" : null',
    '[attr.aria-disabled]': 'disabled',
    '[attr.tabIndex]': 'tabIndex',
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[class.mdc-tab--active]': 'active',
  }
})
export class MatTabLink extends _MatTabLinkBase implements MatInkBarItem, OnInit, OnDestroy {
  _foundation = new MatInkBarFoundation(this.elementRef.nativeElement, this._document);

  private readonly _destroyed = new Subject<void>();

  constructor(
    tabNavBar: MatTabNav,
    elementRef: ElementRef,
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS) globalRippleOptions: RippleGlobalOptions|null,
    @Attribute('tabindex') tabIndex: string, focusMonitor: FocusMonitor,
    @Inject(DOCUMENT) private _document: any,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(tabNavBar, elementRef, globalRippleOptions, tabIndex, focusMonitor, animationMode);

    tabNavBar._fitInkBarToContent.pipe(takeUntil(this._destroyed)).subscribe(fitInkBarToContent => {
      this._foundation.setFitToContent(fitInkBarToContent);
    });
  }

  ngOnInit() {
    this._foundation.init();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    super.ngOnDestroy();
    this._foundation.destroy();
  }

  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_disableRipple: boolean | string | null | undefined;
}
