/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var NgModelGroup_1;
import {__decorate, __param} from 'tslib';
import {Directive, forwardRef, Host, Inject, Input, Optional, Self, SkipSelf} from '@angular/core';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../validators';
import {AbstractFormGroupDirective} from './abstract_form_group_directive';
import {ControlContainer} from './control_container';
import {NgForm} from './ng_form';
import {modelGroupParentException} from './template_driven_errors';
export const modelGroupProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgModelGroup),
};
/**
 * @description
 * Creates and binds a `FormGroup` instance to a DOM element.
 *
 * This directive can only be used as a child of `NgForm` (within `<form>` tags).
 *
 * Use this directive to validate a sub-group of your form separately from the
 * rest of your form, or if some values in your domain model make more sense
 * to consume together in a nested object.
 *
 * Provide a name for the sub-group and it will become the key
 * for the sub-group in the form's full value. If you need direct access, export the directive into
 * a local template variable using `ngModelGroup` (ex: `#myGroup="ngModelGroup"`).
 *
 * @usageNotes
 *
 * ### Consuming controls in a grouping
 *
 * The following example shows you how to combine controls together in a sub-group
 * of the form.
 *
 * {@example forms/ts/ngModelGroup/ng_model_group_example.ts region='Component'}
 *
 * @ngModule FormsModule
 * @publicApi
 */
let NgModelGroup = (NgModelGroup_1 = class NgModelGroup extends AbstractFormGroupDirective {
  constructor(parent, validators, asyncValidators) {
    super();
    /**
     * @description
     * Tracks the name of the `NgModelGroup` bound to the directive. The name corresponds
     * to a key in the parent `NgForm`.
     */
    this.name = '';
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /** @internal */
  _checkParentType() {
    if (
      !(this._parent instanceof NgModelGroup_1) &&
      !(this._parent instanceof NgForm) &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throw modelGroupParentException();
    }
  }
});
__decorate([Input('ngModelGroup')], NgModelGroup.prototype, 'name', void 0);
NgModelGroup = NgModelGroup_1 = __decorate(
  [
    Directive({
      selector: '[ngModelGroup]',
      providers: [modelGroupProvider],
      exportAs: 'ngModelGroup',
      standalone: false,
    }),
    __param(0, Host()),
    __param(0, SkipSelf()),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_ASYNC_VALIDATORS)),
  ],
  NgModelGroup,
);
export {NgModelGroup};
//# sourceMappingURL=ng_model_group.js.map
