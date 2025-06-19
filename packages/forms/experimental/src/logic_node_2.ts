import {
  AsyncValidationResult,
  DataKey,
  DisabledReason,
  FieldContext,
  FormError,
  FormTreeError,
  LogicFn,
  MetadataKey,
  ValidationResult,
} from '../public_api';
import {
  AbstractLogic,
  ArrayMergeLogic,
  BooleanOrLogic,
  MetadataMergeLogic,
  Predicate,
} from './logic_node';

/**
 * Abstract base class for building a `LogicNode`.
 * This class defines the interface for adding various logic rules (e.g., hidden, disabled)
 * and data factories to a node in the logic tree.
 * LogicNodeBuilders are 1:1 with nodes in the Schema tree.
 */
export abstract class AbstractLogicNodeBuilder {
  /** Adds a rule to determine if a field should be hidden. */
  abstract addHiddenRule(logic: LogicFn<any, boolean>): void;
  /** Adds a rule to determine if a field should be disabled, and for what reason. */
  abstract addDisabledReasonRule(logic: LogicFn<any, DisabledReason | undefined>): void;
  /** Adds a rule to determine if a field should be read-only. */
  abstract addReadonlyRule(logic: LogicFn<any, boolean>): void;
  /** Adds a rule for synchronous validation errors for a field. */
  abstract addSyncErrorRule(logic: LogicFn<any, ValidationResult>): void;
  /** Adds a rule for synchronous validation errors that apply to a subtree. */
  abstract addSyncTreeErrorRule(logic: LogicFn<any, FormTreeError[]>): void;
  /** Adds a rule for asynchronous validation errors for a field. */
  abstract addAsyncErrorRule(logic: LogicFn<any, AsyncValidationResult>): void;
  /** Adds a rule to compute metadata for a field. */
  abstract addMetadataRule<M>(key: MetadataKey<M>, logic: LogicFn<any, M>): void;
  /** Adds a factory function to produce a data value associated with a field. */
  abstract addDataFactory<D>(key: DataKey<D>, factory: (ctx: FieldContext<any>) => D): void;
  /**
   * Gets a builder for a child node associated with the given property key.
   * @param key The property key of the child.
   * @returns A `LogicNodeBuilder` for the child.
   */
  abstract getChild(key: PropertyKey): LogicNodeBuilder;

  /**
   * Checks whether a particular `AbstractLogicNodeBuilder` has been merged into this one.
   * @param builder The builder to check for.
   * @returns True if the builder has been merged, false otherwise.
   */
  abstract hasLogic(builder: AbstractLogicNodeBuilder): boolean;

  /**
   * Builds the `LogicNode` from the accumulated rules and child builders.
   * @returns The constructed `LogicNode`.
   */
  build(): LogicNode {
    return new LeafLogicNode(this, []);
  }
}

/**
 * A builder for `LogicNode`. Used to add logic to the final `LogicNode` tree.
 * This builder supports merging multiple sources of logic, potentially with predicates,
 * preserving the order of rule application.
 */
export class LogicNodeBuilder extends AbstractLogicNodeBuilder {
  /**
   * The current `NonMergableLogicNodeBuilder` being used to add rules directly to this
   * `LogicNodeBuilder`. Do not use this directly, call `getCurrent()` which will create a current
   * builder if there is none.
   */
  private current: NonMergableLogicNodeBuilder | undefined;
  /**
   * Stores all builders that contribute to this node, along with any predicates
   * that gate their application.
   */
  readonly all: {builder: AbstractLogicNodeBuilder; predicate?: Predicate}[] = [];

  override addHiddenRule(logic: LogicFn<any, boolean>): void {
    this.getCurrent().addHiddenRule(logic);
  }

  override addDisabledReasonRule(logic: LogicFn<any, DisabledReason | undefined>): void {
    this.getCurrent().addDisabledReasonRule(logic);
  }

