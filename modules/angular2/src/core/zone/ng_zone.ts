import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {normalizeBlank, isPresent, global} from 'angular2/src/facade/lang';

export interface NgZoneZone extends Zone { _innerZone: boolean; }

/**
 * A wrapper around zones that lets you schedule tasks after it has executed a task.
 *
 * The wrapper maintains an "inner" and an "mount" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `NgZone`. The outer `Zone` is a fork of the root
 * `Zone`. The default `onTurnDone` runs the Angular change detection.
 *
 * @exportedAs angular2/core
 */
export class NgZone {
  // Code executed in _mountZone does not trigger the onTurnDone.
  _mountZone;
  // _innerZone is the child of _mountZone. Any code executed in this zone will trigger the
  // onTurnDone hook at the end of the current VM turn.
  _innerZone;

  _onTurnStart: () => void;
  _onTurnDone: () => void;
  _onErrorHandler: (error, stack) => void;

  // Number of microtasks pending from _innerZone (& descendants)
  _pendingMicrotasks: number;
  // Whether some code has been executed in the _innerZone (& descendants) in the current turn
  _hasExecutedCodeInInnerZone: boolean;
  // run() call depth in _mountZone. 0 at the end of a macrotask
  // zone.run(() => {         // top-level call
  //   zone.run(() => {});    // nested call -> in-turn
  // });
  _nestedRun: number;

  // TODO(vicb): implement this class properly for node.js environment
  // This disabled flag is only here to please cjs tests
  _disabled: boolean;

  _inVmTurnDone: boolean = false;

  /**
   * Associates with this
   *
   * - a "root" zone, which the one that instantiated this.
   * - an "inner" zone, which is a child of the root zone.
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

    if (global.zone) {
      this._disabled = false;
      this._mountZone = global.zone;
      this._innerZone = this._createInnerZone(this._mountZone, enableLongStackTrace)
    } else {
      this._disabled = true;
      this._mountZone = null;
    }
  }

  /**
   * Initializes the zone hooks.
   *
   * @param {() => void} onTurnStart called before code executes in the inner zone for each VM turn
   * @param {() => void} onTurnDone called at the end of a VM turn if code has executed in the inner
   * zone
   * @param {(error, stack) => void} onErrorHandler called when an exception is thrown by a macro or
   * micro task
   */
  initCallbacks({onTurnStart, onTurnDone, onErrorHandler}: {
    onTurnStart?: /*() => void*/ Function,
    onTurnDone?: /*() => void*/ Function,
    onErrorHandler?: /*(error, stack) => void*/ Function
  } = {}) {
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
   * var zone: NgZone = [ref to the application zone];
   *
   * zone.run(() => {
   *   // the change detection will run after this function and the microtasks it enqueues have
   * executed.
   * });
   * ```
   */
  run(fn) {
    if (this._disabled) {
      return fn();
    } else {
      return this._innerZone.run(fn);
    }
  }

  /**
   * Runs `fn` in the outer zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
   * auto-digest mechanism.
   *
   * ```
   * var zone: NgZone = [ref to the application zone];
   *
   * zone.runOusideAngular(() => {
   *   element.onClick(() => {
   *     // Clicking on the element would not trigger the change detection
   *   });
   * });
   * ```
   */
  runOutsideAngular(fn) {
    if (this._disabled) {
      return fn();
    } else {
      return this._mountZone.run(fn);
    }
  }

  _createInnerZone(zone, enableLongStackTrace) {
    var ngZone = this;
    var errorHandling;

    if (enableLongStackTrace) {
      errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone,
                                             {onError: function(e) { ngZone._onError(this, e) }});
    } else {
      errorHandling = {onError: function(e) { ngZone._onError(this, e) }};
    }

    return zone.fork(errorHandling)
        .fork({
          '$run': function(parentRun) {
            return function() {
              try {
                ngZone._nestedRun++;
                if (!ngZone._hasExecutedCodeInInnerZone) {
                  ngZone._hasExecutedCodeInInnerZone = true;
                  if (ngZone._onTurnStart) {
                    parentRun.call(ngZone._innerZone, ngZone._onTurnStart);
                  }
                }
                return parentRun.apply(this, arguments);
              } finally {
                ngZone._nestedRun--;
                // If there are no more pending microtasks, we are at the end of a VM turn (or in
                // onTurnStart)
                // _nestedRun will be 0 at the end of a macrotasks (it could be > 0 when there are
                // nested calls
                // to run()).
                if (ngZone._pendingMicrotasks == 0 && ngZone._nestedRun == 0 &&
                    !this._inVmTurnDone) {
                  if (ngZone._onTurnDone && ngZone._hasExecutedCodeInInnerZone) {
                    try {
                      this._inVmTurnDone = true;
                      parentRun.call(ngZone._innerZone, ngZone._onTurnDone);
                    } finally {
                      this._inVmTurnDone = false;
                      ngZone._hasExecutedCodeInInnerZone = false;
                    }
                  }
                }
              }
            }
          },
          '$scheduleMicrotask': function(parentScheduleMicrotask) {
            return function(fn) {
              ngZone._pendingMicrotasks++;
              var microtask = function() {
                try {
                  fn();
                } finally {
                  ngZone._pendingMicrotasks--;
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
