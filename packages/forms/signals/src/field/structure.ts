/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  DestroyableInjector,
  Injector,
  linkedSignal,
  Signal,
  WritableSignal,
} from '@angular/core';

import {DYNAMIC} from '../schema/logic';
import {LogicNode} from '../schema/logic_node';
import type {FieldPathNode} from '../schema/path_node';
import {deepSignal} from '../util/deep_signal';
import {isArray, isObject} from '../util/type_guards';
import type {FormFieldManager} from './manager';
import type {FieldNode, ParentFieldNode} from './node';
import type {FieldAdapter} from './field_adapter';

/**
 * Key by which a parent `FieldNode` tracks its children.
 *
 * Often this is the actual property key of the child, but in the case of arrays it could be a
 * tracking key allocated for the object.
 */
export type TrackingKey = PropertyKey & {__brand: 'FieldIdentity'};

/** Structural component of a `FieldNode` which tracks its path, parent, and children. */
export abstract class FieldNodeStructure {
  /** Computed map of child fields, based on the current value of this field. */
  abstract readonly childrenMap: Signal<Map<TrackingKey, FieldNode> | undefined>;

  /** The field's value. */
  abstract readonly value: WritableSignal<unknown>;

  /**
   * The key of this field in its parent field.
   * Attempting to read this for the root field will result in an error being thrown.
   */
  abstract readonly keyInParent: Signal<string>;

  /** The field manager responsible for managing this field. */
  abstract readonly fieldManager: FormFieldManager;

  /** The root field that this field descends from. */
  abstract readonly root: FieldNode;

  /** The list of property keys to follow to get from the `root` to this field. */
  abstract readonly pathKeys: Signal<readonly PropertyKey[]>;

  /** The parent field of this field. */
  abstract readonly parent: FieldNode | undefined;

  /** Added to array elements for tracking purposes. */
  // TODO: given that we don't ever let a field move between parents, is it safe to just extract
  // this to a shared symbol for all fields, rather than having a separate one per parent?
  readonly identitySymbol = Symbol();

  /** Lazily initialized injector. Do not access directly, access via `injector` getter instead. */
  private _injector: DestroyableInjector | undefined = undefined;

  /** Lazily initialized injector. */
  get injector(): DestroyableInjector {
    this._injector ??= Injector.create({
      providers: [],
      parent: this.fieldManager.injector,
    }) as DestroyableInjector;
    return this._injector;
  }

  constructor(
    /** The logic to apply to this field. */
    readonly logic: LogicNode,
  ) {}

  /** Gets the child fields of this field. */
  children(): Iterable<FieldNode> {
    return this.childrenMap()?.values() ?? [];
  }

  /** Retrieve a child `FieldNode` of this node by property key. */
  getChild(key: PropertyKey): FieldNode | undefined {
    const map = this.childrenMap();
    const value = this.value();
    if (!map || !isObject(value)) {
      return undefined;
    }

    if (isArray(value)) {
      const childValue = value[key];
      if (isObject(childValue) && childValue.hasOwnProperty(this.identitySymbol)) {
        // For arrays, we want to use the tracking identity of the value instead of the raw property
        // as our index into the `childrenMap`.
        key = childValue[this.identitySymbol] as PropertyKey;
      }
    }

    return map.get((typeof key === 'number' ? key.toString() : key) as TrackingKey);
  }

  /** Destroys the field when it is no longer needed. */
  destroy(): void {
    this.injector.destroy();
  }
}

/** The structural component of a `FieldNode` that is the root of its field tree. */
export class RootFieldNodeStructure extends FieldNodeStructure {
  override get parent(): undefined {
    return undefined;
  }

  override get root(): FieldNode {
    return this.node;
  }

  override get pathKeys(): Signal<readonly PropertyKey[]> {
    return ROOT_PATH_KEYS;
  }

  override get keyInParent(): Signal<string> {
    return ROOT_KEY_IN_PARENT;
  }

