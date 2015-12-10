'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require("angular2/src/facade/lang");
/**
 * A parameter metadata that specifies a dependency.
 *
 * ### Example ([live demo](http://plnkr.co/edit/6uHYJK?p=preview))
 *
 * ```typescript
 * class Engine {}
 *
 * @Injectable()
 * class Car {
 *   engine;
 *   constructor(@Inject("MyEngine") engine:Engine) {
 *     this.engine = engine;
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([
 *  provide("MyEngine", {useClass: Engine}),
 *  Car
 * ]);
 *
 * expect(injector.get(Car).engine instanceof Engine).toBe(true);
 * ```
 *
 * When `@Inject()` is not present, {@link Injector} will use the type annotation of the parameter.
 *
 * ### Example
 *
 * ```typescript
 * class Engine {}
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine: Engine) {} //same as constructor(@Inject(Engine) engine:Engine)
 * }
 *
 * var injector = Injector.resolveAndCreate([Engine, Car]);
 * expect(injector.get(Car).engine instanceof Engine).toBe(true);
 * ```
 */
var InjectMetadata = (function () {
    function InjectMetadata(token) {
        this.token = token;
    }
    InjectMetadata.prototype.toString = function () { return "@Inject(" + lang_1.stringify(this.token) + ")"; };
    InjectMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], InjectMetadata);
    return InjectMetadata;
})();
exports.InjectMetadata = InjectMetadata;
/**
 * A parameter metadata that marks a dependency as optional. {@link Injector} provides `null` if
 * the dependency is not found.
 *
 * ### Example ([live demo](http://plnkr.co/edit/AsryOm?p=preview))
 *
 * ```typescript
 * class Engine {}
 *
 * @Injectable()
 * class Car {
 *   engine;
 *   constructor(@Optional() engine:Engine) {
 *     this.engine = engine;
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([Car]);
 * expect(injector.get(Car).engine).toBeNull();
 * ```
 */
var OptionalMetadata = (function () {
    function OptionalMetadata() {
    }
    OptionalMetadata.prototype.toString = function () { return "@Optional()"; };
    OptionalMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], OptionalMetadata);
    return OptionalMetadata;
})();
exports.OptionalMetadata = OptionalMetadata;
/**
 * `DependencyMetadata` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
var DependencyMetadata = (function () {
    function DependencyMetadata() {
    }
    Object.defineProperty(DependencyMetadata.prototype, "token", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    DependencyMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], DependencyMetadata);
    return DependencyMetadata;
})();
exports.DependencyMetadata = DependencyMetadata;
/**
 * A marker metadata that marks a class as available to {@link Injector} for creation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Wk4DMQ?p=preview))
 *
 * ```typescript
 * @Injectable()
 * class UsefulService {}
 *
 * @Injectable()
 * class NeedsService {
 *   constructor(public service:UsefulService) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([NeedsService, UsefulService]);
 * expect(injector.get(NeedsService).service instanceof UsefulService).toBe(true);
 * ```
 * {@link Injector} will throw {@link NoAnnotationError} when trying to instantiate a class that
 * does not have `@Injectable` marker, as shown in the example below.
 *
 * ```typescript
 * class UsefulService {}
 *
 * class NeedsService {
 *   constructor(public service:UsefulService) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([NeedsService, UsefulService]);
 * expect(() => injector.get(NeedsService)).toThrowError();
 * ```
 */
var InjectableMetadata = (function () {
    function InjectableMetadata() {
    }
    InjectableMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], InjectableMetadata);
    return InjectableMetadata;
})();
exports.InjectableMetadata = InjectableMetadata;
/**
 * Specifies that an {@link Injector} should retrieve a dependency only from itself.
 *
 * ### Example ([live demo](http://plnkr.co/edit/NeagAg?p=preview))
 *
 * ```typescript
 * class Dependency {
 * }
 *
 * @Injectable()
 * class NeedsDependency {
 *   dependency;
 *   constructor(@Self() dependency:Dependency) {
 *     this.dependency = dependency;
 *   }
 * }
 *
 * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
 * var nd = inj.get(NeedsDependency);
 *
 * expect(nd.dependency instanceof Dependency).toBe(true);
 *
 * var inj = Injector.resolveAndCreate([Dependency]);
 * var child = inj.resolveAndCreateChild([NeedsDependency]);
 * expect(() => child.get(NeedsDependency)).toThrowError();
 * ```
 */
