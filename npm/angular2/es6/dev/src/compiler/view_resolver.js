var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { ViewMetadata } from 'angular2/src/core/metadata/view';
import { ComponentMetadata } from 'angular2/src/core/metadata/directives';
import { stringify, isBlank, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map } from 'angular2/src/facade/collection';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
import { reflector } from 'angular2/src/core/reflection/reflection';
/**
 * Resolves types to {@link ViewMetadata}.
 */
export let ViewResolver = class ViewResolver {
    constructor(_reflector) {
        /** @internal */
        this._cache = new Map();
        if (isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflector;
        }
    }
    resolve(component) {
        var view = this._cache.get(component);
        if (isBlank(view)) {
            view = this._resolve(component);
            this._cache.set(component, view);
        }
        return view;
    }
    /** @internal */
    _resolve(component) {
        var compMeta;
        var viewMeta;
        this._reflector.annotations(component).forEach(m => {
            if (m instanceof ViewMetadata) {
                viewMeta = m;
            }
            if (m instanceof ComponentMetadata) {
                compMeta = m;
            }
        });
        if (isPresent(compMeta)) {
            if (isBlank(compMeta.template) && isBlank(compMeta.templateUrl) && isBlank(viewMeta)) {
                throw new BaseException(`Component '${stringify(component)}' must have either 'template' or 'templateUrl' set.`);
            }
            else if (isPresent(compMeta.template) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("template", component);
            }
            else if (isPresent(compMeta.templateUrl) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("templateUrl", component);
            }
            else if (isPresent(compMeta.directives) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("directives", component);
            }
            else if (isPresent(compMeta.pipes) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("pipes", component);
            }
            else if (isPresent(compMeta.encapsulation) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("encapsulation", component);
            }
            else if (isPresent(compMeta.styles) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("styles", component);
            }
            else if (isPresent(compMeta.styleUrls) && isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("styleUrls", component);
            }
            else if (isPresent(viewMeta)) {
                return viewMeta;
            }
            else {
                return new ViewMetadata({
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
            if (isBlank(viewMeta)) {
                throw new BaseException(`Could not compile '${stringify(component)}' because it is not a component.`);
            }
            else {
                return viewMeta;
            }
        }
        return null;
    }
    /** @internal */
    _throwMixingViewAndComponent(propertyName, component) {
        throw new BaseException(`Component '${stringify(component)}' cannot have both '${propertyName}' and '@View' set at the same time"`);
    }
};
ViewResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ReflectorReader])
], ViewResolver);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci92aWV3X3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsWUFBWSxFQUFDLE1BQU0saUNBQWlDO09BQ3JELEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1Q0FBdUM7T0FFaEUsRUFBTyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUNyRSxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLEdBQUcsRUFBQyxNQUFNLGdDQUFnQztPQUUzQyxFQUFDLGVBQWUsRUFBQyxNQUFNLCtDQUErQztPQUN0RSxFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztBQUVqRTs7R0FFRztBQUVIO0lBTUUsWUFBWSxVQUE0QjtRQUh4QyxnQkFBZ0I7UUFDaEIsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1FBR3JDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsU0FBZTtRQUNyQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV0QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsUUFBUSxDQUFDLFNBQWU7UUFDdEIsSUFBSSxRQUEyQixDQUFDO1FBQ2hDLElBQUksUUFBc0IsQ0FBQztRQUUzQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNmLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckYsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsY0FBYyxTQUFTLENBQUMsU0FBUyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7WUFFL0YsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFM0QsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFOUQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFN0QsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFeEQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFaEUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFekQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFNUQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDO1lBRWxCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUM7b0JBQ3RCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztvQkFDakMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO29CQUMzQixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7b0JBQy9CLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztvQkFDckIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO29CQUNyQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07b0JBQ3ZCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztpQkFDOUIsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sSUFBSSxhQUFhLENBQ25CLHNCQUFzQixTQUFTLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDcEYsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDbEIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGdCQUFnQjtJQUNoQiw0QkFBNEIsQ0FBQyxZQUFvQixFQUFFLFNBQWU7UUFDaEUsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsY0FBYyxTQUFTLENBQUMsU0FBUyxDQUFDLHVCQUF1QixZQUFZLHFDQUFxQyxDQUFDLENBQUM7SUFDbEgsQ0FBQztBQUNILENBQUM7QUFoR0Q7SUFBQyxVQUFVLEVBQUU7O2dCQUFBO0FBZ0daIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1ZpZXdNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0NvbXBvbmVudE1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuaW1wb3J0IHtUeXBlLCBzdHJpbmdpZnksIGlzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TWFwfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1JlZmxlY3RvclJlYWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0b3JfcmVhZGVyJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuXG4vKipcbiAqIFJlc29sdmVzIHR5cGVzIHRvIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVmlld1Jlc29sdmVyIHtcbiAgcHJpdmF0ZSBfcmVmbGVjdG9yOiBSZWZsZWN0b3JSZWFkZXI7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2FjaGUgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcblxuICBjb25zdHJ1Y3RvcihfcmVmbGVjdG9yPzogUmVmbGVjdG9yUmVhZGVyKSB7XG4gICAgaWYgKGlzUHJlc2VudChfcmVmbGVjdG9yKSkge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gX3JlZmxlY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gcmVmbGVjdG9yO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoY29tcG9uZW50OiBUeXBlKTogVmlld01ldGFkYXRhIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX2NhY2hlLmdldChjb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsodmlldykpIHtcbiAgICAgIHZpZXcgPSB0aGlzLl9yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgICB0aGlzLl9jYWNoZS5zZXQoY29tcG9uZW50LCB2aWV3KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmUoY29tcG9uZW50OiBUeXBlKTogVmlld01ldGFkYXRhIHtcbiAgICB2YXIgY29tcE1ldGE6IENvbXBvbmVudE1ldGFkYXRhO1xuICAgIHZhciB2aWV3TWV0YTogVmlld01ldGFkYXRhO1xuXG4gICAgdGhpcy5fcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCkuZm9yRWFjaChtID0+IHtcbiAgICAgIGlmIChtIGluc3RhbmNlb2YgVmlld01ldGFkYXRhKSB7XG4gICAgICAgIHZpZXdNZXRhID0gbTtcbiAgICAgIH1cbiAgICAgIGlmIChtIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgY29tcE1ldGEgPSBtO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGlzUHJlc2VudChjb21wTWV0YSkpIHtcbiAgICAgIGlmIChpc0JsYW5rKGNvbXBNZXRhLnRlbXBsYXRlKSAmJiBpc0JsYW5rKGNvbXBNZXRhLnRlbXBsYXRlVXJsKSAmJiBpc0JsYW5rKHZpZXdNZXRhKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9JyBtdXN0IGhhdmUgZWl0aGVyICd0ZW1wbGF0ZScgb3IgJ3RlbXBsYXRlVXJsJyBzZXQuYCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLnRlbXBsYXRlKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInRlbXBsYXRlXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLnRlbXBsYXRlVXJsKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInRlbXBsYXRlVXJsXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLmRpcmVjdGl2ZXMpICYmIGlzUHJlc2VudCh2aWV3TWV0YSkpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dNaXhpbmdWaWV3QW5kQ29tcG9uZW50KFwiZGlyZWN0aXZlc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5waXBlcykgJiYgaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICB0aGlzLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQoXCJwaXBlc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5lbmNhcHN1bGF0aW9uKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcImVuY2Fwc3VsYXRpb25cIiwgY29tcG9uZW50KTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoY29tcE1ldGEuc3R5bGVzKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInN0eWxlc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5zdHlsZVVybHMpICYmIGlzUHJlc2VudCh2aWV3TWV0YSkpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dNaXhpbmdWaWV3QW5kQ29tcG9uZW50KFwic3R5bGVVcmxzXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICByZXR1cm4gdmlld01ldGE7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgVmlld01ldGFkYXRhKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogY29tcE1ldGEudGVtcGxhdGVVcmwsXG4gICAgICAgICAgdGVtcGxhdGU6IGNvbXBNZXRhLnRlbXBsYXRlLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6IGNvbXBNZXRhLmRpcmVjdGl2ZXMsXG4gICAgICAgICAgcGlwZXM6IGNvbXBNZXRhLnBpcGVzLFxuICAgICAgICAgIGVuY2Fwc3VsYXRpb246IGNvbXBNZXRhLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgc3R5bGVzOiBjb21wTWV0YS5zdHlsZXMsXG4gICAgICAgICAgc3R5bGVVcmxzOiBjb21wTWV0YS5zdHlsZVVybHNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0JsYW5rKHZpZXdNZXRhKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb3VsZCBub3QgY29tcGlsZSAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nIGJlY2F1c2UgaXQgaXMgbm90IGEgY29tcG9uZW50LmApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZpZXdNZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChwcm9wZXJ0eU5hbWU6IHN0cmluZywgY29tcG9uZW50OiBUeXBlKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIGBDb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9JyBjYW5ub3QgaGF2ZSBib3RoICcke3Byb3BlcnR5TmFtZX0nIGFuZCAnQFZpZXcnIHNldCBhdCB0aGUgc2FtZSB0aW1lXCJgKTtcbiAgfVxufVxuIl19