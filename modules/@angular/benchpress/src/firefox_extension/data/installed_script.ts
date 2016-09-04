/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare var exportFunction: any;
declare var unsafeWindow: any;

exportFunction(function() {
  var curTime = unsafeWindow.performance.now();
  (<any>self).port.emit('startProfiler', curTime);
}, unsafeWindow, {defineAs: 'startProfiler'});

exportFunction(function() {
  (<any>self).port.emit('stopProfiler');
}, unsafeWindow, {defineAs: 'stopProfiler'});

exportFunction(function(cb: Function) {
  (<any>self).port.once('perfProfile', cb);
  (<any>self).port.emit('getProfile');
}, unsafeWindow, {defineAs: 'getProfile'});

exportFunction(function() {
  (<any>self).port.emit('forceGC');
}, unsafeWindow, {defineAs: 'forceGC'});

exportFunction(function(name: string) {
  var curTime = unsafeWindow.performance.now();
  (<any>self).port.emit('markStart', name, curTime);
}, unsafeWindow, {defineAs: 'markStart'});

exportFunction(function(name: string) {
  var curTime = unsafeWindow.performance.now();
  (<any>self).port.emit('markEnd', name, curTime);
}, unsafeWindow, {defineAs: 'markEnd'});
