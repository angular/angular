import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach} from 'test_lib/test_lib';
import {isBlank, FIELD} from 'facade/lang';
import {ListWrapper, MapWrapper, List} from 'facade/collection';
import {ProtoElementInjector} from 'core/compiler/element_injector';
import {Parent, Ancestor} from 'core/annotations/visibility';
import {Injector, Inject, bind} from 'di/di';

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

export function main() {
  function humanize(tree, names:List) {
    var lookupName = (item) =>
      ListWrapper.last(
        ListWrapper.find(names, (pair) => pair[0] === item));

    if (tree.children.length == 0) return lookupName(tree);
    var children = tree.children.map(m => humanize(m, names));
    return [lookupName(tree), children];
  }

  describe("ElementInjector", function () {
    describe("proto injectors", function () {
      it("should construct a proto tree", function () {
        var p = new ProtoElementInjector(null, [], []);
        var c1 = new ProtoElementInjector(p, [], []);
        var c2 = new ProtoElementInjector(p, [], []);

        expect(humanize(p, [
          [p, 'parent'],
          [c1, 'child1'],
          [c2, 'child2']
        ])).toEqual(["parent", ["child1", "child2"]]);
      });
    });

    describe("instantiate", function () {
      it("should create an element injector", function () {
        var protoParent = new ProtoElementInjector(null, [], []);
        var protoChild1 = new ProtoElementInjector(protoParent, [], []);
        var protoChild2 = new ProtoElementInjector(protoParent, [], []);

        var p = protoParent.instantiate();
        var c1 = protoChild1.instantiate();
        var c2 = protoChild2.instantiate();

        expect(humanize(p, [
          [p, 'parent'],
          [c1, 'child1'],
          [c2, 'child2']
        ])).toEqual(["parent", ["child1", "child2"]]);
      });
    });

    describe("hasBindings", function () {
      it("should be true when there are bindings", function () {
        var p = new ProtoElementInjector(null, [Directive], []);
        expect(p.hasBindings).toBeTruthy();
      });

      it("should be false otherwise", function () {
        var p = new ProtoElementInjector(null, [], []);
        expect(p.hasBindings).toBeFalsy();
      });
    });

    describe("instantiateDirectives", function () {
      function injector(bindings, appInjector = null) {
        var proto = new ProtoElementInjector(null, bindings, []);
        var inj = proto.instantiate();

        if (isBlank(appInjector)) appInjector = new Injector([]);
        inj.instantiateDirectives(appInjector);
        return inj;
      }

      function parentChildInjectors(parentBindings, childBindings) {
        var inj = new Injector([]);

        var protoParent = new ProtoElementInjector(null, parentBindings, []);
        var parent = protoParent.instantiate();
        parent.instantiateDirectives(inj);

        var protoChild = new ProtoElementInjector(protoParent, childBindings, []);
        var child = protoChild.instantiate();
        child.instantiateDirectives(inj);

        return child;
      }

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
    });
  });
}