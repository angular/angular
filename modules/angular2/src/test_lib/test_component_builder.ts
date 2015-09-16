import {Injector, bind, Injectable} from 'angular2/src/core/di';

import {Type, isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {Promise} from 'angular2/src/core/facade/async';
import {ListWrapper, MapWrapper} from 'angular2/src/core/facade/collection';

import {ViewMetadata} from '../core/metadata';

import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {AppView} from 'angular2/src/core/compiler/view';
import {internalView, ViewRef} from 'angular2/src/core/compiler/view_ref';
import {
  DynamicComponentLoader,
  ComponentRef
} from 'angular2/src/core/compiler/dynamic_component_loader';

import {el} from './utils';

import {DOCUMENT} from 'angular2/src/core/render/render';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {DebugElement} from 'angular2/src/core/debug/debug_element';

export class RootTestComponent {
  _componentRef: ComponentRef;
  _componentParentView: AppView;
  debugElement: DebugElement;

  /**
   * @private
   */
  constructor(componentRef: ComponentRef) {
    this.debugElement = new DebugElement(internalView(<ViewRef>componentRef.hostView), 0);

    this._componentParentView = internalView(<ViewRef>componentRef.hostView);
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
  _bindingsOverrides: Map<Type, any[]>;
  _directiveOverrides: Map<Type, Map<Type, Type>>;
  _templateOverrides: Map<Type, string>;
  _viewBindingsOverrides: Map<Type, any[]>;
  _viewOverrides: Map<Type, ViewMetadata>;


  constructor(private _injector: Injector) {
    this._bindingsOverrides = new Map();
    this._directiveOverrides = new Map();
    this._templateOverrides = new Map();
    this._viewBindingsOverrides = new Map();
    this._viewOverrides = new Map();
  }

  _clone(): TestComponentBuilder {
    var clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    return clone;
  }

  /**
   * Overrides only the html of a {@link ComponentMetadata}.
   * All the other properties of the component's {@link ViewMetadata} are preserved.
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
   * Overrides a component's {@link ViewMetadata}.
   *
   * @param {Type} component
   * @param {view} View
   *
   * @return {TestComponentBuilder}
   */
  overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder {
    var clone = this._clone();
    clone._viewOverrides.set(componentType, view);
    return clone;
  }

  /**
   * Overrides the directives from the component {@link ViewMetadata}.
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
   * Overrides one or more injectables configured via `bindings` metadata property of a directive or
   * component.
   * Very useful when certain bindings need to be mocked out.
   *
   * The bindings specified via this method are appended to the existing `bindings` causing the
   * duplicated bindings to
   * be overridden.
   *
   * @param {Type} component
   * @param {any[]} bindings
   *
   * @return {TestComponentBuilder}
   */
  overrideBindings(type: Type, bindings: any[]): TestComponentBuilder {
    var clone = this._clone();
    clone._bindingsOverrides.set(type, bindings);
    return clone;
  }

  /**
   * Overrides one or more injectables configured via `bindings` metadata property of a directive or
   * component.
   * Very useful when certain bindings need to be mocked out.
   *
   * The bindings specified via this method are appended to the existing `bindings` causing the
   * duplicated bindings to
   * be overridden.
   *
   * @param {Type} component
   * @param {any[]} bindings
   *
   * @return {TestComponentBuilder}
   */
  overrideViewBindings(type: Type, bindings: any[]): TestComponentBuilder {
    var clone = this._clone();
    clone._viewBindingsOverrides.set(type, bindings);
    return clone;
  }

  /**
   * Builds and returns a RootTestComponent.
   *
   * @return {Promise<RootTestComponent>}
   */
  createAsync(rootComponentType: Type): Promise<RootTestComponent> {
    var mockDirectiveResolver = this._injector.get(DirectiveResolver);
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

    this._bindingsOverrides.forEach((bindings, type) =>
                                        mockDirectiveResolver.setBindingsOverride(type, bindings));
    this._viewBindingsOverrides.forEach(
        (bindings, type) => mockDirectiveResolver.setViewBindingsOverride(type, bindings));

    var rootElId = `root${_nextRootElementId++}`;
    var rootEl = el(`<div id="${rootElId}"></div>`);
    var doc = this._injector.get(DOCUMENT);

    // TODO(juliemr): can/should this be optional?
    var oldRoots = DOM.querySelectorAll(doc, '[id^=root]');
    for (var i = 0; i < oldRoots.length; i++) {
      DOM.remove(oldRoots[i]);
    }
    DOM.appendChild(doc.body, rootEl);


    return this._injector.get(DynamicComponentLoader)
        .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
        .then((componentRef) => { return new RootTestComponent(componentRef); });
  }
}
