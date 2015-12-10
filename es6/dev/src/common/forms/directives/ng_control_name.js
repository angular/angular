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
 *        <form #f="ngForm" (submit)='onLogIn(f.value)'>
 *          Login <input type='text' ng-control='login' #l="ngForm">
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
    ngOnChanges(changes) {
        if (!this._added) {
            this.formDirective.addControl(this);
            this._added = true;
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this.viewModel = this.model;
            this.formDirective.updateModel(this, this.model);
        }
    }
    ngOnDestroy() { this.formDirective.removeControl(this); }
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
        exportAs: 'ngForm'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9uYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2NvbnRyb2xfbmFtZS50cyJdLCJuYW1lcyI6WyJOZ0NvbnRyb2xOYW1lIiwiTmdDb250cm9sTmFtZS5jb25zdHJ1Y3RvciIsIk5nQ29udHJvbE5hbWUubmdPbkNoYW5nZXMiLCJOZ0NvbnRyb2xOYW1lLm5nT25EZXN0cm95IiwiTmdDb250cm9sTmFtZS52aWV3VG9Nb2RlbFVwZGF0ZSIsIk5nQ29udHJvbE5hbWUucGF0aCIsIk5nQ29udHJvbE5hbWUuZm9ybURpcmVjdGl2ZSIsIk5nQ29udHJvbE5hbWUudmFsaWRhdG9yIiwiTmdDb250cm9sTmFtZS5hc3luY1ZhbGlkYXRvciIsIk5nQ29udHJvbE5hbWUuY29udHJvbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FFbEUsRUFLTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLElBQUksRUFDSixRQUFRLEVBQ1IsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxFQUNMLE1BQU0sZUFBZTtPQUVmLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FDN0MsRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjO09BQy9CLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCO09BQ3pFLEVBQ0wsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsaUJBQWlCLEVBQ2pCLG1CQUFtQixFQUNwQixNQUFNLFVBQVU7T0FFVixFQUFhLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGVBQWU7QUFHNUUsTUFBTSxrQkFBa0IsR0FDcEIsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcs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QWlCLEVBQUUsZ0JBQWdCLENBQUM7UUFDN0MsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7UUFDbEMsUUFBUSxFQUFFLFFBQVE7S0FDbkIsQ0FBQztJQVNZLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ25CLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFMUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBRWhELFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7a0JBaUMzRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuaW1wb3J0IHtcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIFNpbXBsZUNoYW5nZSxcbiAgUXVlcnksXG4gIERpcmVjdGl2ZSxcbiAgZm9yd2FyZFJlZixcbiAgSG9zdCxcbiAgU2tpcFNlbGYsXG4gIFByb3ZpZGVyLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7XG4gIGNvbnRyb2xQYXRoLFxuICBjb21wb3NlVmFsaWRhdG9ycyxcbiAgY29tcG9zZUFzeW5jVmFsaWRhdG9ycyxcbiAgaXNQcm9wZXJ0eVVwZGF0ZWQsXG4gIHNlbGVjdFZhbHVlQWNjZXNzb3Jcbn0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlMsIE5HX0FTWU5DX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG5cbmNvbnN0IGNvbnRyb2xOYW1lQmluZGluZyA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoTmdDb250cm9sLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdDb250cm9sTmFtZSl9KSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgYmluZHMgYSBjb250cm9sIHdpdGggYSBzcGVjaWZpZWQgbmFtZSB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGNhbiBvbmx5IGJlIHVzZWQgYXMgYSBjaGlsZCBvZiB7QGxpbmsgTmdGb3JtfSBvciB7QGxpbmsgTmdGb3JtTW9kZWx9LlxuXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSwgd2UgY3JlYXRlIHRoZSBsb2dpbiBhbmQgcGFzc3dvcmQgY29udHJvbHMuXG4gKiBXZSBjYW4gd29yayB3aXRoIGVhY2ggY29udHJvbCBzZXBhcmF0ZWx5OiBjaGVjayBpdHMgdmFsaWRpdHksIGdldCBpdHMgdmFsdWUsIGxpc3RlbiB0byBpdHNcbiAqIGNoYW5nZXMuXG4gKlxuICogIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgICAgIHNlbGVjdG9yOiBcImxvZ2luLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBgXG4gKiAgICAgICAgPGZvcm0gI2Y9XCJuZ0Zvcm1cIiAoc3VibWl0KT0nb25Mb2dJbihmLnZhbHVlKSc+XG4gKiAgICAgICAgICBMb2dpbiA8aW5wdXQgdHlwZT0ndGV4dCcgbmctY29udHJvbD0nbG9naW4nICNsPVwibmdGb3JtXCI+XG4gKiAgICAgICAgICA8ZGl2ICpuZy1pZj1cIiFsLnZhbGlkXCI+TG9naW4gaXMgaW52YWxpZDwvZGl2PlxuICpcbiAqICAgICAgICAgIFBhc3N3b3JkIDxpbnB1dCB0eXBlPSdwYXNzd29yZCcgbmctY29udHJvbD0ncGFzc3dvcmQnPlxuICogICAgICAgICAgPGJ1dHRvbiB0eXBlPSdzdWJtaXQnPkxvZyBpbiE8L2J1dHRvbj5cbiAqICAgICAgICA8L2Zvcm0+XG4gKiAgICAgIGB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBvbkxvZ0luKHZhbHVlKTogdm9pZCB7XG4gKiAgICAvLyB2YWx1ZSA9PT0ge2xvZ2luOiAnc29tZSBsb2dpbicsIHBhc3N3b3JkOiAnc29tZSBwYXNzd29yZCd9XG4gKiAgfVxuICogfVxuICogIGBgYFxuICpcbiAqIFdlIGNhbiBhbHNvIHVzZSBuZy1tb2RlbCB0byBiaW5kIGEgZG9tYWluIG1vZGVsIHRvIHRoZSBmb3JtLlxuICpcbiAqICBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJsb2dpbi1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYFxuICogICAgICAgIDxmb3JtIChzdWJtaXQpPSdvbkxvZ0luKCknPlxuICogICAgICAgICAgTG9naW4gPGlucHV0IHR5cGU9J3RleHQnIG5nLWNvbnRyb2w9J2xvZ2luJyBbKG5nLW1vZGVsKV09XCJjcmVkZW50aWFscy5sb2dpblwiPlxuICogICAgICAgICAgUGFzc3dvcmQgPGlucHV0IHR5cGU9J3Bhc3N3b3JkJyBuZy1jb250cm9sPSdwYXNzd29yZCdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBbKG5nLW1vZGVsKV09XCJjcmVkZW50aWFscy5wYXNzd29yZFwiPlxuICogICAgICAgICAgPGJ1dHRvbiB0eXBlPSdzdWJtaXQnPkxvZyBpbiE8L2J1dHRvbj5cbiAqICAgICAgICA8L2Zvcm0+XG4gKiAgICAgIGB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBjcmVkZW50aWFsczoge2xvZ2luOnN0cmluZywgcGFzc3dvcmQ6c3RyaW5nfTtcbiAqXG4gKiAgb25Mb2dJbigpOiB2b2lkIHtcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMubG9naW4gPT09IFwic29tZSBsb2dpblwiXG4gKiAgICAvLyB0aGlzLmNyZWRlbnRpYWxzLnBhc3N3b3JkID09PSBcInNvbWUgcGFzc3dvcmRcIlxuICogIH1cbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nLWNvbnRyb2xdJyxcbiAgYmluZGluZ3M6IFtjb250cm9sTmFtZUJpbmRpbmddLFxuICBpbnB1dHM6IFsnbmFtZTogbmdDb250cm9sJywgJ21vZGVsOiBuZ01vZGVsJ10sXG4gIG91dHB1dHM6IFsndXBkYXRlOiBuZ01vZGVsQ2hhbmdlJ10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xOYW1lIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdXBkYXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBtb2RlbDogYW55O1xuICB2aWV3TW9kZWw6IGFueTtcbiAgcHJpdmF0ZSBfYWRkZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihASG9zdCgpIEBTa2lwU2VsZigpIHByaXZhdGUgX3BhcmVudDogQ29udHJvbENvbnRhaW5lcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6XG4gICAgICAgICAgICAgICAgICAvKiBBcnJheTxWYWxpZGF0b3J8RnVuY3Rpb24+ICovIGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOlxuICAgICAgICAgICAgICAgICAgLyogQXJyYXk8VmFsaWRhdG9yfEZ1bmN0aW9uPiAqLyBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgICAgICAgICAgICB2YWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52YWx1ZUFjY2Vzc29yID0gc2VsZWN0VmFsdWVBY2Nlc3Nvcih0aGlzLCB2YWx1ZUFjY2Vzc29ycyk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiB7W2tleTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlfSkge1xuICAgIGlmICghdGhpcy5fYWRkZWQpIHtcbiAgICAgIHRoaXMuZm9ybURpcmVjdGl2ZS5hZGRDb250cm9sKHRoaXMpO1xuICAgICAgdGhpcy5fYWRkZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlcywgdGhpcy52aWV3TW9kZWwpKSB7XG4gICAgICB0aGlzLnZpZXdNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICB0aGlzLmZvcm1EaXJlY3RpdmUudXBkYXRlTW9kZWwodGhpcywgdGhpcy5tb2RlbCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZS5yZW1vdmVDb250cm9sKHRoaXMpOyB9XG5cbiAgdmlld1RvTW9kZWxVcGRhdGUobmV3VmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudmlld01vZGVsID0gbmV3VmFsdWU7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy51cGRhdGUsIG5ld1ZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGNvbnRyb2xQYXRoKHRoaXMubmFtZSwgdGhpcy5fcGFyZW50KTsgfVxuXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IGFueSB7IHJldHVybiB0aGlzLl9wYXJlbnQuZm9ybURpcmVjdGl2ZTsgfVxuXG4gIGdldCB2YWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7IH1cblxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9hc3luY1ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbCB7IHJldHVybiB0aGlzLmZvcm1EaXJlY3RpdmUuZ2V0Q29udHJvbCh0aGlzKTsgfVxufVxuIl19