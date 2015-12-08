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
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { NgControl } from './ng_control';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { setUpControl, composeValidators, composeAsyncValidators, isPropertyUpdated, selectValueAccessor } from './shared';
const formControlBinding = CONST_EXPR(new Provider(NgControl, { useExisting: forwardRef(() => NgFormControl) }));
/**
 * Binds an existing {@link Control} to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jcQlZ2tTh22BZZ2ucNAT?p=preview))
 *
 * In this example, we bind the control to an input element. When the value of the input element
 * changes, the value of the control will reflect that change. Likewise, if the value of the
 * control changes, the input element reflects that change.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormControl Example</h2>
 *       <form>
 *         <p>Element with existing control: <input type="text"
 * [ng-form-control]="loginControl"></p>
 *         <p>Value of existing control: {{loginControl.value}}</p>
 *       </form>
 *     </div>
 *   `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginControl: Control = new Control('');
 * }
 *  ```
 *
 * ###ng-model
 *
 * We can also use `ng-model` to bind a domain model to the form.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yHMLuHO7DNgT8XvtjTDH?p=preview))
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: "<input type='text' [ng-form-control]='loginControl' [(ng-model)]='login'>"
 *      })
 * class LoginComp {
 *  loginControl: Control = new Control('');
 *  login:string;
 * }
 *  ```
 */
