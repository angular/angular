import {
  AsyncTestCompleter,
  describe,
  it, iit,
  ddescribe, expect,
  inject, beforeEach,
  SpyObject} from 'angular2/test_lib';

import {RouteRecognizer} from 'angular2/src/router/route_recognizer';

export function main() {
  describe('RouteRecognizer', () => {
    var recognizer;
    var handler = {
      'components': { 'a': 'b' }
    };

    beforeEach(() => {
      recognizer = new RouteRecognizer();
    });

    it('should work with a static segment', () => {
      recognizer.addConfig('/test', handler);

      expect(recognizer.recognize('/test')[0]).toEqual({
        'handler': { 'components': { 'a': 'b' } },
        'params': {},
        'matchedUrl': '/test',
        'unmatchedUrl': ''
      });
    });

    it('should work with a dynamic segment', () => {
      recognizer.addConfig('/user/:name', handler);
      expect(recognizer.recognize('/user/brian')[0]).toEqual({
        'handler': handler,
        'params': { 'name': 'brian' },
        'matchedUrl': '/user/brian',
        'unmatchedUrl': ''
      });
    });

    it('should allow redirects', () => {
      recognizer.addRedirect('/a', '/b');
      recognizer.addConfig('/b', handler);
      var solutions = recognizer.recognize('/a');
      expect(solutions.length).toBe(1);
      expect(solutions[0]).toEqual({
        'handler': handler,
        'params': {},
        'matchedUrl': '/b',
        'unmatchedUrl': ''
      });
    });

    it('should generate URLs', () => {
      recognizer.addConfig('/app/user/:name', handler, 'user');
      expect(recognizer.generate('user', {'name' : 'misko'})).toEqual('/app/user/misko');
    });
  });
}
