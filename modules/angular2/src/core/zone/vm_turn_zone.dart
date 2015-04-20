library angular.zone;

import 'dart:async' as async;
import 'package:stack_trace/stack_trace.dart' show Chain;

/**
 * A `Zone` wrapper that lets you schedule tasks after its private microtask queue is exhausted but
 * before the next "VM turn", i.e. event loop iteration.
 *
 * This lets you freely schedule microtasks that prepare data, and set an {@link onTurnDone} handler that
 * will consume that data after it's ready but before the browser has a chance to re-render.
 *
 * A VM turn consist of a single macrotask followed 0 to many microtasks.
 *
 * The wrapper maintains an "inner" and "outer" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `VmTurnZone` whose outer `Zone` is the root `Zone`
 * and whose default `onTurnDone` runs the Angular digest.
 */
class VmTurnZone {
  Function _onTurnStart;
  Function _onTurnDone;
  Function _onScheduleMicrotask;
  Function _onErrorHandler;

  async.Zone _outerZone;
  async.Zone _innerZone;

  int _nestedRunCounter;

  /**
   * Associates with this
   *
   * - an "outer" `Zone`, which is the one that created this.
   * - an "inner" `Zone`, which is a child of the outer `Zone`.
   *
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  VmTurnZone({bool enableLongStackTrace}) {
    _nestedRunCounter = 0;
    _outerZone = async.Zone.current;
    _innerZone = _createInnerZoneWithErrorHandling(enableLongStackTrace);
  }

  /**
   * Initializes the zone hooks.
   *
   * @param {Function} onTurnStart called before code executes in the inner zone for each VM turn
   * @param {Function} onTurnDone called at the end of a VM turn if code has executed in the inner zone
   * @param {Function} onScheduleMicrotask
   * @param {Function} onErrorHandler called when an exception is thrown by a macro or micro task
   */
  initCallbacks({Function onTurnStart, Function onTurnDone, Function onScheduleMicrotask, Function onErrorHandler}) {
    this._onTurnStart = onTurnStart;
    this._onTurnDone = onTurnDone;
    this._onScheduleMicrotask = onScheduleMicrotask;
    this._onErrorHandler = onErrorHandler;
  }

  /**
   * Runs `fn` in the inner zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to make use of the
   * Angular's auto digest mechanism.
   *
   * ```
   * VmTurnZone zone = <ref to the application zone>;
   *
   * void functionCalledFromJS() {
   *   zone.run(() {
   *     // auto-digest will run after this function is called from JS
   *   });
   * }
   * ```
   */
  dynamic run(fn()) => _innerZone.run(fn);

  /**
   * Runs `fn` in the outer zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
   * auto-digest mechanism.
   *
   * ```
   * void myFunction(VmTurnZone zone, Element element) {
   *   element.onClick.listen(() {
   *     // auto-digest will run after element click.
   *   });
   *   zone.runOutsideAngular(() {
   *     element.onMouseMove.listen(() {
   *       // auto-digest will NOT run after mouse move
   *     });
   *   });
   * }
   * ```
   */
  dynamic runOutsideAngular(fn()) => _outerZone.run(fn);

  async.Zone _createInnerZoneWithErrorHandling(bool enableLongStackTrace) {
    if (enableLongStackTrace) {
      return Chain.capture(() {
        return _createInnerZone(async.Zone.current);
      }, onError: this._onErrorWithLongStackTrace);
    } else {
      return async.runZoned(() {
        return _createInnerZone(async.Zone.current);
      }, onError: this._onErrorWithoutLongStackTrace);
    }
  }

  async.Zone _createInnerZone(async.Zone zone) {
    return zone.fork(specification: new async.ZoneSpecification(
        run: _onRun,
        runUnary: _onRunUnary,
        scheduleMicrotask: _onMicrotask
    ));
  }

  dynamic _onRunBase(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn()) {
    _nestedRunCounter++;
    try {
      if (_nestedRunCounter == 1 && _onTurnStart != null) delegate.run(zone, _onTurnStart);
      return fn();
    } catch (e, s) {
      if (_onErrorHandler != null && _nestedRunCounter == 1) {
        _onErrorHandler(e, [s.toString()]);
      } else {
        rethrow;
      }
    } finally {
      _nestedRunCounter--;
      if (_nestedRunCounter == 0 && _onTurnDone != null) _finishTurn(zone, delegate);
    }
  }

  dynamic _onRun(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn()) =>
      _onRunBase(self, delegate, zone, () => delegate.run(zone, fn));

  dynamic _onRunUnary(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn(args), args) =>
      _onRunBase(self, delegate, zone, () => delegate.runUnary(zone, fn, args));

  void _finishTurn(zone, delegate) {
    delegate.run(zone, _onTurnDone);
  }

  _onMicrotask(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn) {
    if (this._onScheduleMicrotask != null) {
      _onScheduleMicrotask(fn);
    } else {
      delegate.scheduleMicrotask(zone, fn);
    }
  }

  _onErrorWithLongStackTrace(exception, Chain chain) {
    final traces = chain.terse.traces.map((t) => t.toString()).toList();
    _onError(exception, traces, chain.traces[0]);
  }
  _onErrorWithoutLongStackTrace(exception, StackTrace trace) {
    _onError(exception, [trace.toString()], trace);
  }

  _onError(exception, List<String> traces, StackTrace singleTrace) {
    if (_onErrorHandler != null) {
      _onErrorHandler(exception, traces);
    } else {
      _outerZone.handleUncaughtError(exception, singleTrace);
    }
  }
}
