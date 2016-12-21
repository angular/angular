import {Injectable, isDevMode} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';
import {HammerStatic, HammerInstance, Recognizer, RecognizerStatic} from './gesture-annotations';

/* Adjusts configuration of our gesture library, Hammer. */
@Injectable()
export class GestureConfig extends HammerGestureConfig {
  private _hammer: HammerStatic = typeof window !== 'undefined' ? (window as any).Hammer : null;

  /* List of new event names to add to the gesture support list */
  events: string[] = this._hammer ? [
    'longpress',
    'slide',
    'slidestart',
    'slideend',
    'slideright',
    'slideleft'
  ] : [];

  constructor() {
    super();

    if (!this._hammer && isDevMode()) {
      console.warn(
        'Could not find HammerJS. Certain Angular Material ' +
        'components may not work correctly.'
      );
    }
  }

  /**
   * Builds Hammer instance manually to add custom recognizers that match the Material Design spec.
   *
   * Our gesture names come from the Material Design gestures spec:
   * https://www.google.com/design/spec/patterns/gestures.html#gestures-touch-mechanics
   *
   * More information on default recognizers can be found in Hammer docs:
   * http://hammerjs.github.io/recognizer-pan/
   * http://hammerjs.github.io/recognizer-press/
   *
   * @param element Element to which to assign the new HammerJS gestures.
   * @returns Newly-created HammerJS instance.
   */
  buildHammer(element: HTMLElement): HammerInstance {
    const mc = new this._hammer(element);

    // Default Hammer Recognizers.
    let pan = new this._hammer.Pan();
    let swipe = new this._hammer.Swipe();
    let press = new this._hammer.Press();

    // Notice that a HammerJS recognizer can only depend on one other recognizer once.
    // Otherwise the previous `recognizeWith` will be dropped.
    // TODO: Confirm threshold numbers with Material Design UX Team
    let slide = this._createRecognizer(pan, {event: 'slide', threshold: 0}, swipe);
    let longpress = this._createRecognizer(press, {event: 'longpress', time: 500});

    // Overwrite the default `pan` event to use the swipe event.
    pan.recognizeWith(swipe);

    // Add customized gestures to Hammer manager
    mc.add([swipe, press, pan, slide, longpress]);

    return mc as HammerInstance;
  }

  /** Creates a new recognizer, without affecting the default recognizers of HammerJS */
  private _createRecognizer(base: Recognizer, options: any, ...inheritances: Recognizer[]) {
    let recognizer = new (base.constructor as RecognizerStatic)(options);

    inheritances.push(base);
    inheritances.forEach(item => recognizer.recognizeWith(item));

    return recognizer;
  }

}
