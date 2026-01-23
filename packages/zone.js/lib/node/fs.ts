/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {patchMacroTask} from '../common/utils';
import {ZoneType} from '../zone-impl';

export function patchFs(Zone: ZoneType): void {
  Zone.__load_patch('fs', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    let fs: any;
    try {
      fs = require('fs');
    } catch (err) {}

    if (!fs) return;

    // watch, watchFile, unwatchFile has been patched
    // because EventEmitter has been patched
    const TO_PATCH_MACROTASK_METHODS = [
      'access',
      'appendFile',
      'chmod',
      'chown',
      'close',
      'exists',
      'fchmod',
      'fchown',
      'fdatasync',
      'fstat',
      'fsync',
      'ftruncate',
      'futimes',
      'lchmod',
      'lchown',
      'lutimes',
      'link',
      'lstat',
      'mkdir',
      'mkdtemp',
      'open',
      'opendir',
      'read',
      'readdir',
      'readFile',
      'readlink',
      'realpath',
      'rename',
      'rmdir',
      'stat',
      'symlink',
      'truncate',
      'unlink',
      'utimes',
      'write',
      'writeFile',
      'writev',
    ];

    TO_PATCH_MACROTASK_METHODS.filter(
      (name) => !!fs[name] && typeof fs[name] === 'function',
    ).forEach((name) => {
      patchMacroTask(fs, name, (self: any, args: any[]) => {
        return {
          name: 'fs.' + name,
          args: args,
          cbIdx: args.length > 0 ? args.length - 1 : -1,
          target: self,
        };
      });
    });

    const realpathOriginalDelegate = fs.realpath?.[api.symbol('OriginalDelegate')];
    // This is the only specific method that should be additionally patched because the previous
    // `patchMacroTask` has overridden the `realpath` function and its `native` property.
    if (realpathOriginalDelegate?.native) {
      fs.realpath.native = realpathOriginalDelegate.native;
      patchMacroTask(fs.realpath, 'native', (self, args) => ({
        args,
        target: self,
        cbIdx: args.length > 0 ? args.length - 1 : -1,
        name: 'fs.realpath.native',
      }));
    }
  });
}
