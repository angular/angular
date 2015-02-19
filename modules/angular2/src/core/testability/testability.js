import {window, Node} from 'angular2/src/facade/dom';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {StringWrapper} from 'angular2/src/facade/lang';
import {View, DirectiveBindingMemento, ElementBindingMemento} from 'angular2/src/core/compiler/view';

/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
export class Testability {
  _pendingCount: number;
  _callbacks: List;
  _rootView: View;
  _bindingMap: Map;

  constructor(rootView) {
    this._rootView = rootView;
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
    // TODO(juliemr) - hook into the zone api.
  }

  _addBindingsFromView(view: View) {
    var protos = view.changeDetector.protos;
    for (var i = 0; i < protos.length; ++i) {
      var memento = protos[i].bindingMemento;
      var elem = null;
      if (memento instanceof DirectiveBindingMemento) {
        // TODO - figure out what this case is.
        continue;
      } else if (memento instanceof ElementBindingMemento) {
        // TODO - can we do this without accessing the private variable?
        elem = view.bindElements[memento._elementIndex];
      } else {
        // memento is an integer index into textNodes.
        elem = view.textNodes[memento].parentElement;
      }

      var bindingName = protos[i].name;
      if (bindingName == 'interpolate') {
        continue;
      }
      if (!MapWrapper.contains(this._bindingMap, bindingName)) {
        MapWrapper.set(this._bindingMap, bindingName, [elem]);
      } else {
        // Is this really the way we have to use facades to write stuff?
        ListWrapper.push(MapWrapper.get(this._bindingMap, bindingName), elem);
      }
    }

    for (var j = 0; j < view.componentChildViews.length; ++j) {
      this._addBindingsFromView(view.componentChildViews[j]);
    }
  }

  findBindings(using: Element, binding: string, exactMatch: boolean) {
    // TODO(juliemr): restrict scope with 'using'
    this._bindingMap = MapWrapper.create();
    this._addBindingsFromView(this._rootView);

    if (exactMatch) {
      return this._bindingMap[binding];
    } else {
      var matches = [];
      MapWrapper.forEach(this._bindingMap, (elems, name) => {
        if (StringWrapper.contains(name, binding)) {
          matches = ListWrapper.concat(matches, elems);
        }
      });
      return matches;
    }
  }

  findModels(using: Element, binding: string, exactMatch: boolean) {
    // TODO(juliemr): When forms are finalized, decide if something belongs
    // here.
    return [];
  }
}


export class PublicTestability {
  _testabililty: Testability;

  constructor(testability: Testability) {
    this._testability = testability;
  }

  whenStable(callback: Function) {
    this._testability.whenStable(callback);
  }

  findBindings(using: Element, binding: string, exactMatch: boolean) {
    return this._testability.findBindings(using, binding, exactMatch);
  }

  findModels(using: Element, binding: string, exactMatch: boolean) {
    return this._testability.findModels(using, binding, exactMatch);
  }
}

export class TestabilityRegistry {
  _applications: Map;

  constructor() {
    var self = this; // Necessary for functions added to window?
    this._applications = new Map();
    window.angular = {
      // TODO - pull this out, and dartify it.
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
