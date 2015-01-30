import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'angular2/test_lib';

import {DOM} from 'angular2/src/facade/dom';

import {Injector} from 'angular2/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';

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
        view = pv.instantiate(null);
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
        compiler.compile(MyComp, el('<div my-dir [elprop]="ctxProp"></div>')).then((pv) => {
          createView(pv);

          ctx.ctxProp = 'Hello World!';
          cd.detectChanges();

          var elInj = view.elementInjectors[0];
          expect(elInj.get(MyDir).dirProp).toEqual('Hello World!');
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
  template: new TemplateConfig({
    directives: [MyDir, ChildComp, SomeTemplate]
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

