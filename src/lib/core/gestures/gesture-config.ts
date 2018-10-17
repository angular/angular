/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, InjectionToken, Inject, Optional} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';
import {MatCommonModule} from '../common-behaviors/common-module';
import {
  HammerStatic,
  HammerInstance,
  Recognizer,
  RecognizerStatic,
  HammerOptions,
} from './gesture-annotations';

/**
 * Injection token that can be used to provide options to the Hammerjs instance.
 * More info at http://hammerjs.github.io/api/.
 */
export const MAT_HAMMER_OPTIONS = new InjectionToken<HammerOptions>('MAT_HAMMER_OPTIONS');

const ANGULAR_MATERIAL_SUPPORTED_HAMMER_GESTURES = [
  'longpress',
  'slide',
  'slidestart',
  'slideend',
  'slideright',
  'slideleft'
];

/**
 * Fake HammerInstance that is used when a Hammer instance is requested when HammerJS has not
 * been loaded on the page.
 */
const noopHammerInstance: HammerInstance = {
  on: () => {},
  off: () => {},
};

/** Adjusts configuration of our gesture library, Hammer. */
@Injectable()
export class GestureConfig extends HammerGestureConfig {
  /** List of new event names to add to the gesture support list */
  events = ANGULAR_MATERIAL_SUPPORTED_HAMMER_GESTURES;

  constructor(
    @Optional() @Inject(MAT_HAMMER_OPTIONS) private _hammerOptions?: HammerOptions,
    @Optional() commonModule?: MatCommonModule) {
    super();
    if (commonModule) {
      commonModule._checkHammerIsAvailable();
    }
  }

  /**
   * Builds Hammer instance manually to add custom recognizers that match the Material Design spec.
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
  buildHammer(element: HTMLElement): HammerInstance {
    const hammer: HammerStatic = typeof window !== 'undefined' ? (window as any).Hammer : null;

    if (!hammer) {
      // If HammerJS is not loaded here, return the noop HammerInstance. This is necessary to
      // ensure that omitting HammerJS completely will not cause any errors while *also* supporting
      // the lazy-loading of HammerJS via the HAMMER_LOADER token introduced in Angular 6.1.
      // Because we can't depend on HAMMER_LOADER's existance until 7.0, we have to always set
      // `this.events` to the set we support, instead of conditionally setting it to `[]` if
      // `HAMMER_LOADER` is present (and then throwing an Error here if `window.Hammer` is
      // undefined).
      // @breaking-change 8.0.0
      return noopHammerInstance;
    }

    const mc = new hammer(element, this._hammerOptions || undefined);

    // Default Hammer Recognizers.
    const pan = new hammer.Pan();
    const swipe = new hammer.Swipe();
    const press = new hammer.Press();

    // Notice that a HammerJS recognizer can only depend on one other recognizer once.
    // Otherwise the previous `recognizeWith` will be dropped.
    // TODO: Confirm threshold numbers with Material Design UX Team
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
