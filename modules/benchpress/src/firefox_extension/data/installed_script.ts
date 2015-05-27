declare var exportFunction;
declare var unsafeWindow;

exportFunction(function() { (<any>self).port.emit('startProfiler'); }, unsafeWindow,
               {defineAs: "startProfiler"});

exportFunction(function(filePath) { (<any>self).port.emit('stopAndRecord', filePath); },
               unsafeWindow, {defineAs: "stopAndRecord"});

exportFunction(function() { (<any>self).port.emit('forceGC'); }, unsafeWindow,
               {defineAs: "forceGC"});