var SelfMetadata = (function () {
    function SelfMetadata() {
    }
    SelfMetadata.prototype.toString = function () { return "@Self()"; };
    SelfMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], SelfMetadata);
    return SelfMetadata;
})();
exports.SelfMetadata = SelfMetadata;
/**
 * Specifies that the dependency resolution should start from the parent injector.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Wchdzb?p=preview))
 *
 * ```typescript
 * class Dependency {
 * }
 *
 * @Injectable()
 * class NeedsDependency {
 *   dependency;
 *   constructor(@SkipSelf() dependency:Dependency) {
 *     this.dependency = dependency;
 *   }
 * }
 *
 * var parent = Injector.resolveAndCreate([Dependency]);
 * var child = parent.resolveAndCreateChild([NeedsDependency]);
 * expect(child.get(NeedsDependency).dependency instanceof Depedency).toBe(true);
 *
 * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
 * expect(() => inj.get(NeedsDependency)).toThrowError();
 * ```
 */
var SkipSelfMetadata = (function () {
    function SkipSelfMetadata() {
    }
    SkipSelfMetadata.prototype.toString = function () { return "@SkipSelf()"; };
    SkipSelfMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], SkipSelfMetadata);
    return SkipSelfMetadata;
})();
exports.SkipSelfMetadata = SkipSelfMetadata;
/**
 * Specifies that an injector should retrieve a dependency from any injector until reaching the
 * closest host.
 *
 * In Angular, a component element is automatically declared as a host for all the injectors in
 * its view.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GX79pV?p=preview))
 *
 * In the following example `App` contains `ParentCmp`, which contains `ChildDirective`.
 * So `ParentCmp` is the host of `ChildDirective`.
 *
 * `ChildDirective` depends on two services: `HostService` and `OtherService`.
 * `HostService` is defined at `ParentCmp`, and `OtherService` is defined at `App`.
 *
 *```typescript
 * class OtherService {}
 * class HostService {}
 *
 * @Directive({
 *   selector: 'child-directive'
 * })
 * class ChildDirective {
 *   constructor(@Optional() @Host() os:OtherService, @Optional() @Host() hs:HostService){
 *     console.log("os is null", os);
 *     console.log("hs is NOT null", hs);
 *   }
 * }
 *
 * @Component({
 *   selector: 'parent-cmp',
 *   providers: [HostService],
 *   template: `
 *     Dir: <child-directive></child-directive>
 *   `,
 *   directives: [ChildDirective]
 * })
 * class ParentCmp {
 * }
 *
 * @Component({
 *   selector: 'app',
 *   providers: [OtherService],
 *   template: `
 *     Parent: <parent-cmp></parent-cmp>
 *   `,
 *   directives: [ParentCmp]
 * })
 * class App {
 * }
 *
 * bootstrap(App);
 *```
 */
