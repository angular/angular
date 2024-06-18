/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  forwardRef,
  Host,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Provider,
  Self,
  SkipSelf,
} from '@angular/core';

import {FormArray} from '../../model/form_array';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {AbstractFormGroupDirective} from '../abstract_form_group_directive';
import {ControlContainer} from '../control_container';
import {arrayParentException, groupParentException} from '../reactive_errors';
import {controlPath} from '../shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../validators';

import {AbstractFormDirective} from './abstract_form.directive';

const formGroupNameProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupName),
};

/**
 * @description
 *
 * Syncs a nested `FormGroup` or `FormRecord` to a DOM element.
 *
 * This directive can only be used with a parent `FormGroupDirective`.
 *
 * It accepts the string name of the nested `FormGroup` or `FormRecord` to link, and
 * looks for a `FormGroup` or `FormRecord` registered with that name in the parent
 * `FormGroup` instance you passed into `FormGroupDirective`.
 *
 * Use nested form groups to validate a sub-group of a
 * form separately from the rest or to group the values of certain
 * controls into their own nested object.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 *
 * @usageNotes
 *
 * ### Access the group by name
 *
 * The following example uses the `AbstractControl.get` method to access the
 * associated `FormGroup`
 *
 * ```ts
 *   this.form.get('name');
 * ```
 *
 * ### Access individual controls in the group
 *
 * The following example uses the `AbstractControl.get` method to access
 * individual controls within the group using dot syntax.
 *
 * ```ts
 *   this.form.get('name.first');
 * ```
 *
 * ### Register a nested `FormGroup`.
 *
 * The following example registers a nested *name* `FormGroup` within an existing `FormGroup`,
 * and provides methods to retrieve the nested `FormGroup` and individual controls.
 *
 * {@example forms/ts/nestedFormGroup/nested_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formGroupName]',
  providers: [formGroupNameProvider],
  standalone: false,
})
export class FormGroupName extends AbstractFormGroupDirective implements OnInit, OnDestroy {
  /**
   * @description
   * Tracks the name of the `FormGroup` bound to the directive. The name corresponds
   * to a key in the parent `FormGroup` or `FormArray`.
   * Accepts a name as a string or a number.
   * The name in the form of a string is useful for individual forms,
   * while the numerical form allows for form groups to be bound
   * to indices when iterating over groups in a `FormArray`.
   */
  @Input('formGroupName') override name: string | number | null = null;

  constructor(
    @Optional() @Host() @SkipSelf() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
  ) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }

  /** @internal */
  override _checkParentType(): void {
    if (hasInvalidParent(this._parent) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw groupParentException();
    }
  }
}

export const formArrayNameProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormArrayName),
};

/**
 * @description
 *
 * Syncs a nested `FormArray` to a DOM element.
 *
 * This directive is designed to be used with a parent `FormGroupDirective` (selector:
 * `[formGroup]`).
 *
 * It accepts the string name of the nested `FormArray` you want to link, and
 * will look for a `FormArray` registered with that name in the parent
 * `FormGroup` instance you passed into `FormGroupDirective`.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see {@link AbstractControl}
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example forms/ts/nestedFormArray/nested_form_array_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector: '[formArrayName]',
  providers: [formArrayNameProvider],
  standalone: false,
})
export class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
  /** @internal */
  _parent: ControlContainer;

  /**
   * @description
   * Tracks the name of the `FormArray` bound to the directive. The name corresponds
   * to a key in the parent `FormGroup` or `FormArray`.
   * Accepts a name as a string or a number.
   * The name in the form of a string is useful for individual forms,
   * while the numerical form allows for form arrays to be bound
   * to indices when iterating over arrays in a `FormArray`.
   */
  @Input('formArrayName') override name: string | number | null = null;

  constructor(
    @Optional() @Host() @SkipSelf() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
  ) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }

  /**
   * A lifecycle method called when the directive's inputs are initialized. For internal use only.
   * @throws If the directive does not have a valid parent.
   * @docs-private
   */
  ngOnInit(): void {
    if (hasInvalidParent(this._parent) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw arrayParentException();
    }
    this.formDirective!.addFormArray(this);
  }

  /**
   * A lifecycle method called before the directive's instance is destroyed. For internal use only.
   * @docs-private
   */
  ngOnDestroy(): void {
    this.formDirective?.removeFormArray(this);
  }

  /**
   * @description
   * The `FormArray` bound to this directive.
   */
  override get control(): FormArray {
    return this.formDirective!.getFormArray(this);
  }

  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  override get formDirective(): AbstractFormDirective | null {
    return this._parent ? <AbstractFormDirective>this._parent.formDirective : null;
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
  }
}

function hasInvalidParent(parent: ControlContainer): boolean {
  return (
    !(parent instanceof FormGroupName) &&
    !(parent instanceof AbstractFormDirective) &&
    !(parent instanceof FormArrayName)
  );
}
