/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, linkedSignal, type Signal, untracked, type WritableSignal} from '@angular/core';
import type {FormField} from '../directive/form_field_directive';
import {
  MAX,
  MAX_LENGTH,
  type MetadataKey,
  MIN,
  MIN_LENGTH,
  PATTERN,
  REQUIRED,
} from '../api/rules/metadata';
import type {ValidationError} from '../api/rules/validation/validation_errors';
import type {DisabledReason, FieldContext, FieldState, FieldTree} from '../api/types';
import {DYNAMIC} from '../schema/logic';
import {LogicNode} from '../schema/logic_node';
import {FieldPathNode} from '../schema/path_node';
import {FieldNodeContext} from './context';
import type {FieldAdapter} from './field_adapter';
import type {FormFieldManager} from './manager';
import {FieldMetadataState} from './metadata';
import {FIELD_PROXY_HANDLER} from './proxy';
import {FieldNodeState} from './state';
import {
  ChildFieldNodeStructure,
  type FieldNodeOptions,
  type FieldNodeStructure,
  RootFieldNodeStructure,
  type TrackingKey,
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
  readonly fieldAdapter: FieldAdapter;
  readonly controlValue: WritableSignal<unknown>;

  private _context: FieldContext<unknown> | undefined = undefined;
  get context(): FieldContext<unknown> {
    return (this._context ??= new FieldNodeContext(this));
  }

  /**
   * Proxy to this node which allows navigation of the form graph below it.
   */
  readonly fieldProxy = new Proxy(() => this, FIELD_PROXY_HANDLER) as unknown as FieldTree<any>;
  private readonly pathNode: FieldPathNode;

  constructor(options: FieldNodeOptions) {
    this.pathNode = options.pathNode;
    this.fieldAdapter = options.fieldAdapter;
    this.structure = this.fieldAdapter.createStructure(this, options);
    this.validationState = this.fieldAdapter.createValidationState(this, options);
    this.nodeState = this.fieldAdapter.createNodeState(this, options);
    this.metadataState = new FieldMetadataState(this);
    this.submitState = new FieldSubmitState(this);
    this.controlValue = this.controlValueSignal();
  }

  focusBoundControl(options?: FocusOptions): void {
    this.getBindingForFocus()?.focus(options);
  }

  /**
   * Gets the Field directive binding that should be focused when the developer calls
   * `focusBoundControl` on this node.
   *
   * This will prioritize focusable bindings to this node, and if multiple exist, it will return
   * the first one in the DOM. If no focusable bindings exist on this node, it will return the
   * first focusable binding in the DOM for any descendant node of this one.
   */
  private getBindingForFocus():
    | (FormField<unknown> & {focus: (options?: FocusOptions) => void})
    | undefined {
    // First try to focus one of our own bindings.
    const own = this.formFieldBindings()
      .filter(
        (b): b is FormField<unknown> & {focus: (options?: FocusOptions) => void} =>
          b.focus !== undefined,
      )
      .reduce(
        firstInDom<FormField<unknown> & {focus: (options?: FocusOptions) => void}>,
        undefined,
      );
    if (own) return own;
    // Fallback to focusing the bound control for one of our children.
    return this.structure
      .children()
      .map((child) => child.getBindingForFocus())
      .reduce(firstInDom, undefined);
  }

  /**
   * The `AbortController` for the currently debounced sync, or `undefined` if there is none.
   *
   * This is used to cancel a pending debounced sync when {@link setControlValue} is called again
   * before the pending debounced sync resolves. It will also cancel any pending debounced sync
   * automatically when recomputed due to `value` being set directly from others sources.
   */
  private readonly pendingSync: WritableSignal<AbortController | undefined> = linkedSignal({
    source: () => this.value(),
    computation: (_source, previous) => {
      previous?.value?.abort();
      return undefined;
    },
  });

  get logicNode(): LogicNode {
    return this.structure.logic;
  }

  get value(): WritableSignal<unknown> {
    return this.structure.value;
  }

  get keyInParent(): Signal<string | number> {
    return this.structure.keyInParent;
  }

  get errors(): Signal<ValidationError.WithFieldTree[]> {
    return this.validationState.errors;
  }

  get parseErrors(): Signal<ValidationError.WithFormField[]> {
    return this.validationState.parseErrors;
  }

  get errorSummary(): Signal<ValidationError.WithFieldTree[]> {
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

  get formFieldBindings(): Signal<readonly FormField<unknown>[]> {
    return this.nodeState.formFieldBindings;
  }

  get submitting(): Signal<boolean> {
    return this.submitState.submitting;
  }

  get name(): Signal<string> {
    return this.nodeState.name;
  }

  get max(): Signal<number | undefined> | undefined {
    return this.metadata(MAX);
  }

  get maxLength(): Signal<number | undefined> | undefined {
    return this.metadata(MAX_LENGTH);
  }

  get min(): Signal<number | undefined> | undefined {
    return this.metadata(MIN);
  }

  get minLength(): Signal<number | undefined> | undefined {
    return this.metadata(MIN_LENGTH);
  }

  get pattern(): Signal<readonly RegExp[]> {
    return this.metadata(PATTERN) ?? EMPTY;
  }

  get required(): Signal<boolean> {
    return this.metadata(REQUIRED) ?? FALSE;
  }

  metadata<M>(key: MetadataKey<M, any, any>): M | undefined {
    return this.metadataState.get(key);
  }

  hasMetadata(key: MetadataKey<any, any, any>): boolean {
    return this.metadataState.has(key);
  }

  /**
   * Marks this specific field as touched.
   */
  markAsTouched(): void {
    untracked(() => {
      this.nodeState.markAsTouched();
      this.flushSync();
    });
  }

  /**
   * Marks this specific field as dirty.
   */
  markAsDirty(): void {
    this.nodeState.markAsDirty();
  }

  /**
   * Marks this specific field as pristine.
   */
  markAsPristine(): void {
    this.nodeState.markAsPristine();
  }

  /**
   * Marks this specific field as untouched.
   */
  markAsUntouched(): void {
    this.nodeState.markAsUntouched();
  }

  /**
   * Resets the {@link touched} and {@link dirty} state of the field and its descendants.
   *
   * Note this does not change the data model, which can be reset directly if desired.
   *
   * @param value Optional value to set to the form. If not passed, the value will not be changed.
   */
  reset(value?: unknown): void {
    untracked(() => this._reset(value));
  }

  private _reset(value?: unknown) {
    if (value !== undefined) {
      this.value.set(value);
    }

    this.nodeState.markAsUntouched();
    this.nodeState.markAsPristine();

    for (const child of this.structure.children()) {
      child._reset();
    }
  }

  /**
   * Creates a linked signal that initiates a {@link debounceSync} when set.
   */
  private controlValueSignal(): WritableSignal<unknown> {
    const controlValue = linkedSignal(this.value);
    const {set, update} = controlValue;

    controlValue.set = (newValue) => {
      set(newValue);
      this.markAsDirty();
      this.debounceSync();
    };
    controlValue.update = (updateFn) => {
      update(updateFn);
      this.markAsDirty();
      this.debounceSync();
    };

    return controlValue;
  }

  /**
   * Synchronizes the {@link controlValue} with the {@link value} signal immediately.
   */
  private sync() {
    this.value.set(this.controlValue());
  }

  /**
   * If there is a pending sync, abort it and sync immediately.
   */
  private flushSync() {
    const pending = this.pendingSync();
    if (pending && !pending.signal.aborted) {
      pending.abort();
      this.sync();
    }
  }

  /**
   * Initiates a debounced {@link sync}.
   *
   * If a debouncer is configured, the synchronization will occur after the debouncer resolves. If
   * no debouncer is configured, the synchronization happens immediately. If {@link controlValue} is
   * updated again while a debounce is pending, the previous debounce operation is aborted in favor
   * of the new one.
   */
  private async debounceSync() {
    const debouncer = untracked(() => {
      this.pendingSync()?.abort();
      return this.nodeState.debouncer();
    });

    if (debouncer) {
      const controller = new AbortController();
      const promise = debouncer(controller.signal);
      if (promise) {
        this.pendingSync.set(controller);
        await promise;
        if (controller.signal.aborted) {
          return; // Do not sync if the debounce was aborted.
        }
      }
    }

    this.sync();
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

  createStructure(options: FieldNodeOptions) {
    return options.kind === 'root'
      ? new RootFieldNodeStructure(
          this,
          options.logic,
          options.fieldManager,
          options.value,
          this.newChild.bind(this),
        )
      : new ChildFieldNodeStructure(
          this,
          options.logic,
          options.parent,
          options.identityInParent,
          options.initialKeyInParent,
          this.newChild.bind(this),
        );
  }

  private newChild(key: string, trackingId: TrackingKey | undefined, isArray: boolean): FieldNode {
    // Determine the logic for the field that we're defining.
    let childPath: FieldPathNode | undefined;
    let childLogic: LogicNode;
    if (isArray) {
      // Fields for array elements have their logic defined by the `element` mechanism.
      // TODO: other dynamic data
      childPath = this.pathNode.getChild(DYNAMIC);
      childLogic = this.structure.logic.getChild(DYNAMIC);
    } else {
      // Fields for plain properties exist in our logic node's child map.
      childPath = this.pathNode.getChild(key);
      childLogic = this.structure.logic.getChild(key);
    }

    return this.fieldAdapter.newChild({
      kind: 'child',
      parent: this as ParentFieldNode,
      pathNode: childPath,
      logic: childLogic,
      initialKeyInParent: key,
      identityInParent: trackingId,
      fieldAdapter: this.fieldAdapter,
    });
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

/** Given two elements, returns the one that appears earlier in the DOM. */
function firstInDom<T extends FormField<unknown>>(
  a: T | undefined,
  b: T | undefined,
): T | undefined {
  if (!a) return b;
  if (!b) return a;
  const position = a.element.compareDocumentPosition(b.element);
  return position & Node.DOCUMENT_POSITION_PRECEDING ? b : a;
}
