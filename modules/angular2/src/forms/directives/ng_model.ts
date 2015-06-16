import {CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';

import {Directive, Ancestor, onChange} from 'angular2/angular2';
import {forwardRef, Binding} from 'angular2/di';

import {NgControl} from './ng_control';
import {Control} from '../model';
import {setUpControl} from './shared';

const formControlBinding = CONST_EXPR(new Binding(NgControl, {toAlias: forwardRef(() => NgModel)}));

/**
 * Binds a domain model to the form.
 *
 * # Example
 *  ```
 * @Component({selector: "search-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: `
              <input type='text' [(ng-model)]="searchQuery">
 *      `})
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
  hostInjector: [formControlBinding],
  properties: ['model: ng-model'],
  events: ['ngModel'],
  lifecycle: [onChange],
  exportAs: 'form'
})
export class NgModel extends NgControl {
  _control = new Control("");
  _added = false;
  ngModel = new EventEmitter();
  model: any;

  onChange(c) {
    if (!this._added) {
      setUpControl(this._control, this);
      this.control.updateValidity();
      this._added = true;
    };

    if (StringMapWrapper.contains(c, "model")) {
      this._control.updateValue(this.model);
    }
  }

  get control() { return this._control; }

  get path(): List<string> { return []; }

  viewToModelUpdate(newValue: any): void { ObservableWrapper.callNext(this.ngModel, newValue); }
}
