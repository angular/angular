import {
  ComponentRef,
  DebugElement,
  DirectiveResolver,
  DynamicComponentLoader,
  Injector,
  Injectable,
  ViewMetadata,
  EmbeddedViewRef,
  ViewResolver,
  provide,
  Provider
} from 'angular2/core';

import {Type, isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {Compiler, Compiler_} from 'angular2/src/core/linker/compiler';
import {ViewFactoryProxy} from 'angular2/src/core/linker/view_listener';

import {ViewRef_, HostViewFactoryRef_} from 'angular2/src/core/linker/view_ref';
import {AppView} from 'angular2/src/core/linker/view';

import {el} from './utils';

import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {DebugElement_} from 'angular2/src/core/debug/debug_element';

/**
 * Fixture for debugging and testing a component.
 */
export abstract class ComponentFixture {
  /**
   * The DebugElement associated with the root element of this component.
   */
  debugElement: DebugElement;

  /**
   * The instance of the root component class.
   */
  componentInstance: any;

  /**
   * The native element at the root of the component.
   */
  nativeElement: any;

  /**
   * Trigger a change detection cycle for the component.
   */
  abstract detectChanges(): void;

  /**
   * Trigger component destruction.
   */
  abstract destroy(): void;
}


export class ComponentFixture_ extends ComponentFixture {
  /** @internal */
  _componentRef: ComponentRef;
  /** @internal */
  _componentParentView: AppView;

  constructor(componentRef: ComponentRef) {
    super();
    this._componentParentView = (<ViewRef_>componentRef.hostView).internalView;
    this.debugElement = new DebugElement_(this._componentParentView.appElements[0]);
    this.componentInstance = this.debugElement.componentInstance;
    this.nativeElement = this.debugElement.nativeElement;
    this._componentRef = componentRef;
  }

  detectChanges(): void {
    this._componentParentView.changeDetector.detectChanges();
    this._componentParentView.changeDetector.checkNoChanges();
  }

  destroy(): void { this._componentRef.dispose(); }
}

var _nextRootElementId = 0;

@Injectable()
export class TestViewFactoryProxy implements ViewFactoryProxy {
  private _componentFactoryOverrides: Map<Type, Function> = new Map<Type, Function>();

  getComponentViewFactory(component: Type, originalViewFactory: Function): Function {
    var override = this._componentFactoryOverrides.get(component);
    return isPresent(override) ? override : originalViewFactory;
  }

  setComponentViewFactory(component: Type, viewFactory: Function) {
    this._componentFactoryOverrides.set(component, viewFactory);
  }
}

/**
 * Builds a ComponentFixture for use in component level tests.
 */
@Injectable()
export class TestComponentBuilder {
  /** @internal */
  _bindingsOverrides = new Map<Type, any[]>();
  /** @internal */
  _directiveOverrides = new Map<Type, Map<Type, Type>>();
  /** @internal */
  _templateOverrides = new Map<Type, string>();
  /** @internal */
  _viewBindingsOverrides = new Map<Type, any[]>();
  /** @internal */
  _viewOverrides = new Map<Type, ViewMetadata>();
  /** @internal */
  _componentOverrides = new Map<Type, Type>();

  constructor(private _injector: Injector) {}

  /** @internal */
  _clone(): TestComponentBuilder {
    var clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    clone._componentOverrides = MapWrapper.clone(this._componentOverrides);
    return clone;
  }

  /**
   * Overrides a component with another component.
   * This also works with precompiled templates if they were generated
   * in development mode.
   *
   * @param {Type} original component
   * @param {Type} mock component
   *
   * @return {TestComponentBuilder}
   */
  overrideComponent(componentType: Type, mockType: Type): TestComponentBuilder {
    var clone = this._clone();
    clone._componentOverrides.set(componentType, mockType);
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
      clone._directiveOverrides.set(componentType, new Map<Type, Type>());
      overridesForComponent = clone._directiveOverrides.get(componentType);
    }
    overridesForComponent.set(from, to);
    return clone;
  }

  /**
   * Overrides one or more injectables configured via `providers` metadata property of a directive
   * or
   * component.
   * Very useful when certain providers need to be mocked out.
   *
   * The providers specified via this method are appended to the existing `providers` causing the
   * duplicated providers to
   * be overridden.
   *
   * @param {Type} component
   * @param {any[]} providers
   *
   * @return {TestComponentBuilder}
   */
  overrideProviders(type: Type, providers: any[]): TestComponentBuilder {
    var clone = this._clone();
    clone._bindingsOverrides.set(type, providers);
    return clone;
  }

  /**
   * @deprecated
   */
  overrideBindings(type: Type, providers: any[]): TestComponentBuilder {
    return this.overrideProviders(type, providers);
  }

  /**
   * Overrides one or more injectables configured via `providers` metadata property of a directive
   * or
   * component.
   * Very useful when certain providers need to be mocked out.
   *
   * The providers specified via this method are appended to the existing `providers` causing the
   * duplicated providers to
   * be overridden.
   *
   * @param {Type} component
   * @param {any[]} providers
   *
   * @return {TestComponentBuilder}
   */
  overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder {
    var clone = this._clone();
    clone._viewBindingsOverrides.set(type, providers);
    return clone;
  }

  /**
   * @deprecated
   */
  overrideViewBindings(type: Type, providers: any[]): TestComponentBuilder {
    return this.overrideViewProviders(type, providers);
  }

  /**
   * Builds and returns a ComponentFixture.
   *
   * @return {Promise<ComponentFixture>}
   */
  createAsync(rootComponentType: Type): Promise<ComponentFixture> {
    var mockDirectiveResolver = this._injector.get(DirectiveResolver);
    var mockViewResolver = this._injector.get(ViewResolver);
    this._viewOverrides.forEach((view, type) => mockViewResolver.setView(type, view));
    this._templateOverrides.forEach((template, type) =>
                                        mockViewResolver.setInlineTemplate(type, template));
    this._directiveOverrides.forEach((overrides, component) => {
      overrides.forEach(
          (to, from) => { mockViewResolver.overrideViewDirective(component, from, to); });
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
    var originalCompTypes = [];
    var mockHostViewFactoryPromises = [];
    var compiler: Compiler_ = this._injector.get(Compiler);
    var viewFactoryProxy: TestViewFactoryProxy = this._injector.get(TestViewFactoryProxy);
    this._componentOverrides.forEach((mockCompType, originalCompType) => {
      originalCompTypes.push(originalCompType);
      mockHostViewFactoryPromises.push(compiler.compileInHost(mockCompType));
    });
    return PromiseWrapper.all(mockHostViewFactoryPromises)
        .then((mockHostViewFactories: HostViewFactoryRef_[]) => {
          for (var i = 0; i < mockHostViewFactories.length; i++) {
            var originalCompType = originalCompTypes[i];
            viewFactoryProxy.setComponentViewFactory(
                originalCompType,
                mockHostViewFactories[i].internalHostViewFactory.componentViewFactory);
          }
          return this._injector.get(DynamicComponentLoader)
              .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
              .then((componentRef) => { return new ComponentFixture_(componentRef); });
        });
  }
}

export const TEST_COMPONENT_BUILDER_PROVIDERS = CONST_EXPR([
  TestViewFactoryProxy,
  CONST_EXPR(new Provider(ViewFactoryProxy, {useExisting: TestViewFactoryProxy})),
  TestComponentBuilder
]);
