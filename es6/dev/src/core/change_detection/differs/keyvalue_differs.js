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
import { isBlank, isPresent, CONST } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { Provider, SkipSelfMetadata, OptionalMetadata, Injectable } from 'angular2/src/core/di';
/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 */
export let KeyValueDiffers = class {
    constructor(factories) {
        this.factories = factories;
    }
    static create(factories, parent) {
        if (isPresent(parent)) {
            var copied = ListWrapper.clone(parent.factories);
            factories = factories.concat(copied);
            return new KeyValueDiffers(factories);
        }
        else {
            return new KeyValueDiffers(factories);
        }
    }
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
    static extend(factories) {
        return new Provider(KeyValueDiffers, {
            useFactory: (parent) => {
                if (isBlank(parent)) {
                    // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new BaseException('Cannot extend KeyValueDiffers without a parent injector');
                }
                return KeyValueDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[KeyValueDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
        });
    }
    find(kv) {
        var factory = this.factories.find(f => f.supports(kv));
        if (isPresent(factory)) {
            return factory;
        }
        else {
            throw new BaseException(`Cannot find a differ supporting object '${kv}'`);
        }
    }
};
KeyValueDiffers = __decorate([
    Injectable(),
    CONST(), 
    __metadata('design:paramtypes', [Array])
], KeyValueDiffers);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9rZXl2YWx1ZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbIktleVZhbHVlRGlmZmVycyIsIktleVZhbHVlRGlmZmVycy5jb25zdHJ1Y3RvciIsIktleVZhbHVlRGlmZmVycy5jcmVhdGUiLCJLZXlWYWx1ZURpZmZlcnMuZXh0ZW5kIiwiS2V5VmFsdWVEaWZmZXJzLmZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBQyxNQUFNLDBCQUEwQjtPQUMzRCxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUVuRCxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFlN0Y7O0dBRUc7QUFDSDtJQUdFQSxZQUFtQkEsU0FBa0NBO1FBQWxDQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFekRELE9BQU9BLE1BQU1BLENBQUNBLFNBQWtDQSxFQUFFQSxNQUF3QkE7UUFDeEVFLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxNQUFNQSxHQUFHQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNqREEsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREY7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtCR0E7SUFDSEEsT0FBT0EsTUFBTUEsQ0FBQ0EsU0FBa0NBO1FBQzlDRyxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxlQUFlQSxFQUFFQTtZQUNuQ0EsVUFBVUEsRUFBRUEsQ0FBQ0EsTUFBdUJBO2dCQUNsQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3BCQSwwRkFBMEZBO29CQUMxRkEsS0FBS0E7b0JBQ0xBLDZFQUE2RUE7b0JBQzdFQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSx5REFBeURBLENBQUNBLENBQUNBO2dCQUNyRkEsQ0FBQ0E7Z0JBQ0RBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSw2RkFBNkZBO1lBQzdGQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxnQkFBZ0JBLEVBQUVBLEVBQUVBLElBQUlBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7U0FDMUVBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURILElBQUlBLENBQUNBLEVBQVVBO1FBQ2JJLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLDJDQUEyQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hKLENBQUNBO0FBMUREO0lBQUMsVUFBVSxFQUFFO0lBQ1osS0FBSyxFQUFFOztvQkF5RFA7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7UHJvdmlkZXIsIFNraXBTZWxmTWV0YWRhdGEsIE9wdGlvbmFsTWV0YWRhdGEsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZURpZmZlciB7XG4gIGRpZmYob2JqZWN0OiBPYmplY3QpO1xuICBvbkRlc3Ryb3koKTtcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBhIGZhY3RvcnkgZm9yIHtAbGluayBLZXlWYWx1ZURpZmZlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWVEaWZmZXJGYWN0b3J5IHtcbiAgc3VwcG9ydHMob2JqZWN0czogT2JqZWN0KTogYm9vbGVhbjtcbiAgY3JlYXRlKGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZik6IEtleVZhbHVlRGlmZmVyO1xufVxuXG4vKipcbiAqIEEgcmVwb3NpdG9yeSBvZiBkaWZmZXJlbnQgTWFwIGRpZmZpbmcgc3RyYXRlZ2llcyB1c2VkIGJ5IE5nQ2xhc3MsIE5nU3R5bGUsIGFuZCBvdGhlcnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgS2V5VmFsdWVEaWZmZXJzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGZhY3RvcmllczogS2V5VmFsdWVEaWZmZXJGYWN0b3J5W10pIHt9XG5cbiAgc3RhdGljIGNyZWF0ZShmYWN0b3JpZXM6IEtleVZhbHVlRGlmZmVyRmFjdG9yeVtdLCBwYXJlbnQ/OiBLZXlWYWx1ZURpZmZlcnMpOiBLZXlWYWx1ZURpZmZlcnMge1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSkge1xuICAgICAgdmFyIGNvcGllZCA9IExpc3RXcmFwcGVyLmNsb25lKHBhcmVudC5mYWN0b3JpZXMpO1xuICAgICAgZmFjdG9yaWVzID0gZmFjdG9yaWVzLmNvbmNhdChjb3BpZWQpO1xuICAgICAgcmV0dXJuIG5ldyBLZXlWYWx1ZURpZmZlcnMoZmFjdG9yaWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBLZXlWYWx1ZURpZmZlcnMoZmFjdG9yaWVzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYW4gYXJyYXkgb2Yge0BsaW5rIEtleVZhbHVlRGlmZmVyRmFjdG9yeX0gYW5kIHJldHVybnMgYSBwcm92aWRlciB1c2VkIHRvIGV4dGVuZCB0aGVcbiAgICogaW5oZXJpdGVkIHtAbGluayBLZXlWYWx1ZURpZmZlcnN9IGluc3RhbmNlIHdpdGggdGhlIHByb3ZpZGVkIGZhY3RvcmllcyBhbmQgcmV0dXJuIGEgbmV3XG4gICAqIHtAbGluayBLZXlWYWx1ZURpZmZlcnN9IGluc3RhbmNlLlxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGV4dGVuZCBhbiBleGlzdGluZyBsaXN0IG9mIGZhY3RvcmllcyxcbiAgICAgICAgICogd2hpY2ggd2lsbCBvbmx5IGJlIGFwcGxpZWQgdG8gdGhlIGluamVjdG9yIGZvciB0aGlzIGNvbXBvbmVudCBhbmQgaXRzIGNoaWxkcmVuLlxuICAgICAgICAgKiBUaGlzIHN0ZXAgaXMgYWxsIHRoYXQncyByZXF1aXJlZCB0byBtYWtlIGEgbmV3IHtAbGluayBLZXlWYWx1ZURpZmZlcn0gYXZhaWxhYmxlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgdmlld1Byb3ZpZGVyczogW1xuICAgKiAgICAgS2V5VmFsdWVEaWZmZXJzLmV4dGVuZChbbmV3IEltbXV0YWJsZU1hcERpZmZlcigpXSlcbiAgICogICBdXG4gICAqIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGV4dGVuZChmYWN0b3JpZXM6IEtleVZhbHVlRGlmZmVyRmFjdG9yeVtdKTogUHJvdmlkZXIge1xuICAgIHJldHVybiBuZXcgUHJvdmlkZXIoS2V5VmFsdWVEaWZmZXJzLCB7XG4gICAgICB1c2VGYWN0b3J5OiAocGFyZW50OiBLZXlWYWx1ZURpZmZlcnMpID0+IHtcbiAgICAgICAgaWYgKGlzQmxhbmsocGFyZW50KSkge1xuICAgICAgICAgIC8vIFR5cGljYWxseSB3b3VsZCBvY2N1ciB3aGVuIGNhbGxpbmcgS2V5VmFsdWVEaWZmZXJzLmV4dGVuZCBpbnNpZGUgb2YgZGVwZW5kZW5jaWVzIHBhc3NlZFxuICAgICAgICAgIC8vIHRvXG4gICAgICAgICAgLy8gYm9vdHN0cmFwKCksIHdoaWNoIHdvdWxkIG92ZXJyaWRlIGRlZmF1bHQgcGlwZXMgaW5zdGVhZCBvZiBleHRlbmRpbmcgdGhlbS5cbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IGV4dGVuZCBLZXlWYWx1ZURpZmZlcnMgd2l0aG91dCBhIHBhcmVudCBpbmplY3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBLZXlWYWx1ZURpZmZlcnMuY3JlYXRlKGZhY3RvcmllcywgcGFyZW50KTtcbiAgICAgIH0sXG4gICAgICAvLyBEZXBlbmRlbmN5IHRlY2huaWNhbGx5IGlzbid0IG9wdGlvbmFsLCBidXQgd2UgY2FuIHByb3ZpZGUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSB0aGlzIHdheS5cbiAgICAgIGRlcHM6IFtbS2V5VmFsdWVEaWZmZXJzLCBuZXcgU2tpcFNlbGZNZXRhZGF0YSgpLCBuZXcgT3B0aW9uYWxNZXRhZGF0YSgpXV1cbiAgICB9KTtcbiAgfVxuXG4gIGZpbmQoa3Y6IE9iamVjdCk6IEtleVZhbHVlRGlmZmVyRmFjdG9yeSB7XG4gICAgdmFyIGZhY3RvcnkgPSB0aGlzLmZhY3Rvcmllcy5maW5kKGYgPT4gZi5zdXBwb3J0cyhrdikpO1xuICAgIGlmIChpc1ByZXNlbnQoZmFjdG9yeSkpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7a3Z9J2ApO1xuICAgIH1cbiAgfVxufVxuIl19