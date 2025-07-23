/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  computed,
  effect,
  Injector,
  linkedSignal,
  runInInjectionContext,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {MetadataKey} from './api/metadata';
import type {
  Field,
  FieldContext,
  FieldPath,
  FieldState,
  FormError,
  SubmittedStatus,
  ValidationResult,
} from './api/types';
import {DYNAMIC, FieldLogicNode} from './logic_node';
import {FieldPathNode, FieldRootPathNode} from './path_node';
import {deepSignal} from './util/deep_signal';
import {DataKey} from './api/data';

export interface DataEntry {
  value: unknown;
  destroy: () => void;
}

export class FormFieldManager {
  constructor(readonly injector: Injector) {}
  readonly nodes = new Set<FieldNode>();

  createFieldManagementEffect(root: FieldNode): void {
    effect(
      () => {
        const liveNodes = new Set<FieldNode>();
        this.markFieldsLive(root, liveNodes);

        // Destroy all nodes that are no longer live.
        for (const node of this.nodes) {
          if (!liveNodes.has(node)) {
            this.nodes.delete(node);
            untracked(() => node.destroy());
          }
        }
      },
      {injector: this.injector},
    );
  }

  private markFieldsLive(field: FieldNode, liveNodes: Set<FieldNode>): void {
    liveNodes.add(field);
    for (const child of field.children()) {
      this.markFieldsLive(child, liveNodes);
    }
  }
}

type DestroyableInjector = Injector & {destroy(): void};

/**
 * Internal node in the form graph for a given field.
 *
 * Field nodes have several responsibilities:
 *  - they track instance state for the particular field (touched)
 *  - they compute signals for derived state (valid, disabled, etc) based on their associated
 *    `LogicNode`
 *  - they act as the public API for the field (they implement the `FieldState` interface)
 *  - they implement navigation of the form graph via `.parent` and `.getChild()`.
 */
export class FieldNode implements FieldState<unknown> {
  /**
   * Whether this specific field has been touched.
   */
  private _touched = signal(false);
  private _submittedStatus = signal<SubmittedStatus>('unsubmitted');

  /**
   * Computed map of child fields, based on the current value of this field.
   */
  private readonly childrenMap: Signal<Map<PropertyKey, FieldNode> | undefined>;

  private serverErrors: WritableSignal<ValidationResult>;

  private readonly dataMap = new Map<DataKey<unknown>, unknown>();
  private readonly metadataMap = new Map<MetadataKey<unknown>, Signal<unknown>>();
  private readonly dataMaps = computed(() => {
    const maps = [this.dataMap];
    for (const child of this.childrenMap()?.values() ?? []) {
      maps.push(...child.dataMaps());
    }
    return maps;
  });

  /**
   * Lazily initialized injector.
   */
  private _injector: DestroyableInjector | undefined = undefined;

  private get injector(): DestroyableInjector {
    this._injector ??= Injector.create({
      providers: [],
      parent: this.fieldManager.injector,
    }) as DestroyableInjector;
    return this._injector;
  }

  /**
   * Lazily initialized value of `logicArgument`.
   */
  private _fieldContext: FieldContext<unknown> | undefined = undefined;

