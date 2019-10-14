/**
 * Custom HammerJS configuration forked from Angular Material. With Angular v9,
 * Angular Material dropped HammerJS as a dependency. This configuration was added
 * automatically to this application because `ng update` detected that this application
 * directly used HammerJS.
 *
 * If this application does not depend on the custom gestures originally defined by
 * Angular Material, this file can be deleted.
 */

import {Injectable, Inject, Optional, Type} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';
import {MAT_HAMMER_OPTIONS} from '@angular/material/core';

const SUPPORTED_CUSTOM_GESTURES = [
  'longpress',
  'slide',
  'slidestart',
  'slideend',
  'slideright',
  'slideleft'
];

/**
 * Fake HammerInstance that is used when a Hammer instance is requested when
 * HammerJS has not been loaded on the page.
 */
const noopHammerInstance = {
  on: () => {},
  off: () => {},
};

/**
 * Adjusts configuration of our gesture library, Hammer.
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 */
@Injectable()
export class GestureConfig extends HammerGestureConfig {
  /** List of new event names to add to the gesture support list */
  events = SUPPORTED_CUSTOM_GESTURES;

  constructor(
    @Optional() @Inject(MAT_HAMMER_OPTIONS) private _hammerOptions?: any) {
    super();
  }

  /**
   * Builds Hammer instance manually to add custom recognizers that match the
   * Material Design spec.
   *
   * Our gesture names come from the Material Design gestures spec:
   * https://material.io/design/#gestures-touch-mechanics
   *
   * More information on default recognizers can be found in Hammer docs:
   * http://hammerjs.github.io/recognizer-pan/
   * http://hammerjs.github.io/recognizer-press/
   *
   * @param element Element to which to assign the new HammerJS gestures.
   * @returns Newly-created HammerJS instance.
   */
  buildHammer(element: HTMLElement): any {
    const hammer: any = typeof window !== 'undefined' ? (window as any).Hammer : null;

    if (!hammer) {
      return noopHammerInstance;
    }

    const mc = new hammer(element, this._hammerOptions || undefined);

    // Default Hammer Recognizers.
    const pan = new hammer.Pan();
    const swipe = new hammer.Swipe();
    const press = new hammer.Press();

    // Notice that a HammerJS recognizer can only depend on one other recognizer once.
    // Otherwise the previous `recognizeWith` will be dropped.
    const slide = this._createRecognizer(pan, {event: 'slide', threshold: 0}, swipe);
    const longpress = this._createRecognizer(press, {event: 'longpress', time: 500});

    // Overwrite the default `pan` event to use the swipe event.
    pan.recognizeWith(swipe);

    // Since the slide event threshold is set to zero, the slide recognizer can fire and
    // accidentally reset the longpress recognizer. In order to make sure that the two
    // recognizers can run simultaneously but don't affect each other, we allow the slide
    // recognizer to recognize while a longpress is being processed.
    // See: https://github.com/hammerjs/hammer.js/blob/master/src/manager.js#L123-L124
    longpress.recognizeWith(slide);

    // Add customized gestures to Hammer manager
    mc.add([swipe, press, pan, slide, longpress]);

    return mc;
  }

  /** Creates a new recognizer, without affecting the default recognizers of HammerJS */
  private _createRecognizer(base: Object, options: any, ...inheritances: Object[]) {
    const recognizer = new (base.constructor as Type<any>)(options);
    inheritances.push(base);
    inheritances.forEach(item => recognizer.recognizeWith(item));
    return recognizer;
  }

}
