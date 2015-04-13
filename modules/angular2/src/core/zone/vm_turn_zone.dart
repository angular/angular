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
  Function _onErrorHandler;

  async.Zone _outerZone;
  async.Zone _innerZone;

  // onRun depth
  int _runningInTurn = 0;

  // Number of pending microtasks
  int pendingMicrotasks = 0;

  // True when microtasks are scheduled in onTurnDone and an artifical turn needs to be created
  bool _startFakeTurn = false;

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
  initCallbacks({Function onTurnStart, Function onTurnDone, Function onErrorHandler}) {
    _onTurnStart = onTurnStart;
    _onTurnDone = onTurnDone;
    _onErrorHandler = onErrorHandler;
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
      }, onError: _onErrorWithLongStackTrace);
    } else {
      return async.runZoned(() {
        return _createInnerZone(async.Zone.current);
      }, onError: _onErrorWithoutLongStackTrace);
    }
  }

  async.Zone _createInnerZone(async.Zone zone) {
    return zone.fork(specification: new async.ZoneSpecification(
        run: _onRun,
        runUnary: _onRunUnary,
        scheduleMicrotask: _onMicrotask
    ));
  }

  dynamic _onRunBase(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn()) {
    try {
      _runningInTurn++;
      // _onRunBase could be called recursively to execute a single macrotask but we only call
      // _onTurnStart on the first call.
      if ((_runningInTurn == 1 && pendingMicrotasks == 0 || _startFakeTurn) &&
          _onTurnStart != null) {
        _startFakeTurn = false;
        parent.run(zone, _onTurnStart);
      }
      return parent.run(zone, fn);
    } catch (e, s) {
      // When _runningInTurn > 1, the error handler is called by the zone (via onError)
      if (_onErrorHandler != null && _runningInTurn == 1) {
        _onErrorHandler(e, [s.toString()]);
      } else {
        rethrow;
      }
    } finally {
      _runningInTurn--;
      // _onRunBase could be called recursively to execute a single macrotask but we only call
      // _onTurnDone on the first call.
      if (_runningInTurn == 0 && pendingMicrotasks == 0 && _onTurnDone != null) {
        try {
          parent.run(zone, _onTurnDone);
        } catch (e, s) {
          if (_onErrorHandler != null) {
            _onErrorHandler(e, [s.toString()]);
          } else {
            rethrow;
          }
        }

        // _onTurnDone might schedule more microtasks.
        // In such a case, they will be executed as part of the current VM Turn. However _onTurnDone
        // will be called after the microtasks are executed. We need to call _onTurnStart for
        // symetry (Note that in such a case _onTurnStart..._onTurnEnd is actually executed in the
        // current turn)
        if (pendingMicrotasks > 0) {
          _startFakeTurn = true;
        }
      }
    }
  }

  dynamic _onRun(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn()) =>
      _onRunBase(self, parent, zone, () => parent.run(zone, fn));

  dynamic _onRunUnary(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn(args), args) =>
      _onRunBase(self, parent, zone, () => parent.runUnary(zone, fn, args));

  /**
   * Called when a microtask is scheduled in the inner zone
   */
  _onMicrotask(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn) {
    pendingMicrotasks++;
    var microtask = () {
      try {
        fn();
      } finally {
        pendingMicrotasks--;
      }
    };
    parent.scheduleMicrotask(zone, microtask);
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
