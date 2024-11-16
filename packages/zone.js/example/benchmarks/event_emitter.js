/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const events = require('events');
const EventEmitter = events.EventEmitter;
require('../../dist/zone-node');

const emitters = [];
const callbacks = [];
const size = 100000;
for (let i = 0; i < size; i++) {
  const emitter = new EventEmitter();
  const callback = (function (i) {
    return function () {
      console.log(i);
    };
  })(i);
  emitters[i] = emitter;
  callbacks[i] = callback;
}

function addRemoveCallback(reuse, useZone) {
  const start = new Date();
  let callback = callbacks[0];
  for (let i = 0; i < size; i++) {
    const emitter = emitters[i];
    if (!reuse) callback = callbacks[i];
    if (useZone) emitter.on('msg', callback);
    else emitter.__zone_symbol__addListener('msg', callback);
  }

  for (let i = 0; i < size; i++) {
    const emitter = emitters[i];
    if (!reuse) callback = callbacks[i];
    if (useZone) emitter.removeListener('msg', callback);
    else emitter.__zone_symbol__removeListener('msg', callback);
  }
  const end = new Date();
  console.log(useZone ? 'use zone' : 'native', reuse ? 'reuse' : 'new');
  console.log('Execution time: %dms', end - start);
}

addRemoveCallback(false, false);
addRemoveCallback(false, true);
addRemoveCallback(true, false);
addRemoveCallback(true, true);
