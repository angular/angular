import {DefaultUrlSerializer} from '../src/url_serializer';
import {UrlTree} from '../src/url_tree';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {ActivatedRouteCandidate} from '../src/router_state';
import {recognize} from '../src/recognize';

describe('recognize', () => {
  it('should work', (done) => {
    recognize(RootComponent, [
      {
        path: 'a', component: ComponentA
      }
    ], tree("a")).forEach(s => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
      done();
    });
  });

  it('should handle position args', () => {
    recognize(RootComponent, [
      {
        path: 'a/:id', component: ComponentA, children: [
          { path: 'b/:id', component: ComponentB}
        ]
      }
    ], tree("a/paramA/b/paramB")).forEach(s => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a/paramA", {id: 'paramA'}, ComponentA);
      checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "b/paramB", {id: 'paramB'}, ComponentB);
    });
  });

  it('should support secondary routes', () => {
    recognize(RootComponent, [
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], tree("a(left:b//right:c)")).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
    });
  });

  it('should use outlet name when matching secondary routes', () => {
    recognize(RootComponent, [
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'b', component: ComponentC, outlet: 'right' }
    ], tree("a(right:b)")).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentC, 'right');
    });
  });

  it('should handle nested secondary routes', () => {
    recognize(RootComponent, [
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], tree("a(left:b(right:c))")).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
    });
  });

  it('should handle non top-level secondary routes', () => {
    recognize(RootComponent, [
      { path: 'a', component: ComponentA, children: [
        { path: 'b', component: ComponentB },
        { path: 'c', component: ComponentC, outlet: 'left' }
      ] },
    ], tree("a/b(left:c))")).forEach(s => {
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {}, ComponentB, PRIMARY_OUTLET);
      checkActivatedRoute(c[1], "c", {}, ComponentC, 'left');
    });
  });

  it('should sort routes by outlet name', () => {
    recognize(RootComponent, [
      { path: 'a', component: ComponentA },
      { path: 'c', component: ComponentC, outlet: 'c' },
      { path: 'b', component: ComponentB, outlet: 'b' }
    ], tree("a(c:c//b:b)")).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'b');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'c');
    });
  });

  it('should support matrix parameters', () => {
    recognize(RootComponent, [
      {
        path: 'a', component: ComponentA, children: [
          { path: 'b', component: ComponentB },
          { path: 'c', component: ComponentC, outlet: 'left' }
        ]
      }
    ], tree("a;a1=11;a2=22/b;b1=111;b2=222(left:c;c1=1111;c2=2222)")).forEach(s => {
      checkActivatedRoute(s.firstChild(s.root), "a", {a1: '11', a2: '22'}, ComponentA);
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {b1: '111', b2: '222'}, ComponentB);
      checkActivatedRoute(c[1], "c", {c1: '1111', c2: '2222'}, ComponentC, 'left');
    });
  });
  
  describe("index", () => {
    it("should support index routes", () => {
      recognize(RootComponent, [
        {index: true, component: ComponentA}
      ], tree("")).forEach(s => {
        checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
      });
    });

    it("should support index routes with children", () => {
      recognize(RootComponent, [
        {
          index: true, component: ComponentA, children: [
          { index: true, component: ComponentB, children: [
            {path: 'c/:id', component: ComponentC}
          ]
          }
        ]
        }
      ], tree("c/10")).forEach(s => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
        checkActivatedRoute(
          s.firstChild(<any>s.firstChild(<any>s.firstChild(s.root))), "c/10", {id: '10'}, ComponentC);
      });
    });
  });
  
  describe("wildcards", () => {
    it("should support simple wildcards", () => {
      recognize(RootComponent, [
        {path: '**', component: ComponentA}
      ], tree("a/b/c/d;a1=11")).forEach(s => {
        checkActivatedRoute(s.firstChild(s.root), "a/b/c/d", {a1:'11'}, ComponentA);
      });
    });
  });

  describe("query parameters", () => {
    it("should support query params", () => {
      const config = [{path: 'a', component: ComponentA}];
      recognize(RootComponent, config, tree("a?q=11")).forEach(s => {
        expect(s.queryParams).toEqual({q: '11'});
      });
    });
  });

  describe("fragment", () => {
    it("should support fragment", () => {
      const config = [{path: 'a', component: ComponentA}];
      recognize(RootComponent, config, tree("a#f1")).forEach(s => {
        expect(s.fragment).toEqual("f1");
      });
    });
  });

  describe("error handling", () => {
    it('should error when two routes with the same outlet name got matched', () => {
      recognize(RootComponent, [
        { path: 'a', component: ComponentA },
        { path: 'b', component: ComponentB, outlet: 'aux' },
        { path: 'c', component: ComponentC, outlet: 'aux' }
      ], tree("a(aux:b//aux:c)")).subscribe(null, s => {
        expect(s.toString()).toContain("Two segments cannot have the same outlet name: 'aux:b' and 'aux:c'.");
      });
    });

    it("should error when no matching routes", () => {
      recognize(RootComponent, [
        { path: 'a', component: ComponentA }
      ], tree("invalid")).subscribe(null, s => {
        expect(s.toString()).toContain("Cannot match any routes");
      });
    });

    it("should error when no matching routes (too short)", () => {
      recognize(RootComponent, [
        { path: 'a/:id', component: ComponentA }
      ], tree("a")).subscribe(null, s => {
        expect(s.toString()).toContain("Cannot match any routes");
      });
    });
  });
});

function checkActivatedRoute(actual: ActivatedRouteCandidate | null, url: string, params: Params, cmp: Function, outlet: string = PRIMARY_OUTLET):void {
  if (actual === null) {
    expect(actual).toBeDefined();
  } else {
    expect(actual.urlSegments.map(s => s.path).join("/")).toEqual(url);
    expect(actual.params).toEqual(params);
    expect(actual.component).toBe(cmp);
    expect(actual.outlet).toEqual(outlet);
  }
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

class RootComponent {}
class ComponentA {}
class ComponentB {}
class ComponentC {}
