import {DefaultUrlSerializer} from '../src/url_serializer';
import {UrlTree} from '../src/url_tree';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '../src/router_state';
import {RouterConfig} from '../src/config';
import {recognize} from '../src/recognize';

describe('recognize', () => {
  it('should work', () => {
    checkRecognize([
      {
        path: 'a', component: ComponentA
      }
    ], "a", (s:RouterStateSnapshot) => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
    });
  });

  it('should support secondary routes', () => {
    checkRecognize([
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], "a(left:b//right:c)", (s:RouterStateSnapshot) => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
    });
  });

  it('should set url segment and index properly', () => {
    const url = tree("a(left:b//right:c)");
    recognize(RootComponent, [
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], url, "a(left:b//right:c)").subscribe((s) => {
      expect(s.root._urlSegment).toBe(url.root);
      expect(s.root._lastPathIndex).toBe(-1);

      const c = s.children(s.root);
      expect(c[0]._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
      expect(c[0]._lastPathIndex).toBe(0);

      expect(c[1]._urlSegment).toBe(url.root.children["left"]);
      expect(c[1]._lastPathIndex).toBe(0);

      expect(c[2]._urlSegment).toBe(url.root.children["right"]);
      expect(c[2]._lastPathIndex).toBe(0);
    });
  });

  it('should set url segment and index properly (nested case)', () => {
    const url = tree("a/b/c");
    recognize(RootComponent, [
      { path: '/a/b', component: ComponentA, children: [
        {path: 'c', component: ComponentC}
      ] },
    ], url, "a/b/c").subscribe((s:RouterStateSnapshot) => {
      expect(s.root._urlSegment).toBe(url.root);
      expect(s.root._lastPathIndex).toBe(-1);

      const compA = s.firstChild(s.root);
      expect(compA._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
      expect(compA._lastPathIndex).toBe(1);

      const compC = s.firstChild(<any>compA);
      expect(compC._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
      expect(compC._lastPathIndex).toBe(2);
    });
  });

  it('should match routes in the depth first order', () => {
    checkRecognize([
      {path: 'a', component: ComponentA, children: [{path: ':id', component: ComponentB}]},
      {path: 'a/:id', component: ComponentC}
    ], "a/paramA", (s:RouterStateSnapshot) => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
      checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "paramA", {id: 'paramA'}, ComponentB);
    });

    checkRecognize([
      {path: 'a', component: ComponentA},
      {path: 'a/:id', component: ComponentC}
    ], "a/paramA", (s:RouterStateSnapshot) => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a/paramA", {id: 'paramA'}, ComponentC);
    });
  });

  it('should use outlet name when matching secondary routes', () => {
    checkRecognize([
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'b', component: ComponentC, outlet: 'right' }
    ], "a(right:b)", (s:RouterStateSnapshot) => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentC, 'right');
    });
  });

  xit('should handle nested secondary routes', () => {
    checkRecognize([
      { path: 'a', component: ComponentA },
      { path: 'b', component: ComponentB, outlet: 'left' },
      { path: 'c', component: ComponentC, outlet: 'right' }
    ], "a(left:b(right:c))", (s:RouterStateSnapshot) => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
    });
  });

  it('should handle non top-level secondary routes', () => {
    checkRecognize([
      { path: 'a', component: ComponentA, children: [
        { path: 'b', component: ComponentB },
        { path: 'c', component: ComponentC, outlet: 'left' }
      ] },
    ], "a/(b//left:c)", (s:RouterStateSnapshot) => {
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {}, ComponentB, PRIMARY_OUTLET);
      checkActivatedRoute(c[1], "c", {}, ComponentC, 'left');
    });
  });

  it('should sort routes by outlet name', () => {
    checkRecognize([
      { path: 'a', component: ComponentA },
      { path: 'c', component: ComponentC, outlet: 'c' },
      { path: 'b', component: ComponentB, outlet: 'b' }
    ], "a(c:c//b:b)", (s:RouterStateSnapshot) => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'b');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'c');
    });
  });

  it('should support matrix parameters', () => {
    checkRecognize([
      {
        path: 'a', component: ComponentA, children: [
          { path: 'b', component: ComponentB }
        ]
      },
      { path: 'c', component: ComponentC, outlet: 'left' }
    ], "a;a1=11;a2=22/b;b1=111;b2=222(left:c;c1=1111;c2=2222)", (s:RouterStateSnapshot) => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {a1: '11', a2: '22'}, ComponentA);
      checkActivatedRoute(s.firstChild(<any>c[0]), "b", {b1: '111', b2: '222'}, ComponentB);
      checkActivatedRoute(c[1], "c", {c1: '1111', c2: '2222'}, ComponentC, 'left');
    });
  });

  describe("index", () => {
    it("should support root index routes", () => {
      checkRecognize([
        {index: true, component: ComponentA}
      ], "", (s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
      });
    });

    it("should support nested root index routes", () => {
      checkRecognize([
        {index: true, component: ComponentA, children: [{index: true, component: ComponentB}]}
      ], "", (s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
      });
    });

    it("should support index routes", () => {
      checkRecognize([
        {path: 'a', component: ComponentA, children: [
          {index: true, component: ComponentB}
        ]}
      ], "a", (s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
      });
    });

    it("should support index routes with children", () => {
      checkRecognize([
        {
          index: true, component: ComponentA, children: [
          { index: true, component: ComponentB, children: [
            {path: 'c/:id', component: ComponentC}
          ]
          }
        ]
        }
      ], "c/10", (s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
        checkActivatedRoute(
          s.firstChild(<any>s.firstChild(<any>s.firstChild(s.root))), "c/10", {id: '10'}, ComponentC);
      });
    });

    xit("should pass parameters to every nested index route (case with non-index route)", () => {
      checkRecognize([
        {path: 'a', component: ComponentA, children: [{index: true, component: ComponentB}]}
      ], "/a;a=1", (s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "a", {a: '1'}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {a: '1'}, ComponentB);
      });
    });
  });

  describe("matching empty url", () => {
    it("should support root index routes", () => {
      recognize(RootComponent, [
        {path: '', component: ComponentA}
      ], tree(""), "").forEach((s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
      });
    });

    it("should support nested root index routes", () => {
      recognize(RootComponent, [
        {path: '', component: ComponentA, children: [{path: '', component: ComponentB}]}
      ], tree(""), "").forEach((s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
      });
    });

    it('should set url segment and index properly', () => {
      const url = tree("");
      recognize(RootComponent, [
        {path: '', component: ComponentA, children: [{path: '', component: ComponentB}]}
      ], url, "").forEach((s:RouterStateSnapshot) => {
        expect(s.root._urlSegment).toBe(url.root);
        expect(s.root._lastPathIndex).toBe(-1);

        const c = s.firstChild(s.root);
        expect(c._urlSegment).toBe(url.root);
        expect(c._lastPathIndex).toBe(-1);

        const c2 = s.firstChild(<any>s.firstChild(s.root));
        expect(c2._urlSegment).toBe(url.root);
        expect(c2._lastPathIndex).toBe(-1);
      });
    });

    it("should support index routes", () => {
      recognize(RootComponent, [
        {path: 'a', component: ComponentA, children: [
          {path: '', component: ComponentB}
        ]}
      ], tree("a"), "a").forEach((s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
      });
    });

    it("should support index routes with children", () => {
      recognize(RootComponent, [
        {
          path: '', component: ComponentA, children: [
          { path: '', component: ComponentB, children: [
            {path: 'c/:id', component: ComponentC}
          ]
          }
        ]
        }
      ], tree("c/10"), "c/10").forEach((s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
        checkActivatedRoute(
          s.firstChild(<any>s.firstChild(<any>s.firstChild(s.root))), "c/10", {id: '10'}, ComponentC);
      });
    });

    xit("should pass parameters to every nested index route (case with non-index route)", () => {
      recognize(RootComponent, [
        {path: 'a', component: ComponentA, children: [{path: '', component: ComponentB}]}
      ], tree("/a;a=1"), "/a;a=1").forEach((s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "a", {a: '1'}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {a: '1'}, ComponentB);
      });
    });
  });

  describe("wildcards", () => {
    it("should support simple wildcards", () => {
      checkRecognize([
        {path: '**', component: ComponentA}
      ], "a/b/c/d;a1=11", (s:RouterStateSnapshot) => {
        checkActivatedRoute(s.firstChild(s.root), "a/b/c/d", {a1:'11'}, ComponentA);
      });
    });
  });

  describe("query parameters", () => {
    it("should support query params", () => {
      const config = [{path: 'a', component: ComponentA}];
      checkRecognize(config, "a?q=11", (s:RouterStateSnapshot) => {
        expect(s.queryParams).toEqual({q: '11'});
      });
    });
  });

  describe("fragment", () => {
    it("should support fragment", () => {
      const config = [{path: 'a', component: ComponentA}];
      checkRecognize(config, "a#f1", (s:RouterStateSnapshot) => {
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
      ], tree("a(aux:b//aux:c)"), "a(aux:b//aux:c)").subscribe((_) => {}, (s:RouterStateSnapshot) => {
        expect(s.toString()).toContain("Two segments cannot have the same outlet name: 'aux:b' and 'aux:c'.");
      });
    });

    it("should error when no matching routes", () => {
      recognize(RootComponent, [
        { path: 'a', component: ComponentA }
      ], tree("invalid"), "invalid").subscribe((_) => {}, (s:RouterStateSnapshot) => {
        expect(s.toString()).toContain("Cannot match any routes");
      });
    });

    it("should error when no matching routes (too short)", () => {
      recognize(RootComponent, [
        { path: 'a/:id', component: ComponentA }
      ], tree("a"), "a").subscribe((_) => {}, (s:RouterStateSnapshot) => {
        expect(s.toString()).toContain("Cannot match any routes");
      });
    });
  });
});

function checkRecognize(config: RouterConfig, url: string, callback: any): void {
  recognize(RootComponent, config, tree(url), url).subscribe(callback, e => {
    throw e;
  });
}

function checkActivatedRoute(actual: ActivatedRouteSnapshot, url: string, params: Params, cmp: Function, outlet: string = PRIMARY_OUTLET):void {
  if (actual === null) {
    expect(actual).not.toBeNull();
  } else {
    expect(actual.url.map(s => s.path).join("/")).toEqual(url);
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
