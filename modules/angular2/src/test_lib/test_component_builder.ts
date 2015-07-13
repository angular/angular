import {Injector, bind, Injectable} from 'angular2/di';

import {Type, isPresent, BaseException, isBlank} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {View} from 'angular2/src/core/annotations_impl/view';

import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {AppView} from 'angular2/src/core/compiler/view';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {
  DynamicComponentLoader,
  ComponentRef
} from 'angular2/src/core/compiler/dynamic_component_loader';

import {el} from './utils';

import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {DebugElement} from 'angular2/src/debug/debug_element';

export class RootTestComponent extends DebugElement {
  _componentRef: ComponentRef;
  _componentParentView: AppView;

  constructor(componentRef: ComponentRef) {
    super(internalView(componentRef.hostView), 0);

    this._componentParentView = internalView(componentRef.hostView);
    this._componentRef = componentRef;
  }

  detectChanges(): void {
    this._componentParentView.changeDetector.detectChanges();
    this._componentParentView.changeDetector.checkNoChanges();
  }

  destroy(): void { this._componentRef.dispose(); }
}

var _nextRootElementId = 0;

/**
 * Builds a RootTestComponent for use in component level tests.
 */
@Injectable()
export class TestComponentBuilder {
  _injector: Injector;
  _viewOverrides: Map<Type, View>;
  _directiveOverrides: Map<Type, Map<Type, Type>>;
  _templateOverrides: Map<Type, string>;

  constructor(injector: Injector) {
    this._injector = injector;
    this._viewOverrides = new Map();
    this._directiveOverrides = new Map();
    this._templateOverrides = new Map();
  }

  _clone(): TestComponentBuilder {
    var clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    return clone;
  }

  /**
   * Overrides only the html of a {@link Component}.
   * All the other properties of the component's {@link View} are preserved.
   *
   * @param {Type} component
   * @param {string} html
   *
   * @return {TestComponentBuilder}
   */
  overrideTemplate(componentType: Type, template: string): TestComponentBuilder {
    var clone = this._clone();
    clone._templateOverrides.set(componentType, template);
    return clone;
  }

  /**
   * Overrides a component's {@link View}.
   *
   * @param {Type} component
   * @param {view} View
   *
   * @return {TestComponentBuilder}
   */
  overrideView(componentType: Type, view: View): TestComponentBuilder {
    var clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  }

  /**
   * Overrides the directives from the component {@link View}.
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   *
   * @return {TestComponentBuilder}
   */
  overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder {
    var clone = this._clone();
    var overridesForComponent = clone._directiveOverrides.get(componentType);
    if (!isPresent(overridesForComponent)) {
      clone._directiveOverrides.set(componentType, new Map());
      overridesForComponent = clone._directiveOverrides.get(componentType);
    }
    overridesForComponent.set(from, to);
    return clone;
  }

  /**
   * Builds and returns a RootTestComponent.
   *
   * @return {Promise<RootTestComponent>}
   */
  createAsync(rootComponentType: Type): Promise<RootTestComponent> {
    var mockViewResolver = this._injector.get(ViewResolver);
    MapWrapper.forEach(this._viewOverrides,
                       (view, type) => { mockViewResolver.setView(type, view); });
    MapWrapper.forEach(this._templateOverrides,
                       (template, type) => { mockViewResolver.setInlineTemplate(type, template); });
    MapWrapper.forEach(this._directiveOverrides, (overrides, component) => {
      MapWrapper.forEach(overrides, (to, from) => {
        mockViewResolver.overrideViewDirective(component, from, to);
      });
    });

    var rootElId = `root${_nextRootElementId++}`;
    var rootEl = el(`<div id="${rootElId}"></div>`);
    var doc = this._injector.get(DOCUMENT_TOKEN);

    // TODO(juliemr): can/should this be optional?
    DOM.appendChild(doc.body, rootEl);


    return this._injector.get(DynamicComponentLoader)
        .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
        .then((componentRef) => { return new RootTestComponent(componentRef); });
  }
}
