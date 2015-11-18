var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var promise_1 = require('angular2/src/facade/promise');
function main() {
    function syncValidator(_) { return null; }
    function asyncValidator(_) { return promise_1.PromiseWrapper.resolve(null); }
    testing_internal_1.describe("Form Builder", function () {
        var b;
        testing_internal_1.beforeEach(function () { b = new core_1.FormBuilder(); });
        testing_internal_1.it("should create controls from a value", function () {
            var g = b.group({ "login": "some value" });
            testing_internal_1.expect(g.controls["login"].value).toEqual("some value");
        });
        testing_internal_1.it("should create controls from an array", function () {
            var g = b.group({ "login": ["some value"], "password": ["some value", syncValidator, asyncValidator] });
            testing_internal_1.expect(g.controls["login"].value).toEqual("some value");
            testing_internal_1.expect(g.controls["password"].value).toEqual("some value");
            testing_internal_1.expect(g.controls["password"].validator).toEqual(syncValidator);
            testing_internal_1.expect(g.controls["password"].asyncValidator).toEqual(asyncValidator);
        });
        testing_internal_1.it("should use controls", function () {
            var g = b.group({ "login": b.control("some value", syncValidator, asyncValidator) });
            testing_internal_1.expect(g.controls["login"].value).toEqual("some value");
            testing_internal_1.expect(g.controls["login"].validator).toBe(syncValidator);
            testing_internal_1.expect(g.controls["login"].asyncValidator).toBe(asyncValidator);
        });
        testing_internal_1.it("should create groups with optional controls", function () {
            var g = b.group({ "login": "some value" }, { "optionals": { "login": false } });
            testing_internal_1.expect(g.contains("login")).toEqual(false);
        });
        testing_internal_1.it("should create groups with a custom validator", function () {
            var g = b.group({ "login": "some value" }, { "validator": syncValidator, "asyncValidator": asyncValidator });
            testing_internal_1.expect(g.validator).toBe(syncValidator);
            testing_internal_1.expect(g.asyncValidator).toBe(asyncValidator);
        });
        testing_internal_1.it("should create control arrays", function () {
            var c = b.control("three");
            var a = b.array(["one", ["two", syncValidator], c, b.array(['four'])], syncValidator, asyncValidator);
            testing_internal_1.expect(a.value).toEqual(['one', 'two', 'three', ['four']]);
            testing_internal_1.expect(a.validator).toBe(syncValidator);
            testing_internal_1.expect(a.asyncValidator).toBe(asyncValidator);
        });
    });
}
exports.main = main;
//# sourceMappingURL=form_builder_spec.js.map