  /**
   * Value of the "context" argument passed to all logic functions, which supports e.g. resolving
   * paths in relation to this field.
   */
  get fieldContext(): FieldContext<unknown> {
    return (this._fieldContext ??= {
      value: this.value,
      resolve: <U>(target: FieldPath<U>): Field<U> => {
        const currentPathKeys = this.pathKeys;
        const targetPathNode = FieldPathNode.unwrapFieldPath(target);

        if (!(this.root.logicPath instanceof FieldRootPathNode)) {
          throw Error('Expected root of FieldNode tree to have a FieldRootPathNode.');
        }
        const prefix = this.root.logicPath.subroots.get(targetPathNode.root);
        if (!prefix) {
          throw Error('Path is not part of this field tree.');
        }

        const targetPathKeys = [...prefix, ...targetPathNode.keys];

        // Navigate from `currentPath` to `targetPath`. As an example, suppose that:
        // currentPath = [A, B, C, D]
        // targetPath = [A, B, X, Y, Z]

        // Firstly, find the length of the shared prefix between the two paths. In our example, this
        // is the prefix [A, B], so we would expect a `sharedPrefixLength` of 2.
        const sharedPrefixLength = lengthOfSharedPrefix(currentPathKeys, targetPathNode.keys);

        // Walk up the graph until we arrive at the common ancestor, which could be the root node if
        // there is no shared prefix. In our example, this will require 2 up steps, navigating from
        // D to B.
        let requiredUpSteps = currentPathKeys.length - sharedPrefixLength;
        let field: FieldNode = this;
        while (requiredUpSteps-- > 0) {
          field = field.parent!;
        }

        // Now, we can navigate from the closest ancestor to the target, e.g. from B through X, Y,
        // and then to Z.
        for (let idx = sharedPrefixLength; idx < targetPathKeys.length; idx++) {
          const property =
            targetPathKeys[idx] === DYNAMIC ? currentPathKeys[idx] : targetPathKeys[idx];
          field = field.getChild(property)!;
        }

        return field.fieldProxy as Field<U>;
      },

      data: <D>(key: DataKey<D>): D => {
        const result = this.data(key);
        if (result === undefined) {
          throw new Error(`No value for data on field`);
        }
        return result;
      },
    });
  }

  private readonly root: FieldNode;

  private readonly pathKeys: PropertyKey[];

  private logic: FieldLogicNode;

  private constructor(
    private readonly fieldManager: FormFieldManager,
    readonly value: WritableSignal<unknown>,
    private readonly logicPath: FieldPathNode,
    readonly parent: FieldNode | undefined,
    readonly keyInParent: PropertyKey | undefined,
  ) {
    this.fieldManager.nodes.add(this);
    this.logic = logicPath.logic;

    if (parent !== undefined && keyInParent !== undefined) {
      this.root = parent.root;
      this.pathKeys = [...parent.pathKeys, keyInParent];
    } else {
      this.root = this;
      this.pathKeys = [];
    }

    // We use a `linkedSignal` to preserve the instances of `FieldNode` for each child field even if
    // the value of this field changes its object identity.
    this.childrenMap = linkedSignal<unknown, Map<PropertyKey, FieldNode> | undefined>({
      source: this.value,
      computation: (data, previous) => this.computeChildrenMap(data, previous?.value),
      equal: () => false,
    });

    this.serverErrors = linkedSignal<ValidationResult>(() => {
      this.value();
      return [] as ValidationResult;
    });

    // Instantiate data dependencies.
    if (this.logic.dataFactories.size > 0) {
      untracked(() =>
        runInInjectionContext(this.injector, () => {
          for (const [key, factory] of this.logic.dataFactories) {
            this.dataMap.set(key, factory(this.fieldContext));
          }
        }),
      );
    }
  }

  /**
   * Whether this field is considered touched.
   *
   * This field considers itself touched if one of the following are true:
   *  - it was directly touched
   *  - one of its children is considered touched
   */
  readonly touched: Signal<boolean> = computed(() =>
    this.reduceChildren(
      this._touched(),
      (child, value) => value || child.touched(),
      shortCircuitTrue,
    ),
  );

  setServerErrors(errors: ValidationResult) {
    this.serverErrors.set(errors);
  }

  setSubmittedStatus(status: SubmittedStatus) {
    this._submittedStatus.set(status);
  }

