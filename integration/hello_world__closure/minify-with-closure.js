#!/usr/bin/env node
var shell = require('shelljs');

shell.exec(_`./node_modules/.bin/google-closure-compiler
  # input
    --language_in=ECMASCRIPT_2015
    --js dist/_1-rollup-out/main.js
    --strict_mode_input
  # output format
    --compilation_level=SIMPLE
    --isolation_mode=IIFE
    --language_out=ECMASCRIPT_2015
    --js_output_file=dist/bundle.js
    --output_manifest=dist/manifest.MF
    --variable_renaming_report=dist/variable_renaming_report
  # debug
    # --formatting PRETTY_PRINT
  # misc
    --jscomp_off uselessCode     # disable warnings due to ngDevMode code blocks that were removed
    --jscomp_off suspiciousCode  # disable warnings due to ngDevMode code blocks that were removed
`);


/**
 * Helper fn to strip comments and replace newline characters with \ follow by a new line.
 *
 * This function allows multiline command above to be easier to read.
 */
function _(strings) {
  return strings
    .join('\n')
    .replace(/\s+#.*\n/g, '')
    .replace(/\n/g, ' \\\n');
}
