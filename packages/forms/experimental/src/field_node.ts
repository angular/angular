/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, linkedSignal, Signal, signal, untracked, WritableSignal} from '@angular/core';
import type {
  Form,
  FormError,
  FormField,
  FormLogicContext,
  FormPath,
  SubmittedStatus,
  ValidationResult,
} from './api/types';
import {FormLogic, MetadataKey} from './logic_node';
import {FormPathImpl} from './path_node';
import {deepSignal} from './util/deep_signal';

/**
 * Internal node in the form graph for a given field.
 *
 * Field nodes have several responsibilities:
 *  - they track instance state for the particular field (touched)
 *  - they compute signals for derived state (valid, disabled, etc) based on their associated
 *    `LogicNode`
 *  - they act as the public API for the field (they implement the `FormField` interface)
 *  - they implement navigation of the form graph via `.parent` and `.getChild()`.
 */
export class FormFieldImpl implements FormField<unknown> {
  /**
   * Whether this specific field has been touched.
   */
  private _touched = signal(false);
  private _submittedStatus = signal<SubmittedStatus>('unsubmitted');

  /**
   * Computed map of child fields, based on the current value of this field.
   */
  private readonly childrenMap: Signal<Map<PropertyKey, FormFieldImpl> | undefined>;
  private serverErrors: WritableSignal<ValidationResult>;

  /**
   * Lazily initialized value of `logicArgument`.
   */
  private _logicArgument: FormLogicContext<unknown> | undefined = undefined;

  /**
   * Value of the "context" argument passed to all logic functions, which supports e.g. resolving
   * paths in relation to this field.
   */
  get logicArgument(): FormLogicContext<unknown> {
    return (this._logicArgument ??= {
      value: this.value,
      resolve: <U>(target: FormPath<U>): Form<U> => {
        const currentPath = this.logic.pathParts;
        const targetPath = FormPathImpl.extractFromPath(target).logic.pathParts;

        // Navigate from `currentPath` to `targetPath`. As an example, suppose that:
        // currentPath = [A, B, C, D]
        // targetPath = [A, B, X, Y, Z]

        // Firstly, find the length of the shared prefix between the two paths. In our example, this
        // is the prefix [A, B], so we would expect a `sharedPrefixLength` of 2.
        const sharedPrefixLength = lengthOfSharedPrefix(currentPath, targetPath);

        // Walk up the graph until we arrive at the common ancestor, which could be the root node if
        // there is no shared prefix. In our example, this will require 2 up steps, navigating from
        // D to B.
        let requiredUpSteps = currentPath.length - sharedPrefixLength;
        let field: FormFieldImpl = this;
        while (requiredUpSteps-- > 0) {
          field = field.parent!;
        }

        // Now, we can navigate from the closest ancestor to the target, e.g. from B through X, Y,
        // and then to Z.
        for (let idx = sharedPrefixLength; idx < targetPath.length; idx++) {
          field = field.getChild(targetPath[idx])!;
        }

        return field.formFieldProxy as Form<U>;
      },
    });
  }

  private constructor(
    readonly value: WritableSignal<unknown>,
    private readonly logic: FormLogic,
    readonly parent: FormFieldImpl | undefined,
  ) {
    // We use a `linkedSignal` to preserve the instances of `FieldNode` for each child field even if
    // the value of this field changes its object identity.
    this.childrenMap = linkedSignal<unknown, Map<PropertyKey, FormFieldImpl> | undefined>({
      source: this.value,
      computation: (data, previous) => this.computeChildrenMap(data, previous?.value),
      equal: () => false,
    });

    this.serverErrors = linkedSignal<ValidationResult>(() => {
      this.value();
      return [] as ValidationResult;
    });
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
    () => (this.parent?.disabled() || this.logic.disabled.compute(this.logicArgument)) ?? false,
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
    () => (this.parent?.hidden() || this.logic.hidden.compute(this.logicArgument)) ?? false,
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
      ...(this.logic.errors.compute(this.logicArgument) ?? []),
      ...normalizeErrors(this.serverErrors()),
    ];
  });

  metadata<M>(key: MetadataKey<M>): M {
    // TODO: make this computed()
    return this.logic.readMetadata(key, this.logicArgument) ?? key.defaultValue;
  }

  /**
   * Proxy to this node which allows navigation of the form graph below it.
   */
  readonly formFieldProxy = new Proxy(this, FORM_PROXY_HANDLER) as unknown as Form<any>;

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
  getChild(key: PropertyKey): FormFieldImpl | undefined {
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
    fn: (child: FormFieldImpl, value: T) => T,
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

  /**
   * Creates or updates the map of child `FieldNode`s for this node based on its current value.
   */
  private computeChildrenMap(
    value: unknown,
    prevMap: Map<PropertyKey, FormFieldImpl> | undefined,
  ): Map<PropertyKey, FormFieldImpl> | undefined {
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
      let childLogic: FormLogic | undefined;
      if (Array.isArray(value)) {
        // Fields for array elements have their logic defined by the `element` mechanism.
        // TODO: other dynamic data
        childLogic = this.logic.element;
      } else {
        // Fields for plain properties exist in our logic node's child map.
        childLogic = this.logic.getChild(key);
      }
      childrenMap ??= new Map<PropertyKey, FormFieldImpl>();
      childrenMap.set(
        key,
        new FormFieldImpl(deepSignal(this.value, key as never), childLogic, this),
      );
    }

    return childrenMap;
  }

  static newRoot<T>(value: WritableSignal<T>, logic: FormLogic): FormFieldImpl {
    return new FormFieldImpl(value, logic, undefined);
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
 * Proxy handler which implements `Form<T>` on top of `FieldNode`.
 */
const FORM_PROXY_HANDLER: ProxyHandler<FormFieldImpl> = {
  get(tgt: FormFieldImpl, p: string | symbol) {
    // From a `Form<T>`, developers can navigate to `FormControl<T>` via the special `$api` property.
    if (p === '$api') {
      return tgt;
    }

    // First, check whether the requested property is a defined child node of this node.
    const child = tgt.getChild(p);
    if (child !== undefined) {
      // If so, return the child node's `Form` proxy, allowing the developer to continue navigating
      // the form structure.
      return child.formFieldProxy;
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
