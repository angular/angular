'use strict';var core_1 = require('angular2/core');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var TestInjector = (function () {
    function TestInjector() {
        this._instantiated = false;
        this._injector = null;
        this._providers = [];
        this.platformProviders = [];
        this.applicationProviders = [];
    }
    TestInjector.prototype.reset = function () {
        this._injector = null;
        this._providers = [];
        this._instantiated = false;
    };
    TestInjector.prototype.addProviders = function (providers) {
        if (this._instantiated) {
            throw new exceptions_1.BaseException('Cannot add providers after test injector is instantiated');
        }
        this._providers = collection_1.ListWrapper.concat(this._providers, providers);
    };
    TestInjector.prototype.createInjector = function () {
        var rootInjector = core_1.Injector.resolveAndCreate(this.platformProviders);
        this._injector = rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(this.applicationProviders, this._providers));
        this._instantiated = true;
        return this._injector;
    };
    TestInjector.prototype.execute = function (fn) {
        if (!this._instantiated) {
            this.createInjector();
        }
        return fn.execute(this._injector);
    };
    return TestInjector;
})();
exports.TestInjector = TestInjector;
var _testInjector = null;
function getTestInjector() {
    if (_testInjector == null) {
        _testInjector = new TestInjector();
    }
    return _testInjector;
}
exports.getTestInjector = getTestInjector;
/**
 * Set the providers that the test injector should use. These should be providers
 * common to every test in the suite.
 *
 * This may only be called once, to set up the common providers for the current test
 * suite on teh current platform. If you absolutely need to change the providers,
 * first use `resetBaseTestProviders`.
 *
 * Test Providers for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 */
function setBaseTestProviders(platformProviders, applicationProviders) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
        throw new exceptions_1.BaseException('Cannot set base providers because it has already been called');
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    var inits = injector.getOptional(core_1.PLATFORM_INITIALIZER);
    if (lang_1.isPresent(inits)) {
        inits.forEach(function (init) { return init(); });
    }
    testInjector.reset();
}
exports.setBaseTestProviders = setBaseTestProviders;
/**
 * Reset the providers for the test injector.
 */
function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
}
exports.resetBaseTestProviders = resetBaseTestProviders;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should
 * eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
