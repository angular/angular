/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Host, Inject, Input, OnDestroy, OnInit, Optional, Self, SkipSelf, forwardRef} from '@angular/core';

import {FormArray} from '../../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../../validators';
import {ControlContainer} from '../control_container';
import {composeAsyncValidators, composeValidators, controlPath} from '../shared';
import {AsyncValidatorFn, ValidatorFn} from '../validators';

import {FormGroupDirective} from './form_group_directive';

export const formArrayNameProvider: any =
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
      provide: ControlContainer,
      useExisting: forwardRef(() => FormArrayName)
    };

/**
 * Syncs an existing form array to a DOM element.
 *
 * This directive can only be used as a child of {@link FormGroupDirective}.
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>Angular FormArray Example</h2>
 *       <form [formGroup]="myForm">
 *         <div formArrayName="cities">
 *           <div *ngFor="let city of cityArray.controls; let i=index">
 *             <input [formControlName]="i">
 *           </div>
 *         </div>
 *       </form>
 *       {{ myForm.value | json }}     // {cities: ['SF', 'NY']}
 *     </div>
 *   `
 * })
 * export class App {
 *   cityArray = new FormArray([
 *     new FormControl('SF'),
 *     new FormControl('NY')
 *   ]);
 *   myForm = new FormGroup({
 *     cities: this.cityArray
 *   });
 * }
 * ```
 *
 * @experimental
 */
@Directive({selector: '[formArrayName]', providers: [formArrayNameProvider]})
export class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
  /** @internal */
  _parent: ControlContainer;

  /** @internal */
  _validators: any[];

  /** @internal */
  _asyncValidators: any[];

  @Input('formArrayName') name: string;

  constructor(
      @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: any[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: any[]) {
    super();
    this._parent = parent;
    this._validators = validators;
    this._asyncValidators = asyncValidators;
  }

  ngOnInit(): void { this.formDirective.addFormArray(this); }

  ngOnDestroy(): void { this.formDirective.removeFormArray(this); }

  get control(): FormArray { return this.formDirective.getFormArray(this); }

  get formDirective(): FormGroupDirective { return <FormGroupDirective>this._parent.formDirective; }

  get path(): string[] { return controlPath(this.name, this._parent); }

  get validator(): ValidatorFn { return composeValidators(this._validators); }

  get asyncValidator(): AsyncValidatorFn { return composeAsyncValidators(this._asyncValidators); }
}
