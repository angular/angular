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
    const mc = new this._hammer(element, this._hammerOptions || undefined);

    // Default Hammer Recognizers.
    const pan = new this._hammer.Pan();
    const swipe = new this._hammer.Swipe();
    const press = new this._hammer.Press();

    // Notice that a HammerJS recognizer can only depend on one other recognizer once.
    // Otherwise the previous `recognizeWith` will be dropped.
    // TODO: Confirm threshold numbers with Material Design UX Team
    const slide = this._createRecognizer(pan, {event: 'slide', threshold: 0}, swipe);
    const longpress = this._createRecognizer(press, {event: 'longpress', time: 500});

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
