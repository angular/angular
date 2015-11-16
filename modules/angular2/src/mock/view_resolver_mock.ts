import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Type, isPresent, stringify, isBlank} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';

import {ViewMetadata} from '../core/metadata';
import {ViewResolver} from 'angular2/src/core/linker/view_resolver';

export class MockViewResolver extends ViewResolver {
  /** @internal */
  _views = new Map<Type, ViewMetadata>();
  /** @internal */
  _inlineTemplates = new Map<Type, string>();
  /** @internal */
  _viewCache = new Map<Type, ViewMetadata>();
  /** @internal */
  _directiveOverrides = new Map<Type, Map<Type, Type>>();

  constructor() { super(); }

  /**
   * Overrides the {@link ViewMetadata} for a component.
   *
   * @param {Type} component
   * @param {ViewDefinition} view
   */
  setView(component: Type, view: ViewMetadata): void {
    this._checkOverrideable(component);
    this._views.set(component, view);
  }

  /**
   * Overrides the inline template for a component - other configuration remains unchanged.
   *
   * @param {Type} component
   * @param {string} template
   */
  setInlineTemplate(component: Type, template: string): void {
    this._checkOverrideable(component);
    this._inlineTemplates.set(component, template);
  }

  /**
   * Overrides a directive from the component {@link ViewMetadata}.
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   */
  overrideViewDirective(component: Type, from: Type, to: Type): void {
    this._checkOverrideable(component);

    var overrides = this._directiveOverrides.get(component);

    if (isBlank(overrides)) {
      overrides = new Map<Type, Type>();
      this._directiveOverrides.set(component, overrides);
    }

    overrides.set(from, to);
  }

  /**
   * Returns the {@link ViewMetadata} for a component:
   * - Set the {@link ViewMetadata} to the overridden view when it exists or fallback to the default
   * `ViewResolver`,
   *   see `setView`.
   * - Override the directives, see `overrideViewDirective`.
   * - Override the @View definition, see `setInlineTemplate`.
   *
   * @param component
   * @returns {ViewDefinition}
   */
  resolve(component: Type): ViewMetadata {
    var view = this._viewCache.get(component);
    if (isPresent(view)) return view;

    view = this._views.get(component);
    if (isBlank(view)) {
      view = super.resolve(component);
    }

    var directives = view.directives;
    var overrides = this._directiveOverrides.get(component);

    if (isPresent(overrides) && isPresent(directives)) {
      directives = ListWrapper.clone(view.directives);
      overrides.forEach((to, from) => {
        var srcIndex = directives.indexOf(from);
        if (srcIndex == -1) {
          throw new BaseException(
              `Overriden directive ${stringify(from)} not found in the template of ${stringify(component)}`);
        }
        directives[srcIndex] = to;
      });
      view = new ViewMetadata(
          {template: view.template, templateUrl: view.templateUrl, directives: directives});
    }

    var inlineTemplate = this._inlineTemplates.get(component);
    if (isPresent(inlineTemplate)) {
      view = new ViewMetadata(
          {template: inlineTemplate, templateUrl: null, directives: view.directives});
    }

    this._viewCache.set(component, view);
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
  _checkOverrideable(component: Type): void {
    var cached = this._viewCache.get(component);

    if (isPresent(cached)) {
      throw new BaseException(
          `The component ${stringify(component)} has already been compiled, its configuration can not be changed`);
    }
  }
}
