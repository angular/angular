var chokidar = require('chokidar');
var runSequence = require('run-sequence');
var path = require('path');

function watch(globs, opts, tasks) {
  if (typeof opts !== 'object' || Array.isArray(opts)) {
    tasks = opts;
    opts = {};
  }

  var triggerCount = 0;
  var useRunSequence = typeof tasks !== 'function';
  var runTasks;

  function noop() {}
  var log = typeof opts.log === 'function' ? opts.log : noop;

  if (useRunSequence) {
    if (!Array.isArray(tasks)) tasks = [tasks];
    tasks = tasks.slice();
    tasks.push(tasksDone);
    runTasks = function runTaskSequence() {
      runSequence.apply(null, tasks);
    }
  } else {
    var sync = tasks.length === 0;
    runTasks = function runCallback() {
      try {
        tasks(tasksDone);
        if (sync) tasksDone();
      } catch (e) {
        return tasksDone(e);
      }
    }
  }

  var events = opts.events = opts.events || ['add', 'change', 'unlink'];
  if (opts.ignoreInitial === undefined) opts.ignoreInitial = true;
  var delay = opts.delay;
  if (delay === undefined) delay = 100;

  var watcher = chokidar.watch(globs, opts).
      on('all', handleEvent).
      on('error', function(err) {
        throw err;
      });

  var close = watcher.close.bind(watcher);
  watcher.close = function() {
    if (timeoutId !== null) clearTimeout(timeoutId);
    close();
  }

  var eventsRecorded = 0; // Number of events recorded
  var timeoutId = null; // If non-null, event capture window is open

  return watcher;

  function handleEvent(event, filepath) {
    // Ignore unwatched events
    if (events.indexOf(event) < 0) return;

    // Increment number of events captured in this window
    ++eventsRecorded;

    if (timeoutId === null) {
      timeoutId = setTimeout(invokeCallback, delay);
    }
  }

  function invokeCallback() {
    eventsRecorded = 0;
    log(++triggerCount);
    runTasks();
  }

  function tasksDone(err) {
    if (err) throw err;
    if (eventsRecorded) {
      // eventsRecorded has increased during the run, run again on the next turn
      timeoutId = setTimeout(invokeCallback, 0);
    } else {
      timeoutId = null;
    }
  }
}

module.exports = watch;
