var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { NgControl } from './ng_control';
import { Control } from '../model';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
import { setUpControl, isPropertyUpdated, selectValueAccessor, composeValidators, composeAsyncValidators } from './shared';
const formControlBinding = CONST_EXPR(new Provider(NgControl, { useExisting: forwardRef(() => NgModel) }));
/**
 * Binds a domain model to a form control.
 *
 * ### Usage
 *
 * `ng-model` binds an existing domain model to a form control. For a
 * two-way binding, use `[(ng-model)]` to ensure the model updates in
 * both directions.
 *
 * ### Example ([live demo](http://plnkr.co/edit/R3UX5qDaUqFO2VYR0UzH?p=preview))
 *  ```typescript
 * @Component({
 *      selector: "search-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `<input type='text' [(ng-model)]="searchQuery">`
 *      })
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 */
export let NgModel = class extends NgControl {
    constructor(_validators, _asyncValidators, valueAccessors) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        /** @internal */
        this._control = new Control();
        /** @internal */
        this._added = false;
        this.update = new EventEmitter();
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    ngOnChanges(changes) {
        if (!this._added) {
            setUpControl(this._control, this);
            this._control.updateValueAndValidity({ emitEvent: false });
            this._added = true;
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this._control.updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    get control() { return this._control; }
    get path() { return []; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callEmit(this.update, newValue);
    }
};
NgModel = __decorate([
    Directive({
        selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
        bindings: [formControlBinding],
        inputs: ['model: ngModel'],
        outputs: ['update: ngModelChange'],
        exportAs: 'form'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_VALUE_ACCESSOR)), 
    __metadata('design:paramtypes', [Array, Array, Array])
], NgModel);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwudHMiXSwibmFtZXMiOlsiTmdNb2RlbCIsIk5nTW9kZWwuY29uc3RydWN0b3IiLCJOZ01vZGVsLm5nT25DaGFuZ2VzIiwiTmdNb2RlbC5jb250cm9sIiwiTmdNb2RlbC5wYXRoIiwiTmdNb2RlbC52YWxpZGF0b3IiLCJOZ01vZGVsLmFzeW5jVmFsaWRhdG9yIiwiTmdNb2RlbC52aWV3VG9Nb2RlbFVwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUNsRSxFQUlMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxFQUNMLE1BQU0sZUFBZTtPQUNmLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCO09BQ3pFLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYztPQUMvQixFQUFDLE9BQU8sRUFBQyxNQUFNLFVBQVU7T0FDekIsRUFBYSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFlO09BQ3JFLEVBQ0wsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDbkIsaUJBQWlCLEVBQ2pCLHNCQUFzQixFQUN2QixNQUFNLFVBQVU7QUFFakIsTUFBTSxrQkFBa0IsR0FDcEIsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVsRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSCxtQ0FPNkIsU0FBUztJQVNwQ0EsWUFBK0RBLFdBQWtCQSxFQUNaQSxnQkFBdUJBLEVBRWhGQSxj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O0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2UsXG4gIFF1ZXJ5LFxuICBEaXJlY3RpdmUsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7XG4gIHNldFVwQ29udHJvbCxcbiAgaXNQcm9wZXJ0eVVwZGF0ZWQsXG4gIHNlbGVjdFZhbHVlQWNjZXNzb3IsXG4gIGNvbXBvc2VWYWxpZGF0b3JzLFxuICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzXG59IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgZm9ybUNvbnRyb2xCaW5kaW5nID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOZ0NvbnRyb2wsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ01vZGVsKX0pKTtcblxuLyoqXG4gKiBCaW5kcyBhIGRvbWFpbiBtb2RlbCB0byBhIGZvcm0gY29udHJvbC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBgbmctbW9kZWxgIGJpbmRzIGFuIGV4aXN0aW5nIGRvbWFpbiBtb2RlbCB0byBhIGZvcm0gY29udHJvbC4gRm9yIGFcbiAqIHR3by13YXkgYmluZGluZywgdXNlIGBbKG5nLW1vZGVsKV1gIHRvIGVuc3VyZSB0aGUgbW9kZWwgdXBkYXRlcyBpblxuICogYm90aCBkaXJlY3Rpb25zLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SM1VYNXFEYVVxRk8yVllSMFV6SD9wPXByZXZpZXcpKVxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJzZWFyY2gtY29tcFwiLFxuICogICAgICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXSxcbiAqICAgICAgdGVtcGxhdGU6IGA8aW5wdXQgdHlwZT0ndGV4dCcgWyhuZy1tb2RlbCldPVwic2VhcmNoUXVlcnlcIj5gXG4gKiAgICAgIH0pXG4gKiBjbGFzcyBTZWFyY2hDb21wIHtcbiAqICBzZWFyY2hRdWVyeTogc3RyaW5nO1xuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctbW9kZWxdOm5vdChbbmctY29udHJvbF0pOm5vdChbbmctZm9ybS1jb250cm9sXSknLFxuICBiaW5kaW5nczogW2Zvcm1Db250cm9sQmluZGluZ10sXG4gIGlucHV0czogWydtb2RlbDogbmdNb2RlbCddLFxuICBvdXRwdXRzOiBbJ3VwZGF0ZTogbmdNb2RlbENoYW5nZSddLFxuICBleHBvcnRBczogJ2Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nTW9kZWwgZXh0ZW5kcyBOZ0NvbnRyb2wgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb250cm9sID0gbmV3IENvbnRyb2woKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkZWQgPSBmYWxzZTtcbiAgdXBkYXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBtb2RlbDogYW55O1xuICB2aWV3TW9kZWw6IGFueTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgICAgICAgICAgIHZhbHVlQWNjZXNzb3JzOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZhbHVlQWNjZXNzb3IgPSBzZWxlY3RWYWx1ZUFjY2Vzc29yKHRoaXMsIHZhbHVlQWNjZXNzb3JzKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBTaW1wbGVDaGFuZ2V9KSB7XG4gICAgaWYgKCF0aGlzLl9hZGRlZCkge1xuICAgICAgc2V0VXBDb250cm9sKHRoaXMuX2NvbnRyb2wsIHRoaXMpO1xuICAgICAgdGhpcy5fY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICB0aGlzLl9hZGRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJvcGVydHlVcGRhdGVkKGNoYW5nZXMsIHRoaXMudmlld01vZGVsKSkge1xuICAgICAgdGhpcy5fY29udHJvbC51cGRhdGVWYWx1ZSh0aGlzLm1vZGVsKTtcbiAgICAgIHRoaXMudmlld01vZGVsID0gdGhpcy5tb2RlbDtcbiAgICB9XG4gIH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sIHsgcmV0dXJuIHRoaXMuX2NvbnRyb2w7IH1cblxuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gIGdldCB2YWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7IH1cblxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9hc3luY1ZhbGlkYXRvcnMpOyB9XG5cbiAgdmlld1RvTW9kZWxVcGRhdGUobmV3VmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudmlld01vZGVsID0gbmV3VmFsdWU7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy51cGRhdGUsIG5ld1ZhbHVlKTtcbiAgfVxufVxuIl19