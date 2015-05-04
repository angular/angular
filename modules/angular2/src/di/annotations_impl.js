import {CONST} from "angular2/src/facade/lang";

/**
 * A parameter annotation that specifies a dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@Inject(MyService) aService:MyService) {}
 * }
 * ```
 *
 * @exportedAs angular2/di_annotations
 */
export class Inject {
  token;
  @CONST()
  constructor(token) {
    this.token = token;
  }
}

/**
 * A parameter annotation that specifies a `Promise` of a dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@InjectPromise(MyService) aServicePromise:Promise<MyService>) {
 *     aServicePromise.then(aService:MyService => ...);
 *   }
 * }
 * ```
 *
 * @exportedAs angular2/di_annotations
 */
export class InjectPromise {
  token;
  @CONST()
  constructor(token) {
    this.token = token;
  }
}

/**
 * A parameter annotation that creates a synchronous lazy dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@InjectLazy(MyService) aServiceFn:Function) {
 *     var aService:MyService = aServiceFn();
 *   }
 * }
 * ```
 *
 * @exportedAs angular2/di_annotations
 */
export class InjectLazy {
  token;
  @CONST()
  constructor(token) {
    this.token = token;
  }
}

/**
 * A parameter annotation that marks a dependency as optional. {@link Injector} provides `null` if the dependency is not
 * found.
 *
 * ```
 * class AComponent {
 *   constructor(@Optional() aService:MyService) {
 *     this.aService = aService;
 *   }
 * }
 * ```
 *
 * @exportedAs angular2/di_annotations
 */
export class Optional {
  @CONST()
  constructor() {
  }
}

/**
 * `DependencyAnnotation` is used by the framework to extend DI.
 *
 * Only annotations implementing `DependencyAnnotation` are added to the list of dependency properties.
 *
 * For example:
 *
 * ```
 * class Parent extends DependencyAnnotation {}
 * class NotDependencyProperty {}
 *
 * class AComponent {
 *   constructor(@Parent @NotDependencyProperty aService:AService) {}
 * }
 * ```
 *
 * will create the following dependency:
 *
 * ```
 * new Dependency(Key.get(AService), [new Parent()])
 * ```
 *
 * The framework can use `new Parent()` to handle the `aService` dependency
 * in a specific way.
 *
 * @exportedAs angular2/di_annotations
 */
export class DependencyAnnotation {
  @CONST()
  constructor() {
  }

  get token() {
    return null;
  }
}

/**
 * A marker annotation that marks a class as available to `Injector` for creation. Used by tooling for
 * generating constructor stubs.
 *
 * ```
 * class NeedsService {
 *   constructor(svc:UsefulService) {}
 * }
 *
 * @Injectable
 * class UsefulService {}
 * ```
 * @exportedAs angular2/di_annotations
 */
export class Injectable {
  @CONST()
  constructor() {
  }
}
