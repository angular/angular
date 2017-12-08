/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {AriaDescriber, FocusMonitor} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE} from '@angular/cdk/keycodes';
import {
  ConnectionPositionPair,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  Overlay,
  OverlayConfig,
  OverlayConnectionPosition,
  OverlayRef,
  RepositionScrollStrategy,
  ScrollStrategy,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import {Platform} from '@angular/cdk/platform';
import {ComponentPortal} from '@angular/cdk/portal';
import {take} from 'rxjs/operators/take';
import {merge} from 'rxjs/observable/merge';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
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
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

/** Time in ms to delay before changing the tooltip visibility to hidden */
export const TOUCHEND_HIDE_DELAY = 1500;

/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;

/** CSS class that will be attached to the overlay panel. */
export const TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMatTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}

/** Injection token that determines the scroll handling while a tooltip is visible. */
export const MAT_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mat-tooltip-scroll-strategy');

/** @docs-private */
export function MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}

/** @docs-private */
export const MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER = {
  provide: MAT_TOOLTIP_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY
};
/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.google.com/components/tooltips.html
 */
@Directive({
  selector: '[mat-tooltip], [matTooltip]',
  exportAs: 'matTooltip',
  host: {
    '(longpress)': 'show()',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': 'hide(' + TOUCHEND_HIDE_DELAY + ')',
  },
})
export class MatTooltip implements OnDestroy {
  _overlayRef: OverlayRef | null;
  _tooltipInstance: TooltipComponent | null;

  private _position: TooltipPosition = 'below';
  private _disabled: boolean = false;
  private _tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** Allows the user to define the position of the tooltip relative to the parent element */
  @Input('matTooltipPosition')
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
  @Input('matTooltipDisabled')
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
  @Input('matTooltipShowDelay') showDelay = 0;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('matTooltipHideDelay') hideDelay = 0;

  private _message = '';

  /** The message to be displayed in the tooltip */
  @Input('matTooltip')
  get message() { return this._message; }
  set message(value: string) {
    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message);

    // If the message is not a string (e.g. number), convert it to a string and trim it.
    this._message = value != null ? `${value}`.trim() : '';

