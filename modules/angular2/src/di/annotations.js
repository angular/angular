import {CONST} from "angular2/src/facade/lang";

/**
 * A parameter annotation that creates a synchronous eager dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@Inject('aServiceToken') aService) {}
 * }
 * ```
 *
 */
export class Inject {
  token;
  @CONST()
  constructor(token) {
    this.token = token;
  }
}

/**
 * A parameter annotation that creates an asynchronous eager dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@InjectPromise('aServiceToken') aServicePromise) {
 *     aServicePromise.then(aService => ...);
 *   }
 * }
 * ```
 *
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
 *   constructor(@InjectLazy('aServiceToken') aServiceFn) {
 *     aService = aServiceFn();
 *   }
 * }
 * ```
 *
 */
export class InjectLazy {
  token;
  @CONST()
  constructor(token) {
    this.token = token;
  }
}

/**
 * A parameter annotation that marks a dependency as optional.
 *
 * ```
 * class AComponent {
 *   constructor(@Optional() dp:Dependency) {
 *     this.dp = dp;
 *   }
 * }
 * ```
 *
 */
export class Optional {
  @CONST()
  constructor() {
  }
}

/**
 * `DependencyAnnotation` is used by the framework to extend DI.
 *
 * Only annotations implementing `DependencyAnnotation` will be added
 * to the list of dependency properties.
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
 * A class annotation that marks a class as available to `Injector`s for
 * creation.
 *
 * ```
 * class NeedsService {
 *   constructor(svc:UsefulService) {}
 * }
 *
 * @Injectable
 * class UsefulService {}
 * ```
 */
export class Injectable {
  @CONST()
  constructor() {
  }
}
