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
    this._callbacks = ListWrapper.create();
  }

  increaseCount(delta: number = 1) {
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
    ListWrapper.push(this._callbacks, callback);

    if (this._pendingCount === 0) {
      this._runCallbacks();
    }
    // TODO(juliemr) - hook into the zone api.
  }

  getPendingCount(): number { return this._pendingCount; }

  findBindings(using, binding: string, exactMatch: boolean): List<any> {
    // TODO(juliemr): implement.
    return [];
  }
}

@Injectable()
export class TestabilityRegistry {
  _applications: Map<any, Testability>;

  constructor() {
    this._applications = MapWrapper.create();

    getTestabilityModule.GetTestability.addToWindow(this);
  }

  registerApplication(token, testability: Testability) {
    MapWrapper.set(this._applications, token, testability);
  }

  findTestabilityInTree(elem): Testability {
    if (elem == null) {
      return null;
    }
    if (MapWrapper.contains(this._applications, elem)) {
      return MapWrapper.get(this._applications, elem);
    }
    if (DOM.isShadowRoot(elem)) {
      return this.findTestabilityInTree(DOM.getHost(elem));
    }
    return this.findTestabilityInTree(DOM.parentElement(elem));
  }
}
