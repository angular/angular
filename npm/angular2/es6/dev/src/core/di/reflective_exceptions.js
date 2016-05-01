import { ListWrapper } from 'angular2/src/facade/collection';
import { stringify, isBlank } from 'angular2/src/facade/lang';
import { BaseException, WrappedException } from 'angular2/src/facade/exceptions';
function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
        if (ListWrapper.contains(res, keys[i])) {
            res.push(keys[i]);
            return res;
        }
        else {
            res.push(keys[i]);
        }
    }
    return res;
}
function constructResolvingPath(keys) {
    if (keys.length > 1) {
        var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
        var tokenStrs = reversed.map(k => stringify(k.token));
        return " (" + tokenStrs.join(' -> ') + ")";
    }
    else {
        return "";
    }
}
/**
 * Base class for all errors arising from misconfigured providers.
 */
export class AbstractProviderError extends BaseException {
    constructor(injector, key, constructResolvingMessage) {
        super("DI Exception");
        this.keys = [key];
        this.injectors = [injector];
        this.constructResolvingMessage = constructResolvingMessage;
        this.message = this.constructResolvingMessage(this.keys);
    }
    addKey(injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
        this.message = this.constructResolvingMessage(this.keys);
    }
    get context() { return this.injectors[this.injectors.length - 1].debugContext(); }
}
/**
 * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
 * {@link Injector} does not have a {@link Provider} for {@link Key}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vq8D3FRB9aGbnWJqtEPE?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b:B) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 */
