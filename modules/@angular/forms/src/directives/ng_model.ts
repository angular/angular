/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Host, Inject, Input, OnChanges, OnDestroy, Optional, Output, Self, SimpleChanges, forwardRef} from '@angular/core';

import {EventEmitter, ObservableWrapper, PromiseWrapper} from '../facade/async';
import {BaseException} from '../facade/exceptions';
import {FormControl} from '../model';
import {NG_ASYNC_VALIDATORS, NG_VALIDATORS} from '../validators';

import {ControlContainer} from './control_container';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
import {NgControl} from './ng_control';
import {composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor, setUpControl} from './shared';
import {AsyncValidatorFn, ValidatorFn} from './validators';

export const formControlBinding: any =
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
      provide: NgControl,
      useExisting: forwardRef(() => NgModel)
    };

/**
 * Binds a domain model to a form control.
 *
 * ### Usage
 *
 * `ngModel` binds an existing domain model to a form control. For a
 * two-way binding, use `[(ngModel)]` to ensure the model updates in
 * both directions.
 *
 *  ```typescript
 * @Component({
 *      selector: "search-comp",
 *      directives: [],
 *      template: `<input type='text' [(ngModel)]="searchQuery">`
 *      })
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 *
 *  @experimental
 */
@Directive({
  selector: '[ngModel]:not([formControlName]):not([formControl])',
  providers: [formControlBinding],
  exportAs: 'ngModel'
})
export class NgModel extends NgControl implements OnChanges,
    OnDestroy {
  /** @internal */
  _control = new FormControl();
  /** @internal */
  _registered = false;
  viewModel: any;

  @Input('ngModel') model: any;
  @Input() name: string;
  @Input('ngModelOptions') options: {name?: string, standalone?: boolean};
  @Output('ngModelChange') update = new EventEmitter();

  constructor(@Optional() @Host() private _parent: ControlContainer,
              @Optional() @Self() @Inject(NG_VALIDATORS) private _validators: any[],
              @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) private _asyncValidators: any[],
              @Optional() @Self() @Inject(NG_VALUE_ACCESSOR)
              valueAccessors: ControlValueAccessor[]) {
                super();
                this.valueAccessor = selectValueAccessor(this, valueAccessors);
              }

              ngOnChanges(changes: SimpleChanges) {
                this._checkName();
                if (!this._registered) this._setUpControl();

                if (isPropertyUpdated(changes, this.viewModel)) {
                  this._updateValue(this.model);
                  this.viewModel = this.model;
                }
              }

              ngOnDestroy(): void { this.formDirective && this.formDirective.removeControl(this); }

              get control(): FormControl { return this._control; }

              get path(): string[] {
                return this._parent ? controlPath(this.name, this._parent) : [];
              }

              get formDirective(): any { return this._parent ? this._parent.formDirective : null; }

              get validator(): ValidatorFn { return composeValidators(this._validators); }

              get asyncValidator(): AsyncValidatorFn {
                return composeAsyncValidators(this._asyncValidators);
              }

              viewToModelUpdate(newValue: any): void {
                this.viewModel = newValue;
                ObservableWrapper.callEmit(this.update, newValue);
              }

              private _setUpControl(): void {
                this._isStandalone() ? this._setUpStandalone() :
                                       this.formDirective.addControl(this);
                this._registered = true;
              }

              private _isStandalone(): boolean {
                return !this._parent || (this.options && this.options.standalone);
              }

              private _setUpStandalone(): void {
                setUpControl(this._control, this);
                this._control.updateValueAndValidity({emitEvent: false});
              }

              private _checkName(): void {
                if (this.options && this.options.name) this.name = this.options.name;

                if (!this._isStandalone() && !this.name) {
                  throw new BaseException(
                      `If ngModel is used within a form tag, either the name attribute must be set
                      or the form control must be defined as 'standalone' in ngModelOptions.

                      Example 1: <input [(ngModel)]="person.firstName" name="first">
                      Example 2: <input [(ngModel)]="person.firstName" [ngModelOptions]="{standalone: true}">
                   `);
                }
              }

              private _updateValue(value: any): void {
                PromiseWrapper.scheduleMicrotask(
                    () => { this.control.updateValue(value, {emitViewToModelChange: false}); });
              }
}
