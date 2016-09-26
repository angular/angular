/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '../di';
import {MapWrapper} from '../facade/collection';
import {scheduleMicroTask} from '../facade/lang';
import {NgZone} from '../zone/ng_zone';

/**
 * Testability API.
 * `declare` keyword causes tsickle to generate externs, so these methods are
 * not renamed by Closure Compiler.
 * @experimental
 */
export declare interface PublicTestability {
  isStable(): boolean;
  whenStable(callback: Function): void;
  findProviders(using: any, provider: string, exactMatch: boolean): any[];
}

/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 * @experimental
 */
@Injectable()
export class Testability implements PublicTestability {
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
    this._ngZone.onUnstable.subscribe({
      next: () => {
        this._didWork = true;
        this._isZoneStable = false;
      }
    });

    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.subscribe({
        next: () => {
          NgZone.assertNotInAngularZone();
          scheduleMicroTask(() => {
            this._isZoneStable = true;
            this._runCallbacksIfReady();
          });
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
      throw new Error('pending async requests below zero');
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

  /** @deprecated use findProviders */
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
 * @experimental
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
 *
 * @experimental Testability apis are primarily intended to be used by e2e test tool vendors like
 * the Protractor team.
 */
export interface GetTestability {
  addToWindow(registry: TestabilityRegistry): void;
  findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean):
      Testability;
}

class _NoopGetTestability implements GetTestability {
  addToWindow(registry: TestabilityRegistry): void {}
  findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean):
      Testability {
    return null;
  }
}

/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @experimental
 */
export function setTestabilityGetter(getter: GetTestability): void {
  _testabilityGetter = getter;
}

var _testabilityGetter: GetTestability = new _NoopGetTestability();
