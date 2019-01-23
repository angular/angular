/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent} from '@angular/animations';
import {AriaDescriber, FocusMonitor} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE} from '@angular/cdk/keycodes';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {HammerLoader, HAMMER_LOADER} from '@angular/platform-browser';
import {
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  Overlay,
  OverlayConnectionPosition,
  OverlayRef,
  VerticalConnectionPos,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {Platform} from '@angular/cdk/platform';
import {ComponentPortal} from '@angular/cdk/portal';
import {take, takeUntil} from 'rxjs/operators';
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
import {Subject, Observable} from 'rxjs';
import {matTooltipAnimations} from './tooltip-animations';


export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;

/** CSS class that will be attached to the overlay panel. */
export const TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';

/**
 * Creates an error to be thrown if the user supplied an invalid tooltip position.
 * @docs-private
 */
export function getMatTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}

/** Injection token that determines the scroll handling while a tooltip is visible. */
export const MAT_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mat-tooltip-scroll-strategy');

/** @docs-private */
export function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition({scrollThrottle: SCROLL_THROTTLE_MS});
}

/** @docs-private */
export const MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: MAT_TOOLTIP_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
};

/** Default `matTooltip` options that can be overridden. */
export interface MatTooltipDefaultOptions {
  showDelay: number;
  hideDelay: number;
  touchendHideDelay: number;
  position?: TooltipPosition;
}

/** Injection token to be used to override the default options for `matTooltip`. */
export const MAT_TOOLTIP_DEFAULT_OPTIONS =
    new InjectionToken<MatTooltipDefaultOptions>('mat-tooltip-default-options', {
      providedIn: 'root',
      factory: MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY
    });

/** @docs-private */
export function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY(): MatTooltipDefaultOptions {
  return {
    showDelay: 0,
    hideDelay: 0,
    touchendHideDelay: 1500,
  };
}

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
    '(longpress)': 'show()',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': '_handleTouchend()',
  },
})
export class MatTooltip implements OnDestroy {
  _overlayRef: OverlayRef | null;
  _tooltipInstance: TooltipComponent | null;

  private _portal: ComponentPortal<TooltipComponent>;
  private _position: TooltipPosition = 'below';
  private _disabled: boolean = false;
  private _tooltipClass: string|string[]|Set<string>|{[key: string]: any};
  private _scrollStrategy: () => ScrollStrategy;

  /** Allows the user to define the position of the tooltip relative to the parent element */
  @Input('matTooltipPosition')
  get position(): TooltipPosition { return this._position; }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;

      if (this._overlayRef) {
        this._updatePosition();

        if (this._tooltipInstance) {
          this._tooltipInstance!.show(0);
        }

        this._overlayRef.updatePosition();
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

  /** The default delay in ms before showing the tooltip after show is called */
  @Input('matTooltipShowDelay') showDelay = this._defaultOptions.showDelay;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('matTooltipHideDelay') hideDelay = this._defaultOptions.hideDelay;

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

  private _manualListeners = new Map<string, EventListenerOrEventListenerObject>();

  /** Emits when the component is destroyed. */
  private readonly _destroyed = new Subject<void>();

  constructor(
    private _overlay: Overlay,
    private _elementRef: ElementRef<HTMLElement>,
    private _scrollDispatcher: ScrollDispatcher,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    platform: Platform,
    private _ariaDescriber: AriaDescriber,
    private _focusMonitor: FocusMonitor,
    @Inject(MAT_TOOLTIP_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() private _dir: Directionality,
    @Optional() @Inject(MAT_TOOLTIP_DEFAULT_OPTIONS)
      private _defaultOptions: MatTooltipDefaultOptions,
    @Optional() @Inject(HAMMER_LOADER) hammerLoader?: HammerLoader) {

    this._scrollStrategy = scrollStrategy;
    const element: HTMLElement = _elementRef.nativeElement;
    const elementStyle = element.style as CSSStyleDeclaration & {webkitUserDrag: string};
    const hasGestures = typeof window === 'undefined' || (window as any).Hammer || hammerLoader;

    // The mouse events shouldn't be bound on mobile devices, because they can prevent the
    // first tap from firing its click event or can cause the tooltip to open for clicks.
    if (!platform.IOS && !platform.ANDROID) {
      this._manualListeners
        .set('mouseenter', () => this.show())
        .set('mouseleave', () => this.hide());
    } else if (!hasGestures) {
      // If Hammerjs isn't loaded, fall back to showing on `touchstart`, otherwise
      // there's no way for the user to trigger the tooltip on a touch device.
      this._manualListeners.set('touchstart', () => this.show());
    }

    this._manualListeners.forEach((listener, event) => element.addEventListener(event, listener));

    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
      // When we bind a gesture event on an element (in this case `longpress`), HammerJS
      // will add some inline styles by default, including `user-select: none`. This is
      // problematic on iOS and in Safari, because it will prevent users from typing in inputs.
      // Since `user-select: none` is not needed for the `longpress` event and can cause unexpected
      // behavior for text fields, we always clear the `user-select` to avoid such issues.
      elementStyle.webkitUserSelect = elementStyle.userSelect = elementStyle.msUserSelect = '';
    }

    // Hammer applies `-webkit-user-drag: none` on all elements by default,
    // which breaks the native drag&drop. If the consumer explicitly made
    // the element draggable, clear the `-webkit-user-drag`.
    if (element.draggable && elementStyle.webkitUserDrag === 'none') {
      elementStyle.webkitUserDrag = '';
    }

    _focusMonitor.monitor(_elementRef).pipe(takeUntil(this._destroyed)).subscribe(origin => {
      // Note that the focus monitor runs outside the Angular zone.
      if (!origin) {
        _ngZone.run(() => this.hide(0));
      } else if (origin === 'keyboard') {
        _ngZone.run(() => this.show());
      }
    });

    if (_defaultOptions && _defaultOptions.position) {
      this.position = _defaultOptions.position;
    }
  }

  /**
   * Dispose the tooltip when destroyed.
   */
  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._tooltipInstance = null;
    }

