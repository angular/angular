'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var control_value_accessor_1 = require('./control_value_accessor');
var ng_control_1 = require('./ng_control');
var model_1 = require('../model');
var validators_1 = require('../validators');
var shared_1 = require('./shared');
exports.formControlBinding = 
/*@ts2dart_const*/ /* @ts2dart_Provider */ {
    provide: ng_control_1.NgControl,
    useExisting: core_1.forwardRef(function () { return NgModel; })
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
var NgModel = (function (_super) {
    __extends(NgModel, _super);
    function NgModel(_validators, _asyncValidators, valueAccessors) {
        _super.call(this);
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        /** @internal */
        this._control = new model_1.Control();
        /** @internal */
        this._added = false;
        this.update = new async_1.EventEmitter();
        this.valueAccessor = shared_1.selectValueAccessor(this, valueAccessors);
    }
    NgModel.prototype.ngOnChanges = function (changes) {
        if (!this._added) {
            shared_1.setUpControl(this._control, this);
            this._control.updateValueAndValidity({ emitEvent: false });
            this._added = true;
        }
        if (shared_1.isPropertyUpdated(changes, this.viewModel)) {
            this._control.updateValue(this.model);
            this.viewModel = this.model;
        }
    };
    Object.defineProperty(NgModel.prototype, "control", {
        get: function () { return this._control; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModel.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModel.prototype, "validator", {
        get: function () { return shared_1.composeValidators(this._validators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModel.prototype, "asyncValidator", {
        get: function () { return shared_1.composeAsyncValidators(this._asyncValidators); },
        enumerable: true,
        configurable: true
    });
    NgModel.prototype.viewToModelUpdate = function (newValue) {
        this.viewModel = newValue;
        async_1.ObservableWrapper.callEmit(this.update, newValue);
    };
    NgModel = __decorate([
        core_1.Directive({
            selector: '[ngModel]:not([ngControl]):not([ngFormControl])',
            bindings: [exports.formControlBinding],
            inputs: ['model: ngModel'],
            outputs: ['update: ngModelChange'],
            exportAs: 'ngForm'
        }),
        __param(0, core_1.Optional()),
        __param(0, core_1.Self()),
        __param(0, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)),
        __param(2, core_1.Optional()),
        __param(2, core_1.Self()),
        __param(2, core_1.Inject(control_value_accessor_1.NG_VALUE_ACCESSOR)), 
        __metadata('design:paramtypes', [Array, Array, Array])
    ], NgModel);
    return NgModel;
}(ng_control_1.NgControl));
exports.NgModel = NgModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBU08sZUFBZSxDQUFDLENBQUE7QUFDdkIsdUNBQXNELDBCQUEwQixDQUFDLENBQUE7QUFDakYsMkJBQXdCLGNBQWMsQ0FBQyxDQUFBO0FBQ3ZDLHNCQUFzQixVQUFVLENBQUMsQ0FBQTtBQUNqQywyQkFBaUQsZUFBZSxDQUFDLENBQUE7QUFDakUsdUJBTU8sVUFBVSxDQUFDLENBQUE7QUFHTCwwQkFBa0I7QUFDM0Isa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7SUFDekMsT0FBTyxFQUFFLHNCQUFTO0lBQ2xCLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxDQUFDO0NBQ3ZDLENBQUM7QUFFTjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFRSDtJQUE2QiwyQkFBUztJQVNwQyxpQkFBK0QsV0FBa0IsRUFDWixnQkFBdUIsRUFFaEYsY0FBc0M7UUFDaEQsaUJBQU8sQ0FBQztRQUpxRCxnQkFBVyxHQUFYLFdBQVcsQ0FBTztRQUNaLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBTztRQVQ1RixnQkFBZ0I7UUFDaEIsYUFBUSxHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7UUFDekIsZ0JBQWdCO1FBQ2hCLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFDZixXQUFNLEdBQUcsSUFBSSxvQkFBWSxFQUFFLENBQUM7UUFTMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyw0QkFBbUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELDZCQUFXLEdBQVgsVUFBWSxPQUFzQztRQUNoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLHFCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLDBCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFFRCxzQkFBSSw0QkFBTzthQUFYLGNBQXlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFaEQsc0JBQUkseUJBQUk7YUFBUixjQUF1QixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFbkMsc0JBQUksOEJBQVM7YUFBYixjQUErQixNQUFNLENBQUMsMEJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFNUUsc0JBQUksbUNBQWM7YUFBbEIsY0FBeUMsTUFBTSxDQUFDLCtCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFaEcsbUNBQWlCLEdBQWpCLFVBQWtCLFFBQWE7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIseUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQWhESDtRQUFDLGdCQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsaURBQWlEO1lBQzNELFFBQVEsRUFBRSxDQUFDLDBCQUFrQixDQUFDO1lBQzlCLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzFCLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1lBQ2xDLFFBQVEsRUFBRSxRQUFRO1NBQ25CLENBQUM7bUJBVWEsZUFBUSxFQUFFO21CQUFFLFdBQUksRUFBRTttQkFBRSxhQUFNLENBQUMsMEJBQWEsQ0FBQzttQkFDekMsZUFBUSxFQUFFO21CQUFFLFdBQUksRUFBRTttQkFBRSxhQUFNLENBQUMsZ0NBQW1CLENBQUM7bUJBQy9DLGVBQVEsRUFBRTttQkFBRSxXQUFJLEVBQUU7bUJBQUUsYUFBTSxDQUFDLDBDQUFpQixDQUFDOztlQVoxRDtJQTJDRixjQUFDO0FBQUQsQ0FBQyxBQTFDRCxDQUE2QixzQkFBUyxHQTBDckM7QUExQ1ksZUFBTyxVQTBDbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZSxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge0NvbnRyb2x9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7TkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5pbXBvcnQge1xuICBzZXRVcENvbnRyb2wsXG4gIGlzUHJvcGVydHlVcGRhdGVkLFxuICBzZWxlY3RWYWx1ZUFjY2Vzc29yLFxuICBjb21wb3NlVmFsaWRhdG9ycyxcbiAgY29tcG9zZUFzeW5jVmFsaWRhdG9yc1xufSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1ZhbGlkYXRvckZuLCBBc3luY1ZhbGlkYXRvckZufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG5leHBvcnQgY29uc3QgZm9ybUNvbnRyb2xCaW5kaW5nOiBhbnkgPVxuICAgIC8qQHRzMmRhcnRfY29uc3QqLyAvKiBAdHMyZGFydF9Qcm92aWRlciAqLyB7XG4gICAgICBwcm92aWRlOiBOZ0NvbnRyb2wsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ01vZGVsKVxuICAgIH07XG5cbi8qKlxuICogQmluZHMgYSBkb21haW4gbW9kZWwgdG8gYSBmb3JtIGNvbnRyb2wuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogYG5nTW9kZWxgIGJpbmRzIGFuIGV4aXN0aW5nIGRvbWFpbiBtb2RlbCB0byBhIGZvcm0gY29udHJvbC4gRm9yIGFcbiAqIHR3by13YXkgYmluZGluZywgdXNlIGBbKG5nTW9kZWwpXWAgdG8gZW5zdXJlIHRoZSBtb2RlbCB1cGRhdGVzIGluXG4gKiBib3RoIGRpcmVjdGlvbnMuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1IzVVg1cURhVXFGTzJWWVIwVXpIP3A9cHJldmlldykpXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcInNlYXJjaC1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYDxpbnB1dCB0eXBlPSd0ZXh0JyBbKG5nTW9kZWwpXT1cInNlYXJjaFF1ZXJ5XCI+YFxuICogICAgICB9KVxuICogY2xhc3MgU2VhcmNoQ29tcCB7XG4gKiAgc2VhcmNoUXVlcnk6IHN0cmluZztcbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nTW9kZWxdOm5vdChbbmdDb250cm9sXSk6bm90KFtuZ0Zvcm1Db250cm9sXSknLFxuICBiaW5kaW5nczogW2Zvcm1Db250cm9sQmluZGluZ10sXG4gIGlucHV0czogWydtb2RlbDogbmdNb2RlbCddLFxuICBvdXRwdXRzOiBbJ3VwZGF0ZTogbmdNb2RlbENoYW5nZSddLFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdNb2RlbCBleHRlbmRzIE5nQ29udHJvbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnRyb2wgPSBuZXcgQ29udHJvbCgpO1xuICAvKiogQGludGVybmFsICovXG4gIF9hZGRlZCA9IGZhbHNlO1xuICB1cGRhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIG1vZGVsOiBhbnk7XG4gIHZpZXdNb2RlbDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICAgICAgICAgICAgdmFsdWVBY2Nlc3NvcnM6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczoge1trZXk6IHN0cmluZ106IFNpbXBsZUNoYW5nZX0pIHtcbiAgICBpZiAoIXRoaXMuX2FkZGVkKSB7XG4gICAgICBzZXRVcENvbnRyb2wodGhpcy5fY29udHJvbCwgdGhpcyk7XG4gICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIHRoaXMuX2FkZGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlKHRoaXMubW9kZWwpO1xuICAgICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLm1vZGVsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2wgeyByZXR1cm4gdGhpcy5fY29udHJvbDsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3JGbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZuIHsgcmV0dXJuIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTsgfVxuXG4gIHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdNb2RlbCA9IG5ld1ZhbHVlO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMudXBkYXRlLCBuZXdWYWx1ZSk7XG4gIH1cbn1cbiJdfQ==