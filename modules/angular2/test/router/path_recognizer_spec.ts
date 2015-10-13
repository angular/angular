import {
  AsyncTestCompleter,
  describe,
  it,
  iit,
  ddescribe,
  expect,
  inject,
  beforeEach,
  SpyObject
} from 'angular2/testing_internal';

import {PathRecognizer} from 'angular2/src/router/path_recognizer';
import {parser, Url, RootUrl} from 'angular2/src/router/url_parser';
import {SyncRouteHandler} from 'angular2/src/router/sync_route_handler';

class DummyClass {
  constructor() {}
}

var mockRouteHandler = new SyncRouteHandler(DummyClass);

export function main() {
  describe('PathRecognizer', () => {

    it('should throw when given an invalid path', () => {
      expect(() => new PathRecognizer('/hi#', mockRouteHandler))
          .toThrowError(`Path "/hi#" should not include "#". Use "HashLocationStrategy" instead.`);
      expect(() => new PathRecognizer('hi?', mockRouteHandler))
          .toThrowError(`Path "hi?" contains "?" which is not allowed in a route config.`);
      expect(() => new PathRecognizer('hi;', mockRouteHandler))
          .toThrowError(`Path "hi;" contains ";" which is not allowed in a route config.`);
      expect(() => new PathRecognizer('hi=', mockRouteHandler))
          .toThrowError(`Path "hi=" contains "=" which is not allowed in a route config.`);
      expect(() => new PathRecognizer('hi(', mockRouteHandler))
          .toThrowError(`Path "hi(" contains "(" which is not allowed in a route config.`);
      expect(() => new PathRecognizer('hi)', mockRouteHandler))
          .toThrowError(`Path "hi)" contains ")" which is not allowed in a route config.`);
      expect(() => new PathRecognizer('hi//there', mockRouteHandler))
          .toThrowError(`Path "hi//there" contains "//" which is not allowed in a route config.`);
    });

    it('should return the same instruction instance when recognizing the same path', () => {
      var rec = new PathRecognizer('/one', mockRouteHandler);

      var one = new Url('one', null, null, {});

      var firstMatch = rec.recognize(one);
      var secondMatch = rec.recognize(one);

      expect(firstMatch.instruction).toBe(secondMatch.instruction);
    });

    describe('querystring params', () => {
      it('should parse querystring params so long as the recognizer is a root', () => {
        var rec = new PathRecognizer('/hello/there', mockRouteHandler);
        var url = parser.parse('/hello/there?name=igor');
        var match = rec.recognize(url);
        expect(match.instruction.params).toEqual({'name': 'igor'});
      });

      it('should return a combined map of parameters with the param expected in the URL path',
         () => {
           var rec = new PathRecognizer('/hello/:name', mockRouteHandler);
           var url = parser.parse('/hello/paul?topic=success');
           var match = rec.recognize(url);
           expect(match.instruction.params).toEqual({'name': 'paul', 'topic': 'success'});
         });
    });

    describe('matrix params', () => {
      it('should be parsed along with dynamic paths', () => {
        var rec = new PathRecognizer('/hello/:id', mockRouteHandler);
        var url = new Url('hello', new Url('matias', null, null, {'key': 'value'}));
        var match = rec.recognize(url);
        expect(match.instruction.params).toEqual({'id': 'matias', 'key': 'value'});
      });

      it('should be parsed on a static path', () => {
        var rec = new PathRecognizer('/person', mockRouteHandler);
        var url = new Url('person', null, null, {'name': 'dave'});
        var match = rec.recognize(url);
        expect(match.instruction.params).toEqual({'name': 'dave'});
      });

      it('should be ignored on a wildcard segment', () => {
        var rec = new PathRecognizer('/wild/*everything', mockRouteHandler);
        var url = parser.parse('/wild/super;variable=value');
        var match = rec.recognize(url);
        expect(match.instruction.params).toEqual({'everything': 'super;variable=value'});
      });

      it('should set matrix param values to true when no value is present', () => {
        var rec = new PathRecognizer('/path', mockRouteHandler);
        var url = new Url('path', null, null, {'one': true, 'two': true, 'three': '3'});
        var match = rec.recognize(url);
        expect(match.instruction.params).toEqual({'one': true, 'two': true, 'three': '3'});
      });

      it('should be parsed on the final segment of the path', () => {
        var rec = new PathRecognizer('/one/two/three', mockRouteHandler);

        var three = new Url('three', null, null, {'c': '3'});
        var two = new Url('two', three, null, {'b': '2'});
        var one = new Url('one', two, null, {'a': '1'});

        var match = rec.recognize(one);
        expect(match.instruction.params).toEqual({'c': '3'});
      });
    });
  });
}
