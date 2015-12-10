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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtLnRzIl0sIm5hbWVzIjpbIk5nRm9ybSIsIk5nRm9ybS5jb25zdHJ1Y3RvciIsIk5nRm9ybS5mb3JtRGlyZWN0aXZlIiwiTmdGb3JtLmNvbnRyb2wiLCJOZ0Zvcm0ucGF0aCIsIk5nRm9ybS5jb250cm9scyIsIk5nRm9ybS5hZGRDb250cm9sIiwiTmdGb3JtLmdldENvbnRyb2wiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbCIsIk5nRm9ybS5hZGRDb250cm9sR3JvdXAiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbEdyb3VwIiwiTmdGb3JtLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybS51cGRhdGVNb2RlbCIsIk5nRm9ybS5vblN1Ym1pdCIsIk5nRm9ybS5fZmluZENvbnRhaW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFDTCxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLFlBQVksRUFFYixNQUFNLDJCQUEyQjtPQUMzQixFQUFtQixXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckUsRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQ2hFLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsTUFBTSxlQUFlO09BSTlFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FDN0MsRUFBa0IsWUFBWSxFQUFFLE9BQU8sRUFBQyxNQUFNLFVBQVU7T0FDeEQsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxVQUFVO09BQzVGLEVBQWEsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtBQUU1RSxNQUFNLHFCQUFxQixHQUN2QixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMs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cixcbiAgT2JzZXJ2YWJsZVdyYXBwZXIsXG4gIEV2ZW50RW1pdHRlcixcbiAgUHJvbWlzZUNvbXBsZXRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBQcm92aWRlciwgT3B0aW9uYWwsIEluamVjdCwgU2VsZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnLi9uZ19jb250cm9sJztcbmltcG9ydCB7Rm9ybX0gZnJvbSAnLi9mb3JtX2ludGVyZmFjZSc7XG5pbXBvcnQge05nQ29udHJvbEdyb3VwfSBmcm9tICcuL25nX2NvbnRyb2xfZ3JvdXAnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7QWJzdHJhY3RDb250cm9sLCBDb250cm9sR3JvdXAsIENvbnRyb2x9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7c2V0VXBDb250cm9sLCBzZXRVcENvbnRyb2xHcm91cCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlciA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoQ29udHJvbENvbnRhaW5lciwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybSl9KSk7XG5cbi8qKlxuICogSWYgYE5nRm9ybWAgaXMgYm91bmQgaW4gYSBjb21wb25lbnQsIGA8Zm9ybT5gIGVsZW1lbnRzIGluIHRoYXQgY29tcG9uZW50IHdpbGwgYmVcbiAqIHVwZ3JhZGVkIHRvIHVzZSB0aGUgQW5ndWxhciBmb3JtIHN5c3RlbS5cbiAqXG4gKiAjIyMgVHlwaWNhbCBVc2VcbiAqXG4gKiBJbmNsdWRlIGBGT1JNX0RJUkVDVElWRVNgIGluIHRoZSBgZGlyZWN0aXZlc2Agc2VjdGlvbiBvZiBhIHtAbGluayBWaWV3fSBhbm5vdGF0aW9uXG4gKiB0byB1c2UgYE5nRm9ybWAgYW5kIGl0cyBhc3NvY2lhdGVkIGNvbnRyb2xzLlxuICpcbiAqICMjIyBTdHJ1Y3R1cmVcbiAqXG4gKiBBbiBBbmd1bGFyIGZvcm0gaXMgYSBjb2xsZWN0aW9uIG9mIGBDb250cm9sYHMgaW4gc29tZSBoaWVyYXJjaHkuXG4gKiBgQ29udHJvbGBzIGNhbiBiZSBhdCB0aGUgdG9wIGxldmVsIG9yIGNhbiBiZSBvcmdhbml6ZWQgaW4gYENvbnRyb2xHcm91cGBzXG4gKiBvciBgQ29udHJvbEFycmF5YHMuIFRoaXMgaGllcmFyY2h5IGlzIHJlZmxlY3RlZCBpbiB0aGUgZm9ybSdzIGB2YWx1ZWAsIGFcbiAqIEpTT04gb2JqZWN0IHRoYXQgbWlycm9ycyB0aGUgZm9ybSBzdHJ1Y3R1cmUuXG4gKlxuICogIyMjIFN1Ym1pc3Npb25cbiAqXG4gKiBUaGUgYG5nLXN1Ym1pdGAgZXZlbnQgc2lnbmFscyB3aGVuIHRoZSB1c2VyIHRyaWdnZXJzIGEgZm9ybSBzdWJtaXNzaW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sdGRnWWo0UDBpWTY0QVI3MUVwTD9wPXByZXZpZXcpKVxuICpcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8cD5TdWJtaXQgdGhlIGZvcm0gdG8gc2VlIHRoZSBkYXRhIG9iamVjdCBBbmd1bGFyIGJ1aWxkczwvcD5cbiAqICAgICAgIDxoMj5OZ0Zvcm0gZGVtbzwvaDI+XG4gKiAgICAgICA8Zm9ybSAjZj1cIm5nRm9ybVwiIChuZy1zdWJtaXQpPVwib25TdWJtaXQoZi52YWx1ZSlcIj5cbiAqICAgICAgICAgPGgzPkNvbnRyb2wgZ3JvdXA6IGNyZWRlbnRpYWxzPC9oMz5cbiAqICAgICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwiY3JlZGVudGlhbHNcIj5cbiAqICAgICAgICAgICA8cD5Mb2dpbjogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgICAgIDxwPlBhc3N3b3JkOiA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmctY29udHJvbD1cInBhc3N3b3JkXCI+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGgzPkNvbnRyb2wgZ3JvdXA6IHBlcnNvbjwvaDM+XG4gKiAgICAgICAgIDxkaXYgbmctY29udHJvbC1ncm91cD1cInBlcnNvblwiPlxuICogICAgICAgICAgIDxwPkZpcnN0IG5hbWU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nLWNvbnRyb2w9XCJmaXJzdE5hbWVcIj48L3A+XG4gKiAgICAgICAgICAgPHA+TGFzdCBuYW1lOiA8aW5wdXQgdHlwZT1cInRleHRcIiBuZy1jb250cm9sPVwibGFzdE5hbWVcIj48L3A+XG4gKiAgICAgICAgIDwvZGl2PlxuICogICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIj5TdWJtaXQgRm9ybTwvYnV0dG9uPlxuICogICAgICAgPHA+Rm9ybSBkYXRhIHN1Ym1pdHRlZDo8L3A+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgICA8cHJlPnt7ZGF0YX19PC9wcmU+XG4gKiAgICAgPC9kaXY+XG4gKiBgLFxuICogICBkaXJlY3RpdmVzOiBbQ09SRV9ESVJFQ1RJVkVTLCBGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge31cbiAqXG4gKiAgIGRhdGE6IHN0cmluZztcbiAqXG4gKiAgIG9uU3VibWl0KGRhdGEpIHtcbiAqICAgICB0aGlzLmRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdmb3JtOm5vdChbbmctbm8tZm9ybV0pOm5vdChbbmctZm9ybS1tb2RlbF0pLG5nLWZvcm0sW25nLWZvcm1dJyxcbiAgYmluZGluZ3M6IFtmb3JtRGlyZWN0aXZlUHJvdmlkZXJdLFxuICBob3N0OiB7XG4gICAgJyhzdWJtaXQpJzogJ29uU3VibWl0KCknLFxuICB9LFxuICBvdXRwdXRzOiBbJ25nU3VibWl0J10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvcm0gZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgRm9ybSB7XG4gIGZvcm06IENvbnRyb2xHcm91cDtcbiAgbmdTdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5mb3JtID0gbmV3IENvbnRyb2xHcm91cCh7fSwgbnVsbCwgY29tcG9zZVZhbGlkYXRvcnModmFsaWRhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKGFzeW5jVmFsaWRhdG9ycykpO1xuICB9XG5cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiB0aGlzOyB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbEdyb3VwIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0IGNvbnRyb2xzKCk6IHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2x9IHsgcmV0dXJuIHRoaXMuZm9ybS5jb250cm9sczsgfVxuXG4gIGFkZENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICB2YXIgY3RybCA9IG5ldyBDb250cm9sKCk7XG4gICAgICBzZXRVcENvbnRyb2woY3RybCwgZGlyKTtcbiAgICAgIGNvbnRhaW5lci5hZGRDb250cm9sKGRpci5uYW1lLCBjdHJsKTtcbiAgICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29udHJvbChkaXI6IE5nQ29udHJvbCk6IENvbnRyb2wgeyByZXR1cm4gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpOyB9XG5cbiAgcmVtb3ZlQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY29udGFpbmVyKSkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ29udHJvbChkaXIubmFtZSk7XG4gICAgICAgIGNvbnRhaW5lci51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhZGRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9maW5kQ29udGFpbmVyKGRpci5wYXRoKTtcbiAgICAgIHZhciBncm91cCA9IG5ldyBDb250cm9sR3JvdXAoe30pO1xuICAgICAgc2V0VXBDb250cm9sR3JvdXAoZ3JvdXAsIGRpcik7XG4gICAgICBjb250YWluZXIuYWRkQ29udHJvbChkaXIubmFtZSwgZ3JvdXApO1xuICAgICAgZ3JvdXAudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNvbnRhaW5lcikpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNvbnRyb2woZGlyLm5hbWUpO1xuICAgICAgICBjb250YWluZXIudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiBDb250cm9sR3JvdXAge1xuICAgIHJldHVybiA8Q29udHJvbEdyb3VwPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgfVxuXG4gIHVwZGF0ZU1vZGVsKGRpcjogTmdDb250cm9sLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGN0cmwgPSA8Q29udHJvbD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgICBjdHJsLnVwZGF0ZVZhbHVlKHZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uU3VibWl0KCk6IGJvb2xlYW4ge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMubmdTdWJtaXQsIG51bGwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRDb250YWluZXIocGF0aDogc3RyaW5nW10pOiBDb250cm9sR3JvdXAge1xuICAgIHBhdGgucG9wKCk7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmlzRW1wdHkocGF0aCkgPyB0aGlzLmZvcm0gOiA8Q29udHJvbEdyb3VwPnRoaXMuZm9ybS5maW5kKHBhdGgpO1xuICB9XG59XG4iXX0=