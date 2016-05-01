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
import { Directive, Optional, Inject, Host, SkipSelf, forwardRef, Self } from 'angular2/core';
import { ControlContainer } from './control_container';
import { controlPath, composeValidators, composeAsyncValidators } from './shared';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
export const controlGroupProvider = 
/*@ts2dart_const*/ /* @ts2dart_Provider */ {
    provide: ControlContainer,
    useExisting: forwardRef(() => NgControlGroup)
};
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
 *   template: `
 *     <div>
 *       <h2>Angular2 Control &amp; ControlGroup Example</h2>
 *       <form #f="ngForm">
 *         <div ngControlGroup="name" #cg-name="form">
 *           <h3>Enter your name:</h3>
 *           <p>First: <input ngControl="first" required></p>
 *           <p>Middle: <input ngControl="middle"></p>
 *           <p>Last: <input ngControl="last" required></p>
 *         </div>
 *         <h3>Name value:</h3>
 *         <pre>{{valueOf(cgName)}}</pre>
 *         <p>Name is {{cgName?.control?.valid ? "valid" : "invalid"}}</p>
 *         <h3>What's your favorite food?</h3>
 *         <p><input ngControl="food"></p>
 *         <h3>Form value</h3>
 *         <pre>{{valueOf(f)}}</pre>
 *       </form>
 *     </div>
 *   `
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
export let NgControlGroup = class NgControlGroup extends ControlContainer {
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
        selector: '[ngControlGroup]',
        providers: [controlGroupProvider],
        inputs: ['name: ngControlGroup'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBR0wsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sSUFBSSxFQUNKLFFBQVEsRUFDUixVQUFVLEVBRVYsSUFBSSxFQUNMLE1BQU0sZUFBZTtPQUVmLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FDN0MsRUFBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxVQUFVO09BR3hFLEVBQUMsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtBQUdoRSxPQUFPLE1BQU0sb0JBQW9CO0FBQzdCLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDO0lBQ3pDLE9BQU8sRUFBRSxnQkFBZ0I7SUFDekIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGNBQWMsQ0FBQztDQUM5QyxDQUFDO0FBRU47Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENHO0FBT0gseURBQW9DLGdCQUFnQjtJQUtsRCxZQUFnQyxNQUF3QixFQUNPLFdBQWtCLEVBQ1osZ0JBQXVCO1FBQzFGLE9BQU8sQ0FBQztRQUZxRCxnQkFBVyxHQUFYLFdBQVcsQ0FBTztRQUNaLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBTztRQUUxRixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBRUQsUUFBUSxLQUFXLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU5RCxXQUFXLEtBQVcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFcEU7O09BRUc7SUFDSCxJQUFJLE9BQU8sS0FBbUIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVoRjs7T0FFRztJQUNILElBQUksSUFBSSxLQUFlLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJFOztPQUVHO0lBQ0gsSUFBSSxhQUFhLEtBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUVoRSxJQUFJLFNBQVMsS0FBa0IsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFNUUsSUFBSSxjQUFjLEtBQXVCLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEcsQ0FBQztBQXhDRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7UUFDakMsTUFBTSxFQUFFLENBQUMsc0JBQXNCLENBQUM7UUFDaEMsUUFBUSxFQUFFLFFBQVE7S0FDbkIsQ0FBQztlQU1hLElBQUksRUFBRTtlQUFFLFFBQVEsRUFBRTtlQUNsQixRQUFRLEVBQUU7ZUFBRSxJQUFJLEVBQUU7ZUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDO2VBQ3pDLFFBQVEsRUFBRTtlQUFFLElBQUksRUFBRTtlQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQzs7a0JBUjVEO0FBbUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG4gIERpcmVjdGl2ZSxcbiAgT3B0aW9uYWwsXG4gIEluamVjdCxcbiAgSG9zdCxcbiAgU2tpcFNlbGYsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtjb250cm9sUGF0aCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7Q29udHJvbEdyb3VwfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7QXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdG9yRm59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBjb250cm9sR3JvdXBQcm92aWRlcjogYW55ID1cbiAgICAvKkB0czJkYXJ0X2NvbnN0Ki8gLyogQHRzMmRhcnRfUHJvdmlkZXIgKi8ge1xuICAgICAgcHJvdmlkZTogQ29udHJvbENvbnRhaW5lcixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nQ29udHJvbEdyb3VwKVxuICAgIH07XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgYmluZHMgYSBjb250cm9sIGdyb3VwIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgY2FuIG9ubHkgYmUgdXNlZCBhcyBhIGNoaWxkIG9mIHtAbGluayBOZ0Zvcm19IG9yIHtAbGluayBOZ0Zvcm1Nb2RlbH0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzdFSjExdUdlYWdnVmlZTTZUNW5xP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5Bbmd1bGFyMiBDb250cm9sICZhbXA7IENvbnRyb2xHcm91cCBFeGFtcGxlPC9oMj5cbiAqICAgICAgIDxmb3JtICNmPVwibmdGb3JtXCI+XG4gKiAgICAgICAgIDxkaXYgbmdDb250cm9sR3JvdXA9XCJuYW1lXCIgI2NnLW5hbWU9XCJmb3JtXCI+XG4gKiAgICAgICAgICAgPGgzPkVudGVyIHlvdXIgbmFtZTo8L2gzPlxuICogICAgICAgICAgIDxwPkZpcnN0OiA8aW5wdXQgbmdDb250cm9sPVwiZmlyc3RcIiByZXF1aXJlZD48L3A+XG4gKiAgICAgICAgICAgPHA+TWlkZGxlOiA8aW5wdXQgbmdDb250cm9sPVwibWlkZGxlXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3Q6IDxpbnB1dCBuZ0NvbnRyb2w9XCJsYXN0XCIgcmVxdWlyZWQ+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGgzPk5hbWUgdmFsdWU6PC9oMz5cbiAqICAgICAgICAgPHByZT57e3ZhbHVlT2YoY2dOYW1lKX19PC9wcmU+XG4gKiAgICAgICAgIDxwPk5hbWUgaXMge3tjZ05hbWU/LmNvbnRyb2w/LnZhbGlkID8gXCJ2YWxpZFwiIDogXCJpbnZhbGlkXCJ9fTwvcD5cbiAqICAgICAgICAgPGgzPldoYXQncyB5b3VyIGZhdm9yaXRlIGZvb2Q/PC9oMz5cbiAqICAgICAgICAgPHA+PGlucHV0IG5nQ29udHJvbD1cImZvb2RcIj48L3A+XG4gKiAgICAgICAgIDxoMz5Gb3JtIHZhbHVlPC9oMz5cbiAqICAgICAgICAgPHByZT57e3ZhbHVlT2YoZil9fTwvcHJlPlxuICogICAgICAgPC9mb3JtPlxuICogICAgIDwvZGl2PlxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlT2YoY2c6IE5nQ29udHJvbEdyb3VwKTogc3RyaW5nIHtcbiAqICAgICBpZiAoY2cuY29udHJvbCA9PSBudWxsKSB7XG4gKiAgICAgICByZXR1cm4gbnVsbDtcbiAqICAgICB9XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNnLmNvbnRyb2wudmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGV4YW1wbGUgZGVjbGFyZXMgYSBjb250cm9sIGdyb3VwIGZvciBhIHVzZXIncyBuYW1lLiBUaGUgdmFsdWUgYW5kIHZhbGlkYXRpb24gc3RhdGUgb2ZcbiAqIHRoaXMgZ3JvdXAgY2FuIGJlIGFjY2Vzc2VkIHNlcGFyYXRlbHkgZnJvbSB0aGUgb3ZlcmFsbCBmb3JtLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdDb250cm9sR3JvdXBdJyxcbiAgcHJvdmlkZXJzOiBbY29udHJvbEdyb3VwUHJvdmlkZXJdLFxuICBpbnB1dHM6IFsnbmFtZTogbmdDb250cm9sR3JvdXAnXSxcbiAgZXhwb3J0QXM6ICduZ0Zvcm0nXG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbEdyb3VwIGV4dGVuZHMgQ29udHJvbENvbnRhaW5lciBpbXBsZW1lbnRzIE9uSW5pdCxcbiAgICBPbkRlc3Ryb3kge1xuICAvKiogQGludGVybmFsICovXG4gIF9wYXJlbnQ6IENvbnRyb2xDb250YWluZXI7XG5cbiAgY29uc3RydWN0b3IoQEhvc3QoKSBAU2tpcFNlbGYoKSBwYXJlbnQ6IENvbnRyb2xDb250YWluZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUuYWRkQ29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZS5yZW1vdmVDb250cm9sR3JvdXAodGhpcyk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSB7QGxpbmsgQ29udHJvbEdyb3VwfSBiYWNraW5nIHRoaXMgYmluZGluZy5cbiAgICovXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2xHcm91cCB7IHJldHVybiB0aGlzLmZvcm1EaXJlY3RpdmUuZ2V0Q29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGlzIGNvbnRyb2wgZ3JvdXAuXG4gICAqL1xuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBjb250cm9sUGF0aCh0aGlzLm5hbWUsIHRoaXMuX3BhcmVudCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSB7QGxpbmsgRm9ybX0gdG8gd2hpY2ggdGhpcyBncm91cCBiZWxvbmdzLlxuICAgKi9cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiB0aGlzLl9wYXJlbnQuZm9ybURpcmVjdGl2ZTsgfVxuXG4gIGdldCB2YWxpZGF0b3IoKTogVmFsaWRhdG9yRm4geyByZXR1cm4gY29tcG9zZVZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7IH1cblxuICBnZXQgYXN5bmNWYWxpZGF0b3IoKTogQXN5bmNWYWxpZGF0b3JGbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cbn1cbiJdfQ==