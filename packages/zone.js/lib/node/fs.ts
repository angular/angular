/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {patchMacroTask} from '../common/utils';

Zone.__load_patch('fs', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  let fs: any;
  try {
    fs = require('fs');
  } catch (err) {
  }

  // watch, watchFile, unwatchFile has been patched
  // because EventEmitter has been patched
  const TO_PATCH_MACROTASK_NESTED = [
    {'parent': 'realpath', 'nested': 'native'},
  ];
  const TO_PATCH_MACROTASK_METHODS = [
    'access',  'appendFile', 'chmod',    'chown',    'close',     'exists',    'fchmod',
    'fchown',  'fdatasync',  'fstat',    'fsync',    'ftruncate', 'futimes',   'lchmod',
    'lchown',  'link',       'lstat',    'mkdir',    'mkdtemp',   'open',      'read',
    'readdir', 'readFile',   'readlink', 'realpath', 'rename',    'rmdir',     'stat',
    'symlink', 'truncate',   'unlink',   'utimes',   'write',     'writeFile',
  ];

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

  TO_PATCH_MACROTASK_NESTED.forEach(nested => {
    // get original delegate
    const patched = fs[nested.parent];
    if (!patched) {
      return;
    }
    const unpatched = patched[api.symbol('OriginalDelegate')];
    patched[nested.nested] = unpatched && unpatched[nested.nested];
    patchMacroTask(patched, nested.nested, (self: any, args: any[]) => {
      return {
        name: `fs.${nested.parent}.${nested.nested}`, args: args,
            cbIdx: args.length > 0 ? args.length - 1 : -1, target: self
      }
    });
  });
});
