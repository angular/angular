import {Injectable} from 'angular2/src/core/di';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {CONST, CONST_EXPR, scheduleMicroTask} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {NgZone} from '../zone/ng_zone';
import {ObservableWrapper} from 'angular2/src/facade/async';


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  /** @internal */
  _pendingCount: number = 0;
  /** @internal */
  _isZoneStable: boolean = true;
  /**
   * Whether any work was done since the last 'whenStable' callback. This is
   * useful to detect if this could have potentially destabilized another
   * component while it is stabilizing.
   * @internal
   */
  _didWork: boolean = false;
  /** @internal */
  _callbacks: Function[] = [];
  constructor(private _ngZone: NgZone) { this._watchAngularEvents(); }

  /** @internal */
  _watchAngularEvents(): void {
    ObservableWrapper.subscribe(this._ngZone.onUnstable, (_) => {
      this._didWork = true;
      this._isZoneStable = false;
    });

    this._ngZone.runOutsideAngular(() => {
      ObservableWrapper.subscribe(this._ngZone.onStable, (_) => {
        NgZone.assertNotInAngularZone();
        scheduleMicroTask(() => {
          this._isZoneStable = true;
          this._runCallbacksIfReady();
        });
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

  isStable(): boolean {
    return this._isZoneStable && this._pendingCount == 0 && !this._ngZone.hasPendingMacrotasks;
  }

  /** @internal */
  _runCallbacksIfReady(): void {
    if (this.isStable()) {
      // Schedules the call backs in a new frame so that it is always async.
      scheduleMicroTask(() => {
        while (this._callbacks.length !== 0) {
          (this._callbacks.pop())(this._didWork);
        }
        this._didWork = false;
      });
    } else {
      // Not Ready
      this._didWork = true;
    }
  }

  whenStable(callback: Function): void {
    this._callbacks.push(callback);
    this._runCallbacksIfReady();
  }

  getPendingRequestCount(): number { return this._pendingCount; }

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

  getAllRootElements(): any[] { return MapWrapper.keys(this._applications); }

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
