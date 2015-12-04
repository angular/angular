'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var control_container_1 = require('./control_container');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var controlGroupProvider = lang_1.CONST_EXPR(new core_1.Provider(control_container_1.ControlContainer, { useExisting: core_1.forwardRef(function () { return NgControlGroup; }) }));
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
var NgControlGroup = (function (_super) {
    __extends(NgControlGroup, _super);
    function NgControlGroup(parent, _validators, _asyncValidators) {
        _super.call(this);
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this._parent = parent;
    }
    NgControlGroup.prototype.ngOnInit = function () { this.formDirective.addControlGroup(this); };
    NgControlGroup.prototype.ngOnDestroy = function () { this.formDirective.removeControlGroup(this); };
    Object.defineProperty(NgControlGroup.prototype, "control", {
        /**
         * Get the {@link ControlGroup} backing this binding.
         */
        get: function () { return this.formDirective.getControlGroup(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlGroup.prototype, "path", {
        /**
         * Get the path to this control group.
         */
        get: function () { return shared_1.controlPath(this.name, this._parent); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlGroup.prototype, "formDirective", {
        /**
         * Get the {@link Form} to which this group belongs.
         */
        get: function () { return this._parent.formDirective; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlGroup.prototype, "validator", {
        get: function () { return shared_1.composeValidators(this._validators); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlGroup.prototype, "asyncValidator", {
        get: function () { return shared_1.composeAsyncValidators(this._asyncValidators); },
        enumerable: true,
        configurable: true
    });
    NgControlGroup = __decorate([
        core_1.Directive({
            selector: '[ng-control-group]',
            providers: [controlGroupProvider],
            inputs: ['name: ng-control-group'],
            exportAs: 'form'
        }),
        __param(0, core_1.Host()),
        __param(0, core_1.SkipSelf()),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(2, core_1.Optional()),
        __param(2, core_1.Self()),
        __param(2, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)), 
        __metadata('design:paramtypes', [control_container_1.ControlContainer, Array, Array])
    ], NgControlGroup);
    return NgControlGroup;
})(control_container_1.ControlContainer);
exports.NgControlGroup = NgControlGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbEdyb3VwIiwiTmdDb250cm9sR3JvdXAuY29uc3RydWN0b3IiLCJOZ0NvbnRyb2xHcm91cC5uZ09uSW5pdCIsIk5nQ29udHJvbEdyb3VwLm5nT25EZXN0cm95IiwiTmdDb250cm9sR3JvdXAuY29udHJvbCIsIk5nQ29udHJvbEdyb3VwLnBhdGgiLCJOZ0NvbnRyb2xHcm91cC5mb3JtRGlyZWN0aXZlIiwiTmdDb250cm9sR3JvdXAudmFsaWRhdG9yIiwiTmdDb250cm9sR3JvdXAuYXN5bmNWYWxpZGF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFXTyxlQUFlLENBQUMsQ0FBQTtBQUN2QixxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRCxrQ0FBK0IscUJBQXFCLENBQUMsQ0FBQTtBQUNyRCx1QkFBcUUsVUFBVSxDQUFDLENBQUE7QUFHaEYsMkJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBRTdFLElBQU0sb0JBQW9CLEdBQ3RCLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQUMsb0NBQWdCLEVBQUUsRUFBQyxXQUFXLEVBQUUsaUJBQVUsQ0FBQyxjQUFNLE9BQUEsY0FBYyxFQUFkLENBQWMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWhHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStDRztBQUNIO0lBTW9DQSxrQ0FBZ0JBO0lBS2xEQSx3QkFBZ0NBLE1BQXdCQSxFQUNPQSxXQUFrQkEsRUFDWkEsZ0JBQXVCQTtRQUMxRkMsaUJBQU9BLENBQUNBO1FBRnFEQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBT0E7UUFDWkEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFPQTtRQUUxRkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRURELGlDQUFRQSxHQUFSQSxjQUFtQkUsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFOURGLG9DQUFXQSxHQUFYQSxjQUFzQkcsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUtwRUgsc0JBQUlBLG1DQUFPQTtRQUhYQTs7V0FFR0E7YUFDSEEsY0FBOEJJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUo7SUFLaEZBLHNCQUFJQSxnQ0FBSUE7UUFIUkE7O1dBRUdBO2FBQ0hBLGNBQXVCSyxNQUFNQSxDQUFDQSxvQkFBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDtJQUtyRUEsc0JBQUlBLHlDQUFhQTtRQUhqQkE7O1dBRUdBO2FBQ0hBLGNBQTRCTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFOO0lBRWhFQSxzQkFBSUEscUNBQVNBO2FBQWJBLGNBQTRCTyxNQUFNQSxDQUFDQSwwQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQVA7SUFFekVBLHNCQUFJQSwwQ0FBY0E7YUFBbEJBLGNBQWlDUSxNQUFNQSxDQUFDQSwrQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBUjtJQXZDMUZBO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSxvQkFBb0JBO1lBQzlCQSxTQUFTQSxFQUFFQSxDQUFDQSxvQkFBb0JBLENBQUNBO1lBQ2pDQSxNQUFNQSxFQUFFQSxDQUFDQSx3QkFBd0JBLENBQUNBO1lBQ2xDQSxRQUFRQSxFQUFFQSxNQUFNQTtTQUNqQkEsQ0FBQ0E7UUFNWUEsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsZUFBUUEsRUFBRUEsQ0FBQUE7UUFDbkJBLFdBQUNBLGVBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLGFBQU1BLENBQUNBLDBCQUFhQSxDQUFDQSxDQUFBQTtRQUMxQ0EsV0FBQ0EsZUFBUUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsYUFBTUEsQ0FBQ0EsZ0NBQW1CQSxDQUFDQSxDQUFBQTs7dUJBMkI3REE7SUFBREEscUJBQUNBO0FBQURBLENBQUNBLEFBeENELEVBTW9DLG9DQUFnQixFQWtDbkQ7QUFsQ1ksc0JBQWMsaUJBa0MxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG4gIERpcmVjdGl2ZSxcbiAgT3B0aW9uYWwsXG4gIEluamVjdCxcbiAgSG9zdCxcbiAgU2tpcFNlbGYsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBTZWxmXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtjb250cm9sUGF0aCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7Q29udHJvbEdyb3VwfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgY29udHJvbEdyb3VwUHJvdmlkZXIgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKENvbnRyb2xDb250YWluZXIsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ0NvbnRyb2xHcm91cCl9KSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgYmluZHMgYSBjb250cm9sIGdyb3VwIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgY2FuIG9ubHkgYmUgdXNlZCBhcyBhIGNoaWxkIG9mIHtAbGluayBOZ0Zvcm19IG9yIHtAbGluayBOZ0Zvcm1Nb2RlbH0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzdFSjExdUdlYWdnVmlZTTZUNW5xP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiB9KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDI+QW5ndWxhcjIgQ29udHJvbCAmYW1wOyBDb250cm9sR3JvdXAgRXhhbXBsZTwvaDI+XG4gKiAgICAgICA8Zm9ybSAjZj1cImZvcm1cIj5cbiAqICAgICAgICAgPGRpdiBuZy1jb250cm9sLWdyb3VwPVwibmFtZVwiICNjZy1uYW1lPVwiZm9ybVwiPlxuICogICAgICAgICAgIDxoMz5FbnRlciB5b3VyIG5hbWU6PC9oMz5cbiAqICAgICAgICAgICA8cD5GaXJzdDogPGlucHV0IG5nLWNvbnRyb2w9XCJmaXJzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgICA8cD5NaWRkbGU6IDxpbnB1dCBuZy1jb250cm9sPVwibWlkZGxlXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3Q6IDxpbnB1dCBuZy1jb250cm9sPVwibGFzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxoMz5OYW1lIHZhbHVlOjwvaDM+XG4gKiAgICAgICAgIDxwcmU+e3t2YWx1ZU9mKGNnTmFtZSl9fTwvcHJlPlxuICogICAgICAgICA8cD5OYW1lIGlzIHt7Y2dOYW1lPy5jb250cm9sPy52YWxpZCA/IFwidmFsaWRcIiA6IFwiaW52YWxpZFwifX08L3A+XG4gKiAgICAgICAgIDxoMz5XaGF0J3MgeW91ciBmYXZvcml0ZSBmb29kPzwvaDM+XG4gKiAgICAgICAgIDxwPjxpbnB1dCBuZy1jb250cm9sPVwiZm9vZFwiPjwvcD5cbiAqICAgICAgICAgPGgzPkZvcm0gdmFsdWU8L2gzPlxuICogICAgICAgICA8cHJlPnt7dmFsdWVPZihmKX19PC9wcmU+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlT2YoY2c6IE5nQ29udHJvbEdyb3VwKTogc3RyaW5nIHtcbiAqICAgICBpZiAoY2cuY29udHJvbCA9PSBudWxsKSB7XG4gKiAgICAgICByZXR1cm4gbnVsbDtcbiAqICAgICB9XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNnLmNvbnRyb2wudmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGV4YW1wbGUgZGVjbGFyZXMgYSBjb250cm9sIGdyb3VwIGZvciBhIHVzZXIncyBuYW1lLiBUaGUgdmFsdWUgYW5kIHZhbGlkYXRpb24gc3RhdGUgb2ZcbiAqIHRoaXMgZ3JvdXAgY2FuIGJlIGFjY2Vzc2VkIHNlcGFyYXRlbHkgZnJvbSB0aGUgb3ZlcmFsbCBmb3JtLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmctY29udHJvbC1ncm91cF0nLFxuICBwcm92aWRlcnM6IFtjb250cm9sR3JvdXBQcm92aWRlcl0sXG4gIGlucHV0czogWyduYW1lOiBuZy1jb250cm9sLWdyb3VwJ10sXG4gIGV4cG9ydEFzOiAnZm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdDb250cm9sR3JvdXAgZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgT25Jbml0LFxuICAgIE9uRGVzdHJveSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmVudDogQ29udHJvbENvbnRhaW5lcjtcblxuICBjb25zdHJ1Y3RvcihASG9zdCgpIEBTa2lwU2VsZigpIHBhcmVudDogQ29udHJvbENvbnRhaW5lcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZS5hZGRDb250cm9sR3JvdXAodGhpcyk7IH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5mb3JtRGlyZWN0aXZlLnJlbW92ZUNvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHtAbGluayBDb250cm9sR3JvdXB9IGJhY2tpbmcgdGhpcyBiaW5kaW5nLlxuICAgKi9cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbEdyb3VwIHsgcmV0dXJuIHRoaXMuZm9ybURpcmVjdGl2ZS5nZXRDb250cm9sR3JvdXAodGhpcyk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXRoIHRvIHRoaXMgY29udHJvbCBncm91cC5cbiAgICovXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGNvbnRyb2xQYXRoKHRoaXMubmFtZSwgdGhpcy5fcGFyZW50KTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHtAbGluayBGb3JtfSB0byB3aGljaCB0aGlzIGdyb3VwIGJlbG9uZ3MuXG4gICAqL1xuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5mb3JtRGlyZWN0aXZlOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7IH1cbn1cbiJdfQ==