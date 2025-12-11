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
  ɵRuntimeError as RuntimeError,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';

import {SignalFormsErrorCode} from '../errors';

import {LogicNode} from '../schema/logic_node';
import type {FieldPathNode} from '../schema/path_node';
import {deepSignal} from '../util/deep_signal';
import {isArray, isObject} from '../util/type_guards';
import type {FieldAdapter} from './field_adapter';
import type {FormFieldManager} from './manager';
import type {FieldNode, ParentFieldNode} from './node';

/**
 * Key by which a parent `FieldNode` tracks its children.
 *
 * Often this is the actual property key of the child, but in the case of arrays it could be a
 * tracking key allocated for the object.
 */
export type TrackingKey = PropertyKey & {__brand: 'FieldIdentity'};
export type ChildNodeCtor = (
  key: string,
  trackingKey: TrackingKey | undefined,
  isArray: boolean,
) => FieldNode;

/** Structural component of a `FieldNode` which tracks its path, parent, and children. */
export abstract class FieldNodeStructure {
  /**
   * Computed map of child fields, based on the current value of this field.
   *
   * This structure reacts to `this.value` and produces a new `ChildrenData` when the
   * value changes structurally (fields added/removed/moved).
   */
  protected abstract readonly childrenMap: Signal<ChildrenData | undefined>;

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
  abstract readonly pathKeys: Signal<readonly string[]>;

  /** The parent field of this field. */
  abstract readonly parent: FieldNode | undefined;

  readonly logic: LogicNode;
  readonly node: FieldNode;

  readonly createChildNode: ChildNodeCtor;

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

  constructor(logic: LogicNode, node: FieldNode, createChildNode: ChildNodeCtor) {
    this.logic = logic;
    this.node = node;
    this.createChildNode = createChildNode;
  }

  /** Gets the child fields of this field. */
  children(): readonly FieldNode[] {
    const map = this.childrenMap();
    if (map === undefined) {
      return [];
    }
    return Array.from(map.byPropertyKey.values()).map((child) => untracked(child.reader)!);
  }

  /** Retrieve a child `FieldNode` of this node by property key. */
  getChild(key: PropertyKey): FieldNode | undefined {
    const strKey = key.toString();

    // Lookup the computed reader for this key in `childrenMap`. This lookup doesn't need to be
    // reactive since `childrenMap` guarantees it will always return the same `reader` for the same
    // `key`, so long as that key exists.
    let reader = untracked(this.childrenMap)?.byPropertyKey.get(strKey)?.reader;

    if (!reader) {
      // The key doesn't exist / doesn't have a child field associated with it. In this case, we
      // need to be clever. We want to return `undefined`, but also be notified by reactivity if the
      // field _does_ pop into existence later. Basically, we want to depend on a reader for a key
      // that doesn't exist.
      //
      // We do precisely that by creating an ephemeral reader which will be read and then dropped.
      // If we're in a reactive context, the ephemeral reader will live on in the dependencies of
      // that context and notify it if the field is later created. When the reactive context reruns,
      // it will again attempt the read which will call `getChild()`, which will then find the real
      // reader for that key.
      reader = this.createReader(strKey);
    }

    return reader();
  }

  /**
   * Perform a reduction over a field's children (if any) and return the result.
   *
   * Optionally, the reduction is short circuited based on the provided `shortCircuit` function.
   */
  reduceChildren<T>(
    initialValue: T,
    fn: (child: FieldNode, value: T) => T,
    shortCircuit?: (value: T) => boolean,
  ): T {
    const map = this.childrenMap();
    if (!map) {
      return initialValue;
    }

    let value = initialValue;
    for (const child of map.byPropertyKey.values()) {
      if (shortCircuit?.(value)) {
        break;
      }
      value = fn(untracked(child.reader)!, value);
    }
    return value;
  }

  /** Destroys the field when it is no longer needed. */
  destroy(): void {
    this.injector.destroy();
  }

