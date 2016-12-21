import {
  ElementRef,
  NgZone,
} from '@angular/core';

/** @docs-private */
export enum ForegroundRippleState {
  NEW,
  EXPANDING,
  FADING_OUT,
}

/**
 * Wrapper for a foreground ripple DOM element and its animation state.
 * @docs-private
 */
export class ForegroundRipple {
  state = ForegroundRippleState.NEW;
  constructor(public rippleElement: Element) {}
}

const RIPPLE_SPEED_PX_PER_SECOND = 1000;
const MIN_RIPPLE_FILL_TIME_SECONDS = 0.1;
const MAX_RIPPLE_FILL_TIME_SECONDS = 0.3;

/**
 * Returns the distance from the point (x, y) to the furthest corner of a rectangle.
 */
const distanceToFurthestCorner = (x: number, y: number, rect: ClientRect) => {
  const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
  const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
  return Math.sqrt(distX * distX + distY * distY);
};

/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 * The constructor takes a reference to the ripple directive's host element and a map of DOM
 * event handlers to be installed on the element that triggers ripple animations.
 * This will eventually become a custom renderer once Angular support exists.
 * @docs-private
 */
export class RippleRenderer {
  private _backgroundDiv: HTMLElement;
  private _rippleElement: HTMLElement;
  private _triggerElement: HTMLElement;
  _opacity: string;

  constructor(_elementRef: ElementRef,
              private _eventHandlers: Map<string, (e: Event) => void>,
              private _ngZone: NgZone) {
    this._rippleElement = _elementRef.nativeElement;
    // The background div is created in createBackgroundIfNeeded when the ripple becomes enabled.
    // This avoids creating unneeded divs when the ripple is always disabled.
    this._backgroundDiv = null;
  }

  /** Creates the div for the ripple background, if it doesn't already exist. */
  createBackgroundIfNeeded() {
    if (!this._backgroundDiv) {
      this._backgroundDiv = document.createElement('div');
      this._backgroundDiv.classList.add('md-ripple-background');
      this._rippleElement.appendChild(this._backgroundDiv);
    }
  }

  /**
   * Installs event handlers on the given trigger element, and removes event handlers from the
   * previous trigger if needed.
   *
   * @param newTrigger New trigger to which to attach the ripple handlers.
   */
  setTriggerElement(newTrigger: HTMLElement) {
    if (this._triggerElement !== newTrigger) {
      if (this._triggerElement) {
        this._eventHandlers.forEach((eventHandler, eventName) => {
          this._triggerElement.removeEventListener(eventName, eventHandler);
        });
      }
      this._triggerElement = newTrigger;
      if (this._triggerElement) {
        this._eventHandlers.forEach((eventHandler, eventName) => {
          this._triggerElement.addEventListener(eventName, eventHandler);
        });
      }
    }
  }

  /** Installs event handlers on the host element of the md-ripple directive. */
  setTriggerElementToHost() {
    this.setTriggerElement(this._rippleElement);
  }

  /** Removes event handlers from the current trigger element if needed. */
  clearTriggerElement() {
    this.setTriggerElement(null);
  }

