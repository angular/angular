import {Injectable} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';

/* Adjusts configuration of our gesture library, Hammer. */
@Injectable()
export class MdGestureConfig extends HammerGestureConfig {
  /* List of new event names to add to the gesture support list */
  events: string[] = ['drag', 'longpress'];

  /*
  * Overrides default recognizer event names and thresholds.
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
  overrides: {[key: string]: Object} = {
    'pan': {event: 'drag', threshold: 6},
    'press': {event: 'longpress', time: 500}
  };
}
