/// <reference path="../../../../angular2/typings/node/node.d.ts" />

var {Cc, Ci, Cu} = require("chrome");
var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

class Profiler {
  private _profiler;
  private _markerEvents: List<any>;
  private _profilerStartTime: number;

  constructor() { this._profiler = Cc["@mozilla.org/tools/profiler;1"].getService(Ci.nsIProfiler); }

  start(entries, interval, features, timeStarted) {
    this._profiler.StartProfiler(entries, interval, features, features.length);
    this._profilerStartTime = timeStarted;
    this._markerEvents = [];
  }

  stop() { this._profiler.StopProfiler(); }

  getProfilePerfEvents() {
    var profileData = this._profiler.getProfileData();
    var perfEvents = this._convertPerfProfileToEvents(profileData);
    perfEvents = this._mergeMarkerEvents(perfEvents);
    perfEvents.sort(function(event1, event2) { return event1.ts - event2.ts; });  // Sort by ts
    return perfEvents;
  }

  /**
   * @param {Object} perfProfile The perf profile JSON object.
   * @return {Array<Object>} An array of recognized events that are captured
   *     within the perf profile.
   */
  _convertPerfProfileToEvents(perfProfile: any): List<any> {
    var self = this;
    var inProgressEvents = new Map();  // map from event name to start time
    var finishedEvents = [];           // Array<Event> finished events
    var addFinishedEvent = function(eventName, startTime, endTime) {
      var categorizedEventName = self._categorizeEvent(eventName);
      var args = undefined;
      if (categorizedEventName == 'gc') {
        // TODO: We cannot measure heap size at the moment
        args = {
          usedHeapSize: 0
        };
      }
      if (startTime == endTime) {
        // Finished instantly
        finishedEvents.push({ph: 'X', ts: startTime, name: categorizedEventName, args: args});
      } else {
        // Has duration
        finishedEvents.push({ph: 'B', ts: startTime, name: categorizedEventName, args: args});
        finishedEvents.push({ph: 'E', ts: endTime, name: categorizedEventName, args: args});
      }
    };

    var samples = perfProfile.threads[0].samples;
    // In perf profile, firefox samples all the frames in set time intervals. Here
    // we go through all the samples and construct the start and end time for each
    // event.
    for (var i = 0; i < samples.length; ++i) {
      var sample = samples[i];
      var sampleTime = sample.time;

      // Add all the frames into a set so it's easier/faster to find the set
      // differences
      var sampleFrames = new Set();
      sample.frames.forEach(function(frame) { sampleFrames.add(frame.location); });

      // If an event is in the inProgressEvents map, but not in the current sample,
      // then it must have just finished. We add this event to the finishedEvents
      // array and remove it from the inProgressEvents map.
      var previousSampleTime = (i == 0 ? /* not used */ -1 : samples[i - 1].time);
      inProgressEvents.forEach(function(startTime, eventName) {
        if (!(sampleFrames.has(eventName))) {
          addFinishedEvent(eventName, startTime, previousSampleTime);
          inProgressEvents.delete(eventName);
        }
      });

      // If an event is in the current sample, but not in the inProgressEvents map,
      // then it must have just started. We add this event to the inProgressEvents
      // map.
      sampleFrames.forEach(function(eventName) {
        if (!(inProgressEvents.has(eventName))) {
          inProgressEvents.set(eventName, sampleTime);
        }
      });
    }

    // If anything is still in progress, we need to included it as a finished event
    // since recording ended.
    var lastSampleTime = samples[samples.length - 1].time;
    inProgressEvents.forEach(function(startTime, eventName) {
      addFinishedEvent(eventName, startTime, lastSampleTime);
    });

    // Remove all the unknown categories.
    return finishedEvents.filter(function(event) { return event.name != 'unknown'; });
  }

  _mergeMarkerEvents(perfEvents: List<any>): List<any> {
    this._markerEvents.forEach(function(markerEvent) { perfEvents.push(markerEvent); });
    return perfEvents;
  }

  // TODO: this is most likely not exhaustive.
  _categorizeEvent(eventName: string): string {
    if (eventName.indexOf('PresShell::Paint') > -1) {
      return 'render';
    } else if (eventName.indexOf('FirefoxDriver.prototype.executeScript') > -1) {
      return 'script';
    } else if (eventName.indexOf('forceGC') > -1) {
      return 'gc';
    } else {
      return 'unknown';
    }
  }

  addStartEvent(name: string, timeStarted: number) {
    this._markerEvents.push({ph: 'b', ts: timeStarted - this._profilerStartTime, name: name});
  }

  addEndEvent(name: string, timeEnded: number) {
    this._markerEvents.push({ph: 'e', ts: timeEnded - this._profilerStartTime, name: name});
  }
}

function saveToFile(savePath: string, body: string) {
  var file = require('sdk/io/file');
  var textWriter = file.open(savePath, 'w');
  textWriter.write(body);
  textWriter.close();
};

function forceGC() {
  Cu.forceGC();
  os.notifyObservers(null, "child-gc-request", null);
};

var mod = require("sdk/page-mod");
var data = require("sdk/self").data;
var profiler = new Profiler();
mod.PageMod({
  include: ['*'],
  contentScriptFile: data.url("installed_script.js"),
  onAttach: worker => {
    worker.port.on('startProfiler',
                   (timeStarted) => profiler.start(/* = profiler memory */ 1000000, 1,
                                                   ['leaf', 'js', "stackwalk", 'gc'], timeStarted));
    worker.port.on('stopProfiler', () => profiler.stop());
    worker.port.on('getProfile',
                   () => worker.port.emit('perfProfile', profiler.getProfilePerfEvents()));
    worker.port.on('forceGC', forceGC);
    worker.port.on('markStart', (name, timeStarted) => profiler.addStartEvent(name, timeStarted));
    worker.port.on('markEnd', (name, timeEnded) => profiler.addEndEvent(name, timeEnded));
  }
});
