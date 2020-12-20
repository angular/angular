#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var json = '';

if (require.main === module) {
  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      json += chunk;
    }
  });

  process.stdin.on('end', () => {
    var obj = JSON.parse(json);
    var argv = process.argv.slice(2);
    extractPaths(obj, argv).forEach(function(line) {
      console.info(line);
    });
  });
}

function extractPaths(obj, paths) {
  var lines = [];
  paths.forEach(function(exp) {
    var objs = obj instanceof Array ? [].concat(obj) : [obj];
    exp.split('.').forEach(function(name) {
      for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        if (o instanceof Array) {
          // Expand and do over
          objs = objs.slice(0, i).concat(o).concat(objs.slice(i + 1, objs.length));
          i--;
        } else {
          name.split('=').forEach(function(name, index) {
            if (index == 0) {
              objs[i] = o = o[name];
            } else if (name.charAt(0) == '^') {
              if (o.indexOf(name.substr(1)) !== 0) {
                objs.splice(i, 1);
                i--;
              }
            }
          });
        }
      }
    });
    lines.push(objs.join('|'));
  });
  return lines;
}

exports.extractPaths = extractPaths;
