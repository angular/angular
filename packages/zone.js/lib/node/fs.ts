/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  const TO_PATCH_MACROTASK_METHODS = [
    'access',  'appendFile', 'chmod',    'chown',    'close',     'exists',    'fchmod',
    'fchown',  'fdatasync',  'fstat',    'fsync',    'ftruncate', 'futimes',   'lchmod',
    'lchown',  'link',       'lstat',    'mkdir',    'mkdtemp',   'open',      'read',
    'readdir', 'readFile',   'readlink', 'realpath', 'rename',    'rmdir',     'stat',
    'symlink', 'truncate',   'unlink',   'utimes',   'write',     'writeFile',
  ];

  if (fs) {
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
  }
});
