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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 */
var KeyValueDiffers = (function () {
    function KeyValueDiffers(factories) {
        this.factories = factories;
    }
    KeyValueDiffers.create = function (factories, parent) {
        if (lang_1.isPresent(parent)) {
            var copied = collection_1.ListWrapper.clone(parent.factories);
            factories = factories.concat(copied);
            return new KeyValueDiffers(factories);
        }
        else {
            return new KeyValueDiffers(factories);
        }
    };
    /**
     * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
     * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
     * {@link KeyValueDiffers} instance.
     *
     * The following example shows how to extend an existing list of factories,
           * which will only be applied to the injector for this component and its children.
           * This step is all that's required to make a new {@link KeyValueDiffer} available.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   viewProviders: [
     *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
     *   ]
     * })
     * ```
     */
    KeyValueDiffers.extend = function (factories) {
        return new di_1.Provider(KeyValueDiffers, {
            useFactory: function (parent) {
                if (lang_1.isBlank(parent)) {
                    // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new exceptions_1.BaseException('Cannot extend KeyValueDiffers without a parent injector');
                }
                return KeyValueDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[KeyValueDiffers, new di_1.SkipSelfMetadata(), new di_1.OptionalMetadata()]]
        });
    };
    KeyValueDiffers.prototype.find = function (kv) {
        var factory = this.factories.find(function (f) { return f.supports(kv); });
        if (lang_1.isPresent(factory)) {
            return factory;
        }
        else {
            throw new exceptions_1.BaseException("Cannot find a differ supporting object '" + kv + "'");
        }
    };
    KeyValueDiffers = __decorate([
        di_1.Injectable(),
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Array])
    ], KeyValueDiffers);
    return KeyValueDiffers;
})();
exports.KeyValueDiffers = KeyValueDiffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9rZXl2YWx1ZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbIktleVZhbHVlRGlmZmVycyIsIktleVZhbHVlRGlmZmVycy5jb25zdHJ1Y3RvciIsIktleVZhbHVlRGlmZmVycy5jcmVhdGUiLCJLZXlWYWx1ZURpZmZlcnMuZXh0ZW5kIiwiS2V5VmFsdWVEaWZmZXJzLmZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFDbkUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFFM0QsbUJBQXVFLHNCQUFzQixDQUFDLENBQUE7QUFlOUY7O0dBRUc7QUFDSDtJQUdFQSx5QkFBbUJBLFNBQWtDQTtRQUFsQ0MsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBeUJBO0lBQUdBLENBQUNBO0lBRWxERCxzQkFBTUEsR0FBYkEsVUFBY0EsU0FBa0NBLEVBQUVBLE1BQXdCQTtRQUN4RUUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxNQUFNQSxHQUFHQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrQkdBO0lBQ0lBLHNCQUFNQSxHQUFiQSxVQUFjQSxTQUFrQ0E7UUFDOUNHLE1BQU1BLENBQUNBLElBQUlBLGFBQVFBLENBQUNBLGVBQWVBLEVBQUVBO1lBQ25DQSxVQUFVQSxFQUFFQSxVQUFDQSxNQUF1QkE7Z0JBQ2xDQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDcEJBLDBGQUEwRkE7b0JBQzFGQSxLQUFLQTtvQkFDTEEsNkVBQTZFQTtvQkFDN0VBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSx5REFBeURBLENBQUNBLENBQUNBO2dCQUNyRkEsQ0FBQ0E7Z0JBQ0RBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSw2RkFBNkZBO1lBQzdGQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxxQkFBZ0JBLEVBQUVBLEVBQUVBLElBQUlBLHFCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7U0FDMUVBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURILDhCQUFJQSxHQUFKQSxVQUFLQSxFQUFVQTtRQUNiSSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFkQSxDQUFjQSxDQUFDQSxDQUFDQTtRQUN2REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDZDQUEyQ0EsRUFBRUEsTUFBR0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLENBQUNBO0lBQ0hBLENBQUNBO0lBekRISjtRQUFDQSxlQUFVQSxFQUFFQTtRQUNaQSxZQUFLQSxFQUFFQTs7d0JBeURQQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUExREQsSUEwREM7QUF4RFksdUJBQWUsa0JBd0QzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnQsIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtQcm92aWRlciwgU2tpcFNlbGZNZXRhZGF0YSwgT3B0aW9uYWxNZXRhZGF0YSwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleVZhbHVlRGlmZmVyIHtcbiAgZGlmZihvYmplY3Q6IE9iamVjdCk7XG4gIG9uRGVzdHJveSgpO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGEgZmFjdG9yeSBmb3Ige0BsaW5rIEtleVZhbHVlRGlmZmVyfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZURpZmZlckZhY3Rvcnkge1xuICBzdXBwb3J0cyhvYmplY3RzOiBPYmplY3QpOiBib29sZWFuO1xuICBjcmVhdGUoY2RSZWY6IENoYW5nZURldGVjdG9yUmVmKTogS2V5VmFsdWVEaWZmZXI7XG59XG5cbi8qKlxuICogQSByZXBvc2l0b3J5IG9mIGRpZmZlcmVudCBNYXAgZGlmZmluZyBzdHJhdGVnaWVzIHVzZWQgYnkgTmdDbGFzcywgTmdTdHlsZSwgYW5kIG90aGVycy5cbiAqL1xuQEluamVjdGFibGUoKVxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBLZXlWYWx1ZURpZmZlcnMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmFjdG9yaWVzOiBLZXlWYWx1ZURpZmZlckZhY3RvcnlbXSkge31cblxuICBzdGF0aWMgY3JlYXRlKGZhY3RvcmllczogS2V5VmFsdWVEaWZmZXJGYWN0b3J5W10sIHBhcmVudD86IEtleVZhbHVlRGlmZmVycyk6IEtleVZhbHVlRGlmZmVycyB7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnQpKSB7XG4gICAgICB2YXIgY29waWVkID0gTGlzdFdyYXBwZXIuY2xvbmUocGFyZW50LmZhY3Rvcmllcyk7XG4gICAgICBmYWN0b3JpZXMgPSBmYWN0b3JpZXMuY29uY2F0KGNvcGllZCk7XG4gICAgICByZXR1cm4gbmV3IEtleVZhbHVlRGlmZmVycyhmYWN0b3JpZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEtleVZhbHVlRGlmZmVycyhmYWN0b3JpZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhcnJheSBvZiB7QGxpbmsgS2V5VmFsdWVEaWZmZXJGYWN0b3J5fSBhbmQgcmV0dXJucyBhIHByb3ZpZGVyIHVzZWQgdG8gZXh0ZW5kIHRoZVxuICAgKiBpbmhlcml0ZWQge0BsaW5rIEtleVZhbHVlRGlmZmVyc30gaW5zdGFuY2Ugd2l0aCB0aGUgcHJvdmlkZWQgZmFjdG9yaWVzIGFuZCByZXR1cm4gYSBuZXdcbiAgICoge0BsaW5rIEtleVZhbHVlRGlmZmVyc30gaW5zdGFuY2UuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gZXh0ZW5kIGFuIGV4aXN0aW5nIGxpc3Qgb2YgZmFjdG9yaWVzLFxuICAgICAgICAgKiB3aGljaCB3aWxsIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgaW5qZWN0b3IgZm9yIHRoaXMgY29tcG9uZW50IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAgICAgICAqIFRoaXMgc3RlcCBpcyBhbGwgdGhhdCdzIHJlcXVpcmVkIHRvIG1ha2UgYSBuZXcge0BsaW5rIEtleVZhbHVlRGlmZmVyfSBhdmFpbGFibGUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBLZXlWYWx1ZURpZmZlcnMuZXh0ZW5kKFtuZXcgSW1tdXRhYmxlTWFwRGlmZmVyKCldKVxuICAgKiAgIF1cbiAgICogfSlcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZXh0ZW5kKGZhY3RvcmllczogS2V5VmFsdWVEaWZmZXJGYWN0b3J5W10pOiBQcm92aWRlciB7XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcihLZXlWYWx1ZURpZmZlcnMsIHtcbiAgICAgIHVzZUZhY3Rvcnk6IChwYXJlbnQ6IEtleVZhbHVlRGlmZmVycykgPT4ge1xuICAgICAgICBpZiAoaXNCbGFuayhwYXJlbnQpKSB7XG4gICAgICAgICAgLy8gVHlwaWNhbGx5IHdvdWxkIG9jY3VyIHdoZW4gY2FsbGluZyBLZXlWYWx1ZURpZmZlcnMuZXh0ZW5kIGluc2lkZSBvZiBkZXBlbmRlbmNpZXMgcGFzc2VkXG4gICAgICAgICAgLy8gdG9cbiAgICAgICAgICAvLyBib290c3RyYXAoKSwgd2hpY2ggd291bGQgb3ZlcnJpZGUgZGVmYXVsdCBwaXBlcyBpbnN0ZWFkIG9mIGV4dGVuZGluZyB0aGVtLlxuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgZXh0ZW5kIEtleVZhbHVlRGlmZmVycyB3aXRob3V0IGEgcGFyZW50IGluamVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEtleVZhbHVlRGlmZmVycy5jcmVhdGUoZmFjdG9yaWVzLCBwYXJlbnQpO1xuICAgICAgfSxcbiAgICAgIC8vIERlcGVuZGVuY3kgdGVjaG5pY2FsbHkgaXNuJ3Qgb3B0aW9uYWwsIGJ1dCB3ZSBjYW4gcHJvdmlkZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHRoaXMgd2F5LlxuICAgICAgZGVwczogW1tLZXlWYWx1ZURpZmZlcnMsIG5ldyBTa2lwU2VsZk1ldGFkYXRhKCksIG5ldyBPcHRpb25hbE1ldGFkYXRhKCldXVxuICAgIH0pO1xuICB9XG5cbiAgZmluZChrdjogT2JqZWN0KTogS2V5VmFsdWVEaWZmZXJGYWN0b3J5IHtcbiAgICB2YXIgZmFjdG9yeSA9IHRoaXMuZmFjdG9yaWVzLmZpbmQoZiA9PiBmLnN1cHBvcnRzKGt2KSk7XG4gICAgaWYgKGlzUHJlc2VudChmYWN0b3J5KSkge1xuICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHtrdn0nYCk7XG4gICAgfVxuICB9XG59XG4iXX0=