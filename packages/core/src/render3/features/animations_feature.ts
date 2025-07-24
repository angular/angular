/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementRegistry} from '../../animation';
import {setAnimationElementRemovalRegistry} from '../state';

/**
 * This feature adds the element registry for delayed element removal when animate.leave
 * is utilized.
 *
 * @codeGenApi
 */
export function ɵɵAnimationsFeature() {
  return () => {
    setAnimationElementRemovalRegistry(new ElementRegistry());
  };
}
