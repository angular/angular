/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, OnDestroy, OnInit} from '@angular/core';

import {FormGroup} from '../model';

import {ControlContainer} from './control_container';
import {Form} from './form_interface';
import {controlPath} from './shared';



/**
 * @description
 * A base class for code shared between the `NgModelGroup` and `FormGroupName` directives.
 *
 * @publicApi
 */
@Directive()
export class AbstractFormGroupDirective extends ControlContainer implements OnInit, OnDestroy {
  /**
   * @description
   * The parent control for the group
   *
   * @internal
   */
  // TODO(issue/24571): remove '!'.
  _parent!: ControlContainer;

  /**
   * @description
   * Counts the number of references it has.
   * Used for correctly cleanup on ngOnDestroy when useFactory returns the same instance multiple
   * times.
   *
   * @internal
   */
  private _refCount: number = 0;

  /** @nodoc */
  ngOnInit(): void {
    this._refCount++;
    this._checkParentType();
    // Register the group with its parent group.
    this.formDirective!.addFormGroup(this);
  }

  /** @nodoc */
  ngOnDestroy(): void {
    this._refCount--;
    if (this.formDirective && this._refCount === 0) {
      // Remove the group from its parent group.
      this.formDirective.removeFormGroup(this);
    }
  }

  /**
   * @description
   * The `FormGroup` bound to this directive.
   */
  get control(): FormGroup {
    return this.formDirective!.getFormGroup(this);
  }

  /**
   * @description
   * The path to this group from the top-level directive.
   */
  get path(): string[] {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
  }

  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective(): Form|null {
    return this._parent ? this._parent.formDirective : null;
  }

  /**
   * @description
   * Returns the current number of references to this directive.
   */
  get refCount() {
    return this._refCount;
  }

  /**
   * @description
   * Adds a reference into the total reference count.
   */
  addRef() {
    this._refCount++;
  }

  /** @internal */
  _checkParentType(): void {}
}
