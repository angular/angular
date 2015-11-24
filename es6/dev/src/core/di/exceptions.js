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
        return "Cannot resolve all parameters for " + stringify(typeOrFunc) + "(" +
            signature.join(', ') + "). " + 'Make sure they all have valid type or annotations.';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2RpL2V4Y2VwdGlvbnMudHMiXSwibmFtZXMiOlsiZmluZEZpcnN0Q2xvc2VkQ3ljbGUiLCJjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoIiwiQWJzdHJhY3RQcm92aWRlckVycm9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmFkZEtleSIsIkFic3RyYWN0UHJvdmlkZXJFcnJvci5jb250ZXh0IiwiTm9Qcm92aWRlckVycm9yIiwiTm9Qcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmFkZEtleSIsIkluc3RhbnRpYXRpb25FcnJvci53cmFwcGVyTWVzc2FnZSIsIkluc3RhbnRpYXRpb25FcnJvci5jYXVzZUtleSIsIkluc3RhbnRpYXRpb25FcnJvci5jb250ZXh0IiwiSW52YWxpZFByb3ZpZGVyRXJyb3IiLCJJbnZhbGlkUHJvdmlkZXJFcnJvci5jb25zdHJ1Y3RvciIsIk5vQW5ub3RhdGlvbkVycm9yIiwiTm9Bbm5vdGF0aW9uRXJyb3IuY29uc3RydWN0b3IiLCJOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSIsIk91dE9mQm91bmRzRXJyb3IiLCJPdXRPZkJvdW5kc0Vycm9yLmNvbnN0cnVjdG9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBQyxN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QUFzQyxhQUFhO0lBQ2pERyxZQUFZQSxLQUFLQTtRQUFJQyxNQUFNQSxTQUFTQSxLQUFLQSxvQkFBb0JBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0FBQ25FRCxDQUFDQTtBQUVELHdEQUF3RDtBQUN4RDs7Ozs7Ozs7Ozs7R0FXRztBQUNILG1FQUFtRSxhQUFhO0lBQzlFRSxZQUFZQSxTQUFTQSxFQUFFQSxTQUFTQTtRQUM5QkMsTUFBTUEseURBQXlEQSxHQUFHQSxTQUFTQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxHQUFHQTtZQUN0RkEsU0FBU0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLENBQUNBO0FBQ0hELENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtzdHJpbmdpZnksIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb24sIHVuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0tleX0gZnJvbSAnLi9rZXknO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi9pbmplY3Rvcic7XG5cbmZ1bmN0aW9uIGZpbmRGaXJzdENsb3NlZEN5Y2xlKGtleXM6IGFueVtdKTogYW55W10ge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhyZXMsIGtleXNbaV0pKSB7XG4gICAgICByZXMucHVzaChrZXlzW2ldKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5wdXNoKGtleXNbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoKGtleXM6IGFueVtdKTogc3RyaW5nIHtcbiAgaWYgKGtleXMubGVuZ3RoID4gMSkge1xuICAgIHZhciByZXZlcnNlZCA9IGZpbmRGaXJzdENsb3NlZEN5Y2xlKExpc3RXcmFwcGVyLnJldmVyc2VkKGtleXMpKTtcbiAgICB2YXIgdG9rZW5TdHJzID0gcmV2ZXJzZWQubWFwKGsgPT4gc3RyaW5naWZ5KGsudG9rZW4pKTtcbiAgICByZXR1cm4gXCIgKFwiICsgdG9rZW5TdHJzLmpvaW4oJyAtPiAnKSArIFwiKVwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59XG5cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgZXJyb3JzIGFyaXNpbmcgZnJvbSBtaXNjb25maWd1cmVkIHByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0UHJvdmlkZXJFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIG1lc3NhZ2U6IHN0cmluZztcblxuICAvKiogQGludGVybmFsICovXG4gIGtleXM6IEtleVtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgaW5qZWN0b3JzOiBJbmplY3RvcltdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZTogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSwgY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZTogRnVuY3Rpb24pIHtcbiAgICBzdXBlcihcIkRJIEV4Y2VwdGlvblwiKTtcbiAgICB0aGlzLmtleXMgPSBba2V5XTtcbiAgICB0aGlzLmluamVjdG9ycyA9IFtpbmplY3Rvcl07XG4gICAgdGhpcy5jb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlID0gY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZTtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UodGhpcy5rZXlzKTtcbiAgfVxuXG4gIGFkZEtleShpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KTogdm9pZCB7XG4gICAgdGhpcy5pbmplY3RvcnMucHVzaChpbmplY3Rvcik7XG4gICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UodGhpcy5rZXlzKTtcbiAgfVxuXG4gIGdldCBjb250ZXh0KCkgeyByZXR1cm4gdGhpcy5pbmplY3RvcnNbdGhpcy5pbmplY3RvcnMubGVuZ3RoIC0gMV0uZGVidWdDb250ZXh0KCk7IH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0cnlpbmcgdG8gcmV0cmlldmUgYSBkZXBlbmRlbmN5IGJ5IGBLZXlgIGZyb20ge0BsaW5rIEluamVjdG9yfSwgYnV0IHRoZVxuICoge0BsaW5rIEluamVjdG9yfSBkb2VzIG5vdCBoYXZlIGEge0BsaW5rIFByb3ZpZGVyfSBmb3Ige0BsaW5rIEtleX0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3ZxOEQzRlJCOWFHYm5XSnF0RVBFP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQSB7XG4gKiAgIGNvbnN0cnVjdG9yKGI6Qikge31cbiAqIH1cbiAqXG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQV0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTm9Qcm92aWRlckVycm9yIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlckVycm9yIHtcbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSkge1xuICAgIHN1cGVyKGluamVjdG9yLCBrZXksIGZ1bmN0aW9uKGtleXM6IGFueVtdKSB7XG4gICAgICB2YXIgZmlyc3QgPSBzdHJpbmdpZnkoTGlzdFdyYXBwZXIuZmlyc3Qoa2V5cykudG9rZW4pO1xuICAgICAgcmV0dXJuIGBObyBwcm92aWRlciBmb3IgJHtmaXJzdH0hJHtjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoKGtleXMpfWA7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBkZXBlbmRlbmNpZXMgZm9ybSBhIGN5Y2xlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93WVFkTm9zMFR6cWwzZWkxRVY5aj9wPWluZm8pKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBwcm92aWRlKFwib25lXCIsIHt1c2VGYWN0b3J5OiAodHdvKSA9PiBcInR3b1wiLCBkZXBzOiBbW25ldyBJbmplY3QoXCJ0d29cIildXX0pLFxuICogICBwcm92aWRlKFwidHdvXCIsIHt1c2VGYWN0b3J5OiAob25lKSA9PiBcIm9uZVwiLCBkZXBzOiBbW25ldyBJbmplY3QoXCJvbmVcIildXX0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0KFwib25lXCIpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICpcbiAqIFJldHJpZXZpbmcgYEFgIG9yIGBCYCB0aHJvd3MgYSBgQ3ljbGljRGVwZW5kZW5jeUVycm9yYCBhcyB0aGUgZ3JhcGggYWJvdmUgY2Fubm90IGJlIGNvbnN0cnVjdGVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3ljbGljRGVwZW5kZW5jeUVycm9yIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlckVycm9yIHtcbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSkge1xuICAgIHN1cGVyKGluamVjdG9yLCBrZXksIGZ1bmN0aW9uKGtleXM6IGFueVtdKSB7XG4gICAgICByZXR1cm4gYENhbm5vdCBpbnN0YW50aWF0ZSBjeWNsaWMgZGVwZW5kZW5jeSEke2NvbnN0cnVjdFJlc29sdmluZ1BhdGgoa2V5cyl9YDtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgY29uc3RydWN0aW5nIHR5cGUgcmV0dXJucyB3aXRoIGFuIEVycm9yLlxuICpcbiAqIFRoZSBgSW5zdGFudGlhdGlvbkVycm9yYCBjbGFzcyBjb250YWlucyB0aGUgb3JpZ2luYWwgZXJyb3IgcGx1cyB0aGUgZGVwZW5kZW5jeSBncmFwaCB3aGljaCBjYXVzZWRcbiAqIHRoaXMgb2JqZWN0IHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvN2FXWWRjcVRRc1AwZU5xRWRVQWY/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhyb3cgbmV3IEVycm9yKCdtZXNzYWdlJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSk7XG5cbiAqIHRyeSB7XG4gKiAgIGluamVjdG9yLmdldChBKTtcbiAqIH0gY2F0Y2ggKGUpIHtcbiAqICAgZXhwZWN0KGUgaW5zdGFuY2VvZiBJbnN0YW50aWF0aW9uRXJyb3IpLnRvQmUodHJ1ZSk7XG4gKiAgIGV4cGVjdChlLm9yaWdpbmFsRXhjZXB0aW9uLm1lc3NhZ2UpLnRvRXF1YWwoXCJtZXNzYWdlXCIpO1xuICogICBleHBlY3QoZS5vcmlnaW5hbFN0YWNrKS50b0JlRGVmaW5lZCgpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnN0YW50aWF0aW9uRXJyb3IgZXh0ZW5kcyBXcmFwcGVkRXhjZXB0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBrZXlzOiBLZXlbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIGluamVjdG9yczogSW5qZWN0b3JbXTtcblxuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBrZXk6IEtleSkge1xuICAgIHN1cGVyKFwiREkgRXhjZXB0aW9uXCIsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBudWxsKTtcbiAgICB0aGlzLmtleXMgPSBba2V5XTtcbiAgICB0aGlzLmluamVjdG9ycyA9IFtpbmplY3Rvcl07XG4gIH1cblxuICBhZGRLZXkoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSk6IHZvaWQge1xuICAgIHRoaXMuaW5qZWN0b3JzLnB1c2goaW5qZWN0b3IpO1xuICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gIH1cblxuICBnZXQgd3JhcHBlck1lc3NhZ2UoKTogc3RyaW5nIHtcbiAgICB2YXIgZmlyc3QgPSBzdHJpbmdpZnkoTGlzdFdyYXBwZXIuZmlyc3QodGhpcy5rZXlzKS50b2tlbik7XG4gICAgcmV0dXJuIGBFcnJvciBkdXJpbmcgaW5zdGFudGlhdGlvbiBvZiAke2ZpcnN0fSEke2NvbnN0cnVjdFJlc29sdmluZ1BhdGgodGhpcy5rZXlzKX0uYDtcbiAgfVxuXG4gIGdldCBjYXVzZUtleSgpOiBLZXkgeyByZXR1cm4gdGhpcy5rZXlzWzBdOyB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLmluamVjdG9yc1t0aGlzLmluamVjdG9ycy5sZW5ndGggLSAxXS5kZWJ1Z0NvbnRleHQoKTsgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9iamVjdCBvdGhlciB0aGVuIHtAbGluayBQcm92aWRlcn0gKG9yIGBUeXBlYCkgaXMgcGFzc2VkIHRvIHtAbGluayBJbmplY3Rvcn1cbiAqIGNyZWF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZYXRDRmJQQU1DTDBKU1NRNG12SD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcIm5vdCBhIHR5cGVcIl0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFByb3ZpZGVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocHJvdmlkZXIpIHtcbiAgICBzdXBlcihcIkludmFsaWQgcHJvdmlkZXIgLSBvbmx5IGluc3RhbmNlcyBvZiBQcm92aWRlciBhbmQgVHlwZSBhcmUgYWxsb3dlZCwgZ290OiBcIiArXG4gICAgICAgICAgcHJvdmlkZXIudG9TdHJpbmcoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgY2xhc3MgaGFzIG5vIGFubm90YXRpb24gaW5mb3JtYXRpb24uXG4gKlxuICogTGFjayBvZiBhbm5vdGF0aW9uIGluZm9ybWF0aW9uIHByZXZlbnRzIHRoZSB7QGxpbmsgSW5qZWN0b3J9IGZyb20gZGV0ZXJtaW5pbmcgd2hpY2ggZGVwZW5kZW5jaWVzXG4gKiBuZWVkIHRvIGJlIGluamVjdGVkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ySG5adGxOUzd2Sk9QUTZwY1ZrbT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiKSB7fVxuICogfVxuICpcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKlxuICogVGhpcyBlcnJvciBpcyBhbHNvIHRocm93biB3aGVuIHRoZSBjbGFzcyBub3QgbWFya2VkIHdpdGgge0BsaW5rIEluamVjdGFibGV9IGhhcyBwYXJhbWV0ZXIgdHlwZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQiB7fVxuICpcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiOkIpIHt9IC8vIG5vIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwYXJhbWV0ZXIgdHlwZXMgb2YgQSBpcyBhdmFpbGFibGUgYXQgcnVudGltZS5cbiAqIH1cbiAqXG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQSxCXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOb0Fubm90YXRpb25FcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcih0eXBlT3JGdW5jLCBwYXJhbXM6IGFueVtdW10pIHtcbiAgICBzdXBlcihOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSh0eXBlT3JGdW5jLCBwYXJhbXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9nZW5NZXNzYWdlKHR5cGVPckZ1bmMsIHBhcmFtczogYW55W11bXSkge1xuICAgIHZhciBzaWduYXR1cmUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXJhbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgdmFyIHBhcmFtZXRlciA9IHBhcmFtc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKHBhcmFtZXRlcikgfHwgcGFyYW1ldGVyLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHNpZ25hdHVyZS5wdXNoKCc/Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWduYXR1cmUucHVzaChwYXJhbWV0ZXIubWFwKHN0cmluZ2lmeSkuam9pbignICcpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFwiQ2Fubm90IHJlc29sdmUgYWxsIHBhcmFtZXRlcnMgZm9yIFwiICsgc3RyaW5naWZ5KHR5cGVPckZ1bmMpICsgXCIoXCIgK1xuICAgICAgICAgICBzaWduYXR1cmUuam9pbignLCAnKSArIFwiKS4gXCIgKyAnTWFrZSBzdXJlIHRoZXkgYWxsIGhhdmUgdmFsaWQgdHlwZSBvciBhbm5vdGF0aW9ucy4nO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gZ2V0dGluZyBhbiBvYmplY3QgYnkgaW5kZXguXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2JSczBTWDJPVFFpSnpxdmpnbDhQP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQSB7fVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKTtcbiAqXG4gKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0QXQoMTAwKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE91dE9mQm91bmRzRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoaW5kZXgpIHsgc3VwZXIoYEluZGV4ICR7aW5kZXh9IGlzIG91dC1vZi1ib3VuZHMuYCk7IH1cbn1cblxuLy8gVE9ETzogYWRkIGEgd29ya2luZyBleGFtcGxlIGFmdGVyIGFscGhhMzggaXMgcmVsZWFzZWRcbi8qKlxuICogVGhyb3duIHdoZW4gYSBtdWx0aSBwcm92aWRlciBhbmQgYSByZWd1bGFyIHByb3ZpZGVyIGFyZSBib3VuZCB0byB0aGUgc2FtZSB0b2tlbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7dXNlVmFsdWU6IFwic3RyaW5nMVwiLCBtdWx0aTogdHJ1ZX0pLFxuICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHt1c2VWYWx1ZTogXCJzdHJpbmcyXCIsIG11bHRpOiBmYWxzZX0pXG4gKiBdKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcihwcm92aWRlcjEsIHByb3ZpZGVyMikge1xuICAgIHN1cGVyKFwiQ2Fubm90IG1peCBtdWx0aSBwcm92aWRlcnMgYW5kIHJlZ3VsYXIgcHJvdmlkZXJzLCBnb3Q6IFwiICsgcHJvdmlkZXIxLnRvU3RyaW5nKCkgKyBcIiBcIiArXG4gICAgICAgICAgcHJvdmlkZXIyLnRvU3RyaW5nKCkpO1xuICB9XG59XG4iXX0=