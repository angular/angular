/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import{
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  group,
  sequence,
  AnimationTriggerMetadata,
} from '@angular/animations';

/**
 * Animations used by the mat-menu component.
 * Animation duration and timing values are based on:
 * https://material.io/guidelines/components/menus.html#menus-usage
 */
export const matMenuAnimations: {
  readonly transformMenu: AnimationTriggerMetadata;
  readonly fadeInItems: AnimationTriggerMetadata;
} = {
  /**
   * This animation controls the menu panel's entry and exit from the page.
   *
   * When the menu panel is added to the DOM, it scales in and fades in its border.
   *
   * When the menu panel is removed from the DOM, it simply fades out after a brief
   * delay to display the ripple.
   */
  transformMenu: trigger('transformMenu', [
    state('void', style({
      opacity: 0,
      // This starts off from 0.01, instead of 0, because there's an issue in the Angular animations
      // as of 4.2, which causes the animation to be skipped if it starts from 0.
      transform: 'scale(0.01, 0.01)'
    })),
    transition('void => enter', sequence([
      query('.mat-menu-content', style({opacity: 0})),
      animate('100ms linear', style({opacity: 1, transform: 'scale(1, 0.5)'})),
      group([
        query('.mat-menu-content', animate('400ms cubic-bezier(0.55, 0, 0.55, 0.2)',
          style({opacity: 1})
        )),
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({transform: 'scale(1, 1)'})),
      ])
    ])),
    transition('* => void', animate('150ms 50ms linear', style({opacity: 0})))
  ]),


  /**
   * This animation fades in the background color and content of the menu panel
   * after its containing element is scaled in.
   */
  fadeInItems: trigger('fadeInItems', [
    // TODO(crisbeto): this is inside the `transformMenu`
    // now. Remove next time we do breaking changes.
    state('showing', style({opacity: 1})),
    transition('void => *', [
      style({opacity: 0}),
      animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
    ])
  ])
};

/**
 * @deprecated
 * @breaking-change 7.0.0
 */
export const fadeInItems = matMenuAnimations.fadeInItems;

/**
 * @deprecated
 * @breaking-change 7.0.0
 */
export const transformMenu = matMenuAnimations.transformMenu;
