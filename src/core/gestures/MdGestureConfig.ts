import {Injectable} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';

/* Adjusts configuration of our gesture library, Hammer. */
@Injectable()
export class MdGestureConfig extends HammerGestureConfig {

  /* List of new event names to add to the gesture support list */
  events: string[] = [
    'drag',
    'dragstart',
    'dragend',
    'dragright',
    'dragleft',
    'longpress',
    'slide',
    'slidestart',
    'slideend',
    'slideright',
    'slideleft'
  ];

  /*
   * Builds Hammer instance manually to add custom recognizers that match the Material Design spec.
   *
   * Our gesture names come from the Material Design gestures spec:
   * https://www.google.com/design/spec/patterns/gestures.html#gestures-touch-mechanics
   *
   * More information on default recognizers can be found in Hammer docs:
   * http://hammerjs.github.io/recognizer-pan/
   * http://hammerjs.github.io/recognizer-press/
   *
   * TODO: Confirm threshold numbers with Material Design UX Team
   * */
  buildHammer(element: HTMLElement) {
    var mc = new Hammer(element);

    // Create custom gesture recognizers
    let drag = this._createRecognizer(Hammer.Pan, {event: 'drag', threshold: 6}, Hammer.Swipe);
    let slide = this._createRecognizer(Hammer.Pan, {event: 'slide', threshold: 0}, Hammer.Swipe);
    let longpress = this._createRecognizer(Hammer.Press, {event: 'longpress', time: 500});

    let pan = new Hammer.Pan();
    let swipe = new Hammer.Swipe();

    // Overwrite the default `pan` event to use the swipe event.
    pan.recognizeWith(swipe);

    // Add customized gestures to Hammer manager
    mc.add([drag, slide, pan, longpress]);

    return mc;
  }

  /** Creates a new recognizer, without affecting the default recognizers of HammerJS */
  private _createRecognizer(type: RecognizerStatic, options: any, ...extra: RecognizerStatic[]) {
    let recognizer = new type(options);

    // Add the default recognizer to the new custom recognizer.
    extra.push(type);
    extra.forEach(entry => recognizer.recognizeWith(new entry()));

    return recognizer;
  }

}
