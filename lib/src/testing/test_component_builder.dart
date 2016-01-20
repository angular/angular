library angular2.src.testing.test_component_builder;

import "package:angular2/core.dart"
    show
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
        Provider;
import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper;
import "package:angular2/src/core/linker/compiler.dart"
    show Compiler, Compiler_;
import "package:angular2/src/core/linker/view_listener.dart"
    show ViewFactoryProxy;
import "package:angular2/src/core/linker/view_ref.dart"
    show ViewRef_, HostViewFactoryRef_;
import "package:angular2/src/core/linker/view.dart" show AppView;
import "utils.dart" show el;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/debug/debug_element.dart" show DebugElement_;

/**
 * Fixture for debugging and testing a component.
 */
abstract class ComponentFixture {
  /**
   * The DebugElement associated with the root element of this component.
   */
  DebugElement debugElement;
  /**
   * The instance of the root component class.
   */
  dynamic componentInstance;
  /**
   * The native element at the root of the component.
   */
  dynamic nativeElement;
  /**
   * Trigger a change detection cycle for the component.
   */
  void detectChanges();
  /**
   * Trigger component destruction.
   */
  void destroy();
}

class ComponentFixture_ extends ComponentFixture {
  /** @internal */
  ComponentRef _componentRef;
  /** @internal */
  AppView _componentParentView;
  ComponentFixture_(ComponentRef componentRef) : super() {
    /* super call moved to initializer */;
    this._componentParentView =
        ((componentRef.hostView as ViewRef_)).internalView;
    this.debugElement =
        new DebugElement_(this._componentParentView.appElements[0]);
    this.componentInstance = this.debugElement.componentInstance;
    this.nativeElement = this.debugElement.nativeElement;
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

@Injectable()
class TestViewFactoryProxy implements ViewFactoryProxy {
  Map<Type, Function> _componentFactoryOverrides = new Map<Type, Function>();
  Function getComponentViewFactory(
      Type component, Function originalViewFactory) {
    var override = this._componentFactoryOverrides[component];
    return isPresent(override) ? override : originalViewFactory;
  }

  setComponentViewFactory(Type component, Function viewFactory) {
    this._componentFactoryOverrides[component] = viewFactory;
  }
}

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
  /** @internal */
  var _componentOverrides = new Map<Type, Type>();
  TestComponentBuilder(this._injector) {}
  /** @internal */
  TestComponentBuilder _clone() {
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
  TestComponentBuilder overrideComponent(Type componentType, Type mockType) {
    var clone = this._clone();
    clone._componentOverrides[componentType] = mockType;
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
    var originalCompTypes = [];
    var mockHostViewFactoryPromises = [];
    Compiler_ compiler = this._injector.get(Compiler);
    TestViewFactoryProxy viewFactoryProxy =
        this._injector.get(TestViewFactoryProxy);
    this._componentOverrides.forEach((originalCompType, mockCompType) {
      originalCompTypes.add(originalCompType);
      mockHostViewFactoryPromises.add(compiler.compileInHost(mockCompType));
    });
    return PromiseWrapper
        .all(mockHostViewFactoryPromises)
        .then((List<HostViewFactoryRef_> mockHostViewFactories) {
      for (var i = 0; i < mockHostViewFactories.length; i++) {
        var originalCompType = originalCompTypes[i];
        viewFactoryProxy.setComponentViewFactory(
            originalCompType,
            mockHostViewFactories[i]
                .internalHostViewFactory
                .componentViewFactory);
      }
      return this
          ._injector
          .get(DynamicComponentLoader)
          .loadAsRoot(rootComponentType, '''#${ rootElId}''', this._injector)
          .then((componentRef) {
        return new ComponentFixture_(componentRef);
      });
    });
  }
}

const TEST_COMPONENT_BUILDER_PROVIDERS = const [
  TestViewFactoryProxy,
  const Provider(ViewFactoryProxy, useExisting: TestViewFactoryProxy),
  TestComponentBuilder
];
