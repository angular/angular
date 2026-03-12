/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AFTER_RENDER_SEQUENCES_TO_ADD, LView} from '../interfaces/view';

export function addAfterRenderSequencesForView(lView: LView) {
  if (lView[AFTER_RENDER_SEQUENCES_TO_ADD] !== null) {
    for (const sequence of lView[AFTER_RENDER_SEQUENCES_TO_ADD]) {
      sequence.impl.addSequence(sequence);
    }
    lView[AFTER_RENDER_SEQUENCES_TO_ADD].length = 0;
  }
}
