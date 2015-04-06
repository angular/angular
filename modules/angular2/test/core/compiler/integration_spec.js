import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit
} from 'angular2/test_lib';

import {TestBed} from 'angular2/src/test_lib/test_bed';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {Type, isPresent, BaseException, assertionsEnabled, isJsObject} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {Injector, bind} from 'angular2/di';
import {dynamicChangeDetection,
  ChangeDetection, DynamicChangeDetection, Pipe, PipeRegistry, BindingPropagationConfig, ON_PUSH} from 'angular2/change_detection';

import {Decorator, Component, Viewport, DynamicComponent} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';
import {Parent, Ancestor} from 'angular2/src/core/annotations/visibility';
import {EventEmitter, Attribute} from 'angular2/src/core/annotations/di';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {DirectiveRef} from 'angular2/src/core/compiler/element_injector';

import {If} from 'angular2/src/directives/if';

import {ViewContainer} from 'angular2/src/core/compiler/view_container';

export function main() {
  describe('integration tests', function() {
    var ctx;

    beforeEach( () => {
      ctx = new MyComp();
    });

    describe('react to record changes', function() {
      it('should consume text node changes', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<div>{{ctxProp}}</div>'}));
        tb.createView(MyComp, {context: ctx}).then((view) => {
          ctx.ctxProp = 'Hello World!';

          view.detectChanges();
          expect(DOM.getInnerHTML(view.rootNodes[0])).toEqual('Hello World!');
          async.done();
        });
      }));

      it('should consume element binding changes', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<div [id]="ctxProp"></div>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'Hello World!';
          view.detectChanges();

          expect(view.rootNodes[0].id).toEqual('Hello World!');
          async.done();
        });
      }));

      it('should consume binding to aria-* attributes', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<div [attr.aria-label]="ctxProp"></div>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'Initial aria label';
          view.detectChanges();
          expect(DOM.getAttribute(view.rootNodes[0], 'aria-label')).toEqual('Initial aria label');

          ctx.ctxProp = 'Changed aria label';
          view.detectChanges();
          expect(DOM.getAttribute(view.rootNodes[0], 'aria-label')).toEqual('Changed aria label');

          async.done();
        });
      }));

      it('should consume binding to property names where attr name and property name do not match', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<div [tabindex]="ctxNumProp"></div>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          view.detectChanges();
          expect(view.rootNodes[0].tabIndex).toEqual(0);

          ctx.ctxNumProp = 5;
          view.detectChanges();
          expect(view.rootNodes[0].tabIndex).toEqual(5);

          async.done();
        });
      }));

      it('should consume binding to camel-cased properties using dash-cased syntax in templates', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<input [read-only]="ctxBoolProp">'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          view.detectChanges();
          expect(view.rootNodes[0].readOnly).toBeFalsy();

          ctx.ctxBoolProp = true;
          view.detectChanges();
          expect(view.rootNodes[0].readOnly).toBeTruthy();

          async.done();
        });
      }));

      it('should consume binding to inner-html', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<div inner-html="{{ctxProp}}"></div>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'Some <span>HTML</span>';
          view.detectChanges();
          expect(DOM.getInnerHTML(view.rootNodes[0])).toEqual('Some <span>HTML</span>');

          ctx.ctxProp = 'Some other <div>HTML</div>';
          view.detectChanges();
          expect(DOM.getInnerHTML(view.rootNodes[0])).toEqual('Some other <div>HTML</div>');

          async.done();
        });
      }));

      it('should ignore bindings to unknown properties', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({inline: '<div unknown="{{ctxProp}}"></div>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'Some value';
          view.detectChanges();
          expect(DOM.hasProperty(view.rootNodes[0], 'unknown')).toBeFalsy();

          async.done();
        });
      }));

      it('should consume directive watch expression change.', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var tpl =
          '<div>' +
            '<div my-dir [elprop]="ctxProp"></div>' +
            '<div my-dir elprop="Hi there!"></div>' +
            '<div my-dir elprop="Hi {{\'there!\'}}"></div>' +
            '<div my-dir elprop="One more {{ctxProp}}"></div>' +
          '</div>'
        tb.overrideTemplate(MyComp, new Template({inline: tpl, directives: [MyDir]}));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'Hello World!';
          view.detectChanges();

          expect(view.rawView.elementInjectors[0].get(MyDir).dirProp).toEqual('Hello World!');
          expect(view.rawView.elementInjectors[1].get(MyDir).dirProp).toEqual('Hi there!');
          expect(view.rawView.elementInjectors[2].get(MyDir).dirProp).toEqual('Hi there!');
          expect(view.rawView.elementInjectors[3].get(MyDir).dirProp).toEqual('One more Hello World!');
          async.done();
        });
      }));

      describe('pipes', () => {
        beforeEachBindings(() => {
          return [bind(ChangeDetection).toFactory(
            () => new DynamicChangeDetection(new PipeRegistry({
                "double" : [new DoublePipeFactory()]
              })),
            []
          )];
        });

        it("should support pipes in bindings and bind config", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          tb.overrideTemplate(MyComp,
            new Template({
              inline: '<component-with-pipes #comp [prop]="ctxProp | double"></component-with-pipes>',
              directives: [ComponentWithPipes]
            }));

          tb.createView(MyComp, {context: ctx}).then((view) => {

            ctx.ctxProp = 'a';
            view.detectChanges();

            var comp = view.rawView.locals.get("comp");

            // it is doubled twice: once in the binding, second time in the bind config
            expect(comp.prop).toEqual('aaaa');
            async.done();
          });
        }));
      });

      it('should support nested components.', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<child-cmp></child-cmp>',
          directives: [ChildComp]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          view.detectChanges();

          expect(view.rootNodes).toHaveText('hello');
          async.done();
        });
      }));

      // GH issue 328 - https://github.com/angular/angular/issues/328
      it('should support different directive types on a single node', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp,
          new Template({
            inline: '<child-cmp my-dir [elprop]="ctxProp"></child-cmp>',
            directives: [MyDir, ChildComp]
          }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'Hello World!';
          view.detectChanges();

          var elInj = view.rawView.elementInjectors[0];
          expect(elInj.get(MyDir).dirProp).toEqual('Hello World!');
          expect(elInj.get(ChildComp).dirProp).toEqual(null);

          async.done();
        });
      }));

      it('should support directives where a binding attribute is not given', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp,
          new Template({
            // No attribute "el-prop" specified.
            inline: '<p my-dir></p>',
            directives: [MyDir]
          }));

        tb.createView(MyComp, {context: ctx}).then((view) => {
          async.done();
        });
      }));

      it('should support directives where a selector matches property binding', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp,
          new Template({
            inline: '<p [id]="ctxProp"></p>',
            directives: [IdComponent]
          }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          ctx.ctxProp = 'some_id';
          view.detectChanges();
          expect(view.rootNodes[0].id).toEqual('some_id');
          expect(view.rootNodes).toHaveText('Matched on id with some_id');

          ctx.ctxProp = 'other_id';
          view.detectChanges();
          expect(view.rootNodes[0].id).toEqual('other_id');
          expect(view.rootNodes).toHaveText('Matched on id with other_id');

          async.done();
        });
      }));

      it('should support template directives via `<template>` elements.', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp,
          new Template({
            inline: '<div><template some-viewport var-greeting="some-tmpl"><copy-me>{{greeting}}</copy-me></template></div>',
            directives: [SomeViewport]
          }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          view.detectChanges();

          var childNodesOfWrapper = view.rootNodes[0].childNodes;
          // 1 template + 2 copies.
          expect(childNodesOfWrapper.length).toBe(3);
          expect(childNodesOfWrapper[1].childNodes[0].nodeValue).toEqual('hello');
          expect(childNodesOfWrapper[2].childNodes[0].nodeValue).toEqual('again');
          async.done();
        });
      }));

      it('should support template directives via `template` attribute.', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<div><copy-me template="some-viewport: var greeting=some-tmpl">{{greeting}}</copy-me></div>',
          directives: [SomeViewport]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          view.detectChanges();

          var childNodesOfWrapper = view.rootNodes[0].childNodes;
          // 1 template + 2 copies.
          expect(childNodesOfWrapper.length).toBe(3);
          expect(childNodesOfWrapper[1].childNodes[0].nodeValue).toEqual('hello');
          expect(childNodesOfWrapper[2].childNodes[0].nodeValue).toEqual('again');
          async.done();
        });
      }));

      it('should assign the component instance to a var-', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<p><child-cmp var-alice></child-cmp></p>',
          directives: [ChildComp]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          expect(view.rawView.locals).not.toBe(null);
          expect(view.rawView.locals.get('alice')).toBeAnInstanceOf(ChildComp);

          async.done();
        })
      }));

      it('should assign two component instances each with a var-', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<p><child-cmp var-alice></child-cmp><child-cmp var-bob></p>',
          directives: [ChildComp]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          expect(view.rawView.locals).not.toBe(null);
          expect(view.rawView.locals.get('alice')).toBeAnInstanceOf(ChildComp);
          expect(view.rawView.locals.get('bob')).toBeAnInstanceOf(ChildComp);
          expect(view.rawView.locals.get('alice')).not.toBe(view.rawView.locals.get('bob'));

          async.done();
        })
      }));

      it('should assign the component instance to a var- with shorthand syntax', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<child-cmp #alice></child-cmp>',
          directives: [ChildComp]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          expect(view.rawView.locals).not.toBe(null);
          expect(view.rawView.locals.get('alice')).toBeAnInstanceOf(ChildComp);

          async.done();
        })
      }));

      it('should assign the element instance to a user-defined variable', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp,
          new Template({inline: '<p><div var-alice><i>Hello</i></div></p>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {
          expect(view.rawView.locals).not.toBe(null);

          var value = view.rawView.locals.get('alice');
          expect(value).not.toBe(null);
          expect(value.domElement.tagName.toLowerCase()).toEqual('div');

          async.done();
        })
      }));


      it('should assign the element instance to a user-defined variable with camelCase using dash-case', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp,
          new Template({inline: '<p><div var-super-alice><i>Hello</i></div></p>'}));

        tb.createView(MyComp, {context: ctx}).then((view) => {
          expect(view.rawView.locals).not.toBe(null);

          var value = view.rawView.locals.get('superAlice');
          expect(value).not.toBe(null);
          expect(value.domElement.tagName.toLowerCase()).toEqual('div');

          async.done();
        })
      }));

      describe("BindingPropagationConfig", () => {
        it("can be used to disable the change detection of the component's template",
          inject([TestBed, AsyncTestCompleter], (tb, async) => {

          tb.overrideTemplate(MyComp, new Template({
            inline: '<push-cmp #cmp></push-cmp>',
            directives: [[[PushBasedComp]]]
          }));

          tb.createView(MyComp, {context: ctx}).then((view) => {

            var cmp = view.rawView.locals.get('cmp');

            view.detectChanges();
            expect(cmp.numberOfChecks).toEqual(1);

            view.detectChanges();
            expect(cmp.numberOfChecks).toEqual(1);

            cmp.propagate();

            view.detectChanges();
            expect(cmp.numberOfChecks).toEqual(2);
            async.done();
          })
        }));

        it('should not affect updating properties on the component', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          tb.overrideTemplate(MyComp, new Template({
            inline: '<push-cmp [prop]="ctxProp" #cmp></push-cmp>',
            directives: [[[PushBasedComp]]]
          }));

          tb.createView(MyComp, {context: ctx}).then((view) => {

            var cmp = view.rawView.locals.get('cmp');

            ctx.ctxProp = "one";
            view.detectChanges();
            expect(cmp.prop).toEqual("one");

            ctx.ctxProp = "two";
            view.detectChanges();
            expect(cmp.prop).toEqual("two");

            async.done();
          })
        }));
      });

      it('should create a component that injects a @Parent', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<some-directive><cmp-with-parent #child></cmp-with-parent></some-directive>',
          directives: [SomeDirective, CompWithParent]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          var childComponent = view.rawView.locals.get('child');
          expect(childComponent.myParent).toBeAnInstanceOf(SomeDirective);

          async.done();
        })
      }));

      it('should create a component that injects an @Ancestor', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: `
            <some-directive>
              <p>
                <cmp-with-ancestor #child></cmp-with-ancestor>
              </p>
            </some-directive>`,
          directives: [SomeDirective, CompWithAncestor]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          var childComponent = view.rawView.locals.get('child');
          expect(childComponent.myAncestor).toBeAnInstanceOf(SomeDirective);

          async.done();
        })
      }));

      it('should create a component that injects an @Ancestor through viewport directive', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: `
            <some-directive>
              <p *if="true">
                <cmp-with-ancestor #child></cmp-with-ancestor>
              </p>
            </some-directive>`,
          directives: [SomeDirective, CompWithAncestor, If]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {
          view.detectChanges();

          var subview = view.rawView.viewContainers[1].get(0);
          var childComponent = subview.locals.get('child');
          expect(childComponent.myAncestor).toBeAnInstanceOf(SomeDirective);

          async.done();
        });
      }));

      it('should support events via EventEmitter', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<div emitter listener></div>',
          directives: [DecoratorEmitingEvent, DecoratorListeningEvent]
        }));

        tb.createView(MyComp, {context: ctx}).then((view) => {

          var injector = view.rawView.elementInjectors[0];

          var emitter = injector.get(DecoratorEmitingEvent);
          var listener = injector.get(DecoratorListeningEvent);

          expect(emitter.msg).toEqual('');
          expect(listener.msg).toEqual('');

          emitter.fireEvent('fired !');
          expect(emitter.msg).toEqual('fired !');
          expect(listener.msg).toEqual('fired !');

          async.done();
        });
      }));

      if (DOM.supportsDOMEvents()) {
        it('should support render events', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          tb.overrideTemplate(MyComp, new Template({
            inline: '<div listener></div>',
            directives: [DecoratorListeningDomEvent]
          }));

          tb.createView(MyComp, {context: ctx}).then((view) => {

            var injector = view.rawView.elementInjectors[0];

            var listener = injector.get(DecoratorListeningDomEvent);

            dispatchEvent(view.rootNodes[0], 'domEvent');

            expect(listener.eventType).toEqual('domEvent');

            async.done();
          });
        }));
      }

      describe("dynamic components", () => {
        it('should support loading components dynamically', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          tb.overrideTemplate(MyComp, new Template({
            inline: '<dynamic-comp #dynamic></dynamic-comp>',
            directives: [DynamicComp]
          }));

          tb.createView(MyComp).then((view) => {
            var dynamicComponent = view.rawView.locals.get("dynamic");
            expect(dynamicComponent).toBeAnInstanceOf(DynamicComp);

            dynamicComponent.done.then((_) => {
              view.detectChanges();
              expect(view.rootNodes).toHaveText('hello');
              async.done();
            });
          });
        }));

        it('should inject dependencies of the dynamically-loaded component', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          tb.overrideTemplate(MyComp, new Template({
            inline: '<dynamic-comp #dynamic></dynamic-comp>',
            directives: [DynamicComp]
          }));

          tb.createView(MyComp).then((view) => {
            var dynamicComponent = view.rawView.locals.get("dynamic");
            dynamicComponent.done.then((ref) => {
              expect(ref.instance.dynamicallyCreatedComponentService).toBeAnInstanceOf(DynamicallyCreatedComponentService);
              async.done();
            });
          });
        }));
      });

      it('should support static attributes', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideTemplate(MyComp, new Template({
          inline: '<input static type="text" title></input>',
          directives: [NeedsAttribute]
        }));
        tb.createView(MyComp, {context: ctx}).then((view) => {
          var injector = view.rawView.elementInjectors[0];
          var needsAttribute = injector.get(NeedsAttribute);
          expect(needsAttribute.typeAttribute).toEqual('text');
          expect(needsAttribute.titleAttribute).toEqual('');
          expect(needsAttribute.fooAttribute).toEqual(null);

          async.done();
        });
      }));


    });

    // Disabled until a solution is found, refs:
    // - https://github.com/angular/angular/issues/776
    // - https://github.com/angular/angular/commit/81f3f32
    xdescribe('Missing directive checks', () => {

      if (assertionsEnabled()) {

        function expectCompileError(tb, inlineTpl, errMessage, done) {
          tb.overrideTemplate(MyComp, new Template({inline: inlineTpl}));
          PromiseWrapper.then(tb.createView(MyComp),
            (value) => {
              throw new BaseException("Test failure: should not have come here as an exception was expected");
            },
            (err) => {
              expect(err.message).toEqual(errMessage);
              done();
            }
          );
        }

        it('should raise an error if no directive is registered for a template with template bindings', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          expectCompileError(
            tb,
            '<div><div template="if: foo"></div></div>',
            'Missing directive to handle \'if\' in <div template="if: foo">',
            () => async.done()
          );
        }));

        it('should raise an error for missing template directive (1)', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          expectCompileError(
            tb,
            '<div><template foo></template></div>',
            'Missing directive to handle: <template foo>',
            () => async.done()
          );
        }));

        it('should raise an error for missing template directive (2)', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          expectCompileError(
            tb,
            '<div><template *if="condition"></template></div>',
            'Missing directive to handle: <template *if="condition">',
            () => async.done()
          );
        }));

        it('should raise an error for missing template directive (3)', inject([TestBed, AsyncTestCompleter], (tb, async) => {
          expectCompileError(
            tb,
            '<div *if="condition"></div>',
            'Missing directive to handle \'if\' in MyComp: <div *if="condition">',
            () => async.done()
          );
        }));
      }
    });

  });
}

