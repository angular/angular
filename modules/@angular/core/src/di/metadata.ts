/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../facade/lang';
import {makeParamDecorator} from '../util/decorators';

/**
 * Type of the Inject decorator / constructor function.
 *
 * @stable
 */
export interface InjectDecorator {
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
   *  {provide: "MyEngine", useClass: Engine},
   *  Car
   * ]);
   *
   * expect(injector.get(Car).engine instanceof Engine).toBe(true);
   * ```
   *
   * When `@Inject()` is not present, {@link Injector} will use the type annotation of the
   * parameter.
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
   * @stable
   */
  (token: any): any;
  new (token: any): Inject;
}

/**
 * Type of the Inject metadata.
 *
 * @stable
 */
export interface Inject { token: any; }

/**
 * Inject decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Inject: InjectDecorator = makeParamDecorator('Inject', [['token', undefined]]);


/**
 * Type of the Optional decorator / constructor function.
 *
 * @stable
 */
export interface OptionalDecorator {
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
   * @stable
   */
  (): any;
  new (): Optional;
}

/**
 * Type of the Optional metadata.
 *
 * @stable
 */
export interface Optional {}

/**
 * Optional decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Optional: OptionalDecorator = makeParamDecorator('Optional', []);

/**
 * Type of the Injectable decorator / constructor function.
 *
 * @stable
 */
export interface InjectableDecorator {
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
   * @stable
   */
  (): any;
  new (): Injectable;
}

/**
 * Type of the Injectable metadata.
 *
 * @stable
 */
export interface Injectable {}

/**
 * Injectable decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Injectable: InjectableDecorator = makeParamDecorator('Injectable', []);

/**
 * Type of the Self decorator / constructor function.
 *
 * @stable
 */
export interface SelfDecorator {
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
   * @stable
   */
  (): any;
  new (): Self;
}

/**
 * Type of the Self metadata.
 *
 * @stable
 */
export interface Self {}

/**
 * Self decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Self: SelfDecorator = makeParamDecorator('Self', []);


/**
 * Type of the SkipSelf decorator / constructor function.
 *
 * @stable
 */
export interface SkipSelfDecorator {
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
   * @stable
   */
  (): any;
  new (): SkipSelf;
}

/**
 * Type of the SkipSelf metadata.
 *
 * @stable
 */
export interface SkipSelf {}

/**
 * SkipSelf decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const SkipSelf: SkipSelfDecorator = makeParamDecorator('SkipSelf', []);

/**
 * Type of the Host decorator / constructor function.
 *
 * @stable
 */
export interface HostDecorator {
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
   *```
   * @stable
   */
  (): any;
  new (): Host;
}

/**
 * Type of the Host metadata.
 *
 * @stable
 */
export interface Host {}

/**
 * Host decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Host: HostDecorator = makeParamDecorator('Host', []);
