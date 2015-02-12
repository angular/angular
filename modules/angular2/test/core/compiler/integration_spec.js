import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'angular2/test_lib';

import {DOM} from 'angular2/src/facade/dom';

import {Injector} from 'angular2/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {BindingPropagationConfig} from 'angular2/src/core/compiler/binding_propagation_config';

import {Decorator, Component, Template} from 'angular2/src/core/annotations/annotations';
import {TemplateConfig} from 'angular2/src/core/annotations/template_config';

import {ViewPort} from 'angular2/src/core/compiler/viewport';
import {MapWrapper} from 'angular2/src/facade/collection';

import {XHRMock} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('integration tests', function() {
    var compiler;

    beforeEach( () => {
      compiler = new Compiler(dynamicChangeDetection,
        new TemplateLoader(new XHRMock()),
        new DirectiveMetadataReader(),
        new Parser(new Lexer()),
        new CompilerCache(),
        new NativeShadowDomStrategy()
      );
    });

    describe('react to record changes', function() {
      var view, ctx, cd;
      function createView(pv) {
        ctx = new MyComp();
        view = pv.instantiate(null, null);
        view.hydrate(new Injector([]), null, ctx);
        cd = view.changeDetector;
      }

      it('should consume text node changes', (done) => {
        compiler.compile(MyComp, el('<div>{{ctxProp}}</div>')).then((pv) => {
          createView(pv);
          ctx.ctxProp = 'Hello World!';

          cd.detectChanges();
          expect(DOM.getInnerHTML(view.nodes[0])).toEqual('Hello World!');
          done();
        });
      });

      it('should consume element binding changes', (done) => {
        compiler.compile(MyComp, el('<div [id]="ctxProp"></div>')).then((pv) => {
          createView(pv);

          ctx.ctxProp = 'Hello World!';
          cd.detectChanges();

          expect(view.nodes[0].id).toEqual('Hello World!');
          done();
        });
      });

      it('should consume directive watch expression change.', (done) => {
        var tpl =
          '<div>' +
            '<div my-dir [elprop]="ctxProp"></div>' +
            '<div my-dir elprop="Hi there!"></div>' +
            '<div my-dir elprop="Hi {{\'there!\'}}"></div>' +
            '<div my-dir elprop="One more {{ctxProp}}"></div>' +
          '</div>'
        compiler.compile(MyComp, el(tpl)).then((pv) => {
          createView(pv);

          ctx.ctxProp = 'Hello World!';
          cd.detectChanges();

          expect(view.elementInjectors[0].get(MyDir).dirProp).toEqual('Hello World!');
          expect(view.elementInjectors[1].get(MyDir).dirProp).toEqual('Hi there!');
          expect(view.elementInjectors[2].get(MyDir).dirProp).toEqual('Hi there!');
          expect(view.elementInjectors[3].get(MyDir).dirProp).toEqual('One more Hello World!');
          done();
        });
      });

      it('should support nested components.', (done) => {
        compiler.compile(MyComp, el('<child-cmp></child-cmp>')).then((pv) => {
          createView(pv);

          cd.detectChanges();

          expect(view.nodes[0].shadowRoot.childNodes[0].nodeValue).toEqual('hello');
          done();
        });
      });

      // GH issue 328 - https://github.com/angular/angular/issues/328
      it('should support different directive types on a single node', (done) => {
        compiler.compile(MyComp, el('<child-cmp my-dir [elprop]="ctxProp"></child-cmp>')).then((pv) => {
          createView(pv);

          ctx.ctxProp = 'Hello World!';
          cd.detectChanges();

          var elInj = view.elementInjectors[0];
          expect(elInj.get(MyDir).dirProp).toEqual('Hello World!');
          expect(elInj.get(ChildComp).dirProp).toEqual(null);

          done();
        });
      });

      it('should support template directives via `<template>` elements.', (done) => {
        compiler.compile(MyComp, el('<div><template some-tmplate var-greeting="some-tmpl"><copy-me>{{greeting}}</copy-me></template></div>')).then((pv) => {
          createView(pv);

          cd.detectChanges();

          var childNodesOfWrapper = view.nodes[0].childNodes;
          // 1 template + 2 copies.
          expect(childNodesOfWrapper.length).toBe(3);
          expect(childNodesOfWrapper[1].childNodes[0].nodeValue).toEqual('hello');
          expect(childNodesOfWrapper[2].childNodes[0].nodeValue).toEqual('again');
          done();
        });
      });

      it('should support template directives via `template` attribute.', (done) => {
        compiler.compile(MyComp, el('<div><copy-me template="some-tmplate: var greeting=some-tmpl">{{greeting}}</copy-me></div>')).then((pv) => {
          createView(pv);

          cd.detectChanges();

          var childNodesOfWrapper = view.nodes[0].childNodes;
          // 1 template + 2 copies.
          expect(childNodesOfWrapper.length).toBe(3);
          expect(childNodesOfWrapper[1].childNodes[0].nodeValue).toEqual('hello');
          expect(childNodesOfWrapper[2].childNodes[0].nodeValue).toEqual('again');
          done();
        });
      });

      it('should assign the component instance to a var-', (done) => {
        compiler.compile(MyComp, el('<p><child-cmp var-alice></child-cmp></p>')).then((pv) => {
          createView(pv);

          expect(view.contextWithLocals).not.toBe(null);
          expect(view.contextWithLocals.get('alice')).toBeAnInstanceOf(ChildComp);

          done();
        })
      });

      it('should assign two component instances each with a var-', (done) => {
        var element = el('<p><child-cmp var-alice></child-cmp><child-cmp var-bob></p>');

        compiler.compile(MyComp, element).then((pv) => {
          createView(pv);

          expect(view.contextWithLocals).not.toBe(null);
          expect(view.contextWithLocals.get('alice')).toBeAnInstanceOf(ChildComp);
          expect(view.contextWithLocals.get('bob')).toBeAnInstanceOf(ChildComp);
          expect(view.contextWithLocals.get('alice')).not.toBe(view.contextWithLocals.get('bob'));

          done();
        })
      });

      it('should assign the component instance to a var- with shorthand syntax', (done) => {
        compiler.compile(MyComp, el('<child-cmp #alice></child-cmp>')).then((pv) => {
          createView(pv);

          expect(view.contextWithLocals).not.toBe(null);
          expect(view.contextWithLocals.get('alice')).toBeAnInstanceOf(ChildComp);

          done();
        })
      });

      it('should assign the element instance to a user-defined variable', (done) => {
        // How is this supposed to work?
        var element = el('<p></p>');
        var div = el('<div var-alice></div>');
        DOM.appendChild(div, el('<i>Hello</i>'));
        DOM.appendChild(element, div);

        compiler.compile(MyComp, element).then((pv) => {
          createView(pv);
          expect(view.contextWithLocals).not.toBe(null);

          var value = view.contextWithLocals.get('alice');
          expect(value).not.toBe(null);
          expect(value.tagName).toEqual('DIV');

          done();
        })
      });

      it('should provide binding configuration config to the component', (done) => {
        compiler.compile(MyComp, el('<push-cmp #cmp></push-cmp>')).then((pv) => {
          createView(pv);

          var cmp = view.contextWithLocals.get('cmp');

          cd.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          cd.detectChanges();
          expect(cmp.numberOfChecks).toEqual(1);

          cmp.propagate();

          cd.detectChanges();
          expect(cmp.numberOfChecks).toEqual(2);
          done();
        })
      });
    });
  });
}

