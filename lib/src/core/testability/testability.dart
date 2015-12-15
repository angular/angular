library angular2.src.core.testability.testability;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, ListWrapper;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "../zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, ObservableWrapper;

/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
class Testability {
  /** @internal */
  num _pendingCount = 0;
  /** @internal */
  List<Function> _callbacks = [];
  /** @internal */
  bool _isAngularEventPending = false;
  Testability(NgZone _ngZone) {
    this._watchAngularEvents(_ngZone);
  }
  /** @internal */
  void _watchAngularEvents(NgZone _ngZone) {
    ObservableWrapper.subscribe(_ngZone.onTurnStart, (_) {
      this._isAngularEventPending = true;
    });
    _ngZone.runOutsideAngular(() {
      ObservableWrapper.subscribe(_ngZone.onEventDone, (_) {
        if (!_ngZone.hasPendingTimers) {
          this._isAngularEventPending = false;
          this._runCallbacksIfReady();
        }
      });
    });
  }

  num increasePendingRequestCount() {
    this._pendingCount += 1;
    return this._pendingCount;
  }

  num decreasePendingRequestCount() {
    this._pendingCount -= 1;
    if (this._pendingCount < 0) {
      throw new BaseException("pending async requests below zero");
    }
    this._runCallbacksIfReady();
    return this._pendingCount;
  }

  bool isStable() {
    return this._pendingCount == 0 && !this._isAngularEventPending;
  }

  /** @internal */
  void _runCallbacksIfReady() {
    if (!this.isStable()) {
      return;
    }
    // Schedules the call backs in a new frame so that it is always async.
    PromiseWrapper.resolve(null).then((_) {
      while (!identical(this._callbacks.length, 0)) {
        (this._callbacks.removeLast())();
      }
    });
  }

  void whenStable(Function callback) {
    this._callbacks.add(callback);
    this._runCallbacksIfReady();
  }

  num getPendingRequestCount() {
    return this._pendingCount;
  }
  // This only accounts for ngZone, and not pending counts. Use `whenStable` to

  // check for stability.
  bool isAngularEventPending() {
    return this._isAngularEventPending;
  }

  List<dynamic> findBindings(dynamic using, String provider, bool exactMatch) {
    // TODO(juliemr): implement.
    return [];
  }

  List<dynamic> findProviders(dynamic using, String provider, bool exactMatch) {
    // TODO(juliemr): implement.
    return [];
  }
}

/**
 * A global registry of [Testability] instances for specific elements.
 */
@Injectable()
class TestabilityRegistry {
  /** @internal */
  var _applications = new Map<dynamic, Testability>();
  TestabilityRegistry() {
    _testabilityGetter.addToWindow(this);
  }
  registerApplication(dynamic token, Testability testability) {
    this._applications[token] = testability;
  }

  Testability getTestability(dynamic elem) {
    return this._applications[elem];
  }

  List<Testability> getAllTestabilities() {
    return MapWrapper.values(this._applications);
  }

  Testability findTestabilityInTree(dynamic elem,
      [bool findInAncestors = true]) {
    return _testabilityGetter.findTestabilityInTree(
        this, elem, findInAncestors);
  }
}

/**
 * Adapter interface for retrieving the `Testability` service associated for a
 * particular context.
 */
abstract class GetTestability {
  void addToWindow(TestabilityRegistry registry);
  Testability findTestabilityInTree(
      TestabilityRegistry registry, dynamic elem, bool findInAncestors);
}

class _NoopGetTestability implements GetTestability {
  void addToWindow(TestabilityRegistry registry) {}
  Testability findTestabilityInTree(
      TestabilityRegistry registry, dynamic elem, bool findInAncestors) {
    return null;
  }

  const _NoopGetTestability();
}

/**
 * Set the [GetTestability] implementation used by the Angular testing framework.
 */
void setTestabilityGetter(GetTestability getter) {
  _testabilityGetter = getter;
}

GetTestability _testabilityGetter = const _NoopGetTestability();
