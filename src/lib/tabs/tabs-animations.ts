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

/**
 * Animations used by the Material tabs.
 * @docs-private
 */
export const matTabsAnimations: {
  readonly translateTab: AnimationTriggerMetadata;
} = {
  /** Animation translates a tab along the X axis. */
  translateTab: trigger('translateTab', [
    // Note: transitions to `none` instead of 0, because some browsers might blur the content.
    state('center, void, left-origin-center, right-origin-center', style({transform: 'none'})),

    // If the tab is either on the left or right, we additionally add a `min-height` of 1px
    // in order to ensure that the element has a height before its state changes. This is
    // necessary because Chrome does seem to skip the transition in RTL mode if the element does
    // not have a static height and is not rendered. See related issue: #9465
    state('left', style({transform: 'translate3d(-100%, 0, 0)', minHeight: '1px'})),
    state('right', style({transform: 'translate3d(100%, 0, 0)', minHeight: '1px'})),

    transition('* => left, * => right, left => center, right => center',
        animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)')),
    transition('void => left-origin-center', [
      style({transform: 'translate3d(-100%, 0, 0)'}),
      animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)')
    ]),
    transition('void => right-origin-center', [
      style({transform: 'translate3d(100%, 0, 0)'}),
      animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)')
    ])
  ])
};