@Decorator({
  selector: '[my-dir]',
  bind: {'elprop':'dirProp'}
})
class MyDir {
  dirProp:string;
  constructor() {
    this.dirProp = '';
  }
}

@Component({
  selector: 'push-cmp',
  template: new TemplateConfig({
    inline: '{{field}}'
  })
})
class PushBasedComp {
  numberOfChecks:number;
  bpc:BindingPropagationConfig;

  constructor(bpc:BindingPropagationConfig) {
    this.numberOfChecks = 0;
    this.bpc = bpc;
    bpc.shouldBePropagated();
  }

  get field(){
    this.numberOfChecks++;
    return "fixed";
  }

  propagate() {
    this.bpc.shouldBePropagatedFromRoot();
  }
}

@Component({
  template: new TemplateConfig({
    directives: [MyDir, [[ChildComp], SomeTemplate, PushBasedComp]]
  })
})
class MyComp {
  ctxProp:string;
  constructor() {
    this.ctxProp = 'initial value';
  }
}

@Component({
  selector: 'child-cmp',
  componentServices: [MyService],
  template: new TemplateConfig({
    directives: [MyDir],
    inline: '{{ctxProp}}'
  })
})
class ChildComp {
  ctxProp:string;
  dirProp:string;
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
    this.dirProp = null;
  }
}

@Template({
  selector: '[some-tmplate]'
})
class SomeTemplate {
  constructor(viewPort: ViewPort) {
    viewPort.create().setLocal('some-tmpl', 'hello');
    viewPort.create().setLocal('some-tmpl', 'again');
  }
}

class MyService {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}
