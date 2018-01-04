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

/** Animations used by MatTooltip. */
export const matTooltipAnimations: {
  readonly tooltipState: AnimationTriggerMetadata;
} = {
  /** Animation that transitions a tooltip in and out. */
  tooltipState: trigger('state', [
    state('initial, void, hidden', style({transform: 'scale(0)'})),
    state('visible', style({transform: 'scale(1)'})),
    transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
    transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
  ])
};
