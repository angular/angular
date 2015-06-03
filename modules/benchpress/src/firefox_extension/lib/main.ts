/// <reference path="../../../../angular2/typings/node/node.d.ts" />

var file = require('sdk/io/file');
var {Cc, Ci, Cu} = require("chrome");

class Profiler {
  private _profiler;
  constructor() { this._profiler = Cc["@mozilla.org/tools/profiler;1"].getService(Ci.nsIProfiler); }

  start(entries, interval, features) {
    this._profiler.StartProfiler(entries, interval, features, features.length);
  }

  stop() { this._profiler.StopProfiler(); }
  getProfileData() { return this._profiler.getProfileData(); }
}


function saveToFile(savePath: string, body: string) {
  var textWriter = file.open(savePath, 'w');
  textWriter.write(body);
  textWriter.close();
}

function forceGC() {
  Cu.forceGC();
  var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
  os.notifyObservers(null, "child-gc-request", null);
}

var profiler = new Profiler();
function startProfiler() {
  profiler.start(/* = profiler memory */ 10000000, 1, ['leaf', 'js', "stackwalk", 'gc']);
};
function stopAndRecord(filePath) {
  var profileData = profiler.getProfileData();
  profiler.stop();
  saveToFile(filePath, JSON.stringify(profileData, null, 2));
};


var mod = require("sdk/page-mod");
var data = require("sdk/self").data;
mod.PageMod({
  include: ['*'],
  contentScriptFile: data.url("installed_script.js"),
  onAttach: worker => {
    worker.port.on('startProfiler', () => startProfiler());
    worker.port.on('stopAndRecord', filePath => stopAndRecord(filePath));
    worker.port.on('forceGC', () => forceGC());
  }
});
