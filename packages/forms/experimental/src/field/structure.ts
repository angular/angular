/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  computed,
  DestroyableInjector,
  Injector,
  linkedSignal,
  Signal,
  WritableSignal,
} from '@angular/core';

import {DYNAMIC} from '../logic_node';
import {LogicNode} from '../logic_node_2';
import type {FieldPathNode} from '../path_node';
import {deepSignal} from '../util/deep_signal';
import type {FormFieldManager} from './manager';
import type {FieldNode} from './node';

export interface DataEntry {
  value: unknown;
  destroy: () => void;
}

/**
 * Key by which a parent `FieldNode` tracks its children.
 *
 * Often this is the actual property key of the child, but in the case of arrays it could be a
 * tracking key allocated for the object.
 */
export type TrackingKey = PropertyKey & {__brand: 'FieldIdentity'};

/**
 * Structural component of a `FieldNode` which tracks its path, parent, children
 */
export abstract class FieldNodeStructure {
  /**
   * Computed map of child fields, based on the current value of this field.
   */
  abstract readonly childrenMap: Signal<Map<TrackingKey, FieldNode> | undefined>;
  abstract readonly value: WritableSignal<unknown>;
  abstract readonly keyInParent: Signal<string>;
  abstract readonly fieldManager: FormFieldManager;
  abstract readonly root: FieldNode;
  abstract readonly pathKeys: Signal<readonly PropertyKey[]>;
  abstract readonly parent: FieldNode | undefined;

  /**
   * Added to array elements for tracking purposes.
   */
  readonly identitySymbol = Symbol();

  /**
   * Lazily initialized injector.
   */
  private _injector: DestroyableInjector | undefined = undefined;

  get injector(): DestroyableInjector {
    this._injector ??= Injector.create({
      providers: [],
      parent: this.fieldManager.injector,
    }) as DestroyableInjector;
    return this._injector;
  }

  constructor(
    readonly logicPath: FieldPathNode,
    readonly logic: LogicNode,
  ) {}

  children(): Iterable<FieldNode> {
    return this.childrenMap()?.values() ?? [];
  }

  /**
   * Retrieve a child `FieldNode` of this node by property key.
   */
  getChild(key: PropertyKey): FieldNode | undefined {
    const map = this.childrenMap();
    const value = this.value();
    if (!map || !isObject(value)) {
      return undefined;
    }

    if (Array.isArray(value)) {
      const childValue = value[key];
      if (isObject(childValue) && childValue.hasOwnProperty(this.identitySymbol)) {
        // For arrays, we want to use the tracking identity of the value instead of the raw property
        // as our index into the `childrenMap`.
        key = childValue[this.identitySymbol] as PropertyKey;
      }
    }

    return map.get((typeof key === 'number' ? key.toString() : key) as TrackingKey);
  }

  destroy(): void {
    this.injector.destroy();
  }
}

/**
 * Base type for `FieldNode` which handles the structural aspects of the node:
 *
 * - path determination
 * - projection & tracking of child nodes
 * -
 */
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

  constructor(
    private readonly node: FieldNode,
    logicPath: FieldPathNode,
    logic: LogicNode,
    readonly fieldManager: FormFieldManager,
    readonly value: WritableSignal<unknown>,
    createChildNode: (options: ChildFieldNodeOptions) => FieldNode,
  ) {
    super(logicPath, logic);
    this.childrenMap = makeChildrenMapSignal(
      node,
      value,
      this.identitySymbol,
      this.logicPath,
      this.logic,
      createChildNode,
    );
  }
}

export class ChildFieldNodeStructure extends FieldNodeStructure {
  override readonly root: FieldNode;
  override readonly pathKeys: Signal<readonly PropertyKey[]>;
  override readonly keyInParent: Signal<string>;
  override readonly value: WritableSignal<unknown>;

  override readonly childrenMap: Signal<Map<TrackingKey, FieldNode> | undefined>;

  override get fieldManager(): FormFieldManager {
    return this.root.structure.fieldManager;
  }

