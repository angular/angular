import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {normalizeBlank, isPresent, global} from 'angular2/src/facade/lang';

/**
 * A wrapper around zones that lets you schedule tasks after it has executed a task.
 *
 * The wrapper maintains an "inner" and "outer" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `VmTurnZone`. The outer `Zone` is a fork of the root
 * `Zone`. The default `onTurnDone` runs the Angular change detection.
 *
 * @exportedAs angular2/core
 */
export class VmTurnZone {
  // Code executed in _outerZone does not trigger the onTurnDone.
  _outerZone;
  // _innerZone is the child of _outerZone. Any code executed in this zone will trigger the
  // onTurnDone hook at the end of the current VM turn.
  _innerZone;

  _onTurnStart:Function;
  _onTurnDone:Function;
  _onErrorHandler:Function;

  // Number of microtasks pending from _outerZone (& descendants)
  _pendingMicrotask: number;
  // Whether some code has been executed in the _innerZone (& descendants) in the current turn
  _hasExecutedCodeInInnerZone: boolean;
  // run() call depth in _outerZone. 0 at the end of a macrotask
  // zone.run(() => {         // top-level call
  //   zone.run(() => {});    // nested call -> in-turn
  // });
  _nestedRun: number;

  /**
   * Associates with this
   *
   * - an "outer" zone, which is a child of the one that created this.
   * - an "inner" zone, which is a child of the outer zone.
   *
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  constructor({enableLongStackTrace}) {
    this._onTurnStart = null;
    this._onTurnDone = null;
    this._onErrorHandler = null;

    this._pendingMicrotasks = 0;
    this._hasExecutedCodeInInnerZone = false;
    this._nestedRun = 0;

    this._outerZone = global.zone;
    this._innerZone = this._createInnerZone(this._outerZone, enableLongStackTrace)
  }

  /**
   * Initializes the zone hooks.
   *
   * @param {Function} onTurnStart called before code executes in the inner zone for each VM turn
   * @param {Function} onTurnDone called at the end of a VM turn if code has executed in the inner zone
   * @param {Function} onErrorHandler called when an exception is thrown by a macro or micro task
   */
  initCallbacks({onTurnStart, onTurnDone, onErrorHandler} = {}) {
    this._onTurnStart = normalizeBlank(onTurnStart);
    this._onTurnDone = normalizeBlank(onTurnDone);
    this._onErrorHandler = normalizeBlank(onErrorHandler);
  }

  /**
   * Runs `fn` in the inner zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to make use of the
   * Angular's auto digest mechanism.
   *
   * ```
   * var zone: VmTurnZone = [ref to the application zone];
   *
   * zone.run(() => {
   *   // the change detection will run after this function and the microtasks it enqueues have executed.
   * });
   * ```
   */
  run(fn) {
    return this._innerZone.run(fn);
  }

  /**
   * Runs `fn` in the outer zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
   * auto-digest mechanism.
   *
   * ```
   * var zone: VmTurnZone = [ref to the application zone];
   *
   * zone.runOusideAngular(() => {
   *   element.onClick(() => {
   *     // Clicking on the element would not trigger the change detection
   *   });
   * });
   * ```
   */
  runOutsideAngular(fn) {
    return this._outerZone.run(fn);
  }

  _createInnerZone(zone, enableLongStackTrace) {
    var vmTurnZone = this;
    var errorHandling;

    if (enableLongStackTrace) {
      errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, {
        onError: function (e) {
          vmTurnZone._onError(this, e)
        }
      });
    } else {
      errorHandling = {
        onError: function (e) {
          vmTurnZone._onError(this, e)
        }
      };
    }

    return zone
        .fork(errorHandling)
        .fork({
          '$run': function(parentRun) {
            return function() {
              try {
                vmTurnZone._nestedRun++;
                if (!vmTurnZone._hasExecutedCodeInInnerZone) {
                  vmTurnZone._hasExecutedCodeInInnerZone = true;
                  if (vmTurnZone._onTurnStart) {
                    parentRun.call(vmTurnZone._innerZone, vmTurnZone._onTurnStart);
                  }
                }
                return parentRun.apply(this, arguments);
              } finally {
                vmTurnZone._nestedRun--;
                // If there are no more pending microtasks, we are at the end of a VM turn (or in onTurnStart)
                // _nestedRun will be 0 at the end of a macrotasks (it could be > 0 when there are nested calls
                // to run()).
                if (vmTurnZone._pendingMicrotasks == 0 && vmTurnZone._nestedRun == 0) {
                  if (vmTurnZone._onTurnDone && vmTurnZone._hasExecutedCodeInInnerZone) {
                    try {
                      parentRun.call(vmTurnZone._innerZone, vmTurnZone._onTurnDone);
                    } finally {
                      vmTurnZone._hasExecutedCodeInInnerZone = false;
                    }
                  }
                }
              }
            }
          },
          '$scheduleMicrotask': function(parentScheduleMicrotask) {
            return function(fn) {
              vmTurnZone._pendingMicrotasks++;
              var microtask = function() {
                try {
                  fn();
                } finally {
                  vmTurnZone._pendingMicrotasks--;
                }
              };
              parentScheduleMicrotask.call(this, microtask);
            }
          },
          _innerZone: true
        });
  }

  _onError(zone, e): void {
    if (isPresent(this._onErrorHandler)) {
      var trace = [normalizeBlank(e.stack)];

      while (zone && zone.constructedAtException) {
        trace.push(zone.constructedAtException.get());
        zone = zone.parent;
      }
      this._onErrorHandler(e, trace);
    } else {
      console.log('## _onError ##');
      console.log(e.stack);
      throw e;
    }
  }
}
