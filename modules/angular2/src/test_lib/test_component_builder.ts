import {Injector, bind, Injectable} from 'angular2/di';

import {Type, isPresent, BaseException, isBlank} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {View} from 'angular2/src/core/annotations_impl/view';

import {ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {AppView} from 'angular2/src/core/compiler/view';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {
  DynamicComponentLoader,
  ComponentRef
} from 'angular2/src/core/compiler/dynamic_component_loader';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';

import {el} from './utils';

import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';

/**
 * @exportedAs angular2/test
 *
 * A TestElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying dom Element, as well as a way to query for children.
 */
export class TestElement {
  _elementInjector: ElementInjector;

  constructor(private _parentView: AppView, private _boundElementIndex: number) {
    this._elementInjector = this._parentView.elementInjectors[this._boundElementIndex];
  }

  static create(elementRef: ElementRef): TestElement {
    return new TestElement(internalView(elementRef.parentView), elementRef.boundElementIndex);
  }

  get componentInstance(): any {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.getComponent();
  }

  get dynamicallyCreatedComponentInstance(): any {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.getDynamicallyLoadedComponent();
  }

  get domElement(): any {
    return resolveInternalDomView(this._parentView.render).boundElements[this._boundElementIndex];
  }

  getDirectiveInstance(directiveIndex: number): any {
    return this._elementInjector.getDirectiveAtIndex(directiveIndex);
  }

  /**
   * Get child TestElements from within the Light DOM.
   *
   * @return {List<TestElement>}
   */
  get children(): List<TestElement> {
    var thisElementBinder = this._parentView.proto.elementBinders[this._boundElementIndex];

    return this._getChildElements(this._parentView, thisElementBinder.index);
  }

  /**
   * Get the root TestElement children of a component. Returns an empty
   * list if the current TestElement is not a component root.
   *
   * @return {List<TestElement>}
   */
  get componentViewChildren(): List<TestElement> {
    var shadowView = this._parentView.componentChildViews[this._boundElementIndex];

    if (!isPresent(shadowView)) {
      // The current test element is not a component.
      return ListWrapper.create();
    }

    return this._getChildElements(shadowView, null);
  }

  triggerEventHandler(eventName, eventObj): void {
    this._parentView.triggerEventHandlers(eventName, eventObj, this._boundElementIndex);
  }

  hasDirective(type: Type): boolean {
    if (!isPresent(this._elementInjector)) {
      return false;
    }
    return this._elementInjector.hasDirective(type);
  }

  inject(type: Type): any {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.get(type);
  }

  /**
   * Return the first descendant TestElememt matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {TestElement}
   */
  query(predicate: Function, scope = Scope.all): TestElement {
    var results = this.queryAll(predicate, scope);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Return descendant TestElememts matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {List<TestElement>}
   */
  queryAll(predicate: Function, scope = Scope.all): List<TestElement> {
    var elementsInScope = scope(this);

    return ListWrapper.filter(elementsInScope, predicate);
  }

  _getChildElements(view: AppView, parentBoundElementIndex: number): List<TestElement> {
    var els = ListWrapper.create();
    var parentElementBinder = null;
    if (isPresent(parentBoundElementIndex)) {
      parentElementBinder = view.proto.elementBinders[parentBoundElementIndex];
    }
    for (var i = 0; i < view.proto.elementBinders.length; ++i) {
      var binder = view.proto.elementBinders[i];
      if (binder.parent == parentElementBinder) {
        ListWrapper.push(els, new TestElement(view, i));

        var views = view.viewContainers[i];
        if (isPresent(views)) {
          ListWrapper.forEach(views.views, (nextView) => {
            els = ListWrapper.concat(els, this._getChildElements(nextView, null));
          });
        }
      }
    }
    return els;
  }
}

export function inspectElement(elementRef: ElementRef): TestElement {
  return TestElement.create(elementRef);
}

/**
 * @exportedAs angular2/test
 */
export class RootTestComponent extends TestElement {
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

/**
 * @exportedAs angular2/test
 */
export class Scope {
  static all(testElement): List<TestElement> {
    var scope = ListWrapper.create();
    ListWrapper.push(scope, testElement);

    ListWrapper.forEach(testElement.children,
                        (child) => { scope = ListWrapper.concat(scope, Scope.all(child)); });

    ListWrapper.forEach(testElement.componentViewChildren,
                        (child) => { scope = ListWrapper.concat(scope, Scope.all(child)); });

    return scope;
  }
  static light(testElement): List<TestElement> {
    var scope = ListWrapper.create();
    ListWrapper.forEach(testElement.children, (child) => {
      ListWrapper.push(scope, child);
      scope = ListWrapper.concat(scope, Scope.light(child));
    });
    return scope;
  }

  static view(testElement): List<TestElement> {
    var scope = ListWrapper.create();

    ListWrapper.forEach(testElement.componentViewChildren, (child) => {
      ListWrapper.push(scope, child);
      scope = ListWrapper.concat(scope, Scope.light(child));
    });
    return scope;
  }
}

/**
 * @exportedAs angular2/test
 */
export class By {
  static all(): Function { return (testElement) => true; }

  static css(selector: string): Function {
    return (testElement) => { return DOM.elementMatches(testElement.domElement, selector); };
  }
  static directive(type: Type): Function {
    return (testElement) => { return testElement.hasDirective(type); };
  }
}

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

    var rootEl = el('<div id="root"></div>');
    var doc = this._injector.get(DOCUMENT_TOKEN);

    // TODO(juliemr): can/should this be optional?
    DOM.appendChild(doc.body, rootEl);
    return this._injector.get(DynamicComponentLoader)
        .loadAsRoot(rootComponentType, '#root', this._injector)
        .then((componentRef) => { return new RootTestComponent(componentRef); });
  }
}
