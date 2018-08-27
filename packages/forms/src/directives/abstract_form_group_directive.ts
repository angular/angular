/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OnDestroy, OnInit} from '@angular/core';

import {FormGroup} from '../model';

import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {composeAsyncValidators, composeValidators, controlPath} from './shared';
import {AsyncValidatorFn, ValidatorFn} from './validators';



/**
 * @description
 * A base class for code shared between the `NgModelGroup` and `FormGroupName` directives.
 *
 */
export class AbstractFormGroupDirective extends ControlContainer implements OnInit, OnDestroy {
  /**
   * @description
   * The parent control for the group
   *
   * @internal
   */
  // TODO(issue/24571): remove '!'.
  _parent !: ControlContainer;

  /**
   * @description
   * An array of synchronous validators for the group
   *
   * @internal
   */
  // TODO(issue/24571): remove '!'.
  _validators !: any[];

  /**
   * @description
   * An array of async validators for the group
   *
   * @internal
   */
  // TODO(issue/24571): remove '!'.
  _asyncValidators !: any[];

  /**
   * @description
   * The callback method triggered on the instance after the inputs are set.
   * Registers the group with its parent group.
   */
  ngOnInit(): void {
    this._checkParentType();
    this.formDirective !.addFormGroup(this);
  }

  /**
   * @description
   * The callback method trigger before the instance is destroyed.
   * Removes the group from its parent group.
   */
  ngOnDestroy(): void {
    if (this.formDirective) {
      this.formDirective.removeFormGroup(this);
    }
  }

  /**
   * @description
   * Reports the `FormGroup` bound to this directive from its parent
   */
  get control(): FormGroup { return this.formDirective !.getFormGroup(this); }

  /**
   * @description
   * Reports the path to this group
   */
  get path(): string[] { return controlPath(this.name, this._parent); }

  /**
   * @description
   * Reports the parent form for this group
   *
   * @returns The parent form if present, otherwise null.
   */
  get formDirective(): Form|null { return this._parent ? this._parent.formDirective : null; }

  /**
   * @description
   * Reports the synchronous validators registered with this group
   */
  get validator(): ValidatorFn|null { return composeValidators(this._validators); }

  /**
   * @description
   * Reports the async validators registered with this group
   */
  get asyncValidator(): AsyncValidatorFn|null {
    return composeAsyncValidators(this._asyncValidators);
  }

  /** @internal */
  _checkParentType(): void {}
}
