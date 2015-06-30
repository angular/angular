import {CONST, CONST_EXPR, stringify, isBlank, isPresent} from "angular2/src/facade/lang";

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

@CONST()
export class Inject {
  constructor(public token) {}
  toString(): string { return `@Inject(${stringify(this.token)})`; }
}

/**
 * A parameter annotation that marks a dependency as optional. {@link Injector} provides `null` if
 * the dependency is not found.
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
@CONST()
export class Optional {
  toString(): string { return `@Optional()`; }
}

/**
 * `DependencyAnnotation` is used by the framework to extend DI.
 *
 * Only annotations implementing `DependencyAnnotation` are added to the list of dependency
 * properties.
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
@CONST()
export class DependencyAnnotation {
  get token() { return null; }
}

/**
 * A marker annotation that marks a class as available to `Injector` for creation. Used by tooling
 * for generating constructor stubs.
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
@CONST()
export class Injectable {
  constructor(public visibility: Visibility = unbounded) {}
}

/**
 * Specifies how injector should resolve a dependency.
 *
 * See {@link Self}, {@link Parent}, {@link Ancestor}, {@link Unbounded}.
 *
 * @exportedAs angular2/di_annotations
 */
@CONST()
export class Visibility extends DependencyAnnotation {
  constructor(public depth: number, public crossComponentBoundaries: boolean,
              public _includeSelf: boolean) {
    super();
  }

  get includeSelf(): boolean { return isBlank(this._includeSelf) ? false : this._includeSelf; }

  toString(): string {
    return `@Visibility(depth: ${this.depth}, crossComponentBoundaries: ${this.crossComponentBoundaries}, includeSelf: ${this.includeSelf}})`;
  }
}

/**
 * Specifies that an injector should retrieve a dependency from itself.
 *
 * ## Example
 *
 * ```
 * class Dependency {
 * }
 *
 * class NeedsDependency {
 *   constructor(public @Self() dependency:Dependency) {}
 * }
 *
 * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
 * var nd = inj.get(NeedsDependency);
 * expect(nd.dependency).toBeAnInstanceOf(Dependency);
 * ```
 *
 * @exportedAs angular2/di
 */
@CONST()
export class Self extends Visibility {
  constructor() { super(0, false, true); }
  toString(): string { return `@Self()`; }
}

export const self = CONST_EXPR(new Self());

/**
 * Specifies that an injector should retrieve a dependency from the direct parent.
 *
 * ## Example
 *
 * ```
 * class Dependency {
 * }
 *
 * class NeedsDependency {
 *   constructor(public @Parent() dependency:Dependency) {}
 * }
 *
 * var parent = Injector.resolveAndCreate([
 *   bind(Dependency).toClass(ParentDependency)
 * ]);
 * var child = parent.resolveAndCreateChild([NeedsDependency, Depedency]);
 * var nd = child.get(NeedsDependency);
 * expect(nd.dependency).toBeAnInstanceOf(ParentDependency);
 * ```
 *
 * You can make an injector to retrive a dependency either from itself or its direct parent by
 * setting self to true.
 *
 * ```
 * class NeedsDependency {
 *   constructor(public @Parent({self:true}) dependency:Dependency) {}
 * }
 * ```
 *
 * @exportedAs angular2/di
 */
@CONST()
export class Parent extends Visibility {
  constructor({self}: {self?: boolean} = {}) { super(1, false, self); }
  toString(): string { return `@Parent(self: ${this.includeSelf}})`; }
}

/**
 * Specifies that an injector should retrieve a dependency from any ancestor from the same boundary.
 *
 * ## Example
 *
 * ```
 * class Dependency {
 * }
 *
 * class NeedsDependency {
 *   constructor(public @Ancestor() dependency:Dependency) {}
 * }
 *
 * var parent = Injector.resolveAndCreate([
 *   bind(Dependency).toClass(AncestorDependency)
 * ]);
 * var child = parent.resolveAndCreateChild([]);
 * var grandChild = child.resolveAndCreateChild([NeedsDependency, Depedency]);
 * var nd = grandChild.get(NeedsDependency);
 * expect(nd.dependency).toBeAnInstanceOf(AncestorDependency);
 * ```
 *
 * You can make an injector to retrive a dependency either from itself or its ancestor by setting
 * self to true.
 *
 * ```
 * class NeedsDependency {
 *   constructor(public @Ancestor({self:true}) dependency:Dependency) {}
 * }
 * ```
 *
 * @exportedAs angular2/di
 */
@CONST()
export class Ancestor extends Visibility {
  constructor({self}: {self?: boolean} = {}) { super(999999, false, self); }
  toString(): string { return `@Ancestor(self: ${this.includeSelf}})`; }
}

/**
 * Specifies that an injector should retrieve a dependency from any ancestor, crossing boundaries.
 *
 * ## Example
 *
 * ```
 * class Dependency {
 * }
 *
 * class NeedsDependency {
 *   constructor(public @Ancestor() dependency:Dependency) {}
 * }
 *
 * var parent = Injector.resolveAndCreate([
 *   bind(Dependency).toClass(AncestorDependency)
 * ]);
 * var child = parent.resolveAndCreateChild([]);
 * var grandChild = child.resolveAndCreateChild([NeedsDependency, Depedency]);
 * var nd = grandChild.get(NeedsDependency);
 * expect(nd.dependency).toBeAnInstanceOf(AncestorDependency);
 * ```
 *
 * You can make an injector to retrive a dependency either from itself or its ancestor by setting
 * self to true.
 *
 * ```
 * class NeedsDependency {
 *   constructor(public @Ancestor({self:true}) dependency:Dependency) {}
 * }
 * ```
 *
 * @exportedAs angular2/di
 */
@CONST()
export class Unbounded extends Visibility {
  constructor({self}: {self?: boolean} = {}) { super(999999, true, self); }
  toString(): string { return `@Unbounded(self: ${this.includeSelf}})`; }
}

export const unbounded = CONST_EXPR(new Unbounded({self: true}));