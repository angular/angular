import {DefaultUrlSerializer} from '../src/url_serializer';
import {UrlTree} from '../src/url_tree';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {createEmptyState, ActivatedRoute} from '../src/router_state';
import {recognize} from '../src/recognize';

describe('recognize', () => {
  const empty = () => createEmptyState(RootComponent);
  
  it('should work', (done) => {
    recognize([
      {
        path: 'a', component: ComponentA
      }
    ], tree("a"), empty()).forEach(s => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
      done();
    });
  });

  it('should handle position args', () => {
    recognize([
      {
        path: 'a/:id', component: ComponentA, children: [
          { path: 'b/:id', component: ComponentB}
        ]
      }
    ], tree("a/paramA/b/paramB"), empty()).forEach(s => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a/paramA", {id: 'paramA'}, ComponentA);
      checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "b/paramB", {id: 'paramB'}, ComponentB);
    });
  });

  it('should reuse activated routes', () => {
    const config = [{path: 'a/:id', component: ComponentA}];
    recognize(config, tree("a/paramA"), empty()).forEach(s => {
      const n1 = s.firstChild(s.root);
      const recorded = [];
      n1!.params.forEach(r => recorded.push(r));

      recognize(config, tree("a/paramB"), s).forEach(s2 => {
        const n2 = s2.firstChild(s2.root);
        expect(n1).toBe(n2);
        expect(recorded).toEqual([{id: 'paramA'}, {id: 'paramB'}]);
      });
    });
  });

  it('should support secondary routes', () => {
    recognize([
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], tree("a(left:b//right:c)"), empty()).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
    });
  });

  it('should use outlet name when matching secondary routes', () => {
    recognize([
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'b', component: ComponentC, outlet: 'right' }
    ], tree("a(right:b)"), empty()).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentC, 'right');
    });
  });

  it('should handle nested secondary routes', () => {
    recognize([
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], tree("a(left:b(right:c))"), empty()).forEach(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
    });
  });

  it('should handle non top-level secondary routes', () => {
    recognize([
      { path: 'a', component: ComponentA, children: [
        { path: 'b', component: ComponentB },
        { path: 'c', component: ComponentC, outlet: 'left' }
      ] },
    ], tree("a/b(left:c))"), empty()).forEach(s => {
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {}, ComponentB, PRIMARY_OUTLET);
      checkActivatedRoute(c[1], "c", {}, ComponentC, 'left');
    });
  });

  it('should support matrix parameters', () => {
    recognize([
      {
        path: 'a', component: ComponentA, children: [
          { path: 'b', component: ComponentB },
          { path: 'c', component: ComponentC, outlet: 'left' }
        ]
      }
    ], tree("a;a1=11;a2=22/b;b1=111;b2=222(left:c;c1=1111;c2=2222)"), empty()).forEach(s => {
      checkActivatedRoute(s.firstChild(s.root), "a", {a1: '11', a2: '22'}, ComponentA);
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {b1: '111', b2: '222'}, ComponentB);
      checkActivatedRoute(c[1], "c", {c1: '1111', c2: '2222'}, ComponentC, 'left');
    });
  });
  
  describe("index", () => {
    it("should support index routes", () => {
      recognize([
        {index: true, component: ComponentA}
      ], tree(""), empty()).forEach(s => {
        checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
      });
    });

    it("should support index routes with children", () => {
      recognize([
        {
          index: true, component: ComponentA, children: [
          { index: true, component: ComponentB, children: [
            {path: 'c/:id', component: ComponentC}
          ]
          }
        ]
        }
      ], tree("c/10"), empty()).forEach(s => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
        checkActivatedRoute(
          s.firstChild(<any>s.firstChild(<any>s.firstChild(s.root))), "c/10", {id: '10'}, ComponentC);
      });
    });
  });
  
  describe("wildcards", () => {
    it("should support simple wildcards", () => {
      recognize([
        {path: '**', component: ComponentA}
      ], tree("a/b/c/d;a1=11"), empty()).forEach(s => {
        checkActivatedRoute(s.firstChild(s.root), "a/b/c/d", {a1:'11'}, ComponentA);
      });
    });
  });

  describe("query parameters", () => {
    it("should support query params", () => {
      const config = [{path: 'a', component: ComponentA}];
      recognize(config, tree("a?q=11"), empty()).forEach(s => {
        const q1 = s.queryParams;
        const recorded = [];
        q1!.forEach(r => recorded.push(r));

        recognize(config, tree("a?q=22"), s).forEach(s2 => {
          const q2 = s2.queryParams;
          expect(q1).toBe(q2);
          expect(recorded).toEqual([{q: '11'}, {q: '22'}]);
        });
      });
    });
  });

  describe("fragment", () => {
    it("should support fragment", () => {
      const config = [{path: 'a', component: ComponentA}];
      recognize(config, tree("a#f1"), empty()).forEach(s => {
        const f1 = s.fragment;
        const recorded = [];
        f1!.forEach(r => recorded.push(r));

        recognize(config, tree("a#f2"), s).forEach(s2 => {
          const f2 = s2.fragment;
          expect(f1).toBe(f2);
          expect(recorded).toEqual(["f1", "f2"]);
        });
      });
    });
  });

  describe("error handling", () => {
    it('should error when two routes with the same outlet name got matched', () => {
      recognize([
        { path: 'a', component: ComponentA },
        { path: 'b', component: ComponentB, outlet: 'aux' },
        { path: 'c', component: ComponentC, outlet: 'aux' }
      ], tree("a(aux:b//aux:c)"), empty()).subscribe(null, s => {
        expect(s.toString()).toContain("Two segments cannot have the same outlet name: 'aux:b' and 'aux:c'.");
      });
    });

    it("should error when no matching routes", () => {
      recognize([
        { path: 'a', component: ComponentA }
      ], tree("invalid"), empty()).subscribe(null, s => {
        expect(s.toString()).toContain("Cannot match any routes");
      });
    });

    it("should error when no matching routes (too short)", () => {
      recognize([
        { path: 'a/:id', component: ComponentA }
      ], tree("a"), empty()).subscribe(null, s => {
        expect(s.toString()).toContain("Cannot match any routes");
      });
    });
  });
});

function checkActivatedRoute(actual: ActivatedRoute | null, url: string, params: Params, cmp: Function, outlet: string = PRIMARY_OUTLET):void {
  if (actual === null) {
    expect(actual).toBeDefined();
  } else {
    let actualUrl;
    actual.urlSegments.forEach(segments => actualUrl = segments.map(s => s.path).join("/"));
    expect(actualUrl).toEqual(url);

    let actualParams;
    actual.params.forEach(s => actualParams = s);
    expect(actualParams).toEqual(params);
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
