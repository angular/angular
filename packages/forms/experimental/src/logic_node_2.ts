import {FieldContext, FormError, LogicFn, MetadataKey, ValidationResult} from '../public_api';
import {
  AbstractLogic,
  ArrayMergeLogic,
  BooleanOrLogic,
  MetadataMergeLogic,
  Predicate,
} from './logic_node';

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
}

/**
 * A tree structure of `Logic` corresponding to a tree of fields.
 */
export class LogicNode {
  readonly logic: Logic;

  constructor(private builder: LogicNodeBuilder | undefined) {
    this.logic = builder ? createLogic(builder) : new Logic([]);
  }

  getChild(key: PropertyKey): LogicNode {
    // The logic for a particular child may be spread across multiple builders. We lazily combine
    // this logic at the time the child logic node is requested to be created.
    const childBuilders = this.builder ? getAllChildren(this.builder, key) : [];
    if (childBuilders.length <= 1) {
      return new LogicNode(childBuilders[0]);
    } else {
      // If there are multiple child builders, combine them all into one we ca pass to the new logic
      // node.
      const combined = LogicNodeBuilder.newRoot();
      for (const child of childBuilders) {
        combined.mergeIn(child);
      }
      return new LogicNode(combined);
    }
  }
}

/**
 * A builder for `LogicNode`, which itself is a tree.
 */
export abstract class LogicNodeBuilder {
  protected constructor(readonly predicates: ReadonlyArray<Predicate>) {}

  abstract addHiddenRule(logic: LogicFn<unknown, boolean>): void;
  abstract addDisabledRule(logic: LogicFn<unknown, boolean>): void;
  abstract addErrorRule(logic: LogicFn<unknown, ValidationResult>): void;
  abstract addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<unknown, T>): void;
  abstract getChild(key: PropertyKey): MergableLogicNodeBuilder;
  abstract predicate(predicates: ReadonlyArray<Predicate>): LogicNodeBuilder;

  build(): LogicNode {
    return new LogicNode(this);
  }

  static newRoot(): MergableLogicNodeBuilder {
    return new CompositeLogicNodeBuilder([]);
  }
}

/**
 * A subclass of `LogicNodeBuilder` that supports merging with other logic trees.
 */
export interface MergableLogicNodeBuilder extends LogicNodeBuilder {
  mergeIn(other: MergableLogicNodeBuilder, predicate?: Predicate): void;
  predicate(predicates: ReadonlyArray<Predicate>): MergableLogicNodeBuilder;
}

/**
 * A `MergableLogicNodeBuilder` that delegates to its "current" builder and creates a new current
 * builder after another builder tree is merged in.
 */
class CompositeLogicNodeBuilder extends LogicNodeBuilder implements MergableLogicNodeBuilder {
  private current: SimpleLogicNodeBuilder | undefined;
  readonly all: LogicNodeBuilder[] = [];

  override addHiddenRule(logic: LogicFn<unknown, boolean>): void {
    this.getCurrent().addHiddenRule(logic);
  }

  override addDisabledRule(logic: LogicFn<unknown, boolean>): void {
    this.getCurrent().addDisabledRule(logic);
  }

  override addErrorRule(logic: LogicFn<unknown, FormError>): void {
    this.getCurrent().addErrorRule(logic);
  }

  override addMetadataRule<T>(key: MetadataKey<T>, logic: LogicFn<unknown, T>): void {
    this.getCurrent().addMetadataRule(key, logic);
  }

  override getChild(key: PropertyKey): MergableLogicNodeBuilder {
    return this.getCurrent().getChild(key);
  }

  override predicate(predicates: ReadonlyArray<Predicate>) {
    const newPredicates = [...this.predicates, ...predicates];
    const clone = new CompositeLogicNodeBuilder(newPredicates);
    clone.all.push(...this.all.map((b) => b.predicate(newPredicates)));
    clone.current = this.current?.predicate(newPredicates);
    return clone;
  }

