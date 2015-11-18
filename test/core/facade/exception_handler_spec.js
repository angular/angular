var testing_internal_1 = require('angular2/testing_internal');
var exceptions_1 = require('angular2/src/facade/exceptions');
var _CustomException = (function () {
    function _CustomException() {
        this.context = "some context";
    }
    _CustomException.prototype.toString = function () { return "custom"; };
    return _CustomException;
})();
function main() {
    testing_internal_1.describe('ExceptionHandler', function () {
        testing_internal_1.it("should output exception", function () {
            var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.BaseException("message!"));
            testing_internal_1.expect(e).toContain("message!");
        });
        testing_internal_1.it("should output stackTrace", function () {
            var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.BaseException("message!"), "stack!");
            testing_internal_1.expect(e).toContain("stack!");
        });
        testing_internal_1.it("should join a long stackTrace", function () {
            var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.BaseException("message!"), ["stack1", "stack2"]);
            testing_internal_1.expect(e).toContain("stack1");
            testing_internal_1.expect(e).toContain("stack2");
        });
        testing_internal_1.it("should output reason when present", function () {
            var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.BaseException("message!"), null, "reason!");
            testing_internal_1.expect(e).toContain("reason!");
        });
        testing_internal_1.describe("context", function () {
            testing_internal_1.it("should print context", function () {
                var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.WrappedException("message!", null, null, "context!"));
                testing_internal_1.expect(e).toContain("context!");
            });
            testing_internal_1.it("should print nested context", function () {
                var original = new exceptions_1.WrappedException("message!", null, null, "context!");
                var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.WrappedException("message", original));
                testing_internal_1.expect(e).toContain("context!");
            });
            testing_internal_1.it("should not print context when the passed-in exception is not a BaseException", function () {
                var e = exceptions_1.ExceptionHandler.exceptionToString(new _CustomException());
                testing_internal_1.expect(e).not.toContain("context");
            });
        });
        testing_internal_1.describe('original exception', function () {
            testing_internal_1.it("should print original exception message if available (original is BaseException)", function () {
                var realOriginal = new exceptions_1.BaseException("inner");
                var original = new exceptions_1.WrappedException("wrapped", realOriginal);
                var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.WrappedException("wrappedwrapped", original));
                testing_internal_1.expect(e).toContain("inner");
            });
            testing_internal_1.it("should print original exception message if available (original is not BaseException)", function () {
                var realOriginal = new _CustomException();
                var original = new exceptions_1.WrappedException("wrapped", realOriginal);
                var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.WrappedException("wrappedwrapped", original));
                testing_internal_1.expect(e).toContain("custom");
            });
        });
        testing_internal_1.describe('original stack', function () {
            testing_internal_1.it("should print original stack if available", function () {
                var realOriginal = new exceptions_1.BaseException("inner");
                var original = new exceptions_1.WrappedException("wrapped", realOriginal, "originalStack");
                var e = exceptions_1.ExceptionHandler.exceptionToString(new exceptions_1.WrappedException("wrappedwrapped", original, "wrappedStack"));
                testing_internal_1.expect(e).toContain("originalStack");
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=exception_handler_spec.js.map