    if (!this._message && this._isTooltipVisible()) {
      this.hide(0);
    } else {
      this._updateTooltipMessage();
      this._ariaDescriber.describe(this._elementRef.nativeElement, this.message);
    }
  }

  /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
  @Input('matTooltipClass')
  get tooltipClass() { return this._tooltipClass; }
  set tooltipClass(value: string|string[]|Set<string>|{[key: string]: any}) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }

  private _manualListeners = new Map<string, Function>();

  constructor(
    private _overlay: Overlay,
    private _elementRef: ElementRef,
    private _scrollDispatcher: ScrollDispatcher,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _platform: Platform,
    private _ariaDescriber: AriaDescriber,
    private _focusMonitor: FocusMonitor,
    @Inject(MAT_TOOLTIP_SCROLL_STRATEGY) private _scrollStrategy,
    @Optional() private _dir: Directionality) {

    const element: HTMLElement = _elementRef.nativeElement;

    // The mouse events shouldn't be bound on iOS devices, because
    // they can prevent the first tap from firing its click event.
    if (!_platform.IOS) {
      this._manualListeners.set('mouseenter', () => this.show());
      this._manualListeners.set('mouseleave', () => this.hide());

      this._manualListeners
        .forEach((listener, event) => _elementRef.nativeElement.addEventListener(event, listener));
    } else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
      // When we bind a gesture event on an element (in this case `longpress`), HammerJS
      // will add some inline styles by default, including `user-select: none`. This is
      // problematic on iOS, because it will prevent users from typing in inputs. If
      // we're on iOS and the tooltip is attached on an input or textarea, we clear
      // the `user-select` to avoid these issues.
      element.style.webkitUserSelect = element.style.userSelect = '';
    }

    _focusMonitor.monitor(element, false).subscribe(origin => {
      // Note that the focus monitor runs outside the Angular zone.
      if (!origin) {
        _ngZone.run(() => this.hide(0));
      } else if (origin !== 'program') {
        _ngZone.run(() => this.show());
      }
    });
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
      this._manualListeners.forEach((listener, event) => {
        this._elementRef.nativeElement.removeEventListener(event, listener);
      });

      this._manualListeners.clear();
    }

    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.message);
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
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
    if (this._isTooltipVisible() && e.keyCode === ESCAPE) {
      e.stopPropagation();
      this.hide(0);
    }
  }

  /** Create the tooltip to display */
  private _createTooltip(): void {
    const overlayRef = this._createOverlay();
    const portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);

    this._tooltipInstance = overlayRef.attach(portal).instance;

    // Dispose of the tooltip when the overlay is detached.
    merge(this._tooltipInstance!.afterHidden(), overlayRef.detachments()).subscribe(() => {
      // Check first if the tooltip has already been removed through this components destroy.
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    });
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): OverlayRef {
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    // Create connected position strategy that listens for scroll events to reposition.
    const strategy = this._overlay
      .position()
      .connectedTo(this._elementRef, origin.main, overlay.main)
      .withFallbackPosition(origin.fallback, overlay.fallback);

    const scrollableAncestors = this._scrollDispatcher
      .getAncestorScrollContainers(this._elementRef);

    strategy.withScrollableContainers(scrollableAncestors);

    strategy.onPositionChange.subscribe(change => {
      if (this._tooltipInstance) {
        if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
          // After position changes occur and the overlay is clipped by
          // a parent scrollable then close the tooltip.
          this._ngZone.run(() => this.hide(0));
        } else {
          // Otherwise recalculate the origin based on the new position.
          this._tooltipInstance._setTransformOrigin(change.connectionPair);
        }
      }
    });

    const config = new OverlayConfig({
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

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. 'below' -> 'above').
   */
  _getOrigin(): {main: OriginConnectionPosition, fallback: OriginConnectionPosition} {
    const isDirectionLtr = !this._dir || this._dir.value == 'ltr';
    let position: OriginConnectionPosition;

    if (this.position == 'above' || this.position == 'below') {
      position = {originX: 'center', originY: this.position == 'above' ? 'top' : 'bottom'};
    } else if (this.position == 'left' ||
               this.position == 'before' && isDirectionLtr ||
               this.position == 'after' && !isDirectionLtr) {
      position = {originX: 'start', originY: 'center'};
    } else if (this.position == 'right' ||
               this.position == 'after' && isDirectionLtr ||
               this.position == 'before' && !isDirectionLtr) {
      position = {originX: 'end', originY: 'center'};
    } else {
      throw getMatTooltipInvalidPositionError(this.position);
    }

    const {x, y} = this._invertPosition(position.originX, position.originY);

    return {
      main: position,
      fallback: {originX: x, originY: y}
    };
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition(): {main: OverlayConnectionPosition, fallback: OverlayConnectionPosition} {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    let position: OverlayConnectionPosition;

    if (this.position == 'above') {
      position = {overlayX: 'center', overlayY: 'bottom'};
    } else if (this.position == 'below') {
      position = {overlayX: 'center', overlayY: 'top'};
    } else if (this.position == 'left' ||
               this.position == 'before' && isLtr ||
               this.position == 'after' && !isLtr) {
      position = {overlayX: 'end', overlayY: 'center'};
    } else if (this.position == 'right' ||
               this.position == 'after' && isLtr ||
               this.position == 'before' && !isLtr) {
      position = {overlayX: 'start', overlayY: 'center'};
    } else {
      throw getMatTooltipInvalidPositionError(this.position);
    }

    const {x, y} = this._invertPosition(position.overlayX, position.overlayY);

    return {
      main: position,
      fallback: {overlayX: x, overlayY: y}
    };
  }

  /** Updates the tooltip message and repositions the overlay according to the new message length */
  private _updateTooltipMessage() {
    // Must wait for the message to be painted to the tooltip so that the overlay can properly
    // calculate the correct positioning based on the size of the text.
    if (this._tooltipInstance) {
      this._tooltipInstance.message = this.message;
      this._tooltipInstance._markForCheck();

      this._ngZone.onMicrotaskEmpty.asObservable().pipe(take(1)).subscribe(() => {
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

  /** Inverts an overlay position. */
  private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
    if (this.position === 'above' || this.position === 'below') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return {x, y};
  }
}

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('state', [
      state('initial, void, hidden', style({transform: 'scale(0)'})),
      state('visible', style({transform: 'scale(1)'})),
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
  private _closeOnInteraction: boolean = false;

  /** The transform origin used in the animation for showing and hiding the tooltip */
  _transformOrigin: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  /** Current position of the tooltip. */
  private _position: TooltipPosition;

  /** Subject for notifying that the tooltip has been hidden from the view */
  private _onHide: Subject<any> = new Subject();

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

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
    this._position = position;
    this._showTimeoutId = setTimeout(() => {
      this._visibility = 'visible';

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
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

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
    }, delay);
  }

  /** Returns an observable that notifies when the tooltip has been hidden from view. */
  afterHidden(): Observable<void> {
    return this._onHide.asObservable();
  }

  /** Whether the tooltip is being displayed. */
  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  /** Sets the tooltip transform origin according to the position of the tooltip overlay. */
  _setTransformOrigin(overlayPosition: ConnectionPositionPair) {
    const axis = (this._position === 'above' || this._position === 'below') ? 'Y' : 'X';
    const position = axis == 'X' ? overlayPosition.overlayX : overlayPosition.overlayY;

    if (position === 'top' || position === 'bottom') {
      this._transformOrigin = position;
    } else if (position === 'start') {
      this._transformOrigin = 'left';
    } else if (position === 'end') {
      this._transformOrigin = 'right';
    } else {
      throw getMatTooltipInvalidPositionError(this._position);
    }
  }

  _animationStart() {
    this._closeOnInteraction = false;
  }

  _animationDone(event: AnimationEvent): void {
    const toState = event.toState as TooltipVisibility;

    if (toState === 'hidden' && !this.isVisible()) {
      this._onHide.next();
    }

    if (toState === 'visible' || toState === 'hidden') {
      // Note: as of Angular 4.3, the animations module seems to fire the `start` callback before
      // the end if animations are disabled. Make this call async to ensure that it still fires
      // at the appropriate time.
      Promise.resolve().then(() => this._closeOnInteraction = true);
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
