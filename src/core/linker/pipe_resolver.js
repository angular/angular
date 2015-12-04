'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var metadata_1 = require('angular2/src/core/metadata');
var reflection_1 = require('angular2/src/core/reflection/reflection');
function _isPipeMetadata(type) {
    return type instanceof metadata_1.PipeMetadata;
}
/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var PipeResolver = (function () {
    function PipeResolver() {
    }
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    PipeResolver.prototype.resolve = function (type) {
        var metas = reflection_1.reflector.annotations(di_1.resolveForwardRef(type));
        if (lang_1.isPresent(metas)) {
            var annotation = metas.find(_isPipeMetadata);
            if (lang_1.isPresent(annotation)) {
                return annotation;
            }
        }
        throw new exceptions_1.BaseException("No Pipe decorator found on " + lang_1.stringify(type));
    };
    PipeResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PipeResolver);
    return PipeResolver;
})();
exports.PipeResolver = PipeResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9waXBlX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbIl9pc1BpcGVNZXRhZGF0YSIsIlBpcGVSZXNvbHZlciIsIlBpcGVSZXNvbHZlci5jb25zdHJ1Y3RvciIsIlBpcGVSZXNvbHZlci5yZXNvbHZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG1CQUE0QyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ25FLHFCQUF5QywwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHlCQUEyQiw0QkFBNEIsQ0FBQyxDQUFBO0FBQ3hELDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBRWxFLHlCQUF5QixJQUFTO0lBQ2hDQSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSx1QkFBWUEsQ0FBQ0E7QUFDdENBLENBQUNBO0FBRUQ7Ozs7OztHQU1HO0FBQ0g7SUFBQUM7SUFlQUMsQ0FBQ0E7SUFiQ0Q7O09BRUdBO0lBQ0hBLDhCQUFPQSxHQUFQQSxVQUFRQSxJQUFVQTtRQUNoQkUsSUFBSUEsS0FBS0EsR0FBR0Esc0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLHNCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsSUFBSUEsVUFBVUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7WUFDN0NBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1lBQ3BCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsZ0NBQThCQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDM0VBLENBQUNBO0lBZEhGO1FBQUNBLGVBQVVBLEVBQUVBOztxQkFlWkE7SUFBREEsbUJBQUNBO0FBQURBLENBQUNBLEFBZkQsSUFlQztBQWRZLG9CQUFZLGVBY3hCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQaXBlTWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuXG5mdW5jdGlvbiBfaXNQaXBlTWV0YWRhdGEodHlwZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlIGluc3RhbmNlb2YgUGlwZU1ldGFkYXRhO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYSBgVHlwZWAgZm9yIHtAbGluayBQaXBlTWV0YWRhdGF9LlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGlwZVJlc29sdmVyIHtcbiAgLyoqXG4gICAqIFJldHVybiB7QGxpbmsgUGlwZU1ldGFkYXRhfSBmb3IgYSBnaXZlbiBgVHlwZWAuXG4gICAqL1xuICByZXNvbHZlKHR5cGU6IFR5cGUpOiBQaXBlTWV0YWRhdGEge1xuICAgIHZhciBtZXRhcyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhyZXNvbHZlRm9yd2FyZFJlZih0eXBlKSk7XG4gICAgaWYgKGlzUHJlc2VudChtZXRhcykpIHtcbiAgICAgIHZhciBhbm5vdGF0aW9uID0gbWV0YXMuZmluZChfaXNQaXBlTWV0YWRhdGEpO1xuICAgICAgaWYgKGlzUHJlc2VudChhbm5vdGF0aW9uKSkge1xuICAgICAgICByZXR1cm4gYW5ub3RhdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIFBpcGUgZGVjb3JhdG9yIGZvdW5kIG9uICR7c3RyaW5naWZ5KHR5cGUpfWApO1xuICB9XG59XG4iXX0=