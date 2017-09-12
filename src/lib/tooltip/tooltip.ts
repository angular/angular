/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Renderer2,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {ComponentPortal} from '@angular/cdk/portal';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
import {first} from '@angular/cdk/rxjs';
import {
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
  OverlayState,
  RepositionScrollStrategy,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE} from '@angular/cdk/keycodes';
import {AriaDescriber} from '@angular/cdk/a11y';


export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

/** Time in ms to delay before changing the tooltip visibility to hidden */
export const TOUCHEND_HIDE_DELAY = 1500;

/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;

/** CSS class that will be attached to the overlay panel. */
export const TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMdTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}

/** Injection token that determines the scroll handling while a tooltip is visible. */
export const MD_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('md-tooltip-scroll-strategy');

/** @docs-private */
export function MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}

/** @docs-private */
export const MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER = {
  provide: MD_TOOLTIP_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY
};
/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.google.com/components/tooltips.html
 */
@Directive({
  selector: '[md-tooltip], [mdTooltip], [mat-tooltip], [matTooltip]',
  host: {
    '(longpress)': 'show()',
    '(focus)': 'show()',
    '(blur)': 'hide(0)',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': 'hide(' + TOUCHEND_HIDE_DELAY + ')',
  },
  exportAs: 'mdTooltip',
})
export class MdTooltip implements OnDestroy {
  _overlayRef: OverlayRef | null;
  _tooltipInstance: TooltipComponent | null;

  private _position: TooltipPosition = 'below';
  private _disabled: boolean = false;
  private _tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** Allows the user to define the position of the tooltip relative to the parent element */
  @Input('mdTooltipPosition')
  get position(): TooltipPosition { return this._position; }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;

