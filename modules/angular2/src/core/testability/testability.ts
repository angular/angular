import {Injectable} from 'angular2/di';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {StringWrapper, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as getTestabilityModule from './get_testability';


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  _pendingCount: number;
  _callbacks: List<Function>;

  constructor() {
    this._pendingCount = 0;
    this._callbacks = [];
  }

  increaseCount(delta: number = 1): number {
    this._pendingCount += delta;
    if (this._pendingCount < 0) {
      throw new BaseException('pending async requests below zero');
    } else if (this._pendingCount == 0) {
      this._runCallbacks();
    }
    return this._pendingCount;
  }

  _runCallbacks() {
    while (this._callbacks.length !== 0) {
      ListWrapper.removeLast(this._callbacks)();
    }
  }

  whenStable(callback: Function) {
    this._callbacks.push(callback);

    if (this._pendingCount === 0) {
      this._runCallbacks();
    }
    // TODO(juliemr) - hook into the zone api.
  }

  getPendingCount(): number { return this._pendingCount; }

  findBindings(using: any, binding: string, exactMatch: boolean): List<any> {
    // TODO(juliemr): implement.
    return [];
  }
}

@Injectable()
export class TestabilityRegistry {
  _applications: Map<any, Testability>;

  constructor() {
    this._applications = new Map();

    getTestabilityModule.GetTestability.addToWindow(this);
  }

  registerApplication(token: any, testability: Testability) {
    this._applications.set(token, testability);
  }

  findTestabilityInTree(elem: Node): Testability {
    if (elem == null) {
      return null;
    }
    if (this._applications.has(elem)) {
      return this._applications.get(elem);
    }
    if (DOM.isShadowRoot(elem)) {
      return this.findTestabilityInTree(DOM.getHost(elem));
    }
    return this.findTestabilityInTree(DOM.parentElement(elem));
  }
}
