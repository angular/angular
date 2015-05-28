import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Type, isPresent, BaseException, stringify, isBlank} from 'angular2/src/facade/lang';

import {View} from 'angular2/src/core/annotations_impl/view';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';


export class MockTemplateResolver extends TemplateResolver {
  _views: Map<Type, View>;
  _inlineTemplates: Map<Type, string>;
  _viewCache: Map<Type, View>;
  _directiveOverrides: Map<Type, Map<Type, Type>>;

  constructor() {
    super();
    this._views = MapWrapper.create();
    this._inlineTemplates = MapWrapper.create();
    this._viewCache = MapWrapper.create();
    this._directiveOverrides = MapWrapper.create();
  }

  /**
   * Overrides the {@link View} for a component.
   *
   * @param {Type} component
   * @param {ViewDefinition} view
   */
  setView(component: Type, view: View): void {
    this._checkOverrideable(component);
    MapWrapper.set(this._views, component, view);
  }

  /**
   * Overrides the inline template for a component - other configuration remains unchanged.
   *
   * @param {Type} component
   * @param {string} template
   */
  setInlineTemplate(component: Type, template: string): void {
    this._checkOverrideable(component);
    MapWrapper.set(this._inlineTemplates, component, template);
  }

  /**
   * Overrides a directive from the component {@link View}.
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   */
  overrideViewDirective(component: Type, from: Type, to: Type): void {
    this._checkOverrideable(component);

    var overrides = MapWrapper.get(this._directiveOverrides, component);

    if (isBlank(overrides)) {
      overrides = MapWrapper.create();
      MapWrapper.set(this._directiveOverrides, component, overrides);
    }

    MapWrapper.set(overrides, from, to);
  }

  /**
   * Returns the {@link View} for a component:
   * - Set the {@link View} to the overridden view when it exists or fallback to the default
   * `TemplateResolver`,
   *   see `setView`.
   * - Override the directives, see `overrideViewDirective`.
   * - Override the @View definition, see `setInlineTemplate`.
   *
   * @param component
   * @returns {ViewDefinition}
   */
  resolve(component: Type): View {
    var view = MapWrapper.get(this._viewCache, component);
    if (isPresent(view)) return view;

    view = MapWrapper.get(this._views, component);
    if (isBlank(view)) {
      view = super.resolve(component);
    }
    if (isBlank(view)) {
      // dynamic components
      return null;
    }

    var directives = view.directives;
    var overrides = MapWrapper.get(this._directiveOverrides, component);

    if (isPresent(overrides) && isPresent(directives)) {
      directives = ListWrapper.clone(view.directives);
      MapWrapper.forEach(overrides, (to, from) => {
        var srcIndex = directives.indexOf(from);
        if (srcIndex == -1) {
          throw new BaseException(
              `Overriden directive ${stringify(from)} not found in the template of ${stringify(component)}`);
        }
        directives[srcIndex] = to;
      });
      view = new View(
          {template: view.template, templateUrl: view.templateUrl, directives: directives});
    }

    var inlineTemplate = MapWrapper.get(this._inlineTemplates, component);
    if (isPresent(inlineTemplate)) {
      view = new View({template: inlineTemplate, templateUrl: null, directives: view.directives});
    }

    MapWrapper.set(this._viewCache, component, view);
    return view;
  }

  /**
   * Once a component has been compiled, the AppProtoView is stored in the compiler cache.
   *
   * Then it should not be possible to override the component configuration after the component
   * has been compiled.
   *
   * @param {Type} component
   */
  _checkOverrideable(component: Type): void {
    var cached = MapWrapper.get(this._viewCache, component);

    if (isPresent(cached)) {
      throw new BaseException(
          `The component ${stringify(component)} has already been compiled, its configuration can not be changed`);
    }
  }
}
