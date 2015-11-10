library angular2.src.testing.test_component_builder;

import "package:angular2/src/core/di.dart" show Injector, provide, Injectable;
import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/async.dart" show Future;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper;
import "../core/metadata.dart" show ViewMetadata;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/src/core/linker/view_resolver.dart" show ViewResolver;
import "package:angular2/src/core/linker/view.dart" show AppView;
import "package:angular2/src/core/linker/view_ref.dart"
    show internalView, ViewRef;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show DynamicComponentLoader, ComponentRef;
import "utils.dart" show el;
import "package:angular2/src/core/render/render.dart" show DOCUMENT;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/debug/debug_element.dart"
    show DebugElement, DebugElement_;

/**
 * @deprecated Use ComponentFixture
 */
abstract class RootTestComponent {
  DebugElement debugElement;
  void detectChanges();
  void destroy();
}

abstract class ComponentFixture extends RootTestComponent {}

class ComponentFixture_ extends ComponentFixture {
  /** @internal */
  ComponentRef _componentRef;
  /** @internal */
  AppView _componentParentView;
  ComponentFixture_(ComponentRef componentRef) : super() {
    /* super call moved to initializer */;
    this.debugElement =
        new DebugElement_(internalView((componentRef.hostView as ViewRef)), 0);
    this._componentParentView =
        internalView((componentRef.hostView as ViewRef));
    this._componentRef = componentRef;
  }
  void detectChanges() {
    this._componentParentView.changeDetector.detectChanges();
    this._componentParentView.changeDetector.checkNoChanges();
  }

  void destroy() {
    this._componentRef.dispose();
  }
}

var _nextRootElementId = 0;

/**
 * Builds a ComponentFixture for use in component level tests.
 */
@Injectable()
class TestComponentBuilder {
  Injector _injector;
  /** @internal */
  var _bindingsOverrides = new Map<Type, List<dynamic>>();
  /** @internal */
  var _directiveOverrides = new Map<Type, Map<Type, Type>>();
  /** @internal */
  var _templateOverrides = new Map<Type, String>();
  /** @internal */
  var _viewBindingsOverrides = new Map<Type, List<dynamic>>();
  /** @internal */
  var _viewOverrides = new Map<Type, ViewMetadata>();
  TestComponentBuilder(this._injector) {}
  /** @internal */
  TestComponentBuilder _clone() {
    var clone = new TestComponentBuilder(this._injector);
    clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
    clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
    clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
    return clone;
  }

  /**
   * Overrides only the html of a [ComponentMetadata].
   * All the other properties of the component's [ViewMetadata] are preserved.
   *
   * @param {Type} component
   * @param {string} html
   *
   * @return {TestComponentBuilder}
   */
  TestComponentBuilder overrideTemplate(Type componentType, String template) {
    var clone = this._clone();
    clone._templateOverrides[componentType] = template;
    return clone;
  }

  /**
   * Overrides a component's [ViewMetadata].
   *
   * @param {Type} component
   * @param {view} View
   *
   * @return {TestComponentBuilder}
   */
  TestComponentBuilder overrideView(Type componentType, ViewMetadata view) {
    var clone = this._clone();
    clone._viewOverrides[componentType] = view;
    return clone;
  }

  /**
   * Overrides the directives from the component [ViewMetadata].
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   *
   * @return {TestComponentBuilder}
   */
  TestComponentBuilder overrideDirective(
      Type componentType, Type from, Type to) {
    var clone = this._clone();
    var overridesForComponent = clone._directiveOverrides[componentType];
    if (!isPresent(overridesForComponent)) {
      clone._directiveOverrides[componentType] = new Map<Type, Type>();
      overridesForComponent = clone._directiveOverrides[componentType];
    }
    overridesForComponent[from] = to;
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
  TestComponentBuilder overrideProviders(Type type, List<dynamic> providers) {
    var clone = this._clone();
    clone._bindingsOverrides[type] = providers;
    return clone;
  }

  /**
   * @deprecated
   */
  TestComponentBuilder overrideBindings(Type type, List<dynamic> providers) {
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
  TestComponentBuilder overrideViewProviders(
      Type type, List<dynamic> providers) {
    var clone = this._clone();
    clone._viewBindingsOverrides[type] = providers;
    return clone;
  }

  /**
   * @deprecated
   */
  TestComponentBuilder overrideViewBindings(
      Type type, List<dynamic> providers) {
    return this.overrideViewProviders(type, providers);
  }

  /**
   * Builds and returns a ComponentFixture.
   *
   * @return {Promise<ComponentFixture>}
   */
  Future<ComponentFixture> createAsync(Type rootComponentType) {
    var mockDirectiveResolver = this._injector.get(DirectiveResolver);
    var mockViewResolver = this._injector.get(ViewResolver);
    this
        ._viewOverrides
        .forEach((type, view) => mockViewResolver.setView(type, view));
    this._templateOverrides.forEach(
        (type, template) => mockViewResolver.setInlineTemplate(type, template));
    this._directiveOverrides.forEach((component, overrides) {
      overrides.forEach((from, to) {
        mockViewResolver.overrideViewDirective(component, from, to);
      });
    });
    this._bindingsOverrides.forEach((type, bindings) =>
        mockDirectiveResolver.setBindingsOverride(type, bindings));
    this._viewBindingsOverrides.forEach((type, bindings) =>
        mockDirectiveResolver.setViewBindingsOverride(type, bindings));
    var rootElId = '''root${ _nextRootElementId ++}''';
    var rootEl = el('''<div id="${ rootElId}"></div>''');
    var doc = this._injector.get(DOCUMENT);
    // TODO(juliemr): can/should this be optional?
    var oldRoots = DOM.querySelectorAll(doc, "[id^=root]");
    for (var i = 0; i < oldRoots.length; i++) {
      DOM.remove(oldRoots[i]);
    }
    DOM.appendChild(doc.body, rootEl);
    return this
        ._injector
        .get(DynamicComponentLoader)
        .loadAsRoot(rootComponentType, '''#${ rootElId}''', this._injector)
        .then((componentRef) {
      return new ComponentFixture_(componentRef);
    });
  }
}
