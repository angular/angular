import {
  Component,
  Directive,
  Input,
  ElementRef,
  ViewContainerRef,
  style,
  trigger,
  state,
  transition,
  animate,
  AnimationTransitionEvent,
  NgZone,
  Optional,
  OnDestroy,
  Renderer,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  Overlay,
  OverlayState,
  OverlayRef,
  ComponentPortal,
  OverlayConnectionPosition,
  OriginConnectionPosition,
} from '../core';
import {MdTooltipInvalidPositionError} from './tooltip-errors';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Dir} from '../core/rtl/dir';
import {Platform} from '../core/platform/index';
import 'rxjs/add/operator/first';
import {ScrollDispatcher} from '../core/overlay/scroll/scroll-dispatcher';
import {Subscription} from 'rxjs/Subscription';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';

export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

/** Time in ms to delay before changing the tooltip visibility to hidden */
export const TOUCHEND_HIDE_DELAY  = 1500;

/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;

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
    '(touchend)': 'hide(' + TOUCHEND_HIDE_DELAY + ')',
  },
  exportAs: 'mdTooltip',
})
export class MdTooltip implements OnInit, OnDestroy {
  _overlayRef: OverlayRef;
  _tooltipInstance: TooltipComponent;
  scrollSubscription: Subscription;

  private _position: TooltipPosition = 'below';
  private _disabled: boolean = false;

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
    this._message = value;
    if (this._tooltipInstance) {
      this._setTooltipMessage(this._message);
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

  constructor(
    private _overlay: Overlay,
    private _elementRef: ElementRef,
    private _scrollDispatcher: ScrollDispatcher,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _renderer: Renderer,
    private _platform: Platform,
    @Optional() private _dir: Dir) {

    // The mouse events shouldn't be bound on iOS devices, because
    // they can prevent the first tap from firing it's click event.
    if (!_platform.IOS) {
      _renderer.listen(_elementRef.nativeElement, 'mouseenter', () => this.show());
      _renderer.listen(_elementRef.nativeElement, 'mouseleave', () => this.hide());
    }
  }

  ngOnInit() {
    // When a scroll on the page occurs, update the position in case this tooltip needs
    // to be repositioned.
    this.scrollSubscription = this._scrollDispatcher.scrolled(SCROLL_THROTTLE_MS, () => {
      if (this._overlayRef) {
        this._overlayRef.updatePosition();
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

    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay: number = this.showDelay): void {
    if (this.disabled || !this._message || !this._message.trim()) { return; }

    if (!this._tooltipInstance) {
      this._createTooltip();
    }

    this._setTooltipMessage(this._message);
    this._tooltipInstance.show(this._position, delay);
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

  /** Create the tooltip to display */
  private _createTooltip(): void {
    this._createOverlay();
    let portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);
    this._tooltipInstance = this._overlayRef.attach(portal).instance;

    // Dispose the overlay when finished the shown tooltip.
    this._tooltipInstance.afterHidden().subscribe(() => {
      // Check first if the tooltip has already been removed through this components destroy.
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    });
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): void {
    let origin = this._getOrigin();
    let position = this._getOverlayPosition();

    // Create connected position strategy that listens for scroll events to reposition.
    // After position changes occur and the overlay is clipped by a parent scrollable then
    // close the tooltip.
    let strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
    strategy.withScrollableContainers(this._scrollDispatcher.getScrollContainers(this._elementRef));
    strategy.onPositionChange.subscribe(change => {
      if (change.scrollableViewProperties.isOverlayClipped &&
          this._tooltipInstance && this._tooltipInstance.isVisible()) {
        this.hide(0);
      }
    });
    let config = new OverlayState();
    config.positionStrategy = strategy;

    this._overlayRef = this._overlay.create(config);
  }

  /** Disposes the current tooltip and the overlay it is attached to */
  private _disposeTooltip(): void {
    this._overlayRef.dispose();
    this._overlayRef = null;
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

    throw new MdTooltipInvalidPositionError(this.position);
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

    throw new MdTooltipInvalidPositionError(this.position);
  }

  /** Updates the tooltip message and repositions the overlay according to the new message length */
  private _setTooltipMessage(message: string) {
    // Must wait for the message to be painted to the tooltip so that the overlay can properly
    // calculate the correct positioning based on the size of the text.
    this._tooltipInstance.message = message;
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      if (this._tooltipInstance) {
        this._overlayRef.updatePosition();
      }
    });
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
    '(body:click)': 'this._handleBodyInteraction()'
  }
})
export class TooltipComponent {
  /** Message to display in the tooltip */
  message: string;

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

  constructor(@Optional() private _dir: Dir, private _changeDetectorRef: ChangeDetectorRef) {}

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
      this._changeDetectorRef.markForCheck();
      setTimeout(() => { this._closeOnInteraction = true; }, 0);
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
      this._changeDetectorRef.markForCheck();
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
      case 'above':    this._transformOrigin = 'bottom'; break;
      case 'below': this._transformOrigin = 'top'; break;
      default: throw new MdTooltipInvalidPositionError(value);
    }
  }

  _afterVisibilityAnimation(e: AnimationTransitionEvent): void {
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
}
