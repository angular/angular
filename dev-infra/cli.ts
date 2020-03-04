/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {verify} from './pullapprove/verify';

const args = process.argv.slice(2);


// TODO(josephperrott): Set up proper cli flag/command handling
switch (args[0]) {
  case 'pullapprove:verify':
    verify();
    break;
  default:
    console.info('No commands were matched');
}
