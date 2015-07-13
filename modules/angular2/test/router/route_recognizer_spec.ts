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

import {Route, Redirect} from 'angular2/src/router/route_config_decorator';

export function main() {
  describe('RouteRecognizer', () => {
    var recognizer;

    beforeEach(() => { recognizer = new RouteRecognizer(); });


    it('should recognize a static segment', () => {
      recognizer.config(new Route({path: '/test', component: DummyCmpA}));
      var solution = recognizer.recognize('/test')[0];
      expect(getComponentType(solution)).toEqual(DummyCmpA);
    });


    it('should recognize a single slash', () => {
      recognizer.config(new Route({path: '/', component: DummyCmpA}));
      var solution = recognizer.recognize('/')[0];
      expect(getComponentType(solution)).toEqual(DummyCmpA);
    });


    it('should recognize a dynamic segment', () => {
      recognizer.config(new Route({path: '/user/:name', component: DummyCmpA}));
      var solution = recognizer.recognize('/user/brian')[0];
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.params()).toEqual({'name': 'brian'});
    });


    it('should recognize a star segment', () => {
      recognizer.config(new Route({path: '/first/*rest', component: DummyCmpA}));
      var solution = recognizer.recognize('/first/second/third')[0];
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.params()).toEqual({'rest': 'second/third'});
    });


    it('should throw when given two routes that start with the same static segment', () => {
      recognizer.config(new Route({path: '/hello', component: DummyCmpA}));
      expect(() => recognizer.config(new Route({path: '/hello', component: DummyCmpB})))
          .toThrowError('Configuration \'/hello\' conflicts with existing route \'/hello\'');
    });


    it('should throw when given two routes that have dynamic segments in the same order', () => {
      recognizer.config(new Route({path: '/hello/:person/how/:doyoudou', component: DummyCmpA}));
      expect(() => recognizer.config(
                 new Route({path: '/hello/:friend/how/:areyou', component: DummyCmpA})))
          .toThrowError(
              'Configuration \'/hello/:friend/how/:areyou\' conflicts with existing route \'/hello/:person/how/:doyoudou\'');
    });


    it('should recognize redirects', () => {
      recognizer.config(new Redirect({path: '/a', redirectTo: '/b'}));
      recognizer.config(new Route({path: '/b', component: DummyCmpA}));
      var solutions = recognizer.recognize('/a');
      expect(solutions.length).toBe(1);

      var solution = solutions[0];
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.matchedUrl).toEqual('/b');
    });

    it('should not perform root URL redirect on a non-root route', () => {
      recognizer.config(new Redirect({path: '/', redirectTo: '/foo'}));
      recognizer.config(new Route({path: '/bar', component: DummyCmpA}));
      var solutions = recognizer.recognize('/bar');
      expect(solutions.length).toBe(1);

      var solution = solutions[0];
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.matchedUrl).toEqual('/bar');
    });

    it('should perform a root URL redirect when only a slash or an empty string is being processed',
       () => {
         recognizer.config(new Redirect({path: '/', redirectTo: '/matias'}));
         recognizer.config(new Route({path: '/matias', component: DummyCmpA}));
         recognizer.config(new Route({path: '/fatias', component: DummyCmpA}));

         var solutions;

         solutions = recognizer.recognize('/');
         expect(solutions[0].matchedUrl).toBe('/matias');

         solutions = recognizer.recognize('/fatias');
         expect(solutions[0].matchedUrl).toBe('/fatias');

         solutions = recognizer.recognize('');
         expect(solutions[0].matchedUrl).toBe('/matias');
       });

    it('should generate URLs with params', () => {
      recognizer.config(new Route({path: '/app/user/:name', component: DummyCmpA, as: 'user'}));
      expect(recognizer.generate('user', {'name': 'misko'})['url']).toEqual('app/user/misko');
    });

    it('should generate URLs with numeric params', () => {
      recognizer.config(new Route({path: '/app/page/:number', component: DummyCmpA, as: 'page'}));
      expect(recognizer.generate('page', {'number': 42})['url']).toEqual('app/page/42');
    });

    it('should throw in the absence of required params URLs', () => {
      recognizer.config(new Route({path: 'app/user/:name', component: DummyCmpA, as: 'user'}));
      expect(() => recognizer.generate('user', {})['url'])
          .toThrowError('Route generator for \'name\' was not included in parameters passed.');
    });

    describe('matrix params', () => {
      it('should recognize matrix parameters within the URL path', () => {
        var recognizer = new RouteRecognizer();
        recognizer.config(new Route({path: 'profile/:name', component: DummyCmpA, as: 'user'}));

        var solution = recognizer.recognize('/profile/matsko;comments=all')[0];
        var params = solution.params();
        expect(params['name']).toEqual('matsko');
        expect(params['comments']).toEqual('all');
      });

      it('should recognize multiple matrix params and set parameters that contain no value to true',
         () => {
           var recognizer = new RouteRecognizer();
           recognizer.config(new Route({path: '/profile/hello', component: DummyCmpA, as: 'user'}));

           var solution =
               recognizer.recognize('/profile/hello;modal;showAll=true;hideAll=false')[0];
           var params = solution.params();

           expect(params['modal']).toEqual(true);
           expect(params['showAll']).toEqual('true');
           expect(params['hideAll']).toEqual('false');
         });

      it('should only consider the matrix parameters at the end of the path handler', () => {
        var recognizer = new RouteRecognizer();
        recognizer.config(new Route({path: '/profile/hi/:name', component: DummyCmpA, as: 'user'}));

        var solution = recognizer.recognize('/profile;a=1/hi;b=2;c=3/william;d=4')[0];
        var params = solution.params();

        expect(params).toEqual({'name': 'william', 'd': '4'});
      });

      it('should generate and populate the given static-based route with matrix params', () => {
        var recognizer = new RouteRecognizer();
        recognizer.config(
            new Route({path: 'forum/featured', component: DummyCmpA, as: 'forum-page'}));

        var params = StringMapWrapper.create();
        params['start'] = 10;
        params['end'] = 100;

        var result = recognizer.generate('forum-page', params);
        expect(result['url']).toEqual('forum/featured;start=10;end=100');
      });

      it('should generate and populate the given dynamic-based route with matrix params', () => {
        var recognizer = new RouteRecognizer();
        recognizer.config(
            new Route({path: 'forum/:topic', component: DummyCmpA, as: 'forum-page'}));

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
           recognizer.config(
               new Route({path: 'hello/:name', component: DummyCmpA, as: 'profile-page'}));

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
