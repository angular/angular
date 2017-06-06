var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { resolveForwardRef, Injectable } from 'angular2/src/core/di';
import { isPresent, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { DirectiveMetadata, ComponentMetadata, InputMetadata, OutputMetadata, HostBindingMetadata, HostListenerMetadata, ContentChildrenMetadata, ViewChildrenMetadata, ContentChildMetadata, ViewChildMetadata } from 'angular2/src/core/metadata';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
function _isDirectiveMetadata(type) {
    return type instanceof DirectiveMetadata;
}
/*
 * Resolve a `Type` for {@link DirectiveMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let DirectiveResolver = class DirectiveResolver {
    constructor(_reflector) {
        if (isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflector;
        }
    }
    /**
     * Return {@link DirectiveMetadata} for a given `Type`.
     */
    resolve(type) {
        var typeMetadata = this._reflector.annotations(resolveForwardRef(type));
        if (isPresent(typeMetadata)) {
            var metadata = typeMetadata.find(_isDirectiveMetadata);
            if (isPresent(metadata)) {
                var propertyMetadata = this._reflector.propMetadata(type);
                return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
            }
        }
        throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
    }
    _mergeWithPropertyMetadata(dm, propertyMetadata, directiveType) {
        var inputs = [];
        var outputs = [];
        var host = {};
        var queries = {};
        StringMapWrapper.forEach(propertyMetadata, (metadata, propName) => {
            metadata.forEach(a => {
                if (a instanceof InputMetadata) {
                    if (isPresent(a.bindingPropertyName)) {
                        inputs.push(`${propName}: ${a.bindingPropertyName}`);
                    }
                    else {
                        inputs.push(propName);
                    }
                }
                if (a instanceof OutputMetadata) {
                    if (isPresent(a.bindingPropertyName)) {
                        outputs.push(`${propName}: ${a.bindingPropertyName}`);
                    }
                    else {
                        outputs.push(propName);
                    }
                }
                if (a instanceof HostBindingMetadata) {
                    if (isPresent(a.hostPropertyName)) {
                        host[`[${a.hostPropertyName}]`] = propName;
                    }
                    else {
                        host[`[${propName}]`] = propName;
                    }
                }
                if (a instanceof HostListenerMetadata) {
                    var args = isPresent(a.args) ? a.args.join(', ') : '';
                    host[`(${a.eventName})`] = `${propName}(${args})`;
                }
                if (a instanceof ContentChildrenMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof ViewChildrenMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof ContentChildMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof ViewChildMetadata) {
                    queries[propName] = a;
                }
            });
        });
        return this._merge(dm, inputs, outputs, host, queries, directiveType);
    }
    _merge(dm, inputs, outputs, host, queries, directiveType) {
        var mergedInputs = isPresent(dm.inputs) ? ListWrapper.concat(dm.inputs, inputs) : inputs;
        var mergedOutputs;
        if (isPresent(dm.outputs)) {
            dm.outputs.forEach((propName) => {
                if (ListWrapper.contains(outputs, propName)) {
                    throw new BaseException(`Output event '${propName}' defined multiple times in '${stringify(directiveType)}'`);
                }
            });
            mergedOutputs = ListWrapper.concat(dm.outputs, outputs);
        }
        else {
            mergedOutputs = outputs;
        }
        var mergedHost = isPresent(dm.host) ? StringMapWrapper.merge(dm.host, host) : host;
        var mergedQueries = isPresent(dm.queries) ? StringMapWrapper.merge(dm.queries, queries) : queries;
        if (dm instanceof ComponentMetadata) {
            return new ComponentMetadata({
                selector: dm.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: dm.exportAs,
                moduleId: dm.moduleId,
                queries: mergedQueries,
                changeDetection: dm.changeDetection,
                providers: dm.providers,
                viewProviders: dm.viewProviders
            });
        }
        else {
            return new DirectiveMetadata({
                selector: dm.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: dm.exportAs,
                queries: mergedQueries,
                providers: dm.providers
            });
        }
    }
};
DirectiveResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ReflectorReader])
], DirectiveResolver);
export var CODEGEN_DIRECTIVE_RESOLVER = new DirectiveResolver(reflector);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2RpcmVjdGl2ZV9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLGlCQUFpQixFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUMzRCxFQUFPLFNBQVMsRUFBVyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDckUsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFckUsRUFDTCxpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDYixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDbEIsTUFBTSw0QkFBNEI7T0FDNUIsRUFBQyxTQUFTLEVBQUMsTUFBTSx5Q0FBeUM7T0FDMUQsRUFBQyxlQUFlLEVBQUMsTUFBTSwrQ0FBK0M7QUFFN0UsOEJBQThCLElBQVM7SUFDckMsTUFBTSxDQUFDLElBQUksWUFBWSxpQkFBaUIsQ0FBQztBQUMzQyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBRUg7SUFHRSxZQUFZLFVBQTRCO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sQ0FBQyxJQUFVO1FBQ2hCLElBQUks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RUFBRSxFQUFFLENBQUMsUUFBUTtnQkFDckIsT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLGVBQWUsRUFBRSxFQUFFLENBQUMsZUFBZTtnQkFDbkMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dCQUN2QixhQUFhLEVBQUUsRUFBRSxDQUFDLGFBQWE7YUFDaEMsQ0FBQyxDQUFDO1FBRUwsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUM7Z0JBQzNCLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTtnQkFDckIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRO2dCQUNyQixPQUFPLEVBQUUsYUFBYTtnQkFDdEIsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2FBQ3hCLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQXZJRDtJQUFDLFVBQVUsRUFBRTs7cUJBQUE7QUF5SWIsT0FBTyxJQUFJLDBCQUEwQixHQUFHLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFuaywgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZE1ldGFkYXRhXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtSZWZsZWN0b3JSZWFkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdG9yX3JlYWRlcic7XG5cbmZ1bmN0aW9uIF9pc0RpcmVjdGl2ZU1ldGFkYXRhKHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZSBpbnN0YW5jZW9mIERpcmVjdGl2ZU1ldGFkYXRhO1xufVxuXG4vKlxuICogUmVzb2x2ZSBhIGBUeXBlYCBmb3Ige0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfS5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZVJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfcmVmbGVjdG9yOiBSZWZsZWN0b3JSZWFkZXI7XG5cbiAgY29uc3RydWN0b3IoX3JlZmxlY3Rvcj86IFJlZmxlY3RvclJlYWRlcikge1xuICAgIGlmIChpc1ByZXNlbnQoX3JlZmxlY3RvcikpIHtcbiAgICAgIHRoaXMuX3JlZmxlY3RvciA9IF9yZWZsZWN0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlZmxlY3RvciA9IHJlZmxlY3RvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZm9yIGEgZ2l2ZW4gYFR5cGVgLlxuICAgKi9cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlKTogRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciB0eXBlTWV0YWRhdGEgPSB0aGlzLl9yZWZsZWN0b3IuYW5ub3RhdGlvbnMocmVzb2x2ZUZvcndhcmRSZWYodHlwZSkpO1xuICAgIGlmIChpc1ByZXNlbnQodHlwZU1ldGFkYXRhKSkge1xuICAgICAgdmFyIG1ldGFkYXRhID0gdHlwZU1ldGFkYXRhLmZpbmQoX2lzRGlyZWN0aXZlTWV0YWRhdGEpO1xuICAgICAgaWYgKGlzUHJlc2VudChtZXRhZGF0YSkpIHtcbiAgICAgICAgdmFyIHByb3BlcnR5TWV0YWRhdGEgPSB0aGlzLl9yZWZsZWN0b3IucHJvcE1ldGFkYXRhKHR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWVyZ2VXaXRoUHJvcGVydHlNZXRhZGF0YShtZXRhZGF0YSwgcHJvcGVydHlNZXRhZGF0YSwgdHlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIERpcmVjdGl2ZSBhbm5vdGF0aW9uIGZvdW5kIG9uICR7c3RyaW5naWZ5KHR5cGUpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VXaXRoUHJvcGVydHlNZXRhZGF0YShkbTogRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlNZXRhZGF0YToge1trZXk6IHN0cmluZ106IGFueVtdfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVUeXBlOiBUeXBlKTogRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBpbnB1dHMgPSBbXTtcbiAgICB2YXIgb3V0cHV0cyA9IFtdO1xuICAgIHZhciBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBxdWVyaWVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHByb3BlcnR5TWV0YWRhdGEsIChtZXRhZGF0YTogYW55W10sIHByb3BOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIG1ldGFkYXRhLmZvckVhY2goYSA9PiB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgSW5wdXRNZXRhZGF0YSkge1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQoYS5iaW5kaW5nUHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goYCR7cHJvcE5hbWV9OiAke2EuYmluZGluZ1Byb3BlcnR5TmFtZX1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgT3V0cHV0TWV0YWRhdGEpIHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGEuYmluZGluZ1Byb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgIG91dHB1dHMucHVzaChgJHtwcm9wTmFtZX06ICR7YS5iaW5kaW5nUHJvcGVydHlOYW1lfWApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRwdXRzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgSG9zdEJpbmRpbmdNZXRhZGF0YSkge1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQoYS5ob3N0UHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgaG9zdFtgWyR7YS5ob3N0UHJvcGVydHlOYW1lfV1gXSA9IHByb3BOYW1lO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBob3N0W2BbJHtwcm9wTmFtZX1dYF0gPSBwcm9wTmFtZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIEhvc3RMaXN0ZW5lck1ldGFkYXRhKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBpc1ByZXNlbnQoYS5hcmdzKSA/ICg8YW55W10+YS5hcmdzKS5qb2luKCcsICcpIDogJyc7XG4gICAgICAgICAgaG9zdFtgKCR7YS5ldmVudE5hbWV9KWBdID0gYCR7cHJvcE5hbWV9KCR7YXJnc30pYDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgQ29udGVudENoaWxkcmVuTWV0YWRhdGEpIHtcbiAgICAgICAgICBxdWVyaWVzW3Byb3BOYW1lXSA9IGE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIFZpZXdDaGlsZHJlbk1ldGFkYXRhKSB7XG4gICAgICAgICAgcXVlcmllc1twcm9wTmFtZV0gPSBhO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBDb250ZW50Q2hpbGRNZXRhZGF0YSkge1xuICAgICAgICAgIHF1ZXJpZXNbcHJvcE5hbWVdID0gYTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgVmlld0NoaWxkTWV0YWRhdGEpIHtcbiAgICAgICAgICBxdWVyaWVzW3Byb3BOYW1lXSA9IGE7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9tZXJnZShkbSwgaW5wdXRzLCBvdXRwdXRzLCBob3N0LCBxdWVyaWVzLCBkaXJlY3RpdmVUeXBlKTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlKGRtOiBEaXJlY3RpdmVNZXRhZGF0YSwgaW5wdXRzOiBzdHJpbmdbXSwgb3V0cHV0czogc3RyaW5nW10sXG4gICAgICAgICAgICAgICAgIGhvc3Q6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBxdWVyaWVzOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICAgICAgICAgICAgICAgZGlyZWN0aXZlVHlwZTogVHlwZSk6IERpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgbWVyZ2VkSW5wdXRzID0gaXNQcmVzZW50KGRtLmlucHV0cykgPyBMaXN0V3JhcHBlci5jb25jYXQoZG0uaW5wdXRzLCBpbnB1dHMpIDogaW5wdXRzO1xuXG4gICAgdmFyIG1lcmdlZE91dHB1dHM7XG4gICAgaWYgKGlzUHJlc2VudChkbS5vdXRwdXRzKSkge1xuICAgICAgZG0ub3V0cHV0cy5mb3JFYWNoKChwcm9wTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhvdXRwdXRzLCBwcm9wTmFtZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgYE91dHB1dCBldmVudCAnJHtwcm9wTmFtZX0nIGRlZmluZWQgbXVsdGlwbGUgdGltZXMgaW4gJyR7c3RyaW5naWZ5KGRpcmVjdGl2ZVR5cGUpfSdgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBtZXJnZWRPdXRwdXRzID0gTGlzdFdyYXBwZXIuY29uY2F0KGRtLm91dHB1dHMsIG91dHB1dHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXJnZWRPdXRwdXRzID0gb3V0cHV0cztcbiAgICB9XG5cbiAgICB2YXIgbWVyZ2VkSG9zdCA9IGlzUHJlc2VudChkbS5ob3N0KSA/IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UoZG0uaG9zdCwgaG9zdCkgOiBob3N0O1xuICAgIHZhciBtZXJnZWRRdWVyaWVzID1cbiAgICAgICAgaXNQcmVzZW50KGRtLnF1ZXJpZXMpID8gU3RyaW5nTWFwV3JhcHBlci5tZXJnZShkbS5xdWVyaWVzLCBxdWVyaWVzKSA6IHF1ZXJpZXM7XG5cbiAgICBpZiAoZG0gaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRNZXRhZGF0YSh7XG4gICAgICAgIHNlbGVjdG9yOiBkbS5zZWxlY3RvcixcbiAgICAgICAgaW5wdXRzOiBtZXJnZWRJbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IG1lcmdlZE91dHB1dHMsXG4gICAgICAgIGhvc3Q6IG1lcmdlZEhvc3QsXG4gICAgICAgIGV4cG9ydEFzOiBkbS5leHBvcnRBcyxcbiAgICAgICAgbW9kdWxlSWQ6IGRtLm1vZHVsZUlkLFxuICAgICAgICBxdWVyaWVzOiBtZXJnZWRRdWVyaWVzLFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IGRtLmNoYW5nZURldGVjdGlvbixcbiAgICAgICAgcHJvdmlkZXJzOiBkbS5wcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IGRtLnZpZXdQcm92aWRlcnNcbiAgICAgIH0pO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgICBzZWxlY3RvcjogZG0uc2VsZWN0b3IsXG4gICAgICAgIGlucHV0czogbWVyZ2VkSW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXJnZWRPdXRwdXRzLFxuICAgICAgICBob3N0OiBtZXJnZWRIb3N0LFxuICAgICAgICBleHBvcnRBczogZG0uZXhwb3J0QXMsXG4gICAgICAgIHF1ZXJpZXM6IG1lcmdlZFF1ZXJpZXMsXG4gICAgICAgIHByb3ZpZGVyczogZG0ucHJvdmlkZXJzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHZhciBDT0RFR0VOX0RJUkVDVElWRV9SRVNPTFZFUiA9IG5ldyBEaXJlY3RpdmVSZXNvbHZlcihyZWZsZWN0b3IpO1xuIl19