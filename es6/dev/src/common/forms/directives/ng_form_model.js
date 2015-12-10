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
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { ControlContainer } from './control_container';
import { setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators } from './shared';
import { Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const formDirectiveProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgFormModel) }));
/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ng-form-model]="loginForm">
 *         <p>Login: <input type="text" ng-control="login"></p>
 *         <p>Password: <input type="password" ng-control="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ng-form-model]='loginForm'>
 *          Login <input type='text' ng-control='login' [(ng-model)]='credentials.login'>
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
export let NgFormModel = class extends ControlContainer {
    constructor(_validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new EventEmitter();
    }
    ngOnChanges(changes) {
        if (StringMapWrapper.contains(changes, "form")) {
            var sync = composeValidators(this._validators);
            this.form.validator = Validators.compose([this.form.validator, sync]);
            var async = composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    }
    get formDirective() { return this; }
    get control() { return this.form; }
    get path() { return []; }
    addControl(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    }
    getControl(dir) { return this.form.find(dir.path); }
    removeControl(dir) { ListWrapper.remove(this.directives, dir); }
    addControlGroup(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    removeControlGroup(dir) { }
    getControlGroup(dir) {
        return this.form.find(dir.path);
    }
    updateModel(dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    }
    onSubmit() {
        ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    }
    /** @internal */
    _updateDomValue() {
        this.directives.forEach(dir => {
            var ctrl = this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    }
};
NgFormModel = __decorate([
    Directive({
        selector: '[ng-form-model]',
        bindings: [formDirectiveProvider],
        inputs: ['form: ng-form-model'],
        host: { '(submit)': 'onSubmit()' },
        outputs: ['ngSubmit'],
        exportAs: 'ngForm'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)), 
    __metadata('design:paramtypes', [Array, Array])
], NgFormModel);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX21vZGVsLnRzIl0sIm5hbWVzIjpbIk5nRm9ybU1vZGVsIiwiTmdGb3JtTW9kZWwuY29uc3RydWN0b3IiLCJOZ0Zvcm1Nb2RlbC5uZ09uQ2hhbmdlcyIsIk5nRm9ybU1vZGVsLmZvcm1EaXJlY3RpdmUiLCJOZ0Zvcm1Nb2RlbC5jb250cm9sIiwiTmdGb3JtTW9kZWwucGF0aCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2wiLCJOZ0Zvcm1Nb2RlbC5nZXRDb250cm9sIiwiTmdGb3JtTW9kZWwucmVtb3ZlQ29udHJvbCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnJlbW92ZUNvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnVwZGF0ZU1vZGVsIiwiTmdGb3JtTW9kZWwub25TdWJtaXQiLCJOZ0Zvcm1Nb2RlbC5fdXBkYXRlRG9tVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckUsRUFBQyxpQkFBaUIsRUFBRSxZQUFZLEVBQUMsTUFBTSwyQkFBMkI7T0FDbEUsRUFHTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLElBQUksRUFDTCxNQUFNLGVBQWU7T0FHZixFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO09BRzdDLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sVUFBVTtPQUM1RixFQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFl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QUFDQSxHQUFHQTtZQUN6QkEsSUFBSUEsSUFBSUEsR0FBUUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDekNBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQzNDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNIZCxDQUFDQTtBQS9FRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDakMsTUFBTSxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDL0IsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQztRQUNoQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDckIsUUFBUSxFQUFFLFFBQVE7S0FDbkIsQ0FBQztJQU9ZLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDMUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBOztnQkFnRTdEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlciwgRXZlbnRFbWl0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIFNpbXBsZUNoYW5nZSxcbiAgT25DaGFuZ2VzLFxuICBEaXJlY3RpdmUsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge05nQ29udHJvbEdyb3VwfSBmcm9tICcuL25nX2NvbnRyb2xfZ3JvdXAnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7Rm9ybX0gZnJvbSAnLi9mb3JtX2ludGVyZmFjZSc7XG5pbXBvcnQge0NvbnRyb2wsIENvbnRyb2xHcm91cH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIHNldFVwQ29udHJvbEdyb3VwLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgZm9ybURpcmVjdGl2ZVByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdGb3JtTW9kZWwpfSkpO1xuXG4vKipcbiAqIEJpbmRzIGFuIGV4aXN0aW5nIGNvbnRyb2wgZ3JvdXAgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvanFyVmlydWRZOGFuSnhUTVVqVFA/cD1wcmV2aWV3KSlcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUsIHdlIGJpbmQgdGhlIGNvbnRyb2wgZ3JvdXAgdG8gdGhlIGZvcm0gZWxlbWVudCwgYW5kIHdlIGJpbmQgdGhlIGxvZ2luIGFuZFxuICogcGFzc3dvcmQgY29udHJvbHMgdG8gdGhlIGxvZ2luIGFuZCBwYXNzd29yZCBlbGVtZW50cy5cbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgyPk5nRm9ybU1vZGVsIEV4YW1wbGU8L2gyPlxuICogICAgICAgPGZvcm0gW25nLWZvcm0tbW9kZWxdPVwibG9naW5Gb3JtXCI+XG4gKiAgICAgICAgIDxwPkxvZ2luOiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1jb250cm9sPVwibG9naW5cIj48L3A+XG4gKiAgICAgICAgIDxwPlBhc3N3b3JkOiA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmctY29udHJvbD1cInBhc3N3b3JkXCI+PC9wPlxuICogICAgICAgPC9mb3JtPlxuICogICAgICAgPHA+VmFsdWU6PC9wPlxuICogICAgICAgPHByZT57e3ZhbHVlfX08L3ByZT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgbG9naW5Gb3JtOiBDb250cm9sR3JvdXA7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLmxvZ2luRm9ybSA9IG5ldyBDb250cm9sR3JvdXAoe1xuICogICAgICAgbG9naW46IG5ldyBDb250cm9sKFwiXCIpLFxuICogICAgICAgcGFzc3dvcmQ6IG5ldyBDb250cm9sKFwiXCIpXG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICogICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmxvZ2luRm9ybS52YWx1ZSwgbnVsbCwgMik7XG4gKiAgIH1cbiAqIH1cbiAqICBgYGBcbiAqXG4gKiBXZSBjYW4gYWxzbyB1c2UgbmctbW9kZWwgdG8gYmluZCBhIGRvbWFpbiBtb2RlbCB0byB0aGUgZm9ybS5cbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcImxvZ2luLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBgXG4gKiAgICAgICAgPGZvcm0gW25nLWZvcm0tbW9kZWxdPSdsb2dpbkZvcm0nPlxuICogICAgICAgICAgTG9naW4gPGlucHV0IHR5cGU9J3RleHQnIG5nLWNvbnRyb2w9J2xvZ2luJyBbKG5nLW1vZGVsKV09J2NyZWRlbnRpYWxzLmxvZ2luJz5cbiAqICAgICAgICAgIFBhc3N3b3JkIDxpbnB1dCB0eXBlPSdwYXNzd29yZCcgbmctY29udHJvbD0ncGFzc3dvcmQnXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgWyhuZy1tb2RlbCldPSdjcmVkZW50aWFscy5wYXNzd29yZCc+XG4gKiAgICAgICAgICA8YnV0dG9uIChjbGljayk9XCJvbkxvZ2luKClcIj5Mb2dpbjwvYnV0dG9uPlxuICogICAgICAgIDwvZm9ybT5gXG4gKiAgICAgIH0pXG4gKiBjbGFzcyBMb2dpbkNvbXAge1xuICogIGNyZWRlbnRpYWxzOiB7bG9naW46IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZ307XG4gKiAgbG9naW5Gb3JtOiBDb250cm9sR3JvdXA7XG4gKlxuICogIGNvbnN0cnVjdG9yKCkge1xuICogICAgdGhpcy5sb2dpbkZvcm0gPSBuZXcgQ29udHJvbEdyb3VwKHtcbiAqICAgICAgbG9naW46IG5ldyBDb250cm9sKFwiXCIpLFxuICogICAgICBwYXNzd29yZDogbmV3IENvbnRyb2woXCJcIilcbiAqICAgIH0pO1xuICogIH1cbiAqXG4gKiAgb25Mb2dpbigpOiB2b2lkIHtcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMubG9naW4gPT09ICdzb21lIGxvZ2luJ1xuICogICAgLy8gdGhpcy5jcmVkZW50aWFscy5wYXNzd29yZCA9PT0gJ3NvbWUgcGFzc3dvcmQnXG4gKiAgfVxuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctZm9ybS1tb2RlbF0nLFxuICBiaW5kaW5nczogW2Zvcm1EaXJlY3RpdmVQcm92aWRlcl0sXG4gIGlucHV0czogWydmb3JtOiBuZy1mb3JtLW1vZGVsJ10sXG4gIGhvc3Q6IHsnKHN1Ym1pdCknOiAnb25TdWJtaXQoKSd9LFxuICBvdXRwdXRzOiBbJ25nU3VibWl0J10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvcm1Nb2RlbCBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBGb3JtLFxuICAgIE9uQ2hhbmdlcyB7XG4gIGZvcm06IENvbnRyb2xHcm91cCA9IG51bGw7XG4gIGRpcmVjdGl2ZXM6IE5nQ29udHJvbFtdID0gW107XG4gIG5nU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczoge1trZXk6IHN0cmluZ106IFNpbXBsZUNoYW5nZX0pOiB2b2lkIHtcbiAgICBpZiAoU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyhjaGFuZ2VzLCBcImZvcm1cIikpIHtcbiAgICAgIHZhciBzeW5jID0gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7XG4gICAgICB0aGlzLmZvcm0udmFsaWRhdG9yID0gVmFsaWRhdG9ycy5jb21wb3NlKFt0aGlzLmZvcm0udmFsaWRhdG9yLCBzeW5jXSk7XG5cbiAgICAgIHZhciBhc3luYyA9IGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTtcbiAgICAgIHRoaXMuZm9ybS5hc3luY1ZhbGlkYXRvciA9IFZhbGlkYXRvcnMuY29tcG9zZUFzeW5jKFt0aGlzLmZvcm0uYXN5bmNWYWxpZGF0b3IsIGFzeW5jXSk7XG5cbiAgICAgIHRoaXMuZm9ybS51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogdHJ1ZSwgZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZURvbVZhbHVlKCk7XG4gIH1cblxuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHsgcmV0dXJuIHRoaXM7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtOyB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICBhZGRDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gICAgdmFyIGN0cmw6IGFueSA9IHRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICBzZXRVcENvbnRyb2woY3RybCwgZGlyKTtcbiAgICBjdHJsLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB0aGlzLmRpcmVjdGl2ZXMucHVzaChkaXIpO1xuICB9XG5cbiAgZ2V0Q29udHJvbChkaXI6IE5nQ29udHJvbCk6IENvbnRyb2wgeyByZXR1cm4gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpOyB9XG5cbiAgcmVtb3ZlQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5kaXJlY3RpdmVzLCBkaXIpOyB9XG5cbiAgYWRkQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApIHtcbiAgICB2YXIgY3RybDogYW55ID0gdGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgIHNldFVwQ29udHJvbEdyb3VwKGN0cmwsIGRpcik7XG4gICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gIH1cblxuICByZW1vdmVDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCkge31cblxuICBnZXRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IENvbnRyb2xHcm91cCB7XG4gICAgcmV0dXJuIDxDb250cm9sR3JvdXA+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICB9XG5cbiAgdXBkYXRlTW9kZWwoZGlyOiBOZ0NvbnRyb2wsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgY3RybMKgID0gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgIGN0cmwudXBkYXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgb25TdWJtaXQoKTogYm9vbGVhbiB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5uZ1N1Ym1pdCwgbnVsbCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXBkYXRlRG9tVmFsdWUoKSB7XG4gICAgdGhpcy5kaXJlY3RpdmVzLmZvckVhY2goZGlyID0+IHtcbiAgICAgIHZhciBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgICBkaXIudmFsdWVBY2Nlc3Nvci53cml0ZVZhbHVlKGN0cmwudmFsdWUpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=