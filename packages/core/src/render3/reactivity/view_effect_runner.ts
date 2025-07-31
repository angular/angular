/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EFFECTS, FLAGS, type LView, LViewFlags} from '../interfaces/view';

export function runEffectsInView(view: LView): void {
  if (view[EFFECTS] === null) {
    return;
  }

  // Since effects can make other effects dirty, we flush them in a loop until there are no more to
  // flush.
  let tryFlushEffects = true;

  while (tryFlushEffects) {
    let foundDirtyEffect = false;
    for (const effect of view[EFFECTS]) {
      if (!effect.__dirty) {
        continue;
      }
      foundDirtyEffect = true;

      // `runEffectsInView` is called during change detection, and therefore runs
      // in the Angular zone if it's available.
      if (effect.zone === null || Zone.current === effect.zone) {
        effect.run();
      } else {
        effect.zone.run(() => effect.run());
      }
    }

    // Check if we need to continue flushing. If we didn't find any dirty effects, then there's
    // no need to loop back. Otherwise, check the view to see if it was marked for traversal
    // again. If so, there's a chance that one of the effects we ran caused another effect to
    // become dirty.
    tryFlushEffects = foundDirtyEffect && !!(view[FLAGS] & LViewFlags.HasChildViewsToRefresh);
  }
}
