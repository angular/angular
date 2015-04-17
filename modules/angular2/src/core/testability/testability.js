import {Injectable} from 'angular2/src/di/annotations_impl';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {StringWrapper, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as getTestabilityModule from 'angular2/src/core/testability/get_testability';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {AppView} from 'angular2/src/core/compiler/view';
import {ComponentRef} from 'angular2/src/core/compiler/dynamic_component_loader';
import {AstTransformer, AccessMember} from 'angular2/change_detection';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';


function _isDescendantOf(elem, using) {
  var child = elem;
  while (child != null) {
    if (child == using) {
      return true;
    }
    child = DOM.parentElement(child);
  }
  return false;
}

class AstNameExtractor extends AstTransformer {
  element: any;
  outputMap: Map;

  constructor(element: any, outputMap: Map) {
    super();
    this.element = element;
    this.outputMap = outputMap;
  }

  visitAccessMember(ast: AccessMember) {
    if (MapWrapper.contains(this.outputMap, ast.name)) {
      ListWrapper.push(MapWrapper.get(this.outputMap, ast.name), this.element);
    } else {
      var elements = ListWrapper.create();
      ListWrapper.push(elements, this.element);
      MapWrapper.set(this.outputMap, ast.name, elements);
    }
  }
}


/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
@Injectable()
export class Testability {
  _pendingCount: number;
  _callbacks: List;
  _appComponent: ComponentRef;
  bindingsMap: Map;

  constructor(appComponentRef: ComponentRef) {
    this._pendingCount = 0;
    this._callbacks = ListWrapper.create();
    this._appComponent = appComponentRef;
    this.bindingsMap = MapWrapper.create();
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

  getPendingCount(): number {
    return this._pendingCount;
  }

  _regenerateBindingsMap(view: AppView) {
    this.bindingsMap = MapWrapper.create();
    this._addToBindingsMap(view);
  }

  _addToBindingsMap(appView: AppView) {
    if (appView != null) {
        ListWrapper.forEach(appView.componentChildViews, (child) => {
        this._addToBindingsMap(child);
      });

      var domView = resolveInternalDomView(appView.render);
      var elementList = domView.boundElements;
      var elementBinders = appView.proto.protoDto.elementBinders;

      for (var i = 0; i < elementBinders.length; ++i) {
        var elementBinder = ListWrapper.get(elementBinders, i);
        var correspondingElement = ListWrapper.get(elementList, i);
        var astNameExtractor = new AstNameExtractor(correspondingElement, this.bindingsMap);

        ListWrapper.forEach(elementBinder.textBindings, (textBinding) => {
          textBinding.visit(astNameExtractor);
        });

        MapWrapper.forEach(elementBinder.propertyBindings, (propertyBinding, unused) => {
          propertyBinding.visit(astNameExtractor);
        });
      };
    }
  }

  findBindings(using, binding: string, exactMatch: boolean): List {
    var view = internalView(this._appComponent.hostView);

    this._regenerateBindingsMap(view);

    var matchingElems = ListWrapper.create();

    MapWrapper.forEach(this.bindingsMap, (elems, bindingName) => {
      if ((bindingName == binding) || (!exactMatch && StringWrapper.contains(bindingName, binding))) {
        ListWrapper.forEach(elems, (elem) => {
          if (_isDescendantOf(elem, using)) {
            ListWrapper.push(matchingElems, elem);
          }
        });
      }
    });

    return matchingElems;
  }
}

@Injectable()
export class TestabilityRegistry {
  _applications: Map;

  constructor() {
    this._applications = MapWrapper.create();

    getTestabilityModule.GetTestability.addToWindow(this);
  }

  registerApplication(token, testability: Testability) {
    MapWrapper.set(this._applications, token, testability);
  }

  findTestabilityInTree(elem) : Testability {
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
