/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  animate,
  AnimationTriggerMetadata,
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
 */

/**
 * This animation transforms the select's overlay panel on and off the page.
 *
 * When the panel is attached to the DOM, it expands its width by the amount of padding, scales it
 * up to 100% on the Y axis, fades in its border, and translates slightly up and to the
 * side to ensure the option text correctly overlaps the trigger text.
 *
 * When the panel is removed from the DOM, it simply fades out linearly.
 */
export const transformPanel: AnimationTriggerMetadata = trigger('transformPanel', [
  state('showing', style({
    opacity: 1,
    minWidth: 'calc(100% + 32px)', // 32px = 2 * 16px padding
    transform: 'scaleY(1)'
  })),
  state('showing-multiple', style({
    opacity: 1,
    minWidth: 'calc(100% + 64px)', // 64px = 48px padding on the left + 16px padding on the right
    transform: 'scaleY(1)'
  })),
  transition('void => *', [
    style({
      opacity: 0,
      minWidth: '100%',
      transform: 'scaleY(0)'
    }),
    animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)')
  ]),
  transition('* => void', [
    animate('250ms 100ms linear', style({opacity: 0}))
  ])
]);

/**
 * This animation fades in the background color and text content of the
 * select's options. It is time delayed to occur 100ms after the overlay
 * panel has transformed in.
 */
export const fadeInContent: AnimationTriggerMetadata = trigger('fadeInContent', [
  state('showing', style({opacity: 1})),
  transition('void => showing', [
    style({opacity: 0}),
    animate('150ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
  ])
]);
