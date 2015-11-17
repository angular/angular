var __extends = (this && this.__extends) || function (d, b) {
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
var metadata_1 = require('angular2/src/core/metadata');
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var control_container_1 = require('./control_container');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var controlGroupProvider = lang_1.CONST_EXPR(new di_1.Provider(control_container_1.ControlContainer, { useExisting: di_1.forwardRef(function () { return NgControlGroup; }) }));
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
    NgControlGroup.prototype.onInit = function () { this.formDirective.addControlGroup(this); };
    NgControlGroup.prototype.onDestroy = function () { this.formDirective.removeControlGroup(this); };
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
        metadata_1.Directive({
            selector: '[ng-control-group]',
            providers: [controlGroupProvider],
            inputs: ['name: ng-control-group'],
            exportAs: 'form'
        }),
        __param(0, di_1.Host()),
        __param(0, di_1.SkipSelf()),
        __param(1, di_1.Optional()),
        __param(1, di_1.Inject(validators_1.NG_VALIDATORS)),
        __param(2, di_1.Optional()),
        __param(2, di_1.Inject(validators_1.NG_ASYNC_VALIDATORS)), 
        __metadata('design:paramtypes', [control_container_1.ControlContainer, Array, Array])
    ], NgControlGroup);
    return NgControlGroup;
})(control_container_1.ControlContainer);
exports.NgControlGroup = NgControlGroup;
//# sourceMappingURL=ng_control_group.js.map