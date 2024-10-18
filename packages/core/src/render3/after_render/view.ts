/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AFTER_RENDER_SEQUENCES_TO_REGISTER, LView} from '../interfaces/view';
import {AfterRenderSequence} from './manager';

export function registerAfterRendersInView(lView: LView) {
  let sequence: AfterRenderSequence | undefined;
  while ((sequence = lView[AFTER_RENDER_SEQUENCES_TO_REGISTER]?.shift())) {
    sequence.impl.register(sequence);
  }
}
