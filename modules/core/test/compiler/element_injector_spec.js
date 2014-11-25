import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach, SpyObject} from 'test_lib/test_lib';
import {isBlank, isPresent, FIELD, IMPLEMENTS, proxy} from 'facade/lang';
import {ListWrapper, MapWrapper, List} from 'facade/collection';
import {ProtoElementInjector, PreBuiltObjects} from 'core/compiler/element_injector';
import {Parent, Ancestor} from 'core/annotations/visibility';
import {Injector, Inject, bind} from 'di/di';
import {View} from 'core/compiler/view';
import {ProtoRecordRange} from 'change_detection/record_range';
import {ViewPort} from 'core/compiler/viewport';
import {NgElement} from 'core/dom/element';

@proxy
@IMPLEMENTS(View)
class DummyView extends SpyObject {noSuchMethod(m){super.noSuchMethod(m)}}


class Directive {
}


class SomeOtherDirective {
}

class NeedsDirective {
  dependency:Directive;
  constructor(dependency:Directive){
    this.dependency = dependency;
  }
}

class NeedDirectiveFromParent {
  dependency:Directive;
  constructor(@Parent() dependency:Directive){
    this.dependency = dependency;
  }
}

class NeedDirectiveFromAncestor {
  dependency:Directive;
  constructor(@Ancestor() dependency:Directive){
    this.dependency = dependency;
  }
}

class NeedsService {
  service:any;
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
  view:any;
  constructor(@Inject(View) view) {
    this.view = view;
  }
}

export function main() {
  var defaultPreBuiltObjects = new PreBuiltObjects(null, null, null);

  function humanize(tree, names:List) {
    var lookupName = (item) =>
      ListWrapper.last(
        ListWrapper.find(names, (pair) => pair[0] === item));

    if (tree.children.length == 0) return lookupName(tree);
    var children = tree.children.map(m => humanize(m, names));
    return [lookupName(tree), children];
  }

  function injector(bindings, lightDomAppInjector = null, shadowDomAppInjector = null, preBuiltObjects = null) {
    if (isBlank(lightDomAppInjector)) lightDomAppInjector = new Injector([]);

    var proto = new ProtoElementInjector(null, 0, bindings, isPresent(shadowDomAppInjector));
    var inj = proto.instantiate(null, null);
    var preBuilt = isPresent(preBuiltObjects) ? preBuiltObjects : defaultPreBuiltObjects;

    inj.instantiateDirectives(lightDomAppInjector, shadowDomAppInjector, preBuilt);
    return inj;
  }

  function parentChildInjectors(parentBindings, childBindings) {
    var inj = new Injector([]);

    var protoParent = new ProtoElementInjector(null, 0, parentBindings);
    var parent = protoParent.instantiate(null, null);
    parent.instantiateDirectives(inj, null, defaultPreBuiltObjects);

    var protoChild = new ProtoElementInjector(protoParent, 1, childBindings);
    var child = protoChild.instantiate(parent, null);
    child.instantiateDirectives(inj, null, defaultPreBuiltObjects);

    return child;
  }

  function hostShadowInjectors(hostBindings, shadowBindings) {
    var inj = new Injector([]);
    var shadowInj = inj.createChild([]);

    var protoParent = new ProtoElementInjector(null, 0, hostBindings, true);
    var host = protoParent.instantiate(null, null);
    host.instantiateDirectives(inj, shadowInj, null);

    var protoChild = new ProtoElementInjector(protoParent, 0, shadowBindings, false);
    var shadow = protoChild.instantiate(null, host);
    shadow.instantiateDirectives(shadowInj, null, null);

    return shadow;
  }

  describe("ElementInjector", function () {
    describe("instantiate", function () {
      it("should create an element injector", function () {
        var protoParent = new ProtoElementInjector(null, 0, []);
        var protoChild1 = new ProtoElementInjector(protoParent, 1, []);
        var protoChild2 = new ProtoElementInjector(protoParent, 2, []);

        var p = protoParent.instantiate(null, null);
        var c1 = protoChild1.instantiate(p, null);
        var c2 = protoChild2.instantiate(p, null);

        expect(humanize(p, [
          [p, 'parent'],
          [c1, 'child1'],
          [c2, 'child2']
        ])).toEqual(["parent", ["child1", "child2"]]);
      });
    });

    describe("hasBindings", function () {
      it("should be true when there are bindings", function () {
        var p = new ProtoElementInjector(null, 0, [Directive]);
        expect(p.hasBindings).toBeTruthy();
      });

      it("should be false otherwise", function () {
        var p = new ProtoElementInjector(null, 0, []);
        expect(p.hasBindings).toBeFalsy();
      });
    });

    describe("hasInstances", function () {
      it("should be false when no directives are instantiated", function () {
        expect(injector([]).hasInstances()).toBe(false);
      });

      it("should be true when directives are instantiated", function () {
        expect(injector([Directive]).hasInstances()).toBe(true);
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

      it("should instantiate directives that depend on pre built objects", function () {
        var view = new DummyView();
        var inj = injector([NeedsView], null, null, new PreBuiltObjects(view, null, null));

        expect(inj.get(NeedsView).view).toBe(view);
      });

      it("should instantiate directives that depend on the containing component", function () {
        var shadow = hostShadowInjectors([Directive], [NeedsDirective]);

        var d = shadow.get(NeedsDirective);
        expect(d).toBeAnInstanceOf(NeedsDirective);
        expect(d.dependency).toBeAnInstanceOf(Directive);
      });

      it("should not instantiate directives that depend on other directives in the containing component's ElementInjector", () => {
        expect( () => {
          hostShadowInjectors([SomeOtherDirective, Directive], [NeedsDirective]);
        }).toThrowError('No provider for Directive! (NeedsDirective -> Directive)')
      });

      it("should instantiate component directives that depend on app services in the shadow app injector", () => {
        var shadowAppInjector = new Injector([
          bind("service").toValue("service")
        ]);
        var inj = injector([NeedsService], null, shadowAppInjector);

        var d = inj.get(NeedsService);
        expect(d).toBeAnInstanceOf(NeedsService);
        expect(d.service).toEqual("service");
      });

      it("should not instantiate other directives that depend on app services in the shadow app injector", () => {
        var shadowAppInjector = new Injector([
          bind("service").toValue("service")
        ]);
        expect( () => {
          injector([SomeOtherDirective, NeedsService], null, shadowAppInjector);
        }).toThrowError('No provider for service! (NeedsService -> service)');
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

      it("should not return parent's directives on self", function () {
        expect(() => {
          injector([Directive, NeedDirectiveFromParent]);
        }).toThrowError();
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

    describe("pre built objects", function () {
      it("should return view", function () {
        var view = new DummyView();
        var inj = injector([], null, null, new PreBuiltObjects(view, null, null));

        expect(inj.get(View)).toEqual(view);
      });

      it("should return element", function () {
        var element = new NgElement(null);
        var inj = injector([], null, null, new PreBuiltObjects(null, element, null));

        expect(inj.get(NgElement)).toEqual(element);
      });

      it('should return viewPort', function () {
        var viewPort = new ViewPort(null, null, null, null);
        var inj = injector([], null, null, new PreBuiltObjects(null, null, viewPort));

        expect(inj.get(ViewPort)).toEqual(viewPort);
      });
    });
  });
}
