import {
  NgModule,
  ModuleWithProviders,
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
} from '@angular/core';
import {
  Overlay,
  OverlayState,
  OverlayModule,
  OverlayRef,
  ComponentPortal,
  OverlayConnectionPosition,
  OriginConnectionPosition,
  OVERLAY_PROVIDERS,
} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

export type TooltipPosition = 'before' | 'after' | 'above' | 'below';

/** Time in ms to delay before changing the tooltip visibility to hidden */
export const TOOLTIP_HIDE_DELAY  = 1500;

/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.google.com/components/tooltips.html
 */
@Directive({
  selector: '[md-tooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
  },
  exportAs: 'mdTooltip',
})
export class MdTooltip {
  _overlayRef: OverlayRef;
  _tooltipInstance: TooltipComponent;

  /** Allows the user to define the position of the tooltip relative to the parent element */
  private _position: TooltipPosition = 'below';
  @Input('tooltip-position') get position(): TooltipPosition {
    return this._position;
  }

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

  /** The message to be displayed in the tooltip */
  private _message: string;
  @Input('md-tooltip') get message() {
    return this._message;
  }
  set message(value: string) {
    this._message = value;
    if (this._tooltipInstance) {
      this._setTooltipMessage(this._message);
    }
  }

  constructor(private _overlay: Overlay, private _elementRef: ElementRef,
              private _viewContainerRef: ViewContainerRef, private _ngZone: NgZone) {}

  /** Dispose the tooltip when destroyed */
  ngOnDestroy() {
    if (this._tooltipInstance) {
      this._disposeTooltip();
    }
  }

  /** Shows the tooltip */
  show(): void {
    if (!this._tooltipInstance) {
      this._createTooltip();
    }

    this._setTooltipMessage(this._message);
    this._tooltipInstance.show(this._position);
  }

  /**
   * Create the overlay config and position strategy
   * Hides the tooltip after the provided delay in ms. Defaults the delay to the material design
   * prescribed delay time
   */
  hide(delay: number = TOOLTIP_HIDE_DELAY): void {
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
    return this._tooltipInstance && this._tooltipInstance.isVisible();
  }

  /** Create the tooltip to display */
  private _createTooltip(): void {
    this._createOverlay();
    let portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);
    this._tooltipInstance = this._overlayRef.attach(portal).instance;

    // Dispose the overlay when finished the shown tooltip.
    this._tooltipInstance.afterHidden().subscribe(() => {
      this._disposeTooltip();
    });
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): void {
    let origin = this._getOrigin();
    let position = this._getOverlayPosition();
    let strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
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
  private _getOrigin(): OriginConnectionPosition {
    switch (this.position) {
      case 'before': return { originX: 'start',  originY: 'center' };
      case 'after':  return { originX: 'end',    originY: 'center' };
      case 'above':  return { originX: 'center', originY: 'top' };
      case 'below':  return { originX: 'center', originY: 'bottom' };
    }
  }

  /** Returns the overlay position based on the user's preference */
  private _getOverlayPosition(): OverlayConnectionPosition {
    switch (this.position) {
      case 'before': return { overlayX: 'end',    overlayY: 'center' };
      case 'after':  return { overlayX: 'start',  overlayY: 'center' };
      case 'above':  return { overlayX: 'center', overlayY: 'bottom' };
      case 'below':  return { overlayX: 'center', overlayY: 'top' };
    }
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

export type TooltipVisibility = 'visible' | 'hidden';

@Component({
  moduleId: module.id,
  selector: 'md-tooltip-component',
  templateUrl: 'tooltip.html',
  styleUrls: ['tooltip.css'],
  animations: [
    trigger('state', [
      state('void', style({transform: 'scale(0)'})),
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

  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId: number;

  /** Property watched by the animation framework to show or hide the tooltip */
  _visibility: TooltipVisibility;

  /** Whether interactions on the page should close the tooltip */
  _closeOnInteraction: boolean = false;

  /** The transform origin used in the animation for showing and hiding the tooltip */
  _transformOrigin: string = 'bottom';

  /** Subject for notifying that the tooltip has been hidden from the view */
  private _onHide: Subject<any> = new Subject();

  /** Shows the tooltip with an animation originating from the provided origin */
  show(position: TooltipPosition): void {
    this._closeOnInteraction = false;
    this._visibility = 'visible';
    this._setTransformOrigin(position);

    // Cancel the delayed hide if it is scheduled
    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId);
    }

    // If this was set to true immediately, then the body click would trigger interaction and
    // close the tooltip right after it was displayed.
    setTimeout(() => { this._closeOnInteraction = true; }, 0);
  }

  /** Begins the animation to hide the tooltip after the provided delay in ms */
  hide(delay: number): void {
    this._hideTimeoutId = setTimeout(() => {
      this._visibility = 'hidden';
      this._closeOnInteraction = false;
    }, delay);
  }

  /** Returns an observable that notifies when the tooltip has been hidden from view */
  afterHidden(): Observable<void> {
    return this._onHide.asObservable();
  }

  /** Whether the tooltip is being displayed */
  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  /** Sets the tooltip transform origin according to the tooltip position */
  _setTransformOrigin(value: TooltipPosition) {
    switch (value) {
      case 'before': this._transformOrigin = 'right'; break;
      case 'after':  this._transformOrigin = 'left'; break;
      case 'above':  this._transformOrigin = 'bottom'; break;
      case 'below':  this._transformOrigin = 'top'; break;
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


@NgModule({
  imports: [OverlayModule],
  exports: [MdTooltip, TooltipComponent],
  declarations: [MdTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
})
export class MdTooltipModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTooltipModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}
