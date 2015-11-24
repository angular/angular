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

import {Map, StringMapWrapper} from 'angular2/src/facade/collection';

import {RouteMatch, PathMatch, RedirectMatch} from 'angular2/src/router/route_recognizer';
import {ComponentRecognizer} from 'angular2/src/router/component_recognizer';

import {Route, Redirect} from 'angular2/src/router/route_config_decorator';
import {parser} from 'angular2/src/router/url_parser';
import {Promise, PromiseWrapper} from 'angular2/src/facade/promise';


export function main() {
  describe('ComponentRecognizer', () => {
    var recognizer: ComponentRecognizer;

    beforeEach(() => { recognizer = new ComponentRecognizer(); });


    it('should recognize a static segment', inject([AsyncTestCompleter], (async) => {
         recognizer.config(new Route({path: '/test', component: DummyCmpA}));
         recognize(recognizer, '/test')
             .then((solutions: RouteMatch[]) => {
               expect(solutions.length).toBe(1);
               expect(getComponentType(solutions[0])).toEqual(DummyCmpA);
               async.done();
             });
       }));


    it('should recognize a single slash', inject([AsyncTestCompleter], (async) => {
         recognizer.config(new Route({path: '/', component: DummyCmpA}));
         recognize(recognizer, '/')
             .then((solutions: RouteMatch[]) => {
               expect(solutions.length).toBe(1);
               expect(getComponentType(solutions[0])).toEqual(DummyCmpA);
               async.done();
             });
       }));


    it('should recognize a dynamic segment', inject([AsyncTestCompleter], (async) => {
         recognizer.config(new Route({path: '/user/:name', component: DummyCmpA}));
         recognize(recognizer, '/user/brian')
             .then((solutions: RouteMatch[]) => {
               expect(solutions.length).toBe(1);
               expect(getComponentType(solutions[0])).toEqual(DummyCmpA);
               expect(getParams(solutions[0])).toEqual({'name': 'brian'});
               async.done();
             });
       }));


    it('should recognize a star segment', inject([AsyncTestCompleter], (async) => {
         recognizer.config(new Route({path: '/first/*rest', component: DummyCmpA}));
         recognize(recognizer, '/first/second/third')
             .then((solutions: RouteMatch[]) => {
               expect(solutions.length).toBe(1);
               expect(getComponentType(solutions[0])).toEqual(DummyCmpA);
               expect(getParams(solutions[0])).toEqual({'rest': 'second/third'});
               async.done();
             });
       }));


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

      expect(() => recognizer.config(
                 new Redirect({path: '/hello/:pal/how/:goesit', redirectTo: ['/Foo']})))
          .toThrowError(
              'Configuration \'/hello/:pal/how/:goesit\' conflicts with existing route \'/hello/:person/how/:doyoudou\'');
    });


    it('should recognize redirects', inject([AsyncTestCompleter], (async) => {
         recognizer.config(new Route({path: '/b', component: DummyCmpA}));
         recognizer.config(new Redirect({path: '/a', redirectTo: ['B']}));
         recognize(recognizer, '/a')
             .then((solutions: RouteMatch[]) => {
               expect(solutions.length).toBe(1);
               var solution = solutions[0];
               expect(solution).toBeAnInstanceOf(RedirectMatch);
               if (solution instanceof RedirectMatch) {
                 expect(solution.redirectTo).toEqual(['B']);
               }
               async.done();
             });
       }));


    it('should generate URLs with params', () => {
      recognizer.config(new Route({path: '/app/user/:name', component: DummyCmpA, name: 'User'}));
      var instruction = recognizer.generate('User', {'name': 'misko'});
      expect(instruction.urlPath).toEqual('app/user/misko');
    });


    it('should generate URLs with numeric params', () => {
      recognizer.config(new Route({path: '/app/page/:number', component: DummyCmpA, name: 'Page'}));
      expect(recognizer.generate('Page', {'number': 42}).urlPath).toEqual('app/page/42');
    });


    it('should throw in the absence of required params URLs', () => {
      recognizer.config(new Route({path: 'app/user/:name', component: DummyCmpA, name: 'User'}));
      expect(() => recognizer.generate('User', {}))
          .toThrowError('Route generator for \'name\' was not included in parameters passed.');
    });


    it('should throw if the route alias is not TitleCase', () => {
      expect(() => recognizer.config(
                 new Route({path: 'app/user/:name', component: DummyCmpA, name: 'user'})))
          .toThrowError(
              `Route "app/user/:name" with name "user" does not begin with an uppercase letter. Route names should be CamelCase like "User".`);
    });


    describe('params', () => {
      it('should recognize parameters within the URL path',
         inject([AsyncTestCompleter], (async) => {
           recognizer.config(
               new Route({path: 'profile/:name', component: DummyCmpA, name: 'User'}));
           recognize(recognizer, '/profile/matsko?comments=all')
               .then((solutions: RouteMatch[]) => {
                 expect(solutions.length).toBe(1);
                 expect(getParams(solutions[0])).toEqual({'name': 'matsko', 'comments': 'all'});
                 async.done();
               });
         }));


      it('should generate and populate the given static-based route with querystring params',
         () => {
           recognizer.config(
               new Route({path: 'forum/featured', component: DummyCmpA, name: 'ForumPage'}));

           var params = {'start': 10, 'end': 100};

           var result = recognizer.generate('ForumPage', params);
           expect(result.urlPath).toEqual('forum/featured');
           expect(result.urlParams).toEqual(['start=10', 'end=100']);
         });


      it('should prefer positional params over query params',
         inject([AsyncTestCompleter], (async) => {
           recognizer.config(
               new Route({path: 'profile/:name', component: DummyCmpA, name: 'User'}));
           recognize(recognizer, '/profile/yegor?name=igor')
               .then((solutions: RouteMatch[]) => {
                 expect(solutions.length).toBe(1);
                 expect(getParams(solutions[0])).toEqual({'name': 'yegor'});
                 async.done();
               });
         }));


      it('should ignore matrix params for the top-level component',
         inject([AsyncTestCompleter], (async) => {
           recognizer.config(
               new Route({path: '/home/:subject', component: DummyCmpA, name: 'User'}));
           recognize(recognizer, '/home;sort=asc/zero;one=1?two=2')
               .then((solutions: RouteMatch[]) => {
                 expect(solutions.length).toBe(1);
                 expect(getParams(solutions[0])).toEqual({'subject': 'zero', 'two': '2'});
                 async.done();
               });
         }));
    });
  });
}

function recognize(recognizer: ComponentRecognizer, url: string): Promise<RouteMatch[]> {
  var parsedUrl = parser.parse(url);
  return PromiseWrapper.all(recognizer.recognize(parsedUrl));
}

function getComponentType(routeMatch: RouteMatch): any {
  if (routeMatch instanceof PathMatch) {
    return routeMatch.instruction.componentType;
  }
  return null;
}

function getParams(routeMatch: RouteMatch): any {
  if (routeMatch instanceof PathMatch) {
    return routeMatch.instruction.params;
  }
  return null;
}

class DummyCmpA {}
class DummyCmpB {}
