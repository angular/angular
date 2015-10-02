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

import {Map, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {RouteRecognizer} from 'angular2/src/router/route_recognizer';
import {ComponentInstruction} from 'angular2/src/router/instruction';

import {Route, Redirect} from 'angular2/src/router/route_config_decorator';
import {parser} from 'angular2/src/router/url_parser';

export function main() {
  describe('RouteRecognizer', () => {
    var recognizer;

    beforeEach(() => { recognizer = new RouteRecognizer(); });


    it('should recognize a static segment', () => {
      recognizer.config(new Route({path: '/test', component: DummyCmpA}));
      var solution = recognize(recognizer, '/test');
      expect(getComponentType(solution)).toEqual(DummyCmpA);
    });


    it('should recognize a single slash', () => {
      recognizer.config(new Route({path: '/', component: DummyCmpA}));
      var solution = recognize(recognizer, '/');
      expect(getComponentType(solution)).toEqual(DummyCmpA);
    });


    it('should recognize a dynamic segment', () => {
      recognizer.config(new Route({path: '/user/:name', component: DummyCmpA}));
      var solution = recognize(recognizer, '/user/brian');
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.params).toEqual({'name': 'brian'});
    });


    it('should recognize a star segment', () => {
      recognizer.config(new Route({path: '/first/*rest', component: DummyCmpA}));
      var solution = recognize(recognizer, '/first/second/third');
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.params).toEqual({'rest': 'second/third'});
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
      recognizer.config(new Route({path: '/b', component: DummyCmpA}));
      recognizer.config(new Redirect({path: '/a', redirectTo: 'b'}));
      var solution = recognize(recognizer, '/a');
      expect(getComponentType(solution)).toEqual(DummyCmpA);
      expect(solution.urlPath).toEqual('b');
    });


    it('should not perform root URL redirect on a non-root route', () => {
      recognizer.config(new Redirect({path: '/', redirectTo: '/foo'}));
      recognizer.config(new Route({path: '/bar', component: DummyCmpA}));
      var solution = recognize(recognizer, '/bar');
      expect(solution.componentType).toEqual(DummyCmpA);
      expect(solution.urlPath).toEqual('bar');
    });


    it('should perform a root URL redirect only for root routes', () => {
      recognizer.config(new Redirect({path: '/', redirectTo: '/matias'}));
      recognizer.config(new Route({path: '/matias', component: DummyCmpA}));
      recognizer.config(new Route({path: '/fatias', component: DummyCmpA}));

      var solution;

      solution = recognize(recognizer, '/');
      expect(solution.urlPath).toEqual('matias');

      solution = recognize(recognizer, '/fatias');
      expect(solution.urlPath).toEqual('fatias');

      solution = recognize(recognizer, '');
      expect(solution.urlPath).toEqual('matias');
    });


    it('should generate URLs with params', () => {
      recognizer.config(new Route({path: '/app/user/:name', component: DummyCmpA, as: 'User'}));
      var instruction = recognizer.generate('User', {'name': 'misko'});
      expect(instruction.urlPath).toEqual('app/user/misko');
    });


    it('should generate URLs with numeric params', () => {
      recognizer.config(new Route({path: '/app/page/:number', component: DummyCmpA, as: 'Page'}));
      expect(recognizer.generate('Page', {'number': 42}).urlPath).toEqual('app/page/42');
    });


    it('should throw in the absence of required params URLs', () => {
      recognizer.config(new Route({path: 'app/user/:name', component: DummyCmpA, as: 'User'}));
      expect(() => recognizer.generate('User', {}))
          .toThrowError('Route generator for \'name\' was not included in parameters passed.');
    });


    it('should throw if the route alias is not CamelCase', () => {
      expect(() => recognizer.config(
                 new Route({path: 'app/user/:name', component: DummyCmpA, as: 'user'})))
          .toThrowError(
              `Route 'app/user/:name' with alias 'user' does not begin with an uppercase letter. Route aliases should be CamelCase like 'User'.`);
    });


    describe('params', () => {
      it('should recognize parameters within the URL path', () => {
        recognizer.config(new Route({path: 'profile/:name', component: DummyCmpA, as: 'User'}));
        var solution = recognize(recognizer, '/profile/matsko?comments=all');
        expect(solution.params).toEqual({'name': 'matsko', 'comments': 'all'});
      });


      it('should generate and populate the given static-based route with querystring params',
         () => {
           recognizer.config(
               new Route({path: 'forum/featured', component: DummyCmpA, as: 'ForumPage'}));

           var params = {'start': 10, 'end': 100};

           var result = recognizer.generate('ForumPage', params);
           expect(result.urlPath).toEqual('forum/featured');
           expect(result.urlParams).toEqual(['start=10', 'end=100']);
         });


      it('should prefer positional params over query params', () => {
        recognizer.config(new Route({path: 'profile/:name', component: DummyCmpA, as: 'User'}));

        var solution = recognize(recognizer, '/profile/yegor?name=igor');
        expect(solution.params).toEqual({'name': 'yegor'});
      });


      it('should ignore matrix params for the top-level component', () => {
        recognizer.config(new Route({path: '/home/:subject', component: DummyCmpA, as: 'User'}));
        var solution = recognize(recognizer, '/home;sort=asc/zero;one=1?two=2');
        expect(solution.params).toEqual({'subject': 'zero', 'two': '2'});
      });
    });
  });
}

function recognize(recognizer: RouteRecognizer, url: string): ComponentInstruction {
  return recognizer.recognize(parser.parse(url))[0].instruction;
}

function getComponentType(routeMatch: ComponentInstruction): any {
  return routeMatch.componentType;
}

class DummyCmpA {}
class DummyCmpB {}
