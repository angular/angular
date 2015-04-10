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

  bool _enableLongStackTrace;

  // Microtask queue
  List<Function> _asyncQueue = [];

  // Whether we are in a VM turn
  bool _currentlyInTurn = false;
  // Whether we are draining the microtask queue (at the end of a turn)
  bool _inFinishTurn = false;
  // onRun depth
  int _runningInTurn = 0;

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
    _enableLongStackTrace = enableLongStackTrace;
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
    _onTurnStart = onTurnStart;
    _onTurnDone = onTurnDone;
    _onScheduleMicrotask = onScheduleMicrotask == null ? _defaultOnScheduleMicrotask : onScheduleMicrotask;
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
    _runningInTurn++;
    try {
      if (!_currentlyInTurn) {
        _currentlyInTurn = true;
        if (_onTurnStart != null) parent.run(zone, _onTurnStart);
      }
      return fn();
    } catch (e, s) {
      // TODO(vicb): check with vics
      // When _runningInTurn > 1, the error handler is called by the zone (via onError)
      if (_onErrorHandler != null && _runningInTurn == 1) {
        _onErrorHandler(e, [s.toString()]);
      } else {
        rethrow;
      }
    } finally {
      _runningInTurn--;
      if (_runningInTurn == 0) _finishTurn(zone, parent);
    }
  }

  dynamic _onRun(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn()) =>
      _onRunBase(self, parent, zone, () => parent.run(zone, fn));

  dynamic _onRunUnary(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn(args), args) =>
      _onRunBase(self, parent, zone, () => parent.runUnary(zone, fn, args));

  void _finishTurn(zone, delegate) {
    if (_inFinishTurn) return;
    _inFinishTurn = true;
    try {
      // Two loops here: the inner one runs all queued microtasks,
      // the outer runs onTurnDone (e.g. scope.digest) and then
      // any microtasks which may have been queued from onTurnDone.
      // If any microtasks were scheduled during onTurnDone, onTurnStart
      // will be executed before those microtasks.
      do {
        if (!_currentlyInTurn) {
          _currentlyInTurn = true;
          if (_onTurnStart != null) delegate.run(zone, _onTurnStart);
        }
        while (!_asyncQueue.isEmpty) {
          _asyncQueue.removeAt(0)();
        }
        if (_onTurnDone != null) delegate.run(zone, _onTurnDone);
        _currentlyInTurn = false;
      } while (!_asyncQueue.isEmpty);
    } catch (e, s) {
      if (_onErrorHandler != null) {
        _onErrorHandler(e, [s.toString()]);
      } else {
        rethrow;
      }
    } finally {
      _inFinishTurn = false;
    }
  }

  /**
   * Called when a microtask is scheduled in the inner zone
   */
  _onMicrotask(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn) {
    // see https://api.dartlang.org/apidocs/channels/stable/dartdoc-viewer/dart:async.Zone#id_registerCallback
    // calling bindCallback() allow for long stack traces
    var microtask = _enableLongStackTrace ?
      zone.bindCallback(fn, runGuarded: false) :
      () => parent.run(zone, fn);

    _onScheduleMicrotask(microtask);
    if (_runningInTurn == 0 && !_inFinishTurn)  _finishTurn(zone, parent);
  }

  /**
   * Default handling of microtasks: add them to a queue which is drained after each macro-task
   * execute.
   */
  void _defaultOnScheduleMicrotask(fn) {
    _asyncQueue.add(fn);
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
