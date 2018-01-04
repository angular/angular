/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {
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
  CanColor,
  CanDisable,
  CanDisableRipple,
  HasTabIndex,
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
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {Subject} from 'rxjs/Subject';
import {MatInkBar} from '../ink-bar';


// Boilerplate for applying mixins to MatTabNav.
/** @docs-private */
export class MatTabNavBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatTabNavMixinBase = mixinDisableRipple(mixinColor(MatTabNavBase, 'primary'));

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
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTabNav extends _MatTabNavMixinBase implements AfterContentInit, CanColor,
    CanDisableRipple, OnDestroy {

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  _activeLinkChanged: boolean;
  _activeLinkElement: ElementRef;

  @ViewChild(MatInkBar) _inkBar: MatInkBar;

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

  /** Whether ripples should be disabled for all links or not. */
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) {
    this._disableRipple = coerceBooleanProperty(value);
    this._setLinkDisableRipple();
  }
  private _disableRipple: boolean = false;

  constructor(elementRef: ElementRef,
              @Optional() private _dir: Directionality,
              private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef,
              private _viewportRuler: ViewportRuler) {
    super(elementRef);
  }

  /** Notifies the component that the active link has been changed. */
  updateActiveLink(element: ElementRef) {
    this._activeLinkChanged = this._activeLinkElement != element;
    this._activeLinkElement = element;

    if (this._activeLinkChanged) {
      this._changeDetectorRef.markForCheck();
    }
  }

  ngAfterContentInit(): void {
    this._ngZone.runOutsideAngular(() => {
      const dirChange = this._dir ? this._dir.change : observableOf(null);

      return merge(dirChange, this._viewportRuler.change(10)).pipe(takeUntil(this._onDestroy))
          .subscribe(() => this._alignInkBar());
    });

    this._setLinkDisableRipple();
  }

  /** Checks if the active link has been changed and, if so, will update the ink bar. */
  ngAfterContentChecked(): void {
    if (this._activeLinkChanged) {
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
      this._inkBar.alignToElement(this._activeLinkElement.nativeElement);
    }
  }

  /** Sets the `disableRipple` property on each link of the navigation bar. */
  private _setLinkDisableRipple() {
    if (this._tabLinks) {
      this._tabLinks.forEach(link => link.disableRipple = this.disableRipple);
    }
  }
}


// Boilerplate for applying mixins to MatTabLink.
export class MatTabLinkBase {}
export const _MatTabLinkMixinBase =
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
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.tabIndex]': 'tabIndex',
    '[class.mat-tab-disabled]': 'disabled',
    '[class.mat-tab-label-active]': 'active',
  }
})
export class MatTabLink extends _MatTabLinkMixinBase
    implements OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget {

  /** Whether the tab link is active or not. */
  private _isActive: boolean = false;

  /** Reference to the RippleRenderer for the tab-link. */
  private _tabLinkRipple: RippleRenderer;

  /** Whether the link is active. */
  @Input()
  get active(): boolean { return this._isActive; }
  set active(value: boolean) {
    this._isActive = value;
    if (value) {
      this._tabNavBar.updateActiveLink(this._elementRef);
    }
  }

  /**
   * Ripple configuration for ripples that are launched on pointer down.
   * @docs-private
   */
  rippleConfig: RippleConfig = {};

  /**
   * Whether ripples are disabled on interaction
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return this.disabled || this.disableRipple;
  }

  constructor(private _tabNavBar: MatTabNav,
              private _elementRef: ElementRef,
              ngZone: NgZone,
              platform: Platform,
              @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS) globalOptions: RippleGlobalOptions,
              @Attribute('tabindex') tabIndex: string) {
    super();

    this._tabLinkRipple = new RippleRenderer(this, ngZone, _elementRef, platform);
    this._tabLinkRipple.setupTriggerEvents(_elementRef.nativeElement);

    this.tabIndex = parseInt(tabIndex) || 0;

    if (globalOptions) {
      this.rippleConfig = {speedFactor: globalOptions.baseSpeedFactor};
    }
  }

  ngOnDestroy() {
    this._tabLinkRipple._removeTriggerEvents();
  }
}