  /**
   * Creates a foreground ripple and sets its animation to expand and fade in from the position
   * given by rippleOriginLeft and rippleOriginTop (or from the center of the <md-ripple>
   * bounding rect if centered is true).
   *
   * @param rippleOriginLeft Left origin of the ripple.
   * @param rippleOriginTop Top origin of the ripple.
   * @param color Ripple color.
   * @param centered Whether the ripple should be centered.
   * @param radius Radius of the ripple.
   * @param speedFactor Speed at which the ripple expands towards the edges.
   * @param transitionEndCallback Callback to be triggered when the ripple transition is done.
   */
  createForegroundRipple(
      rippleOriginLeft: number,
      rippleOriginTop: number,
      color: string,
      centered: boolean,
      radius: number,
      speedFactor: number,
      transitionEndCallback: (r: ForegroundRipple, e: TransitionEvent) => void) {
    const parentRect = this._rippleElement.getBoundingClientRect();
    // Create a foreground ripple div with the size and position of the fully expanded ripple.
    // When the div is created, it's given a transform style that causes the ripple to be displayed
    // small and centered on the event location (or the center of the bounding rect if the centered
    // argument is true). Removing that transform causes the ripple to animate to its natural size.
    const startX = centered ? (parentRect.left + parentRect.width / 2) : rippleOriginLeft;
    const startY = centered ? (parentRect.top + parentRect.height / 2) : rippleOriginTop;
    const offsetX = startX - parentRect.left;
    const offsetY = startY - parentRect.top;
    const maxRadius = radius > 0 ? radius : distanceToFurthestCorner(startX, startY, parentRect);

    const rippleDiv = document.createElement('div');
    this._rippleElement.appendChild(rippleDiv);
    rippleDiv.classList.add('md-ripple-foreground');
    rippleDiv.style.left = `${offsetX - maxRadius}px`;
    rippleDiv.style.top = `${offsetY - maxRadius}px`;
    rippleDiv.style.width = `${2 * maxRadius}px`;
    rippleDiv.style.height = rippleDiv.style.width;
    // If color input is not set, this will default to the background color defined in CSS.
    rippleDiv.style.backgroundColor = color;
    // Start the ripple tiny.
    rippleDiv.style.transform = `scale(0.001)`;

    const fadeInSeconds = (1 / (speedFactor || 1)) * Math.max(
        MIN_RIPPLE_FILL_TIME_SECONDS,
        Math.min(MAX_RIPPLE_FILL_TIME_SECONDS, maxRadius / RIPPLE_SPEED_PX_PER_SECOND));
    rippleDiv.style.transitionDuration = `${fadeInSeconds}s`;

    // https://timtaubert.de/blog/2012/09/css-transitions-for-dynamically-created-dom-elements/
    // Store the opacity to prevent this line as being seen as a no-op by optimizers.
    this._opacity = window.getComputedStyle(rippleDiv).opacity;

    rippleDiv.classList.add('md-ripple-fade-in');
    // Clearing the transform property causes the ripple to animate to its full size.
    rippleDiv.style.transform = '';
    const ripple = new ForegroundRipple(rippleDiv);
    ripple.state = ForegroundRippleState.EXPANDING;

    rippleDiv.addEventListener('transitionend',
        (event: TransitionEvent) => transitionEndCallback(ripple, event));
    // Ensure that ripples are always removed, even when transitionend doesn't fire.
    // Run this outside the Angular zone because there's nothing that Angular cares about.
    // If it were to run inside the Angular zone, every test that used ripples would have to be
    // either async or fakeAsync.
    this._ngZone.runOutsideAngular(() => {
      // The ripple lasts a time equal to the sum of fade-in, transform,
      // and fade-out (3 * fade-in time).
      let rippleDuration =  fadeInSeconds * 3 * 1000;
      setTimeout(() => this.removeRippleFromDom(ripple.rippleElement), rippleDuration);
    });
  }

  /**
   * Fades out a foreground ripple after it has fully expanded and faded in.
   * @param ripple Ripple to be faded out.
   */
  fadeOutForegroundRipple(ripple: Element) {
    ripple.classList.remove('md-ripple-fade-in');
    ripple.classList.add('md-ripple-fade-out');
  }

  /**
   * Removes a foreground ripple from the DOM after it has faded out.
   * @param ripple Ripple to be removed from the DOM.
   */
  removeRippleFromDom(ripple: Element) {
    if (ripple && ripple.parentElement) {
      ripple.parentElement.removeChild(ripple);
    }
  }

  /**
   * Fades in the ripple background.
   * @param color New background color for the ripple.
   */
  fadeInRippleBackground(color: string) {
    this._backgroundDiv.classList.add('md-ripple-active');
    // If color is not set, this will default to the background color defined in CSS.
    this._backgroundDiv.style.backgroundColor = color;
  }

  /** Fades out the ripple background. */
  fadeOutRippleBackground() {
    if (this._backgroundDiv) {
      this._backgroundDiv.classList.remove('md-ripple-active');
    }
  }
}
