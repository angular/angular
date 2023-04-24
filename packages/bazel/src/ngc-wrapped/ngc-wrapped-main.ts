/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {main} from './index';

main(process.argv.slice(2)).then(exitCode => process.exitCode = exitCode).catch(e => {
  console.error(e);
  process.exitCode = 1;
});
