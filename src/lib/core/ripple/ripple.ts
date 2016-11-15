import {
  NgModule,
  ModuleWithProviders,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
} from '@angular/core';
import {
  RippleRenderer,
  ForegroundRipple,
  ForegroundRippleState,
} from './ripple-renderer';


@Directive({
  selector: '[md-ripple]',
})
export class MdRipple implements OnInit, OnDestroy, OnChanges {
  /**
   * The element that triggers the ripple when click events are received. Defaults to the
   * directive's host element.
   */
  // Prevent TS metadata emit from referencing HTMLElement in ripple.js
  // That breaks tests running in node that load material components.
  @Input('md-ripple-trigger') trigger: HTMLElement|HTMLElement;
  /**
   * Whether the ripple always originates from the center of the host element's bounds, rather
   * than originating from the location of the click event.
   */
  @Input('md-ripple-centered') centered: boolean;
  /**
   * Whether click events will not trigger the ripple. It can still be triggered by manually
   * calling start() and end().
   */
  @Input('md-ripple-disabled') disabled: boolean;
  /**
   * If set, the radius in pixels of foreground ripples when fully expanded. If unset, the radius
   * will be the distance from the center of the ripple to the furthest corner of the host element's
   * bounding rectangle.
   */
  @Input('md-ripple-max-radius') maxRadius: number = 0;
  /**
   * If set, the normal duration of ripple animations is divided by this value. For example,
   * setting it to 0.5 will cause the animations to take twice as long.
   */
  @Input('md-ripple-speed-factor') speedFactor: number = 1;
  /** Custom color for ripples. */
  @Input('md-ripple-color') color: string;
  /** Custom color for the ripple background. */
  @Input('md-ripple-background-color') backgroundColor: string;

  /** Whether the ripple background will be highlighted to indicated a focused state. */
  @HostBinding('class.md-ripple-focused') @Input('md-ripple-focused') focused: boolean;
  /** Whether foreground ripples should be visible outside the component's bounds. */
  @HostBinding('class.md-ripple-unbounded') @Input('md-ripple-unbounded') unbounded: boolean;

  private _rippleRenderer: RippleRenderer;

  constructor(_elementRef: ElementRef) {
    // These event handlers are attached to the element that triggers the ripple animations.
    const eventHandlers = new Map<string, (e: Event) => void>();
    eventHandlers.set('mousedown', (event: MouseEvent) => this._mouseDown(event));
    eventHandlers.set('click', (event: MouseEvent) => this._click(event));
    eventHandlers.set('mouseleave', (event: MouseEvent) => this._mouseLeave(event));
    this._rippleRenderer = new RippleRenderer(_elementRef, eventHandlers);
  }

  /** TODO: internal */
  ngOnInit() {
    // If no trigger element was explicity set, use the host element
    if (!this.trigger) {
      this._rippleRenderer.setTriggerElementToHost();
    }
    if (!this.disabled) {
      this._rippleRenderer.createBackgroundIfNeeded();
    }
  }

  /** TODO: internal */
  ngOnDestroy() {
    // Remove event listeners on the trigger element.
    this._rippleRenderer.clearTriggerElement();
  }

  /** TODO: internal */
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    // If the trigger element changed (or is being initially set), add event listeners to it.
    const changedInputs = Object.keys(changes);
    if (changedInputs.indexOf('trigger') !== -1) {
      this._rippleRenderer.setTriggerElement(this.trigger);
    }
    if (!this.disabled) {
      this._rippleRenderer.createBackgroundIfNeeded();
    }
  }

  /**
   * Responds to the start of a ripple animation trigger by fading the background in.
   */
  start() {
    this._rippleRenderer.createBackgroundIfNeeded();
    this._rippleRenderer.fadeInRippleBackground(this.backgroundColor);
  }

  /**
   * Responds to the end of a ripple animation trigger by fading the background out, and creating a
   * foreground ripple that expands from the event location (or from the center of the element if
   * the "centered" property is set or forceCenter is true).
   */
  end(left: number, top: number, forceCenter = true) {
    this._rippleRenderer.createForegroundRipple(
      left,
      top,
      this.color,
      this.centered || forceCenter,
      this.maxRadius,
      this.speedFactor,
      (ripple: ForegroundRipple, e: TransitionEvent) => this._rippleTransitionEnded(ripple, e));
    this._rippleRenderer.fadeOutRippleBackground();
  }

  private _rippleTransitionEnded(ripple: ForegroundRipple, event: TransitionEvent) {
    if (event.propertyName === 'opacity') {
      // If the ripple finished expanding, start fading it out. If it finished fading out,
      // remove it from the DOM.
      switch (ripple.state) {
        case ForegroundRippleState.EXPANDING:
          this._rippleRenderer.fadeOutForegroundRipple(ripple.rippleElement);
          ripple.state = ForegroundRippleState.FADING_OUT;
          break;
        case ForegroundRippleState.FADING_OUT:
          this._rippleRenderer.removeRippleFromDom(ripple.rippleElement);
          break;
      }
    }
  }

  /**
   * Called when the trigger element receives a mousedown event. Starts the ripple animation by
   * fading in the background.
   */
  private _mouseDown(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      this.start();
    }
  }

  /**
   * Called when the trigger element receives a click event. Creates a foreground ripple and
   * runs its animation.
   */
  private _click(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      // If screen and page positions are all 0, this was probably triggered by a keypress.
      // In that case, use the center of the bounding rect as the ripple origin.
      // FIXME: This fails on IE11, which still sets pageX/Y and screenX/Y on keyboard clicks.
      const isKeyEvent =
          (event.screenX === 0 && event.screenY === 0 && event.pageX === 0 && event.pageY === 0);
      this.end(event.pageX, event.pageY, isKeyEvent);
    }
  }

  /**
   * Called when the trigger element receives a mouseleave event. Fades out the background.
   */
  private _mouseLeave(event: MouseEvent) {
    // We can always fade out the background here; It's a no-op if it was already inactive.
    this._rippleRenderer.fadeOutRippleBackground();
  }

  // TODO: Reactivate the background div if the user drags out and back in.
}


@NgModule({
  exports: [MdRipple],
  declarations: [MdRipple],
})
export class MdRippleModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdRippleModule,
      providers: []
    };
  }
}
