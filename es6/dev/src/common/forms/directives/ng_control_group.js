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
import { Directive, Optional, Inject, Host, SkipSelf, forwardRef, Provider, Self } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { ControlContainer } from './control_container';
import { controlPath, composeValidators, composeAsyncValidators } from './shared';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const controlGroupProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgControlGroup) }));
/**
 * Creates and binds a control group to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7EJ11uGeaggViYM6T5nq?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   directives: [FORM_DIRECTIVES],
 * })
 * @View({
 *   template: `
 *     <div>
 *       <h2>Angular2 Control &amp; ControlGroup Example</h2>
 *       <form #f="ngForm">
 *         <div ng-control-group="name" #cg-name="ngForm">
 *           <h3>Enter your name:</h3>
 *           <p>First: <input ng-control="first" required></p>
 *           <p>Middle: <input ng-control="middle"></p>
 *           <p>Last: <input ng-control="last" required></p>
 *         </div>
 *         <h3>Name value:</h3>
 *         <pre>{{valueOf(cgName)}}</pre>
 *         <p>Name is {{cgName?.control?.valid ? "valid" : "invalid"}}</p>
 *         <h3>What's your favorite food?</h3>
 *         <p><input ng-control="food"></p>
 *         <h3>Form value</h3>
 *         <pre>{{valueOf(f)}}</pre>
 *       </form>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   valueOf(cg: NgControlGroup): string {
 *     if (cg.control == null) {
 *       return null;
 *     }
 *     return JSON.stringify(cg.control.value, null, 2);
 *   }
 * }
 * ```
 *
 * This example declares a control group for a user's name. The value and validation state of
 * this group can be accessed separately from the overall form.
 */
