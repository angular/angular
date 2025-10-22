/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, type Signal, type WritableSignal} from '@angular/core';
import type {Field} from '../api/field_directive';
import {
  AggregateMetadataKey,
  MAX,
  MAX_LENGTH,
  MetadataKey,
  MIN,
  MIN_LENGTH,
  PATTERN,
  REQUIRED,
} from '../api/metadata';
import type {DisabledReason, FieldContext, FieldState, FieldTree} from '../api/types';
import type {ValidationError, ValidationErrorWithField} from '../api/validation_errors';
import {LogicNode} from '../schema/logic_node';
import {FieldPathNode} from '../schema/path_node';
import {FieldNodeContext} from './context';
import type {FieldAdapter} from './field_adapter';
import type {FormFieldManager} from './manager';
import {FieldMetadataState} from './metadata';
import {FIELD_PROXY_HANDLER} from './proxy';
import {FieldNodeState} from './state';
import {
  type ChildFieldNodeOptions,
  ChildFieldNodeStructure,
  type FieldNodeOptions,
  type FieldNodeStructure,
  RootFieldNodeStructure,
} from './structure';
import {FieldSubmitState} from './submit';
import {ValidationState} from './validation';

/**
 * Internal node in the form tree for a given field.
 *
 * Field nodes have several responsibilities:
 *  - They track instance state for the particular field (touched)
 *  - They compute signals for derived state (valid, disabled, etc) based on their associated
 *    `LogicNode`
 *  - They act as the public API for the field (they implement the `FieldState` interface)
 *  - They implement navigation of the form tree via `.parent` and `.getChild()`.
 *
 * This class is largely a wrapper that aggregates several smaller pieces that each manage a subset of
 * the responsibilities.
 */
export class FieldNode implements FieldState<unknown> {
  readonly structure: FieldNodeStructure;
  readonly validationState: ValidationState;
  readonly metadataState: FieldMetadataState;
  readonly nodeState: FieldNodeState;
  readonly submitState: FieldSubmitState;

  private _context: FieldContext<unknown> | undefined = undefined;
  readonly fieldAdapter: FieldAdapter;

  get context(): FieldContext<unknown> {
    return (this._context ??= new FieldNodeContext(this));
  }

  /**
   * Proxy to this node which allows navigation of the form graph below it.
   */
  readonly fieldProxy = new Proxy(() => this, FIELD_PROXY_HANDLER) as unknown as FieldTree<any>;

  constructor(options: FieldNodeOptions) {
    this.fieldAdapter = options.fieldAdapter;
    this.structure = this.fieldAdapter.createStructure(this, options);
    this.validationState = this.fieldAdapter.createValidationState(this, options);
    this.nodeState = this.fieldAdapter.createNodeState(this, options);
    this.metadataState = new FieldMetadataState(this);
    this.submitState = new FieldSubmitState(this);
  }

  get logicNode(): LogicNode {
    return this.structure.logic;
  }

  get value(): WritableSignal<unknown> {
    return this.structure.value;
  }

  get keyInParent(): Signal<string | number> {
    return this.structure.keyInParent;
  }

  get errors(): Signal<ValidationErrorWithField[]> {
    return this.validationState.errors;
  }

  get errorSummary(): Signal<ValidationErrorWithField[]> {
    return this.validationState.errorSummary;
  }

  get pending(): Signal<boolean> {
    return this.validationState.pending;
  }

  get valid(): Signal<boolean> {
    return this.validationState.valid;
  }

  get invalid(): Signal<boolean> {
    return this.validationState.invalid;
  }

  get dirty(): Signal<boolean> {
    return this.nodeState.dirty;
  }

  get touched(): Signal<boolean> {
    return this.nodeState.touched;
  }

  get disabled(): Signal<boolean> {
    return this.nodeState.disabled;
  }

  get disabledReasons(): Signal<readonly DisabledReason[]> {
    return this.nodeState.disabledReasons;
  }

