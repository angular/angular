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
  keyframes,
  AnimationTriggerMetadata,
} from '@angular/animations';
import {AnimationCurves, AnimationDurations} from '@angular/material/core';

const SORT_ANIMATION_TRANSITION = AnimationDurations.ENTERING + ' ' +
                                  AnimationCurves.STANDARD_CURVE;

/** Animations used by MatSort. */
export const matSortAnimations: {
  readonly indicator: AnimationTriggerMetadata;
  readonly leftPointer: AnimationTriggerMetadata;
  readonly rightPointer: AnimationTriggerMetadata;
  readonly indicatorToggle: AnimationTriggerMetadata;
} = {
  /** Animation that moves the sort indicator. */
  indicator: trigger('indicator', [
    state('asc', style({transform: 'translateY(0px)'})),
    // 10px is the height of the sort indicator, minus the width of the pointers
    state('desc', style({transform: 'translateY(10px)'})),
    transition('asc <=> desc', animate(SORT_ANIMATION_TRANSITION))
  ]),

  /** Animation that rotates the left pointer of the indicator based on the sorting direction. */
  leftPointer: trigger('leftPointer', [
    state('asc', style({transform: 'rotate(-45deg)'})),
    state('desc', style({transform: 'rotate(45deg)'})),
    transition('asc <=> desc', animate(SORT_ANIMATION_TRANSITION))
  ]),

  /** Animation that rotates the right pointer of the indicator based on the sorting direction. */
  rightPointer: trigger('rightPointer', [
    state('asc', style({transform: 'rotate(45deg)'})),
    state('desc', style({transform: 'rotate(-45deg)'})),
    transition('asc <=> desc', animate(SORT_ANIMATION_TRANSITION))
  ]),

  /** Animation that moves the indicator in and out of view when sorting is enabled/disabled. */
  indicatorToggle: trigger('indicatorToggle', [
    transition('void => asc', animate(SORT_ANIMATION_TRANSITION, keyframes([
      style({transform: 'translateY(25%)', opacity: 0}),
      style({transform: 'none', opacity: 1})
    ]))),
    transition('asc => void', animate(SORT_ANIMATION_TRANSITION, keyframes([
      style({transform: 'none', opacity: 1}),
      style({transform: 'translateY(-25%)', opacity: 0})
    ]))),
    transition('void => desc', animate(SORT_ANIMATION_TRANSITION, keyframes([
      style({transform: 'translateY(-25%)', opacity: 0}),
      style({transform: 'none', opacity: 1})
    ]))),
    transition('desc => void', animate(SORT_ANIMATION_TRANSITION, keyframes([
      style({transform: 'none', opacity: 1}),
      style({transform: 'translateY(25%)', opacity: 0})
    ]))),
  ])
};