  /**
   * Creates a keyInParent signal for a field node.
   *
   * For root nodes, returns ROOT_KEY_IN_PARENT which throws when accessed.
   * For child nodes, creates a computed that tracks the field's current key in its parent,
   * with special handling for tracked array elements.
   *
   * @param options The field node options
   * @param identityInParent The tracking identity (only for tracked array children)
   * @param initialKeyInParent The initial key in parent (only for child nodes)
   * @returns A signal representing the field's key in its parent
   */
  protected createKeyInParent(
    options: FieldNodeOptions,
    identityInParent: TrackingKey | undefined,
    initialKeyInParent: string | undefined,
  ): Signal<string> {
    if (options.kind === 'root') {
      return ROOT_KEY_IN_PARENT;
    }

    if (identityInParent === undefined) {
      const key = initialKeyInParent!;
      return computed(() => {
        if (this.parent!.structure.getChild(key) !== this.node) {
          throw new RuntimeError(
            SignalFormsErrorCode.ORPHAN_FIELD_PROPERTY,
            ngDevMode &&
              `Orphan field, looking for property '${key}' of ${getDebugName(this.parent!)}`,
          );
        }
        return key;
      });
    } else {
      let lastKnownKey = initialKeyInParent!;
      return computed(() => {
        // TODO(alxhub): future perf optimization: here we depend on the parent's value, but most
        // changes to the value aren't structural - they aren't moving around objects and thus
        // shouldn't affect `keyInParent`. We currently mitigate this issue via `lastKnownKey`
        // which avoids a search.
        const parentValue = this.parent!.structure.value();
        if (!isArray(parentValue)) {
          // It should not be possible to encounter this error. It would require the parent to
          // change from an array field to non-array field. However, in the current implementation
          // a field's parent can never change.
          throw new RuntimeError(
            SignalFormsErrorCode.ORPHAN_FIELD_ARRAY,
            ngDevMode && `Orphan field, expected ${getDebugName(this.parent!)} to be an array`,
          );
        }

        // Check the parent value at the last known key to avoid a scan.
        // Note: lastKnownKey is a string, but we pretend to typescript like its a number,
        // since accessing someArray['1'] is the same as accessing someArray[1]
        const data = parentValue[lastKnownKey as unknown as number];
        if (
          isObject(data) &&
          data.hasOwnProperty(this.parent!.structure.identitySymbol) &&
          data[this.parent!.structure.identitySymbol] === identityInParent
        ) {
          return lastKnownKey;
        }

        // Otherwise, we need to check all the keys in the parent.
        for (let i = 0; i < parentValue.length; i++) {
          const data = parentValue[i];
          if (
            isObject(data) &&
            data.hasOwnProperty(this.parent!.structure.identitySymbol) &&
            data[this.parent!.structure.identitySymbol] === identityInParent
          ) {
            return (lastKnownKey = i.toString());
          }
        }

        throw new RuntimeError(
          SignalFormsErrorCode.ORPHAN_FIELD_NOT_FOUND,
          ngDevMode && `Orphan field, can't find element in array ${getDebugName(this.parent!)}`,
        );
      });
    }
  }

