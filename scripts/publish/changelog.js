#!/usr/bin/env node

'use strict';

/**
 * Just a small command-line wrapper around the conventional-changelog npm module
 * (https://www.npmjs.com/package/conventional-changelog), which also prepends
 * changes to CHANGELOG.md.
 *
 * By default, this script will generate changes from relevant commits between the
 * most recent tag and HEAD. The `from` and `to` flags may be provided to control the range of
 * commits to process.
 *
 * Manually specify begin and end
 * $ ./changelog.js --from=e987ac40343d89d47b7b6cc1c5932fd55b30e18a --to=3f7ebde037d92f8d93c6a40c0d73f840cac08287
 * Run with default (latest tag...head)
 * $ ./changelog.js
 */

var fs = require('fs');
var cl = require('conventional-changelog');
var args = require('minimist')(process.argv.slice(2));

var changelogFile = 'CHANGELOG.md';

var config = {
  file: changelogFile,
  repository: 'https://github.com/angular/angular',
  version: require('../../package.json').version
};

if (args.from) {
  config.from = args.from;
}

if (args.to) {
  config.to = args.to;
}

cl(config, function(err, log) {
  if (err) {
    console.error('Failed to generate changelog: ' + err);
    return;
  }

  fs.writeFileSync(changelogFile, log);
});
