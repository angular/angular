import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach} from 'test_lib/test_lib';
import {isBlank, FIELD, IMPLEMENTS} from 'facade/lang';
import {ListWrapper, MapWrapper, List} from 'facade/collection';
import {ProtoElementInjector, VIEW_KEY} from 'core/compiler/element_injector';
import {Parent, Ancestor} from 'core/annotations/visibility';
import {Injector, Inject, bind} from 'di/di';
import {View} from 'core/compiler/view';

@IMPLEMENTS(View)
class DummyView {}

class Directive {
}

class NeedsDirective {
  @FIELD("dependency:Directive")
  constructor(dependency:Directive){
    this.dependency = dependency;
  }
}

class NeedDirectiveFromParent {
  @FIELD("dependency:Directive")
  constructor(@Parent() dependency:Directive){
    this.dependency = dependency;
  }
}

class NeedDirectiveFromAncestor {
  @FIELD("dependency:Directive")
  constructor(@Ancestor() dependency:Directive){
    this.dependency = dependency;
  }
}

class NeedsService {
  @FIELD("service:Object")
  constructor(@Inject("service") service) {
    this.service = service;
  }
}

class A_Needs_B {
  constructor(dep){}
}

class B_Needs_A {
  constructor(dep){}
}

class NeedsView {
  @FIELD("view:Object")
  constructor(@Inject(View) view) {
    this.view = view;
  }
}

export function main() {
  function humanize(tree, names:List) {
    var lookupName = (item) =>
      ListWrapper.last(
        ListWrapper.find(names, (pair) => pair[0] === item));

    if (tree.children.length == 0) return lookupName(tree);
    var children = tree.children.map(m => humanize(m, names));
    return [lookupName(tree), children];
  }

  function injector(bindings, appInjector = null, props = null) {
    if (isBlank(appInjector)) appInjector = new Injector([]);
    if (isBlank(props)) props = {};

    var proto = new ProtoElementInjector(null, bindings);
    var inj = proto.instantiate({view: props["view"]});
    inj.instantiateDirectives(appInjector);
    return inj;
  }

  function parentChildInjectors(parentBindings, childBindings) {
    var inj = new Injector([]);

    var protoParent = new ProtoElementInjector(null, parentBindings);
    var parent = protoParent.instantiate({view: null});
    parent.instantiateDirectives(inj);

    var protoChild = new ProtoElementInjector(protoParent, childBindings);
    var child = protoChild.instantiate({view: null});
    child.instantiateDirectives(inj);

    return child;
  }

  describe("ElementInjector", function () {
    describe("proto injectors", function () {
      it("should construct a proto tree", function () {
        var p = new ProtoElementInjector(null, []);
        var c1 = new ProtoElementInjector(p, []);
        var c2 = new ProtoElementInjector(p, []);

        expect(humanize(p, [
          [p, 'parent'],
          [c1, 'child1'],
          [c2, 'child2']
        ])).toEqual(["parent", ["child1", "child2"]]);
      });
    });

    describe("instantiate", function () {
      it("should create an element injector", function () {
        var protoParent = new ProtoElementInjector(null, []);
        var protoChild1 = new ProtoElementInjector(protoParent, []);
        var protoChild2 = new ProtoElementInjector(protoParent, []);

        var p = protoParent.instantiate({view: null});
        var c1 = protoChild1.instantiate({view: null});
        var c2 = protoChild2.instantiate({view: null});

        expect(humanize(p, [
          [p, 'parent'],
          [c1, 'child1'],
          [c2, 'child2']
        ])).toEqual(["parent", ["child1", "child2"]]);
      });
    });

    describe("hasBindings", function () {
      it("should be true when there are bindings", function () {
        var p = new ProtoElementInjector(null, [Directive]);
        expect(p.hasBindings).toBeTruthy();
      });

      it("should be false otherwise", function () {
        var p = new ProtoElementInjector(null, []);
        expect(p.hasBindings).toBeFalsy();
      });
    });

    describe("instantiateDirectives", function () {
      it("should instantiate directives that have no dependencies", function () {
        var inj = injector([Directive]);
        expect(inj.get(Directive)).toBeAnInstanceOf(Directive);
      });

      it("should instantiate directives that depend on other directives", function () {
        var inj = injector([Directive, NeedsDirective]);

        var d = inj.get(NeedsDirective);

        expect(d).toBeAnInstanceOf(NeedsDirective);
        expect(d.dependency).toBeAnInstanceOf(Directive);
      });

      it("should instantiate directives that depend on app services", function () {
        var appInjector = new Injector([
          bind("service").toValue("service")
        ]);
        var inj = injector([NeedsService], appInjector);

        var d = inj.get(NeedsService);
        expect(d).toBeAnInstanceOf(NeedsService);
        expect(d.service).toEqual("service");
      });

      it("should instantiate directives that depend on speical objects", function () {
        var view = new DummyView();
        var inj = injector([NeedsView], null, {"view" : view});

        expect(inj.get(NeedsView).view).toBe(view);
      });

      it("should return app services", function () {
        var appInjector = new Injector([
          bind("service").toValue("service")
        ]);
        var inj = injector([], appInjector);

        expect(inj.get('service')).toEqual('service');
      });

      it("should get directives from parent", function () {
        var child = parentChildInjectors([Directive], [NeedDirectiveFromParent]);

        var d = child.get(NeedDirectiveFromParent);

        expect(d).toBeAnInstanceOf(NeedDirectiveFromParent);
        expect(d.dependency).toBeAnInstanceOf(Directive);
      });

      it("should get directives from ancestor", function () {
        var child = parentChildInjectors([Directive], [NeedDirectiveFromAncestor]);

        var d = child.get(NeedDirectiveFromAncestor);

        expect(d).toBeAnInstanceOf(NeedDirectiveFromAncestor);
        expect(d.dependency).toBeAnInstanceOf(Directive);
      });

      it("should throw when no directive found", function () {
        expect(() => injector([NeedDirectiveFromParent])).
            toThrowError('No provider for Directive! (NeedDirectiveFromParent -> Directive)');
      });

      it("should accept bindings instead of directive types", function () {
        var inj = injector([bind(Directive).toClass(Directive)]);
        expect(inj.get(Directive)).toBeAnInstanceOf(Directive);
      });

      it("should allow for direct access using getAtIndex", function () {
        var inj = injector([bind(Directive).toClass(Directive)]);
        expect(inj.getAtIndex(0)).toBeAnInstanceOf(Directive);
        expect(() => inj.getAtIndex(-1)).toThrowError(
          'Index -1 is out-of-bounds.');
        expect(() => inj.getAtIndex(10)).toThrowError(
          'Index 10 is out-of-bounds.');
      });
    });

    describe("special objects", function () {
      it("should return view", function () {
        var view = new DummyView();
        var inj = injector([], null, {"view" : view});

        expect(inj.get(View)).toEqual(view);
      });

      it("should handle cyclic dependencies", function () {
        expect(() => {
          injector([
            bind(A_Needs_B).toFactory((a) => new A_Needs_B(a), [B_Needs_A]),
            bind(B_Needs_A).toFactory((a) => new B_Needs_A(a), [A_Needs_B])
          ]);
        }).toThrowError('Cannot instantiate cyclic dependency! ' +
            '(A_Needs_B -> B_Needs_A -> A_Needs_B)');
      });
    });
  });
}
