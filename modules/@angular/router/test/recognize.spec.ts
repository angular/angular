import {DefaultUrlSerializer} from '../src/url_serializer';
import {UrlTree} from '../src/url_tree';
import {createEmptyState, Params, ActivatedRoute, PRIMARY_OUTLET} from '../src/router_state';
import {recognize} from '../src/recognize';

describe('recognize', () => {
  const empty = () => createEmptyState(RootComponent);
  const fakeComponentResolver = {
    resolveComponent(componentType:any):Promise<any> { return Promise.resolve({componentType}); },
    clearCache() {}
  };
  
  it('should work', (done) => {
    recognize(fakeComponentResolver, [
      {
        name:  'a',
        path: 'a', component: ComponentA
      }
    ], tree("a"), empty()).then(s => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
      done();
    });
  });

  it('should handle position args', (done) => {
    recognize(fakeComponentResolver, [
      {
        name:  'a',
        path: 'a/:id', component: ComponentA, children: [
          { name: 'b', path: 'b/:id', component: ComponentB}
        ]
      }
    ], tree("a/paramA/b/paramB"), empty()).then(s => {
      checkActivatedRoute(s.root, "", {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root), "a/paramA", {id: 'paramA'}, ComponentA);
      checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "b/paramB", {id: 'paramB'}, ComponentB);
      done();
    });
  });

  it('should reuse activated routes', (done) => {
    const config = [{name:  'a', path: 'a/:id', component: ComponentA}];
    recognize(fakeComponentResolver, config, tree("a/paramA"), empty()).then(s => {
      const n1 = s.firstChild(s.root);
      const recorded = [];
      n1!.params.forEach(r => recorded.push(r));

      recognize(fakeComponentResolver, config, tree("a/paramB"), s).then(s2 => {
        const n2 = s2.firstChild(s2.root);
        expect(n1).toBe(n2);
        expect(recorded).toEqual([{id: 'paramA'}, {id: 'paramB'}]);
        done();
      });
    });
  });

  it('should support secondary routes', (done) => {
    recognize(fakeComponentResolver, [
      { name:  'a', path: 'a', component: ComponentA },
      { name:  'b', path: 'b', component: ComponentB, outlet: 'left' },
      { name:  'c', path: 'c', component: ComponentC, outlet: 'right' }
    ], tree("a(b//c)"), empty()).then(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
      done();
    });
  });

  it('should handle nested secondary routes', (done) => {
    recognize(fakeComponentResolver, [
      { name:  'a', path: 'a', component: ComponentA },
      { name:  'b', path: 'b', component: ComponentB, outlet: 'left' },
      { name:  'c', path: 'c', component: ComponentC, outlet: 'right' }
    ], tree("a(b(c))"), empty()).then(s => {
      const c = s.children(s.root);
      checkActivatedRoute(c[0], "a", {}, ComponentA);
      checkActivatedRoute(c[1], "b", {}, ComponentB, 'left');
      checkActivatedRoute(c[2], "c", {}, ComponentC, 'right');
      done();
    });
  });

  it('should handle non top-level secondary routes', (done) => {
    recognize(fakeComponentResolver, [
      { name:  'a', path: 'a', component: ComponentA, children: [
        { name:  'b', path: 'b', component: ComponentB },
        { name:  'c', path: 'c', component: ComponentC, outlet: 'left' }
      ] },
    ], tree("a/b(c))"), empty()).then(s => {
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {}, ComponentB, PRIMARY_OUTLET);
      checkActivatedRoute(c[1], "c", {}, ComponentC, 'left');
      done();
    });
  });

  it('should support matrix parameters', (done) => {
    recognize(fakeComponentResolver, [
      {
        name:  'a',
        path: 'a', component: ComponentA, children: [
          { name: 'b', path: 'b', component: ComponentB },
          { name: 'c', path: 'c', component: ComponentC, outlet: 'left' }
        ]
      }
    ], tree("a;a1=11;a2=22/b;b1=111;b2=222(c;c1=1111;c2=2222)"), empty()).then(s => {
      checkActivatedRoute(s.firstChild(s.root), "a", {a1: '11', a2: '22'}, ComponentA);
      const c = s.children(<any>s.firstChild(s.root));
      checkActivatedRoute(c[0], "b", {b1: '111', b2: '222'}, ComponentB);
      checkActivatedRoute(c[1], "c", {c1: '1111', c2: '2222'}, ComponentC, 'left');
      done();
    });
  });
  
  describe("index", () => {
    it("should support index routes", (done) => {
      recognize(fakeComponentResolver, [
        {
          name:  'a', index: true, component: ComponentA
        }
      ], tree(""), empty()).then(s => {
        checkActivatedRoute(s.firstChild(s.root), "a", {}, ComponentA);
        done();
      });
    });

    it("should support index routes with children", (done) => {
      recognize(fakeComponentResolver, [
        {
          name:  'a', index: true, component: ComponentA, children: [
          { name: 'b', index: true, component: ComponentB, children: [
            {name:  'c', path: 'c/:id', component: ComponentC}
          ]
          }
        ]
        }
      ], tree("c/10"), empty()).then(s => {
        checkActivatedRoute(s.firstChild(s.root), "", {}, ComponentA);
        checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)), "", {}, ComponentB);
        checkActivatedRoute(
          s.firstChild(<any>s.firstChild(<any>s.firstChild(s.root))), "c/10", {id: '10'}, ComponentC);
        done();
      });
    });
  });
  
  describe("wildcards", () => {
    it("should support simple wildcards", (done) => {
      recognize(fakeComponentResolver, [
        {
          name:  'a', path: '**', component: ComponentA
        }
      ], tree("a/b/c/d;a1=11"), empty()).then(s => {
        checkActivatedRoute(s.firstChild(s.root), "a/b/c/d", {a1:'11'}, ComponentA);
        done();
      });
    });
  });

  describe("query parameters", () => {
    it("should support query params", (done) => {
      const config = [{name:  'a', path: 'a', component: ComponentA}];
      recognize(fakeComponentResolver, config, tree("a?q=11"), empty()).then(s => {
        const q1 = s.queryParams;
        const recorded = [];
        q1!.forEach(r => recorded.push(r));

        recognize(fakeComponentResolver, config, tree("a?q=22"), s).then(s2 => {
          const q2 = s2.queryParams;
          expect(q1).toBe(q2);
          expect(recorded).toEqual([{q: '11'}, {q: '22'}]);
          done();
        });
      });
    });
  });

  describe("fragment", () => {
    it("should support fragment", (done) => {
      const config = [{name:  'a', path: 'a', component: ComponentA}];
      recognize(fakeComponentResolver, config, tree("a#f1"), empty()).then(s => {
        const f1 = s.fragment;
        const recorded = [];
        f1!.forEach(r => recorded.push(r));

        recognize(fakeComponentResolver, config, tree("a#f2"), s).then(s2 => {
          const f2 = s2.fragment;
          expect(f1).toBe(f2);
          expect(recorded).toEqual(["f1", "f2"]);
          done();
        });
      });
    });
  });

  describe("error handling", () => {
    it('should error when two routes with the same outlet name got matched', (done) => {
      recognize(fakeComponentResolver, [
        { name:  'a', path: 'a', component: ComponentA },
        { name:  'b', path: 'b', component: ComponentB, outlet: 'aux' },
        { name:  'c', path: 'c', component: ComponentC, outlet: 'aux' }
      ], tree("a(b//c)"), empty()).catch(s => {
        expect(s.toString()).toContain("Two segments cannot have the same outlet name: 'b' and 'c'.");
        done();
      });
    });

    it("should error when no matching routes", (done) => {
      recognize(fakeComponentResolver, [
        { name:  'a', path: 'a', component: ComponentA }
      ], tree("invalid"), empty()).catch(s => {
        expect(s.toString()).toContain("Cannot match any routes");
        done();
      });
    });

    it("should error when no matching routes (too short)", (done) => {
      recognize(fakeComponentResolver, [
        { name:  'a', path: 'a/:id', component: ComponentA }
      ], tree("a"), empty()).catch(s => {
        expect(s.toString()).toContain("Cannot match any routes");
        done();
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