  override readonly childrenMap: Signal<Map<TrackingKey, FieldNode> | undefined>;

  /**
   * Creates the structure for the root node of a field tree.
   *
   * @param node The full field node that this structure belongs to
   * @param pathNode The path corresponding to this node in the schema
   * @param logic The logic to apply to this field
   * @param fieldManager The field manager for this field
   * @param value The value signal for this field
   * @param adapter Adapter that knows how to create new fields and appropriate state.
   * @param createChildNode A factory function to create child nodes for this field.
   */
  constructor(
    /** The full field node that corresponds to this structure. */
    private readonly node: FieldNode,
    pathNode: FieldPathNode,
    logic: LogicNode,
    override readonly fieldManager: FormFieldManager,
    override readonly value: WritableSignal<unknown>,
    adapter: FieldAdapter,
    createChildNode: (options: ChildFieldNodeOptions) => FieldNode,
  ) {
    super(logic);
    this.childrenMap = makeChildrenMapSignal(
      node as ParentFieldNode,
      value,
      this.identitySymbol,
      pathNode,
      logic,
      adapter,
      createChildNode,
    );
  }
}

/** The structural component of a child `FieldNode` within a field tree. */
export class ChildFieldNodeStructure extends FieldNodeStructure {
  override readonly root: FieldNode;
  override readonly pathKeys: Signal<readonly PropertyKey[]>;
  override readonly keyInParent: Signal<string>;
  override readonly value: WritableSignal<unknown>;

  override readonly childrenMap: Signal<Map<TrackingKey, FieldNode> | undefined>;

  override get fieldManager(): FormFieldManager {
    return this.root.structure.fieldManager;
  }

  /**
   * Creates the structure for a child field node in a field tree.
   *
   * @param node The full field node that this structure belongs to
   * @param pathNode The path corresponding to this node in the schema
   * @param logic The logic to apply to this field
   * @param parent The parent field node for this node
   * @param identityInParent The identity used to track this field in its parent
   * @param initialKeyInParent The key of this field in its parent at the time of creation
   * @param adapter Adapter that knows how to create new fields and appropriate state.
   * @param createChildNode A factory function to create child nodes for this field.
   */
  constructor(
    node: FieldNode,
    pathNode: FieldPathNode,
    logic: LogicNode,
    override readonly parent: ParentFieldNode,
    identityInParent: TrackingKey | undefined,
    initialKeyInParent: string,
    adapter: FieldAdapter,
    createChildNode: (options: ChildFieldNodeOptions) => FieldNode,
  ) {
    super(logic);

    this.root = this.parent.structure.root;

    this.pathKeys = computed(() => [...parent.structure.pathKeys(), this.keyInParent()]);

    if (identityInParent === undefined) {
      const key = initialKeyInParent;
      this.keyInParent = computed(() => {
        if (parent.structure.childrenMap()?.get(key as TrackingKey) !== node) {
          throw new Error(
            `RuntimeError: orphan field, looking for property '${key}' of ${getDebugName(parent)}`,
          );
        }
        return key;
      });
    } else {
      let lastKnownKey = initialKeyInParent;
      this.keyInParent = computed(() => {
        // TODO(alxhub): future perf optimization: here we depend on the parent's value, but most
        // changes to the value aren't structural - they aren't moving around objects and thus
        // shouldn't affect `keyInParent`. We currently mitigate this issue via `lastKnownKey`
        // which avoids a search.
        const parentValue = parent.structure.value();
        if (!isArray(parentValue)) {
          // It should not be possible to encounter this error. It would require the parent to
          // change from an array field to non-array field. However, in the current implementation
          // a field's parent can never change.
          throw new Error(
            `RuntimeError: orphan field, expected ${getDebugName(parent)} to be an array`,
          );
        }

        // Check the parent value at the last known key to avoid a scan.
        // Note: lastKnownKey is a string, but we pretend to typescript like its a number,
        // since accessing someArray['1'] is the same as accessing someArray[1]
        const data = parentValue[lastKnownKey as unknown as number];
        if (
          isObject(data) &&
          data.hasOwnProperty(parent.structure.identitySymbol) &&
          data[parent.structure.identitySymbol] === identityInParent
        ) {
          return lastKnownKey;
        }

        // Otherwise, we need to check all the keys in the parent.
        for (let i = 0; i < parentValue.length; i++) {
          const data = parentValue[i];
          if (
            isObject(data) &&
            data.hasOwnProperty(parent.structure.identitySymbol) &&
            data[parent.structure.identitySymbol] === identityInParent
          ) {
            return (lastKnownKey = i.toString());
          }
        }

        throw new Error(
          `RuntimeError: orphan field, can't find element in array ${getDebugName(parent)}`,
        );
      });
    }

    this.value = deepSignal(this.parent.structure.value, this.keyInParent);
    this.childrenMap = makeChildrenMapSignal(
      node as ParentFieldNode,
      this.value,
      this.identitySymbol,
      pathNode,
      logic,
      adapter,
      createChildNode,
    );

    this.fieldManager.structures.add(this);
  }
}

