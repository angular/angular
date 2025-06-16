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

abstract class AbstractLogicNodeBuilder {
  abstract addHiddenRule(logic: LogicFn<any, boolean>): void;
  abstract addDisabledReasonRule(logic: LogicFn<any, DisabledReason | undefined>): void;
  abstract addReadonlyRule(logic: LogicFn<any, boolean>): void;
  abstract addSyncErrorRule(logic: LogicFn<any, ValidationResult>): void;
  abstract addSyncTreeErrorRule(logic: LogicFn<any, FormTreeError[]>): void;
  abstract addAsyncErrorRule(logic: LogicFn<any, AsyncValidationResult>): void;
  abstract addMetadataRule<M>(key: MetadataKey<M>, logic: LogicFn<any, M>): void;
  abstract addDataFactory<D>(key: DataKey<D>, factory: (ctx: FieldContext<any>) => D): void;
  abstract getChild(key: PropertyKey): LogicNodeBuilder;

  build(): LogicNode {
    return new LeafLogicNode(this, []);
  }
}

/**
 * A builder for `LogicNode`. Used to add logic to the final `LogicNode` tree.
 */
export class LogicNodeBuilder extends AbstractLogicNodeBuilder {
  private current: NonMergableLogicNodeBuilder | undefined;
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

  private getCurrent(): NonMergableLogicNodeBuilder {
    // All rules added to this builder get added on to the current builder. If there is no current
    // builder, a new one is created. In order to preserve the original ordering of the rules, we
    // clear the current builder whenever a separate builder tree is merged in.
    if (this.current === undefined) {
      this.current = new NonMergableLogicNodeBuilder();
      this.all.push({builder: this.current});
    }
    return this.current;
  }

  static newRoot(): LogicNodeBuilder {
    return new LogicNodeBuilder();
  }
}

/**
 * A type of `AbstractLogicNodeBuilder` used internally by the `LogicNodeBuilder` to record "pure"
 * chunks of logic that do not require merging in other builders.
 */
class NonMergableLogicNodeBuilder extends AbstractLogicNodeBuilder {
  readonly logic = new Logic([]);
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
}

/**
 * Container for all the different types of logic that can be applied to a field
 * (disabled, hidden, errors, etc.)
 */
export class Logic {
  readonly hidden: BooleanOrLogic;
  readonly disabledReasons: ArrayMergeLogic<DisabledReason>;
  readonly readonly: BooleanOrLogic;
  readonly syncErrors: ArrayMergeLogic<FormError>;
  readonly syncTreeErrors: ArrayMergeLogic<FormTreeError>;
  readonly asyncErrors: ArrayMergeLogic<FormTreeError | 'pending'>;
  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();
  private readonly dataFactories = new Map<
    DataKey<unknown>,
    (ctx: FieldContext<unknown>) => unknown
  >();

  constructor(private predicates: ReadonlyArray<Predicate>) {
    this.hidden = new BooleanOrLogic(predicates);
    this.disabledReasons = new ArrayMergeLogic(this.predicates);
    this.readonly = new BooleanOrLogic(this.predicates);
    this.syncErrors = new ArrayMergeLogic<FormError>(predicates);
    this.syncTreeErrors = new ArrayMergeLogic<FormTreeError>(predicates);
    this.asyncErrors = new ArrayMergeLogic<FormTreeError | 'pending'>(predicates);
  }

  getMetadataEntries() {
    return this.metadata.entries();
  }

  getDataFactoryEntries() {
    return this.dataFactories.entries();
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(this.predicates, key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  addDataFactory(key: DataKey<unknown>, factory: (ctx: FieldContext<unknown>) => unknown) {
    if (this.dataFactories.has(key)) {
      // TODO: name of the key?
      throw new Error(`Can't define data twice for the same key`);
    }
    this.dataFactories.set(key, factory);
  }

  mergeIn(other: Logic) {
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

export interface LogicNode {
  readonly logic: Logic;
  getChild(key: PropertyKey): LogicNode;
}

/**
 * A tree structure of `Logic` corresponding to a tree of fields.
 */
class LeafLogicNode implements LogicNode {
  readonly logic: Logic;

  constructor(
    private builder: AbstractLogicNodeBuilder | undefined,
    private predicates: Predicate[],
  ) {
    this.logic = builder ? createLogic(builder, predicates) : new Logic([]);
  }

  // TODO: cache here, or just rely on the user of this API to do caching?
  getChild(key: PropertyKey): LogicNode {
    // The logic for a particular child may be spread across multiple builders. We lazily combine
    // this logic at the time the child logic node is requested to be created.
    const childBuilders = this.builder ? getAllChildBuilders(this.builder, key) : [];
    if (childBuilders.length <= 1) {
      const {builder, predicates} = childBuilders[0];
      return new LeafLogicNode(builder, [...this.predicates, ...predicates]);
    } else {
      const builtNodes = childBuilders.map(
        ({builder, predicates}) => new LeafLogicNode(builder, [...this.predicates, ...predicates]),
      );
      return new CompositeLogicNode(builtNodes);
    }
  }
}

class CompositeLogicNode implements LogicNode {
  readonly logic: Logic;

  constructor(private all: LogicNode[]) {
    this.logic = new Logic([]);
    for (const node of all) {
      this.logic.mergeIn(node.logic);
    }
  }

  getChild(key: PropertyKey): LogicNode {
    return new CompositeLogicNode(this.all.flatMap((child) => child.getChild(key)));
  }
}

/**
 * Gets all of the builders that contribute logic to the given child of the parent builder.
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
 */
function createLogic(builder: AbstractLogicNodeBuilder, predicates: Predicate[]): Logic {
  const logic = new Logic(predicates);
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
