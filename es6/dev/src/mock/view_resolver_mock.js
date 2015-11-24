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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZXNvbHZlcl9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svdmlld19yZXNvbHZlcl9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tWaWV3UmVzb2x2ZXIiLCJNb2NrVmlld1Jlc29sdmVyLmNvbnN0cnVjdG9yIiwiTW9ja1ZpZXdSZXNvbHZlci5zZXRWaWV3IiwiTW9ja1ZpZXdSZXNvbHZlci5zZXRJbmxpbmVUZW1wbGF0ZSIsIk1vY2tWaWV3UmVzb2x2ZXIub3ZlcnJpZGVWaWV3RGlyZWN0aXZlIiwiTW9ja1ZpZXdSZXNvbHZlci5yZXNvbHZlIiwiTW9ja1ZpZXdSZXNvbHZlci5fY2hlY2tPdmVycmlkZWFibGUiXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsR0FBRyxFQUFjLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUFPLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3JFLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUV2RSxFQUFDLFlBQVksRUFBQyxNQUFNLGtCQUFrQjtPQUN0QyxFQUFDLFlBQVksRUFBQyxNQUFNLHdDQUF3QztBQUVuRSxzQ0FBc0MsWUFBWTtJQVVoREE7UUFBZ0JDLE9BQU9BLENBQUNBO1FBVHhCQSxnQkFBZ0JBO1FBQ2hCQSxXQUFNQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFzQkEsQ0FBQ0E7UUFDdkNBLGdCQUFnQkE7UUFDaEJBLHFCQUFnQkEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBZ0JBLENBQUNBO1FBQzNDQSxnQkFBZ0JBO1FBQ2hCQSxlQUFVQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFzQkEsQ0FBQ0E7UUFDM0NBLGdCQUFnQkE7UUFDaEJBLHdCQUFtQkEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBeUJBLENBQUNBO0lBRTlCQSxDQUFDQTtJQUUxQkQ7Ozs7O09BS0dBO0lBQ0hBLE9BQU9BLENBQUNBLFNBQWVBLEVBQUVBLElBQWtC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TUEsSUFBSUEsYUFBYUEsQ0FDbkJBLGlCQUFpQkEsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0Esa0VBQWtFQSxDQUFDQSxDQUFDQTtRQUMvR0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSE4sQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBzdHJpbmdpZnksIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmltcG9ydCB7Vmlld01ldGFkYXRhfSBmcm9tICcuLi9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7Vmlld1Jlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZXNvbHZlcic7XG5cbmV4cG9ydCBjbGFzcyBNb2NrVmlld1Jlc29sdmVyIGV4dGVuZHMgVmlld1Jlc29sdmVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld3MgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5saW5lVGVtcGxhdGVzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdDYWNoZSA9IG5ldyBNYXA8VHlwZSwgVmlld01ldGFkYXRhPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXJlY3RpdmVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIE1hcDxUeXBlLCBUeXBlPj4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIHtAbGluayBWaWV3TWV0YWRhdGF9IGZvciBhIGNvbXBvbmVudC5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtWaWV3RGVmaW5pdGlvbn0gdmlld1xuICAgKi9cbiAgc2V0Vmlldyhjb21wb25lbnQ6IFR5cGUsIHZpZXc6IFZpZXdNZXRhZGF0YSk6IHZvaWQge1xuICAgIHRoaXMuX2NoZWNrT3ZlcnJpZGVhYmxlKGNvbXBvbmVudCk7XG4gICAgdGhpcy5fdmlld3Muc2V0KGNvbXBvbmVudCwgdmlldyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBpbmxpbmUgdGVtcGxhdGUgZm9yIGEgY29tcG9uZW50IC0gb3RoZXIgY29uZmlndXJhdGlvbiByZW1haW5zIHVuY2hhbmdlZC5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlXG4gICAqL1xuICBzZXRJbmxpbmVUZW1wbGF0ZShjb21wb25lbnQ6IFR5cGUsIHRlbXBsYXRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGVja092ZXJyaWRlYWJsZShjb21wb25lbnQpO1xuICAgIHRoaXMuX2lubGluZVRlbXBsYXRlcy5zZXQoY29tcG9uZW50LCB0ZW1wbGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIGEgZGlyZWN0aXZlIGZyb20gdGhlIGNvbXBvbmVudCB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtUeXBlfSBmcm9tXG4gICAqIEBwYXJhbSB7VHlwZX0gdG9cbiAgICovXG4gIG92ZXJyaWRlVmlld0RpcmVjdGl2ZShjb21wb25lbnQ6IFR5cGUsIGZyb206IFR5cGUsIHRvOiBUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5fY2hlY2tPdmVycmlkZWFibGUoY29tcG9uZW50KTtcblxuICAgIHZhciBvdmVycmlkZXMgPSB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudCk7XG5cbiAgICBpZiAoaXNCbGFuayhvdmVycmlkZXMpKSB7XG4gICAgICBvdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIFR5cGU+KCk7XG4gICAgICB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuc2V0KGNvbXBvbmVudCwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZXMuc2V0KGZyb20sIHRvKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgVmlld01ldGFkYXRhfSBmb3IgYSBjb21wb25lbnQ6XG4gICAqIC0gU2V0IHRoZSB7QGxpbmsgVmlld01ldGFkYXRhfSB0byB0aGUgb3ZlcnJpZGRlbiB2aWV3IHdoZW4gaXQgZXhpc3RzIG9yIGZhbGxiYWNrIHRvIHRoZSBkZWZhdWx0XG4gICAqIGBWaWV3UmVzb2x2ZXJgLFxuICAgKiAgIHNlZSBgc2V0Vmlld2AuXG4gICAqIC0gT3ZlcnJpZGUgdGhlIGRpcmVjdGl2ZXMsIHNlZSBgb3ZlcnJpZGVWaWV3RGlyZWN0aXZlYC5cbiAgICogLSBPdmVycmlkZSB0aGUgQFZpZXcgZGVmaW5pdGlvbiwgc2VlIGBzZXRJbmxpbmVUZW1wbGF0ZWAuXG4gICAqXG4gICAqIEBwYXJhbSBjb21wb25lbnRcbiAgICogQHJldHVybnMge1ZpZXdEZWZpbml0aW9ufVxuICAgKi9cbiAgcmVzb2x2ZShjb21wb25lbnQ6IFR5cGUpOiBWaWV3TWV0YWRhdGEge1xuICAgIHZhciB2aWV3ID0gdGhpcy5fdmlld0NhY2hlLmdldChjb21wb25lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQodmlldykpIHJldHVybiB2aWV3O1xuXG4gICAgdmlldyA9IHRoaXMuX3ZpZXdzLmdldChjb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKHZpZXcpKSB7XG4gICAgICB2aWV3ID0gc3VwZXIucmVzb2x2ZShjb21wb25lbnQpO1xuICAgIH1cblxuICAgIHZhciBkaXJlY3RpdmVzID0gdmlldy5kaXJlY3RpdmVzO1xuICAgIHZhciBvdmVycmlkZXMgPSB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudCk7XG5cbiAgICBpZiAoaXNQcmVzZW50KG92ZXJyaWRlcykgJiYgaXNQcmVzZW50KGRpcmVjdGl2ZXMpKSB7XG4gICAgICBkaXJlY3RpdmVzID0gTGlzdFdyYXBwZXIuY2xvbmUodmlldy5kaXJlY3RpdmVzKTtcbiAgICAgIG92ZXJyaWRlcy5mb3JFYWNoKCh0bywgZnJvbSkgPT4ge1xuICAgICAgICB2YXIgc3JjSW5kZXggPSBkaXJlY3RpdmVzLmluZGV4T2YoZnJvbSk7XG4gICAgICAgIGlmIChzcmNJbmRleCA9PSAtMSkge1xuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICBgT3ZlcnJpZGVuIGRpcmVjdGl2ZSAke3N0cmluZ2lmeShmcm9tKX0gbm90IGZvdW5kIGluIHRoZSB0ZW1wbGF0ZSBvZiAke3N0cmluZ2lmeShjb21wb25lbnQpfWApO1xuICAgICAgICB9XG4gICAgICAgIGRpcmVjdGl2ZXNbc3JjSW5kZXhdID0gdG87XG4gICAgICB9KTtcbiAgICAgIHZpZXcgPSBuZXcgVmlld01ldGFkYXRhKFxuICAgICAgICAgIHt0ZW1wbGF0ZTogdmlldy50ZW1wbGF0ZSwgdGVtcGxhdGVVcmw6IHZpZXcudGVtcGxhdGVVcmwsIGRpcmVjdGl2ZXM6IGRpcmVjdGl2ZXN9KTtcbiAgICB9XG5cbiAgICB2YXIgaW5saW5lVGVtcGxhdGUgPSB0aGlzLl9pbmxpbmVUZW1wbGF0ZXMuZ2V0KGNvbXBvbmVudCk7XG4gICAgaWYgKGlzUHJlc2VudChpbmxpbmVUZW1wbGF0ZSkpIHtcbiAgICAgIHZpZXcgPSBuZXcgVmlld01ldGFkYXRhKFxuICAgICAgICAgIHt0ZW1wbGF0ZTogaW5saW5lVGVtcGxhdGUsIHRlbXBsYXRlVXJsOiBudWxsLCBkaXJlY3RpdmVzOiB2aWV3LmRpcmVjdGl2ZXN9KTtcbiAgICB9XG5cbiAgICB0aGlzLl92aWV3Q2FjaGUuc2V0KGNvbXBvbmVudCwgdmlldyk7XG4gICAgcmV0dXJuIHZpZXc7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIE9uY2UgYSBjb21wb25lbnQgaGFzIGJlZW4gY29tcGlsZWQsIHRoZSBBcHBQcm90b1ZpZXcgaXMgc3RvcmVkIGluIHRoZSBjb21waWxlciBjYWNoZS5cbiAgICpcbiAgICogVGhlbiBpdCBzaG91bGQgbm90IGJlIHBvc3NpYmxlIHRvIG92ZXJyaWRlIHRoZSBjb21wb25lbnQgY29uZmlndXJhdGlvbiBhZnRlciB0aGUgY29tcG9uZW50XG4gICAqIGhhcyBiZWVuIGNvbXBpbGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKi9cbiAgX2NoZWNrT3ZlcnJpZGVhYmxlKGNvbXBvbmVudDogVHlwZSk6IHZvaWQge1xuICAgIHZhciBjYWNoZWQgPSB0aGlzLl92aWV3Q2FjaGUuZ2V0KGNvbXBvbmVudCk7XG5cbiAgICBpZiAoaXNQcmVzZW50KGNhY2hlZCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUaGUgY29tcG9uZW50ICR7c3RyaW5naWZ5KGNvbXBvbmVudCl9IGhhcyBhbHJlYWR5IGJlZW4gY29tcGlsZWQsIGl0cyBjb25maWd1cmF0aW9uIGNhbiBub3QgYmUgY2hhbmdlZGApO1xuICAgIH1cbiAgfVxufVxuIl19