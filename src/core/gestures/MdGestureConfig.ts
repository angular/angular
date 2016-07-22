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
    const mc = new Hammer(element);

    // create custom gesture recognizers
    const drag = new Hammer.Pan({event: 'drag', threshold: 6});
    const longpress = new Hammer.Press({event: 'longpress', time: 500});
    const slide = new Hammer.Pan({event: 'slide', threshold: 0});

    // ensure custom recognizers can coexist with the default gestures (i.e. pan, press, swipe)
    // custom recognizers can overwrite default recognizers if they aren't configured to
    // "recognizeWith" others that listen to the same base events.
    const pan = new Hammer.Pan();
    const press = new Hammer.Press();
    const swipe = new Hammer.Swipe();

    drag.recognizeWith(pan);
    drag.recognizeWith(swipe);
    drag.recognizeWith(slide);

    pan.recognizeWith(swipe);
    pan.recognizeWith(slide);

    slide.recognizeWith(swipe);

    longpress.recognizeWith(press);

    // add customized gestures to Hammer manager
    mc.add([drag, pan, swipe, press, longpress, slide]);
    return mc;
  }

}
