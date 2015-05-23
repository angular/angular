exportFunction(function() {
  self.port.emit('startProfiler');
}, unsafeWindow, {defineAs: "startProfiler"});

exportFunction(function(filePath) {
  self.port.emit('stopAndRecord', filePath);
}, unsafeWindow, {defineAs: "stopAndRecord"});

exportFunction(function() {
  self.port.emit('forceGC');
}, unsafeWindow, {defineAs: "forceGC"});

