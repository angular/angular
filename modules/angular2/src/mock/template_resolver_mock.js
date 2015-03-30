import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Type, isPresent, BaseException, stringify, isBlank} from 'angular2/src/facade/lang';

import {Template} from 'angular2/src/core/annotations/template';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';

export class MockTemplateResolver extends TemplateResolver {
  _templates: Map<Type, Template>;
  _inlineTemplates: Map<Type, string>;
  _templateCache: Map<Type, Template>;
  _directiveOverrides: Map<Type, Type>;

  constructor() {
    super();
    this._templates = MapWrapper.create();
    this._inlineTemplates = MapWrapper.create();
    this._templateCache = MapWrapper.create();
    this._directiveOverrides = MapWrapper.create();
  }

  /**
   * Overrides the [Template] for a component.
   *
   * @param {Type} component
   * @param {Template} template
   */
  setTemplate(component: Type, template: Template): void {
    this._checkOverrideable(component);
    MapWrapper.set(this._templates, component, template);
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
   * Overrides a directive from the component [Template].
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
   * Returns the [Template] for a component:
   * - Set the [Template] to the overridden template when it exists or fallback to the default
   *   [TemplateResolver], see [setTemplate]
   * - Override the directives, see [overrideTemplateDirective]
   * - Override the template definition, see [setInlineTemplate]
   *
   * @param component
   * @returns {Template}
   */
  resolve(component: Type): Template {
    var template = MapWrapper.get(this._templateCache, component);
    if (isPresent(template)) return template;

    template = MapWrapper.get(this._templates, component);
    if (isBlank(template)) {
      template = super.resolve(component);
    }

    var directives = template.directives;
    var overrides = MapWrapper.get(this._directiveOverrides, component);

    if (isPresent(overrides) && isPresent(directives)) {
      directives = ListWrapper.clone(template.directives);
      MapWrapper.forEach(overrides, (to, from) => {
        var srcIndex = directives.indexOf(from);
        if (srcIndex == -1) {
          throw new BaseException(`Overriden directive ${stringify(from)} not found in the template of ${stringify(component)}`);
        }
        directives[srcIndex] = to;
      });
      template = new Template({
        inline: template.inline,
        url: template.url,
        directives: directives,
        formatters: template.formatters,
        source: template.source,
        locale: template.locale,
        device: template.device,
      });
    }

    var inlineTemplate = MapWrapper.get(this._inlineTemplates, component);
    if (isPresent(inlineTemplate)) {
      template = new Template({
        inline: inlineTemplate,
        url: null,
        directives: template.directives,
        formatters: template.formatters,
        source: template.source,
        locale: template.locale,
        device: template.device,
      });
    }

    MapWrapper.set(this._templateCache, component, template);
    return template;
  }

  /**
   * Once a component has been compiled, the ProtoView is stored in the compiler cache.
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
