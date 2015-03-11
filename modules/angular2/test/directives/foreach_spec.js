import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper} from 'angular2/src/facade/collection';

import {Injector} from 'angular2/di';
import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';
import {CssProcessor} from 'angular2/src/core/compiler/css_processor';

import {Template} from 'angular2/src/core/annotations/template';
import {Decorator, Component, Viewport} from 'angular2/src/core/annotations/annotations';

import {MockTemplateResolver} from 'angular2/src/mock/template_resolver_mock';

import {Foreach} from 'angular2/src/directives/foreach';

export function main() {
  describe('foreach', () => {
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
        directives: [Foreach]
      });
      tplResolver.setTemplate(TestComponent, template);
      return compiler.compile(TestComponent);
    }

    var TEMPLATE = '<div><copy-me template="foreach #item in items">{{item.toString()}};</copy-me></div>';

    it('should reflect initial elements', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('1;2;');
        done();
      });
    });

    it('should reflect added elements', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        cd.detectChanges();

        ListWrapper.push(component.items, 3);
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('1;2;3;');
        done();
      });
    });

    it('should reflect removed elements', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        cd.detectChanges();

        ListWrapper.removeAt(component.items, 1);
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('1;');
        done();
      });
    });

    it('should reflect moved elements', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        cd.detectChanges();

        ListWrapper.removeAt(component.items, 0);
        ListWrapper.push(component.items, 1);
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('2;1;');
        done();
      });
    });

    it('should reflect a mix of all changes (additions/removals/moves)', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        component.items = [0, 1, 2, 3, 4, 5];
        cd.detectChanges();

        component.items = [6, 2, 7, 0, 4, 8];
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('6;2;7;0;4;8;');
        done();
      });
    });

    it('should iterate over an array of objects', () => {
      compileWithTemplate('<ul><li template="foreach #item in items">{{item["name"]}};</li></ul>').then((pv) => {
        createView(pv);

        // INIT
        component.items = [{'name': 'misko'}, {'name':'shyam'}];
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('misko;shyam;');

        // GROW
        ListWrapper.push(component.items, {'name': 'adam'});
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('misko;shyam;adam;');

        // SHRINK
        ListWrapper.removeAt(component.items, 2);
        ListWrapper.removeAt(component.items, 0);
        cd.detectChanges();

        expect(DOM.getText(view.nodes[0])).toEqual('shyam;');
      });
    });

    it('should gracefully handle nulls', (done) => {
      compileWithTemplate('<ul><li template="foreach #item in null">{{item}};</li></ul>').then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('');
        done();
      });
    });

    it('should gracefully handle ref changing to null and back', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('1;2;');

        component.items = null;
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('');

        component.items = [1, 2, 3];
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('1;2;3;');
        done();
      });
    });

    it('should throw on ref changing to string', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('1;2;');

        component.items = 'whaaa';
        expect(() => cd.detectChanges()).toThrowError();
        done();
      });
    });

    it('should works with duplicates', (done) => {
      compileWithTemplate(TEMPLATE).then((pv) => {
        createView(pv);
        var a = new Foo();
        component.items = [a, a];
        cd.detectChanges();
        expect(DOM.getText(view.nodes[0])).toEqual('foo;foo;');
        done();
      });
    });

  it('should repeat over nested arrays', (done) => {
    compileWithTemplate(
        '<div><div template="foreach #item in items">' +
          '<div template="foreach #subitem in item">' +
          '{{subitem}};' +
        '</div>|</div></div>'
    ).then((pv) => {
      createView(pv);
      component.items = [['a', 'b'], ['c','d']];
      cd.detectChanges();
      cd.detectChanges();
      cd.detectChanges();
      expect(DOM.getText(view.nodes[0])).toEqual('a;b;|c;d;|');
      done();
    });
  });


  it('should display indices correctly', (done) => {
    var INDEX_TEMPLATE =
      '<div><copy-me template="foreach: var item in items; var i=index">{{i.toString()}}</copy-me></div>';
    compileWithTemplate(INDEX_TEMPLATE).then((pv) => {
      createView(pv);
      component.items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      cd.detectChanges();
      expect(DOM.getText(view.nodes[0])).toEqual('0123456789');

      component.items = [1, 2, 6, 7, 4, 3, 5, 8, 9, 0];
      cd.detectChanges();
      expect(DOM.getText(view.nodes[0])).toEqual('0123456789');
      done();
    });
  });

  });
}

class Foo {
  toString() {
    return 'foo';
  }
}

@Component({selector: 'test-cmp'})
class TestComponent {
  items: any;
  item: any;
  constructor() {
    this.items = [1, 2];
  }
}