      // TODO(andrewjs): When the overlay's position can be dynamically changed, do not destroy
      // the tooltip.
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    }
  }

  /** Disables the display of the tooltip. */
  @Input('mdTooltipDisabled')
  get disabled(): boolean { return this._disabled; }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);

    // If tooltip is disabled, hide immediately.
    if (this._disabled) {
      this.hide(0);
    }
  }

  /** @deprecated */
  @Input('tooltip-position')
  get _positionDeprecated(): TooltipPosition { return this._position; }
  set _positionDeprecated(value: TooltipPosition) { this._position = value; }

  /** The default delay in ms before showing the tooltip after show is called */
  @Input('mdTooltipShowDelay') showDelay = 0;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('mdTooltipHideDelay') hideDelay = 0;

  private _message: string;

  /** The message to be displayed in the tooltip */
  @Input('mdTooltip') get message() { return this._message; }
  set message(value: string) {
    if (this._message) {
      this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message);
    }

    // If the message is not a string (e.g. number), convert it to a string and trim it.
    this._message = value ? `${value}`.trim() : '';
    this._updateTooltipMessage();
    this._ariaDescriber.describe(this._elementRef.nativeElement, this.message);
  }

  /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
  @Input('mdTooltipClass')
  get tooltipClass() { return this._tooltipClass; }
  set tooltipClass(value: string|string[]|Set<string>|{[key: string]: any}) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }

  /** @deprecated */
  @Input('md-tooltip')
  get _deprecatedMessage(): string { return this.message; }
  set _deprecatedMessage(v: string) { this.message = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltip')
  get _matMessage() { return this.message; }
  set _matMessage(v) { this.message = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipPosition')
  get _matPosition() { return this.position; }
  set _matPosition(v) { this.position = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipDisabled')
  get _matDisabled() { return this.disabled; }
  set _matDisabled(v) { this.disabled = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipHideDelay')
  get _matHideDelay() { return this.hideDelay; }
  set _matHideDelay(v) { this.hideDelay = v; }

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matTooltipShowDelay')
  get _matShowDelay() { return this.showDelay; }
  set _matShowDelay(v) { this.showDelay = v; }

  // Properties with `mat-` prefix for nonconflict mode.
  @Input('matTooltipClass')
  get _matClass() { return this.tooltipClass; }
  set _matClass(v) { this.tooltipClass = v; }

  private _enterListener: Function;
  private _leaveListener: Function;

  constructor(
    renderer: Renderer2,
    private _overlay: Overlay,
    private _elementRef: ElementRef,
    private _scrollDispatcher: ScrollDispatcher,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _platform: Platform,
    private _ariaDescriber: AriaDescriber,
    @Inject(MD_TOOLTIP_SCROLL_STRATEGY) private _scrollStrategy,
    @Optional() private _dir: Directionality) {

    // The mouse events shouldn't be bound on iOS devices, because
    // they can prevent the first tap from firing its click event.
    if (!_platform.IOS) {
      this._enterListener =
        renderer.listen(_elementRef.nativeElement, 'mouseenter', () => this.show());
      this._leaveListener =
        renderer.listen(_elementRef.nativeElement, 'mouseleave', () => this.hide());
    }
  }

  /**
   * Dispose the tooltip when destroyed.
   */
  ngOnDestroy() {
    if (this._tooltipInstance) {
      this._disposeTooltip();
    }
    // Clean up the event listeners set in the constructor
    if (!this._platform.IOS) {
      this._enterListener();
      this._leaveListener();
    }

    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.message);
  }

  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay: number = this.showDelay): void {
    if (this.disabled || !this.message) { return; }

    if (!this._tooltipInstance) {
      this._createTooltip();
    }

    this._setTooltipClass(this._tooltipClass);
    this._updateTooltipMessage();
    this._tooltipInstance!.show(this._position, delay);
  }

  /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
  hide(delay: number = this.hideDelay): void {
    if (this._tooltipInstance) {
      this._tooltipInstance.hide(delay);
    }
  }

  /** Shows/hides the tooltip */
  toggle(): void {
    this._isTooltipVisible() ? this.hide() : this.show();
  }

  /** Returns true if the tooltip is currently visible to the user */
  _isTooltipVisible(): boolean {
    return !!this._tooltipInstance && this._tooltipInstance.isVisible();
  }

  /** Handles the keydown events on the host element. */
  _handleKeydown(e: KeyboardEvent) {
    if (this._tooltipInstance!.isVisible() && e.keyCode === ESCAPE) {
      e.stopPropagation();
      this.hide(0);
    }
  }

  /** Create the tooltip to display */
  private _createTooltip(): void {
    let overlayRef = this._createOverlay();
    let portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);

    this._tooltipInstance = overlayRef.attach(portal).instance;

    // Dispose the overlay when finished the shown tooltip.
    this._tooltipInstance!.afterHidden().subscribe(() => {
      // Check first if the tooltip has already been removed through this components destroy.
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    });
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): OverlayRef {
    const origin = this._getOrigin();
    const position = this._getOverlayPosition();

    // Create connected position strategy that listens for scroll events to reposition.
    // After position changes occur and the overlay is clipped by a parent scrollable then
    // close the tooltip.
    const strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
    strategy.withScrollableContainers(this._scrollDispatcher.getScrollContainers(this._elementRef));
    strategy.onPositionChange.subscribe(change => {
      if (change.scrollableViewProperties.isOverlayClipped &&
          this._tooltipInstance && this._tooltipInstance.isVisible()) {
        this.hide(0);
      }
    });

    const config = new OverlayState({
      direction: this._dir ? this._dir.value : 'ltr',
      positionStrategy: strategy,
      panelClass: TOOLTIP_PANEL_CLASS,
      scrollStrategy: this._scrollStrategy()
    });

    this._overlayRef = this._overlay.create(config);

    return this._overlayRef;
  }

  /** Disposes the current tooltip and the overlay it is attached to */
  private _disposeTooltip(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }

    this._tooltipInstance = null;
  }

  /** Returns the origin position based on the user's position preference */
  _getOrigin(): OriginConnectionPosition {
    if (this.position == 'above' || this.position == 'below') {
      return {originX: 'center', originY: this.position == 'above' ? 'top' : 'bottom'};
    }

    const isDirectionLtr = !this._dir || this._dir.value == 'ltr';
    if (this.position == 'left' ||
        this.position == 'before' && isDirectionLtr ||
        this.position == 'after' && !isDirectionLtr) {
      return {originX: 'start', originY: 'center'};
    }

    if (this.position == 'right' ||
        this.position == 'after' && isDirectionLtr ||
        this.position == 'before' && !isDirectionLtr) {
      return {originX: 'end', originY: 'center'};
    }

    throw getMdTooltipInvalidPositionError(this.position);
  }

  /** Returns the overlay position based on the user's preference */
  _getOverlayPosition(): OverlayConnectionPosition {
    if (this.position == 'above') {
      return {overlayX: 'center', overlayY: 'bottom'};
    }

    if (this.position == 'below') {
      return {overlayX: 'center', overlayY: 'top'};
    }

    const isLtr = !this._dir || this._dir.value == 'ltr';
    if (this.position == 'left' ||
        this.position == 'before' && isLtr ||
        this.position == 'after' && !isLtr) {
      return {overlayX: 'end', overlayY: 'center'};
    }

    if (this.position == 'right' ||
        this.position == 'after' && isLtr ||
        this.position == 'before' && !isLtr) {
      return {overlayX: 'start', overlayY: 'center'};
    }

    throw getMdTooltipInvalidPositionError(this.position);
  }

  /** Updates the tooltip message and repositions the overlay according to the new message length */
  private _updateTooltipMessage() {
    // Must wait for the message to be painted to the tooltip so that the overlay can properly
    // calculate the correct positioning based on the size of the text.
    if (this._tooltipInstance) {
      this._tooltipInstance.message = this.message;
      this._tooltipInstance._markForCheck();

      first.call(this._ngZone.onMicrotaskEmpty.asObservable()).subscribe(() => {
        if (this._tooltipInstance) {
          this._overlayRef!.updatePosition();
        }
      });
    }
  }

  /** Updates the tooltip class */
  private _setTooltipClass(tooltipClass: string|string[]|Set<string>|{[key: string]: any}) {
    if (this._tooltipInstance) {
      this._tooltipInstance.tooltipClass = tooltipClass;
      this._tooltipInstance._markForCheck();
    }
  }
}

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-tooltip-component, mat-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('state', [
      state('void', style({transform: 'scale(0)'})),
      state('initial', style({transform: 'scale(0)'})),
      state('visible', style({transform: 'scale(1)'})),
      state('hidden', style({transform: 'scale(0)'})),
      transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ])
  ],
  host: {
    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
    // won't be rendered if the animations are disabled or there is no web animations polyfill.
    '[style.zoom]': '_visibility === "visible" ? 1 : null',
    '(body:click)': 'this._handleBodyInteraction()',
    'aria-hidden': 'true',
  }
})
export class TooltipComponent {
  /** Message to display in the tooltip */
  message: string;

