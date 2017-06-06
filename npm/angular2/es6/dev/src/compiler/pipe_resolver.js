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
import { PipeMetadata } from 'angular2/src/core/metadata';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
import { reflector } from 'angular2/src/core/reflection/reflection';
function _isPipeMetadata(type) {
    return type instanceof PipeMetadata;
}
/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let PipeResolver = class PipeResolver {
    constructor(_reflector) {
        if (isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflector;
        }
    }
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    resolve(type) {
        var metas = this._reflector.annotations(resolveForwardRef(type));
        if (isPresent(metas)) {
            var annotation = metas.find(_isPipeMetadata);
            if (isPresent(annotation)) {
                return annotation;
            }
        }
        throw new BaseException(`No Pipe decorator found on ${stringify(type)}`);
    }
};
PipeResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ReflectorReader])
], PipeResolver);
export var CODEGEN_PIPE_RESOLVER = new PipeResolver(reflector);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9waXBlX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsaUJBQWlCLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQzNELEVBQU8sU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUM1RCxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLFlBQVksRUFBQyxNQUFNLDRCQUE0QjtPQUNoRCxFQUFDLGVBQWUsRUFBQyxNQUFNLCtDQUErQztPQUN0RSxFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztBQUVqRSx5QkFBeUIsSUFBUztJQUNoQyxNQUFNLENBQUMsSUFBSSxZQUFZLFlBQVksQ0FBQztBQUN0QyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBRUg7SUFFRSxZQUFZLFVBQTRCO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sQ0FBQyxJQUFVO1FBQ2hCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDcEIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLElBQUksYUFBYSxDQUFDLDhCQUE4QixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7QUFDSCxDQUFDO0FBeEJEO0lBQUMsVUFBVSxFQUFFOztnQkFBQTtBQTBCYixPQUFPLElBQUkscUJBQXFCLEdBQUcsSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQaXBlTWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7UmVmbGVjdG9yUmVhZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rvcl9yZWFkZXInO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5cbmZ1bmN0aW9uIF9pc1BpcGVNZXRhZGF0YSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBQaXBlTWV0YWRhdGE7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIGBUeXBlYCBmb3Ige0BsaW5rIFBpcGVNZXRhZGF0YX0uXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQaXBlUmVzb2x2ZXIge1xuICBwcml2YXRlIF9yZWZsZWN0b3I6IFJlZmxlY3RvclJlYWRlcjtcbiAgY29uc3RydWN0b3IoX3JlZmxlY3Rvcj86IFJlZmxlY3RvclJlYWRlcikge1xuICAgIGlmIChpc1ByZXNlbnQoX3JlZmxlY3RvcikpIHtcbiAgICAgIHRoaXMuX3JlZmxlY3RvciA9IF9yZWZsZWN0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlZmxlY3RvciA9IHJlZmxlY3RvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHtAbGluayBQaXBlTWV0YWRhdGF9IGZvciBhIGdpdmVuIGBUeXBlYC5cbiAgICovXG4gIHJlc29sdmUodHlwZTogVHlwZSk6IFBpcGVNZXRhZGF0YSB7XG4gICAgdmFyIG1ldGFzID0gdGhpcy5fcmVmbGVjdG9yLmFubm90YXRpb25zKHJlc29sdmVGb3J3YXJkUmVmKHR5cGUpKTtcbiAgICBpZiAoaXNQcmVzZW50KG1ldGFzKSkge1xuICAgICAgdmFyIGFubm90YXRpb24gPSBtZXRhcy5maW5kKF9pc1BpcGVNZXRhZGF0YSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGFubm90YXRpb24pKSB7XG4gICAgICAgIHJldHVybiBhbm5vdGF0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm8gUGlwZSBkZWNvcmF0b3IgZm91bmQgb24gJHtzdHJpbmdpZnkodHlwZSl9YCk7XG4gIH1cbn1cblxuZXhwb3J0IHZhciBDT0RFR0VOX1BJUEVfUkVTT0xWRVIgPSBuZXcgUGlwZVJlc29sdmVyKHJlZmxlY3Rvcik7XG4iXX0=