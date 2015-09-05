import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';

import {Query, Directive} from 'angular2/metadata';
import {forwardRef, Binding, Inject, Optional} from 'angular2/di';
import {OnChanges} from 'angular2/lifecycle_hooks';

import {NgControl} from './ng_control';
import {Control} from '../model';
import {Validators, NG_VALIDATORS} from '../validators';
import {setUpControl, isPropertyUpdated} from './shared';

const formControlBinding = CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef(() => NgModel)}));

/**
 * Binds a domain model to the form.
 *
 * # Example
 *  ```
 * @Component({selector: "search-comp"})
 * @View({
 *      directives: [FORM_DIRECTIVES],
 *      template: `
              <input type='text' [(ng-model)]="searchQuery">
 *      `})
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 */
@Directive({
  selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
  bindings: [formControlBinding],
  properties: ['model: ngModel'],
  events: ['update: ngModel'],
  exportAs: 'form'
})
export class NgModel extends NgControl implements OnChanges {
  _control = new Control();
  _added = false;
  update = new EventEmitter();
  model: any;
  viewModel: any;
  validators: Function[];

  constructor(@Optional() @Inject(NG_VALIDATORS) validators: Function[]) {
    super();
    this.validators = validators;
  }

  onChanges(c: StringMap<string, any>) {
    if (!this._added) {
      setUpControl(this._control, this);
      this._control.updateValidity();
      this._added = true;
    }

    if (isPropertyUpdated(c, this.viewModel)) {
      this._control.updateValue(this.model);
    }
  }

  get control(): Control { return this._control; }

  get path(): string[] { return []; }

  get validator(): Function { return Validators.compose(this.validators); }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    ObservableWrapper.callNext(this.update, newValue);
  }
}
