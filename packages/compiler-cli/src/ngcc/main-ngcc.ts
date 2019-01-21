#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {mainNgcc} from './src/main';

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  process.exitCode = mainNgcc(args);
}
