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

export function main() {
  describe('recognize', () => {
    it('should handle position args',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree(["b", "paramB", "c", "paramC"]))
             .then(r => {
               let b = r.root;
               expect(stringifyUrl(b.urlSegments)).toEqual(["b", "paramB"]);
               expect(b.type).toBe(ComponentB);

               let c = r.firstChild(r.root);
               expect(stringifyUrl(c.urlSegments)).toEqual(["c", "paramC"]);
               expect(c.type).toBe(ComponentC);

               async.done();
             });
       }));

    it('should error when no matching routes',
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree(["invalid"]))
             .catch(e => {
               expect(e.message).toEqual("Cannot match any routes");
               async.done();
             });
       }));

    it("should error when a component doesn't have @Routes",
       inject([AsyncTestCompleter, ComponentResolver], (async, resolver) => {
         recognize(resolver, ComponentA, tree(["d", "invalid"]))
             .catch(e => {
               expect(e.message)
                   .toEqual("Component 'ComponentD' does not have route configuration");
               async.done();
             });
       }));
  });
}

function tree(nodes: string[]) {
  return new Tree<UrlSegment>(nodes.map(v => new UrlSegment(v, {}, "")));
}

function stringifyUrl(segments: UrlSegment[]): string[] {
  return segments.map(s => s.segment);
}

@Component({selector: 'c', template: 't'})
class ComponentC {
}

@Component({selector: 'd', template: 't'})
class ComponentD {
}

@Component({selector: 'b', template: 't'})
@Routes([new Route({path: "c/:c", component: ComponentC})])
class ComponentB {
}

@Component({selector: 'a', template: 't'})
@Routes([
  new Route({path: "b/:b", component: ComponentB}),
  new Route({path: "d", component: ComponentD})
])
class ComponentA {
}