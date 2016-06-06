import {DefaultUrlSerializer} from '../src/url_serializer';
import {UrlTree, UrlSegment} from '../src/url_tree';
import {ActivatedRoute, ActivatedRouteSnapshot, advanceActivatedRoute} from '../src/router_state';
import {PRIMARY_OUTLET, Params} from '../src/shared';
import {createUrlTree} from '../src/create_url_tree';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

describe('createUrlTree', () => {
  const serializer = new DefaultUrlSerializer();

  it("should navigate to the root", () => {
    const p = serializer.parse("/");
    const t = create(p.root, p, ["/"]);
    expect(serializer.serialize(t)).toEqual("");
  });

  it("should support nested segments", () => {
    const p = serializer.parse("/a/b");
    const t = create(p.root, p, ["/one", 11, "two", 22]);
    expect(serializer.serialize(t)).toEqual("/one/11/two/22");
  });

  it("should preserve secondary segments", () => {
    const p = serializer.parse("/a/11/b(right:c)");
    const t = create(p.root, p, ["/a", 11, 'd']);
    expect(serializer.serialize(t)).toEqual("/a/11/d(right:c)");
  });

  it('should update matrix parameters', () => {
    const p = serializer.parse("/a;aa=11");
    const t = create(p.root, p, ["/a", {aa: 22, bb: 33}]);
    expect(serializer.serialize(t)).toEqual("/a;aa=22;bb=33");
  });

  it('should create matrix parameters', () => {
    const p = serializer.parse("/a");
    const t = create(p.root, p, ["/a", {aa: 22, bb: 33}]);
    expect(serializer.serialize(t)).toEqual("/a;aa=22;bb=33");
  });

  it('should create matrix parameters together with other segments', () => {
    const p = serializer.parse("/a");
    const t = create(p.root, p, ["/a", "/b", {aa: 22, bb: 33}]);
    expect(serializer.serialize(t)).toEqual("/a/b;aa=22;bb=33");
  });

  describe("node reuse", () => {
    it('should reuse nodes when path is the same', () => {
      const p = serializer.parse("/a/b");
      const t = create(p.root, p, ['/a/c']);

      expect(t.root).toBe(p.root);
      expect(t.firstChild(t.root)).toBe(p.firstChild(p.root));
      expect(t.firstChild(<any>t.firstChild(t.root))).not.toBe(p.firstChild(<any>p.firstChild(p.root)));
    });

    it("should create new node when params are the same", () => {
      const p = serializer.parse("/a;x=1");
      const t = create(p.root, p, ['/a', {'x': 1}]);

      expect(t.firstChild(t.root)).toBe(p.firstChild(p.root));
    });

    it("should create new node when params are different", () => {
      const p = serializer.parse("/a;x=1");
      const t = create(p.root, p, ['/a', {'x': 2}]);

      expect(t.firstChild(t.root)).not.toBe(p.firstChild(p.root));
    });
  });

  describe("relative navigation", () => {
    it("should work", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      const t = create(c, p, ["c2"]);
      expect(serializer.serialize(t)).toEqual("/a(left:ap)/c2(left:cp)");
    });

    it("should work when the first command starts with a ./", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      const t = create(c, p, ["./c2"]);
      expect(serializer.serialize(t)).toEqual("/a(left:ap)/c2(left:cp)");
    });

    it("should work when the first command is ./)", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      const t = create(c, p, ["./", "c2"]);
      expect(serializer.serialize(t)).toEqual("/a(left:ap)/c2(left:cp)");
    });

    it("should work when given params", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      const t = create(c, p, [{'x': 99}]);
      expect(serializer.serialize(t)).toEqual("/a(left:ap)/c;x=99(left:cp)");
    });

    it("should support going to a parent", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      const t = create(c, p, ["../a2"]);
      expect(serializer.serialize(t)).toEqual("/a2(left:ap)");
    });

    it("should support going to a parent (nested case)", () => {
      const p = serializer.parse("/a/c");
      const c = p.firstChild(<any>p.firstChild(p.root));
      const t = create(c, p, ["../c2"]);
      expect(serializer.serialize(t)).toEqual("/a/c2");
    });

    it("should work when given ../", () => {
      const p = serializer.parse("/a/c");
      const c = p.firstChild(<any>p.firstChild(p.root));
      const t = create(c, p, ["../"]);
      expect(serializer.serialize(t)).toEqual("/a");
    });

    it("should navigate to the root", () => {
      const p = serializer.parse("/a/c");
      const c = p.firstChild(p.root);
      const t = create(c, p, ["../"]);
      expect(serializer.serialize(t)).toEqual("");
    });

    it("should support setting matrix params", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      const t = create(c, p, ["../", {'x': 5}]);
      expect(serializer.serialize(t)).toEqual("/a;x=5(left:ap)");
    });

    it("should throw when too many ..", () => {
      const p = serializer.parse("/a(left:ap)/c(left:cp)");
      const c = p.firstChild(p.root);
      expect(() => create(c, p, ["../../"])).toThrowError("Invalid number of '../'");
    });
  });

  it("should set query params", () => {
    const p = serializer.parse("/");
    const t = create(p.root, p, [], {a: 'hey'});
    expect(t.queryParams).toEqual({a: 'hey'});
  });

  it("should stringify query params", () => {
    const p = serializer.parse("/");
    const t = create(p.root, p, [], <any>{a: 1});
    expect(t.queryParams).toEqual({a: '1'});
  });

  it("should reuse old query params when given undefined", () => {
    const p = serializer.parse("/?a=1");
    const t = create(p.root, p, [], undefined);
    expect(t.queryParams).toEqual({a: '1'});
  });

  it("should set fragment", () => {
    const p = serializer.parse("/");
    const t = create(p.root, p, [], {}, "fragment");
    expect(t.fragment).toEqual("fragment");
  });

  it("should reused old fragment when given undefined", () => {
    const p = serializer.parse("/#fragment");
    const t = create(p.root, p, [], undefined, undefined);
    expect(t.fragment).toEqual("fragment");
  });
});

function create(start: UrlSegment | null, tree: UrlTree, commands: any[], queryParams?: Params, fragment?: string) {
  if (!start) {
    expect(start).toBeDefined();
  }
  const s = new ActivatedRouteSnapshot([], <any>{}, PRIMARY_OUTLET, "someComponent", null, <any>start);
  const a = new ActivatedRoute(new BehaviorSubject(null), new BehaviorSubject(null), PRIMARY_OUTLET, "someComponent", s);
  advanceActivatedRoute(a);
  return createUrlTree(a, tree, commands, queryParams, fragment);
}