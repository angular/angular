import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';

import {QueryList} from 'angular2/core';
import {Query, Directive, LifecycleEvent} from 'angular2/metadata';
import {forwardRef, Binding} from 'angular2/di';

import {NgControl} from './ng_control';
import {Control} from '../model';
import {NgValidator} from './validators';
import {setUpControl, composeNgValidator, isPropertyUpdated} from './shared';

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
  lifecycle: [LifecycleEvent.OnChanges],
  exportAs: 'form'
})
export class NgModel extends NgControl {
  _control = new Control();
  _added = false;
  update = new EventEmitter();
  model: any;
  viewModel: any;
  ngValidators: QueryList<NgValidator>;

  // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
  constructor(@Query(NgValidator) ngValidators: QueryList<NgValidator>) {
    super();
    this.ngValidators = ngValidators;
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

  get validator(): Function { return composeNgValidator(this.ngValidators); }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    ObservableWrapper.callNext(this.update, newValue);
  }
}
