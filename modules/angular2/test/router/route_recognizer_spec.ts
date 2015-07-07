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

import {RouteRecognizer, RouteMatch} from 'angular2/src/router/route_recognizer';

export function main() {
  describe('RouteRecognizer', () => {
    var recognizer;
    var handler = {'component': DummyCmpA};
    var handler2 = {'component': DummyCmpB};

    beforeEach(() => { recognizer = new RouteRecognizer(); });


    it('should recognize a static segment', () => {
      recognizer.addConfig('/test', handler);
      var solution = recognizer.recognize('/test')[0];
      expect(getComponentType(solution)).toEqual(handler['component']);
    });


    it('should recognize a single slash', () => {
      recognizer.addConfig('/', handler);
      var solution = recognizer.recognize('/')[0];
      expect(getComponentType(solution)).toEqual(handler['component']);
    });


    it('should recognize a dynamic segment', () => {
      recognizer.addConfig('/user/:name', handler);
      var solution = recognizer.recognize('/user/brian')[0];
      expect(getComponentType(solution)).toEqual(handler['component']);
      expect(solution.params()).toEqual({'name': 'brian'});
    });


    it('should recognize a star segment', () => {
      recognizer.addConfig('/first/*rest', handler);
      var solution = recognizer.recognize('/first/second/third')[0];
      expect(getComponentType(solution)).toEqual(handler['component']);
      expect(solution.params()).toEqual({'rest': 'second/third'});
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
      expect(getComponentType(solution)).toEqual(handler['component']);
      expect(solution.matchedUrl).toEqual('/b');
    });

    it('should not perform root URL redirect on a non-root route', () => {
      recognizer.addRedirect('/', '/foo');
      recognizer.addConfig('/bar', handler);
      var solutions = recognizer.recognize('/bar');
      expect(solutions.length).toBe(1);

      var solution = solutions[0];
      expect(getComponentType(solution)).toEqual(handler['component']);
      expect(solution.matchedUrl).toEqual('/bar');
    });

    it('should perform a root URL redirect when only a slash or an empty string is being processed',
       () => {
         recognizer.addRedirect('/', '/matias');
         recognizer.addConfig('/matias', handler);

         recognizer.addConfig('/fatias', handler);

         var solutions;

         solutions = recognizer.recognize('/');
         expect(solutions[0].matchedUrl).toBe('/matias');

         solutions = recognizer.recognize('/fatias');
         expect(solutions[0].matchedUrl).toBe('/fatias');

         solutions = recognizer.recognize('');
         expect(solutions[0].matchedUrl).toBe('/matias');
       });

    it('should generate URLs with params', () => {
      recognizer.addConfig('/app/user/:name', handler, 'user');
      expect(recognizer.generate('user', {'name': 'misko'})['url']).toEqual('app/user/misko');
    });

    it('should generate URLs with numeric params', () => {
      recognizer.addConfig('/app/page/:number', handler, 'page');
      expect(recognizer.generate('page', {'number': 42})['url']).toEqual('app/page/42');
    });

    it('should throw in the absence of required params URLs', () => {
      recognizer.addConfig('app/user/:name', handler, 'user');
      expect(() => recognizer.generate('user', {})['url'])
          .toThrowError('Route generator for \'name\' was not included in parameters passed.');
    });
  });
}

function getComponentType(routeMatch: RouteMatch): any {
  return routeMatch.recognizer.handler.componentType;
}

class DummyCmpA {}
class DummyCmpB {}
