import {window, Node} from 'angular2/src/facade/dom';
import {Map} from 'angular2/src/facade/collection';
import {Promise} from 'angular2/src/facade/async';


export class Testability {
  static _count: number = 0;
  _thisOne: number;

  constructor(rootView) {
    // Not sure if we need the root view. Leave it in for now instructionally.
    this._thisOne = Testability._count++;
  }

  whenStable() {
    return Promise.resolve('');
  }
}

export class TestabilityRegistry {
  _applications: Map;

  constructor() {
    var self = this; // Necessary for functions added to window?
    this._applications = new Map();
    window.angular = {
      getTestability: function(elem: Node): Testability {
        var testability = self._findTestabilityInTree(elem);
        if (testability == null) {
          throw new Error('Could not find testability for element.');
        }
        return testability;
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