  override addReadonlyRule(logic: LogicFn<any, boolean>): void {
    this.getCurrent().addReadonlyRule(logic);
  }

  override addSyncErrorRule(logic: LogicFn<any, ValidationResult>): void {
    this.getCurrent().addSyncErrorRule(logic);
  }

  override addSyncTreeErrorRule(logic: LogicFn<any, FormTreeError[]>): void {
    this.getCurrent().addSyncTreeErrorRule(logic);
  }

  override addAsyncErrorRule(logic: LogicFn<any, AsyncValidationResult>): void {
    this.getCurrent().addAsyncErrorRule(logic);
  }

  override addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<any, T>): void {
    this.getCurrent().addMetadataRule(key, logic);
  }

  override addDataFactory<D>(key: DataKey<D>, factory: (ctx: FieldContext<any>) => D): void {
    this.getCurrent().addDataFactory(key, factory);
  }

  override getChild(key: PropertyKey): LogicNodeBuilder {
    return this.getCurrent().getChild(key);
  }

  override hasLogic(builder: AbstractLogicNodeBuilder): boolean {
    if (this === builder) {
      return true;
    }
    return this.all.some(({builder: subBuilder}) => subBuilder.hasLogic(builder));
  }

  /**
   * Merges logic from another `LogicNodeBuilder` into this one.
   * If a `predicate` is provided, all logic from the `other` builder will only apply
   * when the predicate evaluates to true.
   * @param other The `LogicNodeBuilder` to merge in.
   * @param predicate An optional predicate to gate the merged logic.
   */
  mergeIn(other: LogicNodeBuilder, predicate?: Predicate): void {
    // Add the other builder to our collection, we'll defer the actual merging of the logic until
    // the logic node is requested to be created. In order to preserve the original ordering of the
    // rules, we close off the current builder to any further edits. If additional logic is added,
    // a new current builder will be created to capture it.
    if (predicate) {
      this.all.push({builder: other, predicate});
    } else {
      this.all.push({builder: other});
    }
    this.current = undefined;
  }

  /**
   * Gets the current `NonMergableLogicNodeBuilder` for adding rules directly to this
   * `LogicNodeBuilder`. If no current builder exists, a new one is created.
   * The current builder is cleared whenever `mergeIn` is called to preserve the order
   * of rules when merging separate builder trees.
   * @returns The current `NonMergableLogicNodeBuilder`.
   */
  private getCurrent(): NonMergableLogicNodeBuilder {
    if (this.current === undefined) {
      this.current = new NonMergableLogicNodeBuilder();
      this.all.push({builder: this.current});
    }
    return this.current;
  }

  /**
   * Creates a new root `LogicNodeBuilder`.
   * @returns A new instance of `LogicNodeBuilder`.
   */
  static newRoot(): LogicNodeBuilder {
    return new LogicNodeBuilder();
  }
}

/**
 * A type of `AbstractLogicNodeBuilder` used internally by the `LogicNodeBuilder` to record "pure"
 * chunks of logic that do not require merging in other builders.
 */
class NonMergableLogicNodeBuilder extends AbstractLogicNodeBuilder {
  /** The collection of logic rules directly added to this builder. */
  readonly logic = new LogicContainer([]);
  /**
   * A map of child property keys to their corresponding `LogicNodeBuilder` instances.
   * This allows for building a tree of logic.
   */
  readonly children = new Map<PropertyKey, LogicNodeBuilder>();

  override addHiddenRule(logic: LogicFn<any, boolean>): void {
    this.logic.hidden.push(logic);
  }

  override addDisabledReasonRule(logic: LogicFn<any, DisabledReason | undefined>): void {
    this.logic.disabledReasons.push(logic);
  }

  override addReadonlyRule(logic: LogicFn<any, boolean>): void {
    this.logic.readonly.push(logic);
  }

