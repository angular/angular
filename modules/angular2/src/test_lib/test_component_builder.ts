import {Injector, bind, Injectable} from 'angular2/di';

import {Type, isPresent, BaseException, isBlank} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {View} from 'angular2/src/core/annotations_impl/view';

import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
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

/**
 * @exportedAs angular2/test
 */
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
 * @exportedAs angular2/test
 *
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
    this._viewOverrides = MapWrapper.create();
    this._directiveOverrides = MapWrapper.create();
    this._templateOverrides = MapWrapper.create();
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
   * All the other propoerties of the component's {@link View} are preserved.
   *
   * @param {Type} component
   * @param {string} html
   *
   * @return {TestComponentBuilder}
   */
  overrideTemplate(componentType: Type, template: string): TestComponentBuilder {
    var clone = this._clone();
    MapWrapper.set(clone._templateOverrides, componentType, template);
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
    MapWrapper.set(clone._viewOverrides, componentType, view);
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
    var overridesForComponent = MapWrapper.get(clone._directiveOverrides, componentType);
    if (!isPresent(overridesForComponent)) {
      MapWrapper.set(clone._directiveOverrides, componentType, MapWrapper.create());
      overridesForComponent = MapWrapper.get(clone._directiveOverrides, componentType);
    }
    MapWrapper.set(overridesForComponent, from, to);
    return clone;
  }

  /**
   * Builds and returns a RootTestComponent.
   *
   * @return {Promise<RootTestComponent>}
   */
  createAsync(rootComponentType: Type): Promise<RootTestComponent> {
    var mockTemplateResolver = this._injector.get(TemplateResolver);
    MapWrapper.forEach(this._viewOverrides,
                       (view, type) => { mockTemplateResolver.setView(type, view); });
    MapWrapper.forEach(this._templateOverrides, (template, type) => {
      mockTemplateResolver.setInlineTemplate(type, template);
    });
    MapWrapper.forEach(this._directiveOverrides, (overrides, component) => {
      MapWrapper.forEach(overrides, (to, from) => {
        mockTemplateResolver.overrideViewDirective(component, from, to);
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
