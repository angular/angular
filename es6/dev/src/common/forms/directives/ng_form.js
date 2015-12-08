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
import { PromiseWrapper, ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { ListWrapper } from 'angular2/src/facade/collection';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { Directive, forwardRef, Provider, Optional, Inject, Self } from 'angular2/core';
import { ControlContainer } from './control_container';
import { ControlGroup, Control } from '../model';
import { setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators } from './shared';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const formDirectiveProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgForm) }));
/**
 * If `NgForm` is bound in a component, `<form>` elements in that component will be
 * upgraded to use the Angular form system.
 *
 * ### Typical Use
 *
 * Include `FORM_DIRECTIVES` in the `directives` section of a {@link View} annotation
 * to use `NgForm` and its associated controls.
 *
 * ### Structure
 *
 * An Angular form is a collection of `Control`s in some hierarchy.
 * `Control`s can be at the top level or can be organized in `ControlGroup`s
 * or `ControlArray`s. This hierarchy is reflected in the form's `value`, a
 * JSON object that mirrors the form structure.
 *
 * ### Submission
 *
 * The `ng-submit` event signals when the user triggers a form submission.
 *
 * ### Example ([live demo](http://plnkr.co/edit/ltdgYj4P0iY64AR71EpL?p=preview))
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <p>Submit the form to see the data object Angular builds</p>
 *       <h2>NgForm demo</h2>
 *       <form #f="ngForm" (ng-submit)="onSubmit(f.value)">
 *         <h3>Control group: credentials</h3>
 *         <div ng-control-group="credentials">
 *           <p>Login: <input type="text" ng-control="login"></p>
 *           <p>Password: <input type="password" ng-control="password"></p>
 *         </div>
 *         <h3>Control group: person</h3>
 *         <div ng-control-group="person">
 *           <p>First name: <input type="text" ng-control="firstName"></p>
 *           <p>Last name: <input type="text" ng-control="lastName"></p>
 *         </div>
 *         <button type="submit">Submit Form</button>
 *       <p>Form data submitted:</p>
 *       </form>
 *       <pre>{{data}}</pre>
 *     </div>
 * `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   constructor() {}
 *
 *   data: string;
 *
 *   onSubmit(data) {
 *     this.data = JSON.stringify(data, null, 2);
 *   }
 * }
 *  ```
 */
