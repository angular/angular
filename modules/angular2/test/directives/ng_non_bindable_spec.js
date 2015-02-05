import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'angular2/test_lib';
import {DOM} from 'angular2/src/facade/dom';
import {Injector} from 'angular2/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Decorator, Component} from 'angular2/src/core/annotations/annotations';
import {TemplateConfig} from 'angular2/src/core/annotations/template_config';
import {NgElement} from 'angular2/src/core/dom/element';
import {NgNonBindable} from 'angular2/src/directives/ng_non_bindable';

export function main() {
  describe('ng-non-bindable', () => {
    var view, cd, compiler, component;
    beforeEach(() => {
      compiler = new Compiler(dynamicChangeDetection,
        null, new DirectiveMetadataReader(), new Parser(new Lexer()), new CompilerCache());
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

    it('should not interpolate children', (done) => {
      var template = '<div>{{text}}<span ng-non-bindable>{{text}}</span></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('foo{{text}}');
        done();
      });
    });

    it('should ignore directives on child nodes', (done) => {
      var template = '<div ng-non-bindable><span id=child test-dec>{{text}}</span></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        var span = DOM.querySelector(view.nodes[0], '#child');
        expect(DOM.hasClass(span, 'compiled')).toBeFalsy();
        done();
      });
    });

    it('should trigger directives on the same node', (done) => {
      var template = '<div><span id=child ng-non-bindable test-dec>{{text}}</span></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        var span = DOM.querySelector(view.nodes[0], '#child');
        expect(DOM.hasClass(span, 'compiled')).toBeTruthy();
        done();
      });
    });
  })
}

@Component({
  selector: 'test-cmp',
  template: new TemplateConfig({
    inline: '',  // each test swaps with a custom template.
    directives: [NgNonBindable, TestDecorator]
  })
})
class TestComponent {
  text: string;
  constructor() {
    this.text = 'foo';
  }
}

@Decorator({
  selector: '[test-dec]'
})
class TestDecorator {
  constructor(el: NgElement) {
    DOM.addClass(el.domElement, 'compiled');
  }
}