export let NgFormControl = class extends NgControl {
    constructor(_validators, _asyncValidators, valueAccessors) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.update = new EventEmitter();
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    ngOnChanges(changes) {
        if (this._isControlChanged(changes)) {
            setUpControl(this.form, this);
            this.form.updateValueAndValidity({ emitEvent: false });
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this.form.updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    get path() { return []; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
    get control() { return this.form; }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callEmit(this.update, newValue);
    }
    _isControlChanged(changes) {
        return StringMapWrapper.contains(changes, "form");
    }
};
NgFormControl = __decorate([
    Directive({
        selector: '[ng-form-control]',
        bindings: [formControlBinding],
        inputs: ['form: ngFormControl', 'model: ngModel'],
        outputs: ['update: ngModelChange'],
        exportAs: 'ngForm'
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
], NgFormControl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9jb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2Zvcm1fY29udHJvbC50cyJdLCJuYW1lcyI6WyJOZ0Zvcm1Db250cm9sIiwiTmdGb3JtQ29udHJvbC5jb25zdHJ1Y3RvciIsIk5nRm9ybUNvbnRyb2wubmdPbkNoYW5nZXMiLCJOZ0Zvcm1Db250cm9sLnBhdGgiLCJOZ0Zvcm1Db250cm9sLnZhbGlkYXRvciIsIk5nRm9ybUNvbnRyb2wuYXN5bmNWYWxpZGF0b3IiLCJOZ0Zvcm1Db250cm9sLmNvbnRyb2wiLCJOZ0Zvcm1Db250cm9sLnZpZXdUb01vZGVsVXBkYXRlIiwiTmdGb3JtQ29udHJvbC5faXNDb250cm9sQ2hhbmdlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBSUwsU0FBUyxFQUNULFVBQVUsRUFDVixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixJQUFJLEVBQ0wsTUFBTSxlQUFlO09BQ2YsRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjO09BRS9CLEVBQWEsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtPQUNyRSxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQjtPQUN6RSxFQUNMLFlBQVksRUFDWixpQkFBaUIsRUFDakIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDcEIsTUFBTSxVQUFVO0FBRWpCLE1BQU0sa0JBQWtCLEdBQ3BCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sYUFBYSxDQUFDLEVBQUMsQ0FBQyxD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QyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUVoRCxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2tCQWlDM0Q7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZSxcbiAgUXVlcnksXG4gIERpcmVjdGl2ZSxcbiAgZm9yd2FyZFJlZixcbiAgUHJvdmlkZXIsXG4gIEluamVjdCxcbiAgT3B0aW9uYWwsXG4gIFNlbGZcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtcbiAgc2V0VXBDb250cm9sLFxuICBjb21wb3NlVmFsaWRhdG9ycyxcbiAgY29tcG9zZUFzeW5jVmFsaWRhdG9ycyxcbiAgaXNQcm9wZXJ0eVVwZGF0ZWQsXG4gIHNlbGVjdFZhbHVlQWNjZXNzb3Jcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBmb3JtQ29udHJvbEJpbmRpbmcgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5nQ29udHJvbCwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybUNvbnRyb2wpfSkpO1xuXG4vKipcbiAqIEJpbmRzIGFuIGV4aXN0aW5nIHtAbGluayBDb250cm9sfSB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9qY1FsWjJ0VGgyMkJaWjJ1Y05BVD9wPXByZXZpZXcpKVxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSwgd2UgYmluZCB0aGUgY29udHJvbCB0byBhbiBpbnB1dCBlbGVtZW50LiBXaGVuIHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQgZWxlbWVudFxuICogY2hhbmdlcywgdGhlIHZhbHVlIG9mIHRoZSBjb250cm9sIHdpbGwgcmVmbGVjdCB0aGF0IGNoYW5nZS4gTGlrZXdpc2UsIGlmIHRoZSB2YWx1ZSBvZiB0aGVcbiAqIGNvbnRyb2wgY2hhbmdlcywgdGhlIGlucHV0IGVsZW1lbnQgcmVmbGVjdHMgdGhhdCBjaGFuZ2UuXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5OZ0Zvcm1Db250cm9sIEV4YW1wbGU8L2gyPlxuICogICAgICAgPGZvcm0+XG4gKiAgICAgICAgIDxwPkVsZW1lbnQgd2l0aCBleGlzdGluZyBjb250cm9sOiA8aW5wdXQgdHlwZT1cInRleHRcIlxuICogW25nLWZvcm0tY29udHJvbF09XCJsb2dpbkNvbnRyb2xcIj48L3A+XG4gKiAgICAgICAgIDxwPlZhbHVlIG9mIGV4aXN0aW5nIGNvbnRyb2w6IHt7bG9naW5Db250cm9sLnZhbHVlfX08L3A+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDT1JFX0RJUkVDVElWRVMsIEZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgbG9naW5Db250cm9sOiBDb250cm9sID0gbmV3IENvbnRyb2woJycpO1xuICogfVxuICogIGBgYFxuICpcbiAqICMjI25nLW1vZGVsXG4gKlxuICogV2UgY2FuIGFsc28gdXNlIGBuZy1tb2RlbGAgdG8gYmluZCBhIGRvbWFpbiBtb2RlbCB0byB0aGUgZm9ybS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQveUhNTHVITzdETmdUOFh2dGpUREg/cD1wcmV2aWV3KSlcbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcImxvZ2luLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBcIjxpbnB1dCB0eXBlPSd0ZXh0JyBbbmctZm9ybS1jb250cm9sXT0nbG9naW5Db250cm9sJyBbKG5nLW1vZGVsKV09J2xvZ2luJz5cIlxuICogICAgICB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBsb2dpbkNvbnRyb2w6IENvbnRyb2wgPSBuZXcgQ29udHJvbCgnJyk7XG4gKiAgbG9naW46c3RyaW5nO1xuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctZm9ybS1jb250cm9sXScsXG4gIGJpbmRpbmdzOiBbZm9ybUNvbnRyb2xCaW5kaW5nXSxcbiAgaW5wdXRzOiBbJ2Zvcm06IG5nRm9ybUNvbnRyb2wnLCAnbW9kZWw6IG5nTW9kZWwnXSxcbiAgb3V0cHV0czogWyd1cGRhdGU6IG5nTW9kZWxDaGFuZ2UnXSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nRm9ybUNvbnRyb2wgZXh0ZW5kcyBOZ0NvbnRyb2wgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBmb3JtOiBDb250cm9sO1xuICB1cGRhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIG1vZGVsOiBhbnk7XG4gIHZpZXdNb2RlbDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOlxuICAgICAgICAgICAgICAgICAgLyogQXJyYXk8VmFsaWRhdG9yfEZ1bmN0aW9uPiAqLyBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczpcbiAgICAgICAgICAgICAgICAgIC8qIEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4gKi8gYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICAgICAgICAgICAgdmFsdWVBY2Nlc3NvcnM6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczoge1trZXk6IHN0cmluZ106IFNpbXBsZUNoYW5nZX0pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNDb250cm9sQ2hhbmdlZChjaGFuZ2VzKSkge1xuICAgICAgc2V0VXBDb250cm9sKHRoaXMuZm9ybSwgdGhpcyk7XG4gICAgICB0aGlzLmZvcm0udXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH1cbiAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICB0aGlzLmZvcm0udXBkYXRlVmFsdWUodGhpcy5tb2RlbCk7XG4gICAgICB0aGlzLnZpZXdNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICBnZXQgdmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTsgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2wgeyByZXR1cm4gdGhpcy5mb3JtOyB9XG5cbiAgdmlld1RvTW9kZWxVcGRhdGUobmV3VmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudmlld01vZGVsID0gbmV3VmFsdWU7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy51cGRhdGUsIG5ld1ZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2lzQ29udHJvbENoYW5nZWQoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyhjaGFuZ2VzLCBcImZvcm1cIik7XG4gIH1cbn1cbiJdfQ==