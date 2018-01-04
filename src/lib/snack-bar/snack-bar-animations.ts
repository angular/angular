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
import {AnimationCurves, AnimationDurations} from '@angular/material/core';

/** @docs-private */
export const SHOW_ANIMATION =
  `${AnimationDurations.ENTERING} ${AnimationCurves.DECELERATION_CURVE}`;

/** @docs-private */
export const HIDE_ANIMATION =
  `${AnimationDurations.EXITING} ${AnimationCurves.ACCELERATION_CURVE}`;

/** Animations used by the Material snack bar. */
export const matSnackBarAnimations: {
  readonly contentFade: AnimationTriggerMetadata;
  readonly snackBarState: AnimationTriggerMetadata;
} = {
  /** Animation that slides the dialog in and out of view and fades the opacity. */
  contentFade: trigger('contentFade', [
    transition(':enter', [
      style({opacity: '0'}),
      animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.STANDARD_CURVE}`)
    ])
  ]),

  /** Animation that shows and hides a snack bar. */
  snackBarState: trigger('state', [
    state('visible-top, visible-bottom', style({transform: 'translateY(0%)'})),
    transition('visible-top => hidden-top, visible-bottom => hidden-bottom',
      animate(HIDE_ANIMATION)),
    transition('void => visible-top, void => visible-bottom', animate(SHOW_ANIMATION)),
  ])
};
