import {describe, xit, it, expect, beforeEach, ddescribe, iit} from 'test_lib/test_lib';

import {DOM} from 'facade/dom';

import {Injector} from 'di/di';
import {Lexer, Parser, ChangeDetector} from 'change_detection/change_detection';

import {Compiler, CompilerCache} from 'core/compiler/compiler';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {ShadowDomEmulated} from 'core/compiler/shadow_dom';

import {Decorator, Component, Template} from 'core/annotations/annotations';
import {TemplateConfig} from 'core/annotations/template_config';

import {ViewPort} from 'core/compiler/viewport';
import {MapWrapper} from 'facade/collection';

export function main() {
  describe('integration tests', function() {
    var compiler;

    beforeEach( () => {
      compiler = new Compiler(null, new DirectiveMetadataReader(), new Parser(new Lexer()), new CompilerCache());
    });

    describe('react to record changes', function() {
      var view, ctx, cd;
      function createView(pv) {
        ctx = new MyComp();
        view = pv.instantiate(null);
        view.hydrate(new Injector([]), null, ctx);
        cd = new ChangeDetector(view.recordRange);
      }

      it('should consume text node changes', (done) => {
        compiler.compile(MyComp, createElement('<div>{{ctxProp}}</div>')).then((pv) => {
          createView(pv);
          ctx.ctxProp = 'Hello World!';

          cd.detectChanges();
          expect(DOM.getInnerHTML(view.nodes[0])).toEqual('Hello World!');
          done();
        });
      });

      it('should consume element binding changes', (done) => {
        compiler.compile(MyComp, createElement('<div [id]="ctxProp"></div>')).then((pv) => {
          createView(pv);

          ctx.ctxProp = 'Hello World!';
          cd.detectChanges();

          expect(view.nodes[0].id).toEqual('Hello World!');
          done();
        });
      });

      it('should consume directive watch expression change.', (done) => {
        compiler.compile(MyComp, createElement('<div my-dir [elprop]="ctxProp"></div>')).then((pv) => {
          createView(pv);

          ctx.ctxProp = 'Hello World!';
          cd.detectChanges();

          var elInj = view.elementInjectors[0];
          expect(elInj.get(MyDir).dirProp).toEqual('Hello World!');
          done();
        });
      });

      it('should support nested components.', (done) => {
        compiler.compile(MyComp, createElement('<child-cmp></child-cmp>')).then((pv) => {
          createView(pv);

          cd.detectChanges();

          expect(view.nodes[0].shadowRoot.childNodes[0].nodeValue).toEqual('hello');
          done();
        });
      });

      it('should support template directives via `<template>` elements.', (done) => {
        compiler.compile(MyComp, createElement('<div><template let-some-tmpl="greeting"><copy-me>{{greeting}}</copy-me></template></div>')).then((pv) => {
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
        compiler.compile(MyComp, createElement('<div><copy-me template="some-tmpl #greeting">{{greeting}}</copy-me></div>')).then((pv) => {
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
    });

    it('should emulate content tag', (done) => {
      var el = `<emulated-shadow-dom-component>` +
        `<div>Light</div>` +
        `<div template="trivial-template">DOM</div>` +
      `</emulated-shadow-dom-component>`;

      function createView(pv) {
        var view = pv.instantiate(null);
        view.hydrate(new Injector([]), null, {});
        return view;
      }

      compiler.compile(MyComp, createElement(el)).
        then(createView).
        then((view) => {
          expect(DOM.getText(view.nodes[0])).toEqual('Before LightDOM After');
          done();
        });
    });
  });
}

@Template({
  selector: '[trivial-template]'
})
class TrivialTemplateDirective {
  constructor(viewPort:ViewPort) {
    viewPort.create();
  }
}

@Component({
  selector: 'emulated-shadow-dom-component',
  template: new TemplateConfig({
    inline: 'Before <content></content> After',
    directives: []
  }),
  shadowDom: ShadowDomEmulated
})
class EmulatedShadowDomCmp {

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
  template: new TemplateConfig({
    directives: [MyDir, ChildComp, SomeTemplate, EmulatedShadowDomCmp, TrivialTemplateDirective]
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
  constructor(service: MyService) {
    this.ctxProp = service.greeting;
  }
}

@Template({
  selector: '[some-tmpl]'
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


function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
