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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbEdyb3VwIiwiTmdDb250cm9sR3JvdXAuY29uc3RydWN0b3IiLCJOZ0NvbnRyb2xHcm91cC5uZ09uSW5pdCIsIk5nQ29udHJvbEdyb3VwLm5nT25EZXN0cm95IiwiTmdDb250cm9sR3JvdXAuY29udHJvbCIsIk5nQ29udHJvbEdyb3VwLnBhdGgiLCJOZ0NvbnRyb2xHcm91cC5mb3JtRGlyZWN0aXZlIiwiTmdDb250cm9sR3JvdXAudmFsaWRhdG9yIiwiTmdDb250cm9sR3JvdXAuYXN5bmNWYWxpZGF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBR0wsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sSUFBSSxFQUNKLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLElBQUksRUFDTCxNQUFNLGVBQWU7T0FDZixFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUU1QyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO09BQzdDLEVBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sVUFBVTtPQUd4RSxFQUFhLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGVBQWU7QUFFNUUsTUFBTSxvQkFBb0IsR0FDdEIsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGNBQWMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWhHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStDRztBQUNILDBDQU1vQyxnQkFBZ0I7SUFLbERBLFlBQWdDQSxNQUF3QkEsRUFDT0EsV0FBa0JBLEVBQ1pBLGdCQUF1QkE7UUFDMUZDLE9BQU9BLENBQUNBO1FBRnFEQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBT0E7UUFDWkEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFPQTtRQUUxRkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRURELFFBQVFBLEtBQVdFLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTlERixXQUFXQSxLQUFXRyxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXBFSDs7T0FFR0E7SUFDSEEsSUFBSUEsT0FBT0EsS0FBbUJJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRWhGSjs7T0FFR0E7SUFDSEEsSUFBSUEsSUFBSUEsS0FBZUssTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckVMOztPQUVHQTtJQUNIQSxJQUFJQSxhQUFhQSxLQUFXTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoRU4sSUFBSUEsU0FBU0EsS0FBZU8sTUFBTUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV6RVAsSUFBSUEsY0FBY0EsS0FBZVEsTUFBTUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzFGUixDQUFDQTtBQXhDRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7UUFDakMsTUFBTSxFQUFFLENBQUMsd0JBQXdCLENBQUM7UUFDbEMsUUFBUSxFQUFFLFFBQVE7S0FDbkIsQ0FBQztJQU1ZLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ25CLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDMUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBOzttQkEyQjdEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBPbkluaXQsXG4gIE9uRGVzdHJveSxcbiAgRGlyZWN0aXZlLFxuICBPcHRpb25hbCxcbiAgSW5qZWN0LFxuICBIb3N0LFxuICBTa2lwU2VsZixcbiAgZm9yd2FyZFJlZixcbiAgUHJvdmlkZXIsXG4gIFNlbGZcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge2NvbnRyb2xQYXRoLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtDb250cm9sR3JvdXB9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7Rm9ybX0gZnJvbSAnLi9mb3JtX2ludGVyZmFjZSc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlMsIE5HX0FTWU5DX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBjb250cm9sR3JvdXBQcm92aWRlciA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoQ29udHJvbENvbnRhaW5lciwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nQ29udHJvbEdyb3VwKX0pKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuZCBiaW5kcyBhIGNvbnRyb2wgZ3JvdXAgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSBjYW4gb25seSBiZSB1c2VkIGFzIGEgY2hpbGQgb2Yge0BsaW5rIE5nRm9ybX0gb3Ige0BsaW5rIE5nRm9ybU1vZGVsfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvN0VKMTF1R2VhZ2dWaVlNNlQ1bnE/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXSxcbiAqIH0pXG4gKiBAVmlldyh7XG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5Bbmd1bGFyMiBDb250cm9sICZhbXA7IENvbnRyb2xHcm91cCBFeGFtcGxlPC9oMj5cbiAqICAgICAgIDxmb3JtICNmPVwibmdGb3JtXCI+XG4gKiAgICAgICAgIDxkaXYgbmctY29udHJvbC1ncm91cD1cIm5hbWVcIiAjY2ctbmFtZT1cIm5nRm9ybVwiPlxuICogICAgICAgICAgIDxoMz5FbnRlciB5b3VyIG5hbWU6PC9oMz5cbiAqICAgICAgICAgICA8cD5GaXJzdDogPGlucHV0IG5nLWNvbnRyb2w9XCJmaXJzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgICA8cD5NaWRkbGU6IDxpbnB1dCBuZy1jb250cm9sPVwibWlkZGxlXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3Q6IDxpbnB1dCBuZy1jb250cm9sPVwibGFzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxoMz5OYW1lIHZhbHVlOjwvaDM+XG4gKiAgICAgICAgIDxwcmU+e3t2YWx1ZU9mKGNnTmFtZSl9fTwvcHJlPlxuICogICAgICAgICA8cD5OYW1lIGlzIHt7Y2dOYW1lPy5jb250cm9sPy52YWxpZCA/IFwidmFsaWRcIiA6IFwiaW52YWxpZFwifX08L3A+XG4gKiAgICAgICAgIDxoMz5XaGF0J3MgeW91ciBmYXZvcml0ZSBmb29kPzwvaDM+XG4gKiAgICAgICAgIDxwPjxpbnB1dCBuZy1jb250cm9sPVwiZm9vZFwiPjwvcD5cbiAqICAgICAgICAgPGgzPkZvcm0gdmFsdWU8L2gzPlxuICogICAgICAgICA8cHJlPnt7dmFsdWVPZihmKX19PC9wcmU+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlT2YoY2c6IE5nQ29udHJvbEdyb3VwKTogc3RyaW5nIHtcbiAqICAgICBpZiAoY2cuY29udHJvbCA9PSBudWxsKSB7XG4gKiAgICAgICByZXR1cm4gbnVsbDtcbiAqICAgICB9XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNnLmNvbnRyb2wudmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGV4YW1wbGUgZGVjbGFyZXMgYSBjb250cm9sIGdyb3VwIGZvciBhIHVzZXIncyBuYW1lLiBUaGUgdmFsdWUgYW5kIHZhbGlkYXRpb24gc3RhdGUgb2ZcbiAqIHRoaXMgZ3JvdXAgY2FuIGJlIGFjY2Vzc2VkIHNlcGFyYXRlbHkgZnJvbSB0aGUgb3ZlcmFsbCBmb3JtLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctY29udHJvbC1ncm91cF0nLFxuICBwcm92aWRlcnM6IFtjb250cm9sR3JvdXBQcm92aWRlcl0sXG4gIGlucHV0czogWyduYW1lOiBuZy1jb250cm9sLWdyb3VwJ10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xHcm91cCBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBPbkluaXQsXG4gICAgT25EZXN0cm95IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyZW50OiBDb250cm9sQ29udGFpbmVyO1xuXG4gIGNvbnN0cnVjdG9yKEBIb3N0KCkgQFNraXBTZWxmKCkgcGFyZW50OiBDb250cm9sQ29udGFpbmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHsgdGhpcy5mb3JtRGlyZWN0aXZlLmFkZENvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUucmVtb3ZlQ29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIENvbnRyb2xHcm91cH0gYmFja2luZyB0aGlzIGJpbmRpbmcuXG4gICAqL1xuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtRGlyZWN0aXZlLmdldENvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhdGggdG8gdGhpcyBjb250cm9sIGdyb3VwLlxuICAgKi9cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gY29udHJvbFBhdGgodGhpcy5uYW1lLCB0aGlzLl9wYXJlbnQpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIEZvcm19IHRvIHdoaWNoIHRoaXMgZ3JvdXAgYmVsb25ncy5cbiAgICovXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpcy5fcGFyZW50LmZvcm1EaXJlY3RpdmU7IH1cblxuICBnZXQgdmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEZ1bmN0aW9uIHsgcmV0dXJuIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTsgfVxufVxuIl19