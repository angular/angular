import {Injectable} from 'angular2/src/core/di';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {CONST, CONST_EXPR} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {NgZone} from '../zone/ng_zone';
import {PromiseWrapper, ObservableWrapper} from 'angular2/src/facade/async';


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  /** @internal */
  _pendingCount: number = 0;
  /**
   * Whether any work was done since the last 'whenStable' callback. This is
   * useful to detect if this could have potentially destabilized another
   * component while it is stabilizing.
   * @internal
   */
  _didWork: boolean = false;
  /** @internal */
  _callbacks: Function[] = [];
  /** @internal */
  _isAngularEventPending: boolean = false;
  constructor(_ngZone: NgZone) { this._watchAngularEvents(_ngZone); }

  /** @internal */
  _watchAngularEvents(_ngZone: NgZone): void {
    ObservableWrapper.subscribe(_ngZone.onTurnStart, (_) => {
      this._didWork = true;
      this._isAngularEventPending = true;
    });

    _ngZone.runOutsideAngular(() => {
      ObservableWrapper.subscribe(_ngZone.onEventDone, (_) => {
        if (!_ngZone.hasPendingTimers) {
          this._isAngularEventPending = false;
          this._runCallbacksIfReady();
        }
      });
    });
  }

  increasePendingRequestCount(): number {
    this._pendingCount += 1;
    this._didWork = true;
    return this._pendingCount;
  }

  decreasePendingRequestCount(): number {
    this._pendingCount -= 1;
    if (this._pendingCount < 0) {
      throw new BaseException('pending async requests below zero');
    }
    this._runCallbacksIfReady();
    return this._pendingCount;
  }

  isStable(): boolean { return this._pendingCount == 0 && !this._isAngularEventPending; }

  /** @internal */
  _runCallbacksIfReady(): void {
    if (!this.isStable()) {
      this._didWork = true;
      return;  // Not ready
    }

    // Schedules the call backs in a new frame so that it is always async.
    PromiseWrapper.resolve(null).then((_) => {
      while (this._callbacks.length !== 0) {
        (this._callbacks.pop())(this._didWork);
      }
      this._didWork = false;
    });
  }

  whenStable(callback: Function): void {
    this._callbacks.push(callback);
    this._runCallbacksIfReady();
  }

  getPendingRequestCount(): number { return this._pendingCount; }

  // This only accounts for ngZone, and not pending counts. Use `whenStable` to
  // check for stability.
  isAngularEventPending(): boolean { return this._isAngularEventPending; }

  findBindings(using: any, provider: string, exactMatch: boolean): any[] {
    // TODO(juliemr): implement.
    return [];
  }

  findProviders(using: any, provider: string, exactMatch: boolean): any[] {
    // TODO(juliemr): implement.
    return [];
  }
}

/**
 * A global registry of {@link Testability} instances for specific elements.
 */
@Injectable()
export class TestabilityRegistry {
  /** @internal */
  _applications = new Map<any, Testability>();

  constructor() { _testabilityGetter.addToWindow(this); }

  registerApplication(token: any, testability: Testability) {
    this._applications.set(token, testability);
  }

  getTestability(elem: any): Testability { return this._applications.get(elem); }

  getAllTestabilities(): Testability[] { return MapWrapper.values(this._applications); }

  findTestabilityInTree(elem: Node, findInAncestors: boolean = true): Testability {
    return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
  }
}

/**
 * Adapter interface for retrieving the `Testability` service associated for a
 * particular context.
 */
export interface GetTestability {
  addToWindow(registry: TestabilityRegistry): void;
  findTestabilityInTree(registry: TestabilityRegistry, elem: any,
                        findInAncestors: boolean): Testability;
}

@CONST()
class _NoopGetTestability implements GetTestability {
  addToWindow(registry: TestabilityRegistry): void {}
  findTestabilityInTree(registry: TestabilityRegistry, elem: any,
                        findInAncestors: boolean): Testability {
    return null;
  }
}

/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 */
export function setTestabilityGetter(getter: GetTestability): void {
  _testabilityGetter = getter;
}

var _testabilityGetter: GetTestability = CONST_EXPR(new _NoopGetTestability());
