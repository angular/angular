/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

export function patchSocketIo(Zone: ZoneType): void {
  Zone.__load_patch('socketio', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    (Zone as any)[Zone.__symbol__('socketio')] = function patchSocketIO(io: any) {
      // patch io.Socket.prototype event listener related method
      api.patchEventTarget(global, api, [io.Socket.prototype], {
        useG: false,
        chkDup: false,
        rt: true,
        diff: (task: any, delegate: any) => {
          return task.callback === delegate;
        },
      });
      // also patch io.Socket.prototype.on/off/removeListener/removeAllListeners
      io.Socket.prototype.on = io.Socket.prototype.addEventListener;
      io.Socket.prototype.off =
        io.Socket.prototype.removeListener =
        io.Socket.prototype.removeAllListeners =
          io.Socket.prototype.removeEventListener;
    };
  });
}