  override addSyncErrorRule(logic: LogicFn<any, ValidationResult>): void {
    this.logic.syncErrors.push(logic);
  }

  override addSyncTreeErrorRule(logic: LogicFn<any, FormTreeError[]>): void {
    this.logic.syncTreeErrors.push(logic);
  }

  override addAsyncErrorRule(logic: LogicFn<any, AsyncValidationResult>): void {
    this.logic.asyncErrors.push(logic);
  }

  override addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<any, T>): void {
    this.logic.getMetadata(key).push(logic);
  }

  override addDataFactory<D>(key: DataKey<D>, factory: (ctx: FieldContext<any>) => D): void {
    this.logic.addDataFactory(key, factory);
  }

  override getChild(key: PropertyKey): LogicNodeBuilder {
    if (!this.children.has(key)) {
      this.children.set(key, new LogicNodeBuilder());
    }
    return this.children.get(key)!;
  }

  override hasLogic(builder: AbstractLogicNodeBuilder): boolean {
    return this === builder;
  }
}

/**
 * Container for all the different types of logic that can be applied to a field
 * (disabled, hidden, errors, etc.)
 */
export class LogicContainer {
  /** Logic that determines if the field is hidden. */
  readonly hidden: BooleanOrLogic;
  /** Logic that determines reasons for the field being disabled. */
  readonly disabledReasons: ArrayMergeLogic<DisabledReason>;
  /** Logic that determines if the field is read-only. */
  readonly readonly: BooleanOrLogic;
  /** Logic that produces synchronous validation errors for the field. */
  readonly syncErrors: ArrayMergeLogic<FormError>;
  /** Logic that produces synchronous validation errors for the field's subtree. */
  readonly syncTreeErrors: ArrayMergeLogic<FormTreeError>;
  /** Logic that produces asynchronous validation results (errors or 'pending'). */
  readonly asyncErrors: ArrayMergeLogic<FormTreeError | 'pending'>;
  /** A map of metadata keys to the `AbstractLogic` instances that compute their values. */
  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();
  /** A map of data keys to the factory functions that create their values. */
  private readonly dataFactories = new Map<
    DataKey<unknown>,
    (ctx: FieldContext<unknown>) => unknown
  >();

  /**
   * Constructs a new `Logic` container.
   * @param predicates An array of predicates that must all be true for the logic
   *   functions within this container to be active.
   */
  constructor(private predicates: ReadonlyArray<Predicate>) {
    this.hidden = new BooleanOrLogic(predicates);
    this.disabledReasons = new ArrayMergeLogic(predicates);
    this.readonly = new BooleanOrLogic(predicates);
    this.syncErrors = new ArrayMergeLogic<FormError>(predicates);
    this.syncTreeErrors = new ArrayMergeLogic<FormTreeError>(predicates);
    this.asyncErrors = new ArrayMergeLogic<FormTreeError | 'pending'>(predicates);
  }

  /**
   * Gets an iterable of [metadata key, metadata logic] pairs.
   * @returns An iterable of metadata entries.
   */
  getMetadataEntries() {
    return this.metadata.entries();
  }

  /**
   * Gets an iterable of [data key, data factory function] pairs.
   * @returns An iterable of data factory entries.
   */
  getDataFactoryEntries() {
    return this.dataFactories.entries();
  }

