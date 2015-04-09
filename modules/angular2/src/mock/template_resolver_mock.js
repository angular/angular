import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Type, isPresent, BaseException, stringify, isBlank} from 'angular2/src/facade/lang';

import {View} from 'angular2/src/core/annotations/view';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';

export class MockTemplateResolver extends TemplateResolver {
  _templates: Map<Type, View>;
  _inlineTemplates: Map<Type, string>;
  _templateCache: Map<Type, View>;
  _directiveOverrides: Map<Type, Type>;

  constructor() {
    super();
    this._templates = MapWrapper.create();
    this._inlineTemplates = MapWrapper.create();
    this._templateCache = MapWrapper.create();
    this._directiveOverrides = MapWrapper.create();
  }

  /**
   * Overrides the [View] for a component.
   *
   * @param {Type} component
   * @param {ViewDefinition} view
   */
  setView(component: Type, view: View): void {
    this._checkOverrideable(component);
    MapWrapper.set(this._templates, component, view);
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
   * Overrides a directive from the component [View].
   *
   * @param {Type} component
   * @param {Type} from
   * @param {Type} to
   */
  overrideTemplateDirective(component: Type, from: Type, to: Type): void {
    this._checkOverrideable(component);

    var overrides = MapWrapper.get(this._directiveOverrides, component);

    if (isBlank(overrides)) {
      overrides = MapWrapper.create();
      MapWrapper.set(this._directiveOverrides, component, overrides);
    }

    MapWrapper.set(overrides, from, to);
  }

  /**
   * Returns the [View] for a component:
   * - Set the [View] to the overridden template when it exists or fallback to the default
   *   [TemplateResolver], see [setView]
   * - Override the directives, see [overrideTemplateDirective]
   * - Override the @View definition, see [setInlineTemplate]
   *
   * @param component
   * @returns {ViewDefinition}
   */
  resolve(component: Type): View {
    var view = MapWrapper.get(this._templateCache, component);
    if (isPresent(view)) return view;

    view = MapWrapper.get(this._templates, component);
    if (isBlank(view)) {
      view = super.resolve(component);
    }

    var directives = view.directives;
    var overrides = MapWrapper.get(this._directiveOverrides, component);

    if (isPresent(overrides) && isPresent(directives)) {
      directives = ListWrapper.clone(view.directives);
      MapWrapper.forEach(overrides, (to, from) => {
        var srcIndex = directives.indexOf(from);
        if (srcIndex == -1) {
          throw new BaseException(`Overriden directive ${stringify(from)} not found in the template of ${stringify(component)}`);
        }
        directives[srcIndex] = to;
      });
      view = new View({
        template: view.template,
        templateUrl: view.templateUrl,
        directives: directives,
        formatters: view.formatters,
        source: view.source,
        locale: view.locale,
        device: view.device
      });
    }

    var inlineTemplate = MapWrapper.get(this._inlineTemplates, component);
    if (isPresent(inlineTemplate)) {
      view = new View({
        template: inlineTemplate,
        templateUrl: null,
        directives: view.directives,
        formatters: view.formatters,
        source: view.source,
        locale: view.locale,
        device: view.device
      });
    }

    MapWrapper.set(this._templateCache, component, view);
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
    var cached = MapWrapper.get(this._templateCache, component);

    if (isPresent(cached)) {
      throw new BaseException(`The component ${stringify(component)} has already been compiled, its configuration can not be changed`);
    }
  }
}