export let NgControlGroup = class extends ControlContainer {
    constructor(parent, _validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this._parent = parent;
    }
    ngOnInit() { this.formDirective.addControlGroup(this); }
    ngOnDestroy() { this.formDirective.removeControlGroup(this); }
    /**
     * Get the {@link ControlGroup} backing this binding.
     */
    get control() { return this.formDirective.getControlGroup(this); }
    /**
     * Get the path to this control group.
     */
    get path() { return controlPath(this.name, this._parent); }
    /**
     * Get the {@link Form} to which this group belongs.
     */
    get formDirective() { return this._parent.formDirective; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
};
NgControlGroup = __decorate([
    Directive({
        selector: '[ng-control-group]',
        providers: [controlGroupProvider],
        inputs: ['name: ng-control-group'],
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
    __metadata('design:paramtypes', [ControlContainer, Array, Array])
], NgControlGroup);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbEdyb3VwIiwiTmdDb250cm9sR3JvdXAuY29uc3RydWN0b3IiLCJOZ0NvbnRyb2xHcm91cC5uZ09uSW5pdCIsIk5nQ29udHJvbEdyb3VwLm5nT25EZXN0cm95IiwiTmdDb250cm9sR3JvdXAuY29udHJvbCIsIk5nQ29udHJvbEdyb3VwLnBhdGgiLCJOZ0NvbnRyb2xHcm91cC5mb3JtRGlyZWN0aXZlIiwiTmdDb250cm9sR3JvdXAudmFsaWRhdG9yIiwiTmdDb250cm9sR3JvdXAuYXN5bmNWYWxpZGF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O09BQU8sRUFHTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixJQUFJLEVBQ0osUUFBUSxFQUNSLFVBQVUsRUFDVixRQUFRLEVBQ1IsSUFBSSxFQUNMLE1BQU0sZUFBZTtPQUNmLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BRTVDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FDN0MsRUFBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxVQUFVO09BR3hFLEVBQWEsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtBQUU1RSxNQUFNLG9CQUFvQixHQUN0QixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sY0FBYyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFaEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0NHO0FBQ0gsMENBTW9DLGdCQUFnQjtJQUtsREEsWUFBZ0NBLE1BQXdCQSxFQUNPQSxXQUFrQkEsRUFDWkEsZ0JBQXVCQTtRQUMxRkMsT0FBT0EsQ0FBQ0E7UUFGcURBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFPQTtRQUNaQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQU9BO1FBRTFGQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxNQUFNQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFFREQsUUFBUUEsS0FBV0UsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFOURGLFdBQVdBLEtBQVdHLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFcEVIOztPQUVHQTtJQUNIQSxJQUFJQSxPQUFPQSxLQUFtQkksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEZKOztPQUVHQTtJQUNIQSxJQUFJQSxJQUFJQSxLQUFlSyxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyRUw7O09BRUdBO0lBQ0hBLElBQUlBLGFBQWFBLEtBQVdNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRWhFTixJQUFJQSxTQUFTQSxLQUFlTyxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXpFUCxJQUFJQSxjQUFjQSxLQUFlUSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDMUZSLENBQUNBO0FBeENEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLG9CQUFvQjtRQUM5QixTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxNQUFNLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQztRQUNsQyxRQUFRLEVBQUUsUUFBUTtLQUNuQixDQUFDO0lBTVksV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFDbkIsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMxQyxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUE7O21CQTJCN0Q7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxuICBEaXJlY3RpdmUsXG4gIE9wdGlvbmFsLFxuICBJbmplY3QsXG4gIEhvc3QsXG4gIFNraXBTZWxmLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7Y29udHJvbFBhdGgsIGNvbXBvc2VWYWxpZGF0b3JzLCBjb21wb3NlQXN5bmNWYWxpZGF0b3JzfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge0NvbnRyb2xHcm91cH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGNvbnRyb2xHcm91cFByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdDb250cm9sR3JvdXApfSkpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGJpbmRzIGEgY29udHJvbCBncm91cCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGNhbiBvbmx5IGJlIHVzZWQgYXMgYSBjaGlsZCBvZiB7QGxpbmsgTmdGb3JtfSBvciB7QGxpbmsgTmdGb3JtTW9kZWx9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83RUoxMXVHZWFnZ1ZpWU02VDVucT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogfSlcbiAqIEBWaWV3KHtcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgyPkFuZ3VsYXIyIENvbnRyb2wgJmFtcDsgQ29udHJvbEdyb3VwIEV4YW1wbGU8L2gyPlxuICogICAgICAgPGZvcm0gI2Y9XCJuZ0Zvcm1cIj5cbiAqICAgICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwibmFtZVwiICNjZy1uYW1lPVwibmdGb3JtXCI+XG4gKiAgICAgICAgICAgPGgzPkVudGVyIHlvdXIgbmFtZTo8L2gzPlxuICogICAgICAgICAgIDxwPkZpcnN0OiA8aW5wdXQgbmctY29udHJvbD1cImZpcnN0XCIgcmVxdWlyZWQ+PC9wPlxuICogICAgICAgICAgIDxwPk1pZGRsZTogPGlucHV0IG5nLWNvbnRyb2w9XCJtaWRkbGVcIj48L3A+XG4gKiAgICAgICAgICAgPHA+TGFzdDogPGlucHV0IG5nLWNvbnRyb2w9XCJsYXN0XCIgcmVxdWlyZWQ+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGgzPk5hbWUgdmFsdWU6PC9oMz5cbiAqICAgICAgICAgPHByZT57e3ZhbHVlT2YoY2dOYW1lKX19PC9wcmU+XG4gKiAgICAgICAgIDxwPk5hbWUgaXMge3tjZ05hbWU/LmNvbnRyb2w/LnZhbGlkID8gXCJ2YWxpZFwiIDogXCJpbnZhbGlkXCJ9fTwvcD5cbiAqICAgICAgICAgPGgzPldoYXQncyB5b3VyIGZhdm9yaXRlIGZvb2Q/PC9oMz5cbiAqICAgICAgICAgPHA+PGlucHV0IG5nLWNvbnRyb2w9XCJmb29kXCI+PC9wPlxuICogICAgICAgICA8aDM+Rm9ybSB2YWx1ZTwvaDM+XG4gKiAgICAgICAgIDxwcmU+e3t2YWx1ZU9mKGYpfX08L3ByZT5cbiAqICAgICAgIDwvZm9ybT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgdmFsdWVPZihjZzogTmdDb250cm9sR3JvdXApOiBzdHJpbmcge1xuICogICAgIGlmIChjZy5jb250cm9sID09IG51bGwpIHtcbiAqICAgICAgIHJldHVybiBudWxsO1xuICogICAgIH1cbiAqICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2cuY29udHJvbC52YWx1ZSwgbnVsbCwgMik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZXhhbXBsZSBkZWNsYXJlcyBhIGNvbnRyb2wgZ3JvdXAgZm9yIGEgdXNlcidzIG5hbWUuIFRoZSB2YWx1ZSBhbmQgdmFsaWRhdGlvbiBzdGF0ZSBvZlxuICogdGhpcyBncm91cCBjYW4gYmUgYWNjZXNzZWQgc2VwYXJhdGVseSBmcm9tIHRoZSBvdmVyYWxsIGZvcm0uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZy1jb250cm9sLWdyb3VwXScsXG4gIHByb3ZpZGVyczogW2NvbnRyb2xHcm91cFByb3ZpZGVyXSxcbiAgaW5wdXRzOiBbJ25hbWU6IG5nLWNvbnRyb2wtZ3JvdXAnXSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbEdyb3VwIGV4dGVuZHMgQ29udHJvbENvbnRhaW5lciBpbXBsZW1lbnRzIE9uSW5pdCxcbiAgICBPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIF9wYXJlbnQ6IENvbnRyb2xDb250YWluZXI7XG5cbiAgY29uc3RydWN0b3IoQEhvc3QoKSBAU2tpcFNlbGYoKSBwYXJlbnQ6IENvbnRyb2xDb250YWluZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUuYWRkQ29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZS5yZW1vdmVDb250cm9sR3JvdXAodGhpcyk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSB7QGxpbmsgQ29udHJvbEdyb3VwfSBiYWNraW5nIHRoaXMgYmluZGluZy5cbiAgICovXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2xHcm91cCB7IHJldHVybiB0aGlzLmZvcm1EaXJlY3RpdmUuZ2V0Q29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGlzIGNvbnRyb2wgZ3JvdXAuXG4gICAqL1xuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBjb250cm9sUGF0aCh0aGlzLm5hbWUsIHRoaXMuX3BhcmVudCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSB7QGxpbmsgRm9ybX0gdG8gd2hpY2ggdGhpcyBncm91cCBiZWxvbmdzLlxuICAgKi9cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiB0aGlzLl9wYXJlbnQuZm9ybURpcmVjdGl2ZTsgfVxuXG4gIGdldCB2YWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7IH1cblxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9hc3luY1ZhbGlkYXRvcnMpOyB9XG59XG4iXX0=