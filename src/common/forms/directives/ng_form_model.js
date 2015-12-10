'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var control_container_1 = require('./control_container');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var formDirectiveProvider = lang_1.CONST_EXPR(new core_1.Provider(control_container_1.ControlContainer, { useExisting: core_1.forwardRef(function () { return NgFormModel; }) }));
/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ng-form-model]="loginForm">
 *         <p>Login: <input type="text" ng-control="login"></p>
 *         <p>Password: <input type="password" ng-control="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ng-model to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ng-form-model]='loginForm'>
 *          Login <input type='text' ng-control='login' [(ng-model)]='credentials.login'>
 *          Password <input type='password' ng-control='password'
 *                          [(ng-model)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
var NgFormModel = (function (_super) {
    __extends(NgFormModel, _super);
    function NgFormModel(_validators, _asyncValidators) {
        _super.call(this);
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new async_1.EventEmitter();
    }
    NgFormModel.prototype.ngOnChanges = function (changes) {
        if (collection_1.StringMapWrapper.contains(changes, "form")) {
            var sync = shared_1.composeValidators(this._validators);
            this.form.validator = validators_1.Validators.compose([this.form.validator, sync]);
            var async = shared_1.composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = validators_1.Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    };
    Object.defineProperty(NgFormModel.prototype, "formDirective", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormModel.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormModel.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    NgFormModel.prototype.addControl = function (dir) {
        var ctrl = this.form.find(dir.path);
        shared_1.setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    };
    NgFormModel.prototype.getControl = function (dir) { return this.form.find(dir.path); };
    NgFormModel.prototype.removeControl = function (dir) { collection_1.ListWrapper.remove(this.directives, dir); };
    NgFormModel.prototype.addControlGroup = function (dir) {
        var ctrl = this.form.find(dir.path);
        shared_1.setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    };
    NgFormModel.prototype.removeControlGroup = function (dir) { };
    NgFormModel.prototype.getControlGroup = function (dir) {
        return this.form.find(dir.path);
    };
    NgFormModel.prototype.updateModel = function (dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    };
    NgFormModel.prototype.onSubmit = function () {
        async_1.ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    };
    /** @internal */
    NgFormModel.prototype._updateDomValue = function () {
        var _this = this;
        this.directives.forEach(function (dir) {
            var ctrl = _this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    };
    NgFormModel = __decorate([
        core_1.Directive({
            selector: '[ng-form-model]',
            bindings: [formDirectiveProvider],
            inputs: ['form: ng-form-model'],
            host: { '(submit)': 'onSubmit()' },
            outputs: ['ngSubmit'],
            exportAs: 'ngForm'
        }),
        __param(0, core_1.Optional()),
        __param(0, core_1.Self()),
        __param(0, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)), 
        __metadata('design:paramtypes', [Array, Array])
    ], NgFormModel);
    return NgFormModel;
})(control_container_1.ControlContainer);
exports.NgFormModel = NgFormModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX21vZGVsLnRzIl0sIm5hbWVzIjpbIk5nRm9ybU1vZGVsIiwiTmdGb3JtTW9kZWwuY29uc3RydWN0b3IiLCJOZ0Zvcm1Nb2RlbC5uZ09uQ2hhbmdlcyIsIk5nRm9ybU1vZGVsLmZvcm1EaXJlY3RpdmUiLCJOZ0Zvcm1Nb2RlbC5jb250cm9sIiwiTmdGb3JtTW9kZWwucGF0aCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2wiLCJOZ0Zvcm1Nb2RlbC5nZXRDb250cm9sIiwiTmdGb3JtTW9kZWwucmVtb3ZlQ29udHJvbCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnJlbW92ZUNvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnVwZGF0ZU1vZGVsIiwiTmdGb3JtTW9kZWwub25TdWJtaXQiLCJOZ0Zvcm1Nb2RlbC5fdXBkYXRlRG9tVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFDcEQsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Usc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBU08sZUFBZSxDQUFDLENBQUE7QUFHdkIsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFHckQsdUJBQXlGLFVBQVUsQ0FBQyxDQUFBO0FBQ3BHLDJCQUE2RCxlQUFlLENBQUMsQ0FBQTtBQUU3RSxJQUFNLHFCQUFxQixHQUN2QixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUFDLG9DQUFnQixFQUFFLEVBQUMsV0FBVyxFQUFFLGlCQUFVLENBQUMsY0FBTSxPQUFBLFdBQVcsRUFBWCxDQUFXLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUU3Rjs7Ozs7Ozs7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Q0EsT0FBT0EsQ0FBQ0EsVUFBQUEsR0FBR0E7WUFDekJBLElBQUlBLElBQUlBLEdBQVFBLEtBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ3pDQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUE5RUhkO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSxpQkFBaUJBO1lBQzNCQSxRQUFRQSxFQUFFQSxDQUFDQSxxQkFBcUJBLENBQUNBO1lBQ2pDQSxNQUFNQSxFQUFFQSxDQUFDQSxxQkFBcUJBLENBQUNBO1lBQy9CQSxJQUFJQSxFQUFFQSxFQUFDQSxVQUFVQSxFQUFFQSxZQUFZQSxFQUFDQTtZQUNoQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7WUFDckJBLFFBQVFBLEVBQUVBLFFBQVFBO1NBQ25CQSxDQUFDQTtRQU9ZQSxXQUFDQSxlQUFRQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxXQUFJQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxhQUFNQSxDQUFDQSwwQkFBYUEsQ0FBQ0EsQ0FBQUE7UUFDMUNBLFdBQUNBLGVBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLGFBQU1BLENBQUNBLGdDQUFtQkEsQ0FBQ0EsQ0FBQUE7O29CQWdFN0RBO0lBQURBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQS9FRCxFQVFpQyxvQ0FBZ0IsRUF1RWhEO0FBdkVZLG1CQUFXLGNBdUV2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBTaW1wbGVDaGFuZ2UsXG4gIE9uQ2hhbmdlcyxcbiAgRGlyZWN0aXZlLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtOZ0NvbnRyb2xHcm91cH0gZnJvbSAnLi9uZ19jb250cm9sX2dyb3VwJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtDb250cm9sLCBDb250cm9sR3JvdXB9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7c2V0VXBDb250cm9sLCBzZXRVcENvbnRyb2xHcm91cCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlciA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoQ29udHJvbENvbnRhaW5lciwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybU1vZGVsKX0pKTtcblxuLyoqXG4gKiBCaW5kcyBhbiBleGlzdGluZyBjb250cm9sIGdyb3VwIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2pxclZpcnVkWThhbkp4VE1ValRQP3A9cHJldmlldykpXG4gKlxuICogSW4gdGhpcyBleGFtcGxlLCB3ZSBiaW5kIHRoZSBjb250cm9sIGdyb3VwIHRvIHRoZSBmb3JtIGVsZW1lbnQsIGFuZCB3ZSBiaW5kIHRoZSBsb2dpbiBhbmRcbiAqIHBhc3N3b3JkIGNvbnRyb2xzIHRvIHRoZSBsb2dpbiBhbmQgcGFzc3dvcmQgZWxlbWVudHMuXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5OZ0Zvcm1Nb2RlbCBFeGFtcGxlPC9oMj5cbiAqICAgICAgIDxmb3JtIFtuZy1mb3JtLW1vZGVsXT1cImxvZ2luRm9ybVwiPlxuICogICAgICAgICA8cD5Mb2dpbjogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmctY29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgICA8cD5QYXNzd29yZDogPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nLWNvbnRyb2w9XCJwYXNzd29yZFwiPjwvcD5cbiAqICAgICAgIDwvZm9ybT5cbiAqICAgICAgIDxwPlZhbHVlOjwvcD5cbiAqICAgICAgIDxwcmU+e3t2YWx1ZX19PC9wcmU+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGxvZ2luRm9ybTogQ29udHJvbEdyb3VwO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5sb2dpbkZvcm0gPSBuZXcgQ29udHJvbEdyb3VwKHtcbiAqICAgICAgIGxvZ2luOiBuZXcgQ29udHJvbChcIlwiKSxcbiAqICAgICAgIHBhc3N3b3JkOiBuZXcgQ29udHJvbChcIlwiKVxuICogICAgIH0pO1xuICogICB9XG4gKlxuICogICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAqICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5sb2dpbkZvcm0udmFsdWUsIG51bGwsIDIpO1xuICogICB9XG4gKiB9XG4gKiAgYGBgXG4gKlxuICogV2UgY2FuIGFsc28gdXNlIG5nLW1vZGVsIHRvIGJpbmQgYSBkb21haW4gbW9kZWwgdG8gdGhlIGZvcm0uXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJsb2dpbi1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYFxuICogICAgICAgIDxmb3JtIFtuZy1mb3JtLW1vZGVsXT0nbG9naW5Gb3JtJz5cbiAqICAgICAgICAgIExvZ2luIDxpbnB1dCB0eXBlPSd0ZXh0JyBuZy1jb250cm9sPSdsb2dpbicgWyhuZy1tb2RlbCldPSdjcmVkZW50aWFscy5sb2dpbic+XG4gKiAgICAgICAgICBQYXNzd29yZCA8aW5wdXQgdHlwZT0ncGFzc3dvcmQnIG5nLWNvbnRyb2w9J3Bhc3N3b3JkJ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIFsobmctbW9kZWwpXT0nY3JlZGVudGlhbHMucGFzc3dvcmQnPlxuICogICAgICAgICAgPGJ1dHRvbiAoY2xpY2spPVwib25Mb2dpbigpXCI+TG9naW48L2J1dHRvbj5cbiAqICAgICAgICA8L2Zvcm0+YFxuICogICAgICB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBjcmVkZW50aWFsczoge2xvZ2luOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmd9O1xuICogIGxvZ2luRm9ybTogQ29udHJvbEdyb3VwO1xuICpcbiAqICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgIHRoaXMubG9naW5Gb3JtID0gbmV3IENvbnRyb2xHcm91cCh7XG4gKiAgICAgIGxvZ2luOiBuZXcgQ29udHJvbChcIlwiKSxcbiAqICAgICAgcGFzc3dvcmQ6IG5ldyBDb250cm9sKFwiXCIpXG4gKiAgICB9KTtcbiAqICB9XG4gKlxuICogIG9uTG9naW4oKTogdm9pZCB7XG4gKiAgICAvLyB0aGlzLmNyZWRlbnRpYWxzLmxvZ2luID09PSAnc29tZSBsb2dpbidcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMucGFzc3dvcmQgPT09ICdzb21lIHBhc3N3b3JkJ1xuICogIH1cbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nLWZvcm0tbW9kZWxdJyxcbiAgYmluZGluZ3M6IFtmb3JtRGlyZWN0aXZlUHJvdmlkZXJdLFxuICBpbnB1dHM6IFsnZm9ybTogbmctZm9ybS1tb2RlbCddLFxuICBob3N0OiB7JyhzdWJtaXQpJzogJ29uU3VibWl0KCknfSxcbiAgb3V0cHV0czogWyduZ1N1Ym1pdCddLFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdGb3JtTW9kZWwgZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgRm9ybSxcbiAgICBPbkNoYW5nZXMge1xuICBmb3JtOiBDb250cm9sR3JvdXAgPSBudWxsO1xuICBkaXJlY3RpdmVzOiBOZ0NvbnRyb2xbXSA9IFtdO1xuICBuZ1N1Ym1pdCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBTaW1wbGVDaGFuZ2V9KTogdm9pZCB7XG4gICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoY2hhbmdlcywgXCJmb3JtXCIpKSB7XG4gICAgICB2YXIgc3luYyA9IGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpO1xuICAgICAgdGhpcy5mb3JtLnZhbGlkYXRvciA9IFZhbGlkYXRvcnMuY29tcG9zZShbdGhpcy5mb3JtLnZhbGlkYXRvciwgc3luY10pO1xuXG4gICAgICB2YXIgYXN5bmMgPSBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7XG4gICAgICB0aGlzLmZvcm0uYXN5bmNWYWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2VBc3luYyhbdGhpcy5mb3JtLmFzeW5jVmFsaWRhdG9yLCBhc3luY10pO1xuXG4gICAgICB0aGlzLmZvcm0udXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IHRydWUsIGVtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVEb21WYWx1ZSgpO1xuICB9XG5cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiB0aGlzOyB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbEdyb3VwIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgYWRkQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICAgIHZhciBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgc2V0VXBDb250cm9sKGN0cmwsIGRpcik7XG4gICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgdGhpcy5kaXJlY3RpdmVzLnB1c2goZGlyKTtcbiAgfVxuXG4gIGdldENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiBDb250cm9sIHsgcmV0dXJuIDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTsgfVxuXG4gIHJlbW92ZUNvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHsgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuZGlyZWN0aXZlcywgZGlyKTsgfVxuXG4gIGFkZENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKSB7XG4gICAgdmFyIGN0cmw6IGFueSA9IHRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICBzZXRVcENvbnRyb2xHcm91cChjdHJsLCBkaXIpO1xuICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgcmVtb3ZlQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApIHt9XG5cbiAgZ2V0Q29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiBDb250cm9sR3JvdXAge1xuICAgIHJldHVybiA8Q29udHJvbEdyb3VwPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgfVxuXG4gIHVwZGF0ZU1vZGVsKGRpcjogTmdDb250cm9sLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdmFyIGN0cmzCoCA9IDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICBjdHJsLnVwZGF0ZVZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIG9uU3VibWl0KCk6IGJvb2xlYW4ge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMubmdTdWJtaXQsIG51bGwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZURvbVZhbHVlKCkge1xuICAgIHRoaXMuZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB7XG4gICAgICB2YXIgY3RybDogYW55ID0gdGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgICAgZGlyLnZhbHVlQWNjZXNzb3Iud3JpdGVWYWx1ZShjdHJsLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19