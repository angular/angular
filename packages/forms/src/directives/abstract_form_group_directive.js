/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Directive} from '@angular/core';
import {ControlContainer} from './control_container';
import {controlPath} from './shared';
/**
 * @description
 * A base class for code shared between the `NgModelGroup` and `FormGroupName` directives.
 *
 * @publicApi
 */
let AbstractFormGroupDirective = class AbstractFormGroupDirective extends ControlContainer {
  /** @docs-private */
  ngOnInit() {
    this._checkParentType();
    // Register the group with its parent group.
    this.formDirective.addFormGroup(this);
  }
  /** @docs-private */
  ngOnDestroy() {
    if (this.formDirective) {
      // Remove the group from its parent group.
      this.formDirective.removeFormGroup(this);
    }
  }
  /**
   * @description
   * The `FormGroup` bound to this directive.
   */
  get control() {
    return this.formDirective.getFormGroup(this);
  }
  /**
   * @description
   * The path to this group from the top-level directive.
   */
  get path() {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
  }
  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective() {
    return this._parent ? this._parent.formDirective : null;
  }
  /** @internal */
  _checkParentType() {}
};
AbstractFormGroupDirective = __decorate(
  [
    Directive({
      standalone: false,
    }),
  ],
  AbstractFormGroupDirective,
);
export {AbstractFormGroupDirective};
//# sourceMappingURL=abstract_form_group_directive.js.map
