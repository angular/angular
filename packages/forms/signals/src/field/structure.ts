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

import {RuntimeErrorCode} from '../errors';

import {LogicNode} from '../schema/logic_node';
import type {FieldPathNode} from '../schema/path_node';
import {deepSignal} from '../util/deep_signal';
import {isArray, isObject} from '../util/type_guards';
import type {FieldAdapter} from './field_adapter';
import type {FormFieldManager} from './manager';
import type {FieldNode, ParentFieldNode} from './node';

const ORPHAN_TOKEN = Symbol(typeof ngDevMode !== 'undefined' && ngDevMode ? 'ORPHAN_TOKEN' : '');
const FALSE_SIGNAL = computed(() => false);

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

  abstract readonly isOrphaned: Signal<boolean>;

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

  /** Cache whether any logic rules exist on children of this node. */
  private _anyChildHasLogic?: boolean;

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
    this.ensureChildrenMap();
    const map = this.childrenMap();
    if (map === undefined) {
      return [];
    }
    return Array.from(map.byPropertyKey.values()).map((child) => untracked(child.reader)!);
  }

  /**
   * Gets only the child fields that have been materialized already.
   *
   * This is useful for iterating over children without triggering materialization of children
   * that haven't been accessed yet.
   *
   * Note: This method assumes it is called within an untracked context (or in a non-reactive context)
   * as it reads signals without wrapping them in `untracked()`.
   */
  materializedChildren(): readonly FieldNode[] {
    const map = this.childrenMap();
    if (map === undefined) {
      return [];
    }
    return Array.from(map.byPropertyKey.values()).map((child) => child.node);
  }

  /**
   * Internal method (cast to any in tests) to check if the children map has been materialized.
   * Useful for validating that fields without logic are lazily instantiated.
   *
   * @internal
   */
  _areChildrenMaterialized(): boolean {
    return untracked(this.childrenMap) !== undefined;
  }

  private ensureChildrenMap() {
    // If we're already materialized, there's nothing to do.
    if (this._areChildrenMaterialized()) {
      return;
    }

    // We force materialization by telling the linkedSignal to re-evaluate now, but treating
    // its source value as having changed, or rather skipping the lazy fast-path.
    untracked(() => {
      (this.childrenMap as WritableSignal<ChildrenData | undefined>).update((current) =>
        this.computeChildrenMap(this.value(), current, true),
      );
    });
  }

  /** Retrieve a child `FieldNode` of this node by property key. */
  getChild(key: PropertyKey): FieldNode | undefined {
    this.ensureChildrenMap();

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
   * Creates signals for keyInParent and isOrphaned status for a field node.
   */
  protected createKeyOrOrphanSignals(
    kind: 'child' | 'root',
    identityInParent: TrackingKey | undefined,
    initialKeyInParent: string | undefined,
  ): {keyInParent: Signal<string>; isOrphaned: Signal<boolean>} {
    if (kind === 'root') {
      return {keyInParent: ROOT_KEY_IN_PARENT, isOrphaned: FALSE_SIGNAL};
    }

    const parent = this.parent!;
    let lastKnownKey = initialKeyInParent!;

    const keyOrOrphan = computed(() => {
      if (parent.structure.isOrphaned()) {
        return ORPHAN_TOKEN;
      }

      const map = parent.structure.childrenMap();
      if (!map) {
        return ORPHAN_TOKEN;
      }

      // Fast path: check last known key
      const lastKnownChild = map.byPropertyKey.get(lastKnownKey);
      if (lastKnownChild && lastKnownChild.node === this.node) {
        return lastKnownKey;
      }

      if (identityInParent === undefined) {
        // Object property: if not at last known key, it's orphaned
        return ORPHAN_TOKEN;
      } else {
        // Array element: scan for node in childrenMap
        for (const [key, child] of map.byPropertyKey) {
          if (child.node === this.node) {
            return (lastKnownKey = key);
          }
        }
        return ORPHAN_TOKEN;
      }
    });

    const isOrphaned = computed(() => keyOrOrphan() === ORPHAN_TOKEN);

    const keyInParent = computed(() => {
      const key = keyOrOrphan();
      if (key === ORPHAN_TOKEN) {
        if (identityInParent === undefined) {
          throw new RuntimeError(
            RuntimeErrorCode.ORPHAN_FIELD_PROPERTY,
            ngDevMode &&
              `Orphan field, looking for property '${initialKeyInParent}' of ${getDebugName(
                parent,
              )}`,
          );
        } else {
          throw new RuntimeError(
            RuntimeErrorCode.ORPHAN_FIELD_NOT_FOUND,
            ngDevMode && `Orphan field, can't find element in array ${getDebugName(parent)}`,
          );
        }
      }
      return key;
    });

    return {keyInParent, isOrphaned};
  }

  protected createChildrenMap(): Signal<ChildrenData | undefined> {
    return linkedSignal({
      source: this.value,
      computation: (
        value: unknown,
        previous: {source: unknown; value: ChildrenData | undefined} | undefined,
      ): ChildrenData | undefined => this.computeChildrenMap(value, previous?.value, false),
    });
  }

  private computeChildrenMap(
    value: unknown,
    prevData: ChildrenData | undefined,
    forceMaterialize: boolean,
  ): ChildrenData | undefined {
    if (!isObject(value)) {
      // Non-object values have no children. This short-circuit path makes `childrenMap` fast
      // for primitive-valued fields.
      return undefined;
    }

    // Determine if we actually need to materialize children right now.
    // If not forced, and NO child has any logic rules, we can safely return `undefined`
    // to keep instantiation lazy. However, if `prevData` is already defined, we MUST
    // NOT return `undefined` or we will orphan the already instantiated children.
    if (!forceMaterialize && prevData === undefined) {
      // Check if any child of this field has logic rules. This check only needs to run once per
      // structure since the presence of schema logic rules is static across value changes.
      if (!(this._anyChildHasLogic ??= this.logic.anyChildHasLogic())) {
        return undefined;
      }
    }

    // Previous `ChildrenData` (immutable). This is also where we first initialize our map if
    // needed.
    prevData ??= {
      byPropertyKey: new Map(),
    };

    // The next `ChildrenData` object to be returned. Initialized lazily when we know there's
    // been a structural change to the model.
    let materializedChildren: MutableChildrenData | undefined;

    const parentIsArray = isArray(value);

    // Remove fields that have disappeared since the last time this map was computed.
    if (prevData !== undefined) {
      if (parentIsArray) {
        materializedChildren = maybeRemoveStaleArrayFields(prevData, value, this.identitySymbol);
      } else {
        materializedChildren = maybeRemoveStaleObjectFields(prevData, value);
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
          materializedChildren ??= {...(prevData as MutableChildrenData)};
          materializedChildren.byPropertyKey.delete(key);
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
          materializedChildren ??= {...(prevData as MutableChildrenData)};
          materializedChildren.byTrackingKey ??= new Map();

          materializedChildren.byTrackingKey.set(
            trackingKey,
            this.createChildNode(key, trackingKey, parentIsArray),
          );
        }

        // Note: materializedChildren ?? prevData is needed because we might have freshly instantiated
        // `byTrackingKey` only in `materializedChildren` above.
        childNode = (materializedChildren ?? prevData).byTrackingKey!.get(trackingKey)!;
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
        materializedChildren ??= {...(prevData as MutableChildrenData)};

        materializedChildren.byPropertyKey.set(key, {
          // TODO: creating a computed per-key is overkill when the field at a key can't change
          // (e.g. the value is not an array). Maybe this can be optimized?
          reader: this.createReader(key),
          // If tracking is in use, then it already created/found the `childNode` for this key.
          // Otherwise we create the child field here.
          node: childNode ?? this.createChildNode(key, trackingKey, parentIsArray),
        });
      } else if (childNode && childNode !== child.node) {
        // A record exists, but records the wrong `FieldNode`. Update it.
        materializedChildren ??= {...(prevData as MutableChildrenData)};
        child.node = childNode;
      }
    }

    return materializedChildren ?? prevData;
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

  override readonly isOrphaned = FALSE_SIGNAL;

  /** @internal */
  override readonly childrenMap: Signal<ChildrenData | undefined>;

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

  override readonly isOrphaned: Signal<boolean>;

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

    const signals = this.createKeyOrOrphanSignals('child', identityInParent, initialKeyInParent);

    this.isOrphaned = signals.isOrphaned;
    this.keyInParent = signals.keyInParent;

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
    RuntimeErrorCode.ROOT_FIELD_NO_PARENT,
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