  /**
   * Whether this field is considered valid.
   *
   * This field considers itself valid if *all* of the following are true:
   *  - it has no errors
   *  - all of its children consider themselves valid
   */
  readonly valid: Signal<boolean> = computed(() => {
    // Short-circuit checking children if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return true;
    }
    return this.reduceChildren(
      this.errors().length === 0,
      (child, value) => value && child.valid(),
      shortCircuitFalse,
    );
  });

  /**
   * Whether this field is considered disabled.
   *
   * This field considers itself disabled if its parent is disabled or its own logic considers it
   * disabled.
   */
  readonly disabled: Signal<boolean> = computed(
    () => (this.parent?.disabled() || this.logic.disabled.compute(this.fieldContext)) ?? false,
  );

  /**
   * The submitted status of the form.
   */
  readonly submittedStatus: Signal<SubmittedStatus> = computed(() =>
    this._submittedStatus() !== 'unsubmitted'
      ? this._submittedStatus()
      : (this.parent?.submittedStatus() ?? 'unsubmitted'),
  );

  /**
   * Whether this field is considered hidden.
   *
   * This field considers itself hidden if its parent is hidden or its own logic considers it
   * hidden.
   */
  readonly hidden: Signal<boolean> = computed(
    () => (this.parent?.hidden() || this.logic.hidden.compute(this.fieldContext)) ?? false,
  );

  /**
   * Validation errors for this field.
   *
   * Computing this runs validators.
   */
  readonly errors: Signal<FormError[]> = computed(() => {
    // Short-circuit running validators if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      ...(this.logic.errors.compute(this.fieldContext) ?? []),
      ...normalizeErrors(this.serverErrors()),
    ];
  });

  children(): Iterable<FieldNode> {
    return this.childrenMap()?.values() ?? [];
  }

  data<D>(key: DataKey<D>): D | undefined {
    return this.dataMap.get(key) as D | undefined;
  }

  metadata<M>(key: MetadataKey<M>): Signal<M> {
    cast<MetadataKey<unknown>>(key);
    if (!this.metadataMap.has(key)) {
      const logic = this.logic.getMetadata(key);
      const result = computed(() => logic.compute(this.fieldContext));
      this.metadataMap.set(key, result);
    }
    return this.metadataMap.get(key)! as Signal<M>;
  }

  /**
   * Proxy to this node which allows navigation of the form graph below it.
   */
  readonly fieldProxy = new Proxy(this, FIELD_PROXY_HANDLER) as unknown as Field<any>;

  /**
   * Resets the submitted status of this field and all of its children.
   */
  resetSubmittedStatus(): void {
    this._submittedStatus.set('unsubmitted');
    for (const child of this.childrenMap()?.values() ?? []) {
      child.resetSubmittedStatus();
    }
  }

  /**
   * Marks this specific field as touched.
   */
  markAsTouched(): void {
    this._touched.set(true);
  }

  /**
   * Retrieve a child `FieldNode` of this node by property key.
   */
  getChild(key: PropertyKey): FieldNode | undefined {
    return this.childrenMap()?.get(typeof key === 'number' ? key.toString() : key);
  }

  /**
   * Whether validation should be skipped for this field.
   *
   * Defined in terms of other conditions based on the field logic.
   */
  private shouldSkipValidation(): boolean {
    return this.hidden() || this.disabled();
  }

  /**
   * Perform a reduction over this field's children (if any) and return the result.
   *
   * Optionally, the reduction is short circuited based on the provided `shortCircuit` function.
   */
  private reduceChildren<T>(
    initialValue: T,
    fn: (child: FieldNode, value: T) => T,
    shortCircuit?: (value: T) => boolean,
  ): T {
    const childrenMap = this.childrenMap();
    if (!childrenMap) {
      return initialValue;
    }
    let value = initialValue;
    for (const child of childrenMap.values()) {
      if (shortCircuit?.(value)) {
        break;
      }
      value = fn(child, value);
    }
    return value;
  }

  destroy(): void {
    this.injector.destroy();
  }

  /**
   * Creates or updates the map of child `FieldNode`s for this node based on its current value.
   */
  private computeChildrenMap(
    value: unknown,
    prevMap: Map<PropertyKey, FieldNode> | undefined,
  ): Map<PropertyKey, FieldNode> | undefined {
    // We may or may not have a previous map. If there isn't one, then `childrenMap` will be lazily
    // initialized to a new map instance if needed.
    let childrenMap = prevMap;

    if (!isObject(value)) {
      // Non-object values have no children.
      return undefined;
    }

    // Remove fields that have disappeared since the last time this map was computed.
    if (childrenMap !== undefined) {
      for (const key of childrenMap.keys()) {
        if (!value.hasOwnProperty(key)) {
          childrenMap.delete(key);
        }
      }
    }

    // Add fields that exist in the value but don't yet have instances in the map.
    for (const key of Object.keys(value)) {
      if (childrenMap?.has(key)) {
        continue;
      }

      // Determine the logic for the field that we're defining.
      let childPath: FieldPathNode | undefined;
      if (Array.isArray(value)) {
        // Fields for array elements have their logic defined by the `element` mechanism.
        // TODO: other dynamic data
        childPath = this.logicPath.getChild(DYNAMIC);
      } else {
        // Fields for plain properties exist in our logic node's child map.
        childPath = this.logicPath.getChild(key);
      }
      childrenMap ??= new Map<PropertyKey, FieldNode>();
      childrenMap.set(
        key,
        new FieldNode(
          this.fieldManager,
          deepSignal(this.value, key as never),
          childPath,
          this,
          key,
        ),
      );
    }

    return childrenMap;
  }

  static newRoot<T>(
    formRoot: FormFieldManager,
    value: WritableSignal<T>,
    path: FieldPathNode,
  ): FieldNode {
    return new FieldNode(formRoot, value, path, undefined, undefined);
  }
}

