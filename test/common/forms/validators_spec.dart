library angular2.test.common.forms.validators_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        fakeAsync,
        tick,
        el;
import "package:angular2/core.dart"
    show ControlGroup, Control, Validators, AbstractControl, ControlArray;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper, TimerWrapper;

main() {
  validator(String key, dynamic error) {
    return (AbstractControl c) {
      var r = {};
      r[key] = error;
      return r;
    };
  }
  describe("Validators", () {
    describe("required", () {
      it("should error on an empty string", () {
        expect(Validators.required(new Control("")))
            .toEqual({"required": true});
      });
      it("should error on null", () {
        expect(Validators.required(new Control(null)))
            .toEqual({"required": true});
      });
      it("should not error on a non-empty string", () {
        expect(Validators.required(new Control("not empty"))).toEqual(null);
      });
    });
    describe("minLength", () {
      it("should not error on an empty string", () {
        expect(Validators.minLength(2)(new Control(""))).toEqual(null);
      });
      it("should not error on null", () {
        expect(Validators.minLength(2)(new Control(null))).toEqual(null);
      });
      it("should not error on valid strings", () {
        expect(Validators.minLength(2)(new Control("aa"))).toEqual(null);
      });
      it("should error on short strings", () {
        expect(Validators.minLength(2)(new Control("a"))).toEqual({
          "minlength": {"requiredLength": 2, "actualLength": 1}
        });
      });
    });
    describe("maxLength", () {
      it("should not error on an empty string", () {
        expect(Validators.maxLength(2)(new Control(""))).toEqual(null);
      });
      it("should not error on null", () {
        expect(Validators.maxLength(2)(new Control(null))).toEqual(null);
      });
      it("should not error on valid strings", () {
        expect(Validators.maxLength(2)(new Control("aa"))).toEqual(null);
      });
      it("should error on short strings", () {
        expect(Validators.maxLength(2)(new Control("aaa"))).toEqual({
          "maxlength": {"requiredLength": 2, "actualLength": 3}
        });
      });
    });
    describe("compose", () {
      it("should return null when given null", () {
        expect(Validators.compose(null)).toBe(null);
      });
      it("should collect errors from all the validators", () {
        var c =
            Validators.compose([validator("a", true), validator("b", true)]);
        expect(c(new Control(""))).toEqual({"a": true, "b": true});
      });
      it("should run validators left to right", () {
        var c = Validators.compose([validator("a", 1), validator("a", 2)]);
        expect(c(new Control(""))).toEqual({"a": 2});
      });
      it("should return null when no errors", () {
        var c = Validators
            .compose([Validators.nullValidator, Validators.nullValidator]);
        expect(c(new Control(""))).toEqual(null);
      });
      it("should ignore nulls", () {
        var c = Validators.compose([null, Validators.required]);
        expect(c(new Control(""))).toEqual({"required": true});
      });
    });
    describe("composeAsync", () {
      asyncValidator(expected, response) {
        return (c) {
          var emitter = new EventEmitter();
          var res = c.value != expected ? response : null;
          PromiseWrapper.scheduleMicrotask(() {
            ObservableWrapper.callNext(emitter, res);
            // this is required because of a bug in ObservableWrapper

            // where callComplete can fire before callNext

            // remove this one the bug is fixed
            TimerWrapper.setTimeout(() {
              ObservableWrapper.callComplete(emitter);
            }, 0);
          });
          return emitter;
        };
      }
      it("should return null when given null", () {
        expect(Validators.composeAsync(null)).toEqual(null);
      });
      it("should collect errors from all the validators", fakeAsync(() {
        var c = Validators.composeAsync([
          asyncValidator("expected", {"one": true}),
          asyncValidator("expected", {"two": true})
        ]);
        var value = null;
        c(new Control("invalid")).then((v) => value = v);
        tick(1);
        expect(value).toEqual({"one": true, "two": true});
      }));
      it("should return null when no errors", fakeAsync(() {
        var c = Validators.composeAsync([
          asyncValidator("expected", {"one": true})
        ]);
        var value = null;
        c(new Control("expected")).then((v) => value = v);
        tick(1);
        expect(value).toEqual(null);
      }));
      it("should ignore nulls", fakeAsync(() {
        var c = Validators.composeAsync([
          asyncValidator("expected", {"one": true}),
          null
        ]);
        var value = null;
        c(new Control("invalid")).then((v) => value = v);
        tick(1);
        expect(value).toEqual({"one": true});
      }));
    });
  });
}
