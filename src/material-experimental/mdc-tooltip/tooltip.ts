/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Inject,
  NgZone,
  Optional,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {AriaDescriber, FocusMonitor} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {ConnectedPosition, Overlay, ScrollDispatcher} from '@angular/cdk/overlay';
import {
  MatTooltipDefaultOptions,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  _MatTooltipBase,
  _TooltipComponentBase,
} from '@angular/material/tooltip';
import {numbers} from '@material/tooltip';
import {matTooltipAnimations} from './tooltip-animations';

/**
 * CSS class that will be attached to the overlay panel.
 * @deprecated
 * @breaking-change 13.0.0 remove this variable
 */
export const TOOLTIP_PANEL_CLASS = 'mat-mdc-tooltip-panel';

/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.io/design/components/tooltips.html
 */
@Directive({
  selector: '[matTooltip]',
  exportAs: 'matTooltip',
  host: {
    'class': 'mat-mdc-tooltip-trigger'
  }
})
export class MatTooltip extends _MatTooltipBase<TooltipComponent> {
  protected override readonly _tooltipComponent = TooltipComponent;
  protected override readonly _cssClassPrefix = 'mat-mdc';

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
    @Inject(DOCUMENT) _document: any) {

    super(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber,
      focusMonitor, scrollStrategy, dir, defaultOptions, _document);
    this._viewportMargin = numbers.MIN_VIEWPORT_TOOLTIP_THRESHOLD;
  }

  protected override _addOffset(position: ConnectedPosition): ConnectedPosition {
    const offset = numbers.UNBOUNDED_ANCHOR_GAP;
    const isLtr = !this._dir || this._dir.value == 'ltr';

    if (position.originY === 'top') {
      position.offsetY = -offset;
    } else if (position.originY === 'bottom') {
      position.offsetY = offset;
    } else if (position.originX === 'start') {
      position.offsetX = isLtr ? -offset : offset;
    } else if (position.originX === 'end') {
      position.offsetX = isLtr ? offset : -offset;
    }

    return position;
  }
}

/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
@Component({
  selector: 'mat-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [matTooltipAnimations.tooltipState],
  host: {
    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
    // won't be rendered if the animations are disabled or there is no web animations polyfill.
    '[style.zoom]': '_visibility === "visible" ? 1 : null',
    'aria-hidden': 'true',
  }
})
export class TooltipComponent extends _TooltipComponentBase {
  /* Whether the tooltip text overflows to multiple lines */
  _isMultiline: boolean = false;

  constructor(changeDetectorRef: ChangeDetectorRef, private _elementRef: ElementRef) {
    super(changeDetectorRef);
  }

  protected override _onShow(): void {
    this._isMultiline = this._isTooltipMultiline();
  }

  /** Whether the tooltip text has overflown to the next line */
  private _isTooltipMultiline() {
    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    return rect.height > numbers.MIN_HEIGHT && rect.width >= numbers.MAX_WIDTH;
  }
}