class DynamicallyCreatedComponentService {
}

@DynamicComponent({
  selector: 'dynamic-comp'
})
class DynamicComp {
  done;
  constructor(loader:DynamicComponentLoader, self:DirectiveRef) {
    this.done = loader.loadIntoExistingLocation(DynamicallyCreatedCmp, self);
  }
}

@Component({
  selector: 'hello-cmp',
  services: [DynamicallyCreatedComponentService]
})
@Template({
  inline: "{{greeting}}"
})
class DynamicallyCreatedCmp {
  greeting:string;
  dynamicallyCreatedComponentService:DynamicallyCreatedComponentService;
  constructor(a:DynamicallyCreatedComponentService) {
    this.greeting = "hello";
    this.dynamicallyCreatedComponentService = a;
  }
}

@Decorator({
  selector: '[my-dir]',
  bind: {'dirProp':'elprop'}
})
class MyDir {
  dirProp:string;
  constructor() {
    this.dirProp = '';
  }
}

@Component({
  selector: 'push-cmp',
  bind: {
    'prop': 'prop'
  },
  changeDetection:ON_PUSH
})
@Template({inline: '{{field}}'})
class PushBasedComp {
  numberOfChecks:number;
  bpc:BindingPropagationConfig;
  prop;

  constructor(bpc:BindingPropagationConfig) {
    this.numberOfChecks = 0;
    this.bpc = bpc;
  }

