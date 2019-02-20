/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {
  AfterContentChecked,
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanColor, CanColorCtor,
  CanDisable, CanDisableCtor,
  CanDisableRipple, CanDisableRippleCtor,
  HasTabIndex, HasTabIndexCtor,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  mixinTabIndex, RippleConfig,
  RippleGlobalOptions,
  RippleRenderer,
  RippleTarget,
  ThemePalette,
} from '@angular/material/core';
import {merge, of as observableOf, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatInkBar} from '../ink-bar';
import {FocusMonitor} from '@angular/cdk/a11y';


// Boilerplate for applying mixins to MatTabNav.
/** @docs-private */
export class MatTabNavBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatTabNavMixinBase: CanDisableRippleCtor & CanColorCtor & typeof MatTabNavBase =
    mixinDisableRipple(mixinColor(MatTabNavBase, 'primary'));

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  moduleId: module.id,
  selector: '[mat-tab-nav-bar]',
  exportAs: 'matTabNavBar, matTabNav',
  inputs: ['color', 'disableRipple'],
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
  host: {'class': 'mat-tab-nav-bar'},
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTabNav extends _MatTabNavMixinBase
    implements AfterContentChecked, AfterContentInit, CanColor, CanDisableRipple, OnDestroy {

  /** Subject that emits when the component has been destroyed. */
  private readonly _onDestroy = new Subject<void>();

  private _activeLinkChanged: boolean;
  private _activeLinkElement: ElementRef<HTMLElement> | null;

  @ViewChild(MatInkBar, {static: true}) _inkBar: MatInkBar;

  /** Query list of all tab links of the tab navigation. */
  @ContentChildren(forwardRef(() => MatTabLink), {descendants: true})
  _tabLinks: QueryList<MatTabLink>;

  /** Background color of the tab nav. */
  @Input()
  get backgroundColor(): ThemePalette { return this._backgroundColor; }
  set backgroundColor(value: ThemePalette) {
    const nativeElement: HTMLElement = this._elementRef.nativeElement;

    nativeElement.classList.remove(`mat-background-${this.backgroundColor}`);

    if (value) {
      nativeElement.classList.add(`mat-background-${value}`);
    }

    this._backgroundColor = value;
  }
  private _backgroundColor: ThemePalette;

  constructor(elementRef: ElementRef,
              @Optional() private _dir: Directionality,
              private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef,
              private _viewportRuler: ViewportRuler) {
    super(elementRef);
  }

  /**
   * Notifies the component that the active link has been changed.
   * @breaking-change 8.0.0 `element` parameter to be removed.
   */
  updateActiveLink(element: ElementRef) {
    // Note: keeping the `element` for backwards-compat, but isn't being used for anything.
    // @breaking-change 8.0.0
    this._activeLinkChanged = !!element;
    this._changeDetectorRef.markForCheck();
  }

  ngAfterContentInit(): void {
    this._ngZone.runOutsideAngular(() => {
      const dirChange = this._dir ? this._dir.change : observableOf(null);

      return merge(dirChange, this._viewportRuler.change(10))
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => this._alignInkBar());
    });
  }

  /** Checks if the active link has been changed and, if so, will update the ink bar. */
  ngAfterContentChecked(): void {
    if (this._activeLinkChanged) {
      const activeTab = this._tabLinks.find(tab => tab.active);

      this._activeLinkElement = activeTab ? activeTab._elementRef : null;
      this._alignInkBar();
      this._activeLinkChanged = false;
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /** Aligns the ink bar to the active link. */
  _alignInkBar(): void {
    if (this._activeLinkElement) {
      this._inkBar.show();
      this._inkBar.alignToElement(this._activeLinkElement.nativeElement);
    } else {
      this._inkBar.hide();
    }
  }
}


// Boilerplate for applying mixins to MatTabLink.
export class MatTabLinkBase {}
export const _MatTabLinkMixinBase:
    HasTabIndexCtor & CanDisableRippleCtor & CanDisableCtor & typeof MatTabLinkBase =
        mixinTabIndex(mixinDisableRipple(mixinDisabled(MatTabLinkBase)));

/**
 * Link inside of a `mat-tab-nav-bar`.
 */
@Directive({
  selector: '[mat-tab-link], [matTabLink]',
  exportAs: 'matTabLink',
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  host: {
    'class': 'mat-tab-link',
    '[attr.aria-current]': 'active',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.tabIndex]': 'tabIndex',
    '[class.mat-tab-disabled]': 'disabled',
    '[class.mat-tab-label-active]': 'active',
  }
})
export class MatTabLink extends _MatTabLinkMixinBase
    implements OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget {

  /** Whether the tab link is active or not. */
  protected _isActive: boolean = false;

  /** Reference to the RippleRenderer for the tab-link. */
  protected _tabLinkRipple: RippleRenderer;

  /** Whether the link is active. */
  @Input()
  get active(): boolean { return this._isActive; }
  set active(value: boolean) {
    if (value !== this._isActive) {
      this._isActive = value;
      this._tabNavBar.updateActiveLink(this._elementRef);
    }
  }

  /**
   * Ripple configuration for ripples that are launched on pointer down. The ripple config
   * is set to the global ripple options since we don't have any configurable options for
   * the tab link ripples.
   * @docs-private
   */
  rippleConfig: RippleConfig & RippleGlobalOptions;

  /**
   * Whether ripples are disabled on interaction.
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return this.disabled || this.disableRipple || this._tabNavBar.disableRipple ||
      !!this.rippleConfig.disabled;
  }

  constructor(private _tabNavBar: MatTabNav,
              public _elementRef: ElementRef,
              ngZone: NgZone,
              platform: Platform,
              @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
              globalRippleOptions: RippleGlobalOptions | null,
              @Attribute('tabindex') tabIndex: string,
              /**
               * @deprecated
               * @breaking-change 8.0.0 `_focusMonitor` parameter to be made required.
               */
              private _focusMonitor?: FocusMonitor) {
    super();

    this._tabLinkRipple = new RippleRenderer(this, ngZone, _elementRef, platform);
    this._tabLinkRipple.setupTriggerEvents(_elementRef.nativeElement);
    this.rippleConfig = globalRippleOptions || {};

    this.tabIndex = parseInt(tabIndex) || 0;

    if (_focusMonitor) {
      _focusMonitor.monitor(_elementRef);
    }
  }

  ngOnDestroy() {
    this._tabLinkRipple._removeTriggerEvents();

    if (this._focusMonitor) {
      this._focusMonitor.stopMonitoring(this._elementRef);
    }
  }
}
