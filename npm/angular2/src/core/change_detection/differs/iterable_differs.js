'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 * @ts2dart_const
 */
var IterableDiffers = (function () {
    /*@ts2dart_const*/
    function IterableDiffers(factories) {
        this.factories = factories;
    }
    IterableDiffers.create = function (factories, parent) {
        if (lang_1.isPresent(parent)) {
            var copied = collection_1.ListWrapper.clone(parent.factories);
            factories = factories.concat(copied);
            return new IterableDiffers(factories);
        }
        else {
            return new IterableDiffers(factories);
        }
    };
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
    IterableDiffers.extend = function (factories) {
        return new di_1.Provider(IterableDiffers, {
            useFactory: function (parent) {
                if (lang_1.isBlank(parent)) {
                    // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new exceptions_1.BaseException('Cannot extend IterableDiffers without a parent injector');
                }
                return IterableDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[IterableDiffers, new di_1.SkipSelfMetadata(), new di_1.OptionalMetadata()]]
        });
    };
    IterableDiffers.prototype.find = function (iterable) {
        var factory = this.factories.find(function (f) { return f.supports(iterable); });
        if (lang_1.isPresent(factory)) {
            return factory;
        }
        else {
            throw new exceptions_1.BaseException("Cannot find a differ supporting object '" + iterable + "' of type '" + lang_1.getTypeNameForDebugging(iterable) + "'");
        }
    };
    return IterableDiffers;
}());
exports.IterableDiffers = IterableDiffers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRiwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUUzRCxtQkFBdUUsc0JBQXNCLENBQUMsQ0FBQTtBQTBCOUY7OztHQUdHO0FBQ0g7SUFDRSxrQkFBa0I7SUFDbEIseUJBQW1CLFNBQWtDO1FBQWxDLGNBQVMsR0FBVCxTQUFTLENBQXlCO0lBQUcsQ0FBQztJQUVsRCxzQkFBTSxHQUFiLFVBQWMsU0FBa0MsRUFBRSxNQUF3QjtRQUN4RSxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLE1BQU0sR0FBRyx3QkFBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrQkc7SUFDSSxzQkFBTSxHQUFiLFVBQWMsU0FBa0M7UUFDOUMsTUFBTSxDQUFDLElBQUksYUFBUSxDQUFDLGVBQWUsRUFBRTtZQUNuQyxVQUFVLEVBQUUsVUFBQyxNQUF1QjtnQkFDbEMsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEIsMEZBQTBGO29CQUMxRixLQUFLO29CQUNMLDZFQUE2RTtvQkFDN0UsTUFBTSxJQUFJLDBCQUFhLENBQUMseURBQXlELENBQUMsQ0FBQztnQkFDckYsQ0FBQztnQkFDRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkQsQ0FBQztZQUNELDZGQUE2RjtZQUM3RixJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxJQUFJLHFCQUFnQixFQUFFLEVBQUUsSUFBSSxxQkFBZ0IsRUFBRSxDQUFDLENBQUM7U0FDMUUsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDhCQUFJLEdBQUosVUFBSyxRQUFhO1FBQ2hCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1FBQzdELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxJQUFJLDBCQUFhLENBQ25CLDZDQUEyQyxRQUFRLG1CQUFjLDhCQUF1QixDQUFDLFFBQVEsQ0FBQyxNQUFHLENBQUMsQ0FBQztRQUM3RyxDQUFDO0lBQ0gsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQTFERCxJQTBEQztBQTFEWSx1QkFBZSxrQkEwRDNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge1Byb3ZpZGVyLCBTa2lwU2VsZk1ldGFkYXRhLCBPcHRpb25hbE1ldGFkYXRhLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbi8qKlxuICogQSBzdHJhdGVneSBmb3IgdHJhY2tpbmcgY2hhbmdlcyBvdmVyIHRpbWUgdG8gYW4gaXRlcmFibGUuIFVzZWQgZm9yIHtAbGluayBOZ0Zvcn0gdG9cbiAqIHJlc3BvbmQgdG8gY2hhbmdlcyBpbiBhbiBpdGVyYWJsZSBieSBlZmZlY3RpbmcgZXF1aXZhbGVudCBjaGFuZ2VzIGluIHRoZSBET00uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFibGVEaWZmZXIge1xuICBkaWZmKG9iamVjdDogYW55KTogYW55O1xuICBvbkRlc3Ryb3koKTtcbn1cblxuLyoqXG4gICogQW4gb3B0aW9uYWwgZnVuY3Rpb24gcGFzc2VkIGludG8ge0BsaW5rIE5nRm9yfSB0aGF0IGRlZmluZXMgaG93IHRvIHRyYWNrXG4gICogaXRlbXMgaW4gYW4gaXRlcmFibGUgKGUuZy4gYnkgaW5kZXggb3IgaWQpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhY2tCeUZuIHsgKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSk6IGFueTsgfVxuXG5cbi8qKlxuICogUHJvdmlkZXMgYSBmYWN0b3J5IGZvciB7QGxpbmsgSXRlcmFibGVEaWZmZXJ9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gIHN1cHBvcnRzKG9iamVjdHM6IGFueSk6IGJvb2xlYW47XG4gIGNyZWF0ZShjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHRyYWNrQnlGbj86IFRyYWNrQnlGbik6IEl0ZXJhYmxlRGlmZmVyO1xufVxuXG4vKipcbiAqIEEgcmVwb3NpdG9yeSBvZiBkaWZmZXJlbnQgaXRlcmFibGUgZGlmZmluZyBzdHJhdGVnaWVzIHVzZWQgYnkgTmdGb3IsIE5nQ2xhc3MsIGFuZCBvdGhlcnMuXG4gKiBAdHMyZGFydF9jb25zdFxuICovXG5leHBvcnQgY2xhc3MgSXRlcmFibGVEaWZmZXJzIHtcbiAgLypAdHMyZGFydF9jb25zdCovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmYWN0b3JpZXM6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeVtdKSB7fVxuXG4gIHN0YXRpYyBjcmVhdGUoZmFjdG9yaWVzOiBJdGVyYWJsZURpZmZlckZhY3RvcnlbXSwgcGFyZW50PzogSXRlcmFibGVEaWZmZXJzKTogSXRlcmFibGVEaWZmZXJzIHtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICAgIHZhciBjb3BpZWQgPSBMaXN0V3JhcHBlci5jbG9uZShwYXJlbnQuZmFjdG9yaWVzKTtcbiAgICAgIGZhY3RvcmllcyA9IGZhY3Rvcmllcy5jb25jYXQoY29waWVkKTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmFibGVEaWZmZXJzKGZhY3Rvcmllcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgSXRlcmFibGVEaWZmZXJzKGZhY3Rvcmllcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGFycmF5IG9mIHtAbGluayBJdGVyYWJsZURpZmZlckZhY3Rvcnl9IGFuZCByZXR1cm5zIGEgcHJvdmlkZXIgdXNlZCB0byBleHRlbmQgdGhlXG4gICAqIGluaGVyaXRlZCB7QGxpbmsgSXRlcmFibGVEaWZmZXJzfSBpbnN0YW5jZSB3aXRoIHRoZSBwcm92aWRlZCBmYWN0b3JpZXMgYW5kIHJldHVybiBhIG5ld1xuICAgKiB7QGxpbmsgSXRlcmFibGVEaWZmZXJzfSBpbnN0YW5jZS5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHNob3dzIGhvdyB0byBleHRlbmQgYW4gZXhpc3RpbmcgbGlzdCBvZiBmYWN0b3JpZXMsXG4gICAgICAgICAqIHdoaWNoIHdpbGwgb25seSBiZSBhcHBsaWVkIHRvIHRoZSBpbmplY3RvciBmb3IgdGhpcyBjb21wb25lbnQgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICAgICAgICogVGhpcyBzdGVwIGlzIGFsbCB0aGF0J3MgcmVxdWlyZWQgdG8gbWFrZSBhIG5ldyB7QGxpbmsgSXRlcmFibGVEaWZmZXJ9IGF2YWlsYWJsZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHZpZXdQcm92aWRlcnM6IFtcbiAgICogICAgIEl0ZXJhYmxlRGlmZmVycy5leHRlbmQoW25ldyBJbW11dGFibGVMaXN0RGlmZmVyKCldKVxuICAgKiAgIF1cbiAgICogfSlcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZXh0ZW5kKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10pOiBQcm92aWRlciB7XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcihJdGVyYWJsZURpZmZlcnMsIHtcbiAgICAgIHVzZUZhY3Rvcnk6IChwYXJlbnQ6IEl0ZXJhYmxlRGlmZmVycykgPT4ge1xuICAgICAgICBpZiAoaXNCbGFuayhwYXJlbnQpKSB7XG4gICAgICAgICAgLy8gVHlwaWNhbGx5IHdvdWxkIG9jY3VyIHdoZW4gY2FsbGluZyBJdGVyYWJsZURpZmZlcnMuZXh0ZW5kIGluc2lkZSBvZiBkZXBlbmRlbmNpZXMgcGFzc2VkXG4gICAgICAgICAgLy8gdG9cbiAgICAgICAgICAvLyBib290c3RyYXAoKSwgd2hpY2ggd291bGQgb3ZlcnJpZGUgZGVmYXVsdCBwaXBlcyBpbnN0ZWFkIG9mIGV4dGVuZGluZyB0aGVtLlxuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgZXh0ZW5kIEl0ZXJhYmxlRGlmZmVycyB3aXRob3V0IGEgcGFyZW50IGluamVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEl0ZXJhYmxlRGlmZmVycy5jcmVhdGUoZmFjdG9yaWVzLCBwYXJlbnQpO1xuICAgICAgfSxcbiAgICAgIC8vIERlcGVuZGVuY3kgdGVjaG5pY2FsbHkgaXNuJ3Qgb3B0aW9uYWwsIGJ1dCB3ZSBjYW4gcHJvdmlkZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHRoaXMgd2F5LlxuICAgICAgZGVwczogW1tJdGVyYWJsZURpZmZlcnMsIG5ldyBTa2lwU2VsZk1ldGFkYXRhKCksIG5ldyBPcHRpb25hbE1ldGFkYXRhKCldXVxuICAgIH0pO1xuICB9XG5cbiAgZmluZChpdGVyYWJsZTogYW55KTogSXRlcmFibGVEaWZmZXJGYWN0b3J5IHtcbiAgICB2YXIgZmFjdG9yeSA9IHRoaXMuZmFjdG9yaWVzLmZpbmQoZiA9PiBmLnN1cHBvcnRzKGl0ZXJhYmxlKSk7XG4gICAgaWYgKGlzUHJlc2VudChmYWN0b3J5KSkge1xuICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBDYW5ub3QgZmluZCBhIGRpZmZlciBzdXBwb3J0aW5nIG9iamVjdCAnJHtpdGVyYWJsZX0nIG9mIHR5cGUgJyR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcoaXRlcmFibGUpfSdgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==