import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
  IS_DARTIUM,
  Log
} from 'angular2/test_lib';
import {BaseException} from 'angular2/src/facade/lang';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';

class _CustomException {
  context = "some context";
}

export function main() {
  describe('ExceptionHandler', () => {
    var log, handler;

    beforeEach(() => {
      log = new Log();
      handler = new ExceptionHandler();
      handler.logError = (e) => log.add(e);
    });

    it("should output exception", () => {
      try {
        handler.call(new BaseException("message!"));
      } catch (e) {
      }
      expect(log.result()).toContain("message!");
    });

    it("should output stackTrace", () => {
      try {
        handler.call(new BaseException("message!"), "stack!");
      } catch (e) {
      }
      expect(log.result()).toContain("stack!");
    });

    it("should join a long stackTrace", () => {
      try {
        handler.call(new BaseException("message!"), ["stack1", "stack2"]);
      } catch (e) {
      }
      expect(log.result()).toContain("stack1");
      expect(log.result()).toContain("stack2");
    });

    it("should output reason when present", () => {
      try {
        handler.call(new BaseException("message!"), null, "reason!");
      } catch (e) {
      }
      expect(log.result()).toContain("reason!");
    });

    it("should print context", () => {
      try {
        handler.call(new BaseException("message!", null, null, "context!"));
      } catch (e) {
      }
      expect(log.result()).toContain("context!");
    });

    it("should print nested context", () => {
      try {
        var original = new BaseException("message!", null, null, "context!");
        handler.call(new BaseException("message", original));
      } catch (e) {
      }
      expect(log.result()).toContain("context!");
    });

    it("should not print context when the passed-in exception is not a BaseException", () => {
      try {
        handler.call(new _CustomException());
      } catch (e) {
      }
      expect(log.result()).not.toContain("context");
    });
  });
}