  mergeIn(other: MergableLogicNodeBuilder, predicate?: Predicate): void {
    // Add the other builder to our collection, we'll defer the actual merging of the logic until
    // the logic node is requested to be created. In order to preserve the original ordering of the
    // rules, we close off the current builder to any further edits. If additional logic is added,
    // a new current builder will be created to capture it.
    const predicates = [...this.predicates];
    if (predicate) {
      predicates.push(predicate);
    }
    if (predicates.length !== 0) {
      this.all.push(other.predicate(predicates));
    } else {
      this.all.push(other);
    }
    this.current = undefined;
  }

  private getCurrent(): SimpleLogicNodeBuilder {
    // All rules added to this builder get added on to the current builder. If there is no current
    // builder, a new one is created. In order to preserve the original ordering of the rules, we
    // clear the current builder whenever a separate builder tree is merged in.
    if (this.current === undefined) {
      this.current = new SimpleLogicNodeBuilder(this.predicates);
      this.all.push(this.current);
    }
    return this.current;
  }
}

/**
 * A `LogicNodeBuilder` that directly adds logic to its backing `Logic` instance.
 *
 * The user should not be given a reference to this class, it is used internally to keep track of
 * concrete tree chunks within the `CompositeLogicNodeBuilder`. When handing a `LogicNodeBuilder`
 * to the user it should always be a `CompositeLogicNodeBuilder`.
 */
class SimpleLogicNodeBuilder extends LogicNodeBuilder {
  logic = new Logic([]);
  readonly children = new Map<PropertyKey, MergableLogicNodeBuilder>();

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

  override predicate(predicates: ReadonlyArray<Predicate>) {
    const newPredicates = [...this.predicates, ...predicates];
    const clone = new SimpleLogicNodeBuilder(newPredicates);
    for (const [prop, child] of this.children) {
      clone.children.set(prop, child.predicate(newPredicates));
    }
    clone.logic = this.logic;
    return clone;
  }

  override getChild(key: PropertyKey): MergableLogicNodeBuilder {
    // We always create a `CompositeLogicNodeBuilder` for children since someone may call `apply` on
    // the child.
    if (!this.children.has(key)) {
      this.children.set(key, new CompositeLogicNodeBuilder(this.predicates));
    }
    return this.children.get(key)!;
  }
}

/**
 * Gets all of the builders that contribute logic to the given child of the parent builder.
 */
function getAllChildren(builder: LogicNodeBuilder, key: PropertyKey): MergableLogicNodeBuilder[] {
  if (builder instanceof CompositeLogicNodeBuilder) {
    return builder.all.flatMap((node) => getAllChildren(node, key));
  } else if (builder instanceof SimpleLogicNodeBuilder) {
    if (builder.children.has(key)) {
      return [builder.children.get(key)!];
    }
  } else {
    throw new Error('Unknown LogicNodeBuilder type');
  }
  return [];
}

/**
 * Creates the full `Logic` for a given builder.
 */
function createLogic(builder: LogicNodeBuilder): Logic {
  const logic = new Logic(builder.predicates);
  if (builder instanceof CompositeLogicNodeBuilder) {
    const builtNodes = builder.all.map((b) => b.build());
    for (const node of builtNodes) {
      logic.disabled.mergeIn(node.logic.disabled);
      logic.hidden.mergeIn(node.logic.hidden);
      logic.errors.mergeIn(node.logic.errors);
      for (const key of node.logic.getMetadataKeys()) {
        logic.getMetadata(key).mergeIn(node.logic.getMetadata(key));
      }
    }
  } else if (builder instanceof SimpleLogicNodeBuilder) {
    logic.disabled.mergeIn(builder.logic.disabled);
    logic.hidden.mergeIn(builder.logic.hidden);
    logic.errors.mergeIn(builder.logic.errors);
    for (const key of builder.logic.getMetadataKeys()) {
      logic.getMetadata(key).mergeIn(builder.logic.getMetadata(key));
    }
  } else {
    throw new Error('Unknown LogicNodeBuilder type');
  }
  return logic;
}