  /** Classes to be added to the tooltip. Supports the same syntax as `ngClass`. */
  tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** The timeout ID of any current timer set to show the tooltip */
  _showTimeoutId: number;

  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId: number;

  /** Property watched by the animation framework to show or hide the tooltip */
  _visibility: TooltipVisibility = 'initial';

  /** Whether interactions on the page should close the tooltip */
  _closeOnInteraction: boolean = false;

  /** The transform origin used in the animation for showing and hiding the tooltip */
  _transformOrigin: string = 'bottom';

  /** Subject for notifying that the tooltip has been hidden from the view */
  private _onHide: Subject<any> = new Subject();

  constructor(@Optional() private _dir: Directionality,
              private _changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Shows the tooltip with an animation originating from the provided origin
   * @param position Position of the tooltip.
   * @param delay Amount of milliseconds to the delay showing the tooltip.
   */
  show(position: TooltipPosition, delay: number): void {
    // Cancel the delayed hide if it is scheduled
    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId);
    }

    // Body interactions should cancel the tooltip if there is a delay in showing.
    this._closeOnInteraction = true;

    this._setTransformOrigin(position);
    this._showTimeoutId = setTimeout(() => {
      this._visibility = 'visible';

      // If this was set to true immediately, then a body click that triggers show() would
      // trigger interaction and close the tooltip right after it was displayed.
      this._closeOnInteraction = false;

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
      setTimeout(() => this._closeOnInteraction = true, 0);
    }, delay);
  }

  /**
   * Begins the animation to hide the tooltip after the provided delay in ms.
   * @param delay Amount of milliseconds to delay showing the tooltip.
   */
  hide(delay: number): void {
    // Cancel the delayed show if it is scheduled
    if (this._showTimeoutId) {
      clearTimeout(this._showTimeoutId);
    }

    this._hideTimeoutId = setTimeout(() => {
      this._visibility = 'hidden';
      this._closeOnInteraction = false;

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
    }, delay);
  }

  /**
   * Returns an observable that notifies when the tooltip has been hidden from view
   */
  afterHidden(): Observable<void> {
    return this._onHide.asObservable();
  }

  /**
   * Whether the tooltip is being displayed
   */
  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  /** Sets the tooltip transform origin according to the tooltip position */
  _setTransformOrigin(value: TooltipPosition) {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    switch (value) {
      case 'before': this._transformOrigin = isLtr ? 'right' : 'left'; break;
      case 'after':  this._transformOrigin = isLtr ? 'left' : 'right'; break;
      case 'left':   this._transformOrigin = 'right'; break;
      case 'right':  this._transformOrigin = 'left'; break;
      case 'above':  this._transformOrigin = 'bottom'; break;
      case 'below':  this._transformOrigin = 'top'; break;
      default: throw getMdTooltipInvalidPositionError(value);
    }
  }

  _afterVisibilityAnimation(e: AnimationEvent): void {
    if (e.toState === 'hidden' && !this.isVisible()) {
      this._onHide.next();
    }
  }

  /**
   * Interactions on the HTML body should close the tooltip immediately as defined in the
   * material design spec.
   * https://material.google.com/components/tooltips.html#tooltips-interaction
   */
  _handleBodyInteraction(): void {
    if (this._closeOnInteraction) {
      this.hide(0);
    }
  }

  /**
   * Marks that the tooltip needs to be checked in the next change detection run.
   * Mainly used for rendering the initial text before positioning a tooltip, which
   * can be problematic in components with OnPush change detection.
   */
  _markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
