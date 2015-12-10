'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var view_1 = require('../metadata/view');
var directives_1 = require('../metadata/directives');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var ViewResolver = (function () {
    function ViewResolver() {
        /** @internal */
        this._cache = new collection_1.Map();
    }
    ViewResolver.prototype.resolve = function (component) {
        var view = this._cache.get(component);
        if (lang_1.isBlank(view)) {
            view = this._resolve(component);
            this._cache.set(component, view);
        }
        return view;
    };
    /** @internal */
    ViewResolver.prototype._resolve = function (component) {
        var compMeta;
        var viewMeta;
        reflection_1.reflector.annotations(component).forEach(function (m) {
            if (m instanceof view_1.ViewMetadata) {
                viewMeta = m;
            }
            if (m instanceof directives_1.ComponentMetadata) {
                compMeta = m;
            }
        });
        if (lang_1.isPresent(compMeta)) {
            if (lang_1.isBlank(compMeta.template) && lang_1.isBlank(compMeta.templateUrl) && lang_1.isBlank(viewMeta)) {
                throw new exceptions_1.BaseException("Component '" + lang_1.stringify(component) + "' must have either 'template', 'templateUrl', or '@View' set.");
            }
            else if (lang_1.isPresent(compMeta.template) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("template", component);
            }
            else if (lang_1.isPresent(compMeta.templateUrl) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("templateUrl", component);
            }
            else if (lang_1.isPresent(compMeta.directives) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("directives", component);
            }
            else if (lang_1.isPresent(compMeta.pipes) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("pipes", component);
            }
            else if (lang_1.isPresent(compMeta.encapsulation) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("encapsulation", component);
            }
            else if (lang_1.isPresent(compMeta.styles) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("styles", component);
            }
            else if (lang_1.isPresent(compMeta.styleUrls) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("styleUrls", component);
            }
            else if (lang_1.isPresent(viewMeta)) {
                return viewMeta;
            }
            else {
                return new view_1.ViewMetadata({
                    templateUrl: compMeta.templateUrl,
                    template: compMeta.template,
                    directives: compMeta.directives,
                    pipes: compMeta.pipes,
                    encapsulation: compMeta.encapsulation,
                    styles: compMeta.styles,
                    styleUrls: compMeta.styleUrls
                });
            }
        }
        else {
            if (lang_1.isBlank(viewMeta)) {
                throw new exceptions_1.BaseException("No View decorator found on component '" + lang_1.stringify(component) + "'");
            }
            else {
                return viewMeta;
            }
        }
        return null;
    };
    /** @internal */
    ViewResolver.prototype._throwMixingViewAndComponent = function (propertyName, component) {
        throw new exceptions_1.BaseException("Component '" + lang_1.stringify(component) + "' cannot have both '" + propertyName + "' and '@View' set at the same time\"");
    };
    ViewResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ViewResolver);
    return ViewResolver;
})();
exports.ViewResolver = ViewResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbIlZpZXdSZXNvbHZlciIsIlZpZXdSZXNvbHZlci5jb25zdHJ1Y3RvciIsIlZpZXdSZXNvbHZlci5yZXNvbHZlIiwiVmlld1Jlc29sdmVyLl9yZXNvbHZlIiwiVmlld1Jlc29sdmVyLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUEyQixrQkFBa0IsQ0FBQyxDQUFBO0FBQzlDLDJCQUFnQyx3QkFBd0IsQ0FBQyxDQUFBO0FBRXpELHFCQUFrRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzdFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUFrQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRW5ELDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBR2xFO0lBQUFBO1FBRUVDLGdCQUFnQkE7UUFDaEJBLFdBQU1BLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFzQkEsQ0FBQ0E7SUFrRnpDQSxDQUFDQTtJQWhGQ0QsOEJBQU9BLEdBQVBBLFVBQVFBLFNBQWVBO1FBQ3JCRSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUV0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNuQ0EsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREYsZ0JBQWdCQTtJQUNoQkEsK0JBQVFBLEdBQVJBLFVBQVNBLFNBQWVBO1FBQ3RCRyxJQUFJQSxRQUEyQkEsQ0FBQ0E7UUFDaENBLElBQUlBLFFBQXNCQSxDQUFDQTtRQUUzQkEsc0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLENBQUNBO1lBQ3hDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxtQkFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlCQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNmQSxDQUFDQTtZQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSw4QkFBaUJBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFSEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxjQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxjQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckZBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsZ0JBQWNBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxrRUFBK0RBLENBQUNBLENBQUNBO1lBRXpHQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvREEsSUFBSUEsQ0FBQ0EsNEJBQTRCQSxDQUFDQSxVQUFVQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUUzREEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbEVBLElBQUlBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsYUFBYUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFOURBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pFQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLFlBQVlBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1lBRTdEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1REEsSUFBSUEsQ0FBQ0EsNEJBQTRCQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUV4REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcEVBLElBQUlBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsZUFBZUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFaEVBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzdEQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLFFBQVFBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1lBRXpEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNoRUEsSUFBSUEsQ0FBQ0EsNEJBQTRCQSxDQUFDQSxXQUFXQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUU1REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvQkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFFbEJBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxtQkFBWUEsQ0FBQ0E7b0JBQ3RCQSxXQUFXQSxFQUFFQSxRQUFRQSxDQUFDQSxXQUFXQTtvQkFDakNBLFFBQVFBLEVBQUVBLFFBQVFBLENBQUNBLFFBQVFBO29CQUMzQkEsVUFBVUEsRUFBRUEsUUFBUUEsQ0FBQ0EsVUFBVUE7b0JBQy9CQSxLQUFLQSxFQUFFQSxRQUFRQSxDQUFDQSxLQUFLQTtvQkFDckJBLGFBQWFBLEVBQUVBLFFBQVFBLENBQUNBLGFBQWFBO29CQUNyQ0EsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsTUFBTUE7b0JBQ3ZCQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFDQSxTQUFTQTtpQkFDOUJBLENBQUNBLENBQUNBO1lBQ0xBLENBQUNBO1FBQ0hBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDJDQUF5Q0EsZ0JBQVNBLENBQUNBLFNBQVNBLENBQUNBLE1BQUdBLENBQUNBLENBQUNBO1lBQzVGQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDbEJBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURILGdCQUFnQkE7SUFDaEJBLG1EQUE0QkEsR0FBNUJBLFVBQTZCQSxZQUFvQkEsRUFBRUEsU0FBZUE7UUFDaEVJLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsZ0JBQWNBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSw0QkFBdUJBLFlBQVlBLHlDQUFxQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbEhBLENBQUNBO0lBcEZISjtRQUFDQSxlQUFVQSxFQUFFQTs7cUJBcUZaQTtJQUFEQSxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFyRkQsSUFxRkM7QUFwRlksb0JBQVksZUFvRnhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Vmlld01ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7Q29tcG9uZW50TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5pbXBvcnQge1R5cGUsIHN0cmluZ2lmeSwgaXNCbGFuaywgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBWaWV3UmVzb2x2ZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9jYWNoZSA9IG5ldyBNYXA8VHlwZSwgVmlld01ldGFkYXRhPigpO1xuXG4gIHJlc29sdmUoY29tcG9uZW50OiBUeXBlKTogVmlld01ldGFkYXRhIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX2NhY2hlLmdldChjb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsodmlldykpIHtcbiAgICAgIHZpZXcgPSB0aGlzLl9yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgICB0aGlzLl9jYWNoZS5zZXQoY29tcG9uZW50LCB2aWV3KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmUoY29tcG9uZW50OiBUeXBlKTogVmlld01ldGFkYXRhIHtcbiAgICB2YXIgY29tcE1ldGE6IENvbXBvbmVudE1ldGFkYXRhO1xuICAgIHZhciB2aWV3TWV0YTogVmlld01ldGFkYXRhO1xuXG4gICAgcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCkuZm9yRWFjaChtID0+IHtcbiAgICAgIGlmIChtIGluc3RhbmNlb2YgVmlld01ldGFkYXRhKSB7XG4gICAgICAgIHZpZXdNZXRhID0gbTtcbiAgICAgIH1cbiAgICAgIGlmIChtIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgY29tcE1ldGEgPSBtO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGlzUHJlc2VudChjb21wTWV0YSkpIHtcbiAgICAgIGlmIChpc0JsYW5rKGNvbXBNZXRhLnRlbXBsYXRlKSAmJiBpc0JsYW5rKGNvbXBNZXRhLnRlbXBsYXRlVXJsKSAmJiBpc0JsYW5rKHZpZXdNZXRhKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9JyBtdXN0IGhhdmUgZWl0aGVyICd0ZW1wbGF0ZScsICd0ZW1wbGF0ZVVybCcsIG9yICdAVmlldycgc2V0LmApO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS50ZW1wbGF0ZSkgJiYgaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICB0aGlzLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQoXCJ0ZW1wbGF0ZVwiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS50ZW1wbGF0ZVVybCkgJiYgaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICB0aGlzLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQoXCJ0ZW1wbGF0ZVVybFwiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5kaXJlY3RpdmVzKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcImRpcmVjdGl2ZXNcIiwgY29tcG9uZW50KTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoY29tcE1ldGEucGlwZXMpICYmIGlzUHJlc2VudCh2aWV3TWV0YSkpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dNaXhpbmdWaWV3QW5kQ29tcG9uZW50KFwicGlwZXNcIiwgY29tcG9uZW50KTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoY29tcE1ldGEuZW5jYXBzdWxhdGlvbikgJiYgaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICB0aGlzLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQoXCJlbmNhcHN1bGF0aW9uXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLnN0eWxlcykgJiYgaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICB0aGlzLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQoXCJzdHlsZXNcIiwgY29tcG9uZW50KTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoY29tcE1ldGEuc3R5bGVVcmxzKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInN0eWxlVXJsc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh2aWV3TWV0YSkpIHtcbiAgICAgICAgcmV0dXJuIHZpZXdNZXRhO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFZpZXdNZXRhZGF0YSh7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbXBNZXRhLnRlbXBsYXRlVXJsLFxuICAgICAgICAgIHRlbXBsYXRlOiBjb21wTWV0YS50ZW1wbGF0ZSxcbiAgICAgICAgICBkaXJlY3RpdmVzOiBjb21wTWV0YS5kaXJlY3RpdmVzLFxuICAgICAgICAgIHBpcGVzOiBjb21wTWV0YS5waXBlcyxcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uOiBjb21wTWV0YS5lbmNhcHN1bGF0aW9uLFxuICAgICAgICAgIHN0eWxlczogY29tcE1ldGEuc3R5bGVzLFxuICAgICAgICAgIHN0eWxlVXJsczogY29tcE1ldGEuc3R5bGVVcmxzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNCbGFuayh2aWV3TWV0YSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIFZpZXcgZGVjb3JhdG9yIGZvdW5kIG9uIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmlld01ldGE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGhyb3dNaXhpbmdWaWV3QW5kQ29tcG9uZW50KHByb3BlcnR5TmFtZTogc3RyaW5nLCBjb21wb25lbnQ6IFR5cGUpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgYENvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nIGNhbm5vdCBoYXZlIGJvdGggJyR7cHJvcGVydHlOYW1lfScgYW5kICdAVmlldycgc2V0IGF0IHRoZSBzYW1lIHRpbWVcImApO1xuICB9XG59XG4iXX0=