  hasData() {
    return this.dataFactories.size > 0;
  }
  /**
   * Retrieves or creates the `AbstractLogic` for a given metadata key.
   * @param key The `MetadataKey` for which to get the logic.
   * @returns The `AbstractLogic` associated with the key.
   */
  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(this.predicates, key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  /**
   * Adds a data factory function for a given data key.
   * @param key The `DataKey` to associate the factory with.
   * @param factory The factory function.
   * @throws If a factory is already defined for the given key.
   */
  addDataFactory(key: DataKey<unknown>, factory: (ctx: FieldContext<unknown>) => unknown) {
    if (this.dataFactories.has(key)) {
      // TODO: name of the key?
      throw new Error(`Can't define data twice for the same key`);
    }
    this.dataFactories.set(key, factory);
  }

  /**
   * Merges logic from another `Logic` instance into this one.
   * @param other The `Logic` instance to merge from.
   */
  mergeIn(other: LogicContainer) {
    this.hidden.mergeIn(other.hidden);
    this.disabledReasons.mergeIn(other.disabledReasons);
    this.readonly.mergeIn(other.readonly);
    this.syncErrors.mergeIn(other.syncErrors);
    this.syncTreeErrors.mergeIn(other.syncTreeErrors);
    this.asyncErrors.mergeIn(other.asyncErrors);
    for (const [key, metadataLogic] of other.getMetadataEntries()) {
      this.getMetadata(key).mergeIn(metadataLogic);
    }
    for (const [key, dataFactory] of other.getDataFactoryEntries()) {
      this.addDataFactory(key, dataFactory);
    }
  }
}

/**
 * Represents a node in the logic tree, containing all logic applicable
 * to a specific field or path in the form structure.
 * LogicNodes are 1:1 with nodes in the Field tree.
 */
export interface LogicNode {
  /** The collection of logic rules (hidden, disabled, errors, etc.) for this node. */
  readonly logic: LogicContainer;
  /**
   * Retrieves the `LogicNode` for a child identified by the given property key.
   * @param key The property key of the child.
   * @returns The `LogicNode` for the specified child.
   */
  getChild(key: PropertyKey): LogicNode;

  /**
   * Checks whether the logic from a particular `AbstractLogicNodeBuilder` has been merged into this
   * node.
   * @param builder The builder to check for.
   * @returns True if the builder has been merged, false otherwise.
   */
  hasLogic(builder: AbstractLogicNodeBuilder): boolean;
}

/**
 * A tree structure of `Logic` corresponding to a tree of fields.
 * This implementation represents a leaf in the sense that its logic is derived
 * from a single builder.
 */
class LeafLogicNode implements LogicNode {
  /** The computed logic for this node. */
  readonly logic: LogicContainer;

  /**
   * Constructs a `LeafLogicNode`.
   * @param builder The `AbstractLogicNodeBuilder` from which to derive the logic.
   *   If undefined, an empty `Logic` instance is created.
   * @param predicates An array of predicates that gate the logic from the builder.
   */
  constructor(
    private builder: AbstractLogicNodeBuilder | undefined,
    private predicates: Predicate[],
  ) {
    this.logic = builder ? createLogic(builder, predicates) : new LogicContainer([]);
  }

  // TODO: cache here, or just rely on the user of this API to do caching?
  /**
   * Retrieves the `LogicNode` for a child identified by the given property key.
   * @param key The property key of the child.
   * @returns The `LogicNode` for the specified child.
   */
  getChild(key: PropertyKey): LogicNode {
    // The logic for a particular child may be spread across multiple builders. We lazily combine
    // this logic at the time the child logic node is requested to be created.
    const childBuilders = this.builder ? getAllChildBuilders(this.builder, key) : [];
    if (childBuilders.length === 0) {
      return new LeafLogicNode(undefined, []);
    } else if (childBuilders.length === 1) {
      const {builder, predicates} = childBuilders[0];
      return new LeafLogicNode(builder, [...this.predicates, ...predicates]);
    } else {
      const builtNodes = childBuilders.map(
        ({builder, predicates}) => new LeafLogicNode(builder, [...this.predicates, ...predicates]),
      );
      return new CompositeLogicNode(builtNodes);
    }
  }

