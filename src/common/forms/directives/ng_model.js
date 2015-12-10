'use strict';var __extends = (this && this.__extends) || function (d, b) {
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
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var control_value_accessor_1 = require('./control_value_accessor');
var ng_control_1 = require('./ng_control');
var model_1 = require('../model');
var validators_1 = require('../validators');
var shared_1 = require('./shared');
var formControlBinding = lang_1.CONST_EXPR(new core_1.Provider(ng_control_1.NgControl, { useExisting: core_1.forwardRef(function () { return NgModel; }) }));
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
            selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
            bindings: [formControlBinding],
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
})(ng_control_1.NgControl);
exports.NgModel = NgModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwudHMiXSwibmFtZXMiOlsiTmdNb2RlbCIsIk5nTW9kZWwuY29uc3RydWN0b3IiLCJOZ01vZGVsLm5nT25DaGFuZ2VzIiwiTmdNb2RlbC5jb250cm9sIiwiTmdNb2RlbC5wYXRoIiwiTmdNb2RlbC52YWxpZGF0b3IiLCJOZ01vZGVsLmFzeW5jVmFsaWRhdG9yIiwiTmdNb2RlbC52aWV3VG9Nb2RlbFVwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCxzQkFBOEMsMkJBQTJCLENBQUMsQ0FBQTtBQUMxRSxxQkFVTyxlQUFlLENBQUMsQ0FBQTtBQUN2Qix1Q0FBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRiwyQkFBd0IsY0FBYyxDQUFDLENBQUE7QUFDdkMsc0JBQXNCLFVBQVUsQ0FBQyxDQUFBO0FBQ2pDLDJCQUE2RCxlQUFlLENBQUMsQ0FBQTtBQUM3RSx1QkFNTyxVQUFVLENBQUMsQ0FBQTtBQUVsQixJQUFNLGtCQUFrQixHQUNwQixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUFDLHNCQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsaUJBQVUsQ0FBQyxjQUFNLE9BQUEsT0FBTyxFQUFQLENBQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWxGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNIO0lBTzZCQSwyQkFBU0E7SUFTcENBLGlCQUErREEsV0FBa0JBLEVBQ1pBLGdCQUF1QkEsRUFFaEZBLGNBQXNDQTtRQUNoREMsaUJBQU9BLENBQUNBO1FBSnFEQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBT0E7UUFDWkEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFPQTtRQVQ1RkEsZ0JBQWdCQTtRQUNoQkEsYUFBUUEsR0FBR0EsSUFB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Q0EsMENBQWlCQSxDQUFDQSxDQUFBQTs7Z0JBK0IzREE7SUFBREEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFqREQsRUFPNkIsc0JBQVMsRUEwQ3JDO0FBMUNZLGVBQU8sVUEwQ25CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2UsXG4gIFF1ZXJ5LFxuICBEaXJlY3RpdmUsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7XG4gIHNldFVwQ29udHJvbCxcbiAgaXNQcm9wZXJ0eVVwZGF0ZWQsXG4gIHNlbGVjdFZhbHVlQWNjZXNzb3IsXG4gIGNvbXBvc2VWYWxpZGF0b3JzLFxuICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzXG59IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgZm9ybUNvbnRyb2xCaW5kaW5nID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOZ0NvbnRyb2wsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ01vZGVsKX0pKTtcblxuLyoqXG4gKiBCaW5kcyBhIGRvbWFpbiBtb2RlbCB0byBhIGZvcm0gY29udHJvbC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBgbmctbW9kZWxgIGJpbmRzIGFuIGV4aXN0aW5nIGRvbWFpbiBtb2RlbCB0byBhIGZvcm0gY29udHJvbC4gRm9yIGFcbiAqIHR3by13YXkgYmluZGluZywgdXNlIGBbKG5nLW1vZGVsKV1gIHRvIGVuc3VyZSB0aGUgbW9kZWwgdXBkYXRlcyBpblxuICogYm90aCBkaXJlY3Rpb25zLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SM1VYNXFEYVVxRk8yVllSMFV6SD9wPXByZXZpZXcpKVxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJzZWFyY2gtY29tcFwiLFxuICogICAgICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXSxcbiAqICAgICAgdGVtcGxhdGU6IGA8aW5wdXQgdHlwZT0ndGV4dCcgWyhuZy1tb2RlbCldPVwic2VhcmNoUXVlcnlcIj5gXG4gKiAgICAgIH0pXG4gKiBjbGFzcyBTZWFyY2hDb21wIHtcbiAqICBzZWFyY2hRdWVyeTogc3RyaW5nO1xuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctbW9kZWxdOm5vdChbbmctY29udHJvbF0pOm5vdChbbmctZm9ybS1jb250cm9sXSknLFxuICBiaW5kaW5nczogW2Zvcm1Db250cm9sQmluZGluZ10sXG4gIGlucHV0czogWydtb2RlbDogbmdNb2RlbCddLFxuICBvdXRwdXRzOiBbJ3VwZGF0ZTogbmdNb2RlbENoYW5nZSddLFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdNb2RlbCBleHRlbmRzIE5nQ29udHJvbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnRyb2wgPSBuZXcgQ29udHJvbCgpO1xuICAvKiogQGludGVybmFsICovXG4gIF9hZGRlZCA9IGZhbHNlO1xuICB1cGRhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIG1vZGVsOiBhbnk7XG4gIHZpZXdNb2RlbDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICAgICAgICAgICAgdmFsdWVBY2Nlc3NvcnM6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczoge1trZXk6IHN0cmluZ106IFNpbXBsZUNoYW5nZX0pIHtcbiAgICBpZiAoIXRoaXMuX2FkZGVkKSB7XG4gICAgICBzZXRVcENvbnRyb2wodGhpcy5fY29udHJvbCwgdGhpcyk7XG4gICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIHRoaXMuX2FkZGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlKHRoaXMubW9kZWwpO1xuICAgICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLm1vZGVsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2wgeyByZXR1cm4gdGhpcy5fY29udHJvbDsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cblxuICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLnVwZGF0ZSwgbmV3VmFsdWUpO1xuICB9XG59XG4iXX0=