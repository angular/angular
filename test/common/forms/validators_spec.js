var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var promise_1 = require('angular2/src/facade/promise');
var async_1 = require('angular2/src/facade/async');
function main() {
    function validator(key, error) {
        return function (c) {
            var r = {};
            r[key] = error;
            return r;
        };
    }
    testing_internal_1.describe("Validators", function () {
        testing_internal_1.describe("required", function () {
            testing_internal_1.it("should error on an empty string", function () { testing_internal_1.expect(core_1.Validators.required(new core_1.Control(""))).toEqual({ "required": true }); });
            testing_internal_1.it("should error on null", function () { testing_internal_1.expect(core_1.Validators.required(new core_1.Control(null))).toEqual({ "required": true }); });
            testing_internal_1.it("should not error on a non-empty string", function () { testing_internal_1.expect(core_1.Validators.required(new core_1.Control("not empty"))).toEqual(null); });
        });
        testing_internal_1.describe("minLength", function () {
            testing_internal_1.it("should not error on an empty string", function () { testing_internal_1.expect(core_1.Validators.minLength(2)(new core_1.Control(""))).toEqual(null); });
            testing_internal_1.it("should not error on null", function () { testing_internal_1.expect(core_1.Validators.minLength(2)(new core_1.Control(null))).toEqual(null); });
            testing_internal_1.it("should not error on valid strings", function () { testing_internal_1.expect(core_1.Validators.minLength(2)(new core_1.Control("aa"))).toEqual(null); });
            testing_internal_1.it("should error on short strings", function () {
                testing_internal_1.expect(core_1.Validators.minLength(2)(new core_1.Control("a")))
                    .toEqual({ "minlength": { "requiredLength": 2, "actualLength": 1 } });
            });
        });
        testing_internal_1.describe("maxLength", function () {
            testing_internal_1.it("should not error on an empty string", function () { testing_internal_1.expect(core_1.Validators.maxLength(2)(new core_1.Control(""))).toEqual(null); });
            testing_internal_1.it("should not error on null", function () { testing_internal_1.expect(core_1.Validators.maxLength(2)(new core_1.Control(null))).toEqual(null); });
            testing_internal_1.it("should not error on valid strings", function () { testing_internal_1.expect(core_1.Validators.maxLength(2)(new core_1.Control("aa"))).toEqual(null); });
            testing_internal_1.it("should error on short strings", function () {
                testing_internal_1.expect(core_1.Validators.maxLength(2)(new core_1.Control("aaa")))
                    .toEqual({ "maxlength": { "requiredLength": 2, "actualLength": 3 } });
            });
        });
        testing_internal_1.describe("compose", function () {
            testing_internal_1.it("should return null when given null", function () { testing_internal_1.expect(core_1.Validators.compose(null)).toBe(null); });
            testing_internal_1.it("should collect errors from all the validators", function () {
                var c = core_1.Validators.compose([validator("a", true), validator("b", true)]);
                testing_internal_1.expect(c(new core_1.Control(""))).toEqual({ "a": true, "b": true });
            });
            testing_internal_1.it("should run validators left to right", function () {
                var c = core_1.Validators.compose([validator("a", 1), validator("a", 2)]);
                testing_internal_1.expect(c(new core_1.Control(""))).toEqual({ "a": 2 });
            });
            testing_internal_1.it("should return null when no errors", function () {
                var c = core_1.Validators.compose([core_1.Validators.nullValidator, core_1.Validators.nullValidator]);
                testing_internal_1.expect(c(new core_1.Control(""))).toEqual(null);
            });
            testing_internal_1.it("should ignore nulls", function () {
                var c = core_1.Validators.compose([null, core_1.Validators.required]);
                testing_internal_1.expect(c(new core_1.Control(""))).toEqual({ "required": true });
            });
        });
        testing_internal_1.describe("composeAsync", function () {
            function asyncValidator(expected, response) {
                return function (c) {
                    var emitter = new async_1.EventEmitter();
                    var res = c.value != expected ? response : null;
                    promise_1.PromiseWrapper.scheduleMicrotask(function () {
                        async_1.ObservableWrapper.callNext(emitter, res);
                        // this is required because of a bug in ObservableWrapper
                        // where callComplete can fire before callNext
                        // remove this one the bug is fixed
                        async_1.TimerWrapper.setTimeout(function () { async_1.ObservableWrapper.callComplete(emitter); }, 0);
                    });
                    return emitter;
                };
            }
            testing_internal_1.it("should return null when given null", function () { testing_internal_1.expect(core_1.Validators.composeAsync(null)).toEqual(null); });
            testing_internal_1.it("should collect errors from all the validators", testing_internal_1.fakeAsync(function () {
                var c = core_1.Validators.composeAsync([
                    asyncValidator("expected", { "one": true }),
                    asyncValidator("expected", { "two": true })
                ]);
                var value = null;
                c(new core_1.Control("invalid")).then(function (v) { return value = v; });
                testing_internal_1.tick(1);
                testing_internal_1.expect(value).toEqual({ "one": true, "two": true });
            }));
            testing_internal_1.it("should return null when no errors", testing_internal_1.fakeAsync(function () {
                var c = core_1.Validators.composeAsync([asyncValidator("expected", { "one": true })]);
                var value = null;
                c(new core_1.Control("expected")).then(function (v) { return value = v; });
                testing_internal_1.tick(1);
                testing_internal_1.expect(value).toEqual(null);
            }));
            testing_internal_1.it("should ignore nulls", testing_internal_1.fakeAsync(function () {
                var c = core_1.Validators.composeAsync([asyncValidator("expected", { "one": true }), null]);
                var value = null;
                c(new core_1.Control("invalid")).then(function (v) { return value = v; });
                testing_internal_1.tick(1);
                testing_internal_1.expect(value).toEqual({ "one": true });
            }));
        });
    });
}
exports.main = main;
//# sourceMappingURL=validators_spec.js.map