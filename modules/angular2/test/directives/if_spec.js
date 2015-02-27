import {describe, xit, it, expect, beforeEach, ddescribe, iit, el, IS_DARTIUM} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Injector} from 'angular2/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';

import {Component} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';

import {MockTemplateResolver} from 'angular2/src/mock/template_resolver_mock';

import {If} from 'angular2/src/directives/if';

export function main() {
  describe('if directive', () => {
    var view, cd, compiler, component, tplResolver;

    beforeEach(() => {
      var urlResolver = new UrlResolver();
      tplResolver = new MockTemplateResolver();
      compiler = new Compiler(
        dynamicChangeDetection,
        new TemplateLoader(null, null),
        new DirectiveMetadataReader(),
        new Parser(new Lexer()),
        new CompilerCache(),
        new NativeShadowDomStrategy(new StyleUrlResolver(urlResolver)),
        tplResolver,
        new ComponentUrlMapper(),
        urlResolver);
    });

    function createView(pv) {
      component = new TestComponent();
      view = pv.instantiate(null, null);
      view.hydrate(new Injector([]), null, component);
      cd = view.changeDetector;
    }

    function compileWithTemplate(html) {
      var template = new Template({
        inline: html,
        directives: [If]
      });
      tplResolver.setTemplate(TestComponent, template);
      return compiler.compile(TestComponent);
    }

    it('should work in a template attribute', (done) => {
      compileWithTemplate('<div><copy-me template="if booleanCondition">hello</copy-me></div>').then((pv) => {
        createView(pv);
        cd.detectChanges();

        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('hello');
        done();
      });
    });

    it('should work in a template element', (done) => {
      compileWithTemplate('<div><template [if]="booleanCondition"><copy-me>hello2</copy-me></template></div>').then((pv) => {
        createView(pv);
        cd.detectChanges();

        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('hello2');
        done();
      });
    });

    it('should toggle node when condition changes', (done) => {
      compileWithTemplate('<div><copy-me template="if booleanCondition">hello</copy-me></div>').then((pv) => {
        createView(pv);

        component.booleanCondition = false;
        cd.detectChanges();
        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(0);
        expect(DOM.getText(view.nodes[0])).toEqual('');


        component.booleanCondition = true;
        cd.detectChanges();
        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('hello');

        component.booleanCondition = false;
        cd.detectChanges();
        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(0);
        expect(DOM.getText(view.nodes[0])).toEqual('');

        done();
      });
    });

    it('should update several nodes with if', (done) => {
      var templateString =
      '<div>' +
        '<copy-me template="if numberCondition + 1 >= 2">helloNumber</copy-me>' +
        '<copy-me template="if stringCondition == \'foo\'">helloString</copy-me>' +
        '<copy-me template="if functionCondition(stringCondition, numberCondition)">helloFunction</copy-me>' +
      '</div>';
      compileWithTemplate(templateString).then((pv) => {
        createView(pv);

        cd.detectChanges();
        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(3);
        expect(DOM.getText(view.nodes[0])).toEqual('helloNumberhelloStringhelloFunction');

        component.numberCondition = 0;
        cd.detectChanges();
        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('helloString');

        component.numberCondition = 1;
        component.stringCondition = "bar";
        cd.detectChanges();
        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('helloNumber');
        done();
      });
    });


    if (!IS_DARTIUM) {
      it('should leave the element if the condition is a non-empty string (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="if stringCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          cd.detectChanges();

          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
          expect(DOM.getText(view.nodes[0])).toEqual('hello');
          done();
        });
      });

      it('should leave the element if the condition is an object (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="if objectCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          cd.detectChanges();

          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
          expect(DOM.getText(view.nodes[0])).toEqual('hello');
          done();
        });
      });

      it('should remove the element if the condition is null (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="if nullCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          cd.detectChanges();

          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(0);
          expect(DOM.getText(view.nodes[0])).toEqual('');
          done();
        });
      });

      it('should not add the element twice if the condition goes from true to true (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="if numberCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);

          cd.detectChanges();
          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
          expect(DOM.getText(view.nodes[0])).toEqual('hello');

          component.numberCondition = 2;
          cd.detectChanges();
          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
          expect(DOM.getText(view.nodes[0])).toEqual('hello');

          done();
        });
      });

      it('should not recreate the element if the condition goes from true to true (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="if numberCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);

          cd.detectChanges();
          DOM.addClass(view.nodes[0].childNodes[1], "foo");

          component.numberCondition = 2;
          cd.detectChanges();
          expect(DOM.hasClass(view.nodes[0].childNodes[1], "foo")).toBe(true);

          done();
        });
      });
    } else {
      it('should not create the element if the condition is not a boolean (DART)', (done) => {
        compileWithTemplate('<div><copy-me template="if numberCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          expect(function(){cd.detectChanges();}).toThrowError();
          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(0);
          expect(DOM.getText(view.nodes[0])).toEqual('');
          done();
        });
      });
    }

  });
}

@Component({selector: 'test-cmp'})
class TestComponent {
  booleanCondition: boolean;
  numberCondition: number;
  stringCondition: string;
  functionCondition: Function;
  objectCondition: any;
  nullCondition: any;
  constructor() {
    this.booleanCondition = true;
    this.numberCondition = 1;
    this.stringCondition = "foo";
    this.functionCondition = function(s, n){
      return s == "foo" && n == 1;
    };
    this.objectCondition = {};
    this.nullCondition = null;
  }
}
