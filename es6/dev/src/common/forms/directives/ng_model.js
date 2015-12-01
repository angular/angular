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
    onChanges(changes) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwudHMiXSwibmFtZXMiOlsiTmdNb2RlbCIsIk5nTW9kZWwuY29uc3RydWN0b3IiLCJOZ01vZGVsLm9uQ2hhbmdlcyIsIk5nTW9kZWwuY29udHJvbCIsIk5nTW9kZWwucGF0aCIsIk5nTW9kZWwudmFsaWRhdG9yIiwiTmdNb2RlbC5hc3luY1ZhbGlkYXRvciIsIk5nTW9kZWwudmlld1RvTW9kZWxVcGRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDbEUsRUFJTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLElBQUksRUFDTCxNQUFNLGVBQWU7T0FDZixFQUF1QixpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQjtPQUN6RSxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWM7T0FDL0IsRUFBQyxPQUFPLEVBQUMsTUFBTSxVQUFVO09BQ3pCLEVBQWEsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtPQUNyRSxFQUNMLFlBQVksRUFDWixpQkFBaUIsRUFDakIsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdkIsTUFBTSxVQUFVO0FBRWpCLE1BQU0sa0JBQWtCLEdBQ3BCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0gsbUNBTzZCLFNBQVM7SUFTcENBLFlBQStEQSxXQUFrQkEsRUFDWkEsZ0JBQXVCQSxFQUVoRkEsY0FB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QUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlLFxuICBRdWVyeSxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge0NvbnRyb2x9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5pbXBvcnQge1xuICBzZXRVcENvbnRyb2wsXG4gIGlzUHJvcGVydHlVcGRhdGVkLFxuICBzZWxlY3RWYWx1ZUFjY2Vzc29yLFxuICBjb21wb3NlVmFsaWRhdG9ycyxcbiAgY29tcG9zZUFzeW5jVmFsaWRhdG9yc1xufSBmcm9tICcuL3NoYXJlZCc7XG5cbmNvbnN0IGZvcm1Db250cm9sQmluZGluZyA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoTmdDb250cm9sLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdNb2RlbCl9KSk7XG5cbi8qKlxuICogQmluZHMgYSBkb21haW4gbW9kZWwgdG8gYSBmb3JtIGNvbnRyb2wuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogYG5nLW1vZGVsYCBiaW5kcyBhbiBleGlzdGluZyBkb21haW4gbW9kZWwgdG8gYSBmb3JtIGNvbnRyb2wuIEZvciBhXG4gKiB0d28td2F5IGJpbmRpbmcsIHVzZSBgWyhuZy1tb2RlbCldYCB0byBlbnN1cmUgdGhlIG1vZGVsIHVwZGF0ZXMgaW5cbiAqIGJvdGggZGlyZWN0aW9ucy5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUjNVWDVxRGFVcUZPMlZZUjBVekg/cD1wcmV2aWV3KSlcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgICAgc2VsZWN0b3I6IFwic2VhcmNoLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBgPGlucHV0IHR5cGU9J3RleHQnIFsobmctbW9kZWwpXT1cInNlYXJjaFF1ZXJ5XCI+YFxuICogICAgICB9KVxuICogY2xhc3MgU2VhcmNoQ29tcCB7XG4gKiAgc2VhcmNoUXVlcnk6IHN0cmluZztcbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nLW1vZGVsXTpub3QoW25nLWNvbnRyb2xdKTpub3QoW25nLWZvcm0tY29udHJvbF0pJyxcbiAgYmluZGluZ3M6IFtmb3JtQ29udHJvbEJpbmRpbmddLFxuICBpbnB1dHM6IFsnbW9kZWw6IG5nTW9kZWwnXSxcbiAgb3V0cHV0czogWyd1cGRhdGU6IG5nTW9kZWxDaGFuZ2UnXSxcbiAgZXhwb3J0QXM6ICdmb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ01vZGVsIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29udHJvbCA9IG5ldyBDb250cm9sKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZGVkID0gZmFsc2U7XG4gIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgbW9kZWw6IGFueTtcbiAgdmlld01vZGVsOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgICAgICAgICAgICB2YWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52YWx1ZUFjY2Vzc29yID0gc2VsZWN0VmFsdWVBY2Nlc3Nvcih0aGlzLCB2YWx1ZUFjY2Vzc29ycyk7XG4gIH1cblxuICBvbkNoYW5nZXMoY2hhbmdlczoge1trZXk6IHN0cmluZ106IFNpbXBsZUNoYW5nZX0pIHtcbiAgICBpZiAoIXRoaXMuX2FkZGVkKSB7XG4gICAgICBzZXRVcENvbnRyb2wodGhpcy5fY29udHJvbCwgdGhpcyk7XG4gICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIHRoaXMuX2FkZGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlKHRoaXMubW9kZWwpO1xuICAgICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLm1vZGVsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2wgeyByZXR1cm4gdGhpcy5fY29udHJvbDsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cblxuICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLnVwZGF0ZSwgbmV3VmFsdWUpO1xuICB9XG59XG4iXX0=