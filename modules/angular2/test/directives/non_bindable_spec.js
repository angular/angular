import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Injector} from 'angular2/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';
import {CssProcessor} from 'angular2/src/core/compiler/css_processor';


import {Decorator, Component} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';

import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {NgElement} from 'angular2/src/core/dom/element';
import {NonBindable} from 'angular2/src/directives/non_bindable';
import {MockTemplateResolver} from 'angular2/src/mock/template_resolver_mock';

export function main() {
  describe('non-bindable', () => {
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
        urlResolver,
        new CssProcessor(null)
      );
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
        directives: [NonBindable, TestDecorator]
      });
      tplResolver.setTemplate(TestComponent, template);
      return compiler.compile(TestComponent);
    }

    it('should not interpolate children', inject([AsyncTestCompleter], (async) => {
      var template = '<div>{{text}}<span non-bindable>{{text}}</span></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('foo{{text}}');
        async.done();
      });
    }));

    it('should ignore directives on child nodes', inject([AsyncTestCompleter], (async) => {
      var template = '<div non-bindable><span id=child test-dec>{{text}}</span></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        var span = DOM.querySelector(view.nodes[0], '#child');
        expect(DOM.hasClass(span, 'compiled')).toBeFalsy();
        async.done();
      });
    }));

    it('should trigger directives on the same node', inject([AsyncTestCompleter], (async) => {
      var template = '<div><span id=child non-bindable test-dec>{{text}}</span></div>';
      compileWithTemplate(template).then((pv) => {
        createView(pv);
        cd.detectChanges();
        var span = DOM.querySelector(view.nodes[0], '#child');
        expect(DOM.hasClass(span, 'compiled')).toBeTruthy();
        async.done();
      });
    }));
  })
}

@Component({selector: 'test-cmp'})
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
