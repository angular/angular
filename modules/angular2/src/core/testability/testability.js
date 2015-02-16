import {window, Node} from 'angular2/src/facade/dom';
import {Map, List} from 'angular2/src/facade/collection';
// import {Promise} from 'angular2/src/facade/async';


export class Testability {
  _pendingCount: number;

  _callbacks: List;

  constructor(rootView) {
    // Not sure if we need the root view. Leave it in for now instructionally.
    this._pendingCount = 0;
    this._callbacks = [];
  }

  increaseCount(delta: number) {
    if (delta === null || delta === undefined) {
      delta = 1;
    }
    this._pendingCount += delta;
    if (this._pendingCount < 0) {
      throw new Error('pending async requests below zero');
    } else if (this._pendingCount == 0) {
      this._runCallbacks();
    }
    return this._pendingCount;
  }

  _runCallbacks() {
    while (this._callbacks.length) {
      this._callbacks.pop()();
    }
  }

  whenStable(callback: Function) {
    if (this._pendingCount === 0) {
      callback();
    } else {
      this._callbacks.push(callback);
    }
    // TODO - hook into the zone api.
  }

  findBindings(using: Element, binding: string, exactMatch: boolean) {
    // TODO - figure out where element info gets stored and follow the tree.
  }

  findModels(using: Element, binding: string, exactMatch: boolean) {
    // I don't think this one makes much sense anymore...
  }
}

export class PublicTestability {
  _testabililty: Testability;

  constructor(testability: Testability) {
    // Is there a shorthand constructor way to do this?
    this._testability = testability;
  }

  whenStable(callback: Function) {
    this._testability.whenStable(callback);
  }

  findBindings(using: Element, binding: string, exactMatch: boolean) {
    return this._testability.findBindings(using, binding, exactMatch);
  }

  findModels(using: Element, binding: string, exactMatch: boolean) {
    // I don't think this one makes much sense anymore...
  }
}

export class TestabilityRegistry {
  _applications: Map;

  constructor() {
    var self = this; // Necessary for functions added to window?
    this._applications = new Map();
    window.angular = {
      getTestability: function(elem: Node): PublicTestability {
        var testability = self._findTestabilityInTree(elem);
        if (testability == null) {
          throw new Error('Could not find testability for element.');
        }
        return new PublicTestability(testability);
      },
      resumeBootstrap: function() {}
    };
  }

  registerApplication(token, testability) {
    this._applications.set(token, testability);
  }

  _findTestabilityInTree(elem: Node) {
    if (elem == null) {
      return null;
    }
    if (this._applications.has(elem)) {
      return this._applications.get(elem);
    }
    if (elem instanceof window.ShadowRoot) {
      return this._findTestabilityInTree(elem.host);
    }
    return this._findTestabilityInTree(elem.parentNode);
  }
}
