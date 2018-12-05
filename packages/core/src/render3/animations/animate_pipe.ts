/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Pipe} from '../../metadata/directives';
import {NgModule} from '../../metadata/ng_module';
import {BindingType, Player, PlayerFactoryBuildOptions} from '../interfaces/player';
import {bindPlayerFactory} from '../styling/player_factory';

import {CssTransitionAnimator} from './css_transition_animator';
import {getDefaultRenderUtil} from './default_render_util';
import {Animator, AnimatorState, Timing} from './interfaces';
import {StylingPlayer} from './styling_player';
import {parseTimingExp} from './util';


/**
 * Used to construct an animation player for `[style]` and `[class]` bindings.
 *
 * `AnimatePipe` is designed to be used alongside `[style]` and
 * `[class]` bindings and will produce an animation player that
 * will animate the change in styling using CSS transitions
 * (for both styles and classes).
 *
 * AnimatePipe returns an instance of `BoundPlayerFactory`
 * when executed. Once styling has been applied to the element
 * then the `BoundPlayerFactory` value will be called and an
 * animation player will be produced. This player will then
 * handle the application of the styling to the element within
 * its animation methodology.
 *
 * If any styling changes occur when the an existing animation is
 * midway then the `AnimatePipe`'s player factory will cancel
 * the existing animation and animate towards the new values.
 * While a cancellation does occur, the follow-up player will
 * retain all the earlier styling and will take that into account
 * when animating the new values that were passed in without
 * any flickers or timing gaps.
 *
 * Note that there is zero logic in the code below that will decide
 * if an animation is run based on application structure logic. (This
 * logic will be handled on a higher level via the component
 * `PlayerHandler` interface.)
 *
 * @publicApi
 */
@Pipe({name: 'animate', pure: true})
export class AnimatePipe {
  transform(value: string|boolean|null|undefined|{[key: string]: any}, timingExp: string|number) {
    const timing = parseTimingExp(timingExp);
    return bindPlayerFactory(
        (element: HTMLElement, type: BindingType, values: {[key: string]: any},
         previousPlayer: Player | null, options: PlayerFactoryBuildOptions) => {
          const styles = type === BindingType.Style ? values : null;
          const classes = type === BindingType.Class ? values : null;
          if (!options.isFirstRender) {
            return invokeStylingAnimation(element, classes, styles, timing);
          }
          return null;
        },
        value);
  }
}

// a WeakMap is used because it avoids the need to rely on a callback
// handler to detect when each element is removed since a weak map will
// automatically update its key state when an element is not referenced.
const ANIMATOR_MAP = new WeakMap<HTMLElement, Animator>();

export function invokeStylingAnimation(
    element: HTMLElement, classes: {[className: string]: boolean} | null,
    styles: {[key: string]: any} | null, timing: Timing): Player {
  let animator = ANIMATOR_MAP.get(element);
  if (!animator || animator.state === AnimatorState.Destroyed) {
    ANIMATOR_MAP.set(
        element, animator = new CssTransitionAnimator(element, getDefaultRenderUtil()));
  }
  return new StylingPlayer(element, animator, timing, classes, styles);
}

/**
 * @publicApi
 */
@NgModule({declarations: [AnimatePipe]})
export class AnimatePipeModule {
}