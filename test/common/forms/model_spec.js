var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
var async_1 = require('angular2/src/facade/async');
function main() {
    function asyncValidator(expected, timeouts) {
        if (timeouts === void 0) { timeouts = lang_1.CONST_EXPR({}); }
        return function (c) {
            var completer = promise_1.PromiseWrapper.completer();
            var t = lang_1.isPresent(timeouts[c.value]) ? timeouts[c.value] : 0;
            var res = c.value != expected ? { "async": true } : null;
            if (t == 0) {
                completer.resolve(res);
            }
            else {
                async_1.TimerWrapper.setTimeout(function () { completer.resolve(res); }, t);
            }
            return completer.promise;
        };
    }
    function asyncValidatorReturningObservable(c) {
        var e = new async_1.EventEmitter();
        promise_1.PromiseWrapper.scheduleMicrotask(function () { return async_1.ObservableWrapper.callNext(e, { "async": true }); });
        return e;
    }
    testing_internal_1.describe("Form Model", function () {
        testing_internal_1.describe("Control", function () {
            testing_internal_1.it("should default the value to null", function () {
                var c = new core_1.Control();
                testing_internal_1.expect(c.value).toBe(null);
            });
            testing_internal_1.describe("validator", function () {
                testing_internal_1.it("should run validator with the initial value", function () {
                    var c = new core_1.Control("value", core_1.Validators.required);
                    testing_internal_1.expect(c.valid).toEqual(true);
                });
                testing_internal_1.it("should rerun the validator when the value changes", function () {
                    var c = new core_1.Control("value", core_1.Validators.required);
                    c.updateValue(null);
                    testing_internal_1.expect(c.valid).toEqual(false);
                });
                testing_internal_1.it("should return errors", function () {
                    var c = new core_1.Control(null, core_1.Validators.required);
                    testing_internal_1.expect(c.errors).toEqual({ "required": true });
                });
            });
            testing_internal_1.describe("asyncValidator", function () {
                testing_internal_1.it("should run validator with the initial value", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value", null, asyncValidator("expected"));
                    testing_internal_1.tick();
                    testing_internal_1.expect(c.valid).toEqual(false);
                    testing_internal_1.expect(c.errors).toEqual({ "async": true });
                }));
                testing_internal_1.it("should support validators returning observables", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value", null, asyncValidatorReturningObservable);
                    testing_internal_1.tick();
                    testing_internal_1.expect(c.valid).toEqual(false);
                    testing_internal_1.expect(c.errors).toEqual({ "async": true });
                }));
                testing_internal_1.it("should rerun the validator when the value changes", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value", null, asyncValidator("expected"));
                    c.updateValue("expected");
                    testing_internal_1.tick();
                    testing_internal_1.expect(c.valid).toEqual(true);
                }));
                testing_internal_1.it("should run the async validator only when the sync validator passes", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("", core_1.Validators.required, asyncValidator("expected"));
                    testing_internal_1.tick();
                    testing_internal_1.expect(c.errors).toEqual({ "required": true });
                    c.updateValue("some value");
                    testing_internal_1.tick();
                    testing_internal_1.expect(c.errors).toEqual({ "async": true });
                }));
                testing_internal_1.it("should mark the control as pending while running the async validation", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("", null, asyncValidator("expected"));
                    testing_internal_1.expect(c.pending).toEqual(true);
                    testing_internal_1.tick();
                    testing_internal_1.expect(c.pending).toEqual(false);
                }));
                testing_internal_1.it("should only use the latest async validation run", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("", null, asyncValidator("expected", { "long": 200, "expected": 100 }));
                    c.updateValue("long");
                    c.updateValue("expected");
                    testing_internal_1.tick(300);
                    testing_internal_1.expect(c.valid).toEqual(true);
                }));
            });
            testing_internal_1.describe("dirty", function () {
                testing_internal_1.it("should be false after creating a control", function () {
                    var c = new core_1.Control("value");
                    testing_internal_1.expect(c.dirty).toEqual(false);
                });
                testing_internal_1.it("should be true after changing the value of the control", function () {
                    var c = new core_1.Control("value");
                    c.markAsDirty();
                    testing_internal_1.expect(c.dirty).toEqual(true);
                });
            });
            testing_internal_1.describe("updateValue", function () {
                var g, c;
                testing_internal_1.beforeEach(function () {
                    c = new core_1.Control("oldValue");
                    g = new core_1.ControlGroup({ "one": c });
                });
                testing_internal_1.it("should update the value of the control", function () {
                    c.updateValue("newValue");
                    testing_internal_1.expect(c.value).toEqual("newValue");
                });
                testing_internal_1.it("should invoke onChanges if it is present", function () {
                    var onChanges;
                    c.registerOnChange(function (v) { return onChanges = ["invoked", v]; });
                    c.updateValue("newValue");
                    testing_internal_1.expect(onChanges).toEqual(["invoked", "newValue"]);
                });
                testing_internal_1.it("should not invoke on change when explicitly specified", function () {
                    var onChange = null;
                    c.registerOnChange(function (v) { return onChange = ["invoked", v]; });
                    c.updateValue("newValue", { emitModelToViewChange: false });
                    testing_internal_1.expect(onChange).toBeNull();
                });
                testing_internal_1.it("should update the parent", function () {
                    c.updateValue("newValue");
                    testing_internal_1.expect(g.value).toEqual({ "one": "newValue" });
                });
                testing_internal_1.it("should not update the parent when explicitly specified", function () {
                    c.updateValue("newValue", { onlySelf: true });
                    testing_internal_1.expect(g.value).toEqual({ "one": "oldValue" });
                });
                testing_internal_1.it("should fire an event", testing_internal_1.fakeAsync(function () {
                    async_1.ObservableWrapper.subscribe(c.valueChanges, function (value) { testing_internal_1.expect(value).toEqual("newValue"); });
                    c.updateValue("newValue");
                    testing_internal_1.tick();
                }));
                testing_internal_1.it("should not fire an event when explicitly specified", testing_internal_1.fakeAsync(function () {
                    async_1.ObservableWrapper.subscribe(c.valueChanges, function (value) { throw "Should not happen"; });
                    c.updateValue("newValue", { emitEvent: false });
                    testing_internal_1.tick();
                }));
            });
            testing_internal_1.describe("valueChanges & statusChanges", function () {
                var c;
                testing_internal_1.beforeEach(function () { c = new core_1.Control("old", core_1.Validators.required); });
                testing_internal_1.it("should fire an event after the value has been updated", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    async_1.ObservableWrapper.subscribe(c.valueChanges, function (value) {
                        testing_internal_1.expect(c.value).toEqual('new');
                        testing_internal_1.expect(value).toEqual('new');
                        async.done();
                    });
                    c.updateValue("new");
                }));
                testing_internal_1.it("should fire an event after the status has been updated to invalid", testing_internal_1.fakeAsync(function () {
                    async_1.ObservableWrapper.subscribe(c.statusChanges, function (status) {
                        testing_internal_1.expect(c.status).toEqual('INVALID');
                        testing_internal_1.expect(status).toEqual('INVALID');
                    });
                    c.updateValue("");
                    testing_internal_1.tick();
                }));
                testing_internal_1.it("should fire an event after the status has been updated to pending", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("old", core_1.Validators.required, asyncValidator("expected"));
                    var log = [];
                    async_1.ObservableWrapper.subscribe(c.valueChanges, function (value) { return log.push("value: '" + value + "'"); });
                    async_1.ObservableWrapper.subscribe(c.statusChanges, function (status) { return log.push("status: '" + status + "'"); });
                    c.updateValue("");
                    testing_internal_1.tick();
                    c.updateValue("nonEmpty");
                    testing_internal_1.tick();
                    c.updateValue("expected");
                    testing_internal_1.tick();
                    testing_internal_1.expect(log).toEqual([
                        "" + "value: ''",
                        "status: 'INVALID'",
                        "value: 'nonEmpty'",
                        "status: 'PENDING'",
                        "status: 'INVALID'",
                        "value: 'expected'",
                        "status: 'PENDING'",
                        "status: 'VALID'",
                    ]);
                }));
                // TODO: remove the if statement after making observable delivery sync
                if (!lang_1.IS_DART) {
                    testing_internal_1.it("should update set errors and status before emitting an event", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                        c.valueChanges.subscribe(function (value) {
                            testing_internal_1.expect(c.valid).toEqual(false);
                            testing_internal_1.expect(c.errors).toEqual({ "required": true });
                            async.done();
                        });
                        c.updateValue("");
                    }));
                }
                testing_internal_1.it("should return a cold observable", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    c.updateValue("will be ignored");
                    async_1.ObservableWrapper.subscribe(c.valueChanges, function (value) {
                        testing_internal_1.expect(value).toEqual('new');
                        async.done();
                    });
                    c.updateValue("new");
                }));
            });
            testing_internal_1.describe("setErrors", function () {
                testing_internal_1.it("should set errors on a control", function () {
                    var c = new core_1.Control("someValue");
                    c.setErrors({ "someError": true });
                    testing_internal_1.expect(c.valid).toEqual(false);
                    testing_internal_1.expect(c.errors).toEqual({ "someError": true });
                });
                testing_internal_1.it("should reset the errors and validity when the value changes", function () {
                    var c = new core_1.Control("someValue", core_1.Validators.required);
                    c.setErrors({ "someError": true });
                    c.updateValue("");
                    testing_internal_1.expect(c.errors).toEqual({ "required": true });
                });
                testing_internal_1.it("should update the parent group's validity", function () {
                    var c = new core_1.Control("someValue");
                    var g = new core_1.ControlGroup({ "one": c });
                    testing_internal_1.expect(g.valid).toEqual(true);
                    c.setErrors({ "someError": true });
                    testing_internal_1.expect(g.valid).toEqual(false);
                });
                testing_internal_1.it("should not reset parent's errors", function () {
                    var c = new core_1.Control("someValue");
                    var g = new core_1.ControlGroup({ "one": c });
                    g.setErrors({ "someGroupError": true });
                    c.setErrors({ "someError": true });
                    testing_internal_1.expect(g.errors).toEqual({ "someGroupError": true });
                });
                testing_internal_1.it("should reset errors when updating a value", function () {
                    var c = new core_1.Control("oldValue");
                    var g = new core_1.ControlGroup({ "one": c });
                    g.setErrors({ "someGroupError": true });
                    c.setErrors({ "someError": true });
                    c.updateValue("newValue");
                    testing_internal_1.expect(c.errors).toEqual(null);
                    testing_internal_1.expect(g.errors).toEqual(null);
                });
            });
        });
        testing_internal_1.describe("ControlGroup", function () {
            testing_internal_1.describe("value", function () {
                testing_internal_1.it("should be the reduced value of the child controls", function () {
                    var g = new core_1.ControlGroup({ "one": new core_1.Control("111"), "two": new core_1.Control("222") });
                    testing_internal_1.expect(g.value).toEqual({ "one": "111", "two": "222" });
                });
                testing_internal_1.it("should be empty when there are no child controls", function () {
                    var g = new core_1.ControlGroup({});
                    testing_internal_1.expect(g.value).toEqual({});
                });
                testing_internal_1.it("should support nested groups", function () {
                    var g = new core_1.ControlGroup({ "one": new core_1.Control("111"), "nested": new core_1.ControlGroup({ "two": new core_1.Control("222") }) });
                    testing_internal_1.expect(g.value).toEqual({ "one": "111", "nested": { "two": "222" } });
                    (g.controls["nested"].find("two")).updateValue("333");
                    testing_internal_1.expect(g.value).toEqual({ "one": "111", "nested": { "two": "333" } });
                });
            });
            testing_internal_1.describe("errors", function () {
                testing_internal_1.it("should run the validator when the value changes", function () {
                    var simpleValidator = function (c) {
                        return c.controls["one"].value != "correct" ? { "broken": true } : null;
                    };
                    var c = new core_1.Control(null);
                    var g = new core_1.ControlGroup({ "one": c }, null, simpleValidator);
                    c.updateValue("correct");
                    testing_internal_1.expect(g.valid).toEqual(true);
                    testing_internal_1.expect(g.errors).toEqual(null);
                    c.updateValue("incorrect");
                    testing_internal_1.expect(g.valid).toEqual(false);
                    testing_internal_1.expect(g.errors).toEqual({ "broken": true });
                });
            });
            testing_internal_1.describe("dirty", function () {
                var c, g;
                testing_internal_1.beforeEach(function () {
                    c = new core_1.Control('value');
                    g = new core_1.ControlGroup({ "one": c });
                });
                testing_internal_1.it("should be false after creating a control", function () { testing_internal_1.expect(g.dirty).toEqual(false); });
                testing_internal_1.it("should be false after changing the value of the control", function () {
                    c.markAsDirty();
                    testing_internal_1.expect(g.dirty).toEqual(true);
                });
            });
            testing_internal_1.describe("optional components", function () {
                testing_internal_1.describe("contains", function () {
                    var group;
                    testing_internal_1.beforeEach(function () {
                        group = new core_1.ControlGroup({
                            "required": new core_1.Control("requiredValue"),
                            "optional": new core_1.Control("optionalValue")
                        }, { "optional": false });
                    });
                    // rename contains into has
                    testing_internal_1.it("should return false when the component is not included", function () { testing_internal_1.expect(group.contains("optional")).toEqual(false); });
                    testing_internal_1.it("should return false when there is no component with the given name", function () { testing_internal_1.expect(group.contains("something else")).toEqual(false); });
                    testing_internal_1.it("should return true when the component is included", function () {
                        testing_internal_1.expect(group.contains("required")).toEqual(true);
                        group.include("optional");
                        testing_internal_1.expect(group.contains("optional")).toEqual(true);
                    });
                });
                testing_internal_1.it("should not include an inactive component into the group value", function () {
                    var group = new core_1.ControlGroup({ "required": new core_1.Control("requiredValue"), "optional": new core_1.Control("optionalValue") }, { "optional": false });
                    testing_internal_1.expect(group.value).toEqual({ "required": "requiredValue" });
                    group.include("optional");
                    testing_internal_1.expect(group.value).toEqual({ "required": "requiredValue", "optional": "optionalValue" });
                });
                testing_internal_1.it("should not run Validators on an inactive component", function () {
                    var group = new core_1.ControlGroup({
                        "required": new core_1.Control("requiredValue", core_1.Validators.required),
                        "optional": new core_1.Control("", core_1.Validators.required)
                    }, { "optional": false });
                    testing_internal_1.expect(group.valid).toEqual(true);
                    group.include("optional");
                    testing_internal_1.expect(group.valid).toEqual(false);
                });
            });
            testing_internal_1.describe("valueChanges", function () {
                var g, c1, c2;
                testing_internal_1.beforeEach(function () {
                    c1 = new core_1.Control("old1");
                    c2 = new core_1.Control("old2");
                    g = new core_1.ControlGroup({ "one": c1, "two": c2 }, { "two": true });
                });
                testing_internal_1.it("should fire an event after the value has been updated", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    async_1.ObservableWrapper.subscribe(g.valueChanges, function (value) {
                        testing_internal_1.expect(g.value).toEqual({ 'one': 'new1', 'two': 'old2' });
                        testing_internal_1.expect(value).toEqual({ 'one': 'new1', 'two': 'old2' });
                        async.done();
                    });
                    c1.updateValue("new1");
                }));
                testing_internal_1.it("should fire an event after the control's observable fired an event", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var controlCallbackIsCalled = false;
                    async_1.ObservableWrapper.subscribe(c1.valueChanges, function (value) { controlCallbackIsCalled = true; });
                    async_1.ObservableWrapper.subscribe(g.valueChanges, function (value) {
                        testing_internal_1.expect(controlCallbackIsCalled).toBe(true);
                        async.done();
                    });
                    c1.updateValue("new1");
                }));
                testing_internal_1.it("should fire an event when a control is excluded", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    async_1.ObservableWrapper.subscribe(g.valueChanges, function (value) {
                        testing_internal_1.expect(value).toEqual({ 'one': 'old1' });
                        async.done();
                    });
                    g.exclude("two");
                }));
                testing_internal_1.it("should fire an event when a control is included", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    g.exclude("two");
                    async_1.ObservableWrapper.subscribe(g.valueChanges, function (value) {
                        testing_internal_1.expect(value).toEqual({ 'one': 'old1', 'two': 'old2' });
                        async.done();
                    });
                    g.include("two");
                }));
                testing_internal_1.it("should fire an event every time a control is updated", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var loggedValues = [];
                    async_1.ObservableWrapper.subscribe(g.valueChanges, function (value) {
                        loggedValues.push(value);
                        if (loggedValues.length == 2) {
                            testing_internal_1.expect(loggedValues)
                                .toEqual([{ "one": "new1", "two": "old2" }, { "one": "new1", "two": "new2" }]);
                            async.done();
                        }
                    });
                    c1.updateValue("new1");
                    c2.updateValue("new2");
                }));
                testing_internal_1.xit("should not fire an event when an excluded control is updated", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    // hard to test without hacking zones
                }));
            });
            testing_internal_1.describe("getError", function () {
                testing_internal_1.it("should return the error when it is present", function () {
                    var c = new core_1.Control("", core_1.Validators.required);
                    var g = new core_1.ControlGroup({ "one": c });
                    testing_internal_1.expect(c.getError("required")).toEqual(true);
                    testing_internal_1.expect(g.getError("required", ["one"])).toEqual(true);
                });
                testing_internal_1.it("should return null otherwise", function () {
                    var c = new core_1.Control("not empty", core_1.Validators.required);
                    var g = new core_1.ControlGroup({ "one": c });
                    testing_internal_1.expect(c.getError("invalid")).toEqual(null);
                    testing_internal_1.expect(g.getError("required", ["one"])).toEqual(null);
                    testing_internal_1.expect(g.getError("required", ["invalid"])).toEqual(null);
                });
            });
            testing_internal_1.describe("asyncValidator", function () {
                testing_internal_1.it("should run the async validator", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value");
                    var g = new core_1.ControlGroup({ "one": c }, null, null, asyncValidator("expected"));
                    testing_internal_1.expect(g.pending).toEqual(true);
                    testing_internal_1.tick(1);
                    testing_internal_1.expect(g.errors).toEqual({ "async": true });
                    testing_internal_1.expect(g.pending).toEqual(false);
                }));
                testing_internal_1.it("should set the parent group's status to pending", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value", null, asyncValidator("expected"));
                    var g = new core_1.ControlGroup({ "one": c });
                    testing_internal_1.expect(g.pending).toEqual(true);
                    testing_internal_1.tick(1);
                    testing_internal_1.expect(g.pending).toEqual(false);
                }));
                testing_internal_1.it("should run the parent group's async validator when children are pending", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value", null, asyncValidator("expected"));
                    var g = new core_1.ControlGroup({ "one": c }, null, null, asyncValidator("expected"));
                    testing_internal_1.tick(1);
                    testing_internal_1.expect(g.errors).toEqual({ "async": true });
                    testing_internal_1.expect(g.find(["one"]).errors).toEqual({ "async": true });
                }));
            });
        });
        testing_internal_1.describe("ControlArray", function () {
            testing_internal_1.describe("adding/removing", function () {
                var a;
                var c1, c2, c3;
                testing_internal_1.beforeEach(function () {
                    a = new core_1.ControlArray([]);
                    c1 = new core_1.Control(1);
                    c2 = new core_1.Control(2);
                    c3 = new core_1.Control(3);
                });
                testing_internal_1.it("should support pushing", function () {
                    a.push(c1);
                    testing_internal_1.expect(a.length).toEqual(1);
                    testing_internal_1.expect(a.controls).toEqual([c1]);
                });
                testing_internal_1.it("should support removing", function () {
                    a.push(c1);
                    a.push(c2);
                    a.push(c3);
                    a.removeAt(1);
                    testing_internal_1.expect(a.controls).toEqual([c1, c3]);
                });
                testing_internal_1.it("should support inserting", function () {
                    a.push(c1);
                    a.push(c3);
                    a.insert(1, c2);
                    testing_internal_1.expect(a.controls).toEqual([c1, c2, c3]);
                });
            });
            testing_internal_1.describe("value", function () {
                testing_internal_1.it("should be the reduced value of the child controls", function () {
                    var a = new core_1.ControlArray([new core_1.Control(1), new core_1.Control(2)]);
                    testing_internal_1.expect(a.value).toEqual([1, 2]);
                });
                testing_internal_1.it("should be an empty array when there are no child controls", function () {
                    var a = new core_1.ControlArray([]);
                    testing_internal_1.expect(a.value).toEqual([]);
                });
            });
            testing_internal_1.describe("errors", function () {
                testing_internal_1.it("should run the validator when the value changes", function () {
                    var simpleValidator = function (c) { return c.controls[0].value != "correct" ? { "broken": true } : null; };
                    var c = new core_1.Control(null);
                    var g = new core_1.ControlArray([c], simpleValidator);
                    c.updateValue("correct");
                    testing_internal_1.expect(g.valid).toEqual(true);
                    testing_internal_1.expect(g.errors).toEqual(null);
                    c.updateValue("incorrect");
                    testing_internal_1.expect(g.valid).toEqual(false);
                    testing_internal_1.expect(g.errors).toEqual({ "broken": true });
                });
            });
            testing_internal_1.describe("dirty", function () {
                var c;
                var a;
                testing_internal_1.beforeEach(function () {
                    c = new core_1.Control('value');
                    a = new core_1.ControlArray([c]);
                });
                testing_internal_1.it("should be false after creating a control", function () { testing_internal_1.expect(a.dirty).toEqual(false); });
                testing_internal_1.it("should be false after changing the value of the control", function () {
                    c.markAsDirty();
                    testing_internal_1.expect(a.dirty).toEqual(true);
                });
            });
            testing_internal_1.describe("pending", function () {
                var c;
                var a;
                testing_internal_1.beforeEach(function () {
                    c = new core_1.Control('value');
                    a = new core_1.ControlArray([c]);
                });
                testing_internal_1.it("should be false after creating a control", function () {
                    testing_internal_1.expect(c.pending).toEqual(false);
                    testing_internal_1.expect(a.pending).toEqual(false);
                });
                testing_internal_1.it("should be true after changing the value of the control", function () {
                    c.markAsPending();
                    testing_internal_1.expect(c.pending).toEqual(true);
                    testing_internal_1.expect(a.pending).toEqual(true);
                });
                testing_internal_1.it("should not update the parent when onlySelf = true", function () {
                    c.markAsPending({ onlySelf: true });
                    testing_internal_1.expect(c.pending).toEqual(true);
                    testing_internal_1.expect(a.pending).toEqual(false);
                });
            });
            testing_internal_1.describe("valueChanges", function () {
                var a;
                var c1, c2;
                testing_internal_1.beforeEach(function () {
                    c1 = new core_1.Control("old1");
                    c2 = new core_1.Control("old2");
                    a = new core_1.ControlArray([c1, c2]);
                });
                testing_internal_1.it("should fire an event after the value has been updated", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    async_1.ObservableWrapper.subscribe(a.valueChanges, function (value) {
                        testing_internal_1.expect(a.value).toEqual(['new1', 'old2']);
                        testing_internal_1.expect(value).toEqual(['new1', 'old2']);
                        async.done();
                    });
                    c1.updateValue("new1");
                }));
                testing_internal_1.it("should fire an event after the control's observable fired an event", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var controlCallbackIsCalled = false;
                    async_1.ObservableWrapper.subscribe(c1.valueChanges, function (value) { controlCallbackIsCalled = true; });
                    async_1.ObservableWrapper.subscribe(a.valueChanges, function (value) {
                        testing_internal_1.expect(controlCallbackIsCalled).toBe(true);
                        async.done();
                    });
                    c1.updateValue("new1");
                }));
                testing_internal_1.it("should fire an event when a control is removed", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    async_1.ObservableWrapper.subscribe(a.valueChanges, function (value) {
                        testing_internal_1.expect(value).toEqual(['old1']);
                        async.done();
                    });
                    a.removeAt(1);
                }));
                testing_internal_1.it("should fire an event when a control is added", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    a.removeAt(1);
                    async_1.ObservableWrapper.subscribe(a.valueChanges, function (value) {
                        testing_internal_1.expect(value).toEqual(['old1', 'old2']);
                        async.done();
                    });
                    a.push(c2);
                }));
            });
            testing_internal_1.describe("find", function () {
                testing_internal_1.it("should return null when path is null", function () {
                    var g = new core_1.ControlGroup({});
                    testing_internal_1.expect(g.find(null)).toEqual(null);
                });
                testing_internal_1.it("should return null when path is empty", function () {
                    var g = new core_1.ControlGroup({});
                    testing_internal_1.expect(g.find([])).toEqual(null);
                });
                testing_internal_1.it("should return null when path is invalid", function () {
                    var g = new core_1.ControlGroup({});
                    testing_internal_1.expect(g.find(["one", "two"])).toEqual(null);
                });
                testing_internal_1.it("should return a child of a control group", function () {
                    var g = new core_1.ControlGroup({ "one": new core_1.Control("111"), "nested": new core_1.ControlGroup({ "two": new core_1.Control("222") }) });
                    testing_internal_1.expect(g.find(["nested", "two"]).value).toEqual("222");
                    testing_internal_1.expect(g.find(["one"]).value).toEqual("111");
                    testing_internal_1.expect(g.find("nested/two").value).toEqual("222");
                    testing_internal_1.expect(g.find("one").value).toEqual("111");
                });
                testing_internal_1.it("should return an element of an array", function () {
                    var g = new core_1.ControlGroup({ "array": new core_1.ControlArray([new core_1.Control("111")]) });
                    testing_internal_1.expect(g.find(["array", 0]).value).toEqual("111");
                });
            });
            testing_internal_1.describe("asyncValidator", function () {
                testing_internal_1.it("should run the async validator", testing_internal_1.fakeAsync(function () {
                    var c = new core_1.Control("value");
                    var g = new core_1.ControlArray([c], null, asyncValidator("expected"));
                    testing_internal_1.expect(g.pending).toEqual(true);
                    testing_internal_1.tick(1);
                    testing_internal_1.expect(g.errors).toEqual({ "async": true });
                    testing_internal_1.expect(g.pending).toEqual(false);
                }));
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=model_spec.js.map