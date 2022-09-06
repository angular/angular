/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AriaDescriber, FocusMonitor} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Overlay} from '@angular/cdk/overlay';
import {Platform} from '@angular/cdk/platform';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Inject,
  NgZone,
  Optional,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {Observable} from 'rxjs';
import {
  _MatTooltipBase,
  _TooltipComponentBase,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MatTooltipDefaultOptions,
} from '@angular/material/tooltip';

/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.io/design/components/tooltips.html
 *
 * @deprecated Use `MatTooltip` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: '[matTooltip]',
  exportAs: 'matTooltip',
  host: {
    'class': 'mat-tooltip-trigger',
  },
})
export class MatLegacyTooltip extends _MatTooltipBase<LegacyTooltipComponent> {
  protected readonly _tooltipComponent = LegacyTooltipComponent;

  constructor(
    overlay: Overlay,
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    viewContainerRef: ViewContainerRef,
    ngZone: NgZone,
    platform: Platform,
    ariaDescriber: AriaDescriber,
    focusMonitor: FocusMonitor,
    @Inject(MAT_TOOLTIP_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() dir: Directionality,
    @Optional() @Inject(MAT_TOOLTIP_DEFAULT_OPTIONS) defaultOptions: MatTooltipDefaultOptions,
    @Inject(DOCUMENT) _document: any,
  ) {
    super(
      overlay,
      elementRef,
      scrollDispatcher,
      viewContainerRef,
      ngZone,
      platform,
      ariaDescriber,
      focusMonitor,
      scrollStrategy,
      dir,
      defaultOptions,
      _document,
    );
  }
}

/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 * @deprecated Use `TooltipComponent` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Component({
  selector: 'mat-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
    // won't be rendered if the animations are disabled or there is no web animations polyfill.
    '[style.zoom]': 'isVisible() ? 1 : null',
    '(mouseleave)': '_handleMouseLeave($event)',
    'aria-hidden': 'true',
  },
})
export class LegacyTooltipComponent extends _TooltipComponentBase {
  /** Stream that emits whether the user has a handset-sized display.  */
  _isHandset: Observable<BreakpointState> = this._breakpointObserver.observe(Breakpoints.Handset);
  _showAnimation = 'mat-tooltip-show';
  _hideAnimation = 'mat-tooltip-hide';

  @ViewChild('tooltip', {
    // Use a static query here since we interact directly with
    // the DOM which can happen before `ngAfterViewInit`.
    static: true,
  })
  _tooltip: ElementRef<HTMLElement>;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    private _breakpointObserver: BreakpointObserver,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(changeDetectorRef, animationMode);
  }
}
