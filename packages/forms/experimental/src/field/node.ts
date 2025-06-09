/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {Signal, WritableSignal} from '@angular/core';
import type {DataKey} from '../api/data';
import type {MetadataKey} from '../api/metadata';
import type {
  DisabledReason,
  Field,
  FieldContext,
  FieldState,
  FormError,
  SubmittedStatus,
} from '../api/types';
import type {FieldPathNode} from '../path_node';

import {
  ChildFieldNodeOptions,
  ChildFieldNodeStructure,
  FieldNodeOptions,
  FieldNodeStructure,
  RootFieldNodeStructure,
} from './structure';

import {FieldValidationState} from './validation';
import {FieldNodeContext} from './context';
import type {FormFieldManager} from './manager';
import {FieldLogicNode} from '../logic_node';
import {FIELD_PROXY_HANDLER} from './proxy';
import {FieldDataState} from './data';
import {FieldNodeState} from './state';
import {FieldMetadataState} from './metadata';
import {FieldSubmitState} from './submit';

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
  readonly structure: FieldNodeStructure;
  readonly validationState: FieldValidationState;
  readonly dataState: FieldDataState;
  readonly nodeState: FieldNodeState;
  readonly metadataState: FieldMetadataState;
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
            options.fieldManager,
            options.value,
            FieldNode.newChild,
          )
        : new ChildFieldNodeStructure(
            this,
            options.logicPath,
            options.parent,
            options.identityInParent,
            options.initialKeyInParent,
            FieldNode.newChild,
          );

    this.validationState = new FieldValidationState(this);
    this.nodeState = new FieldNodeState(this);
    this.dataState = new FieldDataState(this);
    this.metadataState = new FieldMetadataState(this);
    this.submitState = new FieldSubmitState(this);
  }

  get logic(): FieldLogicNode {
    return this.structure.logicPath.logic;
  }

  get value(): WritableSignal<unknown> {
    return this.structure.value;
  }

  get keyInParent(): Signal<string | number> {
    return this.structure.keyInParent;
  }

  get syncErrors(): Signal<FormError[]> {
    return this.validationState.syncErrors;
  }

  get syncValid(): Signal<boolean> {
    return this.validationState.syncValid;
  }

  get errors(): Signal<FormError[]> {
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

  get submittedStatus(): Signal<SubmittedStatus> {
    return this.submitState.submittedStatus;
  }

  data<D>(key: DataKey<D>): D | undefined {
    return this.dataState.get(key);
  }

  metadata<M>(key: MetadataKey<M>): Signal<M> {
    return this.metadataState.get(key);
  }

  /**
   * Resets the submitted status of this field and all of its children.
   */
  resetSubmittedStatus(): void {
    this.submitState.reset();
  }

  /**
   * Marks this specific field as touched.
   */
  markAsTouched(): void {
    this.nodeState.selfTouched.set(true);
  }

  /**
   * Marks this specific field as dirty.
   */
  markAsDirty(): void {
    this.nodeState.selfDirty.set(true);
  }

  static newRoot<T>(
    formRoot: FormFieldManager,
    value: WritableSignal<T>,
    logicPath: FieldPathNode,
  ): FieldNode {
    return new FieldNode({
      kind: 'root',
      fieldManager: formRoot,
      value,
      logicPath,
    });
  }

  private static newChild(options: ChildFieldNodeOptions): FieldNode {
    return new FieldNode(options);
  }
}
