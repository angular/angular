import {window, Node, Element} from 'angular2/src/facade/dom';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {StringWrapper, isBlank} from 'angular2/src/facade/lang';
import {View, DirectiveBindingMemento, ElementBindingMemento} from 'angular2/src/core/compiler/view';
import {GetTestability} from 'angular2/src/core/testability/get_testability';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';


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
  _zone: VmTurnZone;

  constructor(rootView: View, zone: VmTurnZone) {
    this._rootView = rootView;
    this._pendingCount = 0;
    this._callbacks = ListWrapper.create();
    this._zone = zone;
  }

  increaseCount(delta: number) {
    if (isBlank(delta)) {
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
    console.log('Running whenStable callbacks');
    while (this._callbacks.length) {
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

  _addBindingsFromView(view: View) {
    // TODO - this (maybe? maybe not?) won't work for the JIT change detector
    // TODO - figure out how to switch to the JIT change detector
    var protos = view.changeDetector.protos; // These are ProtoRecords
    for (var i = 0; i < protos.length; ++i) {
      var memento = protos[i].bindingMemento;
      var elem = null;
      if (memento instanceof DirectiveBindingMemento) {
        // TODO - figure out what this case is.
        continue;
      } else if (memento instanceof ElementBindingMemento) {
        // TODO - can we do this without accessing the private variable?
        // This will (probably?) fail in dart.
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
        ListWrapper.push(MapWrapper.get(this._bindingMap, bindingName), elem);
      }
    }

    for (var j = 0; j < view.componentChildViews.length; ++j) {
      this._addBindingsFromView(view.componentChildViews[j]);
      // TODO - and also add view containers here?
    }
  }

  findBindings(using: Element, binding: string, exactMatch: boolean) {
    console.log(this._rootView);

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

export class TestabilityRegistry {
  _applications: Map;

  constructor() {
    this._applications = new Map();

    GetTestability.addToWindow(this);
  }

  registerApplication(token, testability) {
    MapWrapper.set(this._applications, token, testability);
  }

  _findTestabilityInTree(elem: Node) {
    if (elem == null) {
      return null;
    }
    if (MapWrapper.contains(this._applications, elem)) {
      return MapWrapper.get(this._applications, elem);
    }
    if (elem instanceof window.ShadowRoot) {
      return this._findTestabilityInTree(elem.host);
    }
    return this._findTestabilityInTree(elem.parentNode);
  }
}
