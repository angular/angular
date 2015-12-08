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
 *       <form #f="form" (ng-submit)="onSubmit(f.value)">
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
        exportAs: 'form'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)), 
    __metadata('design:paramtypes', [Array, Array])
], NgForm);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtLnRzIl0sIm5hbWVzIjpbIk5nRm9ybSIsIk5nRm9ybS5jb25zdHJ1Y3RvciIsIk5nRm9ybS5mb3JtRGlyZWN0aXZlIiwiTmdGb3JtLmNvbnRyb2wiLCJOZ0Zvcm0ucGF0aCIsIk5nRm9ybS5jb250cm9scyIsIk5nRm9ybS5hZGRDb250cm9sIiwiTmdGb3JtLmdldENvbnRyb2wiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbCIsIk5nRm9ybS5hZGRDb250cm9sR3JvdXAiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbEdyb3VwIiwiTmdGb3JtLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybS51cGRhdGVNb2RlbCIsIk5nRm9ybS5vblN1Ym1pdCIsIk5nRm9ybS5fZmluZENvbnRhaW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsWUFBWSxFQUViLE1BQU0sMkJBQTJCO09BQzNCLEVBQW1CLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNyRSxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDaEUsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWU7T0FJOUUsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQjtPQUM3QyxFQUFrQixZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sVUFBVTtPQUN4RCxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLFVBQVU7T0FDNUYsRUFBYSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFlO0FBRTVFLE1BQU0scUJBQXFCLEdBQ3ZCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FB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cGVyLFxuICBPYnNlcnZhYmxlV3JhcHBlcixcbiAgRXZlbnRFbWl0dGVyLFxuICBQcm9taXNlQ29tcGxldGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyLCBPcHRpb25hbCwgSW5qZWN0LCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7TmdDb250cm9sR3JvdXB9IGZyb20gJy4vbmdfY29udHJvbF9ncm91cCc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2wsIENvbnRyb2xHcm91cCwgQ29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIHNldFVwQ29udHJvbEdyb3VwLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgZm9ybURpcmVjdGl2ZVByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdGb3JtKX0pKTtcblxuLyoqXG4gKiBJZiBgTmdGb3JtYCBpcyBib3VuZCBpbiBhIGNvbXBvbmVudCwgYDxmb3JtPmAgZWxlbWVudHMgaW4gdGhhdCBjb21wb25lbnQgd2lsbCBiZVxuICogdXBncmFkZWQgdG8gdXNlIHRoZSBBbmd1bGFyIGZvcm0gc3lzdGVtLlxuICpcbiAqICMjIyBUeXBpY2FsIFVzZVxuICpcbiAqIEluY2x1ZGUgYEZPUk1fRElSRUNUSVZFU2AgaW4gdGhlIGBkaXJlY3RpdmVzYCBzZWN0aW9uIG9mIGEge0BsaW5rIFZpZXd9IGFubm90YXRpb25cbiAqIHRvIHVzZSBgTmdGb3JtYCBhbmQgaXRzIGFzc29jaWF0ZWQgY29udHJvbHMuXG4gKlxuICogIyMjIFN0cnVjdHVyZVxuICpcbiAqIEFuIEFuZ3VsYXIgZm9ybSBpcyBhIGNvbGxlY3Rpb24gb2YgYENvbnRyb2xgcyBpbiBzb21lIGhpZXJhcmNoeS5cbiAqIGBDb250cm9sYHMgY2FuIGJlIGF0IHRoZSB0b3AgbGV2ZWwgb3IgY2FuIGJlIG9yZ2FuaXplZCBpbiBgQ29udHJvbEdyb3VwYHNcbiAqIG9yIGBDb250cm9sQXJyYXlgcy4gVGhpcyBoaWVyYXJjaHkgaXMgcmVmbGVjdGVkIGluIHRoZSBmb3JtJ3MgYHZhbHVlYCwgYVxuICogSlNPTiBvYmplY3QgdGhhdCBtaXJyb3JzIHRoZSBmb3JtIHN0cnVjdHVyZS5cbiAqXG4gKiAjIyMgU3VibWlzc2lvblxuICpcbiAqIFRoZSBgbmctc3VibWl0YCBldmVudCBzaWduYWxzIHdoZW4gdGhlIHVzZXIgdHJpZ2dlcnMgYSBmb3JtIHN1Ym1pc3Npb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2x0ZGdZajRQMGlZNjRBUjcxRXBMP3A9cHJldmlldykpXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxwPlN1Ym1pdCB0aGUgZm9ybSB0byBzZWUgdGhlIGRhdGEgb2JqZWN0IEFuZ3VsYXIgYnVpbGRzPC9wPlxuICogICAgICAgPGgyPk5nRm9ybSBkZW1vPC9oMj5cbiAqICAgICAgIDxmb3JtICNmPVwiZm9ybVwiIChuZy1zdWJtaXQpPVwib25TdWJtaXQoZi52YWx1ZSlcIj5cbiAqICAgICAgICAgPGgzPkNvbnRyb2wgZ3JvdXA6IGNyZWRlbnRpYWxzPC9oMz5cbiAqICAgICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwiY3JlZGVudGlhbHNcIj5cbiAqICAgICAgICAgICA8cD5Mb2dpbjogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgICAgIDxwPlBhc3N3b3JkOiA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmctY29udHJvbD1cInBhc3N3b3JkXCI+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGgzPkNvbnRyb2wgZ3JvdXA6IHBlcnNvbjwvaDM+XG4gKiAgICAgICAgIDxkaXYgbmctY29udHJvbC1ncm91cD1cInBlcnNvblwiPlxuICogICAgICAgICAgIDxwPkZpcnN0IG5hbWU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLWNvbnRyb2w9XCJmaXJzdE5hbWVcIj48L3A+XG4gKiAgICAgICAgICAgPHA+TGFzdCBuYW1lOiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1jb250cm9sPVwibGFzdE5hbWVcIj48L3A+XG4gKiAgICAgICAgIDwvZGl2PlxuICogICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIj5TdWJtaXQgRm9ybTwvYnV0dG9uPlxuICogICAgICAgPHA+Rm9ybSBkYXRhIHN1Ym1pdHRlZDo8L3A+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgICA8cHJlPnt7ZGF0YX19PC9wcmU+XG4gKiAgICAgPC9kaXY+XG4gKiBgLFxuICogICBkaXJlY3RpdmVzOiBbQ09SRV9ESVJFQ1RJVkVTLCBGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge31cbiAqXG4gKiAgIGRhdGE6IHN0cmluZztcbiAqXG4gKiAgIG9uU3VibWl0KGRhdGEpIHtcbiAqICAgICB0aGlzLmRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdmb3JtOm5vdChbbmctbm8tZm9ybV0pOm5vdChbbmctZm9ybS1tb2RlbF0pLG5nLWZvcm0sW25nLWZvcm1dJyxcbiAgYmluZGluZ3M6IFtmb3JtRGlyZWN0aXZlUHJvdmlkZXJdLFxuICBob3N0OiB7XG4gICAgJyhzdWJtaXQpJzogJ29uU3VibWl0KCknLFxuICB9LFxuICBvdXRwdXRzOiBbJ25nU3VibWl0J10sXG4gIGV4cG9ydEFzOiAnZm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdGb3JtIGV4dGVuZHMgQ29udHJvbENvbnRhaW5lciBpbXBsZW1lbnRzIEZvcm0ge1xuICBmb3JtOiBDb250cm9sR3JvdXA7XG4gIG5nU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSB2YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIGFzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZm9ybSA9IG5ldyBDb250cm9sR3JvdXAoe30sIG51bGwsIGNvbXBvc2VWYWxpZGF0b3JzKHZhbGlkYXRvcnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zZUFzeW5jVmFsaWRhdG9ycyhhc3luY1ZhbGlkYXRvcnMpKTtcbiAgfVxuXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpczsgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2xHcm91cCB7IHJldHVybiB0aGlzLmZvcm07IH1cblxuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gIGdldCBjb250cm9scygpOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSB7IHJldHVybiB0aGlzLmZvcm0uY29udHJvbHM7IH1cblxuICBhZGRDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgdmFyIGN0cmwgPSBuZXcgQ29udHJvbCgpO1xuICAgICAgc2V0VXBDb250cm9sKGN0cmwsIGRpcik7XG4gICAgICBjb250YWluZXIuYWRkQ29udHJvbChkaXIubmFtZSwgY3RybCk7XG4gICAgICBjdHJsLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiBDb250cm9sIHsgcmV0dXJuIDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTsgfVxuXG4gIHJlbW92ZUNvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNvbnRhaW5lcikpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNvbnRyb2woZGlyLm5hbWUpO1xuICAgICAgICBjb250YWluZXIudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICB2YXIgZ3JvdXAgPSBuZXcgQ29udHJvbEdyb3VwKHt9KTtcbiAgICAgIHNldFVwQ29udHJvbEdyb3VwKGdyb3VwLCBkaXIpO1xuICAgICAgY29udGFpbmVyLmFkZENvbnRyb2woZGlyLm5hbWUsIGdyb3VwKTtcbiAgICAgIGdyb3VwLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgaWYgKGlzUHJlc2VudChjb250YWluZXIpKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDb250cm9sKGRpci5uYW1lKTtcbiAgICAgICAgY29udGFpbmVyLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogQ29udHJvbEdyb3VwIHtcbiAgICByZXR1cm4gPENvbnRyb2xHcm91cD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gIH1cblxuICB1cGRhdGVNb2RlbChkaXI6IE5nQ29udHJvbCwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjdHJsID0gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgICAgY3RybC51cGRhdGVWYWx1ZSh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBvblN1Ym1pdCgpOiBib29sZWFuIHtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLm5nU3VibWl0LCBudWxsKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kQ29udGFpbmVyKHBhdGg6IHN0cmluZ1tdKTogQ29udHJvbEdyb3VwIHtcbiAgICBwYXRoLnBvcCgpO1xuICAgIHJldHVybiBMaXN0V3JhcHBlci5pc0VtcHR5KHBhdGgpID8gdGhpcy5mb3JtIDogPENvbnRyb2xHcm91cD50aGlzLmZvcm0uZmluZChwYXRoKTtcbiAgfVxufVxuIl19