  get hidden(): Signal<boolean> {
    return this.nodeState.hidden;
  }

  get readonly(): Signal<boolean> {
    return this.nodeState.readonly;
  }

  get fieldBindings(): Signal<readonly Field<unknown>[]> {
    return this.nodeState.fieldBindings;
  }

  get submitting(): Signal<boolean> {
    return this.submitState.submitting;
  }

  get name(): Signal<string> {
    return this.nodeState.name;
  }

  private metadataOrUndefined<M>(key: AggregateMetadataKey<M, any>): Signal<M> | undefined {
    return this.hasMetadata(key) ? this.metadata(key) : undefined;
  }

  get max(): Signal<number | undefined> | undefined {
    return this.metadataOrUndefined(MAX);
  }

  get maxLength(): Signal<number | undefined> | undefined {
    return this.metadataOrUndefined(MAX_LENGTH);
  }

  get min(): Signal<number | undefined> | undefined {
    return this.metadataOrUndefined(MIN);
  }

  get minLength(): Signal<number | undefined> | undefined {
    return this.metadataOrUndefined(MIN_LENGTH);
  }

  get pattern(): Signal<readonly RegExp[]> {
    return this.metadataOrUndefined(PATTERN) ?? EMPTY;
  }

  get required(): Signal<boolean> {
    return this.metadataOrUndefined(REQUIRED) ?? FALSE;
  }

  metadata<M>(key: AggregateMetadataKey<M, any>): Signal<M>;
  metadata<M>(key: MetadataKey<M>): M | undefined;
  metadata<M>(key: MetadataKey<M> | AggregateMetadataKey<M, any>): Signal<M> | M | undefined {
    return this.metadataState.get(key);
  }
  hasMetadata(key: MetadataKey<any> | AggregateMetadataKey<any, any>): boolean {
    return this.metadataState.has(key);
  }

  /**
   * Marks this specific field as touched.
   */
  markAsTouched(): void {
    this.nodeState.markAsTouched();
  }

  /**
   * Marks this specific field as dirty.
   */
  markAsDirty(): void {
    this.nodeState.markAsDirty();
  }

  /**
   * Resets the {@link touched} and {@link dirty} state of the field and its descendants.
   *
   * Note this does not change the data model, which can be reset directly if desired.
   */
  reset(): void {
    this.nodeState.markAsUntouched();
    this.nodeState.markAsPristine();

    for (const child of this.structure.children()) {
      child.reset();
    }
  }

  /**
   * Creates a new root field node for a new form.
   */
  static newRoot<T>(
    fieldManager: FormFieldManager,
    value: WritableSignal<T>,
    pathNode: FieldPathNode,
    adapter: FieldAdapter,
  ): FieldNode {
    return adapter.newRoot(fieldManager, value, pathNode, adapter);
  }

  /**
   * Creates a child field node based on the given options.
   */
  private static newChild(options: ChildFieldNodeOptions): FieldNode {
    return options.fieldAdapter.newChild(options);
  }

  createStructure(options: FieldNodeOptions) {
    return options.kind === 'root'
      ? new RootFieldNodeStructure(
          this,
          options.pathNode,
          options.logic,
          options.fieldManager,
          options.value,
          options.fieldAdapter,
          FieldNode.newChild,
        )
      : new ChildFieldNodeStructure(
          this,
          options.pathNode,
          options.logic,
          options.parent,
          options.identityInParent,
          options.initialKeyInParent,
          options.fieldAdapter,
          FieldNode.newChild,
        );
  }
}

const EMPTY = computed(() => []);
const FALSE = computed(() => false);

/**
 * Field node of a field that has children.
 * This simplifies and makes certain types cleaner.
 */
export interface ParentFieldNode extends FieldNode {
  readonly value: WritableSignal<Record<string, unknown>>;
  readonly structure: FieldNodeStructure & {value: WritableSignal<Record<string, unknown>>};
}
