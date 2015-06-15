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
} from 'angular2/test_lib';

import {RouteRecognizer} from 'angular2/src/router/route_recognizer';

export function main() {
  describe('RouteRecognizer', () => {
    var recognizer;
    var handler = {'components': {'a': 'b'}};
    var handler2 = {'components': {'b': 'c'}};

    beforeEach(() => { recognizer = new RouteRecognizer(); });


    it('should recognize a static segment', () => {
      recognizer.addConfig('/test', handler);
      expect(recognizer.recognize('/test')[0].handler).toEqual(handler);
    });


    it('should recognize a single slash', () => {
      recognizer.addConfig('/', handler);
      var solution = recognizer.recognize('/')[0];
      expect(solution.handler).toEqual(handler);
    });


    it('should recognize a dynamic segment', () => {
      recognizer.addConfig('/user/:name', handler);
      var solution = recognizer.recognize('/user/brian')[0];
      expect(solution.handler).toEqual(handler);
      expect(solution.params).toEqual({'name': 'brian'});
    });


    it('should recognize a star segment', () => {
      recognizer.addConfig('/first/*rest', handler);
      var solution = recognizer.recognize('/first/second/third')[0];
      expect(solution.handler).toEqual(handler);
      expect(solution.params).toEqual({'rest': 'second/third'});
    });


    it('should throw when given two routes that start with the same static segment', () => {
      recognizer.addConfig('/hello', handler);
      expect(() => recognizer.addConfig('/hello', handler2))
          .toThrowError('Configuration \'/hello\' conflicts with existing route \'/hello\'');
    });


    it('should throw when given two routes that have dynamic segments in the same order', () => {
      recognizer.addConfig('/hello/:person/how/:doyoudou', handler);
      expect(() => recognizer.addConfig('/hello/:friend/how/:areyou', handler2))
          .toThrowError(
              'Configuration \'/hello/:friend/how/:areyou\' conflicts with existing route \'/hello/:person/how/:doyoudou\'');
    });


    it('should recognize redirects', () => {
      recognizer.addRedirect('/a', '/b');
      recognizer.addConfig('/b', handler);
      var solutions = recognizer.recognize('/a');
      expect(solutions.length).toBe(1);

      var solution = solutions[0];
      expect(solution.handler).toEqual(handler);
      expect(solution.matchedUrl).toEqual('/b');
    });

    it('should not perform root URL redirect on a non-root route', () => {
      recognizer.addRedirect('/', '/foo');
      recognizer.addConfig('/bar', handler);
      var solutions = recognizer.recognize('/bar');
      expect(solutions.length).toBe(1);

      var solution = solutions[0];
      expect(solution.handler).toEqual(handler);
      expect(solution.matchedUrl).toEqual('/bar');
    });

    it('should perform a valid redirect when a slash or an empty string is being processed', () => {
      recognizer.addRedirect('/', '/matias');
      recognizer.addRedirect('', '/fatias');

      recognizer.addConfig('/matias', handler);
      recognizer.addConfig('/fatias', handler);

      var solutions;

      solutions = recognizer.recognize('/');
      expect(solutions[0].matchedUrl).toBe('/matias');

      solutions = recognizer.recognize('');
      expect(solutions[0].matchedUrl).toBe('/fatias');
    });

    it('should generate URLs', () => {
      recognizer.addConfig('/app/user/:name', handler, 'user');
      expect(recognizer.generate('user', {'name': 'misko'})).toEqual('/app/user/misko');
    });


    it('should throw in the absence of required params URLs', () => {
      recognizer.addConfig('/app/user/:name', handler, 'user');
      expect(() => recognizer.generate('user', {}))
          .toThrowError('Route generator for \'name\' was not included in parameters passed.');
    });
  });
}
