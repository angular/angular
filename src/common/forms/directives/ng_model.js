'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwudHMiXSwibmFtZXMiOlsiTmdNb2RlbCIsIk5nTW9kZWwuY29uc3RydWN0b3IiLCJOZ01vZGVsLm5nT25DaGFuZ2VzIiwiTmdNb2RlbC5jb250cm9sIiwiTmdNb2RlbC5wYXRoIiwiTmdNb2RlbC52YWxpZGF0b3IiLCJOZ01vZGVsLmFzeW5jVmFsaWRhdG9yIiwiTmdNb2RlbC52aWV3VG9Nb2RlbFVwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLHFCQVVPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLHVDQUFzRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ2pGLDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUN2QyxzQkFBc0IsVUFBVSxDQUFDLENBQUE7QUFDakMsMkJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBQzdFLHVCQU1PLFVBQVUsQ0FBQyxDQUFBO0FBRWxCLElBQU0sa0JBQWtCLEdBQ3BCLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQUMsc0JBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0g7SUFPNkJBLDJCQUFTQTtJQVNwQ0EsaUJBQStEQSxXQUFrQkEsRUFDWkEsZ0JBQXVCQSxFQUVoRkEsY0FBc0NBO1FBQ2hEQyxpQkFBT0EsQ0FBQ0E7UUFKcURBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFPQTtRQUNaQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQU9BO1FBVDVGQSxnQkFBZ0JBO1FBQ2hCQSxhQUFRQSxHQUFHQSxJ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QUFDQSwwQ0FBaUJBLENBQUNBLENBQUFBOztnQkErQjNEQTtJQUFEQSxjQUFDQTtBQUFEQSxDQUFDQSxBQWpERCxFQU82QixzQkFBUyxFQTBDckM7QUExQ1ksZUFBTyxVQTBDbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZSxcbiAgUXVlcnksXG4gIERpcmVjdGl2ZSxcbiAgZm9yd2FyZFJlZixcbiAgUHJvdmlkZXIsXG4gIEluamVjdCxcbiAgT3B0aW9uYWwsXG4gIFNlbGZcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlMsIE5HX0FTWU5DX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtcbiAgc2V0VXBDb250cm9sLFxuICBpc1Byb3BlcnR5VXBkYXRlZCxcbiAgc2VsZWN0VmFsdWVBY2Nlc3NvcixcbiAgY29tcG9zZVZhbGlkYXRvcnMsXG4gIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnNcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBmb3JtQ29udHJvbEJpbmRpbmcgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5nQ29udHJvbCwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nTW9kZWwpfSkpO1xuXG4vKipcbiAqIEJpbmRzIGEgZG9tYWluIG1vZGVsIHRvIGEgZm9ybSBjb250cm9sLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIGBuZy1tb2RlbGAgYmluZHMgYW4gZXhpc3RpbmcgZG9tYWluIG1vZGVsIHRvIGEgZm9ybSBjb250cm9sLiBGb3IgYVxuICogdHdvLXdheSBiaW5kaW5nLCB1c2UgYFsobmctbW9kZWwpXWAgdG8gZW5zdXJlIHRoZSBtb2RlbCB1cGRhdGVzIGluXG4gKiBib3RoIGRpcmVjdGlvbnMuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1IzVVg1cURhVXFGTzJWWVIwVXpIP3A9cHJldmlldykpXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcInNlYXJjaC1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYDxpbnB1dCB0eXBlPSd0ZXh0JyBbKG5nLW1vZGVsKV09XCJzZWFyY2hRdWVyeVwiPmBcbiAqICAgICAgfSlcbiAqIGNsYXNzIFNlYXJjaENvbXAge1xuICogIHNlYXJjaFF1ZXJ5OiBzdHJpbmc7XG4gKiB9XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZy1tb2RlbF06bm90KFtuZy1jb250cm9sXSk6bm90KFtuZy1mb3JtLWNvbnRyb2xdKScsXG4gIGJpbmRpbmdzOiBbZm9ybUNvbnRyb2xCaW5kaW5nXSxcbiAgaW5wdXRzOiBbJ21vZGVsOiBuZ01vZGVsJ10sXG4gIG91dHB1dHM6IFsndXBkYXRlOiBuZ01vZGVsQ2hhbmdlJ10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ01vZGVsIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29udHJvbCA9IG5ldyBDb250cm9sKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZGVkID0gZmFsc2U7XG4gIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgbW9kZWw6IGFueTtcbiAgdmlld01vZGVsOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgICAgICAgICAgICB2YWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52YWx1ZUFjY2Vzc29yID0gc2VsZWN0VmFsdWVBY2Nlc3Nvcih0aGlzLCB2YWx1ZUFjY2Vzc29ycyk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiB7W2tleTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlfSkge1xuICAgIGlmICghdGhpcy5fYWRkZWQpIHtcbiAgICAgIHNldFVwQ29udHJvbCh0aGlzLl9jb250cm9sLCB0aGlzKTtcbiAgICAgIHRoaXMuX2NvbnRyb2wudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgdGhpcy5fYWRkZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChpc1Byb3BlcnR5VXBkYXRlZChjaGFuZ2VzLCB0aGlzLnZpZXdNb2RlbCkpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2wudXBkYXRlVmFsdWUodGhpcy5tb2RlbCk7XG4gICAgICB0aGlzLnZpZXdNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbCB7IHJldHVybiB0aGlzLl9jb250cm9sOyB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICBnZXQgdmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTsgfVxuXG4gIHZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdNb2RlbCA9IG5ld1ZhbHVlO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMudXBkYXRlLCBuZXdWYWx1ZSk7XG4gIH1cbn1cbiJdfQ==