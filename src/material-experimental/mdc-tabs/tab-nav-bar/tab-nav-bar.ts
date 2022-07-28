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
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {
  _MatTabNavBase,
  _MatTabLinkBase as BaseMatTabLink,
  MAT_TABS_CONFIG,
  MatTabsConfig,
} from '@angular/material/tabs';
import {Directionality} from '@angular/cdk/bidi';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Platform} from '@angular/cdk/platform';
import {MatInkBar, MatInkBarItem, mixinInkBarItem} from '../ink-bar';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

const _MatTabLinkBase = mixinInkBarItem(BaseMatTabLink);

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
    '[attr.role]': '_getRole()',
    'class': 'mat-mdc-tab-nav-bar mat-mdc-tab-header',
    '[class.mat-mdc-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-mdc-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
    '[class.mat-mdc-tab-nav-bar-stretch-tabs]': 'stretchTabs',
    '[class.mat-primary]': 'color !== "warn" && color !== "accent"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MatTabNav extends _MatTabNavBase implements AfterContentInit, AfterViewInit {
  /** Whether the ink bar should fit its width to the size of the tab label content. */
  @Input()
  get fitInkBarToContent(): boolean {
    return this._fitInkBarToContent.value;
  }
  set fitInkBarToContent(v: BooleanInput) {
    this._fitInkBarToContent.next(coerceBooleanProperty(v));
    this._changeDetectorRef.markForCheck();
  }
  _fitInkBarToContent = new BehaviorSubject(false);

  /** Whether tabs should be stretched to fill the header. */
  @Input('mat-stretch-tabs')
  get stretchTabs(): boolean {
    return this._stretchTabs;
  }
  set stretchTabs(v: BooleanInput) {
    this._stretchTabs = coerceBooleanProperty(v);
  }
  private _stretchTabs = true;

  @ContentChildren(forwardRef(() => MatTabLink), {descendants: true}) _items: QueryList<MatTabLink>;
  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('tabListInner', {static: true}) _tabListInner: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;
  _inkBar: MatInkBar;

  constructor(
    elementRef: ElementRef,
    @Optional() dir: Directionality,
    ngZone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    viewportRuler: ViewportRuler,
    platform: Platform,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional() @Inject(MAT_TABS_CONFIG) defaultConfig?: MatTabsConfig,
  ) {
    super(elementRef, dir, ngZone, changeDetectorRef, viewportRuler, platform, animationMode);
    this.disablePagination =
      defaultConfig && defaultConfig.disablePagination != null
        ? defaultConfig.disablePagination
        : false;
    this.fitInkBarToContent =
      defaultConfig && defaultConfig.fitInkBarToContent != null
        ? defaultConfig.fitInkBarToContent
        : false;
  }

  override ngAfterContentInit() {
    this._inkBar = new MatInkBar(this._items);
    super.ngAfterContentInit();
  }

  override ngAfterViewInit() {
    if (!this.tabPanel && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw new Error('A mat-tab-nav-panel must be specified via [tabPanel].');
    }
  }
}

/**
 * Link inside of a `mat-tab-nav-bar`.
 */
@Component({
  selector: '[mat-tab-link], [matTabLink]',
  exportAs: 'matTabLink',
  inputs: ['disabled', 'disableRipple', 'tabIndex', 'active', 'id'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'tab-link.html',
  styleUrls: ['tab-link.css'],
  host: {
    'class': 'mdc-tab mat-mdc-tab-link mat-mdc-focus-indicator',
    '[attr.aria-controls]': '_getAriaControls()',
    '[attr.aria-current]': '_getAriaCurrent()',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-selected]': '_getAriaSelected()',
    '[attr.id]': 'id',
    '[attr.tabIndex]': '_getTabIndex()',
    '[attr.role]': '_getRole()',
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[class.mdc-tab--active]': 'active',
    '(focus)': '_handleFocus()',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class MatTabLink extends _MatTabLinkBase implements MatInkBarItem, OnDestroy {
  private readonly _destroyed = new Subject<void>();

  constructor(
    tabNavBar: MatTabNav,
    elementRef: ElementRef,
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS) globalRippleOptions: RippleGlobalOptions | null,
    @Attribute('tabindex') tabIndex: string,
    focusMonitor: FocusMonitor,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(tabNavBar, elementRef, globalRippleOptions, tabIndex, focusMonitor, animationMode);

    tabNavBar._fitInkBarToContent.pipe(takeUntil(this._destroyed)).subscribe(fitInkBarToContent => {
      this.fitInkBarToContent = fitInkBarToContent;
    });
  }

  override ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    super.ngOnDestroy();
  }
}

// Increasing integer for generating unique ids for tab nav components.
let nextUniqueId = 0;

/**
 * Tab panel component associated with MatTabNav.
 */
@Component({
  selector: 'mat-tab-nav-panel',
  exportAs: 'matTabNavPanel',
  template: '<ng-content></ng-content>',
  host: {
    '[attr.aria-labelledby]': '_activeTabId',
    '[attr.id]': 'id',
    'class': 'mat-mdc-tab-nav-panel',
    'role': 'tabpanel',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTabNavPanel {
  /** Unique id for the tab panel. */
  @Input() id = `mat-tab-nav-panel-${nextUniqueId++}`;

  /** Id of the active tab in the nav bar. */
  _activeTabId?: string;
}
