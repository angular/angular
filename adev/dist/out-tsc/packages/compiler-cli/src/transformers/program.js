/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NgtscProgram} from '../ngtsc/program';
export function createProgram({rootNames, options, host, oldProgram}) {
  return new NgtscProgram(rootNames, options, host, oldProgram);
}
//# sourceMappingURL=program.js.map
