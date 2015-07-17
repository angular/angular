import {Injectable} from 'angular2/di';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {StringWrapper, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as getTestabilityModule from './get_testability';
import {NgZone} from '../zone/ng_zone';


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  _pendingCount: number = 0;
  _callbacks: List<Function> = [];
  _isAngularEventDone: boolean = true;

  constructor(public _ngZone: NgZone) { this._registerStabilityCallbacks(_ngZone); }

  _registerStabilityCallbacks(_ngZone: NgZone): void {
    _ngZone.overrideOnTurnStart(() => { this._isAngularEventDone = false; });
    _ngZone.overrideOnEventDone(() => {
      this._isAngularEventDone = true;
      this._runCallbacksIfReady();
    }, true);
  }

  increaseCount(delta: number = 1): number {
    this._pendingCount += delta;
    return this._pendingCount;
  }

  decreaseCount(delta: number = 1): number {
    this._pendingCount -= delta;
    if (this._pendingCount < 0) {
      throw new BaseException('pending async requests below zero');
    }
    this._runCallbacksIfReady();
    return this._pendingCount;
  }

  _runCallbacksIfReady(): void {
    if (this._pendingCount != 0 || !this._isAngularEventDone) {
      return;  // Not ready
    }

    while (this._callbacks.length !== 0) {
      (this._callbacks.pop())();
    }
  }

  whenStable(callback: Function): void {
    this._callbacks.push(callback);
    this._runCallbacksIfReady();
  }

  getPendingCount(): number { return this._pendingCount; }

  // This only accounts for ngZone, and not pending counts. Use `whenStable` to
  // check for stability.
  isAngularEventDone(): boolean { return this._isAngularEventDone; }

  findBindings(using, binding: string, exactMatch: boolean): List<any> {
    // TODO(juliemr): implement.
    return [];
  }
}

@Injectable()
export class TestabilityRegistry {
  _applications: Map<any, Testability> = new Map();

  constructor() { getTestabilityModule.GetTestability.addToWindow(this); }

  registerApplication(token, testability: Testability) {
    this._applications.set(token, testability);
  }

  findTestabilityInTree(elem): Testability {
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
