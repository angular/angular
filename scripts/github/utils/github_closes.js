#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var msg = '';

if (require.main === module) {
  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      msg += chunk;
    }
  });

  process.stdin.on('end', () => {
    var argv = process.argv.slice(2);
    console.info(rewriteMsg(msg, argv[0]));
  });
}

function rewriteMsg(msg, prNo) {
  var lines = msg.split(/\n/);
  lines[0] += ' (#' + prNo + ')';
  lines.push('PR Close #' + prNo);
  return lines.join('\n');
}

exports.rewriteMsg = rewriteMsg;
