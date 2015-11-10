library angular2.test.compiler.xhr_mock_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it;
import "package:angular2/src/compiler/xhr_mock.dart" show MockXHR;
import "package:angular2/src/facade/async.dart" show PromiseWrapper, Future;
import "package:angular2/src/facade/lang.dart" show isPresent;

main() {
  describe("MockXHR", () {
    MockXHR xhr;
    beforeEach(() {
      xhr = new MockXHR();
    });
    expectResponse(Future<String> request, String url, String response,
        [done = null]) {
      String onResponse(String text) {
        if (identical(response, null)) {
          throw '''Unexpected response ${ url} -> ${ text}''';
        } else {
          expect(text).toEqual(response);
          if (isPresent(done)) done();
        }
        return text;
      }
      String onError(String error) {
        if (!identical(response, null)) {
          throw '''Unexpected error ${ url}''';
        } else {
          expect(error).toEqual('''Failed to load ${ url}''');
          if (isPresent(done)) done();
        }
        return error;
      }
      PromiseWrapper.then(request, onResponse, onError);
    }
    it(
        "should return a response from the definitions",
        inject([AsyncTestCompleter], (async) {
          var url = "/foo";
          var response = "bar";
          xhr.when(url, response);
          expectResponse(xhr.get(url), url, response, () => async.done());
          xhr.flush();
        }));
    it(
        "should return an error from the definitions",
        inject([AsyncTestCompleter], (async) {
          var url = "/foo";
          var response = null;
          xhr.when(url, response);
          expectResponse(xhr.get(url), url, response, () => async.done());
          xhr.flush();
        }));
    it(
        "should return a response from the expectations",
        inject([AsyncTestCompleter], (async) {
          var url = "/foo";
          var response = "bar";
          xhr.expect(url, response);
          expectResponse(xhr.get(url), url, response, () => async.done());
          xhr.flush();
        }));
    it(
        "should return an error from the expectations",
        inject([AsyncTestCompleter], (async) {
          var url = "/foo";
          var response = null;
          xhr.expect(url, response);
          expectResponse(xhr.get(url), url, response, () => async.done());
          xhr.flush();
        }));
    it("should not reuse expectations", () {
      var url = "/foo";
      var response = "bar";
      xhr.expect(url, response);
      xhr.get(url);
      xhr.get(url);
      expect(() {
        xhr.flush();
      }).toThrowError("Unexpected request /foo");
    });
    it(
        "should return expectations before definitions",
        inject([AsyncTestCompleter], (async) {
          var url = "/foo";
          xhr.when(url, "when");
          xhr.expect(url, "expect");
          expectResponse(xhr.get(url), url, "expect");
          expectResponse(xhr.get(url), url, "when", () => async.done());
          xhr.flush();
        }));
    it("should throw when there is no definitions or expectations", () {
      xhr.get("/foo");
      expect(() {
        xhr.flush();
      }).toThrowError("Unexpected request /foo");
    });
    it("should throw when flush is called without any pending requests", () {
      expect(() {
        xhr.flush();
      }).toThrowError("No pending requests to flush");
    });
    it("should throw on unstatisfied expectations", () {
      xhr.expect("/foo", "bar");
      xhr.when("/bar", "foo");
      xhr.get("/bar");
      expect(() {
        xhr.flush();
      }).toThrowError("Unsatisfied requests: /foo");
    });
  });
}
