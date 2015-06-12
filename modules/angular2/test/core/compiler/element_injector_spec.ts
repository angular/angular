// TODO(tbosch): clang-format screws this up, see https://github.com/angular/clang-format/issues/11.
// Enable clang-format here again when this is fixed.
// clang-format off
import {
  describe,
  ddescribe,
  it,
  iit,
  xit,
  xdescribe,
  expect,
  beforeEach,
  SpyObject,
  proxy,
  inject,
  AsyncTestCompleter,
  el,
  containsRegexp
} from 'angular2/test_lib';
import {isBlank, isPresent, IMPLEMENTS, stringify} from 'angular2/src/facade/lang';
import {
  ListWrapper,
  MapWrapper,
  List,
  StringMapWrapper,
  iterateListLike
} from 'angular2/src/facade/collection';
import {
  ProtoElementInjector,
  ElementInjector,
  PreBuiltObjects,
  DirectiveBinding,
  TreeNode
} from 'angular2/src/core/compiler/element_injector';
import * as dirAnn from 'angular2/src/core/annotations_impl/annotations';
import {
  Parent,
  Ancestor,
  Unbounded,
  Attribute,
  Query,
  Component,
  Directive,
  onDestroy
} from 'angular2/annotations';
import * as ngDiAnn from 'angular2/src/core/annotations_impl/visibility';
import {bind, Injector, Binding, resolveBindings, Optional, Inject, Injectable} from 'angular2/di';
import * as diAnn from 'angular2/src/di/annotations_impl';
import {AppProtoView, AppView} from 'angular2/src/core/compiler/view';
import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
import {ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {DynamicChangeDetector, ChangeDetectorRef, Parser, Lexer} from 'angular2/change_detection';
import {Renderer} from 'angular2/src/render/api';
import {QueryList} from 'angular2/src/core/compiler/query_list';

@proxy
@IMPLEMENTS(AppView)
class DummyView extends SpyObject {
  componentChildViews;
  changeDetector;
  constructor() {
    super();
    this.componentChildViews = [];
    this.changeDetector = null;
  }
  noSuchMethod(m) { return super.noSuchMethod(m); }
}


class SimpleDirective {}

class SimpleService {}

class SomeOtherDirective {}

var _constructionCount = 0;
class CountingDirective {
  count;
  constructor() {
    this.count = _constructionCount;
    _constructionCount += 1;
  }
}

class FancyCountingDirective extends CountingDirective {
  constructor() { super(); }
}

@Injectable()
class NeedsDirective {
  dependency: SimpleDirective;
  constructor(dependency: SimpleDirective) { this.dependency = dependency; }
}

@Injectable()
class OptionallyNeedsDirective {
  dependency: SimpleDirective;
  constructor(@Optional() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Injectable()
class NeedsDirectiveFromParent {
  dependency: SimpleDirective;
  constructor(@Parent() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Injectable()
class NeedsDirectiveFromParentOrSelf {
  dependency: SimpleDirective;
  constructor(@Parent({self: true}) dependency: SimpleDirective) { this.dependency = dependency; }
}

@Injectable()
class NeedsDirectiveFromAncestor {
  dependency: SimpleDirective;
  constructor(@Ancestor() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Injectable()
class NeedsDirectiveFromAnAncestorShadowDom {
  dependency: SimpleDirective;
  constructor(@Unbounded() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Injectable()
class NeedsService {
  service: any;
  constructor(@Inject("service") service) { this.service = service; }
}

class HasEventEmitter {
  emitter;
  constructor() { this.emitter = "emitter"; }
}

class HasHostAction {
  hostActionName;
  constructor() { this.hostActionName = "hostAction"; }
}

class NeedsAttribute {
  typeAttribute;
  titleAttribute;
  fooAttribute;
  constructor(@Attribute('type') typeAttribute: String, @Attribute('title') titleAttribute: String,
              @Attribute('foo') fooAttribute: String) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Injectable()
class NeedsAttributeNoType {
  fooAttribute;
  constructor(@Attribute('foo') fooAttribute) { this.fooAttribute = fooAttribute; }
}

@Injectable()
class NeedsQuery {
  query: QueryList<CountingDirective>;
  constructor(@Query(CountingDirective) query: QueryList<CountingDirective>) { this.query = query; }
}

@Injectable()
class NeedsElementRef {
  elementRef;
  constructor(ref: ElementRef) { this.elementRef = ref; }
}

@Injectable()
class NeedsViewContainer {
  viewContainer;
  constructor(vc: ViewContainerRef) { this.viewContainer = vc; }
}

@Injectable()
class NeedsProtoViewRef {
  protoViewRef;
  constructor(ref: ProtoViewRef) { this.protoViewRef = ref; }
}

@Injectable()
class OptionallyInjectsProtoViewRef {
  protoViewRef;
  constructor(@Optional() ref: ProtoViewRef) { this.protoViewRef = ref; }
}

@Injectable()
class NeedsChangeDetectorRef {
  changeDetectorRef;
  constructor(cdr: ChangeDetectorRef) { this.changeDetectorRef = cdr; }
}

class A_Needs_B {
  constructor(dep) {}
}

class B_Needs_A {
  constructor(dep) {}
}

class DirectiveWithDestroy {
  onDestroyCounter: number;

  constructor() { this.onDestroyCounter = 0; }

  onDestroy() { this.onDestroyCounter++; }
}

class TestNode extends TreeNode<TestNode> {
  message: string;
  constructor(parent: TestNode, message) {
    super(parent);
    this.message = message;
  }
  toString() { return this.message; }
}

export function main() {
  var defaultPreBuiltObjects = new PreBuiltObjects(null, null, null);
  var appInjector = Injector.resolveAndCreate([]);

  // An injector with more than 10 bindings will switch to the dynamic strategy
  var dynamicBindings = [];

  for (var i = 0; i < 20; i++) {
    ListWrapper.push(dynamicBindings, bind(i).toValue(i));
  }

  function createPei(parent, index, bindings, distance = 1, hasShadowRoot = false) {
    var directiveBinding = ListWrapper.map(bindings, b => {
      if (b instanceof DirectiveBinding) return b;
      if (b instanceof Binding) return DirectiveBinding.createFromBinding(b, null);
      return DirectiveBinding.createFromType(b, null);
    });
    return ProtoElementInjector.create(parent, index, directiveBinding, hasShadowRoot, distance);
  }

  function humanize(tree: TreeNode<any>, names: List<List<any>>) {
    var lookupName = (item) =>
        ListWrapper.last(ListWrapper.find(names, (pair) => pair[0] === item));

    if (tree.children.length == 0) return lookupName(tree);
    var children = tree.children.map(m => humanize(m, names));
    return [lookupName(tree), children];
  }

  function injector(bindings, lightDomAppInjector = null, isComponent: boolean = false,
                    preBuiltObjects = null, attributes = null) {
    if (isBlank(lightDomAppInjector)) lightDomAppInjector = appInjector;

    var proto = createPei(null, 0, bindings, 0, isComponent);
    proto.attributes = attributes;

    var inj = proto.instantiate(null);
    var preBuilt = isPresent(preBuiltObjects) ? preBuiltObjects : defaultPreBuiltObjects;
    inj.hydrate(lightDomAppInjector, null, preBuilt);
    return inj;
  }

  function parentChildInjectors(parentBindings, childBindings, parentPreBuildObjects = null) {
    if (isBlank(parentPreBuildObjects)) parentPreBuildObjects = defaultPreBuiltObjects;

    var inj = Injector.resolveAndCreate([]);


    var protoParent = createPei(null, 0, parentBindings);
    var parent = protoParent.instantiate(null);

    parent.hydrate(inj, null, parentPreBuildObjects);

    var protoChild = createPei(protoParent, 1, childBindings, 1, false);
    var child = protoChild.instantiate(parent);
    child.hydrate(inj, null, defaultPreBuiltObjects);

    return child;
  }

  function hostShadowInjectors(hostBindings: List<any>,
                               shadowBindings: List<any>): ElementInjector {
    var inj = Injector.resolveAndCreate([]);

    var protoHost = createPei(null, 0, hostBindings, 0, true);
    var host = protoHost.instantiate(null);
    host.hydrate(inj, null, defaultPreBuiltObjects);

    var protoShadow = createPei(null, 0, shadowBindings, 0, false);
    var shadow = protoShadow.instantiate(null);
    shadow.hydrate(host.getShadowDomAppInjector(), host, null);

    return shadow;
  }

  describe('TreeNodes', () => {
    var root, firstParent, lastParent, node;

    /*
     Build a tree of the following shape:
     root
      - p1
         - c1
         - c2
      - p2
        - c3
     */
    beforeEach(() => {
      root = new TestNode(null, 'root');
      var p1 = firstParent = new TestNode(root, 'p1');
      var p2 = lastParent = new TestNode(root, 'p2');
      node = new TestNode(p1, 'c1');
      new TestNode(p1, 'c2');
      new TestNode(p2, 'c3');
    });

    // depth-first pre-order.
    function walk(node, f) {
      if (isBlank(node)) return f;
      f(node);
      ListWrapper.forEach(node.children, (n) => walk(n, f));
    }

    function logWalk(node) {
      var log = '';
      walk(node, (n) => { log += (log.length != 0 ? ', ' : '') + n.toString(); });
      return log;
    }

    it('should support listing children',
       () => { expect(logWalk(root)).toEqual('root, p1, c1, c2, p2, c3'); });

    it('should support removing the first child node', () => {
      firstParent.remove();

      expect(firstParent.parent).toEqual(null);
      expect(logWalk(root)).toEqual('root, p2, c3');
    });

    it('should support removing the last child node', () => {
      lastParent.remove();

      expect(logWalk(root)).toEqual('root, p1, c1, c2');
    });

    it('should support moving a node at the end of children', () => {
      node.remove();
      root.addChild(node);

      expect(logWalk(root)).toEqual('root, p1, c2, p2, c3, c1');
    });

    it('should support moving a node in the beginning of children', () => {
      node.remove();
      lastParent.addChildAfter(node, null);

      expect(logWalk(root)).toEqual('root, p1, c2, p2, c1, c3');
    });

    it('should support moving a node in the middle of children', () => {
      node.remove();
      lastParent.addChildAfter(node, firstParent);

      expect(logWalk(root)).toEqual('root, p1, c2, c1, p2, c3');
    });
  });

  describe("ProtoElementInjector", () => {
    describe("direct parent", () => {
      it("should return parent proto injector when distance is 1", () => {
        var distance = 1;
        var protoParent = createPei(null, 0, []);
        var protoChild = createPei(protoParent, 0, [], distance, false);

        expect(protoChild.directParent()).toEqual(protoParent);
      });

      it("should return null otherwise", () => {
        var distance = 2;
        var protoParent = createPei(null, 0, []);
        var protoChild = createPei(protoParent, 0, [], distance, false);

        expect(protoChild.directParent()).toEqual(null);
      });

    });

    describe('inline strategy', () => {
      it("should allow for direct access using getBindingAtIndex", () => {
        var proto = createPei(null, 0, [bind(SimpleDirective).toClass(SimpleDirective)]);

        expect(proto.getBindingAtIndex(0)).toBeAnInstanceOf(DirectiveBinding);
        expect(() => proto.getBindingAtIndex(-1)).toThrowError('Index -1 is out-of-bounds.');
        expect(() => proto.getBindingAtIndex(10)).toThrowError('Index 10 is out-of-bounds.');
      });
    });

    describe('dynamic strategy', () => {
      it("should allow for direct access using getBindingAtIndex", () => {
        var proto = createPei(null, 0, dynamicBindings);

        expect(proto.getBindingAtIndex(0)).toBeAnInstanceOf(DirectiveBinding);
        expect(() => proto.getBindingAtIndex(-1)).toThrowError('Index -1 is out-of-bounds.');
        expect(() => proto.getBindingAtIndex(dynamicBindings.length - 1)).not.toThrow();
        expect(() => proto.getBindingAtIndex(dynamicBindings.length))
            .toThrowError(`Index ${dynamicBindings.length} is out-of-bounds.`);
      });
    });

    describe('event emitters', () => {
      it('should return a list of event accessors', () => {
        var binding = DirectiveBinding.createFromType(HasEventEmitter,
                                                      new dirAnn.Directive({events: ['emitter']}));

        var inj = createPei(null, 0, [binding]);
        expect(inj.eventEmitterAccessors.length).toEqual(1);

        var accessor = inj.eventEmitterAccessors[0][0];
        expect(accessor.eventName).toEqual('emitter');
        expect(accessor.getter(new HasEventEmitter())).toEqual('emitter');
      });

      it('should allow a different event vs field name', () => {
        var binding = DirectiveBinding.createFromType(HasEventEmitter,
            new dirAnn.Directive({events: ['emitter: publicEmitter']}));

        var inj = createPei(null, 0, [binding]);
        expect(inj.eventEmitterAccessors.length).toEqual(1);

        var accessor = inj.eventEmitterAccessors[0][0];
        expect(accessor.eventName).toEqual('publicEmitter');
        expect(accessor.getter(new HasEventEmitter())).toEqual('emitter');
      });

      it('should return a list of hostAction accessors', () => {
        var binding = DirectiveBinding.createFromType(
            HasEventEmitter, new dirAnn.Directive({host: {'@hostActionName': 'onAction'}}));

        var inj = createPei(null, 0, [binding]);
        expect(inj.hostActionAccessors.length).toEqual(1);

        var accessor = inj.hostActionAccessors[0][0];
        expect(accessor.actionExpression).toEqual('onAction');
        expect(accessor.getter(new HasHostAction())).toEqual('hostAction');
      });
    });

    describe(".create", () => {
      it("should collect hostInjector injectables from all directives", () => {
        var pei = createPei(null, 0, [
          DirectiveBinding.createFromType(
              SimpleDirective,
              new dirAnn.Component({hostInjector: [bind('injectable1').toValue('injectable1')]})),
          DirectiveBinding.createFromType(SomeOtherDirective, new dirAnn.Component({
            hostInjector: [bind('injectable2').toValue('injectable2')]
          }))
        ]);

        expect(pei.getBindingAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pei.getBindingAtIndex(1).key.token).toBe(SomeOtherDirective);
        expect(pei.getBindingAtIndex(2).key.token).toEqual("injectable1");
        expect(pei.getBindingAtIndex(3).key.token).toEqual("injectable2");
      });

      it("should collect viewInjector injectables from the component", () => {
        var pei = createPei(null, 0,
                            [DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Component({
                              viewInjector: [bind('injectable1').toValue('injectable1')]
                            }))],
                            0, true);

        expect(pei.getBindingAtIndex(0).key.token).toBe(SimpleDirective);
        expect(pei.getBindingAtIndex(1).key.token).toEqual("injectable1");
      });

      it('should support an arbitrary number of bindings', () => {
        var pei = createPei(null, 0, dynamicBindings);

        for (var i = 0; i < dynamicBindings.length; i++) {
          expect(pei.getBindingAtIndex(i).key.token).toBe(i);
        }
      });

      it('should throw whenever multiple directives declare the same host injectable', () => {
        expect(() => {
          createPei(null, 0, [
            DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Component({
              hostInjector: [bind('injectable1').toValue('injectable1')]
            })),
            DirectiveBinding.createFromType(SomeOtherDirective, new dirAnn.Component({
              hostInjector: [bind('injectable1').toValue('injectable2')]
            }))
          ]);
        }).toThrowError('Multiple directives defined the same host injectable: "injectable1"');
      });

    });
  });

  describe("ElementInjector", () => {
    describe("instantiate", () => {
      it("should create an element injector", () => {
        var protoParent = createPei(null, 0, []);
        var protoChild1 = createPei(protoParent, 1, []);
        var protoChild2 = createPei(protoParent, 2, []);

        var p = protoParent.instantiate(null);
        var c1 = protoChild1.instantiate(p);
        var c2 = protoChild2.instantiate(p);

        expect(humanize(p, [[p, 'parent'], [c1, 'child1'], [c2, 'child2']]))
            .toEqual(["parent", ["child1", "child2"]]);
      });

      describe("direct parent", () => {
        it("should return parent injector when distance is 1", () => {
          var distance = 1;
          var protoParent = createPei(null, 0, []);
          var protoChild = createPei(protoParent, 1, [], distance);

          var p = protoParent.instantiate(null);
          var c = protoChild.instantiate(p);

          expect(c.directParent()).toEqual(p);
        });

        it("should return null otherwise", () => {
          var distance = 2;
          var protoParent = createPei(null, 0, []);
          var protoChild = createPei(protoParent, 1, [], distance);

          var p = protoParent.instantiate(null);
          var c = protoChild.instantiate(p);

          expect(c.directParent()).toEqual(null);
        });
      });
    });

    describe("hasBindings", () => {
      it("should be true when there are bindings", () => {
        var p = createPei(null, 0, [SimpleDirective]);
        expect(p.hasBindings).toBeTruthy();
      });

      it("should be false otherwise", () => {
        var p = createPei(null, 0, []);
        expect(p.hasBindings).toBeFalsy();
      });
    });

    describe("hasInstances", () => {
      it("should be false when no directives are instantiated",
         () => { expect(injector([]).hasInstances()).toBe(false); });

      it("should be true when directives are instantiated",
         () => { expect(injector([SimpleDirective]).hasInstances()).toBe(true); });
    });

    [{ strategy: 'inline', bindings: [] }, { strategy: 'dynamic',
      bindings: dynamicBindings }].forEach((context) => {

      var extraBindings = context['bindings'];
      describe(`${context['strategy']} strategy`, () => {
        describe("hydrate", () => {
          it("should instantiate directives that have no dependencies", () => {
            var bindings = ListWrapper.concat([SimpleDirective], extraBindings);
            var inj = injector(bindings);
            expect(inj.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
          });

          it("should instantiate directives that depend on an arbitrary number of directives", () => {
            var bindings = ListWrapper.concat([SimpleDirective, NeedsDirective], extraBindings);
            var inj = injector(bindings);

            var d = inj.get(NeedsDirective);

            expect(d).toBeAnInstanceOf(NeedsDirective);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });


          it("should instantiate hostInjector injectables that have dependencies with set visibility",
             function() {
               var childInj = parentChildInjectors(
                   ListWrapper.concat(
                       [DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Component({
                         hostInjector: [bind('injectable1').toValue('injectable1')]
                       }))],
                       extraBindings),
                   [DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Component({
                     hostInjector: [
                       bind('injectable1')
                           .toValue('new-injectable1'),
                       bind('injectable2')
                           .toFactory(
                               (val) => `${val}-injectable2`,
                               [[new diAnn.Inject('injectable1'), new ngDiAnn.Parent()]])
                     ]
                   }))]);
               expect(childInj.get('injectable2')).toEqual('injectable1-injectable2');
             });

          it("should instantiate hostInjector injectables that have dependencies", () => {
            var inj = injector(ListWrapper.concat(
                [DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Directive({
                  hostInjector: [
                    bind('injectable1')
                        .toValue('injectable1'),
                    bind('injectable2')
                        .toFactory(
                            (val) => `${val}-injectable2`,
                            ['injectable1'])
                  ]
                }))],
                extraBindings));
            expect(inj.get('injectable2')).toEqual('injectable1-injectable2');
          });

          it("should instantiate components that depends on viewInjector dependencies", () => {
            var inj = injector(
                ListWrapper.concat([DirectiveBinding.createFromType(NeedsService, new dirAnn.Component({
                                     viewInjector: [bind('service').toValue('service')]
                                   }))],
                                   extraBindings),
                null, true);
            expect(inj.get(NeedsService).service).toEqual('service');
          });

          it("should prioritize viewInjector over hostInjector for the same binding", () => {
            var inj = injector(
                ListWrapper.concat([DirectiveBinding.createFromType(NeedsService, new dirAnn.Component({
                      hostInjector: [bind('service').toValue('hostService')],
                      viewInjector: [bind('service').toValue('viewService')]})
                    )], extraBindings), null, true);
            expect(inj.get(NeedsService).service).toEqual('viewService');
          });

          it("should instantiate a directive in a view that depends on hostInjector bindings of the component", () => {
            var shadowInj = hostShadowInjectors(
                ListWrapper.concat([DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Component({
                      hostInjector: [bind('service').toValue('hostService')]})
                    )], extraBindings),
                ListWrapper.concat([NeedsService], extraBindings)
            );
            expect(shadowInj.get(NeedsService).service).toEqual('hostService');
          });

          it("should not instantiate a directive in a view that depends on hostInjector bindings of a decorator directive", () => {
            expect(() => {
              hostShadowInjectors(
                ListWrapper.concat([
                  SimpleDirective,
                  DirectiveBinding.createFromType(SomeOtherDirective, new dirAnn.Directive({
                      hostInjector: [bind('service').toValue('hostService')]})
                  )], extraBindings),

                ListWrapper.concat([NeedsService], extraBindings)
              );
            }).toThrowError(new RegExp("No provider for service!"));
          });

          it("should instantiate directives that depend on app services", () => {
            var appInjector = Injector.resolveAndCreate(
                ListWrapper.concat([bind("service").toValue("service")], extraBindings));
            var inj = injector([NeedsService], appInjector);

            var d = inj.get(NeedsService);
            expect(d).toBeAnInstanceOf(NeedsService);
            expect(d.service).toEqual("service");
          });

          it("should instantiate directives that depend on pre built objects", () => {
            var protoView = new AppProtoView(null, null, null);
            var bindings = ListWrapper.concat([NeedsProtoViewRef], extraBindings);
            var inj = injector(bindings, null, false, new PreBuiltObjects(null, null, protoView));

            expect(inj.get(NeedsProtoViewRef).protoViewRef).toEqual(new ProtoViewRef(protoView));
          });

          it("should return app services", () => {
            var appInjector = Injector.resolveAndCreate(
                ListWrapper.concat([bind("service").toValue("service")], extraBindings));
            var inj = injector([], appInjector);

            expect(inj.get('service')).toEqual('service');
          });

          it("should get directives from parent", () => {
            var child = parentChildInjectors(ListWrapper.concat([SimpleDirective], extraBindings),
                                             [NeedsDirectiveFromParent]);

            var d = child.get(NeedsDirectiveFromParent);

            expect(d).toBeAnInstanceOf(NeedsDirectiveFromParent);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should not return parent's directives on self by default", () => {
            expect(() => {
              injector(ListWrapper.concat([SimpleDirective, NeedsDirectiveFromParent], extraBindings));
            }).toThrowError(containsRegexp(`No provider for ${stringify(SimpleDirective) }`));
          });

          it("should return parent's directives on self when explicitly specified", () => {
            var inj = injector(ListWrapper.concat([SimpleDirective, NeedsDirectiveFromParentOrSelf], extraBindings));

            var d = inj.get(NeedsDirectiveFromParentOrSelf);

            expect(d).toBeAnInstanceOf(NeedsDirectiveFromParentOrSelf);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should get directives from ancestor", () => {
            var child = parentChildInjectors(ListWrapper.concat([SimpleDirective], extraBindings),
                                             [NeedsDirectiveFromAncestor]);

            var d = child.get(NeedsDirectiveFromAncestor);

            expect(d).toBeAnInstanceOf(NeedsDirectiveFromAncestor);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should get directives crossing the boundaries", () => {
            var child = hostShadowInjectors(
                ListWrapper.concat([SomeOtherDirective, SimpleDirective], extraBindings),
                [NeedsDirectiveFromAnAncestorShadowDom]);

            var d = child.get(NeedsDirectiveFromAnAncestorShadowDom);

            expect(d).toBeAnInstanceOf(NeedsDirectiveFromAnAncestorShadowDom);
            expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should throw when a dependency cannot be resolved", () => {
            expect(() => injector(ListWrapper.concat([NeedsDirectiveFromParent], extraBindings)))
                .toThrowError(containsRegexp(
                    `No provider for ${stringify(SimpleDirective) }! (${stringify(NeedsDirectiveFromParent) } -> ${stringify(SimpleDirective) })`));
          });

          it("should inject null when an optional dependency cannot be resolved", () => {
            var inj = injector(ListWrapper.concat([OptionallyNeedsDirective], extraBindings));
            var d = inj.get(OptionallyNeedsDirective);
            expect(d.dependency).toEqual(null);
          });

          it("should accept bindings instead types", () => {
            var inj = injector(
                ListWrapper.concat([bind(SimpleDirective).toClass(SimpleDirective)], extraBindings));
            expect(inj.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
          });

          it("should allow for direct access using getDirectiveAtIndex", () => {
            var bindings =
                ListWrapper.concat([bind(SimpleDirective).toClass(SimpleDirective)], extraBindings);

            var inj = injector(bindings);

            var firsIndexOut = bindings.length > 10 ? bindings.length : 10;

            expect(inj.getDirectiveAtIndex(0)).toBeAnInstanceOf(SimpleDirective);
            expect(() => inj.getDirectiveAtIndex(-1)).toThrowError('Index -1 is out-of-bounds.');
            expect(() => inj.getDirectiveAtIndex(firsIndexOut))
                .toThrowError(`Index ${firsIndexOut} is out-of-bounds.`);
          });


          describe("shadow DOM components", () => {
            it("should instantiate directives that depend on the containing component", () => {
              var directiveBinding =
                  DirectiveBinding.createFromType(SimpleDirective, new dirAnn.Component());
              var shadow = hostShadowInjectors(ListWrapper.concat([directiveBinding], extraBindings),
                                               [NeedsDirective]);

              var d = shadow.get(NeedsDirective);
              expect(d).toBeAnInstanceOf(NeedsDirective);
              expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
            });

            it("should not instantiate directives that depend on other directives in the containing component's ElementInjector",
               () => {
                 var directiveBinding =
                     DirectiveBinding.createFromType(SomeOtherDirective, new dirAnn.Component());
                 expect(() =>
                        {
                          hostShadowInjectors(
                              ListWrapper.concat([directiveBinding, SimpleDirective], extraBindings),
                              [NeedsDirective]);
                        })
                     .toThrowError(containsRegexp(
                         `No provider for ${stringify(SimpleDirective) }! (${stringify(NeedsDirective) } -> ${stringify(SimpleDirective) })`));
               });

            it("should instantiate component directives that depend on app services in the shadow app injector",
               () => {
                 var directiveAnnotation = new dirAnn.Component({
                   appInjector: ListWrapper.concat([bind("service").toValue("service")], extraBindings)
                 });
                 var componentDirective =
                     DirectiveBinding.createFromType(NeedsService, directiveAnnotation);
                 var inj = injector([componentDirective], null, true);

                 var d = inj.get(NeedsService);
                 expect(d).toBeAnInstanceOf(NeedsService);
                 expect(d.service).toEqual("service");
               });

            it("should not instantiate other directives that depend on app services in the shadow app injector",
               () => {
                 var directiveAnnotation = new dirAnn.Component({
                   appInjector: ListWrapper.concat([bind("service").toValue("service")], extraBindings)
                 });
                 var componentDirective =
                     DirectiveBinding.createFromType(SimpleDirective, directiveAnnotation);
                 expect(() => { injector([componentDirective, NeedsService], null); })
                     .toThrowError(containsRegexp(
                         `No provider for service! (${stringify(NeedsService) } -> service)`));
               });
          });
        });

        describe("lifecycle", () => {
          it("should call onDestroy on directives subscribed to this event", () => {
            var inj = injector(ListWrapper.concat(
                [DirectiveBinding.createFromType(DirectiveWithDestroy,
                                                 new dirAnn.Directive({lifecycle: [onDestroy]}))],
                extraBindings));
            var destroy = inj.get(DirectiveWithDestroy);
            inj.dehydrate();
            expect(destroy.onDestroyCounter).toBe(1);
          });

          it("should work with services", () => {
            var inj = injector(ListWrapper.concat(
                [DirectiveBinding.createFromType(
                    SimpleDirective, new dirAnn.Directive({hostInjector: [SimpleService]}))],
                extraBindings));
            inj.dehydrate();
          });

          it("should notify queries", inject([AsyncTestCompleter], (async) => {
            var inj = injector(ListWrapper.concat([NeedsQuery], extraBindings));
            var query = inj.get(NeedsQuery).query;
            query.add(new CountingDirective()); // this marks the query as dirty

            query.onChange(() => async.done());

            inj.onAllChangesDone();
          }));

          it("should not notify inherited queries", inject([AsyncTestCompleter], (async) => {
            var child = parentChildInjectors(ListWrapper.concat([NeedsQuery], extraBindings), []);

            var query = child.parent.get(NeedsQuery).query;

            var calledOnChange = false;
            query.onChange(() => {
              // make sure the callback is called only once
              expect(calledOnChange).toEqual(false);
              expect(query.length).toEqual(2);

              calledOnChange = true;
              async.done()
            });

            query.add(new CountingDirective());
            child.onAllChangesDone(); // this does not notify the query

            query.add(new CountingDirective());
            child.parent.onAllChangesDone();
          }));
        });

        describe("dynamicallyCreateComponent", () => {
          it("should create a component dynamically", () => {
            var inj = injector(extraBindings);

            inj.dynamicallyCreateComponent(DirectiveBinding.createFromType(SimpleDirective, null),
                                           appInjector);
            expect(inj.getDynamicallyLoadedComponent()).toBeAnInstanceOf(SimpleDirective);
            expect(inj.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
          });

          it("should inject parent dependencies into the dynamically-loaded component", () => {
            var inj = parentChildInjectors(ListWrapper.concat([SimpleDirective], extraBindings), []);
            inj.dynamicallyCreateComponent(
                DirectiveBinding.createFromType(NeedsDirectiveFromAncestor, null), appInjector);
            expect(inj.getDynamicallyLoadedComponent()).toBeAnInstanceOf(NeedsDirectiveFromAncestor);
            expect(inj.getDynamicallyLoadedComponent().dependency).toBeAnInstanceOf(SimpleDirective);
          });

          it("should not inject the proxy component into the children of the dynamically-loaded component",
             () => {
               var injWithDynamicallyLoadedComponent = injector([SimpleDirective]);
               injWithDynamicallyLoadedComponent.dynamicallyCreateComponent(
                   DirectiveBinding.createFromType(SomeOtherDirective, null), appInjector);

               var shadowDomProtoInjector =
                   createPei(null, 0, ListWrapper.concat([NeedsDirectiveFromAncestor], extraBindings));
               var shadowDomInj = shadowDomProtoInjector.instantiate(null);

               expect(() => shadowDomInj.hydrate(appInjector, injWithDynamicallyLoadedComponent,
                                                 defaultPreBuiltObjects))
                   .toThrowError(containsRegexp(`No provider for ${stringify(SimpleDirective) }`));
             });

          it("should not inject the dynamically-loaded component into directives on the same element",
             () => {
               var dynamicComp =
                   DirectiveBinding.createFromType(SomeOtherDirective, new dirAnn.Component());
               var proto = createPei(
                   null, 0, ListWrapper.concat([dynamicComp, NeedsDirective], extraBindings), 1, true);
               var inj = proto.instantiate(null);
               inj.dynamicallyCreateComponent(DirectiveBinding.createFromType(SimpleDirective, null),
                                              appInjector);

               expect(() => inj.hydrate(Injector.resolveAndCreate([]), null, null))
                   .toThrowError(
                       `No provider for SimpleDirective! (${stringify(NeedsDirective) } -> ${stringify(SimpleDirective) })`);
             });

          it("should inject the dynamically-loaded component into the children of the dynamically-loaded component",
             () => {
               var componentDirective = DirectiveBinding.createFromType(SimpleDirective, null);
               var injWithDynamicallyLoadedComponent = injector([]);
               injWithDynamicallyLoadedComponent.dynamicallyCreateComponent(componentDirective,
                                                                            appInjector);

               var shadowDomProtoInjector =
                   createPei(null, 0, ListWrapper.concat([NeedsDirectiveFromAncestor], extraBindings));
               var shadowDomInjector = shadowDomProtoInjector.instantiate(null);
               shadowDomInjector.hydrate(appInjector, injWithDynamicallyLoadedComponent,
                                         defaultPreBuiltObjects);

               expect(shadowDomInjector.get(NeedsDirectiveFromAncestor))
                   .toBeAnInstanceOf(NeedsDirectiveFromAncestor);
               expect(shadowDomInjector.get(NeedsDirectiveFromAncestor).dependency)
                   .toBeAnInstanceOf(SimpleDirective);
             });

          it("should remove the dynamically-loaded component when dehydrating", () => {
            var inj = injector(extraBindings);
            inj.dynamicallyCreateComponent(
                DirectiveBinding.createFromType(DirectiveWithDestroy,
                                                new dirAnn.Directive({lifecycle: [onDestroy]})),
                appInjector);
            var dir = inj.getDynamicallyLoadedComponent();

            inj.dehydrate();

            expect(inj.getDynamicallyLoadedComponent()).toBe(null);
            expect(dir.onDestroyCounter).toBe(1);

            inj.hydrate(null, null, null);

            expect(inj.getDynamicallyLoadedComponent()).toBe(null);
          });

          it("should inject services of the dynamically-loaded component", () => {
            var inj = injector(extraBindings);
            var appInjector = Injector.resolveAndCreate([bind("service").toValue("Service")]);
            inj.dynamicallyCreateComponent(DirectiveBinding.createFromType(NeedsService, null),
                                           appInjector);
            expect(inj.getDynamicallyLoadedComponent().service).toEqual("Service");
          });
        });

        describe('static attributes', () => {
          it('should be injectable', () => {
            var attributes = MapWrapper.create();
            MapWrapper.set(attributes, 'type', 'text');
            MapWrapper.set(attributes, 'title', '');

            var inj = injector(ListWrapper.concat([NeedsAttribute], extraBindings), null, false, null,
                               attributes);
            var needsAttribute = inj.get(NeedsAttribute);

            expect(needsAttribute.typeAttribute).toEqual('text');
            expect(needsAttribute.titleAttribute).toEqual('');
            expect(needsAttribute.fooAttribute).toEqual(null);
          });

          it('should be injectable without type annotation', () => {
            var attributes = MapWrapper.create();
            MapWrapper.set(attributes, 'foo', 'bar');

            var inj = injector(ListWrapper.concat([NeedsAttributeNoType], extraBindings), null, false,
                               null, attributes);
            var needsAttribute = inj.get(NeedsAttributeNoType);

            expect(needsAttribute.fooAttribute).toEqual('bar');
          });
        });

        describe("refs", () => {
          it("should inject ElementRef", () => {
            var inj = injector(ListWrapper.concat([NeedsElementRef], extraBindings));
            expect(inj.get(NeedsElementRef).elementRef).toBeAnInstanceOf(ElementRef);
          });

          it('should inject ChangeDetectorRef', () => {
            var cd = new DynamicChangeDetector(null, null, null, [], []);
            var view = <any>new DummyView();
            var childView = new DummyView();
            childView.changeDetector = cd;
            view.componentChildViews = [childView];
            var inj = injector(ListWrapper.concat([NeedsChangeDetectorRef], extraBindings), null, false,
                               new PreBuiltObjects(null, view, null));

            expect(inj.get(NeedsChangeDetectorRef).changeDetectorRef).toBe(cd.ref);
          });

          it('should inject ViewContainerRef', () => {
            var inj = injector(ListWrapper.concat([NeedsViewContainer], extraBindings));
            expect(inj.get(NeedsViewContainer).viewContainer).toBeAnInstanceOf(ViewContainerRef);
          });

          it("should inject ProtoViewRef", () => {
            var protoView = new AppProtoView(null, null, null);
            var inj = injector(ListWrapper.concat([NeedsProtoViewRef], extraBindings), null, false,
                               new PreBuiltObjects(null, null, protoView));

            expect(inj.get(NeedsProtoViewRef).protoViewRef).toEqual(new ProtoViewRef(protoView));
          });

          it("should throw if there is no ProtoViewRef", () => {
            expect(() => injector(ListWrapper.concat([NeedsProtoViewRef], extraBindings)))
                .toThrowError(
                    `No provider for ProtoViewRef! (${stringify(NeedsProtoViewRef) } -> ProtoViewRef)`);
          });

          it('should inject null if there is no ProtoViewRef when the dependency is optional', () => {
            var inj = injector(ListWrapper.concat([OptionallyInjectsProtoViewRef], extraBindings));
            var instance = inj.get(OptionallyInjectsProtoViewRef);
            expect(instance.protoViewRef).toBeNull();
          });
        });

        describe('directive queries', () => {
          var preBuildObjects = defaultPreBuiltObjects;
          beforeEach(() => { _constructionCount = 0; });

          function expectDirectives(query, type, expectedIndex) {
            var currentCount = 0;
            iterateListLike(query, (i) => {
              expect(i).toBeAnInstanceOf(type);
              expect(i.count).toBe(expectedIndex[currentCount]);
              currentCount += 1;
            });
          }

          it('should be injectable', () => {
            var inj =
                injector(ListWrapper.concat([NeedsQuery], extraBindings), null, false, preBuildObjects);
            expect(inj.get(NeedsQuery).query).toBeAnInstanceOf(QueryList);
          });

          it('should contain directives on the same injector', () => {
            var inj = injector(ListWrapper.concat([NeedsQuery, CountingDirective], extraBindings), null,
                               false, preBuildObjects);

            expectDirectives(inj.get(NeedsQuery).query, CountingDirective, [0]);
          });

          // Dart's restriction on static types in (a is A) makes this feature hard to implement.
          // Current proposal is to add second parameter the Query constructor to take a
          // comparison function to support user-defined definition of matching.

          //it('should support super class directives', () => {
          //  var inj = injector([NeedsQuery, FancyCountingDirective], null, null, preBuildObjects);
          //
          //  expectDirectives(inj.get(NeedsQuery).query, FancyCountingDirective, [0]);
          //});

          it('should contain directives on the same and a child injector in construction order', () => {
            var protoParent = createPei(null, 0, [NeedsQuery, CountingDirective]);
            var protoChild =
                createPei(protoParent, 1, ListWrapper.concat([CountingDirective], extraBindings));

            var parent = protoParent.instantiate(null);
            var child = protoChild.instantiate(parent);
            parent.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);

            expectDirectives(parent.get(NeedsQuery).query, CountingDirective, [0, 1]);
          });

          it('should reflect unlinking an injector', () => {
            var protoParent = createPei(null, 0, [NeedsQuery, CountingDirective]);
            var protoChild =
                createPei(protoParent, 1, ListWrapper.concat([CountingDirective], extraBindings));

            var parent = protoParent.instantiate(null);
            var child = protoChild.instantiate(parent);
            parent.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);

            child.unlink();

            expectDirectives(parent.get(NeedsQuery).query, CountingDirective, [0]);
          });

          it('should reflect moving an injector as a last child', () => {
            var protoParent = createPei(null, 0, [NeedsQuery, CountingDirective]);
            var protoChild1 = createPei(protoParent, 1, [CountingDirective]);
            var protoChild2 =
                createPei(protoParent, 1, ListWrapper.concat([CountingDirective], extraBindings));

            var parent = protoParent.instantiate(null);
            var child1 = protoChild1.instantiate(parent);
            var child2 = protoChild2.instantiate(parent);

            parent.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child1.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child2.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);

            child1.unlink();
            child1.link(parent);

            var queryList = parent.get(NeedsQuery).query;
            expectDirectives(queryList, CountingDirective, [0, 2, 1]);
          });

          it('should reflect moving an injector as a first child', () => {
            var protoParent = createPei(null, 0, [NeedsQuery, CountingDirective]);
            var protoChild1 = createPei(protoParent, 1, [CountingDirective]);
            var protoChild2 =
                createPei(protoParent, 1, ListWrapper.concat([CountingDirective], extraBindings));

            var parent = protoParent.instantiate(null);
            var child1 = protoChild1.instantiate(parent);
            var child2 = protoChild2.instantiate(parent);

            parent.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child1.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child2.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);

            child2.unlink();
            child2.linkAfter(parent, null);

            var queryList = parent.get(NeedsQuery).query;
            expectDirectives(queryList, CountingDirective, [0, 2, 1]);
          });

          it('should support two concurrent queries for the same directive', () => {
            var protoGrandParent = createPei(null, 0, [NeedsQuery]);
            var protoParent = createPei(null, 0, [NeedsQuery]);
            var protoChild =
                createPei(protoParent, 1, ListWrapper.concat([CountingDirective], extraBindings));

            var grandParent = protoGrandParent.instantiate(null);
            var parent = protoParent.instantiate(grandParent);
            var child = protoChild.instantiate(parent);

            grandParent.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            parent.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);
            child.hydrate(Injector.resolveAndCreate([]), null, preBuildObjects);

            var queryList1 = grandParent.get(NeedsQuery).query;
            var queryList2 = parent.get(NeedsQuery).query;

            expectDirectives(queryList1, CountingDirective, [0]);
            expectDirectives(queryList2, CountingDirective, [0]);

            child.unlink();
            expectDirectives(queryList1, CountingDirective, []);
            expectDirectives(queryList2, CountingDirective, []);
          });
        });
      });
    });
  });
}

class ContextWithHandler {
  handler;
  constructor(handler) { this.handler = handler; }
}

class FakeRenderer extends Renderer {
  log: List<List<any>>;
  constructor() {
    super();
    this.log = [];
  }
  setElementProperty(viewRef, elementIndex, propertyName, value) {
    ListWrapper.push(this.log, [viewRef, elementIndex, propertyName, value]);
  }
}