exports.inject = inject;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. The test must return
 * a promise which will resolve when all asynchronous activity is complete.
 *
 * Example:
 *
 * ```
 * it('...', injectAsync([AClass], (object) => {
 *   return object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
exports.injectAsync = injectAsync;
var FunctionWithParamTokens = (function () {
    function FunctionWithParamTokens(_tokens, _fn, isAsync) {
        this._tokens = _tokens;
        this._fn = _fn;
        this.isAsync = isAsync;
    }
    /**
     * Returns the value of the executed function.
     */
    FunctionWithParamTokens.prototype.execute = function (injector) {
        var params = this._tokens.map(function (t) { return injector.get(t); });
        return lang_1.FunctionWrapper.apply(this._fn, params);
    };
    FunctionWithParamTokens.prototype.hasToken = function (token) { return this._tokens.indexOf(token) > -1; };
    return FunctionWithParamTokens;
})();
exports.FunctionWithParamTokens = FunctionWithParamTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfaW5qZWN0b3IudHMiXSwibmFtZXMiOlsiVGVzdEluamVjdG9yIiwiVGVzdEluamVjdG9yLmNvbnN0cnVjdG9yIiwiVGVzdEluamVjdG9yLnJlc2V0IiwiVGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyIsIlRlc3RJbmplY3Rvci5jcmVhdGVJbmplY3RvciIsIlRlc3RJbmplY3Rvci5leGVjdXRlIiwiZ2V0VGVzdEluamVjdG9yIiwic2V0QmFzZVRlc3RQcm92aWRlcnMiLCJyZXNldEJhc2VUZXN0UHJvdmlkZXJzIiwiaW5qZWN0IiwiaW5qZWN0QXN5bmMiLCJGdW5jdGlvbldpdGhQYXJhbVRva2VucyIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmNvbnN0cnVjdG9yIiwiRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMuZXhlY3V0ZSIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmhhc1Rva2VuIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFBdUQsZUFBZSxDQUFDLENBQUE7QUFDdkUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QscUJBQStDLDBCQUEwQixDQUFDLENBQUE7QUFFMUU7SUFBQUE7UUFDVUMsa0JBQWFBLEdBQVlBLEtBQUtBLENBQUNBO1FBRS9CQSxjQUFTQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUUzQkEsZUFBVUEsR0FBbUNBLEVBQUVBLENBQUNBO1FBUXhEQSxzQkFBaUJBLEdBQW1DQSxFQUFFQSxDQUFDQTtRQUV2REEseUJBQW9CQSxHQUFtQ0EsRUFBRUEsQ0FBQ0E7SUF1QjVEQSxDQUFDQTtJQS9CQ0QsNEJBQUtBLEdBQUxBO1FBQ0VFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxFQUFFQSxD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LFVBQVFBLFFBQWtCQTtRQUN4QkUsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBZkEsQ0FBZUEsQ0FBQ0EsQ0FBQ0E7UUFDcERBLE1BQU1BLENBQUNBLHNCQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUNqREEsQ0FBQ0E7SUFFREYsMENBQVFBLEdBQVJBLFVBQVNBLEtBQVVBLElBQWFHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQzVFSCw4QkFBQ0E7QUFBREEsQ0FBQ0EsQUFaRCxJQVlDO0FBWlksK0JBQXVCLDBCQVluQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RvciwgUHJvdmlkZXIsIFBMQVRGT1JNX0lOSVRJQUxJWkVSfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgRXhjZXB0aW9uSGFuZGxlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0Z1bmN0aW9uV3JhcHBlciwgaXNQcmVzZW50LCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5leHBvcnQgY2xhc3MgVGVzdEluamVjdG9yIHtcbiAgcHJpdmF0ZSBfaW5zdGFudGlhdGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yID0gbnVsbDtcblxuICBwcml2YXRlIF9wcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPiA9IFtdO1xuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2luamVjdG9yID0gbnVsbDtcbiAgICB0aGlzLl9wcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9pbnN0YW50aWF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHBsYXRmb3JtUHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4gPSBbXTtcblxuICBhcHBsaWNhdGlvblByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+ID0gW107XG5cbiAgYWRkUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KSB7XG4gICAgaWYgKHRoaXMuX2luc3RhbnRpYXRlZCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nhbm5vdCBhZGQgcHJvdmlkZXJzIGFmdGVyIHRlc3QgaW5qZWN0b3IgaXMgaW5zdGFudGlhdGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX3Byb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNvbmNhdCh0aGlzLl9wcm92aWRlcnMsIHByb3ZpZGVycyk7XG4gIH1cblxuICBjcmVhdGVJbmplY3RvcigpIHtcbiAgICB2YXIgcm9vdEluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZSh0aGlzLnBsYXRmb3JtUHJvdmlkZXJzKTtcbiAgICB0aGlzLl9pbmplY3RvciA9IHJvb3RJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoXG4gICAgICAgIExpc3RXcmFwcGVyLmNvbmNhdCh0aGlzLmFwcGxpY2F0aW9uUHJvdmlkZXJzLCB0aGlzLl9wcm92aWRlcnMpKTtcbiAgICB0aGlzLl9pbnN0YW50aWF0ZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9pbmplY3RvcjtcbiAgfVxuXG4gIGV4ZWN1dGUoZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKTogYW55IHtcbiAgICBpZiAoIXRoaXMuX2luc3RhbnRpYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGVJbmplY3RvcigpO1xuICAgIH1cbiAgICByZXR1cm4gZm4uZXhlY3V0ZSh0aGlzLl9pbmplY3Rvcik7XG4gIH1cbn1cblxudmFyIF90ZXN0SW5qZWN0b3I6IFRlc3RJbmplY3RvciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXN0SW5qZWN0b3IoKSB7XG4gIGlmIChfdGVzdEluamVjdG9yID09IG51bGwpIHtcbiAgICBfdGVzdEluamVjdG9yID0gbmV3IFRlc3RJbmplY3RvcigpO1xuICB9XG4gIHJldHVybiBfdGVzdEluamVjdG9yO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcHJvdmlkZXJzIHRoYXQgdGhlIHRlc3QgaW5qZWN0b3Igc2hvdWxkIHVzZS4gVGhlc2Ugc2hvdWxkIGJlIHByb3ZpZGVyc1xuICogY29tbW9uIHRvIGV2ZXJ5IHRlc3QgaW4gdGhlIHN1aXRlLlxuICpcbiAqIFRoaXMgbWF5IG9ubHkgYmUgY2FsbGVkIG9uY2UsIHRvIHNldCB1cCB0aGUgY29tbW9uIHByb3ZpZGVycyBmb3IgdGhlIGN1cnJlbnQgdGVzdFxuICogc3VpdGUgb24gdGVoIGN1cnJlbnQgcGxhdGZvcm0uIElmIHlvdSBhYnNvbHV0ZWx5IG5lZWQgdG8gY2hhbmdlIHRoZSBwcm92aWRlcnMsXG4gKiBmaXJzdCB1c2UgYHJlc2V0QmFzZVRlc3RQcm92aWRlcnNgLlxuICpcbiAqIFRlc3QgUHJvdmlkZXJzIGZvciBpbmRpdmlkdWFsIHBsYXRmb3JtcyBhcmUgYXZhaWxhYmxlIGZyb21cbiAqICdhbmd1bGFyMi9wbGF0Zm9ybS90ZXN0aW5nLzxwbGF0Zm9ybV9uYW1lPicuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCYXNlVGVzdFByb3ZpZGVycyhwbGF0Zm9ybVByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uUHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pIHtcbiAgdmFyIHRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuICBpZiAodGVzdEluamVjdG9yLnBsYXRmb3JtUHJvdmlkZXJzLmxlbmd0aCA+IDAgfHwgdGVzdEluamVjdG9yLmFwcGxpY2F0aW9uUHJvdmlkZXJzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IHNldCBiYXNlIHByb3ZpZGVycyBiZWNhdXNlIGl0IGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkJyk7XG4gIH1cbiAgdGVzdEluamVjdG9yLnBsYXRmb3JtUHJvdmlkZXJzID0gcGxhdGZvcm1Qcm92aWRlcnM7XG4gIHRlc3RJbmplY3Rvci5hcHBsaWNhdGlvblByb3ZpZGVycyA9IGFwcGxpY2F0aW9uUHJvdmlkZXJzO1xuICB2YXIgaW5qZWN0b3IgPSB0ZXN0SW5qZWN0b3IuY3JlYXRlSW5qZWN0b3IoKTtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoUExBVEZPUk1fSU5JVElBTElaRVIpO1xuICBpZiAoaXNQcmVzZW50KGluaXRzKSkge1xuICAgIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xuICB9XG4gIHRlc3RJbmplY3Rvci5yZXNldCgpO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSBwcm92aWRlcnMgZm9yIHRoZSB0ZXN0IGluamVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRCYXNlVGVzdFByb3ZpZGVycygpIHtcbiAgdmFyIHRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuICB0ZXN0SW5qZWN0b3IucGxhdGZvcm1Qcm92aWRlcnMgPSBbXTtcbiAgdGVzdEluamVjdG9yLmFwcGxpY2F0aW9uUHJvdmlkZXJzID0gW107XG4gIHRlc3RJbmplY3Rvci5yZXNldCgpO1xufVxuXG4vKipcbiAqIEFsbG93cyBpbmplY3RpbmcgZGVwZW5kZW5jaWVzIGluIGBiZWZvcmVFYWNoKClgIGFuZCBgaXQoKWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGJlZm9yZUVhY2goaW5qZWN0KFtEZXBlbmRlbmN5LCBBQ2xhc3NdLCAoZGVwLCBvYmplY3QpID0+IHtcbiAqICAgLy8gc29tZSBjb2RlIHRoYXQgdXNlcyBgZGVwYCBhbmQgYG9iamVjdGBcbiAqICAgLy8gLi4uXG4gKiB9KSk7XG4gKlxuICogaXQoJy4uLicsIGluamVjdChbQUNsYXNzXSwgKG9iamVjdCkgPT4ge1xuICogICBvYmplY3QuZG9Tb21ldGhpbmcoKTtcbiAqICAgZXhwZWN0KC4uLik7XG4gKiB9KVxuICogYGBgXG4gKlxuICogTm90ZXM6XG4gKiAtIGluamVjdCBpcyBjdXJyZW50bHkgYSBmdW5jdGlvbiBiZWNhdXNlIG9mIHNvbWUgVHJhY2V1ciBsaW1pdGF0aW9uIHRoZSBzeW50YXggc2hvdWxkXG4gKiBldmVudHVhbGx5XG4gKiAgIGJlY29tZXMgYGl0KCcuLi4nLCBASW5qZWN0IChvYmplY3Q6IEFDbGFzcywgYXN5bmM6IEFzeW5jVGVzdENvbXBsZXRlcikgPT4geyAuLi4gfSk7YFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9uV2l0aFBhcmFtVG9rZW5zfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0KHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCBmYWxzZSk7XG59XG5cbi8qKlxuICogQWxsb3dzIGluamVjdGluZyBkZXBlbmRlbmNpZXMgaW4gYGJlZm9yZUVhY2goKWAgYW5kIGBpdCgpYC4gVGhlIHRlc3QgbXVzdCByZXR1cm5cbiAqIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiBhbGwgYXN5bmNocm9ub3VzIGFjdGl2aXR5IGlzIGNvbXBsZXRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBpdCgnLi4uJywgaW5qZWN0QXN5bmMoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgcmV0dXJuIG9iamVjdC5kb1NvbWV0aGluZygpLnRoZW4oKCkgPT4ge1xuICogICAgIGV4cGVjdCguLi4pO1xuICogICB9KTtcbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB0b2tlbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbldpdGhQYXJhbVRva2Vuc31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdEFzeW5jKHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCB0cnVlKTtcbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdG9rZW5zOiBhbnlbXSwgcHJpdmF0ZSBfZm46IEZ1bmN0aW9uLCBwdWJsaWMgaXNBc3luYzogYm9vbGVhbikge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGV4ZWN1dGVkIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZShpbmplY3RvcjogSW5qZWN0b3IpOiBhbnkge1xuICAgIHZhciBwYXJhbXMgPSB0aGlzLl90b2tlbnMubWFwKHQgPT4gaW5qZWN0b3IuZ2V0KHQpKTtcbiAgICByZXR1cm4gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KHRoaXMuX2ZuLCBwYXJhbXMpO1xuICB9XG5cbiAgaGFzVG9rZW4odG9rZW46IGFueSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdG9rZW5zLmluZGV4T2YodG9rZW4pID4gLTE7IH1cbn1cbiJdfQ==