function isObject(data: unknown): data is Record<PropertyKey, unknown> {
  return typeof data === 'object';
}

function shortCircuitFalse(value: boolean): boolean {
  return !value;
}

function shortCircuitTrue(value: boolean): boolean {
  return value;
}

function normalizeErrors(error: ValidationResult): FormError[] {
  if (error === undefined) {
    return [];
  }

  if (Array.isArray(error)) {
    return error;
  }

  return [error];
}

/**
 * Proxy handler which implements `Field<T>` on top of `FieldNode`.
 */
const FIELD_PROXY_HANDLER: ProxyHandler<FieldNode> = {
  get(tgt: FieldNode, p: string | symbol) {
    // From a `Field<T>`, developers can navigate to `FieldState<T>` via the special `$state` property.
    if (p === '$state') {
      return tgt;
    }

    // First, check whether the requested property is a defined child node of this node.
    const child = tgt.getChild(p);
    if (child !== undefined) {
      // If so, return the child node's `Field` proxy, allowing the developer to continue navigating
      // the form structure.
      return child.fieldProxy;
    }

    // Otherwise, we need to consider whether the properties they're accessing are related to array
    // iteration. We're specifically interested in `length`, but we only want to pass this through
    // if the value is actually an array.
    //
    // We untrack the value here to avoid spurious reactive notifications. In reality, we've already
    // incurred a dependency on the value via `tgt.getChild()` above.
    const value = untracked(tgt.value);

    // TODO: does it make sense to just pass these through to reads of `value[p]` at this point?
    if (Array.isArray(value)) {
      switch (p) {
        case 'length':
          return (tgt.value() as Array<unknown>).length;
        default:
          // Other array properties are interpreted as references to array functions, and read off
          // of the prototype.
          // TODO: it would be slightly more correct to reference the actual prototype of `value`.
          return (Array.prototype as any)[p];
      }
    }

    // Otherwise, this property doesn't exist.
    return undefined;
  },
};

function lengthOfSharedPrefix(currentPath: PropertyKey[], targetPath: PropertyKey[]): number {
  const minLength = Math.min(targetPath.length, currentPath.length);
  let sharedPrefixLength = 0;
  while (
    sharedPrefixLength < minLength &&
    targetPath[sharedPrefixLength] === currentPath[sharedPrefixLength]
  ) {
    sharedPrefixLength++;
  }
  return sharedPrefixLength;
}

function cast<T>(value: unknown): asserts value is T {}
