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
import { Map } from 'angular2/src/facade/collection';
import { isPresent } from 'angular2/src/facade/lang';
import { DirectiveMetadata, ComponentMetadata } from '../core/metadata';
import { DirectiveResolver } from 'angular2/src/core/linker/directive_resolver';
export let MockDirectiveResolver = class extends DirectiveResolver {
    constructor(...args) {
        super(...args);
        this._providerOverrides = new Map();
        this.viewProviderOverrides = new Map();
    }
    resolve(type) {
        var dm = super.resolve(type);
        var providerOverrides = this._providerOverrides.get(type);
        var viewProviderOverrides = this.viewProviderOverrides.get(type);
        var providers = dm.providers;
        if (isPresent(providerOverrides)) {
            providers = dm.providers.concat(providerOverrides);
        }
        if (dm instanceof ComponentMetadata) {
            var viewProviders = dm.viewProviders;
            if (isPresent(viewProviderOverrides)) {
                viewProviders = dm.viewProviders.concat(viewProviderOverrides);
            }
            return new ComponentMetadata({
                selector: dm.selector,
                inputs: dm.inputs,
                outputs: dm.outputs,
                host: dm.host,
                exportAs: dm.exportAs,
                moduleId: dm.moduleId,
                queries: dm.queries,
                changeDetection: dm.changeDetection,
                providers: providers,
                viewProviders: viewProviders
            });
        }
        return new DirectiveMetadata({
            selector: dm.selector,
            inputs: dm.inputs,
            outputs: dm.outputs,
            host: dm.host,
            providers: providers,
            exportAs: dm.exportAs,
            queries: dm.queries
        });
    }
    /**
     * @deprecated
     */
    setBindingsOverride(type, bindings) {
        this._providerOverrides.set(type, bindings);
    }
    /**
     * @deprecated
     */
    setViewBindingsOverride(type, viewBindings) {
        this.viewProviderOverrides.set(type, viewBindings);
    }
    setProvidersOverride(type, bindings) {
        this._providerOverrides.set(type, bindings);
    }
    setViewProvidersOverride(type, viewBindings) {
        this.viewProviderOverrides.set(type, viewBindings);
    }
};
MockDirectiveResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockDirectiveResolver);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvbW9jay9kaXJlY3RpdmVfcmVzb2x2ZXJfbW9jay50cyJdLCJuYW1lcyI6WyJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIiLCJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZSIsIk1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRCaW5kaW5nc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFByb3ZpZGVyc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdQcm92aWRlcnNPdmVycmlkZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxHQUFHLEVBQTBCLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQU8sU0FBUyxFQUE0QixNQUFNLDBCQUEwQjtPQUM1RSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sa0JBQWtCO09BQzlELEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw2Q0FBNkM7QUFFN0UsaURBQzJDLGlCQUFpQjtJQUQ1REE7UUFDMkNDLGVBQWlCQTtRQUNsREEsdUJBQWtCQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFlQSxDQUFDQTtRQUM1Q0EsMEJBQXFCQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFlQSxDQUFDQTtJQWlFekRBLENBQUNBO0lBL0RDRCxPQUFPQSxDQUFDQSxJQUFVQTtRQUNoQkUsSUFBSUEsRUFBRUEsR0FBR0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFN0JBLElBQUlBLGlCQUFpQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMxREEsSUFBSUEscUJBQXFCQSxHQUFHQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBRWpFQSxJQUFJQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsWUFBWUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQ0EsSUFBSUEsYUFBYUEsR0FBR0EsRUFBRUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7WUFDckNBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JDQSxhQUFhQSxHQUFHQSxFQUFFQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBO1lBQ2pFQSxDQUFDQTtZQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBO2dCQUMzQkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxNQUFNQTtnQkFDakJBLE9BQU9BLEVBQUVBLEVBQUVBLENBQUNBLE9BQU9BO2dCQUNuQkEsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsSUFBSUE7Z0JBQ2JBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBLFFBQVFBO2dCQUNyQkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxPQUFPQSxFQUFFQSxFQUFFQSxDQUFDQSxPQUFPQTtnQkFDbkJBLGVBQWVBLEVBQUVBLEVBQUVBLENBQUNBLGVBQWVBO2dCQUNuQ0EsU0FBU0EsRUFBRUEsU0FBU0E7Z0JBQ3BCQSxhQUFhQSxFQUFFQSxhQUFhQTthQUM3QkEsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFDQTtZQUMzQkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsUUFBUUE7WUFDckJBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLE1BQU1BO1lBQ2pCQSxPQUFPQSxFQUFFQSxFQUFFQSxDQUFDQSxPQUFPQTtZQUNuQkEsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsSUFBSUE7WUFDYkEsU0FBU0EsRUFBRUEsU0FBU0E7WUFDcEJBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBLFFBQVFBO1lBQ3JCQSxPQUFPQSxFQUFFQSxFQUFFQSxDQUFDQSxPQUFPQTtTQUNwQkEsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFREY7O09BRUdBO0lBQ0hBLG1CQUFtQkEsQ0FBQ0EsSUFBVUEsRUFBRUEsUUFBZUE7UUFDN0NHLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDOUNBLENBQUNBO0lBRURIOztPQUVHQTtJQUNIQSx1QkFBdUJBLENBQUNBLElBQVVBLEVBQUVBLFlBQW1CQTtRQUNyREksSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQTtJQUNyREEsQ0FBQ0E7SUFFREosb0JBQW9CQSxDQUFDQSxJQUFVQSxFQUFFQSxRQUFlQTtRQUM5Q0ssSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREwsd0JBQXdCQSxDQUFDQSxJQUFVQSxFQUFFQSxZQUFtQkE7UUFDdERNLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0FBQ0hOLENBQUNBO0FBcEVEO0lBQUMsVUFBVSxFQUFFOzswQkFvRVo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIHN0cmluZ2lmeSwgaXNCbGFuaywgcHJpbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0RpcmVjdGl2ZU1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YX0gZnJvbSAnLi4vY29yZS9tZXRhZGF0YSc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZGlyZWN0aXZlX3Jlc29sdmVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tEaXJlY3RpdmVSZXNvbHZlciBleHRlbmRzIERpcmVjdGl2ZVJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfcHJvdmlkZXJPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICBwcml2YXRlIHZpZXdQcm92aWRlck92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG5cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlKTogRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBkbSA9IHN1cGVyLnJlc29sdmUodHlwZSk7XG5cbiAgICB2YXIgcHJvdmlkZXJPdmVycmlkZXMgPSB0aGlzLl9wcm92aWRlck92ZXJyaWRlcy5nZXQodHlwZSk7XG4gICAgdmFyIHZpZXdQcm92aWRlck92ZXJyaWRlcyA9IHRoaXMudmlld1Byb3ZpZGVyT3ZlcnJpZGVzLmdldCh0eXBlKTtcblxuICAgIHZhciBwcm92aWRlcnMgPSBkbS5wcm92aWRlcnM7XG4gICAgaWYgKGlzUHJlc2VudChwcm92aWRlck92ZXJyaWRlcykpIHtcbiAgICAgIHByb3ZpZGVycyA9IGRtLnByb3ZpZGVycy5jb25jYXQocHJvdmlkZXJPdmVycmlkZXMpO1xuICAgIH1cblxuICAgIGlmIChkbSBpbnN0YW5jZW9mIENvbXBvbmVudE1ldGFkYXRhKSB7XG4gICAgICB2YXIgdmlld1Byb3ZpZGVycyA9IGRtLnZpZXdQcm92aWRlcnM7XG4gICAgICBpZiAoaXNQcmVzZW50KHZpZXdQcm92aWRlck92ZXJyaWRlcykpIHtcbiAgICAgICAgdmlld1Byb3ZpZGVycyA9IGRtLnZpZXdQcm92aWRlcnMuY29uY2F0KHZpZXdQcm92aWRlck92ZXJyaWRlcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50TWV0YWRhdGEoe1xuICAgICAgICBzZWxlY3RvcjogZG0uc2VsZWN0b3IsXG4gICAgICAgIGlucHV0czogZG0uaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBkbS5vdXRwdXRzLFxuICAgICAgICBob3N0OiBkbS5ob3N0LFxuICAgICAgICBleHBvcnRBczogZG0uZXhwb3J0QXMsXG4gICAgICAgIG1vZHVsZUlkOiBkbS5tb2R1bGVJZCxcbiAgICAgICAgcXVlcmllczogZG0ucXVlcmllcyxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBkbS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIHNlbGVjdG9yOiBkbS5zZWxlY3RvcixcbiAgICAgIGlucHV0czogZG0uaW5wdXRzLFxuICAgICAgb3V0cHV0czogZG0ub3V0cHV0cyxcbiAgICAgIGhvc3Q6IGRtLmhvc3QsXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIGV4cG9ydEFzOiBkbS5leHBvcnRBcyxcbiAgICAgIHF1ZXJpZXM6IGRtLnF1ZXJpZXNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgc2V0QmluZGluZ3NPdmVycmlkZSh0eXBlOiBUeXBlLCBiaW5kaW5nczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlck92ZXJyaWRlcy5zZXQodHlwZSwgYmluZGluZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBzZXRWaWV3QmluZGluZ3NPdmVycmlkZSh0eXBlOiBUeXBlLCB2aWV3QmluZGluZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJPdmVycmlkZXMuc2V0KHR5cGUsIHZpZXdCaW5kaW5ncyk7XG4gIH1cblxuICBzZXRQcm92aWRlcnNPdmVycmlkZSh0eXBlOiBUeXBlLCBiaW5kaW5nczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlck92ZXJyaWRlcy5zZXQodHlwZSwgYmluZGluZ3MpO1xuICB9XG5cbiAgc2V0Vmlld1Byb3ZpZGVyc092ZXJyaWRlKHR5cGU6IFR5cGUsIHZpZXdCaW5kaW5nczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdQcm92aWRlck92ZXJyaWRlcy5zZXQodHlwZSwgdmlld0JpbmRpbmdzKTtcbiAgfVxufVxuIl19