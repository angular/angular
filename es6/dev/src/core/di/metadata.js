var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJJbmplY3RNZXRhZGF0YSIsIkluamVjdE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSW5qZWN0TWV0YWRhdGEudG9TdHJpbmciLCJPcHRpb25hbE1ldGFkYXRhIiwiT3B0aW9uYWxNZXRhZGF0YS50b1N0cmluZyIsIkRlcGVuZGVuY3lNZXRhZGF0YSIsIkRlcGVuZGVuY3lNZXRhZGF0YS50b2tlbiIsIkluamVjdGFibGVNZXRhZGF0YSIsIkluamVjdGFibGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlNlbGZNZXRhZGF0YSIsIlNlbGZNZXRhZGF0YS50b1N0cmluZyIsIlNraXBTZWxmTWV0YWRhdGEiLCJTa2lwU2VsZk1ldGFkYXRhLnRvU3RyaW5nIiwiSG9zdE1ldGFkYXRhIiwiSG9zdE1ldGFkYXRhLnRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLEtBQUssRUFBYyxTQUFTLEVBQXFCLE1BQU0sMEJBQTBCO0FBRXpGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFDSDtJQUVFQSxZQUFtQkEsS0FBS0E7UUFBTEMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBQUE7SUFBR0EsQ0FBQ0E7SUFDNUJELFFBQVFBLEtBQWFFLE1BQU1BLENBQUNBLFdBQVdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0FBQ3BFRixDQUFDQTtBQUpEO0lBQUMsS0FBSyxFQUFFOzttQkFJUDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNIO0lBRUVHLFFBQVFBLEtBQWFDLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0FBQzlDRCxDQUFDQTtBQUhEO0lBQUMsS0FBSyxFQUFFOztxQkFHUDtBQUVEOzs7R0FHRztBQUNIO0lBRUVFLElBQUlBLEtBQUtBLEtBQUtDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0FBQzlCRCxDQUFDQTtBQUhEO0lBQUMsS0FBSyxFQUFFOzt1QkFHUDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUVFRTtJQUFlQyxDQUFDQTtBQUNsQkQsQ0FBQ0E7QUFIRDtJQUFDLEtBQUssRUFBRTs7dUJBR1A7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFDSDtJQUVFRSxRQUFRQSxLQUFhQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMxQ0QsQ0FBQ0E7QUFIRDtJQUFDLEtBQUssRUFBRTs7aUJBR1A7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0JHO0FBQ0g7SUFFRUUsUUFBUUEsS0FBYUMsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDOUNELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O3FCQUdQO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcURHO0FBQ0g7SUFFRUUsUUFBUUEsS0FBYUMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDMUNELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O2lCQUdQO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBDT05TVF9FWFBSLCBzdHJpbmdpZnksIGlzQmxhbmssIGlzUHJlc2VudH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG4vKipcbiAqIEEgcGFyYW1ldGVyIG1ldGFkYXRhIHRoYXQgc3BlY2lmaWVzIGEgZGVwZW5kZW5jeS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvNnVIWUpLP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRW5naW5lIHt9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgQ2FyIHtcbiAqICAgZW5naW5lO1xuICogICBjb25zdHJ1Y3RvcihASW5qZWN0KFwiTXlFbmdpbmVcIikgZW5naW5lOkVuZ2luZSkge1xuICogICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICogICB9XG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgcHJvdmlkZShcIk15RW5naW5lXCIsIHt1c2VDbGFzczogRW5naW5lfSksXG4gKiAgQ2FyXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikuZW5naW5lIGluc3RhbmNlb2YgRW5naW5lKS50b0JlKHRydWUpO1xuICogYGBgXG4gKlxuICogV2hlbiBgQEluamVjdCgpYCBpcyBub3QgcHJlc2VudCwge0BsaW5rIEluamVjdG9yfSB3aWxsIHVzZSB0aGUgdHlwZSBhbm5vdGF0aW9uIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBFbmdpbmUge31cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBDYXIge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOiBFbmdpbmUpIHt9IC8vc2FtZSBhcyBjb25zdHJ1Y3RvcihASW5qZWN0KEVuZ2luZSkgZW5naW5lOkVuZ2luZSlcbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtFbmdpbmUsIENhcl0pO1xuICogZXhwZWN0KGluamVjdG9yLmdldChDYXIpLmVuZ2luZSBpbnN0YW5jZW9mIEVuZ2luZSkudG9CZSh0cnVlKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEluamVjdE1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBJbmplY3QoJHtzdHJpbmdpZnkodGhpcy50b2tlbil9KWA7IH1cbn1cblxuLyoqXG4gKiBBIHBhcmFtZXRlciBtZXRhZGF0YSB0aGF0IG1hcmtzIGEgZGVwZW5kZW5jeSBhcyBvcHRpb25hbC4ge0BsaW5rIEluamVjdG9yfSBwcm92aWRlcyBgbnVsbGAgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IGlzIG5vdCBmb3VuZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvQXNyeU9tP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRW5naW5lIHt9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgQ2FyIHtcbiAqICAgZW5naW5lO1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBlbmdpbmU6RW5naW5lKSB7XG4gKiAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtDYXJdKTtcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoQ2FyKS5lbmdpbmUpLnRvQmVOdWxsKCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBPcHRpb25hbE1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAT3B0aW9uYWwoKWA7IH1cbn1cblxuLyoqXG4gKiBgRGVwZW5kZW5jeU1ldGFkYXRhYCBpcyB1c2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gZXh0ZW5kIERJLlxuICogVGhpcyBpcyBpbnRlcm5hbCB0byBBbmd1bGFyIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgZ2V0IHRva2VuKCkgeyByZXR1cm4gbnVsbDsgfVxufVxuXG4vKipcbiAqIEEgbWFya2VyIG1ldGFkYXRhIHRoYXQgbWFya3MgYSBjbGFzcyBhcyBhdmFpbGFibGUgdG8ge0BsaW5rIEluamVjdG9yfSBmb3IgY3JlYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1drNERNUT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFVzZWZ1bFNlcnZpY2Uge31cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBOZWVkc1NlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VydmljZTpVc2VmdWxTZXJ2aWNlKSB7fVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW05lZWRzU2VydmljZSwgVXNlZnVsU2VydmljZV0pO1xuICogZXhwZWN0KGluamVjdG9yLmdldChOZWVkc1NlcnZpY2UpLnNlcnZpY2UgaW5zdGFuY2VvZiBVc2VmdWxTZXJ2aWNlKS50b0JlKHRydWUpO1xuICogYGBgXG4gKiB7QGxpbmsgSW5qZWN0b3J9IHdpbGwgdGhyb3cge0BsaW5rIE5vQW5ub3RhdGlvbkVycm9yfSB3aGVuIHRyeWluZyB0byBpbnN0YW50aWF0ZSBhIGNsYXNzIHRoYXRcbiAqIGRvZXMgbm90IGhhdmUgYEBJbmplY3RhYmxlYCBtYXJrZXIsIGFzIHNob3duIGluIHRoZSBleGFtcGxlIGJlbG93LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIFVzZWZ1bFNlcnZpY2Uge31cbiAqXG4gKiBjbGFzcyBOZWVkc1NlcnZpY2Uge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VydmljZTpVc2VmdWxTZXJ2aWNlKSB7fVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW05lZWRzU2VydmljZSwgVXNlZnVsU2VydmljZV0pO1xuICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldChOZWVkc1NlcnZpY2UpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEluamVjdGFibGVNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbn1cblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCBhbiB7QGxpbmsgSW5qZWN0b3J9IHNob3VsZCByZXRyaWV2ZSBhIGRlcGVuZGVuY3kgb25seSBmcm9tIGl0c2VsZi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvTmVhZ0FnP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiB9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTmVlZHNEZXBlbmRlbmN5IHtcbiAqICAgZGVwZW5kZW5jeTtcbiAqICAgY29uc3RydWN0b3IoQFNlbGYoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgICB0aGlzLmRlcGVuZGVuY3kgPSBkZXBlbmRlbmN5O1xuICogICB9XG4gKiB9XG4gKlxuICogdmFyIGluaiA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0RlcGVuZGVuY3ksIE5lZWRzRGVwZW5kZW5jeV0pO1xuICogdmFyIG5kID0gaW5qLmdldChOZWVkc0RlcGVuZGVuY3kpO1xuICpcbiAqIGV4cGVjdChuZC5kZXBlbmRlbmN5IGluc3RhbmNlb2YgRGVwZW5kZW5jeSkudG9CZSh0cnVlKTtcbiAqXG4gKiB2YXIgaW5qID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRGVwZW5kZW5jeV0pO1xuICogdmFyIGNoaWxkID0gaW5qLnJlc29sdmVBbmRDcmVhdGVDaGlsZChbTmVlZHNEZXBlbmRlbmN5XSk7XG4gKiBleHBlY3QoKCkgPT4gY2hpbGQuZ2V0KE5lZWRzRGVwZW5kZW5jeSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgU2VsZk1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAU2VsZigpYDsgfVxufVxuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IHRoZSBkZXBlbmRlbmN5IHJlc29sdXRpb24gc2hvdWxkIHN0YXJ0IGZyb20gdGhlIHBhcmVudCBpbmplY3Rvci5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvV2NoZHpiP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiB9XG4gKlxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTmVlZHNEZXBlbmRlbmN5IHtcbiAqICAgZGVwZW5kZW5jeTtcbiAqICAgY29uc3RydWN0b3IoQFNraXBTZWxmKCkgZGVwZW5kZW5jeTpEZXBlbmRlbmN5KSB7XG4gKiAgICAgdGhpcy5kZXBlbmRlbmN5ID0gZGVwZW5kZW5jeTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBwYXJlbnQgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEZXBlbmRlbmN5XSk7XG4gKiB2YXIgY2hpbGQgPSBwYXJlbnQucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFtOZWVkc0RlcGVuZGVuY3ldKTtcbiAqIGV4cGVjdChjaGlsZC5nZXQoTmVlZHNEZXBlbmRlbmN5KS5kZXBlbmRlbmN5IGluc3RhbmNlb2YgRGVwZWRlbmN5KS50b0JlKHRydWUpO1xuICpcbiAqIHZhciBpbmogPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEZXBlbmRlbmN5LCBOZWVkc0RlcGVuZGVuY3ldKTtcbiAqIGV4cGVjdCgoKSA9PiBpbmouZ2V0KE5lZWRzRGVwZW5kZW5jeSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgU2tpcFNlbGZNZXRhZGF0YSB7XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFNraXBTZWxmKClgOyB9XG59XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYW4gaW5qZWN0b3Igc2hvdWxkIHJldHJpZXZlIGEgZGVwZW5kZW5jeSBmcm9tIGFueSBpbmplY3RvciB1bnRpbCByZWFjaGluZyB0aGVcbiAqIGNsb3Nlc3QgaG9zdC5cbiAqXG4gKiBJbiBBbmd1bGFyLCBhIGNvbXBvbmVudCBlbGVtZW50IGlzIGF1dG9tYXRpY2FsbHkgZGVjbGFyZWQgYXMgYSBob3N0IGZvciBhbGwgdGhlIGluamVjdG9ycyBpblxuICogaXRzIHZpZXcuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0dYNzlwVj9wPXByZXZpZXcpKVxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSBgQXBwYCBjb250YWlucyBgUGFyZW50Q21wYCwgd2hpY2ggY29udGFpbnMgYENoaWxkRGlyZWN0aXZlYC5cbiAqIFNvIGBQYXJlbnRDbXBgIGlzIHRoZSBob3N0IG9mIGBDaGlsZERpcmVjdGl2ZWAuXG4gKlxuICogYENoaWxkRGlyZWN0aXZlYCBkZXBlbmRzIG9uIHR3byBzZXJ2aWNlczogYEhvc3RTZXJ2aWNlYCBhbmQgYE90aGVyU2VydmljZWAuXG4gKiBgSG9zdFNlcnZpY2VgIGlzIGRlZmluZWQgYXQgYFBhcmVudENtcGAsIGFuZCBgT3RoZXJTZXJ2aWNlYCBpcyBkZWZpbmVkIGF0IGBBcHBgLlxuICpcbiAqYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgT3RoZXJTZXJ2aWNlIHt9XG4gKiBjbGFzcyBIb3N0U2VydmljZSB7fVxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWRpcmVjdGl2ZSdcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZERpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBIb3N0KCkgb3M6T3RoZXJTZXJ2aWNlLCBAT3B0aW9uYWwoKSBASG9zdCgpIGhzOkhvc3RTZXJ2aWNlKXtcbiAqICAgICBjb25zb2xlLmxvZyhcIm9zIGlzIG51bGxcIiwgb3MpO1xuICogICAgIGNvbnNvbGUubG9nKFwiaHMgaXMgTk9UIG51bGxcIiwgaHMpO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFyZW50LWNtcCcsXG4gKiAgIHByb3ZpZGVyczogW0hvc3RTZXJ2aWNlXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBEaXI6IDxjaGlsZC1kaXJlY3RpdmU+PC9jaGlsZC1kaXJlY3RpdmU+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcmVjdGl2ZV1cbiAqIH0pXG4gKiBjbGFzcyBQYXJlbnRDbXAge1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHByb3ZpZGVyczogW090aGVyU2VydmljZV0sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgUGFyZW50OiA8cGFyZW50LWNtcD48L3BhcmVudC1jbXA+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtQYXJlbnRDbXBdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSG9zdE1ldGFkYXRhIHtcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBASG9zdCgpYDsgfVxufVxuIl19