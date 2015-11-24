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
import { Directive, forwardRef, Host, SkipSelf, Provider, Inject, Optional, Self } from 'angular2/core';
import { ControlContainer } from './control_container';
import { NgControl } from './ng_control';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { controlPath, composeValidators, composeAsyncValidators, isPropertyUpdated, selectValueAccessor } from './shared';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const controlNameBinding = CONST_EXPR(new Provider(NgControl, { useExisting: forwardRef(() => NgControlName) }));
/**
 * Creates and binds a control with a specified name to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.

 * ### Example
 *
 * In this example, we create the login and password controls.
 * We can work with each control separately: check its validity, get its value, listen to its
 * changes.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form #f="form" (submit)='onLogIn(f.value)'>
 *          Login <input type='text' ng-control='login' #l="form">
 *          <div *ng-if="!l.valid">Login is invalid</div>
 *
 *          Password <input type='password' ng-control='password'>
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  onLogIn(value): void {
 *    // value === {login: 'some login', password: 'some password'}
 *  }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form (submit)='onLogIn()'>
 *          Login <input type='text' ng-control='login' [(ng-model)]="credentials.login">
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]="credentials.password">
 *          <button type='submit'>Log in!</button>
 *        </form>
 *      `})
 * class LoginComp {
 *  credentials: {login:string, password:string};
 *
 *  onLogIn(): void {
 *    // this.credentials.login === "some login"
 *    // this.credentials.password === "some password"
 *  }
 * }
 *  ```
 */