export let NgForm = class extends ControlContainer {
    constructor(validators, asyncValidators) {
        super();
        this.ngSubmit = new EventEmitter();
        this.form = new ControlGroup({}, null, composeValidators(validators), composeAsyncValidators(asyncValidators));
    }
    get formDirective() { return this; }
    get control() { return this.form; }
    get path() { return []; }
    get controls() { return this.form.controls; }
    addControl(dir) {
        PromiseWrapper.scheduleMicrotask(() => {
            var container = this._findContainer(dir.path);
            var ctrl = new Control();
            setUpControl(ctrl, dir);
            container.addControl(dir.name, ctrl);
            ctrl.updateValueAndValidity({ emitEvent: false });
        });
    }
    getControl(dir) { return this.form.find(dir.path); }
    removeControl(dir) {
        PromiseWrapper.scheduleMicrotask(() => {
            var container = this._findContainer(dir.path);
            if (isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValueAndValidity({ emitEvent: false });
            }
        });
    }
    addControlGroup(dir) {
        PromiseWrapper.scheduleMicrotask(() => {
            var container = this._findContainer(dir.path);
            var group = new ControlGroup({});
            setUpControlGroup(group, dir);
            container.addControl(dir.name, group);
            group.updateValueAndValidity({ emitEvent: false });
        });
    }
    removeControlGroup(dir) {
        PromiseWrapper.scheduleMicrotask(() => {
            var container = this._findContainer(dir.path);
            if (isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValueAndValidity({ emitEvent: false });
            }
        });
    }
    getControlGroup(dir) {
        return this.form.find(dir.path);
    }
    updateModel(dir, value) {
        PromiseWrapper.scheduleMicrotask(() => {
            var ctrl = this.form.find(dir.path);
            ctrl.updateValue(value);
        });
    }
    onSubmit() {
        ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    }
    /** @internal */
    _findContainer(path) {
        path.pop();
        return ListWrapper.isEmpty(path) ? this.form : this.form.find(path);
    }
};
NgForm = __decorate([
    Directive({
        selector: 'form:not([ng-no-form]):not([ng-form-model]),ng-form,[ng-form]',
        bindings: [formDirectiveProvider],
        host: {
            '(submit)': 'onSubmit()',
        },
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
], NgForm);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtLnRzIl0sIm5hbWVzIjpbIk5nRm9ybSIsIk5nRm9ybS5jb25zdHJ1Y3RvciIsIk5nRm9ybS5mb3JtRGlyZWN0aXZlIiwiTmdGb3JtLmNvbnRyb2wiLCJOZ0Zvcm0ucGF0aCIsIk5nRm9ybS5jb250cm9scyIsIk5nRm9ybS5hZGRDb250cm9sIiwiTmdGb3JtLmdldENvbnRyb2wiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbCIsIk5nRm9ybS5hZGRDb250cm9sR3JvdXAiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbEdyb3VwIiwiTmdGb3JtLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybS51cGRhdGVNb2RlbCIsIk5nRm9ybS5vblN1Ym1pdCIsIk5nRm9ybS5fZmluZENvbnRhaW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsWUFBWSxFQUViLE1BQU0sMkJBQTJCO09BQzNCLEVBQW1CLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNyRSxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDaEUsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWU7T0FJOUUsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQjtPQUM3QyxFQUFrQixZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sVUFBVTtPQUN4RCxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLFVBQVU7T0FDNUYsRUFBYSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFlO0FBRTVFLE1BQU0scUJBQXFCLEdBQ3ZCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FB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cGVyLFxuICBPYnNlcnZhYmxlV3JhcHBlcixcbiAgRXZlbnRFbWl0dGVyLFxuICBQcm9taXNlQ29tcGxldGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyLCBPcHRpb25hbCwgSW5qZWN0LCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7TmdDb250cm9sR3JvdXB9IGZyb20gJy4vbmdfY29udHJvbF9ncm91cCc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2wsIENvbnRyb2xHcm91cCwgQ29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIHNldFVwQ29udHJvbEdyb3VwLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgZm9ybURpcmVjdGl2ZVByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdGb3JtKX0pKTtcblxuLyoqXG4gKiBJZiBgTmdGb3JtYCBpcyBib3VuZCBpbiBhIGNvbXBvbmVudCwgYDxmb3JtPmAgZWxlbWVudHMgaW4gdGhhdCBjb21wb25lbnQgd2lsbCBiZVxuICogdXBncmFkZWQgdG8gdXNlIHRoZSBBbmd1bGFyIGZvcm0gc3lzdGVtLlxuICpcbiAqICMjIyBUeXBpY2FsIFVzZVxuICpcbiAqIEluY2x1ZGUgYEZPUk1fRElSRUNUSVZFU2AgaW4gdGhlIGBkaXJlY3RpdmVzYCBzZWN0aW9uIG9mIGEge0BsaW5rIFZpZXd9IGFubm90YXRpb25cbiAqIHRvIHVzZSBgTmdGb3JtYCBhbmQgaXRzIGFzc29jaWF0ZWQgY29udHJvbHMuXG4gKlxuICogIyMjIFN0cnVjdHVyZVxuICpcbiAqIEFuIEFuZ3VsYXIgZm9ybSBpcyBhIGNvbGxlY3Rpb24gb2YgYENvbnRyb2xgcyBpbiBzb21lIGhpZXJhcmNoeS5cbiAqIGBDb250cm9sYHMgY2FuIGJlIGF0IHRoZSB0b3AgbGV2ZWwgb3IgY2FuIGJlIG9yZ2FuaXplZCBpbiBgQ29udHJvbEdyb3VwYHNcbiAqIG9yIGBDb250cm9sQXJyYXlgcy4gVGhpcyBoaWVyYXJjaHkgaXMgcmVmbGVjdGVkIGluIHRoZSBmb3JtJ3MgYHZhbHVlYCwgYVxuICogSlNPTiBvYmplY3QgdGhhdCBtaXJyb3JzIHRoZSBmb3JtIHN0cnVjdHVyZS5cbiAqXG4gKiAjIyMgU3VibWlzc2lvblxuICpcbiAqIFRoZSBgbmctc3VibWl0YCBldmVudCBzaWduYWxzIHdoZW4gdGhlIHVzZXIgdHJpZ2dlcnMgYSBmb3JtIHN1Ym1pc3Npb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2x0ZGdZajRQMGlZNjRBUjcxRXBMP3A9cHJldmlldykpXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxwPlN1Ym1pdCB0aGUgZm9ybSB0byBzZWUgdGhlIGRhdGEgb2JqZWN0IEFuZ3VsYXIgYnVpbGRzPC9wPlxuICogICAgICAgPGgyPk5nRm9ybSBkZW1vPC9oMj5cbiAqICAgICAgIDxmb3JtICNmPVwibmdGb3JtXCIgKG5nLXN1Ym1pdCk9XCJvblN1Ym1pdChmLnZhbHVlKVwiPlxuICogICAgICAgICA8aDM+Q29udHJvbCBncm91cDogY3JlZGVudGlhbHM8L2gzPlxuICogICAgICAgICA8ZGl2IG5nLWNvbnRyb2wtZ3JvdXA9XCJjcmVkZW50aWFsc1wiPlxuICogICAgICAgICAgIDxwPkxvZ2luOiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1jb250cm9sPVwibG9naW5cIj48L3A+XG4gKiAgICAgICAgICAgPHA+UGFzc3dvcmQ6IDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuZy1jb250cm9sPVwicGFzc3dvcmRcIj48L3A+XG4gKiAgICAgICAgIDwvZGl2PlxuICogICAgICAgICA8aDM+Q29udHJvbCBncm91cDogcGVyc29uPC9oMz5cbiAqICAgICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwicGVyc29uXCI+XG4gKiAgICAgICAgICAgPHA+Rmlyc3QgbmFtZTogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cImZpcnN0TmFtZVwiPjwvcD5cbiAqICAgICAgICAgICA8cD5MYXN0IG5hbWU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLWNvbnRyb2w9XCJsYXN0TmFtZVwiPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiPlN1Ym1pdCBGb3JtPC9idXR0b24+XG4gKiAgICAgICA8cD5Gb3JtIGRhdGEgc3VibWl0dGVkOjwvcD5cbiAqICAgICAgIDwvZm9ybT5cbiAqICAgICAgIDxwcmU+e3tkYXRhfX08L3ByZT5cbiAqICAgICA8L2Rpdj5cbiAqIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDT1JFX0RJUkVDVElWRVMsIEZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgY29uc3RydWN0b3IoKSB7fVxuICpcbiAqICAgZGF0YTogc3RyaW5nO1xuICpcbiAqICAgb25TdWJtaXQoZGF0YSkge1xuICogICAgIHRoaXMuZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Zvcm06bm90KFtuZy1uby1mb3JtXSk6bm90KFtuZy1mb3JtLW1vZGVsXSksbmctZm9ybSxbbmctZm9ybV0nLFxuICBiaW5kaW5nczogW2Zvcm1EaXJlY3RpdmVQcm92aWRlcl0sXG4gIGhvc3Q6IHtcbiAgICAnKHN1Ym1pdCknOiAnb25TdWJtaXQoKScsXG4gIH0sXG4gIG91dHB1dHM6IFsnbmdTdWJtaXQnXSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nRm9ybSBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBGb3JtIHtcbiAgZm9ybTogQ29udHJvbEdyb3VwO1xuICBuZ1N1Ym1pdCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgdmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBhc3luY1ZhbGlkYXRvcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmZvcm0gPSBuZXcgQ29udHJvbEdyb3VwKHt9LCBudWxsLCBjb21wb3NlVmFsaWRhdG9ycyh2YWxpZGF0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnMoYXN5bmNWYWxpZGF0b3JzKSk7XG4gIH1cblxuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHsgcmV0dXJuIHRoaXM7IH1cblxuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtOyB9XG5cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICBnZXQgY29udHJvbHMoKToge1trZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbH0geyByZXR1cm4gdGhpcy5mb3JtLmNvbnRyb2xzOyB9XG5cbiAgYWRkQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIHZhciBjdHJsID0gbmV3IENvbnRyb2woKTtcbiAgICAgIHNldFVwQ29udHJvbChjdHJsLCBkaXIpO1xuICAgICAgY29udGFpbmVyLmFkZENvbnRyb2woZGlyLm5hbWUsIGN0cmwpO1xuICAgICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDb250cm9sKGRpcjogTmdDb250cm9sKTogQ29udHJvbCB7IHJldHVybiA8Q29udHJvbD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7IH1cblxuICByZW1vdmVDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgaWYgKGlzUHJlc2VudChjb250YWluZXIpKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDb250cm9sKGRpci5uYW1lKTtcbiAgICAgICAgY29udGFpbmVyLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFkZENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgdmFyIGdyb3VwID0gbmV3IENvbnRyb2xHcm91cCh7fSk7XG4gICAgICBzZXRVcENvbnRyb2xHcm91cChncm91cCwgZGlyKTtcbiAgICAgIGNvbnRhaW5lci5hZGRDb250cm9sKGRpci5uYW1lLCBncm91cCk7XG4gICAgICBncm91cC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY29udGFpbmVyKSkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ29udHJvbChkaXIubmFtZSk7XG4gICAgICAgIGNvbnRhaW5lci51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IENvbnRyb2xHcm91cCB7XG4gICAgcmV0dXJuIDxDb250cm9sR3JvdXA+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICB9XG5cbiAgdXBkYXRlTW9kZWwoZGlyOiBOZ0NvbnRyb2wsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY3RybCA9IDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICAgIGN0cmwudXBkYXRlVmFsdWUodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgb25TdWJtaXQoKTogYm9vbGVhbiB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5uZ1N1Ym1pdCwgbnVsbCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZENvbnRhaW5lcihwYXRoOiBzdHJpbmdbXSk6IENvbnRyb2xHcm91cCB7XG4gICAgcGF0aC5wb3AoKTtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuaXNFbXB0eShwYXRoKSA/IHRoaXMuZm9ybSA6IDxDb250cm9sR3JvdXA+dGhpcy5mb3JtLmZpbmQocGF0aCk7XG4gIH1cbn1cbiJdfQ==