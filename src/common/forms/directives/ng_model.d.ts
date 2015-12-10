import { EventEmitter } from 'angular2/src/facade/async';
import { OnChanges, SimpleChange } from 'angular2/core';
import { ControlValueAccessor } from './control_value_accessor';
import { NgControl } from './ng_control';
import { Control } from '../model';
/**
 * Binds a domain model to a form control.
 *
 * ### Usage
 *
 * `ngModel` binds an existing domain model to a form control. For a
 * two-way binding, use `[(ngModel)]` to ensure the model updates in
 * both directions.
 *
 * ### Example ([live demo](http://plnkr.co/edit/R3UX5qDaUqFO2VYR0UzH?p=preview))
 *  ```typescript
 * @Component({
 *      selector: "search-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `<input type='text' [(ngModel)]="searchQuery">`
 *      })
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 */
export declare class NgModel extends NgControl implements OnChanges {
    private _validators;
    private _asyncValidators;
    update: EventEmitter<{}>;
    model: any;
    viewModel: any;
    constructor(_validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: {
        [key: string]: SimpleChange;
    }): void;
    control: Control;
    path: string[];
    validator: Function;
    asyncValidator: Function;
    viewToModelUpdate(newValue: any): void;
}
