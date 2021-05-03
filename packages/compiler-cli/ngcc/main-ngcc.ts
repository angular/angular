#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {mainNgcc} from './src/main';
import {parseCommandLineOptions} from './src/command_line_options';

// CLI entry point
if (require.main === module) {
  process.title = 'ngcc';
  const startTime = Date.now();
  const options = parseCommandLineOptions(process.argv.slice(2));
  (async () => {
    try {
      await mainNgcc(options);
      if (options.logger) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        options.logger.debug(`Run ngcc in ${duration}s.`);
      }
      process.exitCode = 0;
    } catch (e) {
      console.error(e.stack || e.message);
      process.exit(typeof e.code === 'number' ? e.code : 1);
    }
  })();
}
