/**
 * @fileOverview
 * This file serves as the entry point for generating goldens file for the
 * language service integration test. It expects each golden file that needs
 * to be generated to be passed in as command line arguments.
 * For example, to generate golden file for the 'configure' request, run
 * `yarn golden configure.json`.
 * To generate multiple golden files, run
 * `yarn golden configure.json completionInfo.json`.
 *
 * This is different from just running `yarn jasmine test.js` because this
 * allows passing in arbitrary arguments.
 */

import Jasmine = require('jasmine');

function main() {
  const jasmine = new Jasmine({});
  jasmine.execute(['test.js']);
}

main()
