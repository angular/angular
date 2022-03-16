#!/bin/env node

/**
 * Usage:
 * ```sh
 * node scripts/test-aio-a11y.mjs <origin>
 * ```
 *
 * Runs accessibility audits on several (pre-defined) pages on the specified origin. It fails, if
 * the score for any page is below the minimum (see `MIN_SCORES_PER_PAGE` below).
 *
 * `<origin>` is the origin (scheme + hostname + port) of an angular.io deployment. It can be remote
 * (e.g. `https://next.angular.io`) or local (e.g. `http://localhost:4200`).
 */

// Imports
import {dirname} from 'path';
import sh from 'shelljs';
import {fileURLToPath} from 'url';

sh.set('-e');

// Constants
const MIN_SCORES_PER_PAGE = {
  '': 100,
  'api': 100,
  'api/core/Directive': 98,
  'cli': 100,
  'cli/add': 100,
  'docs': 100,
  'guide/docs-style-guide': 96,
  'start/start-routing': 97,
  'tutorial': 97,
};

// Run
const __dirname = dirname(fileURLToPath(import.meta.url));
const auditWebAppCmd = `"${process.execPath}" "${__dirname}/audit-web-app.mjs"`;
const origin = process.argv[2];
for (const [page, minScore] of Object.entries(MIN_SCORES_PER_PAGE)) {
  sh.exec(`${auditWebAppCmd} ${origin}/${page} accessibility:${minScore}`);
}
