library angular2.test.router.path_recognizer_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        describe,
        it,
        iit,
        ddescribe,
        expect,
        inject,
        beforeEach,
        SpyObject;
import "package:angular2/src/router/path_recognizer.dart" show PathRecognizer;
import "package:angular2/src/router/url_parser.dart" show parser, Url, RootUrl;

main() {
  describe("PathRecognizer", () {
    it("should throw when given an invalid path", () {
      expect(() => new PathRecognizer("/hi#")).toThrowError(
          '''Path "/hi#" should not include "#". Use "HashLocationStrategy" instead.''');
      expect(() => new PathRecognizer("hi?")).toThrowError(
          '''Path "hi?" contains "?" which is not allowed in a route config.''');
      expect(() => new PathRecognizer("hi;")).toThrowError(
          '''Path "hi;" contains ";" which is not allowed in a route config.''');
      expect(() => new PathRecognizer("hi=")).toThrowError(
          '''Path "hi=" contains "=" which is not allowed in a route config.''');
      expect(() => new PathRecognizer("hi(")).toThrowError(
          '''Path "hi(" contains "(" which is not allowed in a route config.''');
      expect(() => new PathRecognizer("hi)")).toThrowError(
          '''Path "hi)" contains ")" which is not allowed in a route config.''');
      expect(() => new PathRecognizer("hi//there")).toThrowError(
          '''Path "hi//there" contains "//" which is not allowed in a route config.''');
    });
    describe("querystring params", () {
      it("should parse querystring params so long as the recognizer is a root",
          () {
        var rec = new PathRecognizer("/hello/there");
        var url = parser.parse("/hello/there?name=igor");
        var match = rec.recognize(url);
        expect(match["allParams"]).toEqual({"name": "igor"});
      });
      it("should return a combined map of parameters with the param expected in the URL path",
          () {
        var rec = new PathRecognizer("/hello/:name");
        var url = parser.parse("/hello/paul?topic=success");
        var match = rec.recognize(url);
        expect(match["allParams"])
            .toEqual({"name": "paul", "topic": "success"});
      });
    });
    describe("matrix params", () {
      it("should be parsed along with dynamic paths", () {
        var rec = new PathRecognizer("/hello/:id");
        var url =
            new Url("hello", new Url("matias", null, null, {"key": "value"}));
        var match = rec.recognize(url);
        expect(match["allParams"]).toEqual({"id": "matias", "key": "value"});
      });
      it("should be parsed on a static path", () {
        var rec = new PathRecognizer("/person");
        var url = new Url("person", null, null, {"name": "dave"});
        var match = rec.recognize(url);
        expect(match["allParams"]).toEqual({"name": "dave"});
      });
      it("should be ignored on a wildcard segment", () {
        var rec = new PathRecognizer("/wild/*everything");
        var url = parser.parse("/wild/super;variable=value");
        var match = rec.recognize(url);
        expect(match["allParams"])
            .toEqual({"everything": "super;variable=value"});
      });
      it("should set matrix param values to true when no value is present", () {
        var rec = new PathRecognizer("/path");
        var url = new Url(
            "path", null, null, {"one": true, "two": true, "three": "3"});
        var match = rec.recognize(url);
        expect(match["allParams"])
            .toEqual({"one": true, "two": true, "three": "3"});
      });
      it("should be parsed on the final segment of the path", () {
        var rec = new PathRecognizer("/one/two/three");
        var three = new Url("three", null, null, {"c": "3"});
        var two = new Url("two", three, null, {"b": "2"});
        var one = new Url("one", two, null, {"a": "1"});
        var match = rec.recognize(one);
        expect(match["allParams"]).toEqual({"c": "3"});
      });
    });
  });
}
