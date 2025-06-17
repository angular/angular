/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Signal, WritableSignal} from '@angular/core';
import {AggregateProperty, Property} from '../api/property';
import type {DisabledReason, Field, FieldContext, FieldState, SubmittedStatus} from '../api/types';
import type {ValidationError} from '../api/validation_errors';
import {LogicNode} from '../logic_node_2';
import {FieldPathNode} from '../path_node';
import {FieldNodeContext} from './context';
import type {FormFieldManager} from './manager';
import {FieldPropertyState} from './property';
import {FIELD_PROXY_HANDLER} from './proxy';
import {FieldNodeState} from './state';
import {
  ChildFieldNodeOptions,
  ChildFieldNodeStructure,
  FieldNodeOptions,
  FieldNodeStructure,
  RootFieldNodeStructure,
} from './structure';
import {FieldSubmitState} from './submit';
import {FieldValidationState} from './validation';

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
  readonly validationState: FieldValidationState;
  readonly propertyState: FieldPropertyState;
  readonly nodeState: FieldNodeState;
  readonly submitState: FieldSubmitState;

  private _context: FieldContext<unknown> | undefined = undefined;

  get context(): FieldContext<unknown> {
    return (this._context ??= new FieldNodeContext(this));
  }

  /**
   * Proxy to this node which allows navigation of the form graph below it.
   */
  readonly fieldProxy = new Proxy(() => this, FIELD_PROXY_HANDLER) as unknown as Field<any>;

  private constructor(options: FieldNodeOptions) {
    this.structure =
      options.kind === 'root'
        ? new RootFieldNodeStructure(
            this,
            options.logicPath,
            options.logic,
            options.fieldManager,
            options.value,
            FieldNode.newChild,
          )
        : new ChildFieldNodeStructure(
            this,
            options.logicPath,
            options.logic,
            options.parent,
            options.identityInParent,
            options.initialKeyInParent,
            FieldNode.newChild,
          );

    this.validationState = new FieldValidationState(this);
    this.nodeState = new FieldNodeState(this);
    this.propertyState = new FieldPropertyState(this);
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

  get syncErrors(): Signal<ValidationError[]> {
    return this.validationState.syncErrors;
  }

  get syncValid(): Signal<boolean> {
    return this.validationState.syncValid;
  }

  get errors(): Signal<ValidationError[]> {
    return this.validationState.errors;
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

  get submitting(): Signal<boolean> {
    return this.submitState.submitting;
  }

  property<M>(prop: AggregateProperty<M, any>): Signal<M>;
  property<M>(prop: Property<M>): M | undefined;
  property<M>(prop: Property<M> | AggregateProperty<M, any>): Signal<M> | M | undefined {
    return this.propertyState.get(prop);
  }

  hasProperty(prop: Property<unknown> | AggregateProperty<unknown, any>): boolean {
    return this.propertyState.has(prop);
  }

  /**
   * Marks this specific field as touched.
   */
  markAsTouched(): void {
    // TODO: should this be noop for fields that are hidden/disabled/readonly
    this.nodeState.selfTouched.set(true);
  }

  /**
   * Marks this specific field as dirty.
   */
  markAsDirty(): void {
    // TODO: should this be noop for fields that are hidden/disabled/readonly
    this.nodeState.selfDirty.set(true);
  }

  /**
   * Resets the {@link touched} and {@link dirty} state of the field and its descendants.
   *
   * Note this does not change the data model, which can be reset directly if desired.
   */
  reset(): void {
    this.nodeState.selfTouched.set(false);
    this.nodeState.selfDirty.set(false);

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
    logicPath: FieldPathNode,
  ): FieldNode {
    return new FieldNode({
      kind: 'root',
      fieldManager,
      value,
      logicPath,
      logic: logicPath.logic.build(),
    });
  }

  /**
   * Creates a child field node based on the given options.
   */
  private static newChild(options: ChildFieldNodeOptions): FieldNode {
    return new FieldNode(options);
  }
}
