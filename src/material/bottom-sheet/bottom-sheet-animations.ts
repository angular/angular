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
  group,
  query,
  animateChild,
} from '@angular/animations';
import {AnimationCurves, AnimationDurations} from '@angular/material/core';

/** Animations used by the Material bottom sheet. */
export const matBottomSheetAnimations: {
  readonly bottomSheetState: AnimationTriggerMetadata;
} = {
  /** Animation that shows and hides a bottom sheet. */
  bottomSheetState: trigger('state', [
    state('void, hidden', style({transform: 'translateY(100%)'})),
    state('visible', style({transform: 'translateY(0%)'})),
    transition(
      'visible => void, visible => hidden',
      group([
        animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.ACCELERATION_CURVE}`),
        query('@*', animateChild(), {optional: true}),
      ]),
    ),
    transition(
      'void => visible',
      group([
        animate(`${AnimationDurations.EXITING} ${AnimationCurves.DECELERATION_CURVE}`),
        query('@*', animateChild(), {optional: true}),
      ]),
    ),
  ]),
};
