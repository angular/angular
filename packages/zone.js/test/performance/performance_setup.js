/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function(_global) {
var allTasks = _global['__zone_symbol__performance_tasks'];
if (!allTasks) {
  allTasks = _global['__zone_symbol__performance_tasks'] = [];
}

var mark = _global['__zone_symbol__mark'] = function(name) {
  performance && performance['mark'] && performance['mark'](name);
};

var measure = _global['__zone_symbol__measure'] = function(name, label) {
  performance && performance['measure'] && performance['measure'](name, label);
};

var getEntries = _global['__zone_symbol__getEntries'] = function() {
  performance && performance['getEntries'] && performance['getEntries']();
};

var getEntriesByName = _global['__zone_symbol__getEntriesByName'] = function(name) {
  return performance && performance['getEntriesByName'] && performance['getEntriesByName'](name);
};

var clearMarks = _global['__zone_symbol__clearMarks'] = function(name) {
  return performance && performance['clearMarks'] && performance['clearMarks'](name);
};

var clearMeasures = _global['__zone_symbol__clearMeasures'] = function(name) {
  return performance && performance['clearMeasures'] && performance['clearMeasures'](name);
};

var averageMeasures = _global['__zone_symbol__averageMeasures'] = function(name, times) {
  var sum = _global['__zone_symbol__getEntriesByName'](name)
                .filter(function(m) {
                  return m.entryType === 'measure';
                })
                .map(function(m) {
                  return m.duration
                })
                .reduce(function(sum, d) {
                  return sum + d;
                });
  return sum / times;
};

var serialPromise = _global['__zone_symbol__serialPromise'] =
    function(promiseFactories) {
  let lastPromise;
  for (var i = 0; i < promiseFactories.length; i++) {
    var promiseFactory = promiseFactories[i];
    if (!lastPromise) {
      lastPromise = promiseFactory.factory(promiseFactory.context).then(function(value) {
        return {value, idx: 0};
      });
    } else {
      lastPromise = lastPromise.then(function(ctx) {
        var idx = ctx.idx + 1;
        var promiseFactory = promiseFactories[idx];
        return promiseFactory.factory(promiseFactory.context).then(function(value) {
          return {value, idx};
        });
      });
    }
  }
  return lastPromise;
}

var callbackContext = _global['__zone_symbol__callbackContext'] = {};
var zone = _global['__zone_symbol__callbackZone'] = Zone.current.fork({
  name: 'callback',
  onScheduleTask: function(delegate, curr, target, task) {
    delegate.scheduleTask(target, task);
    if (task.type === callbackContext.type && task.source.indexOf(callbackContext.source) !== -1) {
      if (task.type === 'macroTask' || task.type === 'eventTask') {
        var invoke = task.invoke;
        task.invoke = function() {
          mark(callbackContext.measureName);
          var result = invoke.apply(this, arguments);
          measure(callbackContext.measureName, callbackContext.measureName);
          return result;
        };
      } else if (task.type === 'microTask') {
        var callback = task.callback;
        task.callback = function() {
          mark(callbackContext.measureName);
          var result = callback.apply(this, arguments);
          measure(callbackContext.measureName, callbackContext.measureName);
          return result;
        };
      }
    }
    return task;
  }
});

var runAsync = _global['__zone_symbol__runAsync'] = function(testFn, times, _delay) {
  var delay = _delay | 100;
  const fnPromise = function() {
    return new Promise(function(res, rej) {
      // run test with a setTimeout
      // several times to decrease measurement error
      setTimeout(function() {
        testFn().then(function() {
          res();
        });
      }, delay);
    });
  };
  var promiseFactories = [];
  for (var i = 0; i < times; i++) {
    promiseFactories.push({factory: fnPromise, context: {}});
  }

  return serialPromise(promiseFactories);
};

var getNativeMethodName = function(nativeWithSymbol) {
  return nativeWithSymbol.replace('__zone_symbol__', 'native_');
};

function testAddRemove(api, count) {
  var timerId = [];

  var name = api.method;
  mark(name);
  for (var i = 0; i < count; i++) {
    timerId.push(api.run());
  }
  measure(name, name);

  if (api.supportClear) {
    var clearName = api.clearMethod;
    mark(clearName);
    for (var i = 0; i < count; i++) {
      api.runClear(timerId[i]);
    }
    measure(clearName, clearName);
  }

  timerId = [];

  var nativeName = getNativeMethodName(api.nativeMethod);
  mark(nativeName);
  for (var i = 0; i < count; i++) {
    timerId.push(api.nativeRun());
  }
  measure(nativeName, nativeName);

  if (api.supportClear) {
    var nativeClearName = getNativeMethodName(api.nativeClearMethod);
    mark(nativeClearName);
    for (var i = 0; i < count; i++) {
      api.nativeRunClear(timerId[i]);
    }
    measure(nativeClearName, nativeClearName);
  }

  return Promise.resolve(1);
}

function testCallback(api, count) {
  var promises = [Promise.resolve(1)];
  for (var i = 0; i < count; i++) {
    var r = api.run();
    if (api.isAsync) {
      promises.push(r);
    }
  }

  for (var i = 0; i < count; i++) {
    var r = api.nativeRun();
    if (api.isAsync) {
      promises.push(r);
    }
  }
  return Promise.all(promises);
}

function measureCallback(api, ops) {
  var times = ops.times;
  var displayText = ops.displayText;
  var rawData = ops.rawData;
  var summary = ops.summary;

  var name = api.method;
  var nativeName = getNativeMethodName(api.nativeMethod);
  var measure = averageMeasures(name, times);
  var nativeMeasure = averageMeasures(nativeName, times);
  displayText += `- ${name} costs ${measure} ms\n`;
  displayText += `- ${nativeName} costs ${nativeMeasure} ms\n`;
  var absolute = Math.floor(1000 * (measure - nativeMeasure)) / 1000;
  displayText += `# ${name} is ${absolute}ms slower than ${nativeName}\n`;
  rawData[name + '_measure'] = measure;
  rawData[nativeName + '_measure'] = nativeMeasure;
  summary[name] = absolute + 'ms';
}

function measureAddRemove(api, ops) {
  var times = ops.times;
  var displayText = ops.displayText;
  var rawData = ops.rawData;
  var summary = ops.summary;

  var name = api.method;
  var nativeName = getNativeMethodName(api.nativeMethod);

  var measure = averageMeasures(name, times);
  var nativeMeasure = averageMeasures(nativeName, times);
  displayText += `- ${name} costs ${measure} ms\n`;
  displayText += `- ${nativeName} costs ${nativeMeasure} ms\n`;
  var percent = Math.floor(100 * (measure - nativeMeasure) / nativeMeasure);
  displayText += `# ${name} is ${percent}% slower than ${nativeName}\n`;
  rawData[name + '_measure'] = measure;
  rawData[nativeName + '_measure'] = nativeMeasure;
  summary[name] = percent + '%';
  if (api.supportClear) {
    var clearName = api.clearMethod;
    var nativeClearName = getNativeMethodName(api.nativeClearMethod);
    var clearMeasure = averageMeasures(clearName, times);
    var nativeClearMeasure = averageMeasures(nativeClearName, times);
    var clearPercent = Math.floor(100 * (clearMeasure - nativeClearMeasure) / nativeClearMeasure);
    displayText += `- ${clearName} costs ${clearMeasure} ms\n`;
    displayText += `- ${nativeClearName} costs ${nativeClearMeasure} ms\n`;
    displayText += `# ${clearName} is ${clearPercent}% slower than ${nativeClearName}\n`;
    rawData[clearName + '_measure'] = clearMeasure;
    rawData[nativeClearName + '_measure'] = nativeClearMeasure;
    summary[clearName] = clearPercent + '%';
  }
}

var testRunner = _global['__zone_symbol__testRunner'] = function(testTarget) {
  var title = testTarget.title;
  var apis = testTarget.apis;
  var methods = apis.reduce(function(acc, api) {
    return acc.concat([api.method, api.nativeMethod]
                          .concat(api.supportClear ? [api.clearMethod, api.nativeClearMethod] : [])
                          .concat[api.method + '_callback', api.nativeMethod + '_callback']);
  }, []);
  var times = testTarget.times;

  allTasks.push({
    title: title,
    cleanFn: function() {
      methods.forEach(function(m) {
        clearMarks(m);
        clearMeasures(m);
      });
    },
    before: function() {
      testTarget.before && testTarget.before();
    },
    after: function() {
      testTarget.after && testTarget.after();
    },
    testFn: function() {
      var count = typeof testTarget.count === 'number' ? testTarget.count : 10000;
      var times = typeof testTarget.times === 'number' ? testTarget.times : 5;

      var testFunction = function() {
        var promises = [];
        apis.forEach(function(api) {
          if (api.isCallback) {
            var r = testCallback(api, count / 100);
            promises.push(api.isAsync ? r : Promise.resolve(1));
          } else {
            var r = testAddRemove(api, count);
            promises.push[api.isAsync ? r : Promise.resolve(1)];
          }
        });
        return Promise.all(promises);
      };

      return runAsync(testFunction, times).then(function() {
        var displayText = `running ${count} times\n`;
        var rawData = {};
        var summary = {};
        apis.forEach(function(api) {
          if (api.isCallback) {
            measureCallback(api, {times, displayText, rawData, summary});
          } else {
            measureAddRemove(api, {times, displayText, rawData, summary});
          }
        });
        return Promise.resolve({displayText: displayText, rawData: rawData, summary: summary});
      });
    }
  });
};
}(typeof window === 'undefined' ? global : window));