  protected createChildrenMap(): Signal<ChildrenData | undefined> {
    return linkedSignal({
      source: this.value,
      computation: (
        value: unknown,
        previous: {source: unknown; value: ChildrenData | undefined} | undefined,
      ): ChildrenData | undefined => {
        if (!isObject(value)) {
          // Non-object values have no children. This short-circuit path makes `childrenMap` fast
          // for primitive-valued fields.
          return undefined;
        }

        // Previous `ChildrenData` (immutable). This is also where we first initialize our map if
        // needed.
        const prevData: ChildrenData = previous?.value ?? {
          byPropertyKey: new Map(),
        };

        // The next `ChildrenData` object to be returned. Initialized lazily when we know there's
        // been a structural change to the model.
        let data: MutableChildrenData | undefined;

        const parentIsArray = isArray(value);

        // Remove fields that have disappeared since the last time this map was computed.
        if (prevData !== undefined) {
          if (parentIsArray) {
            data = maybeRemoveStaleArrayFields(prevData, value, this.identitySymbol);
          } else {
            data = maybeRemoveStaleObjectFields(prevData, value);
          }
        }

        // Now, go through the values and add any new ones.
        for (const key of Object.keys(value)) {
          let trackingKey: TrackingKey | undefined = undefined;
          const childValue = value[key] as unknown;

          // Fields explicitly set to `undefined` are treated as if they don't exist.
          // This ensures that `{value: undefined}` and `{}` have the same behavior for their `value`
          // field.
          if (childValue === undefined) {
            // The value might have _become_ `undefined`, so we need to delete it here.
            if (prevData.byPropertyKey.has(key)) {
              data ??= {...(prevData as MutableChildrenData)};
              data.byPropertyKey.delete(key);
            }
            continue;
          }

          if (parentIsArray && isObject(childValue) && !isArray(childValue)) {
            // For object values in arrays, assign a synthetic identity. This will be used to
            // preserve the field instance even as this object moves around in the parent array.
            trackingKey = (childValue[this.identitySymbol] as TrackingKey) ??= Symbol(
              ngDevMode ? `id:${globalId++}` : '',
            ) as TrackingKey;
          }

          let childNode: FieldNode | undefined;

          if (trackingKey) {
            // If tracking is in use, then the `FieldNode` instance is always managed via its
            // tracking key. Create the instance if needed, or look it up otherwise.
            if (!prevData.byTrackingKey?.has(trackingKey)) {
              data ??= {...(prevData as MutableChildrenData)};
              data.byTrackingKey ??= new Map();

              data.byTrackingKey.set(
                trackingKey,
                this.createChildNode(key, trackingKey, parentIsArray),
              );
            }

            // Note: data ?? prevData is needed because we might have freshly instantiated
            // `byTrackingKey` only in `data` above.
            childNode = (data ?? prevData).byTrackingKey!.get(trackingKey)!;
          }

          // Next, make sure the `ChildData` for this key in `byPropertyKey` is up to date. We need
          // to consider two cases:
          //
          // 1. No record exists for this field (yet).
          // 2. A record does exist, but the field identity at this key has changed (only possible
          //    when fields are tracked).
          const child = prevData.byPropertyKey.get(key);
          if (child === undefined) {
            // No record exists yet - create one.
            data ??= {...(prevData as MutableChildrenData)};

            data.byPropertyKey.set(key, {
              // TODO: creating a computed per-key is overkill when the field at a key can't change
              // (e.g. the value is not an array). Maybe this can be optimized?
              reader: this.createReader(key),
              // If tracking is in use, then it already created/found the `childNode` for this key.
              // Otherwise we create the child field here.
              node: childNode ?? this.createChildNode(key, trackingKey, parentIsArray),
            });
          } else if (childNode && childNode !== child.node) {
            // A record exists, but records the wrong `FieldNode`. Update it.
            data ??= {...(prevData as MutableChildrenData)};
            child.node = childNode;
          }
        }

        return data ?? prevData;
      },
    });
  }

  /**
   * Creates a "reader" computed for the given key.
   *
   * A reader is a computed signal that memoizes the access of the `FieldNode` stored at this key
   * (or returns `undefined` if no such field exists). Accessing fields via the reader ensures that
   * reactive consumers aren't notified unless the field at a key actually changes.
   */
  private createReader(key: string): Signal<FieldNode | undefined> {
    return computed(() => this.childrenMap()?.byPropertyKey.get(key)?.node);
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

  override get pathKeys(): Signal<readonly string[]> {
    return ROOT_PATH_KEYS;
  }

  override get keyInParent(): Signal<string> {
    return ROOT_KEY_IN_PARENT;
  }

  protected override readonly childrenMap: Signal<ChildrenData | undefined>;

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
    node: FieldNode,
    logic: LogicNode,
    override readonly fieldManager: FormFieldManager,
    override readonly value: WritableSignal<unknown>,
    createChildNode: ChildNodeCtor,
  ) {
    super(logic, node, createChildNode);
    this.childrenMap = this.createChildrenMap();
  }
}

