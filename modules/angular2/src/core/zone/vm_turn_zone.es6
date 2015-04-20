import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {normalizeBlank, isPresent, global} from 'angular2/src/facade/lang';

/**
 * A wrapper around zones that lets you schedule tasks after it has executed a task.
 *
 * The wrapper maintains an "inner" and "outer" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `VmTurnZone` whose outer `Zone` is the root `Zone`
 * and whose default `onTurnDone` runs the Angular digest.
 *
 * @exportedAs angular2/core
 */
export class VmTurnZone {
  _outerZone;
  _innerZone;

  _onTurnStart:Function;
  _onTurnDone:Function;
  _onErrorHandler:Function;

  _nestedRunCounter:number;

  /**
   * Associates with this
   *
   * - an "outer" zone, which is the one that created this.
   * - an "inner" zone, which is a child of the outer zone.
   *
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  constructor({enableLongStackTrace}) {
    this._nestedRunCounter = 0;
    this._onTurnStart = null;
    this._onTurnDone = null;
    this._onErrorHandler = null;

    this._outerZone = global.zone;
    this._innerZone = this._createInnerZone(this._outerZone, enableLongStackTrace);
  }

  /**
   * Initializes the zone hooks.
   *
   * @param {Function} onTurnStart called before code executes in the inner zone for each VM turn
   * @param {Function} onTurnDone called at the end of a VM turn if code has executed in the inner zone
   * @param {Function} onScheduleMicrotask
   * @param {Function} onErrorHandler called when an exception is thrown by a macro or micro task
   */
  initCallbacks({onTurnStart, onTurnDone, onScheduleMicrotask, onErrorHandler} = {}) {
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
   * var zone: VmTurnZone = <ref to the application zone>;
   *
   * zone.run(() => {
   *   // auto-digest will run after this function is called from JS
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
   * var zone: VmTurnZone = <ref to the application zone>;
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

    return zone.fork(errorHandling).fork({
      beforeTask: () => {this._beforeTask()},
      afterTask: () => {this._afterTask()}
    });
  }

  _beforeTask(){
    this._nestedRunCounter ++;
    if(this._nestedRunCounter === 1 && this._onTurnStart) {
      this._onTurnStart();
    }
  }

  _afterTask(){
    this._nestedRunCounter --;
    if(this._nestedRunCounter === 0 && this._onTurnDone) {
      this._onTurnDone();
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
