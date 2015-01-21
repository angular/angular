import {describe, xit, it, expect, beforeEach, ddescribe, iit, IS_DARTIUM, el} from 'test_lib/test_lib';

import {DOM} from 'facade/dom';

import {Injector} from 'di/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'change_detection/change_detection';

import {Compiler, CompilerCache} from 'core/compiler/compiler';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';

import {Component} from 'core/annotations/annotations';
import {TemplateConfig} from 'core/annotations/template_config';

import {NgIf} from 'directives/ng_if';

export function main() {
  describe('ng-if', () => {
    var view, cd, compiler, component;
    beforeEach(() => {
      compiler = new Compiler(dynamicChangeDetection, null, new DirectiveMetadataReader(),
        new Parser(new Lexer()), new CompilerCache());
    });

    function createView(pv) {
      component = new TestComponent();
      view = pv.instantiate(null);
      view.hydrate(new Injector([]), null, component);
      cd = view.changeDetector;
    }

    function compileWithTemplate(template) {
      return compiler.compile(TestComponent, el(template));
    }

    it('should work in a template attribute', (done) => {
      compileWithTemplate('<div><copy-me template="ng-if booleanCondition">hello</copy-me></div>').then((pv) => {
        createView(pv);
        cd.detectChanges();

        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('hello');
        done();
      });
    });

    it('should work in a template element', (done) => {
      compileWithTemplate('<div><template [ng-if]="booleanCondition"><copy-me>hello2</copy-me></template></div>').then((pv) => {
        createView(pv);
        cd.detectChanges();

        expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
        expect(DOM.getText(view.nodes[0])).toEqual('hello2');
        done();
      });
    });

    it('should toggle node when condition changes', (done) => {
      compileWithTemplate('<div><copy-me template="ng-if booleanCondition">hello</copy-me></div>').then((pv) => {
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

    it('should update several nodes with ng-if', (done) => {
      var templateString =
      '<div>' +
        '<copy-me template="ng-if numberCondition + 1 >= 2">helloNumber</copy-me>' +
        '<copy-me template="ng-if stringCondition == \'foo\'">helloString</copy-me>' +
        '<copy-me template="ng-if functionCondition(stringCondition, numberCondition)">helloFunction</copy-me>' +
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
        compileWithTemplate('<div><copy-me template="ng-if stringCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          cd.detectChanges();

          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
          expect(DOM.getText(view.nodes[0])).toEqual('hello');
          done();
        });
      });

      it('should leave the element if the condition is an object (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="ng-if objectCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          cd.detectChanges();

          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(1);
          expect(DOM.getText(view.nodes[0])).toEqual('hello');
          done();
        });
      });

      it('should remove the element if the condition is null (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="ng-if nullCondition">hello</copy-me></div>').then((pv) => {
          createView(pv);
          cd.detectChanges();

          expect(view.nodes[0].querySelectorAll('copy-me').length).toEqual(0);
          expect(DOM.getText(view.nodes[0])).toEqual('');
          done();
        });
      });

      it('should not add the element twice if the condition goes from true to true (JS)', (done) => {
        compileWithTemplate('<div><copy-me template="ng-if numberCondition">hello</copy-me></div>').then((pv) => {
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
        compileWithTemplate('<div><copy-me template="ng-if numberCondition">hello</copy-me></div>').then((pv) => {
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
        compileWithTemplate('<div><copy-me template="ng-if numberCondition">hello</copy-me></div>').then((pv) => {
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

@Component({
  selector: 'test-cmp',
  template: new TemplateConfig({
    inline: '',  // each test swaps with a custom template.
    directives: [NgIf]
  })
})
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
