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
 *       <form #f="form">
 *         <div ng-control-group="name" #cg-name="form">
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
    onInit() { this.formDirective.addControlGroup(this); }
    onDestroy() { this.formDirective.removeControlGroup(this); }
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
    __metadata('design:paramtypes', [ControlContainer, Array, Array])
], NgControlGroup);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbEdyb3VwIiwiTmdDb250cm9sR3JvdXAuY29uc3RydWN0b3IiLCJOZ0NvbnRyb2xHcm91cC5vbkluaXQiLCJOZ0NvbnRyb2xHcm91cC5vbkRlc3Ryb3kiLCJOZ0NvbnRyb2xHcm91cC5jb250cm9sIiwiTmdDb250cm9sR3JvdXAucGF0aCIsIk5nQ29udHJvbEdyb3VwLmZvcm1EaXJlY3RpdmUiLCJOZ0NvbnRyb2xHcm91cC52YWxpZGF0b3IiLCJOZ0NvbnRyb2xHcm91cC5hc3luY1ZhbGlkYXRvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUdMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLElBQUksRUFDSixRQUFRLEVBQ1IsVUFBVSxFQUNWLFFBQVEsRUFDUixJQUFJLEVBQ0wsTUFBTSxlQUFlO09BQ2YsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FFNUMsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQjtPQUM3QyxFQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLFVBQVU7T0FHeEUsRUFBYSxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFlO0FBRTVFLE1BQU0sb0JBQW9CLEdBQ3RCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSxjQUFjLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVoRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErQ0c7QUFDSCwwQ0FNb0MsZ0JBQWdCO0lBS2xEQSxZQUFnQ0EsTUFBd0JBLEVBQ09BLFdBQWtCQSxFQUNaQSxnQkFBdUJBO1FBQzFGQyxPQUFPQSxDQUFDQTtRQUZxREEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQU9BO1FBQ1pBLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBT0E7UUFFMUZBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO0lBQ3hCQSxDQUFDQTtJQUVERCxNQUFNQSxLQUFXRSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1REYsU0FBU0EsS0FBV0csSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVsRUg7O09BRUdBO0lBQ0hBLElBQUlBLE9BQU9BLEtBQW1CSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoRko7O09BRUdBO0lBQ0hBLElBQUlBLElBQUlBLEtBQWVLLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXJFTDs7T0FFR0E7SUFDSEEsSUFBSUEsYUFBYUEsS0FBV00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEVOLElBQUlBLFNBQVNBLEtBQWVPLE1BQU1BLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekVQLElBQUlBLGNBQWNBLEtBQWVRLE1BQU1BLENBQUNBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMxRlIsQ0FBQ0E7QUF4Q0Q7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsb0JBQW9CO1FBQzlCLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ2pDLE1BQU0sRUFBRSxDQUFDLHdCQUF3QixDQUFDO1FBQ2xDLFFBQVEsRUFBRSxNQUFNO0tBQ2pCLENBQUM7SUFNWSxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNuQixXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzFDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQTs7bUJBMkI3RDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG4gIERpcmVjdGl2ZSxcbiAgT3B0aW9uYWwsXG4gIEluamVjdCxcbiAgSG9zdCxcbiAgU2tpcFNlbGYsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtjb250cm9sUGF0aCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7Q29udHJvbEdyb3VwfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgY29udHJvbEdyb3VwUHJvdmlkZXIgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKENvbnRyb2xDb250YWluZXIsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ0NvbnRyb2xHcm91cCl9KSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgYmluZHMgYSBjb250cm9sIGdyb3VwIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgY2FuIG9ubHkgYmUgdXNlZCBhcyBhIGNoaWxkIG9mIHtAbGluayBOZ0Zvcm19IG9yIHtAbGluayBOZ0Zvcm1Nb2RlbH0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzdFSjExdUdlYWdnVmlZTTZUNW5xP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiB9KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDI+QW5ndWxhcjIgQ29udHJvbCAmYW1wOyBDb250cm9sR3JvdXAgRXhhbXBsZTwvaDI+XG4gKiAgICAgICA8Zm9ybSAjZj1cImZvcm1cIj5cbiAqICAgICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwibmFtZVwiICNjZy1uYW1lPVwiZm9ybVwiPlxuICogICAgICAgICAgIDxoMz5FbnRlciB5b3VyIG5hbWU6PC9oMz5cbiAqICAgICAgICAgICA8cD5GaXJzdDogPGlucHV0IG5nLWNvbnRyb2w9XCJmaXJzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgICA8cD5NaWRkbGU6IDxpbnB1dCBuZy1jb250cm9sPVwibWlkZGxlXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3Q6IDxpbnB1dCBuZy1jb250cm9sPVwibGFzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxoMz5OYW1lIHZhbHVlOjwvaDM+XG4gKiAgICAgICAgIDxwcmU+e3t2YWx1ZU9mKGNnTmFtZSl9fTwvcHJlPlxuICogICAgICAgICA8cD5OYW1lIGlzIHt7Y2dOYW1lPy5jb250cm9sPy52YWxpZCA/IFwidmFsaWRcIiA6IFwiaW52YWxpZFwifX08L3A+XG4gKiAgICAgICAgIDxoMz5XaGF0J3MgeW91ciBmYXZvcml0ZSBmb29kPzwvaDM+XG4gKiAgICAgICAgIDxwPjxpbnB1dCBuZy1jb250cm9sPVwiZm9vZFwiPjwvcD5cbiAqICAgICAgICAgPGgzPkZvcm0gdmFsdWU8L2gzPlxuICogICAgICAgICA8cHJlPnt7dmFsdWVPZihmKX19PC9wcmU+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlT2YoY2c6IE5nQ29udHJvbEdyb3VwKTogc3RyaW5nIHtcbiAqICAgICBpZiAoY2cuY29udHJvbCA9PSBudWxsKSB7XG4gKiAgICAgICByZXR1cm4gbnVsbDtcbiAqICAgICB9XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNnLmNvbnRyb2wudmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGV4YW1wbGUgZGVjbGFyZXMgYSBjb250cm9sIGdyb3VwIGZvciBhIHVzZXIncyBuYW1lLiBUaGUgdmFsdWUgYW5kIHZhbGlkYXRpb24gc3RhdGUgb2ZcbiAqIHRoaXMgZ3JvdXAgY2FuIGJlIGFjY2Vzc2VkIHNlcGFyYXRlbHkgZnJvbSB0aGUgb3ZlcmFsbCBmb3JtLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctY29udHJvbC1ncm91cF0nLFxuICBwcm92aWRlcnM6IFtjb250cm9sR3JvdXBQcm92aWRlcl0sXG4gIGlucHV0czogWyduYW1lOiBuZy1jb250cm9sLWdyb3VwJ10sXG4gIGV4cG9ydEFzOiAnZm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdDb250cm9sR3JvdXAgZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgT25Jbml0LFxuICAgIE9uRGVzdHJveSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmVudDogQ29udHJvbENvbnRhaW5lcjtcblxuICBjb25zdHJ1Y3RvcihASG9zdCgpIEBTa2lwU2VsZigpIHBhcmVudDogQ29udHJvbENvbnRhaW5lcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgb25Jbml0KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUuYWRkQ29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgb25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUucmVtb3ZlQ29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIENvbnRyb2xHcm91cH0gYmFja2luZyB0aGlzIGJpbmRpbmcuXG4gICAqL1xuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtRGlyZWN0aXZlLmdldENvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhdGggdG8gdGhpcyBjb250cm9sIGdyb3VwLlxuICAgKi9cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gY29udHJvbFBhdGgodGhpcy5uYW1lLCB0aGlzLl9wYXJlbnQpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIEZvcm19IHRvIHdoaWNoIHRoaXMgZ3JvdXAgYmVsb25ncy5cbiAgICovXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpcy5fcGFyZW50LmZvcm1EaXJlY3RpdmU7IH1cblxuICBnZXQgdmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTsgfVxufVxuIl19