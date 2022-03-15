/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
} from '@angular/animations';

export const DEFAULT_HORIZONTAL_ANIMATION_DURATION = '500ms';
export const DEFAULT_VERTICAL_ANIMATION_DURATION = '225ms';

/**
 * Animations used by the Material steppers.
 * @docs-private
 */
export const matStepperAnimations: {
  readonly horizontalStepTransition: AnimationTriggerMetadata;
  readonly verticalStepTransition: AnimationTriggerMetadata;
} = {
  /** Animation that transitions the step along the X axis in a horizontal stepper. */
  horizontalStepTransition: trigger('horizontalStepTransition', [
    state('previous', style({transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'})),
    // Transition to `inherit`, rather than `visible`,
    // because visibility on a child element the one from the parent,
    // making this element focusable inside of a `hidden` element.
    state('current', style({transform: 'none', visibility: 'inherit'})),
    state('next', style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'})),
    transition('* => *', animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'), {
      params: {'animationDuration': DEFAULT_HORIZONTAL_ANIMATION_DURATION},
    }),
  ]),

  /** Animation that transitions the step along the Y axis in a vertical stepper. */
  verticalStepTransition: trigger('verticalStepTransition', [
    state('previous', style({height: '0px', visibility: 'hidden'})),
    state('next', style({height: '0px', visibility: 'hidden'})),
    // Transition to `inherit`, rather than `visible`,
    // because visibility on a child element the one from the parent,
    // making this element focusable inside of a `hidden` element.
    state('current', style({height: '*', visibility: 'inherit'})),
    transition('* <=> current', animate('{{animationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)'), {
      params: {'animationDuration': DEFAULT_VERTICAL_ANIMATION_DURATION},
    }),
  ]),
};
