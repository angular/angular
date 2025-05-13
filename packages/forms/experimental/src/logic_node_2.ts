import {FieldContext, FormError, LogicFn, MetadataKey, ValidationResult} from '../public_api';
import {
  AbstractLogic,
  ArrayMergeLogic,
  BooleanOrLogic,
  MetadataMergeLogic,
  Predicate,
} from './logic_node';

abstract class AbstractLogicNodeBuilder {
  abstract addHiddenRule(logic: LogicFn<unknown, boolean>): void;
  abstract addDisabledRule(logic: LogicFn<unknown, boolean>): void;
  abstract addErrorRule(logic: LogicFn<unknown, ValidationResult>): void;
  abstract addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<unknown, T>): void;
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

  addHiddenRule(logic: LogicFn<unknown, boolean>): void {
    this.getCurrent().addHiddenRule(logic);
  }

  addDisabledRule(logic: LogicFn<unknown, boolean>): void {
    this.getCurrent().addDisabledRule(logic);
  }

  addErrorRule(logic: LogicFn<unknown, ValidationResult>): void {
    this.getCurrent().addErrorRule(logic);
  }

  addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<unknown, T>): void {
    this.getCurrent().addMetadataRule(key, logic);
  }

  getChild(key: PropertyKey): LogicNodeBuilder {
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

  override addHiddenRule(logic: LogicFn<unknown, boolean>): void {
    this.logic.hidden.push(logic);
  }

  override addDisabledRule(logic: LogicFn<unknown, boolean>): void {
    this.logic.disabled.push(logic);
  }

  override addErrorRule(logic: LogicFn<unknown, ValidationResult>): void {
    this.logic.errors.push(logic);
  }

  override addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<unknown, T>): void {
    this.logic.getMetadata(key).push(logic);
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
  readonly disabled: BooleanOrLogic;
  readonly errors: ArrayMergeLogic<FormError>;
  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();

  constructor(private predicates: ReadonlyArray<Predicate>) {
    this.hidden = new BooleanOrLogic(predicates);
    this.disabled = new BooleanOrLogic(predicates);
    this.errors = new ArrayMergeLogic<FormError>(predicates);
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(this.predicates, key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  readMetadata<T>(key: MetadataKey<T>, arg: FieldContext<unknown>): T {
    if (this.metadata.has(key as MetadataKey<unknown>)) {
      return this.metadata.get(key as MetadataKey<unknown>)!.compute(arg) as T;
    } else {
      return key.defaultValue;
    }
  }

  getMetadataKeys() {
    return this.metadata.keys();
  }

  mergeIn(other: Logic) {
    this.disabled.mergeIn(other.disabled);
    this.hidden.mergeIn(other.hidden);
    this.errors.mergeIn(other.errors);
    for (const key of other.getMetadataKeys()) {
      this.getMetadata(key).mergeIn(other.getMetadata(key));
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