/** Global id used for tracking keys. */
let globalId = 0;

/** Options passed when constructing a root field node. */
export interface RootFieldNodeOptions {
  /** Kind of node, used to differentiate root node options from child node options. */
  readonly kind: 'root';
  /** The path node corresponding to this field in the schema. */
  readonly pathNode: FieldPathNode;
  /** The logic to apply to this field. */
  readonly logic: LogicNode;
  /** The value signal for this field. */
  readonly value: WritableSignal<unknown>;
  /** The field manager for this field. */
  readonly fieldManager: FormFieldManager;
  /** This allows for more granular field and state management, and is currently used for compat. */
  readonly fieldAdapter: FieldAdapter;
}

/** Options passed when constructing a child field node. */
export interface ChildFieldNodeOptions {
  /** Kind of node, used to differentiate root node options from child node options. */
  readonly kind: 'child';
  /** The parent field node of this field. */
  readonly parent: ParentFieldNode;
  /** The path node corresponding to this field in the schema. */
  readonly pathNode: FieldPathNode;
  /** The logic to apply to this field. */
  readonly logic: LogicNode;
  /** The key of this field in its parent at the time of creation. */
  readonly initialKeyInParent: string;
  /** The identity used to track this field in its parent. */
  readonly identityInParent: TrackingKey | undefined;
  /** This allows for more granular field and state management, and is currently used for compat. */
  readonly fieldAdapter: FieldAdapter;
}

/** Options passed when constructing a field node. */
export type FieldNodeOptions = RootFieldNodeOptions | ChildFieldNodeOptions;

/** A signal representing an empty list of path keys, used for root fields. */
const ROOT_PATH_KEYS = computed<readonly PropertyKey[]>(() => []);

/**
 * A signal representing a non-existent key of the field in its parent, used for root fields which
 * do not have a parent. This signal will throw if it is read.
 */
const ROOT_KEY_IN_PARENT = computed(() => {
  throw new Error(`RuntimeError: the top-level field in the form has no parent`);
});

/**
 * Creates a linked signal map of all child fields for a field.
 *
 * @param node The field to create the children map signal for.
 * @param valueSignal The value signal for the field.
 * @param identitySymbol The key used to access the tracking id of a field.
 * @param pathNode The path node corresponding to the field in the schema.
 * @param logic The logic to apply to the field.
 * @param adapter Adapter that knows how to create new fields and appropriate state.
 * @param createChildNode A factory function to create child nodes for this field.
 * @returns
 */
