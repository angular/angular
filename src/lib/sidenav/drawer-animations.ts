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

/** Animations used by the Material drawers. */
export const matDrawerAnimations: {
  readonly transformDrawer: AnimationTriggerMetadata;
} = {
  /** Animation that slides a drawer in and out. */
  transformDrawer: trigger('transform', [
    state('open, open-instant', style({
      transform: 'translate3d(0, 0, 0)',
      visibility: 'visible',
    })),
    state('void', style({
      visibility: 'hidden',
    })),
    transition('void => open-instant', animate('0ms')),
    transition('void <=> open, open-instant => void',
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
  ])
};
