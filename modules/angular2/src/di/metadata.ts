import {CONST, CONST_EXPR, stringify, isBlank, isPresent} from "angular2/src/facade/lang";

/**
 * A parameter metadata that specifies a dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@Inject(MyService) aService:MyService) {}
 * }
 * ```
 */

@CONST()
export class InjectMetadata {
  constructor(public token) {}
  toString(): string { return `@Inject(${stringify(this.token)})`; }
}

/**
 * A parameter metadata that marks a dependency as optional. {@link Injector} provides `null` if
 * the dependency is not found.
 *
 * ```
 * class AComponent {
 *   constructor(@Optional() aService:MyService) {
 *     this.aService = aService;
 *   }
 * }
 * ```
 */
@CONST()
export class OptionalMetadata {
  toString(): string { return `@Optional()`; }
}

/**
 * `DependencyMetadata is used by the framework to extend DI.
 *
 * Only metadata implementing `DependencyMetadata` are added to the list of dependency
 * properties.
 *
 * For example:
 *
 * ```
 * class Exclude extends DependencyMetadata {}
 * class NotDependencyProperty {}
 *
 * class AComponent {
 *   constructor(@Exclude @NotDependencyProperty aService:AService) {}
 * }
 * ```
 *
 * will create the following dependency:
 *
 * ```
 * new Dependency(Key.get(AService), [new Exclude()])
 * ```
 *
 * The framework can use `new Exclude()` to handle the `aService` dependency
 * in a specific way.
 */
@CONST()
export class DependencyMetadata {
  get token() { return null; }
}

/**
 * A marker metadata that marks a class as available to `Injector` for creation. Used by tooling
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
 */
@CONST()
export class InjectableMetadata {
  constructor() {}
}

/**
 * Specifies how injector should resolve a dependency.
 *
 * See {@link Self}, {@link Ancestor}, {@link Unbounded}.
 */
@CONST()
export class VisibilityMetadata {
  constructor(public crossBoundaries: boolean, public _includeSelf: boolean) {}

  get includeSelf(): boolean { return isBlank(this._includeSelf) ? false : this._includeSelf; }

  toString(): string {
    return `@Visibility(crossBoundaries: ${this.crossBoundaries}, includeSelf: ${this.includeSelf}})`;
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
 */
@CONST()
export class SelfMetadata extends VisibilityMetadata {
  constructor() { super(false, true); }
  toString(): string { return `@Self()`; }
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
 */
@CONST()
export class AncestorMetadata extends VisibilityMetadata {
  constructor({self}: {self?: boolean} = {}) { super(false, self); }
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
 */
@CONST()
export class UnboundedMetadata extends VisibilityMetadata {
  constructor({self}: {self?: boolean} = {}) { super(true, self); }
  toString(): string { return `@Unbounded(self: ${this.includeSelf}})`; }
}

export const DEFAULT_VISIBILITY = CONST_EXPR(new UnboundedMetadata({self: true}));