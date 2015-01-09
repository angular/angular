import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'test_lib/test_lib';

import {DOM} from 'facade/dom';

import {Injector} from 'di/di';
import {Lexer, Parser} from 'change_detection/change_detection';

import {Compiler, CompilerCache} from 'core/compiler/compiler';
import {OnChange} from 'core/compiler/interfaces';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';

import {Decorator, Component, Template} from 'core/annotations/annotations';
import {TemplateConfig} from 'core/annotations/template_config';

import {ViewPort} from 'core/compiler/viewport';
import {MapWrapper, ListWrapper} from 'facade/collection';
import {NgRepeat} from 'directives/ng_repeat';

export function main() {
  describe('ng-repeat', () => {
    var view, cd, compiler, component;
    beforeEach(() => {
      compiler = new Compiler(null, new DirectiveMetadataReader(), new Parser(new Lexer()), new CompilerCache());
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

    var TEMPLATE = '<div><copy-me template="ng-repeat #item in items">{{item.toString()}};</copy-me></div>';

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
      compileWithTemplate('<ul><li template="ng-repeat #item in items">{{item["name"]}};</li></ul>').then((pv) => {
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
      compileWithTemplate('<ul><li template="ng-repeat #item in null">{{item}};</li></ul>').then((pv) => {
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
        '<div><div template="ng-repeat #item in items">' +
          '<div template="ng-repeat #subitem in item">' +
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

/*
TODO(rado): enable after compiler is fixed.
  it('should display indices correctly', (done) => {
    var INDEX_TEMPLATE = '<div><copy-me template="ng-repeat #item in items index #i">{{index.toString()}};</copy-me></div>';
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
*/
  });
}

class Foo {
  toString() {
    return 'foo';
  }
}

@Component({
  selector: 'test-cmp',
  template: new TemplateConfig({
    inline: '',  // each test swaps with a custom template.
    directives: [NgRepeat]
  })
})
class TestComponent {
  items: any;
  item: any;
  constructor() {
    this.items = [1, 2];
  }
}
