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

  /**
   * This animation transforms the select's overlay panel on and off the page.
   *
   * When the panel is attached to the DOM, it expands its width by the amount of padding, scales it
   * up to 100% on the Y axis, fades in its border, and translates slightly up and to the
   * side to ensure the option text correctly overlaps the trigger text.
   *
   * When the panel is removed from the DOM, it simply fades out linearly.
   */
  transformPanel: trigger('transformPanel', [
    state(
      'void',
      style({
        transform: 'scaleY(0.8)',
        minWidth: '100%',
        opacity: 0,
      }),
    ),
    state(
      'showing',
      style({
        opacity: 1,
        minWidth: 'calc(100% + 32px)', // 32px = 2 * 16px padding
        transform: 'scaleY(1)',
      }),
    ),
    state(
      'showing-multiple',
      style({
        opacity: 1,
        minWidth: 'calc(100% + 64px)', // 64px = 48px padding on the left + 16px padding on the right
        transform: 'scaleY(1)',
      }),
    ),
    transition('void => *', animate('120ms cubic-bezier(0, 0, 0.2, 1)')),
    transition('* => void', animate('100ms 25ms linear', style({opacity: 0}))),
  ]),
};
