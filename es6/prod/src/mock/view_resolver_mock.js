import { Map, ListWrapper } from 'angular2/src/facade/collection';
import { isPresent, stringify, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ViewMetadata } from '../core/metadata';
import { ViewResolver } from 'angular2/src/core/linker/view_resolver';
export class MockViewResolver extends ViewResolver {
    constructor() {
        super();
        /** @internal */
        this._views = new Map();
        /** @internal */
        this._inlineTemplates = new Map();
        /** @internal */
        this._viewCache = new Map();
        /** @internal */
        this._directiveOverrides = new Map();
    }
    /**
     * Overrides the {@link ViewMetadata} for a component.
     *
     * @param {Type} component
     * @param {ViewDefinition} view
     */
    setView(component, view) {
        this._checkOverrideable(component);
        this._views.set(component, view);
    }
    /**
     * Overrides the inline template for a component - other configuration remains unchanged.
     *
     * @param {Type} component
     * @param {string} template
     */
    setInlineTemplate(component, template) {
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
    overrideViewDirective(component, from, to) {
        this._checkOverrideable(component);
        var overrides = this._directiveOverrides.get(component);
        if (isBlank(overrides)) {
            overrides = new Map();
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
    resolve(component) {
        var view = this._viewCache.get(component);
        if (isPresent(view))
            return view;
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
                    throw new BaseException(`Overriden directive ${stringify(from)} not found in the template of ${stringify(component)}`);
                }
                directives[srcIndex] = to;
            });
            view = new ViewMetadata({ template: view.template, templateUrl: view.templateUrl, directives: directives });
        }
        var inlineTemplate = this._inlineTemplates.get(component);
        if (isPresent(inlineTemplate)) {
            view = new ViewMetadata({ template: inlineTemplate, templateUrl: null, directives: view.directives });
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
    _checkOverrideable(component) {
        var cached = this._viewCache.get(component);
        if (isPresent(cached)) {
            throw new BaseException(`The component ${stringify(component)} has already been compiled, its configuration can not be changed`);
        }
    }
}
//# sourceMappingURL=view_resolver_mock.js.map