  /**
   * Checks whether the logic from a particular `AbstractLogicNodeBuilder` has been merged into this
   * node.
   * @param builder The builder to check for.
   * @returns True if the builder has been merged, false otherwise.
   */
  hasLogic(builder: AbstractLogicNodeBuilder): boolean {
    return this.builder?.hasLogic(builder) ?? false;
  }
}

/**
 * A `LogicNode` that represents the composition of multiple `LogicNode` instances.
 * This is used when logic for a particular path is contributed by several distinct
 * builder branches that need to be merged.
 */
class CompositeLogicNode implements LogicNode {
  /** The merged logic from all composed nodes. */
  readonly logic: LogicContainer;

  /**
   * Constructs a `CompositeLogicNode`.
   * @param all An array of `LogicNode` instances to compose.
   */
  constructor(private all: LogicNode[]) {
    this.logic = new LogicContainer([]);
    for (const node of all) {
      this.logic.mergeIn(node.logic);
    }
  }

  /**
   * Retrieves the child `LogicNode` by composing the results of `getChild` from all
   * underlying `LogicNode` instances.
   * @param key The property key of the child.
   * @returns A `CompositeLogicNode` representing the composed child.
   */
  getChild(key: PropertyKey): LogicNode {
    return new CompositeLogicNode(this.all.flatMap((child) => child.getChild(key)));
  }

  /**
   * Checks whether the logic from a particular `AbstractLogicNodeBuilder` has been merged into this
   * node.
   * @param builder The builder to check for.
   * @returns True if the builder has been merged, false otherwise.
   */
  hasLogic(builder: AbstractLogicNodeBuilder): boolean {
    return this.all.some((node) => node.hasLogic(builder));
  }
}

/**
 * Gets all of the builders that contribute logic to the given child of the parent builder.
 * This function recursively traverses the builder hierarchy.
 * @param builder The parent `AbstractLogicNodeBuilder`.
 * @param key The property key of the child.
 * @returns An array of objects, each containing a `LogicNodeBuilder` for the child and any associated predicates.
 */
function getAllChildBuilders(
  builder: AbstractLogicNodeBuilder,
  key: PropertyKey,
): {builder: LogicNodeBuilder; predicates: Predicate[]}[] {
  if (builder instanceof LogicNodeBuilder) {
    return builder.all.flatMap(({builder, predicate}) => {
      const children = getAllChildBuilders(builder, key);
      if (predicate) {
        return children.map(({builder, predicates}) => ({
          builder,
          predicates: [...predicates, predicate],
        }));
      }
      return children;
    });
  } else if (builder instanceof NonMergableLogicNodeBuilder) {
    if (builder.children.has(key)) {
      return [{builder: builder.children.get(key)!, predicates: []}];
    }
  } else {
    throw new Error('Unknown LogicNodeBuilder type');
  }
  return [];
}

/**
 * Creates the full `Logic` for a given builder.
 * This function handles different types of builders (`LogicNodeBuilder`, `NonMergableLogicNodeBuilder`)
 * and applies the provided predicates.
 * @param builder The `AbstractLogicNodeBuilder` to process.
 * @param predicates Predicates to apply to the logic derived from the builder.
 * @returns The `Logic` instance.
 */
function createLogic(builder: AbstractLogicNodeBuilder, predicates: Predicate[]): LogicContainer {
  const logic = new LogicContainer(predicates);
  if (builder instanceof LogicNodeBuilder) {
    // TODO: do we need to bind predicate to a specific field here?
    // Specifically I think we need to split the idea of a predicate in the LogicNodeBuilder from
    // the idea of a predicate in the LogicNode. Instead of a path, the LogicNode version should
    // have a field context.
    const builtNodes = builder.all.map(
      ({builder, predicate}) =>
        new LeafLogicNode(builder, predicate ? [...predicates, predicate] : predicates),
    );
    for (const node of builtNodes) {
      logic.mergeIn(node.logic);
    }
  } else if (builder instanceof NonMergableLogicNodeBuilder) {
    logic.mergeIn(builder.logic);
  } else {
    throw new Error('Unknown LogicNodeBuilder type');
  }
  return logic;
}
