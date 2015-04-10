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
  _outerZone;
  _innerZone;

  _onTurnStart:Function;
  _onTurnDone:Function;
  _onErrorHandler:Function;

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
    Zone._hasExecutedInnerCode = false;

    this._outerZone = global.zone.fork({
      _name: 'outer',
      beforeTurn: () => { this._beforeTurn(); },
      afterTurn: () => { this._afterTurn(); }
    });
    this._innerZone = this._createInnerZone(this._outerZone, enableLongStackTrace);

    // TODO('remove');
    Zone.debug = true;
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
          '$run': function (parentRun) {
            return function () {
              if (!Zone._hasExecutedInnerCode) {
                // Execute the beforeTurn hook when code is first executed in the inner zone in the turn
                Zone._hasExecutedInnerCode = true;
                var oldZone = global.zone;
                global.zone = this;
                this.beforeTurn();
                global.zone = oldZone;
              }

              return parentRun.apply(this, arguments);
            }
          },
          _name: 'inner'
        });
  }

  _beforeTurn() {
    this._onTurnStart && this._onTurnStart();
  }

  _afterTurn() {
    if (this._onTurnDone) {
      if (Zone._hasExecutedInnerCode) {
        // Execute the onTurnDone hook in the inner zone so that microtasks are enqueued there
        // The hook gets executed when code has runned in the inner zone during the current turn
        this._innerZone.run(this._onTurnDone, this);
        Zone._hasExecutedInnerCode = false;
      }
    }
  }

  _onError(zone, e) {
    if (isPresent(this._onErrorHandler)) {
      var trace = [normalizeBlank(e.stack)];

      while (zone && zone.constructedAtException) {
        trace.push(zone.constructedAtException.get());
        zone = zone.parent;
      }
      this._onErrorHandler(e, trace);
    } else {
      throw e;
    }
  }
}
