var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var core_1 = require('angular2/core');
var shared_1 = require('angular2/src/common/forms/directives/shared');
var async_1 = require('angular2/src/facade/async');
var promise_1 = require('angular2/src/facade/promise');
var change_detection_1 = require('angular2/src/core/change_detection');
var DummyControlValueAccessor = (function () {
    function DummyControlValueAccessor() {
    }
    DummyControlValueAccessor.prototype.registerOnChange = function (fn) { };
    DummyControlValueAccessor.prototype.registerOnTouched = function (fn) { };
    DummyControlValueAccessor.prototype.writeValue = function (obj) { this.writtenValue = obj; };
    return DummyControlValueAccessor;
})();
var CustomValidatorDirective = (function () {
    function CustomValidatorDirective() {
    }
    CustomValidatorDirective.prototype.validate = function (c) { return { "custom": true }; };
    return CustomValidatorDirective;
})();
function asyncValidator(expected, timeout) {
    if (timeout === void 0) { timeout = 0; }
    return function (c) {
        var completer = promise_1.PromiseWrapper.completer();
        var res = c.value != expected ? { "async": true } : null;
        if (timeout == 0) {
            completer.resolve(res);
        }
        else {
            async_1.TimerWrapper.setTimeout(function () { completer.resolve(res); }, timeout);
        }
        return completer.promise;
    };
}
function main() {
    testing_internal_1.describe("Form Directives", function () {
        var defaultAccessor;
        testing_internal_1.beforeEach(function () { defaultAccessor = new core_1.DefaultValueAccessor(null, null); });
        testing_internal_1.describe("shared", function () {
            testing_internal_1.describe("selectValueAccessor", function () {
                var dir;
                testing_internal_1.beforeEach(function () { dir = new spies_1.SpyNgControl(); });
                testing_internal_1.it("should throw when given an empty array", function () { testing_internal_1.expect(function () { return shared_1.selectValueAccessor(dir, []); }).toThrowError(); });
                testing_internal_1.it("should return the default value accessor when no other provided", function () { testing_internal_1.expect(shared_1.selectValueAccessor(dir, [defaultAccessor])).toEqual(defaultAccessor); });
                testing_internal_1.it("should return checkbox accessor when provided", function () {
                    var checkboxAccessor = new core_1.CheckboxControlValueAccessor(null, null);
                    testing_internal_1.expect(shared_1.selectValueAccessor(dir, [defaultAccessor, checkboxAccessor]))
                        .toEqual(checkboxAccessor);
                });
                testing_internal_1.it("should return select accessor when provided", function () {
                    var selectAccessor = new core_1.SelectControlValueAccessor(null, null, new core_1.QueryList());
                    testing_internal_1.expect(shared_1.selectValueAccessor(dir, [defaultAccessor, selectAccessor]))
                        .toEqual(selectAccessor);
                });
                testing_internal_1.it("should throw when more than one build-in accessor is provided", function () {
                    var checkboxAccessor = new core_1.CheckboxControlValueAccessor(null, null);
                    var selectAccessor = new core_1.SelectControlValueAccessor(null, null, new core_1.QueryList());
                    testing_internal_1.expect(function () { return shared_1.selectValueAccessor(dir, [checkboxAccessor, selectAccessor]); }).toThrowError();
                });
                testing_internal_1.it("should return custom accessor when provided", function () {
                    var customAccessor = new spies_1.SpyValueAccessor();
                    var checkboxAccessor = new core_1.CheckboxControlValueAccessor(null, null);
                    testing_internal_1.expect(shared_1.selectValueAccessor(dir, [defaultAccessor, customAccessor, checkboxAccessor]))
                        .toEqual(customAccessor);
                });
                testing_internal_1.it("should throw when more than one custom accessor is provided", function () {
                    var customAccessor = new spies_1.SpyValueAccessor();
                    testing_internal_1.expect(function () { return shared_1.selectValueAccessor(dir, [customAccessor, customAccessor]); }).toThrowError();
                });
            });
            testing_internal_1.describe("composeValidators", function () {
                testing_internal_1.it("should compose functions", function () {
                    var dummy1 = function (_) { return ({ "dummy1": true }); };
                    var dummy2 = function (_) { return ({ "dummy2": true }); };
                    var v = shared_1.composeValidators([dummy1, dummy2]);
                    testing_internal_1.expect(v(new core_1.Control(""))).toEqual({ "dummy1": true, "dummy2": true });
                });
                testing_internal_1.it("should compose validator directives", function () {
                    var dummy1 = function (_) { return ({ "dummy1": true }); };
                    var v = shared_1.composeValidators([dummy1, new CustomValidatorDirective()]);
                    testing_internal_1.expect(v(new core_1.Control(""))).toEqual({ "dummy1": true, "custom": true });
                });
            });
        });
        testing_internal_1.describe("NgFormModel", function () {
            var form;
            var formModel;
            var loginControlDir;
            testing_internal_1.beforeEach(function () {
                form = new core_1.NgFormModel([], []);
                formModel = new core_1.ControlGroup({
                    "login": new core_1.Control(),
                    "passwords": new core_1.ControlGroup({ "password": new core_1.Control(), "passwordConfirm": new core_1.Control() })
                });
                form.form = formModel;
                loginControlDir = new core_1.NgControlName(form, [core_1.Validators.required], [asyncValidator("expected")], [defaultAccessor]);
                loginControlDir.name = "login";
                loginControlDir.valueAccessor = new DummyControlValueAccessor();
            });
            testing_internal_1.it("should reexport control properties", function () {
                testing_internal_1.expect(form.control).toBe(formModel);
                testing_internal_1.expect(form.value).toBe(formModel.value);
                testing_internal_1.expect(form.valid).toBe(formModel.valid);
                testing_internal_1.expect(form.errors).toBe(formModel.errors);
                testing_internal_1.expect(form.pristine).toBe(formModel.pristine);
                testing_internal_1.expect(form.dirty).toBe(formModel.dirty);
                testing_internal_1.expect(form.touched).toBe(formModel.touched);
                testing_internal_1.expect(form.untouched).toBe(formModel.untouched);
            });
            testing_internal_1.describe("addControl", function () {
                testing_internal_1.it("should throw when no control found", function () {
                    var dir = new core_1.NgControlName(form, null, null, [defaultAccessor]);
                    dir.name = "invalidName";
                    testing_internal_1.expect(function () { return form.addControl(dir); })
                        .toThrowError(new RegExp("Cannot find control 'invalidName'"));
                });
                testing_internal_1.it("should throw when no value accessor", function () {
                    var dir = new core_1.NgControlName(form, null, null, null);
                    dir.name = "login";
                    testing_internal_1.expect(function () { return form.addControl(dir); })
                        .toThrowError(new RegExp("No value accessor for 'login'"));
                });
                testing_internal_1.it("should set up validators", testing_internal_1.fakeAsync(function () {
                    form.addControl(loginControlDir);
                    // sync validators are set
                    testing_internal_1.expect(formModel.hasError("required", ["login"])).toBe(true);
                    testing_internal_1.expect(formModel.hasError("async", ["login"])).toBe(false);
                    formModel.find(["login"]).updateValue("invalid value");
                    // sync validator passes, running async validators
                    testing_internal_1.expect(formModel.pending).toBe(true);
                    testing_internal_1.tick();
                    testing_internal_1.expect(formModel.hasError("required", ["login"])).toBe(false);
                    testing_internal_1.expect(formModel.hasError("async", ["login"])).toBe(true);
                }));
                testing_internal_1.it("should write value to the DOM", function () {
                    formModel.find(["login"]).updateValue("initValue");
                    form.addControl(loginControlDir);
                    testing_internal_1.expect(loginControlDir.valueAccessor.writtenValue).toEqual("initValue");
                });
                testing_internal_1.it("should add the directive to the list of directives included in the form", function () {
                    form.addControl(loginControlDir);
                    testing_internal_1.expect(form.directives).toEqual([loginControlDir]);
                });
            });
            testing_internal_1.describe("addControlGroup", function () {
                var matchingPasswordsValidator = function (g) {
                    if (g.controls["password"].value != g.controls["passwordConfirm"].value) {
                        return { "differentPasswords": true };
                    }
                    else {
                        return null;
                    }
                };
                testing_internal_1.it("should set up validator", testing_internal_1.fakeAsync(function () {
                    var group = new core_1.NgControlGroup(form, [matchingPasswordsValidator], [asyncValidator('expected')]);
                    group.name = "passwords";
                    form.addControlGroup(group);
                    formModel.find(["passwords", "password"]).updateValue("somePassword");
                    formModel.find(["passwords", "passwordConfirm"])
                        .updateValue("someOtherPassword");
                    // sync validators are set
                    testing_internal_1.expect(formModel.hasError("differentPasswords", ["passwords"])).toEqual(true);
                    formModel.find(["passwords", "passwordConfirm"])
                        .updateValue("somePassword");
                    // sync validators pass, running async validators
                    testing_internal_1.expect(formModel.pending).toBe(true);
                    testing_internal_1.tick();
                    testing_internal_1.expect(formModel.hasError("async", ["passwords"])).toBe(true);
                }));
            });
            testing_internal_1.describe("removeControl", function () {
                testing_internal_1.it("should remove the directive to the list of directives included in the form", function () {
                    form.addControl(loginControlDir);
                    form.removeControl(loginControlDir);
                    testing_internal_1.expect(form.directives).toEqual([]);
                });
            });
            testing_internal_1.describe("onChanges", function () {
                testing_internal_1.it("should update dom values of all the directives", function () {
                    form.addControl(loginControlDir);
                    formModel.find(["login"]).updateValue("new value");
                    form.onChanges({});
                    testing_internal_1.expect(loginControlDir.valueAccessor.writtenValue).toEqual("new value");
                });
                testing_internal_1.it("should set up a sync validator", function () {
                    var formValidator = function (c) { return ({ "custom": true }); };
                    var f = new core_1.NgFormModel([formValidator], []);
                    f.form = formModel;
                    f.onChanges({ "form": new change_detection_1.SimpleChange(null, null) });
                    testing_internal_1.expect(formModel.errors).toEqual({ "custom": true });
                });
                testing_internal_1.it("should set up an async validator", testing_internal_1.fakeAsync(function () {
                    var f = new core_1.NgFormModel([], [asyncValidator("expected")]);
                    f.form = formModel;
                    f.onChanges({ "form": new change_detection_1.SimpleChange(null, null) });
                    testing_internal_1.tick();
                    testing_internal_1.expect(formModel.errors).toEqual({ "async": true });
                }));
            });
        });
        testing_internal_1.describe("NgForm", function () {
            var form;
            var formModel;
            var loginControlDir;
            var personControlGroupDir;
            testing_internal_1.beforeEach(function () {
                form = new core_1.NgForm([], []);
                formModel = form.form;
                personControlGroupDir = new core_1.NgControlGroup(form, [], []);
                personControlGroupDir.name = "person";
                loginControlDir = new core_1.NgControlName(personControlGroupDir, null, null, [defaultAccessor]);
                loginControlDir.name = "login";
                loginControlDir.valueAccessor = new DummyControlValueAccessor();
            });
            testing_internal_1.it("should reexport control properties", function () {
                testing_internal_1.expect(form.control).toBe(formModel);
                testing_internal_1.expect(form.value).toBe(formModel.value);
                testing_internal_1.expect(form.valid).toBe(formModel.valid);
                testing_internal_1.expect(form.errors).toBe(formModel.errors);
                testing_internal_1.expect(form.pristine).toBe(formModel.pristine);
                testing_internal_1.expect(form.dirty).toBe(formModel.dirty);
                testing_internal_1.expect(form.touched).toBe(formModel.touched);
                testing_internal_1.expect(form.untouched).toBe(formModel.untouched);
            });
            testing_internal_1.describe("addControl & addControlGroup", function () {
                testing_internal_1.it("should create a control with the given name", testing_internal_1.fakeAsync(function () {
                    form.addControlGroup(personControlGroupDir);
                    form.addControl(loginControlDir);
                    testing_internal_1.flushMicrotasks();
                    testing_internal_1.expect(formModel.find(["person", "login"])).not.toBeNull;
                }));
                // should update the form's value and validity
            });
            testing_internal_1.describe("removeControl & removeControlGroup", function () {
                testing_internal_1.it("should remove control", testing_internal_1.fakeAsync(function () {
                    form.addControlGroup(personControlGroupDir);
                    form.addControl(loginControlDir);
                    form.removeControlGroup(personControlGroupDir);
                    form.removeControl(loginControlDir);
                    testing_internal_1.flushMicrotasks();
                    testing_internal_1.expect(formModel.find(["person"])).toBeNull();
                    testing_internal_1.expect(formModel.find(["person", "login"])).toBeNull();
                }));
                // should update the form's value and validity
            });
            testing_internal_1.it("should set up sync validator", testing_internal_1.fakeAsync(function () {
                var formValidator = function (c) { return ({ "custom": true }); };
                var f = new core_1.NgForm([formValidator], []);
                testing_internal_1.tick();
                testing_internal_1.expect(f.form.errors).toEqual({ "custom": true });
            }));
            testing_internal_1.it("should set up async validator", testing_internal_1.fakeAsync(function () {
                var f = new core_1.NgForm([], [asyncValidator("expected")]);
                testing_internal_1.tick();
                testing_internal_1.expect(f.form.errors).toEqual({ "async": true });
            }));
        });
        testing_internal_1.describe("NgControlGroup", function () {
            var formModel;
            var controlGroupDir;
            testing_internal_1.beforeEach(function () {
                formModel = new core_1.ControlGroup({ "login": new core_1.Control(null) });
                var parent = new core_1.NgFormModel([], []);
                parent.form = new core_1.ControlGroup({ "group": formModel });
                controlGroupDir = new core_1.NgControlGroup(parent, [], []);
                controlGroupDir.name = "group";
            });
            testing_internal_1.it("should reexport control properties", function () {
                testing_internal_1.expect(controlGroupDir.control).toBe(formModel);
                testing_internal_1.expect(controlGroupDir.value).toBe(formModel.value);
                testing_internal_1.expect(controlGroupDir.valid).toBe(formModel.valid);
                testing_internal_1.expect(controlGroupDir.errors).toBe(formModel.errors);
                testing_internal_1.expect(controlGroupDir.pristine).toBe(formModel.pristine);
                testing_internal_1.expect(controlGroupDir.dirty).toBe(formModel.dirty);
                testing_internal_1.expect(controlGroupDir.touched).toBe(formModel.touched);
                testing_internal_1.expect(controlGroupDir.untouched).toBe(formModel.untouched);
            });
        });
        testing_internal_1.describe("NgFormControl", function () {
            var controlDir;
            var control;
            var checkProperties = function (control) {
                testing_internal_1.expect(controlDir.control).toBe(control);
                testing_internal_1.expect(controlDir.value).toBe(control.value);
                testing_internal_1.expect(controlDir.valid).toBe(control.valid);
                testing_internal_1.expect(controlDir.errors).toBe(control.errors);
                testing_internal_1.expect(controlDir.pristine).toBe(control.pristine);
                testing_internal_1.expect(controlDir.dirty).toBe(control.dirty);
                testing_internal_1.expect(controlDir.touched).toBe(control.touched);
                testing_internal_1.expect(controlDir.untouched).toBe(control.untouched);
            };
            testing_internal_1.beforeEach(function () {
                controlDir = new core_1.NgFormControl([core_1.Validators.required], [], [defaultAccessor]);
                controlDir.valueAccessor = new DummyControlValueAccessor();
                control = new core_1.Control(null);
                controlDir.form = control;
            });
            testing_internal_1.it("should reexport control properties", function () { checkProperties(control); });
            testing_internal_1.it("should reexport new control properties", function () {
                var newControl = new core_1.Control(null);
                controlDir.form = newControl;
                controlDir.onChanges({ "form": new change_detection_1.SimpleChange(control, newControl) });
                checkProperties(newControl);
            });
            testing_internal_1.it("should set up validator", function () {
                testing_internal_1.expect(control.valid).toBe(true);
                // this will add the required validator and recalculate the validity
                controlDir.onChanges({ "form": new change_detection_1.SimpleChange(null, control) });
                testing_internal_1.expect(control.valid).toBe(false);
            });
        });
        testing_internal_1.describe("NgModel", function () {
            var ngModel;
            testing_internal_1.beforeEach(function () {
                ngModel =
                    new core_1.NgModel([core_1.Validators.required], [asyncValidator("expected")], [defaultAccessor]);
                ngModel.valueAccessor = new DummyControlValueAccessor();
            });
            testing_internal_1.it("should reexport control properties", function () {
                var control = ngModel.control;
                testing_internal_1.expect(ngModel.control).toBe(control);
                testing_internal_1.expect(ngModel.value).toBe(control.value);
                testing_internal_1.expect(ngModel.valid).toBe(control.valid);
                testing_internal_1.expect(ngModel.errors).toBe(control.errors);
                testing_internal_1.expect(ngModel.pristine).toBe(control.pristine);
                testing_internal_1.expect(ngModel.dirty).toBe(control.dirty);
                testing_internal_1.expect(ngModel.touched).toBe(control.touched);
                testing_internal_1.expect(ngModel.untouched).toBe(control.untouched);
            });
            testing_internal_1.it("should set up validator", testing_internal_1.fakeAsync(function () {
                // this will add the required validator and recalculate the validity
                ngModel.onChanges({});
                testing_internal_1.tick();
                testing_internal_1.expect(ngModel.control.errors).toEqual({ "required": true });
                ngModel.control.updateValue("someValue");
                testing_internal_1.tick();
                testing_internal_1.expect(ngModel.control.errors).toEqual({ "async": true });
            }));
        });
        testing_internal_1.describe("NgControlName", function () {
            var formModel;
            var controlNameDir;
            testing_internal_1.beforeEach(function () {
                formModel = new core_1.Control("name");
                var parent = new core_1.NgFormModel([], []);
                parent.form = new core_1.ControlGroup({ "name": formModel });
                controlNameDir = new core_1.NgControlName(parent, [], [], [defaultAccessor]);
                controlNameDir.name = "name";
            });
            testing_internal_1.it("should reexport control properties", function () {
                testing_internal_1.expect(controlNameDir.control).toBe(formModel);
                testing_internal_1.expect(controlNameDir.value).toBe(formModel.value);
                testing_internal_1.expect(controlNameDir.valid).toBe(formModel.valid);
                testing_internal_1.expect(controlNameDir.errors).toBe(formModel.errors);
                testing_internal_1.expect(controlNameDir.pristine).toBe(formModel.pristine);
                testing_internal_1.expect(controlNameDir.dirty).toBe(formModel.dirty);
                testing_internal_1.expect(controlNameDir.touched).toBe(formModel.touched);
                testing_internal_1.expect(controlNameDir.untouched).toBe(formModel.untouched);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=directives_spec.js.map