  get field(){
    this.numberOfChecks++;
    return "fixed";
  }

  propagate() {
    this.bpc.shouldBePropagatedFromRoot();
  }
}

@Component()
@Template({directives: [
]})
class MyComp {
  ctxProp:string;
  ctxNumProp;
  ctxBoolProp;
  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }
}


@Component({
  selector: 'component-with-pipes',
  bind: {
    "prop": "prop | double"
  }
})
@Template({
  inline: ''
})
class ComponentWithPipes {
  prop:string;
}

@Component({
  selector: 'child-cmp',
  services: [MyService]
})
@Template({
  directives: [MyDir],
  inline: '{{ctxProp}}'
})
class ChildComp {
  ctxProp:string;
  dirProp:string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Decorator({
  selector: 'some-directive'
})
class SomeDirective { }

@Component({
  selector: 'cmp-with-parent'
})
@Template({
  inline: '<p>Component with an injected parent</p>',
  directives: [SomeDirective]
})
class CompWithParent {
  myParent: SomeDirective;
  constructor(@Parent() someComp: SomeDirective) {
    this.myParent = someComp;
  }
}

@Component({
  selector: 'cmp-with-ancestor'
})
@Template({
  inline: '<p>Component with an injected ancestor</p>',
  directives: [SomeDirective]
})
class CompWithAncestor {
  myAncestor: SomeDirective;
  constructor(@Ancestor() someComp: SomeDirective) {
    this.myAncestor = someComp;
  }
}

@Component({
  selector: '[child-cmp2]',
  services: [MyService]
})
class ChildComp2 {
  ctxProp:string;
  dirProp:string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Viewport({
  selector: '[some-viewport]'
})
class SomeViewport {
  constructor(container: ViewContainer) {
    container.create().setLocal('some-tmpl', 'hello');
    container.create().setLocal('some-tmpl', 'again');
  }
}

class MyService {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}

class DoublePipe extends Pipe {
  supports(obj) {
    return true;
  }

