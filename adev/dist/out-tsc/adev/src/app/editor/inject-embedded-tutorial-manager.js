/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {injectAsync} from '../core/services/inject-async';
export function injectEmbeddedTutorialManager(injector) {
  return injectAsync(injector, () =>
    import('./embedded-tutorial-manager.service').then((c) => c.EmbeddedTutorialManager),
  );
}
//# sourceMappingURL=inject-embedded-tutorial-manager.js.map
