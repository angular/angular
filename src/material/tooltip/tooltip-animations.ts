/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
 * Animations used by MatTooltip.
 * @docs-private
 */
export const matTooltipAnimations: {
  readonly tooltipState: AnimationTriggerMetadata;
} = {
  /** Animation that transitions a tooltip in and out. */
  tooltipState: trigger('state', [
    // TODO(crisbeto): these values are based on MDC's CSS.
    // We should be able to use their styles directly once we land #19432.
    state('initial, void, hidden', style({opacity: 0, transform: 'scale(0.8)'})),
    state('visible', style({transform: 'scale(1)'})),
    transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
    transition('* => hidden', animate('75ms cubic-bezier(0.4, 0, 1, 1)')),
  ]),
};
