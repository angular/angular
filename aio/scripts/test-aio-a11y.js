#!/bin/env node
'use strict';

/**
 * Usage:
 * ```sh
 * node scripts/test-aio-a11y <origin>
 * ```
 *
 * Runs accessibility audits on several (pre-defined) pages on the specified origin. It fails, if
 * the score for any page is below the minimum (see `MIN_SCORES_PER_PAGE` below).
 *
 * `<origin>` is the origin (scheme + hostname + port) of an angular.io deployment. It can be remote
 * (e.g. `https://next.angular.io`) or local (e.g. `http://localhost:4200`).
 */

// Imports
const sh = require('shelljs');
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
  'start/start-routing': 98,
  'tutorial': 98,
};

// Run
const auditWebAppCmd = `"${process.execPath}" "${__dirname}/audit-web-app"`;
const origin = process.argv[2];
for (const [page, minScore] of Object.entries(MIN_SCORES_PER_PAGE)) {
  sh.exec(`${auditWebAppCmd} ${origin}/${page} accessibility:${minScore}`);
}
