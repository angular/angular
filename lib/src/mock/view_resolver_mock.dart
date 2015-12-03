library angular2.src.mock.view_resolver_mock;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, ListWrapper;
import "package:angular2/src/facade/lang.dart"
    show Type, isPresent, stringify, isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "../core/metadata.dart" show ViewMetadata;
import "package:angular2/src/core/linker/view_resolver.dart" show ViewResolver;

@Injectable()
class MockViewResolver extends ViewResolver {
  /** @internal */
  var _views = new Map<Type, ViewMetadata>();
  /** @internal */
  var _inlineTemplates = new Map<Type, String>();
  /** @internal */
  var _viewCache = new Map<Type, ViewMetadata>();
  /** @internal */
  var _directiveOverrides = new Map<Type, Map<Type, Type>>();
  MockViewResolver() : super() {
    /* super call moved to initializer */;
  }
  /**
   * Overrides the [ViewMetadata] for a component.
   *
   * @param {Type} component
   * @param {ViewDefinition} view
   */
  void setView(Type component, ViewMetadata view) {
    this._checkOverrideable(component);
    this._views[component] = view;
  }

  /**
   * Overrides the inline template for a component - other configuration remains unchanged.
   *
   * @param {Type} component
   * @param {string} template
   */
  void setInlineTemplate(Type component, String template) {
    this._checkOverrideable(component);
    this._inlineTemplates[component] = template;
  }

  /**
   * Overrides a directive from the component [ViewMetadata].
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   */
  void overrideViewDirective(Type component, Type from, Type to) {
    this._checkOverrideable(component);
    var overrides = this._directiveOverrides[component];
    if (isBlank(overrides)) {
      overrides = new Map<Type, Type>();
      this._directiveOverrides[component] = overrides;
    }
    overrides[from] = to;
  }

  /**
   * Returns the [ViewMetadata] for a component:
   * - Set the [ViewMetadata] to the overridden view when it exists or fallback to the default
   * `ViewResolver`,
   *   see `setView`.
   * - Override the directives, see `overrideViewDirective`.
   * - Override the @View definition, see `setInlineTemplate`.
   *
   * @param component
   * @returns {ViewDefinition}
   */
  ViewMetadata resolve(Type component) {
    var view = this._viewCache[component];
    if (isPresent(view)) return view;
    view = this._views[component];
    if (isBlank(view)) {
      view = super.resolve(component);
    }
    var directives = view.directives;
    var overrides = this._directiveOverrides[component];
    if (isPresent(overrides) && isPresent(directives)) {
      directives = ListWrapper.clone(view.directives);
      overrides.forEach((from, to) {
        var srcIndex = directives.indexOf(from);
        if (srcIndex == -1) {
          throw new BaseException(
              '''Overriden directive ${ stringify ( from )} not found in the template of ${ stringify ( component )}''');
        }
        directives[srcIndex] = to;
      });
      view = new ViewMetadata(
          template: view.template,
          templateUrl: view.templateUrl,
          directives: directives);
    }
    var inlineTemplate = this._inlineTemplates[component];
    if (isPresent(inlineTemplate)) {
      view = new ViewMetadata(
          template: inlineTemplate,
          templateUrl: null,
          directives: view.directives);
    }
    this._viewCache[component] = view;
    return view;
  }

  /**
   * @internal
   *
   * Once a component has been compiled, the AppProtoView is stored in the compiler cache.
   *
   * Then it should not be possible to override the component configuration after the component
   * has been compiled.
   *
   * @param {Type} component
   */
  void _checkOverrideable(Type component) {
    var cached = this._viewCache[component];
    if (isPresent(cached)) {
      throw new BaseException(
          '''The component ${ stringify ( component )} has already been compiled, its configuration can not be changed''');
    }
  }
}