  constructor(
    node: FieldNode,
    logicPath: FieldPathNode,
    logic: LogicNode,
    readonly parent: FieldNode,
    identityInParent: TrackingKey | undefined,
    initialKeyInParent: string,
    createChildNode: (options: ChildFieldNodeOptions) => FieldNode,
  ) {
    super(logicPath, logic);

    this.root = this.parent.structure.root;

    this.pathKeys = computed(() => [...parent.structure.pathKeys(), this.keyInParent()]);

    if (identityInParent === undefined) {
      const key = initialKeyInParent;
      this.keyInParent = computed(() => {
        if (parent.structure.childrenMap()?.get(key as TrackingKey) !== node) {
          throw new Error(`RuntimeError: orphan field`);
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
        if (!Array.isArray(parentValue)) {
          // The parent is no longer an array?
          throw new Error(`RuntimeError: orphan field`);
        }

        // Check the parent value at the last known key to avoid a scan.
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

        throw new Error(`RuntimeError: orphan field`);
      });
    }

    this.value = deepSignal(this.parent.structure.value, this.keyInParent as Signal<never>);
    this.childrenMap = makeChildrenMapSignal(
      node,
      this.value,
      this.identitySymbol,
      this.logicPath,
      this.logic,
      createChildNode,
    );

    this.fieldManager.structures.add(this);
  }
}

function isObject(data: unknown): data is Record<PropertyKey, unknown> {
  return typeof data === 'object';
}

let globalId = 0;

export interface RootFieldNodeOptions {
  readonly kind: 'root';
  readonly logicPath: FieldPathNode;
  readonly logic: LogicNode;
  readonly value: WritableSignal<unknown>;
  readonly fieldManager: FormFieldManager;
}

export interface ChildFieldNodeOptions {
  readonly kind: 'child';
  readonly parent: FieldNode;
  readonly logicPath: FieldPathNode;
  readonly logic: LogicNode;
  readonly initialKeyInParent: string;
  readonly identityInParent: TrackingKey | undefined;
}

export type FieldNodeOptions = RootFieldNodeOptions | ChildFieldNodeOptions;

const ROOT_PATH_KEYS = computed<readonly PropertyKey[]>(() => []);
const ROOT_KEY_IN_PARENT = computed(() => {
  throw new Error(`RuntimeError: the top-level field in the form has no parent`);
});

function makeChildrenMapSignal(
  node: FieldNode,
  valueSignal: WritableSignal<unknown>,
  identitySymbol: symbol,
  logicPath: FieldPathNode,
  logic: LogicNode,
  createChildNode: (options: ChildFieldNodeOptions) => FieldNode,
): Signal<Map<TrackingKey, FieldNode> | undefined> {
  // We use a `linkedSignal` to preserve the instances of `FieldNode` for each child field even if
  // the value of this field changes its object identity. The computation creates or updates the map
  // of child `FieldNode`s for `node` based on its current value.
  return linkedSignal<unknown, Map<TrackingKey, FieldNode> | undefined>({
    source: valueSignal,
    computation: (value, previous): Map<TrackingKey, FieldNode> | undefined => {
      const prevMap = previous?.value;
      // We may or may not have a previous map. If there isn't one, then `childrenMap` will be lazily
      // initialized to a new map instance if needed.
      let childrenMap = prevMap;

      if (!isObject(value)) {
        // Non-object values have no children.
        return undefined;
      }
      const isArray = Array.isArray(value);

      // Remove fields that have disappeared since the last time this map was computed.
      if (childrenMap !== undefined) {
        let oldKeys: Set<TrackingKey> | undefined = undefined;
        if (isArray) {
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

        if (isArray && isObject(childValue)) {
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
        if (isArray) {
          // Fields for array elements have their logic defined by the `element` mechanism.
          // TODO: other dynamic data
          childPath = logicPath.getChild(DYNAMIC);
          childLogic = logic.getChild(DYNAMIC);
        } else {
          // Fields for plain properties exist in our logic node's child map.
          childPath = logicPath.getChild(key);
          childLogic = logic.getChild(key);
        }

        childrenMap ??= new Map<TrackingKey, FieldNode>();
        childrenMap.set(
          identity,
          createChildNode({
            kind: 'child',
            parent: node,
            logicPath: childPath,
            logic: childLogic,
            initialKeyInParent: key,
            identityInParent: trackingId,
          }),
        );
      }

      return childrenMap;
    },
    equal: () => false,
  });
}
