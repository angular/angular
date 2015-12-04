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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJJbmplY3RNZXRhZGF0YSIsIkluamVjdE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSW5qZWN0TWV0YWRhdGEudG9TdHJpbmciLCJPcHRpb25hbE1ldGFkYXRhIiwiT3B0aW9uYWxNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIk9wdGlvbmFsTWV0YWRhdGEudG9TdHJpbmciLCJEZXBlbmRlbmN5TWV0YWRhdGEiLCJEZXBlbmRlbmN5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJEZXBlbmRlbmN5TWV0YWRhdGEudG9rZW4iLCJJbmplY3RhYmxlTWV0YWRhdGEiLCJJbmplY3RhYmxlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJTZWxmTWV0YWRhdGEiLCJTZWxmTWV0YWRhdGEuY29uc3RydWN0b3IiLCJTZWxmTWV0YWRhdGEudG9TdHJpbmciLCJTa2lwU2VsZk1ldGFkYXRhIiwiU2tpcFNlbGZNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlNraXBTZWxmTWV0YWRhdGEudG9TdHJpbmciLCJIb3N0TWV0YWRhdGEiLCJIb3N0TWV0YWRhdGEuY29uc3RydWN0b3IiLCJIb3N0TWV0YWRhdGEudG9TdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQStELDBCQUEwQixDQUFDLENBQUE7QUFFMUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVDRztBQUNIO0lBRUVBLHdCQUFtQkEsS0FBS0E7UUFBTEMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBQUE7SUFBR0EsQ0FBQ0E7SUFDNUJELGlDQUFRQSxHQUFSQSxjQUFxQkUsTUFBTUEsQ0FBQ0EsYUFBV0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQUdBLENBQUNBLENBQUNBLENBQUNBO0lBSHBFRjtRQUFDQSxZQUFLQSxFQUFFQTs7dUJBSVBBO0lBQURBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQUpELElBSUM7QUFIWSxzQkFBYyxpQkFHMUIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNIO0lBQUFHO0lBR0FDLENBQUNBO0lBRENELG1DQUFRQSxHQUFSQSxjQUFxQkUsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFGOUNGO1FBQUNBLFlBQUtBLEVBQUVBOzt5QkFHUEE7SUFBREEsdUJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLHdCQUFnQixtQkFFNUIsQ0FBQTtBQUVEOzs7R0FHRztBQUNIO0lBQUFHO0lBR0FDLENBQUNBO0lBRENELHNCQUFJQSxxQ0FBS0E7YUFBVEEsY0FBY0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUY5QkE7UUFBQ0EsWUFBS0EsRUFBRUE7OzJCQUdQQTtJQUFEQSx5QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksMEJBQWtCLHFCQUU5QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNIO0lBRUVHO0lBQWVDLENBQUNBO0lBRmxCRDtRQUFDQSxZQUFLQSxFQUFFQTs7MkJBR1BBO0lBQURBLHlCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSwwQkFBa0IscUJBRTlCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFDSDtJQUFBRTtJQUdBQyxDQUFDQTtJQURDRCwrQkFBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBRjFDRjtRQUFDQSxZQUFLQSxFQUFFQTs7cUJBR1BBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSxvQkFBWSxlQUV4QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNIO0lBQUFHO0lBR0FDLENBQUNBO0lBRENELG1DQUFRQSxHQUFSQSxjQUFxQkUsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFGOUNGO1FBQUNBLFlBQUtBLEVBQUVBOzt5QkFHUEE7SUFBREEsdUJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLHdCQUFnQixtQkFFNUIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFERztBQUNIO0lBQUFHO0lBR0FDLENBQUNBO0lBRENELCtCQUFRQSxHQUFSQSxjQUFxQkUsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFGMUNGO1FBQUNBLFlBQUtBLEVBQUVBOztxQkFHUEE7SUFBREEsbUJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLG9CQUFZLGVBRXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBDT05TVF9FWFBSLCBzdHJpbmdpZnksIGlzQmxhbmssIGlzUHJlc2VudH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG4vKipcbiAqIEEgcGFyYW1ldGVyIG1ldGFkYXRhIHRoYXQgc3BlY2lmaWVzIGEgZGVwZW5kZW5jeS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvNnVIWUpLP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRW5naW5lIHt9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgQ2FyIHtcbiAqICAgZW5naW5lO1xuICogICBjb25zdHJ1Y3RvcihASW5qZWN0KFwiTXlFbmdpbmVcIikgZW5naW5lOkVuZ2luZSkge1xuICogICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICogICB9XG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgcHJvdmlkZShcIk15RW5naW5lXCIsIHt1c2VDbGFzczogRW5naW5lfSksXG4gKiAgQ2FyXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikuZW5naW5lIGluc3RhbmNlb2YgRW5naW5lKS50b0JlKHRydWUpO1xuICogYGBgXG4gKlxuICogV2hlbiBgQEluamVjdCgpYCBpcyBub3QgcHJlc2VudCwge0BsaW5rIEluamVjdG9yfSB3aWxsIHVzZSB0aGUgdHlwZSBhbm5vdGF0aW9uIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBFbmdpbmUge31cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBDYXIge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOiBFbmdpbmUpIHt9IC8vc2FtZSBhcyBjb25zdHJ1Y3RvcihASW5qZWN0KEVuZ2luZSkgZW5naW5lOkVuZ2luZSlcbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtFbmdpbmUsIENhcl0pO1xuICogZXhwZWN0KGluamVjdG9yLmdldChDYXIpLmVuZ2luZSBpbnN0YW5jZW9mIEVuZ2luZSkudG9CZSh0cnVlKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEluamVjdE1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBJbmplY3QoJHtzdHJpbmdpZnkodGhpcy50b2tlbil9KWA7IH1cbn1cblxuLyoqXG4gKiBBIHBhcmFtZXRlciBtZXRhZGF0YSB0aGF0IG1hcmtzIGEgZGVwZW5kZW5jeSBhcyBvcHRpb25hbC4ge0BsaW5rIEluamVjdG9yfSBwcm92aWRlcyBgbnVsbGAgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IGlzIG5vdCBmb3VuZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvQXNyeU9tP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRW5naW5lIHt9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgQ2FyIHtcbiAqICAgZW5naW5lO1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBlbmdpbmU6RW5naW5lKSB7XG4gKiAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtDYXJdKTtcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoQ2FyKS5lbmdpbmUpLnRvQmVOdWxsKCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBPcHRpb25hbE1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAT3B0aW9uYWwoKWA7IH1cbn1cblxuLyoqXG4gKiBgRGVwZW5kZW5jeU1ldGFkYXRhYCBpcyB1c2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gZXh0ZW5kIERJLlxuICogVGhpcyBpcyBpbnRlcm5hbCB0byBBbmd1bGFyIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgZ2V0IHRva2VuKCkgeyByZXR1cm4gbnVsbDsgfVxufVxuXG4vKipcbiAqIEEgbWFya2VyIG1ldGFkYXRhIHRoYXQgbWFya3MgYSBjbGFzcyBhcyBhdmFpbGFibGUgdG8ge0BsaW5rIEluamVjdG9yfSBmb3IgY3JlYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1drNERNUT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFVzZWZ1bFNlcnZpY2Uge31cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBOZWVkc1NlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VydmljZTpVc2VmdWxTZXJ2aWNlKSB7fVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW05lZWRzU2VydmljZSwgVXNlZnVsU2VydmljZV0pO1xuICogZXhwZWN0KGluamVjdG9yLmdldChOZWVkc1NlcnZpY2UpLnNlcnZpY2UgaW5zdGFuY2VvZiBVc2VmdWxTZXJ2aWNlKS50b0JlKHRydWUpO1xuICogYGBgXG4gKiB7QGxpbmsgSW5qZWN0b3J9IHdpbGwgdGhyb3cge0BsaW5rIE5vQW5ub3RhdGlvbkVycm9yfSB3aGVuIHRyeWluZyB0byBpbnN0YW50aWF0ZSBhIGNsYXNzIHRoYXRcbiAqIGRvZXMgbm90IGhhdmUgYEBJbmplY3RhYmxlYCBtYXJrZXIsIGFzIHNob3duIGluIHRoZSBleGFtcGxlIGJlbG93LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIFVzZWZ1bFNlcnZpY2Uge31cbiAqXG4gKiBjbGFzcyBOZWVkc1NlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VydmljZTpVc2VmdWxTZXJ2aWNlKSB7fVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW05lZWRzU2VydmljZSwgVXNlZnVsU2VydmljZV0pO1xuICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldChOZWVkc1NlcnZpY2UpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEluamVjdGFibGVNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbn1cblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCBhbiB7QGxpbmsgSW5qZWN0b3J9IHNob3VsZCByZXRyaWV2ZSBhIGRlcGVuZGVuY3kgb25seSBmcm9tIGl0c2VsZi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvTmVhZ0FnP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiB9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTmVlZHNEZXBlbmRlbmN5IHtcbiAqICAgZGVwZW5kZW5jeTtcbiAqICAgY29uc3RydWN0b3IoQFNlbGYoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgICB0aGlzLmRlcGVuZGVuY3kgPSBkZXBlbmRlbmN5O1xuICogICB9XG4gKiB9XG4gKlxuICogdmFyIGluaiA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0RlcGVuZGVuY3ksIE5lZWRzRGVwZW5kZW5jeV0pO1xuICogdmFyIG5kID0gaW5qLmdldChOZWVkc0RlcGVuZGVuY3kpO1xuICpcbiAqIGV4cGVjdChuZC5kZXBlbmRlbmN5IGluc3RhbmNlb2YgRGVwZW5kZW5jeSkudG9CZSh0cnVlKTtcbiAqXG4gKiB2YXIgaW5qID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRGVwZW5kZW5jeV0pO1xuICogdmFyIGNoaWxkID0gaW5qLnJlc29sdmVBbmRDcmVhdGVDaGlsZChbTmVlZHNEZXBlbmRlbmN5XSk7XG4gKiBleHBlY3QoKCkgPT4gY2hpbGQuZ2V0KE5lZWRzRGVwZW5kZW5jeSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgU2VsZk1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAU2VsZigpYDsgfVxufVxuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IHRoZSBkZXBlbmRlbmN5IHJlc29sdXRpb24gc2hvdWxkIHN0YXJ0IGZyb20gdGhlIHBhcmVudCBpbmplY3Rvci5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvV2NoZHpiP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiB9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTmVlZHNEZXBlbmRlbmN5IHtcbiAqICAgZGVwZW5kZW5jeTtcbiAqICAgY29uc3RydWN0b3IoQFNraXBTZWxmKCkgZGVwZW5kZW5jeTpEZXBlbmRlbmN5KSB7XG4gKiAgICAgdGhpcy5kZXBlbmRlbmN5ID0gZGVwZW5kZW5jeTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBwYXJlbnQgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEZXBlbmRlbmN5XSk7XG4gKiB2YXIgY2hpbGQgPSBwYXJlbnQucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFtOZWVkc0RlcGVuZGVuY3ldKTtcbiAqIGV4cGVjdChjaGlsZC5nZXQoTmVlZHNEZXBlbmRlbmN5KS5kZXBlbmRlbmN5IGluc3RhbmNlb2YgRGVwZWRlbmN5KS50b0JlKHRydWUpO1xuICpcbiAqIHZhciBpbmogPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEZXBlbmRlbmN5LCBOZWVkc0RlcGVuZGVuY3ldKTtcbiAqIGV4cGVjdCgoKSA9PiBpbmouZ2V0KE5lZWRzRGVwZW5kZW5jeSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgU2tpcFNlbGZNZXRhZGF0YSB7XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFNraXBTZWxmKClgOyB9XG59XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYW4gaW5qZWN0b3Igc2hvdWxkIHJldHJpZXZlIGEgZGVwZW5kZW5jeSBmcm9tIGFueSBpbmplY3RvciB1bnRpbCByZWFjaGluZyB0aGVcbiAqIGNsb3Nlc3QgaG9zdC5cbiAqXG4gKiBJbiBBbmd1bGFyLCBhIGNvbXBvbmVudCBlbGVtZW50IGlzIGF1dG9tYXRpY2FsbHkgZGVjbGFyZWQgYXMgYSBob3N0IGZvciBhbGwgdGhlIGluamVjdG9ycyBpblxuICogaXRzIHZpZXcuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0dYNzlwVj9wPXByZXZpZXcpKVxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSBgQXBwYCBjb250YWlucyBgUGFyZW50Q21wYCwgd2hpY2ggY29udGFpbnMgYENoaWxkRGlyZWN0aXZlYC5cbiAqIFNvIGBQYXJlbnRDbXBgIGlzIHRoZSBob3N0IG9mIGBDaGlsZERpcmVjdGl2ZWAuXG4gKlxuICogYENoaWxkRGlyZWN0aXZlYCBkZXBlbmRzIG9uIHR3byBzZXJ2aWNlczogYEhvc3RTZXJ2aWNlYCBhbmQgYE90aGVyU2VydmljZWAuXG4gKiBgSG9zdFNlcnZpY2VgIGlzIGRlZmluZWQgYXQgYFBhcmVudENtcGAsIGFuZCBgT3RoZXJTZXJ2aWNlYCBpcyBkZWZpbmVkIGF0IGBBcHBgLlxuICpcbiAqYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgT3RoZXJTZXJ2aWNlIHt9XG4gKiBjbGFzcyBIb3N0U2VydmljZSB7fVxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWRpcmVjdGl2ZSdcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZERpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBIb3N0KCkgb3M6T3RoZXJTZXJ2aWNlLCBAT3B0aW9uYWwoKSBASG9zdCgpIGhzOkhvc3RTZXJ2aWNlKXtcbiAqICAgICBjb25zb2xlLmxvZyhcIm9zIGlzIG51bGxcIiwgb3MpO1xuICogICAgIGNvbnNvbGUubG9nKFwiaHMgaXMgTk9UIG51bGxcIiwgaHMpO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFyZW50LWNtcCcsXG4gKiAgIHByb3ZpZGVyczogW0hvc3RTZXJ2aWNlXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBEaXI6IDxjaGlsZC1kaXJlY3RpdmU+PC9jaGlsZC1kaXJlY3RpdmU+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcmVjdGl2ZV1cbiAqIH0pXG4gKiBjbGFzcyBQYXJlbnRDbXAge1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHByb3ZpZGVyczogW090aGVyU2VydmljZV0sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgUGFyZW50OiA8cGFyZW50LWNtcD48L3BhcmVudC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtQYXJlbnRDbXBdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSG9zdE1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBASG9zdCgpYDsgfVxufVxuIl19