function makeChildrenMapSignal(
  node: FieldNode,
  valueSignal: WritableSignal<unknown>,
  identitySymbol: symbol,
  pathNode: FieldPathNode,
  logic: LogicNode,
  adapter: FieldAdapter,
  createChildNode: (options: ChildFieldNodeOptions) => FieldNode,
): Signal<Map<TrackingKey, FieldNode> | undefined> {
  // We use a `linkedSignal` to preserve the instances of `FieldNode` for each child field even if
  // the value of this field changes its object identity. The computation creates or updates the map
  // of child `FieldNode`s for `node` based on its current value.
  return linkedSignal<unknown, Map<TrackingKey, FieldNode> | undefined>({
    source: valueSignal,
    computation: (value, previous): Map<TrackingKey, FieldNode> | undefined => {
      // We may or may not have a previous map. If there isn't one, then `childrenMap` will be lazily
      // initialized to a new map instance if needed.
      let childrenMap = previous?.value;

      if (!isObject(value)) {
        // Non-object values have no children.
        return undefined;
      }
      const isValueArray = isArray(value);

      // Remove fields that have disappeared since the last time this map was computed.
      if (childrenMap !== undefined) {
        let oldKeys: Set<TrackingKey> | undefined = undefined;
        if (isValueArray) {
          oldKeys = new Set(childrenMap.keys());
          for (let i = 0; i < value.length; i++) {
            const childValue = value[i] as unknown;
            if (isObject(childValue) && childValue.hasOwnProperty(identitySymbol)) {
              oldKeys.delete(childValue[identitySymbol] as TrackingKey);
            } else {
              oldKeys.delete(i.toString() as TrackingKey);
            }
          }

          for (const key of oldKeys) {
            childrenMap.delete(key);
          }
        } else {
          for (let key of childrenMap.keys()) {
            if (!value.hasOwnProperty(key)) {
              childrenMap.delete(key);
            }
          }
        }
      }

      // Add fields that exist in the value but don't yet have instances in the map.
      for (let key of Object.keys(value)) {
        let trackingId: TrackingKey | undefined = undefined;
        const childValue = value[key] as unknown;

        // Fields explicitly set to `undefined` are treated as if they don't exist.
        // This ensures that `{value: undefined}` and `{}` have the same behavior for their `value`
        // field.
        if (childValue === undefined) {
          // The value might have _become_ `undefined`, so we need to delete it here.
          childrenMap?.delete(key as TrackingKey);
          continue;
        }

        if (isValueArray && isObject(childValue)) {
          // For object values in arrays, assign a synthetic identity instead.
          trackingId = (childValue[identitySymbol] as TrackingKey) ??= Symbol(
            ngDevMode ? `id:${globalId++}` : '',
          ) as TrackingKey;
        }

        const identity = trackingId ?? (key as TrackingKey);

        if (childrenMap?.has(identity)) {
          continue;
        }

        // Determine the logic for the field that we're defining.
        let childPath: FieldPathNode | undefined;
        let childLogic: LogicNode;
        if (isValueArray) {
          // Fields for array elements have their logic defined by the `element` mechanism.
          // TODO: other dynamic data
          childPath = pathNode.getChild(DYNAMIC);
          childLogic = logic.getChild(DYNAMIC);
        } else {
          // Fields for plain properties exist in our logic node's child map.
          childPath = pathNode.getChild(key);
          childLogic = logic.getChild(key);
        }

        childrenMap ??= new Map<TrackingKey, FieldNode>();
        childrenMap.set(
          identity,
          createChildNode({
            kind: 'child',
            parent: node as ParentFieldNode,
            pathNode: childPath,
            logic: childLogic,
            initialKeyInParent: key,
            identityInParent: trackingId,
            fieldAdapter: adapter,
          }),
        );
      }

      return childrenMap;
    },
    equal: () => false,
  });
}

/** Gets a human readable name for a field node for use in error messages. */
function getDebugName(node: FieldNode) {
  return `<root>.${node.structure.pathKeys().join('.')}`;
}
