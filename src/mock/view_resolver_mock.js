'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var metadata_1 = require('../core/metadata');
var view_resolver_1 = require('angular2/src/core/linker/view_resolver');
var MockViewResolver = (function (_super) {
    __extends(MockViewResolver, _super);
    function MockViewResolver() {
        _super.call(this);
        /** @internal */
        this._views = new collection_1.Map();
        /** @internal */
        this._inlineTemplates = new collection_1.Map();
        /** @internal */
        this._viewCache = new collection_1.Map();
        /** @internal */
        this._directiveOverrides = new collection_1.Map();
    }
    /**
     * Overrides the {@link ViewMetadata} for a component.
     *
     * @param {Type} component
     * @param {ViewDefinition} view
     */
    MockViewResolver.prototype.setView = function (component, view) {
        this._checkOverrideable(component);
        this._views.set(component, view);
    };
    /**
     * Overrides the inline template for a component - other configuration remains unchanged.
     *
     * @param {Type} component
     * @param {string} template
     */
    MockViewResolver.prototype.setInlineTemplate = function (component, template) {
        this._checkOverrideable(component);
        this._inlineTemplates.set(component, template);
    };
    /**
     * Overrides a directive from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     */
    MockViewResolver.prototype.overrideViewDirective = function (component, from, to) {
        this._checkOverrideable(component);
        var overrides = this._directiveOverrides.get(component);
        if (lang_1.isBlank(overrides)) {
            overrides = new collection_1.Map();
            this._directiveOverrides.set(component, overrides);
        }
        overrides.set(from, to);
    };
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
    MockViewResolver.prototype.resolve = function (component) {
        var view = this._viewCache.get(component);
        if (lang_1.isPresent(view))
            return view;
        view = this._views.get(component);
        if (lang_1.isBlank(view)) {
            view = _super.prototype.resolve.call(this, component);
        }
        var directives = view.directives;
        var overrides = this._directiveOverrides.get(component);
        if (lang_1.isPresent(overrides) && lang_1.isPresent(directives)) {
            directives = collection_1.ListWrapper.clone(view.directives);
            overrides.forEach(function (to, from) {
                var srcIndex = directives.indexOf(from);
                if (srcIndex == -1) {
                    throw new exceptions_1.BaseException("Overriden directive " + lang_1.stringify(from) + " not found in the template of " + lang_1.stringify(component));
                }
                directives[srcIndex] = to;
            });
            view = new metadata_1.ViewMetadata({ template: view.template, templateUrl: view.templateUrl, directives: directives });
        }
        var inlineTemplate = this._inlineTemplates.get(component);
        if (lang_1.isPresent(inlineTemplate)) {
            view = new metadata_1.ViewMetadata({ template: inlineTemplate, templateUrl: null, directives: view.directives });
        }
        this._viewCache.set(component, view);
        return view;
    };
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
    MockViewResolver.prototype._checkOverrideable = function (component) {
        var cached = this._viewCache.get(component);
        if (lang_1.isPresent(cached)) {
            throw new exceptions_1.BaseException("The component " + lang_1.stringify(component) + " has already been compiled, its configuration can not be changed");
        }
    };
    MockViewResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockViewResolver);
    return MockViewResolver;
})(view_resolver_1.ViewResolver);
exports.MockViewResolver = MockViewResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZXNvbHZlcl9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svdmlld19yZXNvbHZlcl9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tWaWV3UmVzb2x2ZXIiLCJNb2NrVmlld1Jlc29sdmVyLmNvbnN0cnVjdG9yIiwiTW9ja1ZpZXdSZXNvbHZlci5zZXRWaWV3IiwiTW9ja1ZpZXdSZXNvbHZlci5zZXRJbmxpbmVUZW1wbGF0ZSIsIk1vY2tWaWV3UmVzb2x2ZXIub3ZlcnJpZGVWaWV3RGlyZWN0aXZlIiwiTW9ja1ZpZXdSZXNvbHZlci5yZXNvbHZlIiwiTW9ja1ZpZXdSZXNvbHZlci5fY2hlY2tPdmVycmlkZWFibGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSxxQkFBa0QsMEJBQTBCLENBQUMsQ0FBQTtBQUM3RSwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRSx5QkFBMkIsa0JBQWtCLENBQUMsQ0FBQTtBQUM5Qyw4QkFBMkIsd0NBQXdDLENBQUMsQ0FBQTtBQUVwRTtJQUNzQ0Esb0NBQVlBO0lBVWhEQTtRQUFnQkMsaUJBQU9BLENBQUNBO1FBVHhCQSxnQkFBZ0JBO1FBQ2hCQSxXQUFNQSxHQUFHQSxJQUFJQSxnQkFBR0EsRUFBc0JBLENBQUNBO1FBQ3ZDQSxnQkFBZ0JBO1FBQ2hCQSxxQkFBZ0JBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFnQkEsQ0FBQ0E7UUFDM0NBLGdCQUFnQkE7UUFDaEJBLGVBQVVBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFzQkEsQ0FBQ0E7UUFDM0NBLGdCQUFnQkE7UUFDaEJBLHdCQUFtQkEsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQXlCQSxDQUFDQTtJQUU5QkEsQ0FBQ0E7SUFFMUJEOzs7OztPQUtHQTtJQUNIQSxrQ0FBT0EsR0FBUEEsVUFBUUEsU0FB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QkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsbUJBQWlCQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EscUVBQWtFQSxDQUFDQSxDQUFDQTtRQUMvR0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUF2SEhOO1FBQUNBLGVBQVVBLEVBQUVBOzt5QkF3SFpBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQXhIRCxFQUNzQyw0QkFBWSxFQXVIakQ7QUF2SFksd0JBQWdCLG1CQXVINUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIHN0cmluZ2lmeSwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtWaWV3TWV0YWRhdGF9IGZyb20gJy4uL2NvcmUvbWV0YWRhdGEnO1xuaW1wb3J0IHtWaWV3UmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3Jlc29sdmVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tWaWV3UmVzb2x2ZXIgZXh0ZW5kcyBWaWV3UmVzb2x2ZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3cyA9IG5ldyBNYXA8VHlwZSwgVmlld01ldGFkYXRhPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9pbmxpbmVUZW1wbGF0ZXMgPSBuZXcgTWFwPFR5cGUsIHN0cmluZz4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld0NhY2hlID0gbmV3IE1hcDxUeXBlLCBWaWV3TWV0YWRhdGE+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgTWFwPFR5cGUsIFR5cGU+PigpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUge0BsaW5rIFZpZXdNZXRhZGF0YX0gZm9yIGEgY29tcG9uZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1ZpZXdEZWZpbml0aW9ufSB2aWV3XG4gICAqL1xuICBzZXRWaWV3KGNvbXBvbmVudDogVHlwZSwgdmlldzogVmlld01ldGFkYXRhKTogdm9pZCB7XG4gICAgdGhpcy5fY2hlY2tPdmVycmlkZWFibGUoY29tcG9uZW50KTtcbiAgICB0aGlzLl92aWV3cy5zZXQoY29tcG9uZW50LCB2aWV3KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGlubGluZSB0ZW1wbGF0ZSBmb3IgYSBjb21wb25lbnQgLSBvdGhlciBjb25maWd1cmF0aW9uIHJlbWFpbnMgdW5jaGFuZ2VkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGVtcGxhdGVcbiAgICovXG4gIHNldElubGluZVRlbXBsYXRlKGNvbXBvbmVudDogVHlwZSwgdGVtcGxhdGU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NoZWNrT3ZlcnJpZGVhYmxlKGNvbXBvbmVudCk7XG4gICAgdGhpcy5faW5saW5lVGVtcGxhdGVzLnNldChjb21wb25lbnQsIHRlbXBsYXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgYSBkaXJlY3RpdmUgZnJvbSB0aGUgY29tcG9uZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1R5cGV9IGZyb21cbiAgICogQHBhcmFtIHtUeXBlfSB0b1xuICAgKi9cbiAgb3ZlcnJpZGVWaWV3RGlyZWN0aXZlKGNvbXBvbmVudDogVHlwZSwgZnJvbTogVHlwZSwgdG86IFR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGVja092ZXJyaWRlYWJsZShjb21wb25lbnQpO1xuXG4gICAgdmFyIG92ZXJyaWRlcyA9IHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50KTtcblxuICAgIGlmIChpc0JsYW5rKG92ZXJyaWRlcykpIHtcbiAgICAgIG92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgVHlwZT4oKTtcbiAgICAgIHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50LCBvdmVycmlkZXMpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlcy5zZXQoZnJvbSwgdG8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBWaWV3TWV0YWRhdGF9IGZvciBhIGNvbXBvbmVudDpcbiAgICogLSBTZXQgdGhlIHtAbGluayBWaWV3TWV0YWRhdGF9IHRvIHRoZSBvdmVycmlkZGVuIHZpZXcgd2hlbiBpdCBleGlzdHMgb3IgZmFsbGJhY2sgdG8gdGhlIGRlZmF1bHRcbiAgICogYFZpZXdSZXNvbHZlcmAsXG4gICAqICAgc2VlIGBzZXRWaWV3YC5cbiAgICogLSBPdmVycmlkZSB0aGUgZGlyZWN0aXZlcywgc2VlIGBvdmVycmlkZVZpZXdEaXJlY3RpdmVgLlxuICAgKiAtIE92ZXJyaWRlIHRoZSBAVmlldyBkZWZpbml0aW9uLCBzZWUgYHNldElubGluZVRlbXBsYXRlYC5cbiAgICpcbiAgICogQHBhcmFtIGNvbXBvbmVudFxuICAgKiBAcmV0dXJucyB7Vmlld0RlZmluaXRpb259XG4gICAqL1xuICByZXNvbHZlKGNvbXBvbmVudDogVHlwZSk6IFZpZXdNZXRhZGF0YSB7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl92aWV3Q2FjaGUuZ2V0KGNvbXBvbmVudCk7XG4gICAgaWYgKGlzUHJlc2VudCh2aWV3KSkgcmV0dXJuIHZpZXc7XG5cbiAgICB2aWV3ID0gdGhpcy5fdmlld3MuZ2V0KGNvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsodmlldykpIHtcbiAgICAgIHZpZXcgPSBzdXBlci5yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgdmFyIGRpcmVjdGl2ZXMgPSB2aWV3LmRpcmVjdGl2ZXM7XG4gICAgdmFyIG92ZXJyaWRlcyA9IHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50KTtcblxuICAgIGlmIChpc1ByZXNlbnQob3ZlcnJpZGVzKSAmJiBpc1ByZXNlbnQoZGlyZWN0aXZlcykpIHtcbiAgICAgIGRpcmVjdGl2ZXMgPSBMaXN0V3JhcHBlci5jbG9uZSh2aWV3LmRpcmVjdGl2ZXMpO1xuICAgICAgb3ZlcnJpZGVzLmZvckVhY2goKHRvLCBmcm9tKSA9PiB7XG4gICAgICAgIHZhciBzcmNJbmRleCA9IGRpcmVjdGl2ZXMuaW5kZXhPZihmcm9tKTtcbiAgICAgICAgaWYgKHNyY0luZGV4ID09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgIGBPdmVycmlkZW4gZGlyZWN0aXZlICR7c3RyaW5naWZ5KGZyb20pfSBub3QgZm91bmQgaW4gdGhlIHRlbXBsYXRlIG9mICR7c3RyaW5naWZ5KGNvbXBvbmVudCl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZGlyZWN0aXZlc1tzcmNJbmRleF0gPSB0bztcbiAgICAgIH0pO1xuICAgICAgdmlldyA9IG5ldyBWaWV3TWV0YWRhdGEoXG4gICAgICAgICAge3RlbXBsYXRlOiB2aWV3LnRlbXBsYXRlLCB0ZW1wbGF0ZVVybDogdmlldy50ZW1wbGF0ZVVybCwgZGlyZWN0aXZlczogZGlyZWN0aXZlc30pO1xuICAgIH1cblxuICAgIHZhciBpbmxpbmVUZW1wbGF0ZSA9IHRoaXMuX2lubGluZVRlbXBsYXRlcy5nZXQoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KGlubGluZVRlbXBsYXRlKSkge1xuICAgICAgdmlldyA9IG5ldyBWaWV3TWV0YWRhdGEoXG4gICAgICAgICAge3RlbXBsYXRlOiBpbmxpbmVUZW1wbGF0ZSwgdGVtcGxhdGVVcmw6IG51bGwsIGRpcmVjdGl2ZXM6IHZpZXcuZGlyZWN0aXZlc30pO1xuICAgIH1cblxuICAgIHRoaXMuX3ZpZXdDYWNoZS5zZXQoY29tcG9uZW50LCB2aWV3KTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogT25jZSBhIGNvbXBvbmVudCBoYXMgYmVlbiBjb21waWxlZCwgdGhlIEFwcFByb3RvVmlldyBpcyBzdG9yZWQgaW4gdGhlIGNvbXBpbGVyIGNhY2hlLlxuICAgKlxuICAgKiBUaGVuIGl0IHNob3VsZCBub3QgYmUgcG9zc2libGUgdG8gb3ZlcnJpZGUgdGhlIGNvbXBvbmVudCBjb25maWd1cmF0aW9uIGFmdGVyIHRoZSBjb21wb25lbnRcbiAgICogaGFzIGJlZW4gY29tcGlsZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqL1xuICBfY2hlY2tPdmVycmlkZWFibGUoY29tcG9uZW50OiBUeXBlKTogdm9pZCB7XG4gICAgdmFyIGNhY2hlZCA9IHRoaXMuX3ZpZXdDYWNoZS5nZXQoY29tcG9uZW50KTtcblxuICAgIGlmIChpc1ByZXNlbnQoY2FjaGVkKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRoZSBjb21wb25lbnQgJHtzdHJpbmdpZnkoY29tcG9uZW50KX0gaGFzIGFscmVhZHkgYmVlbiBjb21waWxlZCwgaXRzIGNvbmZpZ3VyYXRpb24gY2FuIG5vdCBiZSBjaGFuZ2VkYCk7XG4gICAgfVxuICB9XG59XG4iXX0=