  transform(value) {
    return `${value}${value}`;
  }
}

class DoublePipeFactory {
  supports(obj) {
    return true;
  }

  create(bpc) {
    return new DoublePipe();
  }
}

@Decorator({
  selector: '[emitter]',
  events: {'event': 'onEvent($event)'}
})
class DecoratorEmitingEvent {
  msg: string;
  emitter;

  constructor(@EventEmitter('event') emitter:Function) {
    this.msg = '';
    this.emitter = emitter;
  }

  fireEvent(msg: string) {
    this.emitter(msg);
  }

  onEvent(msg: string) {
    this.msg = msg;
  }
}

@Decorator({
  selector: '[listener]',
  events: {'event': 'onEvent($event)'}
})
class DecoratorListeningEvent {
  msg: string;

  constructor() {
    this.msg = '';
  }

  onEvent(msg: string) {
    this.msg = msg;
  }
}

@Decorator({
  selector: '[listener]',
  events: {'domEvent': 'onEvent($event.type)'}
})
class DecoratorListeningDomEvent {
  eventType: string;

  constructor() {
    this.eventType = '';
  }

  onEvent(eventType: string) {
    this.eventType = eventType;
  }
}

@Component({
  selector: '[id]',
  bind: {'id': 'id'}
})
@Template({
  inline: '<div>Matched on id with {{id}}</div>'
})
class IdComponent {
  id: string;
}

@Decorator({
  selector: '[static]'
})
class NeedsAttribute {
  typeAttribute;
  titleAttribute;
  fooAttribute;
  constructor(@Attribute('type') typeAttribute: string, @Attribute('title') titleAttribute: string, @Attribute('foo') fooAttribute: string) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}
