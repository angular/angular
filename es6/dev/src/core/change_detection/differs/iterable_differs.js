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
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 */
export let IterableDiffers = class {
    constructor(factories) {
        this.factories = factories;
    }
    static create(factories, parent) {
        if (isPresent(parent)) {
            var copied = ListWrapper.clone(parent.factories);
            factories = factories.concat(copied);
            return new IterableDiffers(factories);
        }
        else {
            return new IterableDiffers(factories);
        }
    }
    /**
     * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
     * inherited {@link IterableDiffers} instance with the provided factories and return a new
     * {@link IterableDiffers} instance.
     *
     * The following example shows how to extend an existing list of factories,
           * which will only be applied to the injector for this component and its children.
           * This step is all that's required to make a new {@link IterableDiffer} available.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   viewProviders: [
     *     IterableDiffers.extend([new ImmutableListDiffer()])
     *   ]
     * })
     * ```
     */
    static extend(factories) {
        return new Provider(IterableDiffers, {
            useFactory: (parent) => {
                if (isBlank(parent)) {
                    // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new BaseException('Cannot extend IterableDiffers without a parent injector');
                }
                return IterableDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[IterableDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
        });
    }
    find(iterable) {
        var factory = this.factories.find(f => f.supports(iterable));
        if (isPresent(factory)) {
            return factory;
        }
        else {
            throw new BaseException(`Cannot find a differ supporting object '${iterable}'`);
        }
    }
};
IterableDiffers = __decorate([
    Injectable(),
    CONST(), 
    __metadata('design:paramtypes', [Array])
], IterableDiffers);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbIkl0ZXJhYmxlRGlmZmVycyIsIkl0ZXJhYmxlRGlmZmVycy5jb25zdHJ1Y3RvciIsIkl0ZXJhYmxlRGlmZmVycy5jcmVhdGUiLCJJdGVyYWJsZURpZmZlcnMuZXh0ZW5kIiwiSXRlcmFibGVEaWZmZXJzLmZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBQyxNQUFNLDBCQUEwQjtPQUMzRCxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUVuRCxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFlN0Y7O0dBRUc7QUFDSDtJQUdFQSxZQUFtQkEsU0FBa0NBO1FBQWxDQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFekRELE9BQU9BLE1BQU1BLENBQUNBLFNBQWtDQSxFQUFFQSxNQUF3QkE7UUFDeEVFLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxNQUFNQSxHQUFHQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNqREEsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREY7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtCR0E7SUFDSEEsT0FBT0EsTUFBTUEsQ0FBQ0EsU0FBa0NBO1FBQzlDRyxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxlQUFlQSxFQUFFQTtZQUNuQ0EsVUFBVUEsRUFBRUEsQ0FBQ0EsTUFBdUJBO2dCQUNsQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3BCQSwwRkFBMEZBO29CQUMxRkEsS0FBS0E7b0JBQ0xBLDZFQUE2RUE7b0JBQzdFQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSx5REFBeURBLENBQUNBLENBQUNBO2dCQUNyRkEsQ0FBQ0E7Z0JBQ0RBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSw2RkFBNkZBO1lBQzdGQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxnQkFBZ0JBLEVBQUVBLEVBQUVBLElBQUlBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7U0FDMUVBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURILElBQUlBLENBQUNBLFFBQWdCQTtRQUNuQkksSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EsMkNBQTJDQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsRkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEosQ0FBQ0E7QUExREQ7SUFBQyxVQUFVLEVBQUU7SUFDWixLQUFLLEVBQUU7O29CQXlEUDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnQsIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtQcm92aWRlciwgU2tpcFNlbGZNZXRhZGF0YSwgT3B0aW9uYWxNZXRhZGF0YSwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmxlRGlmZmVyIHtcbiAgZGlmZihvYmplY3Q6IE9iamVjdCk6IGFueTtcbiAgb25EZXN0cm95KCk7XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYSBmYWN0b3J5IGZvciB7QGxpbmsgSXRlcmFibGVEaWZmZXJ9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gIHN1cHBvcnRzKG9iamVjdHM6IE9iamVjdCk6IGJvb2xlYW47XG4gIGNyZWF0ZShjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiBJdGVyYWJsZURpZmZlcjtcbn1cblxuLyoqXG4gKiBBIHJlcG9zaXRvcnkgb2YgZGlmZmVyZW50IGl0ZXJhYmxlIGRpZmZpbmcgc3RyYXRlZ2llcyB1c2VkIGJ5IE5nRm9yLCBOZ0NsYXNzLCBhbmQgb3RoZXJzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEl0ZXJhYmxlRGlmZmVycyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmYWN0b3JpZXM6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeVtdKSB7fVxuXG4gIHN0YXRpYyBjcmVhdGUoZmFjdG9yaWVzOiBJdGVyYWJsZURpZmZlckZhY3RvcnlbXSwgcGFyZW50PzogSXRlcmFibGVEaWZmZXJzKTogSXRlcmFibGVEaWZmZXJzIHtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICAgIHZhciBjb3BpZWQgPSBMaXN0V3JhcHBlci5jbG9uZShwYXJlbnQuZmFjdG9yaWVzKTtcbiAgICAgIGZhY3RvcmllcyA9IGZhY3Rvcmllcy5jb25jYXQoY29waWVkKTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmFibGVEaWZmZXJzKGZhY3Rvcmllcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgSXRlcmFibGVEaWZmZXJzKGZhY3Rvcmllcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGFycmF5IG9mIHtAbGluayBJdGVyYWJsZURpZmZlckZhY3Rvcnl9IGFuZCByZXR1cm5zIGEgcHJvdmlkZXIgdXNlZCB0byBleHRlbmQgdGhlXG4gICAqIGluaGVyaXRlZCB7QGxpbmsgSXRlcmFibGVEaWZmZXJzfSBpbnN0YW5jZSB3aXRoIHRoZSBwcm92aWRlZCBmYWN0b3JpZXMgYW5kIHJldHVybiBhIG5ld1xuICAgKiB7QGxpbmsgSXRlcmFibGVEaWZmZXJzfSBpbnN0YW5jZS5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byBleHRlbmQgYW4gZXhpc3RpbmcgbGlzdCBvZiBmYWN0b3JpZXMsXG4gICAgICAgICAqIHdoaWNoIHdpbGwgb25seSBiZSBhcHBsaWVkIHRvIHRoZSBpbmplY3RvciBmb3IgdGhpcyBjb21wb25lbnQgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICAgICAgICogVGhpcyBzdGVwIGlzIGFsbCB0aGF0J3MgcmVxdWlyZWQgdG8gbWFrZSBhIG5ldyB7QGxpbmsgSXRlcmFibGVEaWZmZXJ9IGF2YWlsYWJsZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHZpZXdQcm92aWRlcnM6IFtcbiAgICogICAgIEl0ZXJhYmxlRGlmZmVycy5leHRlbmQoW25ldyBJbW11dGFibGVMaXN0RGlmZmVyKCldKVxuICAgKiAgIF1cbiAgICogfSlcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZXh0ZW5kKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10pOiBQcm92aWRlciB7XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcihJdGVyYWJsZURpZmZlcnMsIHtcbiAgICAgIHVzZUZhY3Rvcnk6IChwYXJlbnQ6IEl0ZXJhYmxlRGlmZmVycykgPT4ge1xuICAgICAgICBpZiAoaXNCbGFuayhwYXJlbnQpKSB7XG4gICAgICAgICAgLy8gVHlwaWNhbGx5IHdvdWxkIG9jY3VyIHdoZW4gY2FsbGluZyBJdGVyYWJsZURpZmZlcnMuZXh0ZW5kIGluc2lkZSBvZiBkZXBlbmRlbmNpZXMgcGFzc2VkXG4gICAgICAgICAgLy8gdG9cbiAgICAgICAgICAvLyBib290c3RyYXAoKSwgd2hpY2ggd291bGQgb3ZlcnJpZGUgZGVmYXVsdCBwaXBlcyBpbnN0ZWFkIG9mIGV4dGVuZGluZyB0aGVtLlxuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgZXh0ZW5kIEl0ZXJhYmxlRGlmZmVycyB3aXRob3V0IGEgcGFyZW50IGluamVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEl0ZXJhYmxlRGlmZmVycy5jcmVhdGUoZmFjdG9yaWVzLCBwYXJlbnQpO1xuICAgICAgfSxcbiAgICAgIC8vIERlcGVuZGVuY3kgdGVjaG5pY2FsbHkgaXNuJ3Qgb3B0aW9uYWwsIGJ1dCB3ZSBjYW4gcHJvdmlkZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHRoaXMgd2F5LlxuICAgICAgZGVwczogW1tJdGVyYWJsZURpZmZlcnMsIG5ldyBTa2lwU2VsZk1ldGFkYXRhKCksIG5ldyBPcHRpb25hbE1ldGFkYXRhKCldXVxuICAgIH0pO1xuICB9XG5cbiAgZmluZChpdGVyYWJsZTogT2JqZWN0KTogSXRlcmFibGVEaWZmZXJGYWN0b3J5IHtcbiAgICB2YXIgZmFjdG9yeSA9IHRoaXMuZmFjdG9yaWVzLmZpbmQoZiA9PiBmLnN1cHBvcnRzKGl0ZXJhYmxlKSk7XG4gICAgaWYgKGlzUHJlc2VudChmYWN0b3J5KSkge1xuICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHtpdGVyYWJsZX0nYCk7XG4gICAgfVxuICB9XG59XG4iXX0=