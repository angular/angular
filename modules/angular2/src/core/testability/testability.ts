import {Injectable} from 'angular2/di';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {StringWrapper, isBlank, BaseException} from 'angular2/src/core/facade/lang';
import * as getTestabilityModule from './get_testability';
import {NgZone} from '../zone/ng_zone';
import {PromiseWrapper} from 'angular2/src/core/facade/async';


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  _pendingCount: number = 0;
  _callbacks: Function[] = [];
  _isAngularEventPending: boolean = false;

  constructor(public _ngZone: NgZone) { this._watchAngularEvents(_ngZone); }

  _watchAngularEvents(_ngZone: NgZone): void {
    _ngZone.overrideOnTurnStart(() => { this._isAngularEventPending = true; });
    _ngZone.overrideOnEventDone(() => {
      this._isAngularEventPending = false;
      this._runCallbacksIfReady();
    }, true);
  }

  increasePendingRequestCount(): number {
    this._pendingCount += 1;
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

  _runCallbacksIfReady(): void {
    if (this._pendingCount != 0 || this._isAngularEventPending) {
      return;  // Not ready
    }

    // Schedules the call backs in a new frame so that it is always async.
    PromiseWrapper.resolve(null).then((_) => {
      while (this._callbacks.length !== 0) {
        (this._callbacks.pop())();
      }
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

  findBindings(using: any, binding: string, exactMatch: boolean): any[] {
    // TODO(juliemr): implement.
    return [];
  }
}

@Injectable()
export class TestabilityRegistry {
  _applications: Map<any, Testability> = new Map();

  constructor() { getTestabilityModule.GetTestability.addToWindow(this); }

  registerApplication(token: any, testability: Testability) {
    this._applications.set(token, testability);
  }

  getAllTestabilities(): Testability[] { return MapWrapper.values(this._applications); }

  findTestabilityInTree(elem: Node, findInAncestors: boolean = true): Testability {
    if (elem == null) {
      return null;
    }
    if (this._applications.has(elem)) {
      return this._applications.get(elem);
    } else if (!findInAncestors) {
      return null;
    }
    if (DOM.isShadowRoot(elem)) {
      return this.findTestabilityInTree(DOM.getHost(elem));
    }
    return this.findTestabilityInTree(DOM.parentElement(elem));
  }
}