export let NgControlName = class extends NgControl {
    constructor(_parent, _validators, _asyncValidators, valueAccessors) {
        super();
        this._parent = _parent;
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        /** @internal */
        this.update = new EventEmitter();
        this._added = false;
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    onChanges(changes) {
        if (!this._added) {
            this.formDirective.addControl(this);
            this._added = true;
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this.viewModel = this.model;
            this.formDirective.updateModel(this, this.model);
        }
    }
    onDestroy() { this.formDirective.removeControl(this); }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callEmit(this.update, newValue);
    }
    get path() { return controlPath(this.name, this._parent); }
    get formDirective() { return this._parent.formDirective; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
    get control() { return this.formDirective.getControl(this); }
};
NgControlName = __decorate([
    Directive({
        selector: '[ng-control]',
        bindings: [controlNameBinding],
        inputs: ['name: ngControl', 'model: ngModel'],
        outputs: ['update: ngModelChange'],
        exportAs: 'form'
    }),
    __param(0, Host()),
    __param(0, SkipSelf()),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_ASYNC_VALIDATORS)),
    __param(3, Optional()),
    __param(3, Self()),
    __param(3, Inject(NG_VALUE_ACCESSOR)), 
    __metadata('design:paramtypes', [ControlContainer, Array, Array, Array])
], NgControlName);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9uYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2NvbnRyb2xfbmFtZS50cyJdLCJuYW1lcyI6WyJOZ0NvbnRyb2xOYW1lIiwiTmdDb250cm9sTmFtZS5jb25zdHJ1Y3RvciIsIk5nQ29udHJvbE5hbWUub25DaGFuZ2VzIiwiTmdDb250cm9sTmFtZS5vbkRlc3Ryb3kiLCJOZ0NvbnRyb2xOYW1lLnZpZXdUb01vZGVsVXBkYXRlIiwiTmdDb250cm9sTmFtZS5wYXRoIiwiTmdDb250cm9sTmFtZS5mb3JtRGlyZWN0aXZlIiwiTmdDb250cm9sTmFtZS52YWxpZGF0b3IiLCJOZ0NvbnRyb2xOYW1lLmFzeW5jVmFsaWRhdG9yIiwiTmdDb250cm9sTmFtZS5jb250cm9sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQzVDLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BRWxFLEVBS0wsU0FBUyxFQUNULFVBQVUsRUFDVixJQUFJLEVBQ0osUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLElBQUksRUFDTCxNQUFNLGVBQWU7T0FFZixFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO09BQzdDLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYztPQUMvQixFQUF1QixpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQjtPQUN6RSxFQUNMLFdBQVcsRUFDWCxpQkFBaUIsRUFDakIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDcEIsTUFBTSxVQUFVO09BRVYsRUFBYSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFlO0FBRzVFLE1BQU0sa0JBQWtCLEdBQ3BCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sYUFBYSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNERztBQUNILHlDQU9tQyxTQUFTO0lBUTFDQSxZQUF3Q0EsT0FBeUJBLEVBQ0ZBLFdBQ1ZBLEVBQ2dCQSxnQkFDaEJBLEVBRXpDQSxjQUFzQ0E7UUFDaERDLE9BQU9BLENBQUNBO1FBUDhCQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFrQkE7UUFDRkEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQ3JCQTtRQUNnQkEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUNoQ0E7UUFWckRBLGdCQUFnQkE7UUFDaEJBLFdBQU1BLEdBQUdBLElBQUlBLFlBQVlBLEVBQUVBLENBQUNBO1FBR3BCQSxXQUFNQSxHQUFHQSxLQUFLQSxDQUFDQTtRQVVyQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsbUJBQW1CQSxDQUFDQSxJQUFJQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7SUFFREQsU0FBU0EsQ0FBQ0EsT0FBc0NBO1FBQzlDRSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDcENBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxpQkFBaUJBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9DQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUM1QkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGLFNBQVNBLEtBQVdHLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTdESCxpQkFBaUJBLENBQUNBLFFBQWFBO1FBQzdCSSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUMxQkEsaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUNwREEsQ0FBQ0E7SUFFREosSUFBSUEsSUFBSUEsS0FBZUssTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckVMLElBQUlBLGFBQWFBLEtBQVVNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRS9ETixJQUFJQSxTQUFTQSxLQUFlTyxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXpFUCxJQUFJQSxjQUFjQSxLQUFlUSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFeEZSLElBQUlBLE9BQU9BLEtBQWNTLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ3hFVCxDQUFDQTtBQXJERDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxjQUFjO1FBQ3hCLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixDQUFDO1FBQzlCLE1BQU0sRUFBRSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDO1FBQzdDLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1FBQ2xDLFFBQVEsRUFBRSxNQUFNO0tBQ2pCLENBQUM7SUFTWSxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNuQixXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRTFDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUVoRCxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUE7O2tCQWlDM0Q7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmltcG9ydCB7XG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBTaW1wbGVDaGFuZ2UsXG4gIFF1ZXJ5LFxuICBEaXJlY3RpdmUsXG4gIGZvcndhcmRSZWYsXG4gIEhvc3QsXG4gIFNraXBTZWxmLFxuICBQcm92aWRlcixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge1xuICBjb250cm9sUGF0aCxcbiAgY29tcG9zZVZhbGlkYXRvcnMsXG4gIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMsXG4gIGlzUHJvcGVydHlVcGRhdGVkLFxuICBzZWxlY3RWYWx1ZUFjY2Vzc29yXG59IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7Q29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuXG5jb25zdCBjb250cm9sTmFtZUJpbmRpbmcgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5nQ29udHJvbCwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nQ29udHJvbE5hbWUpfSkpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGJpbmRzIGEgY29udHJvbCB3aXRoIGEgc3BlY2lmaWVkIG5hbWUgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSBjYW4gb25seSBiZSB1c2VkIGFzIGEgY2hpbGQgb2Yge0BsaW5rIE5nRm9ybX0gb3Ige0BsaW5rIE5nRm9ybU1vZGVsfS5cblxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUsIHdlIGNyZWF0ZSB0aGUgbG9naW4gYW5kIHBhc3N3b3JkIGNvbnRyb2xzLlxuICogV2UgY2FuIHdvcmsgd2l0aCBlYWNoIGNvbnRyb2wgc2VwYXJhdGVseTogY2hlY2sgaXRzIHZhbGlkaXR5LCBnZXQgaXRzIHZhbHVlLCBsaXN0ZW4gdG8gaXRzXG4gKiBjaGFuZ2VzLlxuICpcbiAqICBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJsb2dpbi1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYFxuICogICAgICAgIDxmb3JtICNmPVwiZm9ybVwiIChzdWJtaXQpPSdvbkxvZ0luKGYudmFsdWUpJz5cbiAqICAgICAgICAgIExvZ2luIDxpbnB1dCB0eXBlPSd0ZXh0JyBuZy1jb250cm9sPSdsb2dpbicgI2w9XCJmb3JtXCI+XG4gKiAgICAgICAgICA8ZGl2ICpuZy1pZj1cIiFsLnZhbGlkXCI+TG9naW4gaXMgaW52YWxpZDwvZGl2PlxuICpcbiAqICAgICAgICAgIFBhc3N3b3JkIDxpbnB1dCB0eXBlPSdwYXNzd29yZCcgbmctY29udHJvbD0ncGFzc3dvcmQnPlxuICogICAgICAgICAgPGJ1dHRvbiB0eXBlPSdzdWJtaXQnPkxvZyBpbiE8L2J1dHRvbj5cbiAqICAgICAgICA8L2Zvcm0+XG4gKiAgICAgIGB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBvbkxvZ0luKHZhbHVlKTogdm9pZCB7XG4gKiAgICAvLyB2YWx1ZSA9PT0ge2xvZ2luOiAnc29tZSBsb2dpbicsIHBhc3N3b3JkOiAnc29tZSBwYXNzd29yZCd9XG4gKiAgfVxuICogfVxuICogIGBgYFxuICpcbiAqIFdlIGNhbiBhbHNvIHVzZSBuZy1tb2RlbCB0byBiaW5kIGEgZG9tYWluIG1vZGVsIHRvIHRoZSBmb3JtLlxuICpcbiAqICBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJsb2dpbi1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYFxuICogICAgICAgIDxmb3JtIChzdWJtaXQpPSdvbkxvZ0luKCknPlxuICogICAgICAgICAgTG9naW4gPGlucHV0IHR5cGU9J3RleHQnIG5nLWNvbnRyb2w9J2xvZ2luJyBbKG5nLW1vZGVsKV09XCJjcmVkZW50aWFscy5sb2dpblwiPlxuICogICAgICAgICAgUGFzc3dvcmQgPGlucHV0IHR5cGU9J3Bhc3N3b3JkJyBuZy1jb250cm9sPSdwYXNzd29yZCdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBbKG5nLW1vZGVsKV09XCJjcmVkZW50aWFscy5wYXNzd29yZFwiPlxuICogICAgICAgICAgPGJ1dHRvbiB0eXBlPSdzdWJtaXQnPkxvZyBpbiE8L2J1dHRvbj5cbiAqICAgICAgICA8L2Zvcm0+XG4gKiAgICAgIGB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBjcmVkZW50aWFsczoge2xvZ2luOnN0cmluZywgcGFzc3dvcmQ6c3RyaW5nfTtcbiAqXG4gKiAgb25Mb2dJbigpOiB2b2lkIHtcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMubG9naW4gPT09IFwic29tZSBsb2dpblwiXG4gKiAgICAvLyB0aGlzLmNyZWRlbnRpYWxzLnBhc3N3b3JkID09PSBcInNvbWUgcGFzc3dvcmRcIlxuICogIH1cbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nLWNvbnRyb2xdJyxcbiAgYmluZGluZ3M6IFtjb250cm9sTmFtZUJpbmRpbmddLFxuICBpbnB1dHM6IFsnbmFtZTogbmdDb250cm9sJywgJ21vZGVsOiBuZ01vZGVsJ10sXG4gIG91dHB1dHM6IFsndXBkYXRlOiBuZ01vZGVsQ2hhbmdlJ10sXG4gIGV4cG9ydEFzOiAnZm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdDb250cm9sTmFtZSBleHRlbmRzIE5nQ29udHJvbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyxcbiAgICBPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgbW9kZWw6IGFueTtcbiAgdmlld01vZGVsOiBhbnk7XG4gIHByaXZhdGUgX2FkZGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoQEhvc3QoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnQ6IENvbnRyb2xDb250YWluZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOlxuICAgICAgICAgICAgICAgICAgLyogQXJyYXk8VmFsaWRhdG9yfEZ1bmN0aW9uPiAqLyBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczpcbiAgICAgICAgICAgICAgICAgIC8qIEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4gKi8gYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICAgICAgICAgICAgdmFsdWVBY2Nlc3NvcnM6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmFsdWVBY2Nlc3NvciA9IHNlbGVjdFZhbHVlQWNjZXNzb3IodGhpcywgdmFsdWVBY2Nlc3NvcnMpO1xuICB9XG5cbiAgb25DaGFuZ2VzKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBTaW1wbGVDaGFuZ2V9KSB7XG4gICAgaWYgKCF0aGlzLl9hZGRlZCkge1xuICAgICAgdGhpcy5mb3JtRGlyZWN0aXZlLmFkZENvbnRyb2wodGhpcyk7XG4gICAgICB0aGlzLl9hZGRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChpc1Byb3BlcnR5VXBkYXRlZChjaGFuZ2VzLCB0aGlzLnZpZXdNb2RlbCkpIHtcbiAgICAgIHRoaXMudmlld01vZGVsID0gdGhpcy5tb2RlbDtcbiAgICAgIHRoaXMuZm9ybURpcmVjdGl2ZS51cGRhdGVNb2RlbCh0aGlzLCB0aGlzLm1vZGVsKTtcbiAgICB9XG4gIH1cblxuICBvbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZS5yZW1vdmVDb250cm9sKHRoaXMpOyB9XG5cbiAgdmlld1RvTW9kZWxVcGRhdGUobmV3VmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudmlld01vZGVsID0gbmV3VmFsdWU7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy51cGRhdGUsIG5ld1ZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGNvbnRyb2xQYXRoKHRoaXMubmFtZSwgdGhpcy5fcGFyZW50KTsgfVxuXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IGFueSB7IHJldHVybiB0aGlzLl9wYXJlbnQuZm9ybURpcmVjdGl2ZTsgfVxuXG4gIGdldCB2YWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7IH1cblxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9hc3luY1ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbCB7IHJldHVybiB0aGlzLmZvcm1EaXJlY3RpdmUuZ2V0Q29udHJvbCh0aGlzKTsgfVxufVxuIl19