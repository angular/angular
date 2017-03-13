'use strict';

// Imports
const sh = require('shelljs');
const { CONTENT_DIR, TMP_OUTPUT_DIR } = require('./constants');

sh.config.fatal = true;

// Run
sh.cp('-r', TMP_OUTPUT_DIR, CONTENT_DIR);
