/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  animate,
  animateChild,
  AnimationTriggerMetadata,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * The following are all the animations for the mat-select component, with each
 * const containing the metadata for one animation.
 *
 * The values below match the implementation of the AngularJS Material mat-select animation.
 * @docs-private
 */
export const matSelectAnimations: {
  /**
   * @deprecated No longer being used. To be removed.
   * @breaking-change 12.0.0
   */
  readonly transformPanelWrap: AnimationTriggerMetadata;
  readonly transformPanel: AnimationTriggerMetadata;
} = {
  /**
   * This animation ensures the select's overlay panel animation (transformPanel) is called when
   * closing the select.
   * This is needed due to https://github.com/angular/angular/issues/23302
   */
  transformPanelWrap: trigger('transformPanelWrap', [
    transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
  ]),

  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: trigger('transformPanel', [
    state(
      'void',
      style({
        opacity: 0,
        transform: 'scale(1, 0.8)',
      }),
    ),
    transition(
      'void => showing',
      animate(
        '120ms cubic-bezier(0, 0, 0.2, 1)',
        style({
          opacity: 1,
          transform: 'scale(1, 1)',
        }),
      ),
    ),
    transition('* => void', animate('100ms linear', style({opacity: 0}))),
  ]),
};
