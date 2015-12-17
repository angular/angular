'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
        if (collection_1.ListWrapper.contains(res, keys[i])) {
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
        var reversed = findFirstClosedCycle(collection_1.ListWrapper.reversed(keys));
        var tokenStrs = reversed.map(function (k) { return lang_1.stringify(k.token); });
        return " (" + tokenStrs.join(' -> ') + ")";
    }
    else {
        return "";
    }
}
/**
 * Base class for all errors arising from misconfigured providers.
 */
var AbstractProviderError = (function (_super) {
    __extends(AbstractProviderError, _super);
    function AbstractProviderError(injector, key, constructResolvingMessage) {
        _super.call(this, "DI Exception");
        this.keys = [key];
        this.injectors = [injector];
        this.constructResolvingMessage = constructResolvingMessage;
        this.message = this.constructResolvingMessage(this.keys);
    }
    AbstractProviderError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
        this.message = this.constructResolvingMessage(this.keys);
    };
    Object.defineProperty(AbstractProviderError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    return AbstractProviderError;
})(exceptions_1.BaseException);
exports.AbstractProviderError = AbstractProviderError;
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
var NoProviderError = (function (_super) {
    __extends(NoProviderError, _super);
    function NoProviderError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            var first = lang_1.stringify(collection_1.ListWrapper.first(keys).token);
            return "No provider for " + first + "!" + constructResolvingPath(keys);
        });
    }
    return NoProviderError;
})(AbstractProviderError);
exports.NoProviderError = NoProviderError;
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
var CyclicDependencyError = (function (_super) {
    __extends(CyclicDependencyError, _super);
    function CyclicDependencyError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
        });
    }
    return CyclicDependencyError;
})(AbstractProviderError);
exports.CyclicDependencyError = CyclicDependencyError;
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
var InstantiationError = (function (_super) {
    __extends(InstantiationError, _super);
    function InstantiationError(injector, originalException, originalStack, key) {
        _super.call(this, "DI Exception", originalException, originalStack, null);
        this.keys = [key];
        this.injectors = [injector];
    }
    InstantiationError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
    };
    Object.defineProperty(InstantiationError.prototype, "wrapperMessage", {
        get: function () {
            var first = lang_1.stringify(collection_1.ListWrapper.first(this.keys).token);
            return "Error during instantiation of " + first + "!" + constructResolvingPath(this.keys) + ".";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InstantiationError.prototype, "causeKey", {
        get: function () { return this.keys[0]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InstantiationError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    return InstantiationError;
})(exceptions_1.WrappedException);
exports.InstantiationError = InstantiationError;
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
var InvalidProviderError = (function (_super) {
    __extends(InvalidProviderError, _super);
    function InvalidProviderError(provider) {
        _super.call(this, "Invalid provider - only instances of Provider and Type are allowed, got: " +
            provider.toString());
    }
    return InvalidProviderError;
})(exceptions_1.BaseException);
exports.InvalidProviderError = InvalidProviderError;
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
var NoAnnotationError = (function (_super) {
    __extends(NoAnnotationError, _super);
    function NoAnnotationError(typeOrFunc, params) {
        _super.call(this, NoAnnotationError._genMessage(typeOrFunc, params));
    }
    NoAnnotationError._genMessage = function (typeOrFunc, params) {
        var signature = [];
        for (var i = 0, ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (lang_1.isBlank(parameter) || parameter.length == 0) {
                signature.push('?');
            }
            else {
                signature.push(parameter.map(lang_1.stringify).join(' '));
            }
        }
        return "Cannot resolve all parameters for '" + lang_1.stringify(typeOrFunc) + "'(" +
            signature.join(', ') + "). " +
            "Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" +
            lang_1.stringify(typeOrFunc) + "' is decorated with Injectable.";
    };
    return NoAnnotationError;
})(exceptions_1.BaseException);
exports.NoAnnotationError = NoAnnotationError;
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
var OutOfBoundsError = (function (_super) {
    __extends(OutOfBoundsError, _super);
    function OutOfBoundsError(index) {
        _super.call(this, "Index " + index + " is out-of-bounds.");
    }
    return OutOfBoundsError;
})(exceptions_1.BaseException);
exports.OutOfBoundsError = OutOfBoundsError;
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
var MixingMultiProvidersWithRegularProvidersError = (function (_super) {
    __extends(MixingMultiProvidersWithRegularProvidersError, _super);
    function MixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
        _super.call(this, "Cannot mix multi providers and regular providers, got: " + provider1.toString() + " " +
            provider2.toString());
    }
    return MixingMultiProvidersWithRegularProvidersError;
})(exceptions_1.BaseException);
exports.MixingMultiProvidersWithRegularProvidersError = MixingMultiProvidersWithRegularProvidersError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2RpL2V4Y2VwdGlvbnMudHMiXSwibmFtZXMiOlsiZmluZEZpcnN0Q2xvc2VkQ3ljbGUiLCJjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoIiwiQWJzdHJhY3RQcm92aWRlckVycm9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmFkZEtleSIsIkFic3RyYWN0UHJvdmlkZXJFcnJvci5jb250ZXh0IiwiTm9Qcm92aWRlckVycm9yIiwiTm9Qcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmFkZEtleSIsIkluc3RhbnRpYXRpb25FcnJvci53cmFwcGVyTWVzc2FnZSIsIkluc3RhbnRpYXRpb25FcnJvci5jYXVzZUtleSIsIkluc3RhbnRpYXRpb25FcnJvci5jb250ZXh0IiwiSW52YWxpZFByb3ZpZGVyRXJyb3IiLCJJbnZhbGlkUHJvdmlkZXJFcnJvci5jb25zdHJ1Y3RvciIsIk5vQW5ub3RhdGlvbkVycm9yIiwiTm9Bbm5vdGF0aW9uRXJyb3IuY29uc3RydWN0b3IiLCJOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSIsIk91dE9mQm91bmRzRXJyb3IiLCJPdXRPZkJvdW5kc0Vycm9yLmNvbnN0cnVjdG9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUEwQixnQ0FB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Q0E7QUFBREEsQ0FBQ0EsQUFMRCxFQUFtRSwwQkFBYSxFQUsvRTtBQUxZLHFEQUE2QyxnREFLekQsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3N0cmluZ2lmeSwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbiwgdW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7S2V5fSBmcm9tICcuL2tleSc7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuL2luamVjdG9yJztcblxuZnVuY3Rpb24gZmluZEZpcnN0Q2xvc2VkQ3ljbGUoa2V5czogYW55W10pOiBhbnlbXSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKExpc3RXcmFwcGVyLmNvbnRhaW5zKHJlcywga2V5c1tpXSkpIHtcbiAgICAgIHJlcy5wdXNoKGtleXNbaV0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnB1c2goa2V5c1tpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFJlc29sdmluZ1BhdGgoa2V5czogYW55W10pOiBzdHJpbmcge1xuICBpZiAoa2V5cy5sZW5ndGggPiAxKSB7XG4gICAgdmFyIHJldmVyc2VkID0gZmluZEZpcnN0Q2xvc2VkQ3ljbGUoTGlzdFdyYXBwZXIucmV2ZXJzZWQoa2V5cykpO1xuICAgIHZhciB0b2tlblN0cnMgPSByZXZlcnNlZC5tYXAoayA9PiBzdHJpbmdpZnkoay50b2tlbikpO1xuICAgIHJldHVybiBcIiAoXCIgKyB0b2tlblN0cnMuam9pbignIC0+ICcpICsgXCIpXCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cbn1cblxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBlcnJvcnMgYXJpc2luZyBmcm9tIG1pc2NvbmZpZ3VyZWQgcHJvdmlkZXJzLlxuICovXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RQcm92aWRlckVycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAga2V5czogS2V5W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBpbmplY3RvcnM6IEluamVjdG9yW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5LCBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlOiBGdW5jdGlvbikge1xuICAgIHN1cGVyKFwiREkgRXhjZXB0aW9uXCIpO1xuICAgIHRoaXMua2V5cyA9IFtrZXldO1xuICAgIHRoaXMuaW5qZWN0b3JzID0gW2luamVjdG9yXTtcbiAgICB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UgPSBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlO1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZSh0aGlzLmtleXMpO1xuICB9XG5cbiAgYWRkS2V5KGluamVjdG9yOiBJbmplY3Rvciwga2V5OiBLZXkpOiB2b2lkIHtcbiAgICB0aGlzLmluamVjdG9ycy5wdXNoKGluamVjdG9yKTtcbiAgICB0aGlzLmtleXMucHVzaChrZXkpO1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZSh0aGlzLmtleXMpO1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLmluamVjdG9yc1t0aGlzLmluamVjdG9ycy5sZW5ndGggLSAxXS5kZWJ1Z0NvbnRleHQoKTsgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRyeWluZyB0byByZXRyaWV2ZSBhIGRlcGVuZGVuY3kgYnkgYEtleWAgZnJvbSB7QGxpbmsgSW5qZWN0b3J9LCBidXQgdGhlXG4gKiB7QGxpbmsgSW5qZWN0b3J9IGRvZXMgbm90IGhhdmUgYSB7QGxpbmsgUHJvdmlkZXJ9IGZvciB7QGxpbmsgS2V5fS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdnE4RDNGUkI5YUdibldKcXRFUEU/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHtcbiAqICAgY29uc3RydWN0b3IoYjpCKSB7fVxuICogfVxuICpcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOb1Byb3ZpZGVyRXJyb3IgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KSB7XG4gICAgc3VwZXIoaW5qZWN0b3IsIGtleSwgZnVuY3Rpb24oa2V5czogYW55W10pIHtcbiAgICAgIHZhciBmaXJzdCA9IHN0cmluZ2lmeShMaXN0V3JhcHBlci5maXJzdChrZXlzKS50b2tlbik7XG4gICAgICByZXR1cm4gYE5vIHByb3ZpZGVyIGZvciAke2ZpcnN0fSEke2NvbnN0cnVjdFJlc29sdmluZ1BhdGgoa2V5cyl9YDtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGRlcGVuZGVuY2llcyBmb3JtIGEgY3ljbGUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3dZUWROb3MwVHpxbDNlaTFFVjlqP3A9aW5mbykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIHByb3ZpZGUoXCJvbmVcIiwge3VzZUZhY3Rvcnk6ICh0d28pID0+IFwidHdvXCIsIGRlcHM6IFtbbmV3IEluamVjdChcInR3b1wiKV1dfSksXG4gKiAgIHByb3ZpZGUoXCJ0d29cIiwge3VzZUZhY3Rvcnk6IChvbmUpID0+IFwib25lXCIsIGRlcHM6IFtbbmV3IEluamVjdChcIm9uZVwiKV1dfSlcbiAqIF0pO1xuICpcbiAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoXCJvbmVcIikpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKlxuICogUmV0cmlldmluZyBgQWAgb3IgYEJgIHRocm93cyBhIGBDeWNsaWNEZXBlbmRlbmN5RXJyb3JgIGFzIHRoZSBncmFwaCBhYm92ZSBjYW5ub3QgYmUgY29uc3RydWN0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDeWNsaWNEZXBlbmRlbmN5RXJyb3IgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KSB7XG4gICAgc3VwZXIoaW5qZWN0b3IsIGtleSwgZnVuY3Rpb24oa2V5czogYW55W10pIHtcbiAgICAgIHJldHVybiBgQ2Fubm90IGluc3RhbnRpYXRlIGN5Y2xpYyBkZXBlbmRlbmN5ISR7Y29uc3RydWN0UmVzb2x2aW5nUGF0aChrZXlzKX1gO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBjb25zdHJ1Y3RpbmcgdHlwZSByZXR1cm5zIHdpdGggYW4gRXJyb3IuXG4gKlxuICogVGhlIGBJbnN0YW50aWF0aW9uRXJyb3JgIGNsYXNzIGNvbnRhaW5zIHRoZSBvcmlnaW5hbCBlcnJvciBwbHVzIHRoZSBkZXBlbmRlbmN5IGdyYXBoIHdoaWNoIGNhdXNlZFxuICogdGhpcyBvYmplY3QgdG8gYmUgaW5zdGFudGlhdGVkLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83YVdZZGNxVFFzUDBlTnFFZFVBZj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aHJvdyBuZXcgRXJyb3IoJ21lc3NhZ2UnKTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKTtcblxuICogdHJ5IHtcbiAqICAgaW5qZWN0b3IuZ2V0KEEpO1xuICogfSBjYXRjaCAoZSkge1xuICogICBleHBlY3QoZSBpbnN0YW5jZW9mIEluc3RhbnRpYXRpb25FcnJvcikudG9CZSh0cnVlKTtcbiAqICAgZXhwZWN0KGUub3JpZ2luYWxFeGNlcHRpb24ubWVzc2FnZSkudG9FcXVhbChcIm1lc3NhZ2VcIik7XG4gKiAgIGV4cGVjdChlLm9yaWdpbmFsU3RhY2spLnRvQmVEZWZpbmVkKCk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEluc3RhbnRpYXRpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIGtleXM6IEtleVtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgaW5qZWN0b3JzOiBJbmplY3RvcltdO1xuXG4gIGNvbnN0cnVjdG9yKGluamVjdG9yOiBJbmplY3Rvciwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGtleTogS2V5KSB7XG4gICAgc3VwZXIoXCJESSBFeGNlcHRpb25cIiwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIG51bGwpO1xuICAgIHRoaXMua2V5cyA9IFtrZXldO1xuICAgIHRoaXMuaW5qZWN0b3JzID0gW2luamVjdG9yXTtcbiAgfVxuXG4gIGFkZEtleShpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KTogdm9pZCB7XG4gICAgdGhpcy5pbmplY3RvcnMucHVzaChpbmplY3Rvcik7XG4gICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgfVxuXG4gIGdldCB3cmFwcGVyTWVzc2FnZSgpOiBzdHJpbmcge1xuICAgIHZhciBmaXJzdCA9IHN0cmluZ2lmeShMaXN0V3JhcHBlci5maXJzdCh0aGlzLmtleXMpLnRva2VuKTtcbiAgICByZXR1cm4gYEVycm9yIGR1cmluZyBpbnN0YW50aWF0aW9uIG9mICR7Zmlyc3R9ISR7Y29uc3RydWN0UmVzb2x2aW5nUGF0aCh0aGlzLmtleXMpfS5gO1xuICB9XG5cbiAgZ2V0IGNhdXNlS2V5KCk6IEtleSB7IHJldHVybiB0aGlzLmtleXNbMF07IH1cblxuICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JzW3RoaXMuaW5qZWN0b3JzLmxlbmd0aCAtIDFdLmRlYnVnQ29udGV4dCgpOyB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYW4gb2JqZWN0IG90aGVyIHRoZW4ge0BsaW5rIFByb3ZpZGVyfSAob3IgYFR5cGVgKSBpcyBwYXNzZWQgdG8ge0BsaW5rIEluamVjdG9yfVxuICogY3JlYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1lhdENGYlBBTUNMMEpTU1E0bXZIP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwZWN0KCgpID0+IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1wibm90IGEgdHlwZVwiXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnZhbGlkUHJvdmlkZXJFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcihwcm92aWRlcikge1xuICAgIHN1cGVyKFwiSW52YWxpZCBwcm92aWRlciAtIG9ubHkgaW5zdGFuY2VzIG9mIFByb3ZpZGVyIGFuZCBUeXBlIGFyZSBhbGxvd2VkLCBnb3Q6IFwiICtcbiAgICAgICAgICBwcm92aWRlci50b1N0cmluZygpKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBjbGFzcyBoYXMgbm8gYW5ub3RhdGlvbiBpbmZvcm1hdGlvbi5cbiAqXG4gKiBMYWNrIG9mIGFubm90YXRpb24gaW5mb3JtYXRpb24gcHJldmVudHMgdGhlIHtAbGluayBJbmplY3Rvcn0gZnJvbSBkZXRlcm1pbmluZyB3aGljaCBkZXBlbmRlbmNpZXNcbiAqIG5lZWQgdG8gYmUgaW5qZWN0ZWQgaW50byB0aGUgY29uc3RydWN0b3IuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3JIblp0bE5TN3ZKT1BRNnBjVmttP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQSB7XG4gKiAgIGNvbnN0cnVjdG9yKGIpIHt9XG4gKiB9XG4gKlxuICogZXhwZWN0KCgpID0+IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGVycm9yIGlzIGFsc28gdGhyb3duIHdoZW4gdGhlIGNsYXNzIG5vdCBtYXJrZWQgd2l0aCB7QGxpbmsgSW5qZWN0YWJsZX0gaGFzIHBhcmFtZXRlciB0eXBlcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBCIHt9XG4gKlxuICogY2xhc3MgQSB7XG4gKiAgIGNvbnN0cnVjdG9yKGI6Qikge30gLy8gbm8gaW5mb3JtYXRpb24gYWJvdXQgdGhlIHBhcmFtZXRlciB0eXBlcyBvZiBBIGlzIGF2YWlsYWJsZSBhdCBydW50aW1lLlxuICogfVxuICpcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBLEJdKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE5vQW5ub3RhdGlvbkVycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHR5cGVPckZ1bmMsIHBhcmFtczogYW55W11bXSkge1xuICAgIHN1cGVyKE5vQW5ub3RhdGlvbkVycm9yLl9nZW5NZXNzYWdlKHR5cGVPckZ1bmMsIHBhcmFtcykpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2dlbk1lc3NhZ2UodHlwZU9yRnVuYywgcGFyYW1zOiBhbnlbXVtdKSB7XG4gICAgdmFyIHNpZ25hdHVyZSA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHBhcmFtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICB2YXIgcGFyYW1ldGVyID0gcGFyYW1zW2ldO1xuICAgICAgaWYgKGlzQmxhbmsocGFyYW1ldGVyKSB8fCBwYXJhbWV0ZXIubGVuZ3RoID09IDApIHtcbiAgICAgICAgc2lnbmF0dXJlLnB1c2goJz8nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpZ25hdHVyZS5wdXNoKHBhcmFtZXRlci5tYXAoc3RyaW5naWZ5KS5qb2luKCcgJykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gXCJDYW5ub3QgcmVzb2x2ZSBhbGwgcGFyYW1ldGVycyBmb3IgJ1wiICsgc3RyaW5naWZ5KHR5cGVPckZ1bmMpICsgXCInKFwiICtcbiAgICAgICAgICAgc2lnbmF0dXJlLmpvaW4oJywgJykgKyBcIikuIFwiICtcbiAgICAgICAgICAgXCJNYWtlIHN1cmUgdGhhdCBhbGwgdGhlIHBhcmFtZXRlcnMgYXJlIGRlY29yYXRlZCB3aXRoIEluamVjdCBvciBoYXZlIHZhbGlkIHR5cGUgYW5ub3RhdGlvbnMgYW5kIHRoYXQgJ1wiICtcbiAgICAgICAgICAgc3RyaW5naWZ5KHR5cGVPckZ1bmMpICsgXCInIGlzIGRlY29yYXRlZCB3aXRoIEluamVjdGFibGUuXCI7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBnZXR0aW5nIGFuIG9iamVjdCBieSBpbmRleC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvYlJzMFNYMk9UUWlKenF2amdsOFA/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHt9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQV0pO1xuICpcbiAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXRBdCgxMDApKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgT3V0T2ZCb3VuZHNFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihpbmRleCkgeyBzdXBlcihgSW5kZXggJHtpbmRleH0gaXMgb3V0LW9mLWJvdW5kcy5gKTsgfVxufVxuXG4vLyBUT0RPOiBhZGQgYSB3b3JraW5nIGV4YW1wbGUgYWZ0ZXIgYWxwaGEzOCBpcyByZWxlYXNlZFxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIG11bHRpIHByb3ZpZGVyIGFuZCBhIHJlZ3VsYXIgcHJvdmlkZXIgYXJlIGJvdW5kIHRvIHRoZSBzYW1lIHRva2VuLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwZWN0KCgpID0+IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHt1c2VWYWx1ZTogXCJzdHJpbmcxXCIsIG11bHRpOiB0cnVlfSksXG4gKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwge3VzZVZhbHVlOiBcInN0cmluZzJcIiwgbXVsdGk6IGZhbHNlfSlcbiAqIF0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHByb3ZpZGVyMSwgcHJvdmlkZXIyKSB7XG4gICAgc3VwZXIoXCJDYW5ub3QgbWl4IG11bHRpIHByb3ZpZGVycyBhbmQgcmVndWxhciBwcm92aWRlcnMsIGdvdDogXCIgKyBwcm92aWRlcjEudG9TdHJpbmcoKSArIFwiIFwiICtcbiAgICAgICAgICBwcm92aWRlcjIudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiJdfQ==