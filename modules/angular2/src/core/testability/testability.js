import {window, Node} from 'angular2/src/facade/dom';
import {Map} from 'angular2/src/facade/collection';
import {Promise} from 'angular2/src/facade/async';


export class Testability {
  constructor(rootView) {
    // Not sure if we need the root view. Leave it in for now instructionally.
  }

  whenStable() {
    // TODO - hook into the zone api.
    return Promise.resolve('');
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

  whenStable() {
    return this._testability.whenStable();
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
    console.log('register application');
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
