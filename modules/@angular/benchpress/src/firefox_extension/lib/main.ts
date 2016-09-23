/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var {Cc, Ci, Cu} = require('chrome');
var os = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
var ParserUtil = require('./parser_util');

class Profiler {
  private _profiler: any;
  private _markerEvents: any[];
  private _profilerStartTime: number;

  constructor() { this._profiler = Cc['@mozilla.org/tools/profiler;1'].getService(Ci.nsIProfiler); }

  start(entries: any, interval: any, features: any, timeStarted: any) {
    this._profiler.StartProfiler(entries, interval, features, features.length);
    this._profilerStartTime = timeStarted;
    this._markerEvents = [];
  }

  stop() { this._profiler.StopProfiler(); }

  getProfilePerfEvents() {
    var profileData = this._profiler.getProfileData();
    var perfEvents = ParserUtil.convertPerfProfileToEvents(profileData);
    perfEvents = this._mergeMarkerEvents(perfEvents);
    perfEvents.sort(function(event1: any, event2: any) {
      return event1.ts - event2.ts;
    });  // Sort by ts
    return perfEvents;
  }

  /** @internal */
  private _mergeMarkerEvents(perfEvents: any[]): any[] {
    this._markerEvents.forEach(function(markerEvent) { perfEvents.push(markerEvent); });
    return perfEvents;
  }

  addStartEvent(name: string, timeStarted: number) {
    this._markerEvents.push({ph: 'B', ts: timeStarted - this._profilerStartTime, name: name});
  }

  addEndEvent(name: string, timeEnded: number) {
    this._markerEvents.push({ph: 'E', ts: timeEnded - this._profilerStartTime, name: name});
  }
}

function forceGC() {
  Cu.forceGC();
  os.notifyObservers(null, 'child-gc-request', null);
};

var mod = require('sdk/page-mod');
var data = require('sdk/self').data;
var profiler = new Profiler();
mod.PageMod({
  include: ['*'],
  contentScriptFile: data.url('installed_script.js'),
  onAttach: (worker: any) => {
    worker.port.on(
        'startProfiler',
        (timeStarted: any) => profiler.start(
            /* = profiler memory */ 3000000, 0.1, ['leaf', 'js', 'stackwalk', 'gc'], timeStarted));
    worker.port.on('stopProfiler', () => profiler.stop());
    worker.port.on(
        'getProfile', () => worker.port.emit('perfProfile', profiler.getProfilePerfEvents()));
    worker.port.on('forceGC', forceGC);
    worker.port.on(
        'markStart', (name: string, timeStarted: any) => profiler.addStartEvent(name, timeStarted));
    worker.port.on(
        'markEnd', (name: string, timeEnded: any) => profiler.addEndEvent(name, timeEnded));
  }
});
