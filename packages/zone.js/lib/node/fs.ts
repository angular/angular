/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {patchMacroTask} from '../common/utils';

Zone.__load_patch('fs', () => {
  let fs: any;
  try {
    fs = require('fs');
  } catch (err) {
  }

  // watch, watchFile, unwatchFile has been patched
  // because EventEmitter has been patched
  const TO_PATCH_MACROTASK_NESTED = [
    {'parent': 'realpath', 'nested': 'native'},
    {'parent': 'realpathSync', 'nested': 'native'},
  ];
  const TO_PATCH_MACROTASK_METHODS = [
    'access',  'appendFile', 'chmod',    'chown',    'close',     'exists',    'fchmod',
    'fchown',  'fdatasync',  'fstat',    'fsync',    'ftruncate', 'futimes',   'lchmod',
    'lchown',  'link',       'lstat',    'mkdir',    'mkdtemp',   'open',      'read',
    'readdir', 'readFile',   'readlink', 'realpath', 'rename',    'rmdir',     'stat',
    'symlink', 'truncate',   'unlink',   'utimes',   'write',     'writeFile',
  ];

  if (fs) {
    // store the patched nested function temporarily first
    const tempNestedResults: {[key: string]: any} = {};
    TO_PATCH_MACROTASK_NESTED
        .filter(
            method => !!fs?.[method.parent][method.nested] &&
                typeof fs[method.parent][method.nested] === 'function')
        .forEach(function(method) {
          patchMacroTask(fs[method.parent], method.nested, function(self, args) {
            return {
              name: 'fs.' + method.parent + '.' + method.nested,
              args: args,
              cbIdx: args.length > 0 ? args.length - 1 : -1,
              target: self
            };
          });
          tempNestedResults[method.parent] = tempNestedResults[method.parent] || {};
          tempNestedResults[method.parent][method.nested] = fs[method.parent][method.nested];
        });

    // patching of direct fs functions will override nested functions
    TO_PATCH_MACROTASK_METHODS.filter(name => !!fs[name] && typeof fs[name] === 'function')
        .forEach(name => {
          patchMacroTask(fs, name, (self: any, args: any[]) => {
            return {
              name: 'fs.' + name,
              args: args,
              cbIdx: args.length > 0 ? args.length - 1 : -1,
              target: self
            };
          });
        });

    // re-populate the nested function as it became undefined
    for (let method of TO_PATCH_MACROTASK_NESTED) {
      fs[method.parent][method.nested] = tempNestedResults[method.parent][method.nested];
    }
  }
});
