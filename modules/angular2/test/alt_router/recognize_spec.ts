import {
  ComponentFixture,
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit
} from 'angular2/testing_internal';

import {recognize} from 'angular2/src/alt_router/recognize';
import {Routes, Route} from 'angular2/alt_router';
import {provide, Component, ComponentResolver} from 'angular2/core';
import {UrlSegment, Tree} from 'angular2/src/alt_router/segments';
import {DefaultRouterUrlSerializer} from 'angular2/src/alt_router/router_url_serializer';
import {DEFAULT_OUTLET_NAME} from 'angular2/src/alt_router/constants';

export function main() {
  describe('recognize', () => {
    it('should handle position args',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("b/paramB/c/paramC/d"))
             .then(r => {
               let a = r.root;
               expect(stringifyUrl(a.urlSegments)).toEqual([""]);
               expect(a.type).toBe(ComponentA);

               let b = r.firstChild(r.root);
               expect(stringifyUrl(b.urlSegments)).toEqual(["b", "paramB"]);
               expect(b.type).toBe(ComponentB);

               let c = r.firstChild(r.firstChild(r.root));
               expect(stringifyUrl(c.urlSegments)).toEqual(["c", "paramC"]);
               expect(c.type).toBe(ComponentC);

               let d = r.firstChild(r.firstChild(r.firstChild(r.root)));
               expect(stringifyUrl(d.urlSegments)).toEqual(["d"]);
               expect(d.type).toBe(ComponentD);

               async.done();
             });
       }));

    it('should support empty routes',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("f"))
             .then(r => {
               let a = r.root;
               expect(stringifyUrl(a.urlSegments)).toEqual([""]);
               expect(a.type).toBe(ComponentA);

               let f = r.firstChild(r.root);
               expect(stringifyUrl(f.urlSegments)).toEqual(["f"]);
               expect(f.type).toBe(ComponentF);

               let d = r.firstChild(r.firstChild(r.root));
               expect(stringifyUrl(d.urlSegments)).toEqual([]);
               expect(d.type).toBe(ComponentD);

               async.done();
             });
       }));

    it('should handle aux routes',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("b/paramB(/d//right:d)"))
             .then(r => {
               let c = r.children(r.root);
               expect(stringifyUrl(c[0].urlSegments)).toEqual(["b", "paramB"]);
               expect(c[0].outlet).toEqual(DEFAULT_OUTLET_NAME);
               expect(c[0].type).toBe(ComponentB);

               expect(stringifyUrl(c[1].urlSegments)).toEqual(["d"]);
               expect(c[1].outlet).toEqual("aux");
               expect(c[1].type).toBe(ComponentD);

               expect(stringifyUrl(c[2].urlSegments)).toEqual(["d"]);
               expect(c[2].outlet).toEqual("right");
               expect(c[2].type).toBe(ComponentD);

               async.done();
             });
       }));

    it("should error when two segments with the same outlet name",
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("b/paramB(right:d//right:e)"))
             .catch(e => {
               expect(e.message).toEqual(
                   "Two segments cannot have the same outlet name: 'right:d' and 'right:e'.");
               async.done();
             });
       }));

    it('should handle nested aux routes',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("b/paramB(/d(right:e))"))
             .then(r => {
               let c = r.children(r.root);
               expect(stringifyUrl(c[0].urlSegments)).toEqual(["b", "paramB"]);
               expect(c[0].outlet).toEqual(DEFAULT_OUTLET_NAME);
               expect(c[0].type).toBe(ComponentB);

               expect(stringifyUrl(c[1].urlSegments)).toEqual(["d"]);
               expect(c[1].outlet).toEqual("aux");
               expect(c[1].type).toBe(ComponentD);

               expect(stringifyUrl(c[2].urlSegments)).toEqual(["e"]);
               expect(c[2].outlet).toEqual("right");
               expect(c[2].type).toBe(ComponentE);

               async.done();
             });
       }));

    it('should handle non top-level aux routes',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree('b/paramB/d(e)'))
             .then(r => {
               let c = r.children(r.firstChild(r.root));
               expect(stringifyUrl(c[0].urlSegments)).toEqual(["d"]);
               expect(c[0].outlet).toEqual(DEFAULT_OUTLET_NAME);
               expect(c[0].type).toBe(ComponentD);

               expect(stringifyUrl(c[1].urlSegments)).toEqual(["e"]);
               expect(c[1].outlet).toEqual("aux");
               expect(c[1].type).toBe(ComponentE);

               async.done();
             });
       }));

    it('should handle matrix parameters',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("b/paramB;b1=1;b2=2(/d;d1=1;d2=2)"))
             .then(r => {
               let c = r.children(r.root);
               expect(c[0].parameters).toEqual({'b': 'paramB', 'b1': '1', 'b2': '2'});
               expect(c[1].parameters).toEqual({'d1': '1', 'd2': '2'});

               async.done();
             });
       }));

    it('should error when no matching routes',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("invalid"))
             .catch(e => {
               expect(e.message).toContain("Cannot match any routes");
               async.done();
             });
       }));

    it('should handle no matching routes (too short)',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("b"))
             .catch(e => {
               expect(e.message).toContain("Cannot match any routes");
               async.done();
             });
       }));

    it("should error when a component doesn't have @Routes",
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree("d/invalid"))
             .catch(e => {
               expect(e.message)
                   .toEqual("Component 'ComponentD' does not have route configuration");
               async.done();
             });
       }));
  });
}

function tree(url: string): Tree<UrlSegment> {
  return new DefaultRouterUrlSerializer().parse(url);
}

function stringifyUrl(segments: UrlSegment[]): string[] {
  return segments.map(s => s.segment);
}

@Component({selector: 'd', template: 't'})
class ComponentD {
}

@Component({selector: 'e', template: 't'})
class ComponentE {
}

@Component({selector: 'f', template: 't'})
@Routes([new Route({path: "/", component: ComponentD})])
class ComponentF {
}

@Component({selector: 'c', template: 't'})
@Routes([new Route({path: "d", component: ComponentD})])
class ComponentC {
}

@Component({selector: 'b', template: 't'})
@Routes([
  new Route({path: "d", component: ComponentD}),
  new Route({path: "e", component: ComponentE}),
  new Route({path: "c/:c", component: ComponentC})
])
class ComponentB {
}

@Component({selector: 'a', template: 't'})
@Routes([
  new Route({path: "b/:b", component: ComponentB}),
  new Route({path: "d", component: ComponentD}),
  new Route({path: "e", component: ComponentE}),
  new Route({path: "f", component: ComponentF})
])
class ComponentA {
}