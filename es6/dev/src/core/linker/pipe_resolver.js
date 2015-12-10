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
export let PipeResolver = class {
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    resolve(type) {
        var metas = reflector.annotations(resolveForwardRef(type));
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
    __metadata('design:paramtypes', [])
], PipeResolver);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9waXBlX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbIl9pc1BpcGVNZXRhZGF0YSIsIlBpcGVSZXNvbHZlciIsIlBpcGVSZXNvbHZlci5yZXNvbHZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLGlCQUFpQixFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUMzRCxFQUFPLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUQsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxZQUFZLEVBQUMsTUFBTSw0QkFBNEI7T0FDaEQsRUFBQyxTQUFTLEVBQUMsTUFBTSx5Q0FBeUM7QUFFakUseUJBQXlCLElBQVM7SUFDaENBLE1BQU1BLENBQUNBLElBQUlBLFlBQVlBLFlBQVlBLENBQUNBO0FBQ3RDQSxDQUFDQTtBQUVEOzs7Ozs7R0FNRztBQUNIO0lBRUVDOztPQUVHQTtJQUNIQSxPQUFPQSxDQUFDQSxJQUFVQTtRQUNoQkMsSUFBSUEsS0FBS0EsR0FBR0EsU0FBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLFVBQVVBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1lBQzdDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1lBQ3BCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSw4QkFBOEJBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO0lBQzNFQSxDQUFDQTtBQUNIRCxDQUFDQTtBQWZEO0lBQUMsVUFBVSxFQUFFOztpQkFlWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZiwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UGlwZU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcblxuZnVuY3Rpb24gX2lzUGlwZU1ldGFkYXRhKHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZSBpbnN0YW5jZW9mIFBpcGVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgYFR5cGVgIGZvciB7QGxpbmsgUGlwZU1ldGFkYXRhfS5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBpcGVSZXNvbHZlciB7XG4gIC8qKlxuICAgKiBSZXR1cm4ge0BsaW5rIFBpcGVNZXRhZGF0YX0gZm9yIGEgZ2l2ZW4gYFR5cGVgLlxuICAgKi9cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlKTogUGlwZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YXMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMocmVzb2x2ZUZvcndhcmRSZWYodHlwZSkpO1xuICAgIGlmIChpc1ByZXNlbnQobWV0YXMpKSB7XG4gICAgICB2YXIgYW5ub3RhdGlvbiA9IG1ldGFzLmZpbmQoX2lzUGlwZU1ldGFkYXRhKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbikpIHtcbiAgICAgICAgcmV0dXJuIGFubm90YXRpb247XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBQaXBlIGRlY29yYXRvciBmb3VuZCBvbiAke3N0cmluZ2lmeSh0eXBlKX1gKTtcbiAgfVxufVxuIl19