var HostMetadata = (function () {
    function HostMetadata() {
    }
    HostMetadata.prototype.toString = function () { return "@Host()"; };
    HostMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], HostMetadata);
    return HostMetadata;
})();
exports.HostMetadata = HostMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJJbmplY3RNZXRhZGF0YSIsIkluamVjdE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSW5qZWN0TWV0YWRhdGEudG9TdHJpbmciLCJPcHRpb25hbE1ldGFkYXRhIiwiT3B0aW9uYWxNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIk9wdGlvbmFsTWV0YWRhdGEudG9TdHJpbmciLCJEZXBlbmRlbmN5TWV0YWRhdGEiLCJEZXBlbmRlbmN5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJEZXBlbmRlbmN5TWV0YWRhdGEudG9rZW4iLCJJbmplY3RhYmxlTWV0YWRhdGEiLCJJbmplY3RhYmxlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJTZWxmTWV0YWRhdGEiLCJTZWxmTWV0YWRhdGEuY29uc3RydWN0b3IiLCJTZWxmTWV0YWRhdGEudG9TdHJpbmciLCJTa2lwU2VsZk1ldGFkYXRhIiwiU2tpcFNlbGZNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlNraXBTZWxmTWV0YWRhdGEudG9TdHJpbmciLCJIb3N0TWV0YWRhdGEiLCJIb3N0TWV0YWRhdGEuY29uc3RydWN0b3IiLCJIb3N0TWV0YWRhdGEudG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUErRCwwQkFBMEIsQ0FBQyxDQUFBO0FBRTFGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFDSDtJQUVFQSx3QkFBbUJBLEtBQUtBO1FBQUxDLFVBQUtBLEdBQUxBLEtBQUtBLENBQUFBO0lBQUdBLENBQUNBO0lBQzVCRCxpQ0FBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLGFBQVdBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUhwRUY7UUFBQ0EsWUFBS0EsRUFBRUE7O3VCQUlQQTtJQUFEQSxxQkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSFksc0JBQWMsaUJBRzFCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSDtJQUFBRztJQUdBQyxDQUFDQTtJQURDRCxtQ0FBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRjlDRjtRQUFDQSxZQUFLQSxFQUFFQTs7eUJBR1BBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSx3QkFBZ0IsbUJBRTVCLENBQUE7QUFFRDs7O0dBR0c7QUFDSDtJQUFBRztJQUdBQyxDQUFDQTtJQURDRCxzQkFBSUEscUNBQUtBO2FBQVRBLGNBQWNFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFGOUJBO1FBQUNBLFlBQUtBLEVBQUVBOzsyQkFHUEE7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLDBCQUFrQixxQkFFOUIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUVFRztJQUFlQyxDQUFDQTtJQUZsQkQ7UUFBQ0EsWUFBS0EsRUFBRUE7OzJCQUdQQTtJQUFEQSx5QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksMEJBQWtCLHFCQUU5QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEJHO0FBQ0g7SUFBQUU7SUFHQUMsQ0FBQ0E7SUFEQ0QsK0JBQVFBLEdBQVJBLGNBQXFCRSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUYxQ0Y7UUFBQ0EsWUFBS0EsRUFBRUE7O3FCQUdQQTtJQUFEQSxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksb0JBQVksZUFFeEIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSDtJQUFBRztJQUdBQyxDQUFDQTtJQURDRCxtQ0FBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRjlDRjtRQUFDQSxZQUFLQSxFQUFFQTs7eUJBR1BBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSx3QkFBZ0IsbUJBRTVCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxREc7QUFDSDtJQUFBRztJQUdBQyxDQUFDQTtJQURDRCwrQkFBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBRjFDRjtRQUFDQSxZQUFLQSxFQUFFQTs7cUJBR1BBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSxvQkFBWSxlQUV4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgQ09OU1RfRVhQUiwgc3RyaW5naWZ5LCBpc0JsYW5rLCBpc1ByZXNlbnR9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcblxuLyoqXG4gKiBBIHBhcmFtZXRlciBtZXRhZGF0YSB0aGF0IHNwZWNpZmllcyBhIGRlcGVuZGVuY3kuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzZ1SFlKSz9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEVuZ2luZSB7fVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIENhciB7XG4gKiAgIGVuZ2luZTtcbiAqICAgY29uc3RydWN0b3IoQEluamVjdChcIk15RW5naW5lXCIpIGVuZ2luZTpFbmdpbmUpIHtcbiAqICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogIHByb3ZpZGUoXCJNeUVuZ2luZVwiLCB7dXNlQ2xhc3M6IEVuZ2luZX0pLFxuICogIENhclxuICogXSk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldChDYXIpLmVuZ2luZSBpbnN0YW5jZW9mIEVuZ2luZSkudG9CZSh0cnVlKTtcbiAqIGBgYFxuICpcbiAqIFdoZW4gYEBJbmplY3QoKWAgaXMgbm90IHByZXNlbnQsIHtAbGluayBJbmplY3Rvcn0gd2lsbCB1c2UgdGhlIHR5cGUgYW5ub3RhdGlvbiBvZiB0aGUgcGFyYW1ldGVyLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRW5naW5lIHt9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgQ2FyIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTogRW5naW5lKSB7fSAvL3NhbWUgYXMgY29uc3RydWN0b3IoQEluamVjdChFbmdpbmUpIGVuZ2luZTpFbmdpbmUpXG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRW5naW5lLCBDYXJdKTtcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoQ2FyKS5lbmdpbmUgaW5zdGFuY2VvZiBFbmdpbmUpLnRvQmUodHJ1ZSk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBJbmplY3RNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbikge31cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBASW5qZWN0KCR7c3RyaW5naWZ5KHRoaXMudG9rZW4pfSlgOyB9XG59XG5cbi8qKlxuICogQSBwYXJhbWV0ZXIgbWV0YWRhdGEgdGhhdCBtYXJrcyBhIGRlcGVuZGVuY3kgYXMgb3B0aW9uYWwuIHtAbGluayBJbmplY3Rvcn0gcHJvdmlkZXMgYG51bGxgIGlmXG4gKiB0aGUgZGVwZW5kZW5jeSBpcyBub3QgZm91bmQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0FzcnlPbT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEVuZ2luZSB7fVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIENhciB7XG4gKiAgIGVuZ2luZTtcbiAqICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgZW5naW5lOkVuZ2luZSkge1xuICogICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICogICB9XG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQ2FyXSk7XG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikuZW5naW5lKS50b0JlTnVsbCgpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgT3B0aW9uYWxNZXRhZGF0YSB7XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQE9wdGlvbmFsKClgOyB9XG59XG5cbi8qKlxuICogYERlcGVuZGVuY3lNZXRhZGF0YWAgaXMgdXNlZCBieSB0aGUgZnJhbWV3b3JrIHRvIGV4dGVuZCBESS5cbiAqIFRoaXMgaXMgaW50ZXJuYWwgdG8gQW5ndWxhciBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5LlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGdldCB0b2tlbigpIHsgcmV0dXJuIG51bGw7IH1cbn1cblxuLyoqXG4gKiBBIG1hcmtlciBtZXRhZGF0YSB0aGF0IG1hcmtzIGEgY2xhc3MgYXMgYXZhaWxhYmxlIHRvIHtAbGluayBJbmplY3Rvcn0gZm9yIGNyZWF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9XazRETVE/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBVc2VmdWxTZXJ2aWNlIHt9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTmVlZHNTZXJ2aWNlIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIHNlcnZpY2U6VXNlZnVsU2VydmljZSkge31cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtOZWVkc1NlcnZpY2UsIFVzZWZ1bFNlcnZpY2VdKTtcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoTmVlZHNTZXJ2aWNlKS5zZXJ2aWNlIGluc3RhbmNlb2YgVXNlZnVsU2VydmljZSkudG9CZSh0cnVlKTtcbiAqIGBgYFxuICoge0BsaW5rIEluamVjdG9yfSB3aWxsIHRocm93IHtAbGluayBOb0Fubm90YXRpb25FcnJvcn0gd2hlbiB0cnlpbmcgdG8gaW5zdGFudGlhdGUgYSBjbGFzcyB0aGF0XG4gKiBkb2VzIG5vdCBoYXZlIGBASW5qZWN0YWJsZWAgbWFya2VyLCBhcyBzaG93biBpbiB0aGUgZXhhbXBsZSBiZWxvdy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBVc2VmdWxTZXJ2aWNlIHt9XG4gKlxuICogY2xhc3MgTmVlZHNTZXJ2aWNlIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIHNlcnZpY2U6VXNlZnVsU2VydmljZSkge31cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtOZWVkc1NlcnZpY2UsIFVzZWZ1bFNlcnZpY2VdKTtcbiAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoTmVlZHNTZXJ2aWNlKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBJbmplY3RhYmxlTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcigpIHt9XG59XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYW4ge0BsaW5rIEluamVjdG9yfSBzaG91bGQgcmV0cmlldmUgYSBkZXBlbmRlbmN5IG9ubHkgZnJvbSBpdHNlbGYuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L05lYWdBZz9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIERlcGVuZGVuY3kge1xuICogfVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIE5lZWRzRGVwZW5kZW5jeSB7XG4gKiAgIGRlcGVuZGVuY3k7XG4gKiAgIGNvbnN0cnVjdG9yKEBTZWxmKCkgZGVwZW5kZW5jeTpEZXBlbmRlbmN5KSB7XG4gKiAgICAgdGhpcy5kZXBlbmRlbmN5ID0gZGVwZW5kZW5jeTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmogPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEZXBlbmRlbmN5LCBOZWVkc0RlcGVuZGVuY3ldKTtcbiAqIHZhciBuZCA9IGluai5nZXQoTmVlZHNEZXBlbmRlbmN5KTtcbiAqXG4gKiBleHBlY3QobmQuZGVwZW5kZW5jeSBpbnN0YW5jZW9mIERlcGVuZGVuY3kpLnRvQmUodHJ1ZSk7XG4gKlxuICogdmFyIGluaiA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0RlcGVuZGVuY3ldKTtcbiAqIHZhciBjaGlsZCA9IGluai5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoW05lZWRzRGVwZW5kZW5jeV0pO1xuICogZXhwZWN0KCgpID0+IGNoaWxkLmdldChOZWVkc0RlcGVuZGVuY3kpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFNlbGZNZXRhZGF0YSB7XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFNlbGYoKWA7IH1cbn1cblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCB0aGUgZGVwZW5kZW5jeSByZXNvbHV0aW9uIHNob3VsZCBzdGFydCBmcm9tIHRoZSBwYXJlbnQgaW5qZWN0b3IuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1djaGR6Yj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIERlcGVuZGVuY3kge1xuICogfVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIE5lZWRzRGVwZW5kZW5jeSB7XG4gKiAgIGRlcGVuZGVuY3k7XG4gKiAgIGNvbnN0cnVjdG9yKEBTa2lwU2VsZigpIGRlcGVuZGVuY3k6RGVwZW5kZW5jeSkge1xuICogICAgIHRoaXMuZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3k7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgcGFyZW50ID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRGVwZW5kZW5jeV0pO1xuICogdmFyIGNoaWxkID0gcGFyZW50LnJlc29sdmVBbmRDcmVhdGVDaGlsZChbTmVlZHNEZXBlbmRlbmN5XSk7XG4gKiBleHBlY3QoY2hpbGQuZ2V0KE5lZWRzRGVwZW5kZW5jeSkuZGVwZW5kZW5jeSBpbnN0YW5jZW9mIERlcGVkZW5jeSkudG9CZSh0cnVlKTtcbiAqXG4gKiB2YXIgaW5qID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRGVwZW5kZW5jeSwgTmVlZHNEZXBlbmRlbmN5XSk7XG4gKiBleHBlY3QoKCkgPT4gaW5qLmdldChOZWVkc0RlcGVuZGVuY3kpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFNraXBTZWxmTWV0YWRhdGEge1xuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBTa2lwU2VsZigpYDsgfVxufVxuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IGFuIGluamVjdG9yIHNob3VsZCByZXRyaWV2ZSBhIGRlcGVuZGVuY3kgZnJvbSBhbnkgaW5qZWN0b3IgdW50aWwgcmVhY2hpbmcgdGhlXG4gKiBjbG9zZXN0IGhvc3QuXG4gKlxuICogSW4gQW5ndWxhciwgYSBjb21wb25lbnQgZWxlbWVudCBpcyBhdXRvbWF0aWNhbGx5IGRlY2xhcmVkIGFzIGEgaG9zdCBmb3IgYWxsIHRoZSBpbmplY3RvcnMgaW5cbiAqIGl0cyB2aWV3LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HWDc5cFY/cD1wcmV2aWV3KSlcbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgYEFwcGAgY29udGFpbnMgYFBhcmVudENtcGAsIHdoaWNoIGNvbnRhaW5zIGBDaGlsZERpcmVjdGl2ZWAuXG4gKiBTbyBgUGFyZW50Q21wYCBpcyB0aGUgaG9zdCBvZiBgQ2hpbGREaXJlY3RpdmVgLlxuICpcbiAqIGBDaGlsZERpcmVjdGl2ZWAgZGVwZW5kcyBvbiB0d28gc2VydmljZXM6IGBIb3N0U2VydmljZWAgYW5kIGBPdGhlclNlcnZpY2VgLlxuICogYEhvc3RTZXJ2aWNlYCBpcyBkZWZpbmVkIGF0IGBQYXJlbnRDbXBgLCBhbmQgYE90aGVyU2VydmljZWAgaXMgZGVmaW5lZCBhdCBgQXBwYC5cbiAqXG4gKmBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE90aGVyU2VydmljZSB7fVxuICogY2xhc3MgSG9zdFNlcnZpY2Uge31cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1kaXJlY3RpdmUnXG4gKiB9KVxuICogY2xhc3MgQ2hpbGREaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBASG9zdCgpIG9zOk90aGVyU2VydmljZSwgQE9wdGlvbmFsKCkgQEhvc3QoKSBoczpIb3N0U2VydmljZSl7XG4gKiAgICAgY29uc29sZS5sb2coXCJvcyBpcyBudWxsXCIsIG9zKTtcbiAqICAgICBjb25zb2xlLmxvZyhcImhzIGlzIE5PVCBudWxsXCIsIGhzKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhcmVudC1jbXAnLFxuICogICBwcm92aWRlcnM6IFtIb3N0U2VydmljZV0sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgRGlyOiA8Y2hpbGQtZGlyZWN0aXZlPjwvY2hpbGQtZGlyZWN0aXZlPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGREaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgUGFyZW50Q21wIHtcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICBwcm92aWRlcnM6IFtPdGhlclNlcnZpY2VdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIFBhcmVudDogPHBhcmVudC1jbXA+PC9wYXJlbnQtY21wPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbUGFyZW50Q21wXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKmBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEhvc3RNZXRhZGF0YSB7XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQEhvc3QoKWA7IH1cbn1cbiJdfQ==