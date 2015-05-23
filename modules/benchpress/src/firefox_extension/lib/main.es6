var file = require('sdk/io/file');
var {Cc,Ci,Cu} = require("chrome");

function Profiler() {
  this._profiler = Cc["@mozilla.org/tools/profiler;1"].getService(Ci.nsIProfiler);
};

Profiler.prototype = {
  start: function(entries, interval, features) {
    this._profiler.StartProfiler(entries, interval, features, features.length);
  },
  stop: function(cb) {
    this._profiler.StopProfiler();
    // this.gcStats.clear();
  },
  getProfileData: function() {
    return this._profiler.getProfileData();
  }
};

function saveToFile(savePath, str) {
  var textWriter = file.open(savePath, 'w');
  textWriter.write(str);
  textWriter.close();
}

function forceGC() {
  Cu.forceGC();
  var os = Cc["@mozilla.org/observer-service;1"]
            .getService(Ci.nsIObserverService);
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
  onAttach: function(worker) {
    worker.port.on('startProfiler', function() {
      startProfiler();
    });
    worker.port.on('stopAndRecord', function(filePath) {
      stopAndRecord(filePath);
    });
    worker.port.on('forceGC', function() {
      forceGC();
    });
  }
});