/** The structural component of a child `FieldNode` within a field tree. */
export class ChildFieldNodeStructure extends FieldNodeStructure {
  override readonly root: FieldNode;
  override readonly pathKeys: Signal<readonly string[]>;
  override readonly keyInParent: Signal<string>;
  override readonly value: WritableSignal<unknown>;
  override readonly childrenMap: Signal<ChildrenData | undefined>;

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
    override readonly logic: LogicNode,
    override readonly parent: ParentFieldNode,
    identityInParent: TrackingKey | undefined,
    initialKeyInParent: string,
    createChildNode: ChildNodeCtor,
  ) {
    super(logic, node, createChildNode);

    this.root = this.parent.structure.root;

    this.keyInParent = this.createKeyInParent(
      {
        kind: 'child',
        parent,
        pathNode: undefined!,
        logic,
        initialKeyInParent,
        identityInParent,
        fieldAdapter: undefined!,
      },
      identityInParent,
      initialKeyInParent,
    );

    this.pathKeys = computed(() => [...parent.structure.pathKeys(), this.keyInParent()]);

    this.value = deepSignal(this.parent.structure.value, this.keyInParent);
    this.childrenMap = this.createChildrenMap();
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
const ROOT_PATH_KEYS = computed<readonly string[]>(() => []);

/**
 * A signal representing a non-existent key of the field in its parent, used for root fields which
 * do not have a parent. This signal will throw if it is read.
 */
const ROOT_KEY_IN_PARENT = computed(() => {
  throw new RuntimeError(
    SignalFormsErrorCode.ROOT_FIELD_NO_PARENT,
    ngDevMode && 'The top-level field in the form has no parent.',
  );
});

/** Gets a human readable name for a field node for use in error messages. */
function getDebugName(node: FieldNode) {
  return `<root>.${node.structure.pathKeys().join('.')}`;
}

interface MutableChildrenData {
  readonly byPropertyKey: Map<string, ChildData>;
  byTrackingKey?: Map<TrackingKey, FieldNode>;
}

/**
 * Derived data regarding child fields for a specific parent field.
 */
interface ChildrenData {
  /**
   * Tracks `ChildData` for each property key within the parent.
   */
  readonly byPropertyKey: ReadonlyMap<string, ChildData>;

  /**
   * Tracks the instance of child `FieldNode`s by their tracking key, which is always 1:1 with the
   * fields, even if they move around in the parent.
   */
  readonly byTrackingKey?: ReadonlyMap<TrackingKey, FieldNode>;
}

/**
 * Data for a specific child within a parent.
 */
interface ChildData {
  /**
   * A computed signal to access the `FieldNode` currently stored at a specific key.
   *
   * Because this is a computed, it only updates whenever the `FieldNode` at that key changes.
   * Because `ChildData` is always associated with a specific key via `ChildrenData.byPropertyKey`,
   * this computed gives a stable way to watch the field stored for a given property and only
   * receives notifications when that field changes.
   */
  readonly reader: Signal<FieldNode | undefined>;

  /**
   * The child `FieldNode` currently stored at this key.
   */
  node: FieldNode;
}

function maybeRemoveStaleArrayFields(
  prevData: ChildrenData,
  value: ReadonlyArray<unknown>,
  identitySymbol: PropertyKey,
): MutableChildrenData | undefined {
  let data: MutableChildrenData | undefined;

  // TODO: we should be able to optimize this diff away in the fast case where nothing has
  // actually changed structurally.
  const oldKeys = new Set(prevData.byPropertyKey.keys());
  const oldTracking = new Set(prevData.byTrackingKey?.keys());

  for (let i = 0; i < value.length; i++) {
    const childValue = value[i];
    oldKeys.delete(i.toString());
    if (isObject(childValue) && childValue.hasOwnProperty(identitySymbol)) {
      oldTracking.delete(childValue[identitySymbol] as TrackingKey);
    }
  }

  // `oldKeys` and `oldTracking` now contain stale keys and tracking keys, respectively.
  // Remove them from their corresponding maps.

  if (oldKeys.size > 0) {
    data ??= {...(prevData as MutableChildrenData)};
    for (const key of oldKeys) {
      data.byPropertyKey.delete(key);
    }
  }
  if (oldTracking.size > 0) {
    data ??= {...(prevData as MutableChildrenData)};
    for (const id of oldTracking) {
      data.byTrackingKey?.delete(id);
    }
  }

  return data;
}

function maybeRemoveStaleObjectFields(
  prevData: ChildrenData,
  value: Record<PropertyKey, unknown>,
): MutableChildrenData | undefined {
  let data: MutableChildrenData | undefined;

  // For objects, we diff a bit differently, and use the value to check whether an old
  // property still exists on the object value.
  for (const key of prevData.byPropertyKey.keys()) {
    if (!value.hasOwnProperty(key)) {
      data ??= {...(prevData as MutableChildrenData)};
      data.byPropertyKey.delete(key);
    }
  }

  return data;
}