export class NoProviderError extends AbstractProviderError {
    constructor(injector, key) {
        super(injector, key, function (keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return `No provider for ${first}!${constructResolvingPath(keys)}`;
        });
    }
}
/**
 * Thrown when dependencies form a cycle.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wYQdNos0Tzql3ei1EV9j?p=info))
 *
 * ```typescript
 * var injector = Injector.resolveAndCreate([
 *   provide("one", {useFactory: (two) => "two", deps: [[new Inject("two")]]}),
 *   provide("two", {useFactory: (one) => "one", deps: [[new Inject("one")]]})
 * ]);
 *
 * expect(() => injector.get("one")).toThrowError();
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 */
export class CyclicDependencyError extends AbstractProviderError {
    constructor(injector, key) {
        super(injector, key, function (keys) {
            return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
        });
    }
}
/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7aWYdcqTQsP0eNqEdUAf?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor() {
 *     throw new Error('message');
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([A]);

 * try {
 *   injector.get(A);
 * } catch (e) {
 *   expect(e instanceof InstantiationError).toBe(true);
 *   expect(e.originalException.message).toEqual("message");
 *   expect(e.originalStack).toBeDefined();
 * }
 * ```
 */
export class InstantiationError extends WrappedException {
    constructor(injector, originalException, originalStack, key) {
        super("DI Exception", originalException, originalStack, null);
        this.keys = [key];
        this.injectors = [injector];
    }
    addKey(injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
    }
    get wrapperMessage() {
        var first = stringify(ListWrapper.first(this.keys).token);
        return `Error during instantiation of ${first}!${constructResolvingPath(this.keys)}.`;
    }
    get causeKey() { return this.keys[0]; }
    get context() { return this.injectors[this.injectors.length - 1].debugContext(); }
}
/**
 * Thrown when an object other then {@link Provider} (or `Type`) is passed to {@link Injector}
 * creation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/YatCFbPAMCL0JSSQ4mvH?p=preview))
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
 * ```
 */
export class InvalidProviderError extends BaseException {
    constructor(provider) {
        super("Invalid provider - only instances of Provider and Type are allowed, got: " +
            provider.toString());
    }
}
/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the {@link Injector} from determining which dependencies
 * need to be injected into the constructor.
 *
 * ### Example ([live demo](http://plnkr.co/edit/rHnZtlNS7vJOPQ6pcVkm?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 *
 * This error is also thrown when the class not marked with {@link Injectable} has parameter types.
 *
 * ```typescript
 * class B {}
 *
 * class A {
 *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
 * }
 *
 * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
 * ```
 */
export class NoAnnotationError extends BaseException {
    constructor(typeOrFunc, params) {
        super(NoAnnotationError._genMessage(typeOrFunc, params));
    }
    static _genMessage(typeOrFunc, params) {
        var signature = [];
        for (var i = 0, ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (isBlank(parameter) || parameter.length == 0) {
                signature.push('?');
            }
            else {
                signature.push(parameter.map(stringify).join(' '));
            }
        }
        return "Cannot resolve all parameters for '" + stringify(typeOrFunc) + "'(" +
            signature.join(', ') + "). " +
            "Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" +
            stringify(typeOrFunc) + "' is decorated with Injectable.";
    }
}
/**
 * Thrown when getting an object by index.
 *
 * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
 *
 * ```typescript
 * class A {}
 *
 * var injector = Injector.resolveAndCreate([A]);
 *
 * expect(() => injector.getAt(100)).toThrowError();
 * ```
 */
export class OutOfBoundsError extends BaseException {
    constructor(index) {
        super(`Index ${index} is out-of-bounds.`);
    }
}
// TODO: add a working example after alpha38 is released
/**
 * Thrown when a multi provider and a regular provider are bound to the same token.
 *
 * ### Example
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate([
 *   new Provider("Strings", {useValue: "string1", multi: true}),
 *   new Provider("Strings", {useValue: "string2", multi: false})
 * ])).toThrowError();
 * ```
 */
export class MixingMultiProvidersWithRegularProvidersError extends BaseException {
    constructor(provider1, provider2) {
        super("Cannot mix multi providers and regular providers, got: " + provider1.toString() + " " +
            provider2.toString());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdGl2ZV9leGNlcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvZGkvcmVmbGVjdGl2ZV9leGNlcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ25ELEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUNwRCxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBZ0IsTUFBTSxnQ0FBZ0M7QUFJN0YsOEJBQThCLElBQVc7SUFDdkMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELGdDQUFnQyxJQUFXO0lBQ3pDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxD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QUNoRCxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLHFDQUFxQyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJO1lBQ3BFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSztZQUM1Qix1R0FBdUc7WUFDdkcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLGlDQUFpQyxDQUFDO0lBQ25FLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsc0NBQXNDLGFBQWE7SUFDakQsWUFBWSxLQUFLO1FBQUksTUFBTSxTQUFTLEtBQUssb0JBQW9CLENBQUMsQ0FBQztJQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVELHdEQUF3RDtBQUN4RDs7Ozs7Ozs7Ozs7R0FXRztBQUNILG1FQUFtRSxhQUFhO0lBQzlFLFlBQVksU0FBUyxFQUFFLFNBQVM7UUFDOUIsTUFBTSx5REFBeUQsR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRztZQUN0RixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0FBQ0gsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7c3RyaW5naWZ5LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9uLCB1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtSZWZsZWN0aXZlS2V5fSBmcm9tICcuL3JlZmxlY3RpdmVfa2V5JztcbmltcG9ydCB7UmVmbGVjdGl2ZUluamVjdG9yfSBmcm9tICcuL3JlZmxlY3RpdmVfaW5qZWN0b3InO1xuXG5mdW5jdGlvbiBmaW5kRmlyc3RDbG9zZWRDeWNsZShrZXlzOiBhbnlbXSk6IGFueVtdIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMocmVzLCBrZXlzW2ldKSkge1xuICAgICAgcmVzLnB1c2goa2V5c1tpXSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMucHVzaChrZXlzW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0UmVzb2x2aW5nUGF0aChrZXlzOiBhbnlbXSk6IHN0cmluZyB7XG4gIGlmIChrZXlzLmxlbmd0aCA+IDEpIHtcbiAgICB2YXIgcmV2ZXJzZWQgPSBmaW5kRmlyc3RDbG9zZWRDeWNsZShMaXN0V3JhcHBlci5yZXZlcnNlZChrZXlzKSk7XG4gICAgdmFyIHRva2VuU3RycyA9IHJldmVyc2VkLm1hcChrID0+IHN0cmluZ2lmeShrLnRva2VuKSk7XG4gICAgcmV0dXJuIFwiIChcIiArIHRva2VuU3Rycy5qb2luKCcgLT4gJykgKyBcIilcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxufVxuXG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIGVycm9ycyBhcmlzaW5nIGZyb20gbWlzY29uZmlndXJlZCBwcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdFByb3ZpZGVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBrZXlzOiBSZWZsZWN0aXZlS2V5W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBpbmplY3RvcnM6IFJlZmxlY3RpdmVJbmplY3RvcltdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZTogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IFJlZmxlY3RpdmVJbmplY3Rvciwga2V5OiBSZWZsZWN0aXZlS2V5LFxuICAgICAgICAgICAgICBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlOiBGdW5jdGlvbikge1xuICAgIHN1cGVyKFwiREkgRXhjZXB0aW9uXCIpO1xuICAgIHRoaXMua2V5cyA9IFtrZXldO1xuICAgIHRoaXMuaW5qZWN0b3JzID0gW2luamVjdG9yXTtcbiAgICB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UgPSBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlO1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZSh0aGlzLmtleXMpO1xuICB9XG5cbiAgYWRkS2V5KGluamVjdG9yOiBSZWZsZWN0aXZlSW5qZWN0b3IsIGtleTogUmVmbGVjdGl2ZUtleSk6IHZvaWQge1xuICAgIHRoaXMuaW5qZWN0b3JzLnB1c2goaW5qZWN0b3IpO1xuICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gICAgdGhpcy5tZXNzYWdlID0gdGhpcy5jb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlKHRoaXMua2V5cyk7XG4gIH1cblxuICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JzW3RoaXMuaW5qZWN0b3JzLmxlbmd0aCAtIDFdLmRlYnVnQ29udGV4dCgpOyB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdHJ5aW5nIHRvIHJldHJpZXZlIGEgZGVwZW5kZW5jeSBieSBgS2V5YCBmcm9tIHtAbGluayBJbmplY3Rvcn0sIGJ1dCB0aGVcbiAqIHtAbGluayBJbmplY3Rvcn0gZG9lcyBub3QgaGF2ZSBhIHtAbGluayBQcm92aWRlcn0gZm9yIHtAbGluayBLZXl9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC92cThEM0ZSQjlhR2JuV0pxdEVQRT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiOkIpIHt9XG4gKiB9XG4gKlxuICogZXhwZWN0KCgpID0+IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE5vUHJvdmlkZXJFcnJvciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGluamVjdG9yOiBSZWZsZWN0aXZlSW5qZWN0b3IsIGtleTogUmVmbGVjdGl2ZUtleSkge1xuICAgIHN1cGVyKGluamVjdG9yLCBrZXksIGZ1bmN0aW9uKGtleXM6IGFueVtdKSB7XG4gICAgICB2YXIgZmlyc3QgPSBzdHJpbmdpZnkoTGlzdFdyYXBwZXIuZmlyc3Qoa2V5cykudG9rZW4pO1xuICAgICAgcmV0dXJuIGBObyBwcm92aWRlciBmb3IgJHtmaXJzdH0hJHtjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoKGtleXMpfWA7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBkZXBlbmRlbmNpZXMgZm9ybSBhIGN5Y2xlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93WVFkTm9zMFR6cWwzZWkxRVY5aj9wPWluZm8pKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBwcm92aWRlKFwib25lXCIsIHt1c2VGYWN0b3J5OiAodHdvKSA9PiBcInR3b1wiLCBkZXBzOiBbW25ldyBJbmplY3QoXCJ0d29cIildXX0pLFxuICogICBwcm92aWRlKFwidHdvXCIsIHt1c2VGYWN0b3J5OiAob25lKSA9PiBcIm9uZVwiLCBkZXBzOiBbW25ldyBJbmplY3QoXCJvbmVcIildXX0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0KFwib25lXCIpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICpcbiAqIFJldHJpZXZpbmcgYEFgIG9yIGBCYCB0aHJvd3MgYSBgQ3ljbGljRGVwZW5kZW5jeUVycm9yYCBhcyB0aGUgZ3JhcGggYWJvdmUgY2Fubm90IGJlIGNvbnN0cnVjdGVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3ljbGljRGVwZW5kZW5jeUVycm9yIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlckVycm9yIHtcbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IFJlZmxlY3RpdmVJbmplY3Rvciwga2V5OiBSZWZsZWN0aXZlS2V5KSB7XG4gICAgc3VwZXIoaW5qZWN0b3IsIGtleSwgZnVuY3Rpb24oa2V5czogYW55W10pIHtcbiAgICAgIHJldHVybiBgQ2Fubm90IGluc3RhbnRpYXRlIGN5Y2xpYyBkZXBlbmRlbmN5ISR7Y29uc3RydWN0UmVzb2x2aW5nUGF0aChrZXlzKX1gO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBjb25zdHJ1Y3RpbmcgdHlwZSByZXR1cm5zIHdpdGggYW4gRXJyb3IuXG4gKlxuICogVGhlIGBJbnN0YW50aWF0aW9uRXJyb3JgIGNsYXNzIGNvbnRhaW5zIHRoZSBvcmlnaW5hbCBlcnJvciBwbHVzIHRoZSBkZXBlbmRlbmN5IGdyYXBoIHdoaWNoIGNhdXNlZFxuICogdGhpcyBvYmplY3QgdG8gYmUgaW5zdGFudGlhdGVkLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83YVdZZGNxVFFzUDBlTnFFZFVBZj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aHJvdyBuZXcgRXJyb3IoJ21lc3NhZ2UnKTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKTtcblxuICogdHJ5IHtcbiAqICAgaW5qZWN0b3IuZ2V0KEEpO1xuICogfSBjYXRjaCAoZSkge1xuICogICBleHBlY3QoZSBpbnN0YW5jZW9mIEluc3RhbnRpYXRpb25FcnJvcikudG9CZSh0cnVlKTtcbiAqICAgZXhwZWN0KGUub3JpZ2luYWxFeGNlcHRpb24ubWVzc2FnZSkudG9FcXVhbChcIm1lc3NhZ2VcIik7XG4gKiAgIGV4cGVjdChlLm9yaWdpbmFsU3RhY2spLnRvQmVEZWZpbmVkKCk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEluc3RhbnRpYXRpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIGtleXM6IFJlZmxlY3RpdmVLZXlbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIGluamVjdG9yczogUmVmbGVjdGl2ZUluamVjdG9yW107XG5cbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IFJlZmxlY3RpdmVJbmplY3Rvciwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGtleTogUmVmbGVjdGl2ZUtleSkge1xuICAgIHN1cGVyKFwiREkgRXhjZXB0aW9uXCIsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBudWxsKTtcbiAgICB0aGlzLmtleXMgPSBba2V5XTtcbiAgICB0aGlzLmluamVjdG9ycyA9IFtpbmplY3Rvcl07XG4gIH1cblxuICBhZGRLZXkoaW5qZWN0b3I6IFJlZmxlY3RpdmVJbmplY3Rvciwga2V5OiBSZWZsZWN0aXZlS2V5KTogdm9pZCB7XG4gICAgdGhpcy5pbmplY3RvcnMucHVzaChpbmplY3Rvcik7XG4gICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgfVxuXG4gIGdldCB3cmFwcGVyTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHZhciBmaXJzdCA9IHN0cmluZ2lmeShMaXN0V3JhcHBlci5maXJzdCh0aGlzLmtleXMpLnRva2VuKTtcbiAgICByZXR1cm4gYEVycm9yIGR1cmluZyBpbnN0YW50aWF0aW9uIG9mICR7Zmlyc3R9ISR7Y29uc3RydWN0UmVzb2x2aW5nUGF0aCh0aGlzLmtleXMpfS5gO1xuICB9XG5cbiAgZ2V0IGNhdXNlS2V5KCk6IFJlZmxlY3RpdmVLZXkgeyByZXR1cm4gdGhpcy5rZXlzWzBdOyB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLmluamVjdG9yc1t0aGlzLmluamVjdG9ycy5sZW5ndGggLSAxXS5kZWJ1Z0NvbnRleHQoKTsgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9iamVjdCBvdGhlciB0aGVuIHtAbGluayBQcm92aWRlcn0gKG9yIGBUeXBlYCkgaXMgcGFzc2VkIHRvIHtAbGluayBJbmplY3Rvcn1cbiAqIGNyZWF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZYXRDRmJQQU1DTDBKU1NRNG12SD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcIm5vdCBhIHR5cGVcIl0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFByb3ZpZGVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocHJvdmlkZXIpIHtcbiAgICBzdXBlcihcIkludmFsaWQgcHJvdmlkZXIgLSBvbmx5IGluc3RhbmNlcyBvZiBQcm92aWRlciBhbmQgVHlwZSBhcmUgYWxsb3dlZCwgZ290OiBcIiArXG4gICAgICAgICAgcHJvdmlkZXIudG9TdHJpbmcoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgY2xhc3MgaGFzIG5vIGFubm90YXRpb24gaW5mb3JtYXRpb24uXG4gKlxuICogTGFjayBvZiBhbm5vdGF0aW9uIGluZm9ybWF0aW9uIHByZXZlbnRzIHRoZSB7QGxpbmsgSW5qZWN0b3J9IGZyb20gZGV0ZXJtaW5pbmcgd2hpY2ggZGVwZW5kZW5jaWVzXG4gKiBuZWVkIHRvIGJlIGluamVjdGVkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ySG5adGxOUzd2Sk9QUTZwY1ZrbT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiKSB7fVxuICogfVxuICpcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKlxuICogVGhpcyBlcnJvciBpcyBhbHNvIHRocm93biB3aGVuIHRoZSBjbGFzcyBub3QgbWFya2VkIHdpdGgge0BsaW5rIEluamVjdGFibGV9IGhhcyBwYXJhbWV0ZXIgdHlwZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQiB7fVxuICpcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiOkIpIHt9IC8vIG5vIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwYXJhbWV0ZXIgdHlwZXMgb2YgQSBpcyBhdmFpbGFibGUgYXQgcnVudGltZS5cbiAqIH1cbiAqXG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQSxCXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOb0Fubm90YXRpb25FcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcih0eXBlT3JGdW5jLCBwYXJhbXM6IGFueVtdW10pIHtcbiAgICBzdXBlcihOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSh0eXBlT3JGdW5jLCBwYXJhbXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9nZW5NZXNzYWdlKHR5cGVPckZ1bmMsIHBhcmFtczogYW55W11bXSkge1xuICAgIHZhciBzaWduYXR1cmUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXJhbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgdmFyIHBhcmFtZXRlciA9IHBhcmFtc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKHBhcmFtZXRlcikgfHwgcGFyYW1ldGVyLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHNpZ25hdHVyZS5wdXNoKCc/Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWduYXR1cmUucHVzaChwYXJhbWV0ZXIubWFwKHN0cmluZ2lmeSkuam9pbignICcpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFwiQ2Fubm90IHJlc29sdmUgYWxsIHBhcmFtZXRlcnMgZm9yICdcIiArIHN0cmluZ2lmeSh0eXBlT3JGdW5jKSArIFwiJyhcIiArXG4gICAgICAgICAgIHNpZ25hdHVyZS5qb2luKCcsICcpICsgXCIpLiBcIiArXG4gICAgICAgICAgIFwiTWFrZSBzdXJlIHRoYXQgYWxsIHRoZSBwYXJhbWV0ZXJzIGFyZSBkZWNvcmF0ZWQgd2l0aCBJbmplY3Qgb3IgaGF2ZSB2YWxpZCB0eXBlIGFubm90YXRpb25zIGFuZCB0aGF0ICdcIiArXG4gICAgICAgICAgIHN0cmluZ2lmeSh0eXBlT3JGdW5jKSArIFwiJyBpcyBkZWNvcmF0ZWQgd2l0aCBJbmplY3RhYmxlLlwiO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gZ2V0dGluZyBhbiBvYmplY3QgYnkgaW5kZXguXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2JSczBTWDJPVFFpSnpxdmpnbDhQP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQSB7fVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKTtcbiAqXG4gKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0QXQoMTAwKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE91dE9mQm91bmRzRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoaW5kZXgpIHsgc3VwZXIoYEluZGV4ICR7aW5kZXh9IGlzIG91dC1vZi1ib3VuZHMuYCk7IH1cbn1cblxuLy8gVE9ETzogYWRkIGEgd29ya2luZyBleGFtcGxlIGFmdGVyIGFscGhhMzggaXMgcmVsZWFzZWRcbi8qKlxuICogVGhyb3duIHdoZW4gYSBtdWx0aSBwcm92aWRlciBhbmQgYSByZWd1bGFyIHByb3ZpZGVyIGFyZSBib3VuZCB0byB0aGUgc2FtZSB0b2tlbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7dXNlVmFsdWU6IFwic3RyaW5nMVwiLCBtdWx0aTogdHJ1ZX0pLFxuICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHt1c2VWYWx1ZTogXCJzdHJpbmcyXCIsIG11bHRpOiBmYWxzZX0pXG4gKiBdKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcihwcm92aWRlcjEsIHByb3ZpZGVyMikge1xuICAgIHN1cGVyKFwiQ2Fubm90IG1peCBtdWx0aSBwcm92aWRlcnMgYW5kIHJlZ3VsYXIgcHJvdmlkZXJzLCBnb3Q6IFwiICsgcHJvdmlkZXIxLnRvU3RyaW5nKCkgKyBcIiBcIiArXG4gICAgICAgICAgcHJvdmlkZXIyLnRvU3RyaW5nKCkpO1xuICB9XG59XG4iXX0=