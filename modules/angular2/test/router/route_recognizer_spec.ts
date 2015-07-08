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

import {Map, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

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

    describe('matrix params', () => {
      it('should recognize matrix parameters within the URL path', () => {
        var recognizer = new RouteRecognizer();
        recognizer.addConfig('profile/:name', handler, 'user');

        var solution = recognizer.recognize('/profile/matsko;comments=all')[0];
        var params = solution.params();
        expect(params['name']).toEqual('matsko');
        expect(params['comments']).toEqual('all');
      });

      it('should recognize multiple matrix params and set parameters that contain no value to true',
         () => {
           var recognizer = new RouteRecognizer();
           recognizer.addConfig('/profile/hello', handler, 'user');

           var solution =
               recognizer.recognize('/profile/hello;modal;showAll=true;hideAll=false')[0];
           var params = solution.params();

           expect(params['modal']).toEqual(true);
           expect(params['showAll']).toEqual('true');
           expect(params['hideAll']).toEqual('false');
         });

      it('should only consider the matrix parameters at the end of the path handler', () => {
        var recognizer = new RouteRecognizer();
        recognizer.addConfig('/profile/hi/:name', handler, 'user');

        var solution = recognizer.recognize('/profile;a=1/hi;b=2;c=3/william;d=4')[0];
        var params = solution.params();

        expect(params).toEqual({'name': 'william', 'd': '4'});
      });

      it('should generate and populate the given static-based route with matrix params', () => {
        var recognizer = new RouteRecognizer();
        recognizer.addConfig('forum/featured', handler, 'forum-page');

        var params = StringMapWrapper.create();
        params['start'] = 10;
        params['end'] = 100;

        var result = recognizer.generate('forum-page', params);
        expect(result['url']).toEqual('forum/featured;start=10;end=100');
      });

      it('should generate and populate the given dynamic-based route with matrix params', () => {
        var recognizer = new RouteRecognizer();
        recognizer.addConfig('forum/:topic', handler, 'forum-page');

        var params = StringMapWrapper.create();
        params['topic'] = 'crazy';
        params['total-posts'] = 100;
        params['moreDetail'] = null;

        var result = recognizer.generate('forum-page', params);
        expect(result['url']).toEqual('forum/crazy;total-posts=100;moreDetail');
      });

      it('should not apply any matrix params if a dynamic route segment takes up the slot when a path is generated',
         () => {
           var recognizer = new RouteRecognizer();
           recognizer.addConfig('hello/:name', handler, 'profile-page');

           var params = StringMapWrapper.create();
           params['name'] = 'matsko';

           var result = recognizer.generate('profile-page', params);
           expect(result['url']).toEqual('hello/matsko');
         });
    });
  });
}

function getComponentType(routeMatch: RouteMatch): any {
  return routeMatch.recognizer.handler.componentType;
}

class DummyCmpA {}
class DummyCmpB {}
