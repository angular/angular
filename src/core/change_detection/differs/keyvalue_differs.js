'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9rZXl2YWx1ZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbIktleVZhbHVlRGlmZmVycyIsIktleVZhbHVlRGlmZmVycy5jb25zdHJ1Y3RvciIsIktleVZhbHVlRGlmZmVycy5jcmVhdGUiLCJLZXlWYWx1ZURpZmZlcnMuZXh0ZW5kIiwiS2V5VmFsdWVEaWZmZXJzLmZpbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF3QywwQkFBMEIsQ0FBQyxDQUFBO0FBQ25FLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTNELG1CQUF1RSxzQkFBc0IsQ0FBQyxDQUFBO0FBa0I5Rjs7R0FFRztBQUNIO0lBR0VBLHlCQUFtQkEsU0FBa0NBO1FBQWxDQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFbERELHNCQUFNQSxHQUFiQSxVQUFjQSxTQUFrQ0EsRUFBRUEsTUFBd0JBO1FBQ3hFRSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLElBQUlBLE1BQU1BLEdBQUdBLHdCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNqREEsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREY7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtCR0E7SUFDSUEsc0JBQU1BLEdBQWJBLFVBQWNBLFNBQWtDQTtRQUM5Q0csTUFBTUEsQ0FBQ0EsSUFBSUEsYUFBUUEsQ0FBQ0EsZUFBZUEsRUFBRUE7WUFDbkNBLFVBQVVBLEVBQUVBLFVBQUNBLE1BQXVCQTtnQkFDbENBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNwQkEsMEZBQTBGQTtvQkFDMUZBLEtBQUtBO29CQUNMQSw2RUFBNkVBO29CQUM3RUEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHlEQUF5REEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JGQSxDQUFDQTtnQkFDREEsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLDZGQUE2RkE7WUFDN0ZBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLGVBQWVBLEVBQUVBLElBQUlBLHFCQUFnQkEsRUFBRUEsRUFBRUEsSUFBSUEscUJBQWdCQSxFQUFFQSxDQUFDQSxDQUFDQTtTQUMxRUEsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFREgsOEJBQUlBLEdBQUpBLFVBQUtBLEVBQVVBO1FBQ2JJLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQWRBLENBQWNBLENBQUNBLENBQUNBO1FBQ3ZEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsNkNBQTJDQSxFQUFFQSxNQUFHQSxDQUFDQSxDQUFDQTtRQUM1RUEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUF6REhKO1FBQUNBLGVBQVVBLEVBQUVBO1FBQ1pBLFlBQUtBLEVBQUVBOzt3QkF5RFBBO0lBQURBLHNCQUFDQTtBQUFEQSxDQUFDQSxBQTFERCxJQTBEQztBQXhEWSx1QkFBZSxrQkF3RDNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgQ09OU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge1Byb3ZpZGVyLCBTa2lwU2VsZk1ldGFkYXRhLCBPcHRpb25hbE1ldGFkYXRhLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbi8qKlxuICogQSBkaWZmZXIgdGhhdCB0cmFja3MgY2hhbmdlcyBtYWRlIHRvIGFuIG9iamVjdCBvdmVyIHRpbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWVEaWZmZXIge1xuICBkaWZmKG9iamVjdDogYW55KTtcbiAgb25EZXN0cm95KCk7XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYSBmYWN0b3J5IGZvciB7QGxpbmsgS2V5VmFsdWVEaWZmZXJ9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEtleVZhbHVlRGlmZmVyRmFjdG9yeSB7XG4gIHN1cHBvcnRzKG9iamVjdHM6IGFueSk6IGJvb2xlYW47XG4gIGNyZWF0ZShjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiBLZXlWYWx1ZURpZmZlcjtcbn1cblxuLyoqXG4gKiBBIHJlcG9zaXRvcnkgb2YgZGlmZmVyZW50IE1hcCBkaWZmaW5nIHN0cmF0ZWdpZXMgdXNlZCBieSBOZ0NsYXNzLCBOZ1N0eWxlLCBhbmQgb3RoZXJzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEtleVZhbHVlRGlmZmVycyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmYWN0b3JpZXM6IEtleVZhbHVlRGlmZmVyRmFjdG9yeVtdKSB7fVxuXG4gIHN0YXRpYyBjcmVhdGUoZmFjdG9yaWVzOiBLZXlWYWx1ZURpZmZlckZhY3RvcnlbXSwgcGFyZW50PzogS2V5VmFsdWVEaWZmZXJzKTogS2V5VmFsdWVEaWZmZXJzIHtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICAgIHZhciBjb3BpZWQgPSBMaXN0V3JhcHBlci5jbG9uZShwYXJlbnQuZmFjdG9yaWVzKTtcbiAgICAgIGZhY3RvcmllcyA9IGZhY3Rvcmllcy5jb25jYXQoY29waWVkKTtcbiAgICAgIHJldHVybiBuZXcgS2V5VmFsdWVEaWZmZXJzKGZhY3Rvcmllcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgS2V5VmFsdWVEaWZmZXJzKGZhY3Rvcmllcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGFycmF5IG9mIHtAbGluayBLZXlWYWx1ZURpZmZlckZhY3Rvcnl9IGFuZCByZXR1cm5zIGEgcHJvdmlkZXIgdXNlZCB0byBleHRlbmQgdGhlXG4gICAqIGluaGVyaXRlZCB7QGxpbmsgS2V5VmFsdWVEaWZmZXJzfSBpbnN0YW5jZSB3aXRoIHRoZSBwcm92aWRlZCBmYWN0b3JpZXMgYW5kIHJldHVybiBhIG5ld1xuICAgKiB7QGxpbmsgS2V5VmFsdWVEaWZmZXJzfSBpbnN0YW5jZS5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byBleHRlbmQgYW4gZXhpc3RpbmcgbGlzdCBvZiBmYWN0b3JpZXMsXG4gICAgICAgICAqIHdoaWNoIHdpbGwgb25seSBiZSBhcHBsaWVkIHRvIHRoZSBpbmplY3RvciBmb3IgdGhpcyBjb21wb25lbnQgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICAgICAgICogVGhpcyBzdGVwIGlzIGFsbCB0aGF0J3MgcmVxdWlyZWQgdG8gbWFrZSBhIG5ldyB7QGxpbmsgS2V5VmFsdWVEaWZmZXJ9IGF2YWlsYWJsZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHZpZXdQcm92aWRlcnM6IFtcbiAgICogICAgIEtleVZhbHVlRGlmZmVycy5leHRlbmQoW25ldyBJbW11dGFibGVNYXBEaWZmZXIoKV0pXG4gICAqICAgXVxuICAgKiB9KVxuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBleHRlbmQoZmFjdG9yaWVzOiBLZXlWYWx1ZURpZmZlckZhY3RvcnlbXSk6IFByb3ZpZGVyIHtcbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKEtleVZhbHVlRGlmZmVycywge1xuICAgICAgdXNlRmFjdG9yeTogKHBhcmVudDogS2V5VmFsdWVEaWZmZXJzKSA9PiB7XG4gICAgICAgIGlmIChpc0JsYW5rKHBhcmVudCkpIHtcbiAgICAgICAgICAvLyBUeXBpY2FsbHkgd291bGQgb2NjdXIgd2hlbiBjYWxsaW5nIEtleVZhbHVlRGlmZmVycy5leHRlbmQgaW5zaWRlIG9mIGRlcGVuZGVuY2llcyBwYXNzZWRcbiAgICAgICAgICAvLyB0b1xuICAgICAgICAgIC8vIGJvb3RzdHJhcCgpLCB3aGljaCB3b3VsZCBvdmVycmlkZSBkZWZhdWx0IHBpcGVzIGluc3RlYWQgb2YgZXh0ZW5kaW5nIHRoZW0uXG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nhbm5vdCBleHRlbmQgS2V5VmFsdWVEaWZmZXJzIHdpdGhvdXQgYSBwYXJlbnQgaW5qZWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gS2V5VmFsdWVEaWZmZXJzLmNyZWF0ZShmYWN0b3JpZXMsIHBhcmVudCk7XG4gICAgICB9LFxuICAgICAgLy8gRGVwZW5kZW5jeSB0ZWNobmljYWxseSBpc24ndCBvcHRpb25hbCwgYnV0IHdlIGNhbiBwcm92aWRlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2UgdGhpcyB3YXkuXG4gICAgICBkZXBzOiBbW0tleVZhbHVlRGlmZmVycywgbmV3IFNraXBTZWxmTWV0YWRhdGEoKSwgbmV3IE9wdGlvbmFsTWV0YWRhdGEoKV1dXG4gICAgfSk7XG4gIH1cblxuICBmaW5kKGt2OiBPYmplY3QpOiBLZXlWYWx1ZURpZmZlckZhY3Rvcnkge1xuICAgIHZhciBmYWN0b3J5ID0gdGhpcy5mYWN0b3JpZXMuZmluZChmID0+IGYuc3VwcG9ydHMoa3YpKTtcbiAgICBpZiAoaXNQcmVzZW50KGZhY3RvcnkpKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke2t2fSdgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==