    // Clean up the event listeners set in the constructor
    this._manualListeners.forEach((listener, event) => {
      this._elementRef.nativeElement.removeEventListener(event, listener);
    });
    this._manualListeners.clear();

    this._destroyed.next();
    this._destroyed.complete();

    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.message);
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay: number = this.showDelay): void {
    if (this.disabled || !this.message || (this._isTooltipVisible() &&
      !this._tooltipInstance!._showTimeoutId && !this._tooltipInstance!._hideTimeoutId)) {
        return;
    }

    const overlayRef = this._createOverlay();

    this._detach();
    this._portal = this._portal || new ComponentPortal(TooltipComponent, this._viewContainerRef);
    this._tooltipInstance = overlayRef.attach(this._portal).instance;
    this._tooltipInstance.afterHidden()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());
    this._setTooltipClass(this._tooltipClass);
    this._updateTooltipMessage();
    this._tooltipInstance!.show(delay);
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

  /** Handles the touchend events on the host element. */
  _handleTouchend() {
    this.hide(this._defaultOptions.touchendHideDelay);
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): OverlayRef {
    if (this._overlayRef) {
      return this._overlayRef;
    }

    // Create connected position strategy that listens for scroll events to reposition.
    const strategy = this._overlay.position()
      .flexibleConnectedTo(this._elementRef)
      .withTransformOriginOn('.mat-tooltip')
      .withFlexibleDimensions(false)
      .withViewportMargin(8);

    const scrollableAncestors = this._scrollDispatcher
      .getAncestorScrollContainers(this._elementRef);

    strategy.withScrollableContainers(scrollableAncestors);

    strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe(change => {
      if (this._tooltipInstance) {
        if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
          // After position changes occur and the overlay is clipped by
          // a parent scrollable then close the tooltip.
          this._ngZone.run(() => this.hide(0));
        }
      }
    });

    this._overlayRef = this._overlay.create({
      direction: this._dir,
      positionStrategy: strategy,
      panelClass: TOOLTIP_PANEL_CLASS,
      scrollStrategy: this._scrollStrategy()
    });

    this._updatePosition();

    this._overlayRef.detachments()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());

    return this._overlayRef;
  }

  /** Detaches the currently-attached tooltip. */
  private _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._tooltipInstance = null;
  }

  /** Updates the position of the current tooltip. */
  private _updatePosition() {
    const position =
        this._overlayRef!.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    position.withPositions([
      {...origin.main, ...overlay.main},
      {...origin.fallback, ...overlay.fallback}
    ]);
  }

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
   */
  _getOrigin(): {main: OriginConnectionPosition, fallback: OriginConnectionPosition} {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    const position = this.position;
    let originPosition: OriginConnectionPosition;

    if (position == 'above' || position == 'below') {
      originPosition = {originX: 'center', originY: position == 'above' ? 'top' : 'bottom'};
    } else if (
      position == 'before' ||
      (position == 'left' && isLtr) ||
      (position == 'right' && !isLtr)) {
      originPosition = {originX: 'start', originY: 'center'};
    } else if (
      position == 'after' ||
      (position == 'right' && isLtr) ||
      (position == 'left' && !isLtr)) {
      originPosition = {originX: 'end', originY: 'center'};
    } else {
      throw getMatTooltipInvalidPositionError(position);
    }

    const {x, y} = this._invertPosition(originPosition.originX, originPosition.originY);

    return {
      main: originPosition,
      fallback: {originX: x, originY: y}
    };
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition(): {main: OverlayConnectionPosition, fallback: OverlayConnectionPosition} {
    const isLtr = !this._dir || this._dir.value == 'ltr';
    const position = this.position;
    let overlayPosition: OverlayConnectionPosition;

    if (position == 'above') {
      overlayPosition = {overlayX: 'center', overlayY: 'bottom'};
    } else if (position == 'below') {
      overlayPosition = {overlayX: 'center', overlayY: 'top'};
    } else if (
      position == 'before' ||
      (position == 'left' && isLtr) ||
      (position == 'right' && !isLtr)) {
      overlayPosition = {overlayX: 'end', overlayY: 'center'};
    } else if (
      position == 'after' ||
      (position == 'right' && isLtr) ||
      (position == 'left' && !isLtr)) {
      overlayPosition = {overlayX: 'start', overlayY: 'center'};
    } else {
      throw getMatTooltipInvalidPositionError(position);
    }

    const {x, y} = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

    return {
      main: overlayPosition,
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

      this._ngZone.onMicrotaskEmpty.asObservable().pipe(
        take(1),
        takeUntil(this._destroyed)
      ).subscribe(() => {
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [matTooltipAnimations.tooltipState],
  host: {
    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
    // won't be rendered if the animations are disabled or there is no web animations polyfill.
    '[style.zoom]': '_visibility === "visible" ? 1 : null',
    '(body:click)': 'this._handleBodyInteraction()',
    'aria-hidden': 'true',
  }
})
export class TooltipComponent implements OnDestroy {
  /** Message to display in the tooltip */
  message: string;

  /** Classes to be added to the tooltip. Supports the same syntax as `ngClass`. */
  tooltipClass: string|string[]|Set<string>|{[key: string]: any};

  /** The timeout ID of any current timer set to show the tooltip */
  _showTimeoutId: number | null;

  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId: number | null;

  /** Property watched by the animation framework to show or hide the tooltip */
  _visibility: TooltipVisibility = 'initial';

  /** Whether interactions on the page should close the tooltip */
  private _closeOnInteraction: boolean = false;

  /** Subject for notifying that the tooltip has been hidden from the view */
  private readonly _onHide: Subject<any> = new Subject();

  /** Stream that emits whether the user has a handset-sized display.  */
  _isHandset: Observable<BreakpointState> = this._breakpointObserver.observe(Breakpoints.Handset);

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _breakpointObserver: BreakpointObserver) {}

  /**
   * Shows the tooltip with an animation originating from the provided origin
   * @param delay Amount of milliseconds to the delay showing the tooltip.
   */
  show(delay: number): void {
    // Cancel the delayed hide if it is scheduled
    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId);
      this._hideTimeoutId = null;
    }

    // Body interactions should cancel the tooltip if there is a delay in showing.
    this._closeOnInteraction = true;
    this._showTimeoutId = setTimeout(() => {
      this._visibility = 'visible';
      this._showTimeoutId = null;

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
      this._showTimeoutId = null;
    }

    this._hideTimeoutId = setTimeout(() => {
      this._visibility = 'hidden';
      this._hideTimeoutId = null;

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

  ngOnDestroy() {
    this._onHide.complete();
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
      this._closeOnInteraction = true;
    }
  }

  /**
   * Interactions on the HTML body should close the tooltip immediately as defined in the
   * material design spec.
   * https://material.io/design/components/tooltips.html#behavior
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
