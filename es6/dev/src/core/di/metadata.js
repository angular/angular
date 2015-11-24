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
import { CONST, stringify } from "angular2/src/facade/lang";
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
export let InjectMetadata = class {
    constructor(token) {
        this.token = token;
    }
    toString() { return `@Inject(${stringify(this.token)})`; }
};
InjectMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], InjectMetadata);
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
export let OptionalMetadata = class {
    toString() { return `@Optional()`; }
};
OptionalMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], OptionalMetadata);
/**
 * `DependencyMetadata` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
export let DependencyMetadata = class {
    get token() { return null; }
};
DependencyMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], DependencyMetadata);
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
export let InjectableMetadata = class {
    constructor() {
    }
};
InjectableMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], InjectableMetadata);
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
export let SelfMetadata = class {
    toString() { return `@Self()`; }
};
SelfMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], SelfMetadata);
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
export let SkipSelfMetadata = class {
    toString() { return `@SkipSelf()`; }
};
SkipSelfMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], SkipSelfMetadata);
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
export let HostMetadata = class {
    toString() { return `@Host()`; }
};
HostMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], HostMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJJbmplY3RNZXRhZGF0YSIsIkluamVjdE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSW5qZWN0TWV0YWRhdGEudG9TdHJpbmciLCJPcHRpb25hbE1ldGFkYXRhIiwiT3B0aW9uYWxNZXRhZGF0YS50b1N0cmluZyIsIkRlcGVuZGVuY3lNZXRhZGF0YSIsIkRlcGVuZGVuY3lNZXRhZGF0YS50b2tlbiIsIkluamVjdGFibGVNZXRhZGF0YSIsIkluamVjdGFibGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlNlbGZNZXRhZGF0YSIsIlNlbGZNZXRhZGF0YS50b1N0cmluZyIsIlNraXBTZWxmTWV0YWRhdGEiLCJTa2lwU2VsZk1ldGFkYXRhLnRvU3RyaW5nIiwiSG9zdE1ldGFkYXRhIiwiSG9zdE1ldGFkYXRhLnRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsS0FBSyxFQUFjLFNBQVMsRUFBcUIsTUFBTSwwQkFBMEI7QUFFekY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVDRztBQUNIO0lBRUVBLFlBQW1CQSxLQUFLQTtRQUFMQyxVQUFLQSxHQUFMQSxLQUFLQSxDQUFBQTtJQUFHQSxDQUFDQTtJQUM1QkQsUUFBUUEsS0FBYUUsTUFBTUEsQ0FBQ0EsV0FBV0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDcEVGLENBQUNBO0FBSkQ7SUFBQyxLQUFLLEVBQUU7O21CQUlQO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0g7SUFFRUcsUUFBUUEsS0FBYUMsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDOUNELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O3FCQUdQO0FBRUQ7OztHQUdHO0FBQ0g7SUFFRUUsSUFBSUEsS0FBS0EsS0FBS0MsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDOUJELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O3VCQUdQO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNIO0lBRUVFO0lBQWVDLENBQUNBO0FBQ2xCRCxDQUFDQTtBQUhEO0lBQUMsS0FBSyxFQUFFOzt1QkFHUDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBCRztBQUNIO0lBRUVFLFFBQVFBLEtBQWFDLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0FBQzFDRCxDQUFDQTtBQUhEO0lBQUMsS0FBSyxFQUFFOztpQkFHUDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSDtJQUVFRSxRQUFRQSxLQUFhQyxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUM5Q0QsQ0FBQ0E7QUFIRDtJQUFDLEtBQUssRUFBRTs7cUJBR1A7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxREc7QUFDSDtJQUVFRSxRQUFRQSxLQUFhQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMxQ0QsQ0FBQ0E7QUFIRDtJQUFDLEtBQUssRUFBRTs7aUJBR1A7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1QsIENPTlNUX0VYUFIsIHN0cmluZ2lmeSwgaXNCbGFuaywgaXNQcmVzZW50fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5cbi8qKlxuICogQSBwYXJhbWV0ZXIgbWV0YWRhdGEgdGhhdCBzcGVjaWZpZXMgYSBkZXBlbmRlbmN5LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC82dUhZSks/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBFbmdpbmUge31cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBDYXIge1xuICogICBlbmdpbmU7XG4gKiAgIGNvbnN0cnVjdG9yKEBJbmplY3QoXCJNeUVuZ2luZVwiKSBlbmdpbmU6RW5naW5lKSB7XG4gKiAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICBwcm92aWRlKFwiTXlFbmdpbmVcIiwge3VzZUNsYXNzOiBFbmdpbmV9KSxcbiAqICBDYXJcbiAqIF0pO1xuICpcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoQ2FyKS5lbmdpbmUgaW5zdGFuY2VvZiBFbmdpbmUpLnRvQmUodHJ1ZSk7XG4gKiBgYGBcbiAqXG4gKiBXaGVuIGBASW5qZWN0KClgIGlzIG5vdCBwcmVzZW50LCB7QGxpbmsgSW5qZWN0b3J9IHdpbGwgdXNlIHRoZSB0eXBlIGFubm90YXRpb24gb2YgdGhlIHBhcmFtZXRlci5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEVuZ2luZSB7fVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIENhciB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6IEVuZ2luZSkge30gLy9zYW1lIGFzIGNvbnN0cnVjdG9yKEBJbmplY3QoRW5naW5lKSBlbmdpbmU6RW5naW5lKVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0VuZ2luZSwgQ2FyXSk7XG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikuZW5naW5lIGluc3RhbmNlb2YgRW5naW5lKS50b0JlKHRydWUpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSW5qZWN0TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW4pIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQEluamVjdCgke3N0cmluZ2lmeSh0aGlzLnRva2VuKX0pYDsgfVxufVxuXG4vKipcbiAqIEEgcGFyYW1ldGVyIG1ldGFkYXRhIHRoYXQgbWFya3MgYSBkZXBlbmRlbmN5IGFzIG9wdGlvbmFsLiB7QGxpbmsgSW5qZWN0b3J9IHByb3ZpZGVzIGBudWxsYCBpZlxuICogdGhlIGRlcGVuZGVuY3kgaXMgbm90IGZvdW5kLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9Bc3J5T20/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBFbmdpbmUge31cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBDYXIge1xuICogICBlbmdpbmU7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIGVuZ2luZTpFbmdpbmUpIHtcbiAqICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0Nhcl0pO1xuICogZXhwZWN0KGluamVjdG9yLmdldChDYXIpLmVuZ2luZSkudG9CZU51bGwoKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIE9wdGlvbmFsTWV0YWRhdGEge1xuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBPcHRpb25hbCgpYDsgfVxufVxuXG4vKipcbiAqIGBEZXBlbmRlbmN5TWV0YWRhdGFgIGlzIHVzZWQgYnkgdGhlIGZyYW1ld29yayB0byBleHRlbmQgREkuXG4gKiBUaGlzIGlzIGludGVybmFsIHRvIEFuZ3VsYXIgYW5kIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseS5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBnZXQgdG9rZW4oKSB7IHJldHVybiBudWxsOyB9XG59XG5cbi8qKlxuICogQSBtYXJrZXIgbWV0YWRhdGEgdGhhdCBtYXJrcyBhIGNsYXNzIGFzIGF2YWlsYWJsZSB0byB7QGxpbmsgSW5qZWN0b3J9IGZvciBjcmVhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvV2s0RE1RP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgVXNlZnVsU2VydmljZSB7fVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIE5lZWRzU2VydmljZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBzZXJ2aWNlOlVzZWZ1bFNlcnZpY2UpIHt9XG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbTmVlZHNTZXJ2aWNlLCBVc2VmdWxTZXJ2aWNlXSk7XG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE5lZWRzU2VydmljZSkuc2VydmljZSBpbnN0YW5jZW9mIFVzZWZ1bFNlcnZpY2UpLnRvQmUodHJ1ZSk7XG4gKiBgYGBcbiAqIHtAbGluayBJbmplY3Rvcn0gd2lsbCB0aHJvdyB7QGxpbmsgTm9Bbm5vdGF0aW9uRXJyb3J9IHdoZW4gdHJ5aW5nIHRvIGluc3RhbnRpYXRlIGEgY2xhc3MgdGhhdFxuICogZG9lcyBub3QgaGF2ZSBgQEluamVjdGFibGVgIG1hcmtlciwgYXMgc2hvd24gaW4gdGhlIGV4YW1wbGUgYmVsb3cuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgVXNlZnVsU2VydmljZSB7fVxuICpcbiAqIGNsYXNzIE5lZWRzU2VydmljZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBzZXJ2aWNlOlVzZWZ1bFNlcnZpY2UpIHt9XG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbTmVlZHNTZXJ2aWNlLCBVc2VmdWxTZXJ2aWNlXSk7XG4gKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0KE5lZWRzU2VydmljZSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSW5qZWN0YWJsZU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoKSB7fVxufVxuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IGFuIHtAbGluayBJbmplY3Rvcn0gc2hvdWxkIHJldHJpZXZlIGEgZGVwZW5kZW5jeSBvbmx5IGZyb20gaXRzZWxmLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9OZWFnQWc/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqIH1cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBOZWVkc0RlcGVuZGVuY3kge1xuICogICBkZXBlbmRlbmN5O1xuICogICBjb25zdHJ1Y3RvcihAU2VsZigpIGRlcGVuZGVuY3k6RGVwZW5kZW5jeSkge1xuICogICAgIHRoaXMuZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3k7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgaW5qID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRGVwZW5kZW5jeSwgTmVlZHNEZXBlbmRlbmN5XSk7XG4gKiB2YXIgbmQgPSBpbmouZ2V0KE5lZWRzRGVwZW5kZW5jeSk7XG4gKlxuICogZXhwZWN0KG5kLmRlcGVuZGVuY3kgaW5zdGFuY2VvZiBEZXBlbmRlbmN5KS50b0JlKHRydWUpO1xuICpcbiAqIHZhciBpbmogPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEZXBlbmRlbmN5XSk7XG4gKiB2YXIgY2hpbGQgPSBpbmoucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFtOZWVkc0RlcGVuZGVuY3ldKTtcbiAqIGV4cGVjdCgoKSA9PiBjaGlsZC5nZXQoTmVlZHNEZXBlbmRlbmN5KSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBTZWxmTWV0YWRhdGEge1xuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBTZWxmKClgOyB9XG59XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgdGhlIGRlcGVuZGVuY3kgcmVzb2x1dGlvbiBzaG91bGQgc3RhcnQgZnJvbSB0aGUgcGFyZW50IGluamVjdG9yLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9XY2hkemI/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqIH1cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBOZWVkc0RlcGVuZGVuY3kge1xuICogICBkZXBlbmRlbmN5O1xuICogICBjb25zdHJ1Y3RvcihAU2tpcFNlbGYoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgICB0aGlzLmRlcGVuZGVuY3kgPSBkZXBlbmRlbmN5O1xuICogICB9XG4gKiB9XG4gKlxuICogdmFyIHBhcmVudCA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0RlcGVuZGVuY3ldKTtcbiAqIHZhciBjaGlsZCA9IHBhcmVudC5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoW05lZWRzRGVwZW5kZW5jeV0pO1xuICogZXhwZWN0KGNoaWxkLmdldChOZWVkc0RlcGVuZGVuY3kpLmRlcGVuZGVuY3kgaW5zdGFuY2VvZiBEZXBlZGVuY3kpLnRvQmUodHJ1ZSk7XG4gKlxuICogdmFyIGluaiA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0RlcGVuZGVuY3ksIE5lZWRzRGVwZW5kZW5jeV0pO1xuICogZXhwZWN0KCgpID0+IGluai5nZXQoTmVlZHNEZXBlbmRlbmN5KSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBTa2lwU2VsZk1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAU2tpcFNlbGYoKWA7IH1cbn1cblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCBhbiBpbmplY3RvciBzaG91bGQgcmV0cmlldmUgYSBkZXBlbmRlbmN5IGZyb20gYW55IGluamVjdG9yIHVudGlsIHJlYWNoaW5nIHRoZVxuICogY2xvc2VzdCBob3N0LlxuICpcbiAqIEluIEFuZ3VsYXIsIGEgY29tcG9uZW50IGVsZW1lbnQgaXMgYXV0b21hdGljYWxseSBkZWNsYXJlZCBhcyBhIGhvc3QgZm9yIGFsbCB0aGUgaW5qZWN0b3JzIGluXG4gKiBpdHMgdmlldy5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR1g3OXBWP3A9cHJldmlldykpXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIGBBcHBgIGNvbnRhaW5zIGBQYXJlbnRDbXBgLCB3aGljaCBjb250YWlucyBgQ2hpbGREaXJlY3RpdmVgLlxuICogU28gYFBhcmVudENtcGAgaXMgdGhlIGhvc3Qgb2YgYENoaWxkRGlyZWN0aXZlYC5cbiAqXG4gKiBgQ2hpbGREaXJlY3RpdmVgIGRlcGVuZHMgb24gdHdvIHNlcnZpY2VzOiBgSG9zdFNlcnZpY2VgIGFuZCBgT3RoZXJTZXJ2aWNlYC5cbiAqIGBIb3N0U2VydmljZWAgaXMgZGVmaW5lZCBhdCBgUGFyZW50Q21wYCwgYW5kIGBPdGhlclNlcnZpY2VgIGlzIGRlZmluZWQgYXQgYEFwcGAuXG4gKlxuICpgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBPdGhlclNlcnZpY2Uge31cbiAqIGNsYXNzIEhvc3RTZXJ2aWNlIHt9XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnY2hpbGQtZGlyZWN0aXZlJ1xuICogfSlcbiAqIGNsYXNzIENoaWxkRGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQEhvc3QoKSBvczpPdGhlclNlcnZpY2UsIEBPcHRpb25hbCgpIEBIb3N0KCkgaHM6SG9zdFNlcnZpY2Upe1xuICogICAgIGNvbnNvbGUubG9nKFwib3MgaXMgbnVsbFwiLCBvcyk7XG4gKiAgICAgY29uc29sZS5sb2coXCJocyBpcyBOT1QgbnVsbFwiLCBocyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYXJlbnQtY21wJyxcbiAqICAgcHJvdmlkZXJzOiBbSG9zdFNlcnZpY2VdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIERpcjogPGNoaWxkLWRpcmVjdGl2ZT48L2NoaWxkLWRpcmVjdGl2ZT5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFBhcmVudENtcCB7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgcHJvdmlkZXJzOiBbT3RoZXJTZXJ2aWNlXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBQYXJlbnQ6IDxwYXJlbnQtY21wPjwvcGFyZW50LWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW1BhcmVudENtcF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICpgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBIb3N0TWV0YWRhdGEge1xuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBIb3N0KClgOyB9XG59XG4iXX0=