import {
  TestComponentBuilder,
  AsyncTestCompleter,
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  beforeEachProviders,
  inject
} from 'angular2/testing_internal';

import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';

import {LegacyHtmlAstTransformer} from 'angular2/src/compiler/legacy_template';

export function main() {
  describe('Support for legacy template', () => {

    describe('Template rewriting', () => {
      let visitor;

      beforeEach(() => { visitor = new LegacyHtmlAstTransformer(['yes-mapped']); });

      describe('non template elements', () => {
        it('should rewrite event binding', () => {
          let fixtures = [
            {'from': 'on-dash-case', 'to': 'on-dashCase'},
            {'from': 'ON-dash-case', 'to': 'on-dashCase'},
            {'from': 'bindon-dash-case', 'to': 'bindon-dashCase'},
            {'from': '(dash-case)', 'to': '(dashCase)'},
            {'from': '[(dash-case)]', 'to': '[(dashCase)]'},
            {'from': 'on-camelCase', 'to': 'on-camelCase'},
            {'from': 'bindon-camelCase', 'to': 'bindon-camelCase'},
            {'from': '(camelCase)', 'to': '(camelCase)'},
            {'from': '[(camelCase)]', 'to': '[(camelCase)]'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should not rewrite style binding', () => {
          let fixtures = [
            {'from': '[style.background-color]', 'to': '[style.background-color]'},
            {'from': '[style.margin-top.px]', 'to': '[style.margin-top.px]'},
            {'from': '[style.camelCase]', 'to': '[style.camelCase]'},
            {'from': '[STYLE.camelCase]', 'to': '[style.camelCase]'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should not rewrite attribute bindings', () => {
          let fixtures = [
            {'from': '[attr.my-attr]', 'to': '[attr.my-attr]'},
            {'from': '[ATTR.my-attr]', 'to': '[attr.my-attr]'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should not rewrite class bindings', () => {
          let fixtures = [
            {'from': '[class.my-class]', 'to': '[class.my-class]'},
            {'from': '[CLASS.my-class]', 'to': '[class.my-class]'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should rewrite variables', () => {
          let fixtures = [
            {'from': '#dash-case', 'to': '#dashCase'},
            {'from': 'var-dash-case', 'to': 'var-dashCase'},
            {'from': 'VAR-dash-case', 'to': 'var-dashCase'},
            {'from': 'VAR-camelCase', 'to': 'var-camelCase'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should rewrite variable values', () => {
          let fixtures = [
            {'from': 'dash-case', 'to': 'dashCase'},
            {'from': 'lower', 'to': 'lower'},
            {'from': 'camelCase', 'to': 'camelCase'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst('#a', f['from'], null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual('#a');
            expect(attr.value).toEqual(f['to']);

            legacyAttr = new HtmlAttrAst('var-a', f['from'], null);
            attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual('var-a');
            expect(attr.value).toEqual(f['to']);
          });
        });


        it('should rewrite variables in template bindings', () => {
          let fixtures = [
            {'from': 'dir: #a-b', 'to': 'dir: #aB'},
            {'from': 'dir: var a-b', 'to': 'dir: var aB'},
            {'from': 'dir: VAR a-b;', 'to': 'dir: var aB;'},
            {'from': 'dir: VAR a-b; #c-d=e', 'to': 'dir: var aB; #cD=e'},
            {'from': 'dir: VAR aB; #cD=e', 'to': 'dir: var aB; #cD=e'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst('template', f['from'], null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.value).toEqual(f['to']);
          });
        });

        it('should lowercase the "template" attribute', () => {
          let fixtures = ['Template', 'TEMPLATE', 'template'];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f, 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual('template');
            expect(attr.value).toEqual('expression');
          });
        });

        it('should rewrite property binding', () => {
          let fixtures = [
            {'from': '[my-prop]', 'to': '[myProp]'},
            {'from': 'bind-my-prop', 'to': 'bind-myProp'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should rewrite structural directive selectors template="..."', () => {
          let legacyAttr = new HtmlAttrAst('TEMPLATE', 'ng-if condition', null);
          let attr = visitor.visitAttr(legacyAttr, null);
          expect(attr.name).toEqual('template');
          expect(attr.value).toEqual('ngIf condition');

        });

        it('should rewrite *-selectors', () => {
          let legacyAttr = new HtmlAttrAst('*ng-for', '#my-item of myItems', null);
          let attr = visitor.visitAttr(legacyAttr, null);
          expect(attr.name).toEqual('*ngFor');
          expect(attr.value).toEqual('#myItem of myItems');
        });

        it('should rewrite directive special cases', () => {
          let fixtures = [
            {'from': 'ng-non-bindable', 'to': 'ngNonBindable'},
            {'from': 'yes-mapped', 'to': 'yesMapped'},
            {'from': 'no-mapped', 'to': 'no-mapped'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });

        });

        it('should not rewrite random attributes', () => {
          let fixtures = [
            {'from': 'custom-attr', 'to': 'custom-attr'},
            {'from': 'ng-if', 'to': 'ng-if'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('expression');
          });
        });

        it('should rewrite interpolation', () => {
          let fixtures = [
            {'from': 'dash-case', 'to': 'dashCase'},
            {'from': 'lcase', 'to': 'lcase'},
            {'from': 'camelCase', 'to': 'camelCase'},
            {'from': 'attr.dash-case', 'to': 'attr.dash-case'},
            {'from': 'class.dash-case', 'to': 'class.dash-case'},
            {'from': 'style.dash-case', 'to': 'style.dash-case'},
          ];

          fixtures.forEach((f) => {
            let legacyAttr = new HtmlAttrAst(f['from'], '{{ exp }}', null);
            let attr = visitor.visitAttr(legacyAttr, null);
            expect(attr.name).toEqual(f['to']);
            expect(attr.value).toEqual('{{ exp }}');
          });
        });

      });
    });

    describe('template elements', () => {
      let visitor;

      beforeEach(() => {
        visitor = new LegacyHtmlAstTransformer();
        visitor.visitingTemplateEl = true;
      });

      it('should rewrite angular constructs', () => {
        let fixtures = [
          {'from': 'on-dash-case', 'to': 'on-dashCase'},
          {'from': 'ON-dash-case', 'to': 'on-dashCase'},
          {'from': 'bindon-dash-case', 'to': 'bindon-dashCase'},
          {'from': '(dash-case)', 'to': '(dashCase)'},
          {'from': '[(dash-case)]', 'to': '[(dashCase)]'},
          {'from': 'on-camelCase', 'to': 'on-camelCase'},
          {'from': 'bindon-camelCase', 'to': 'bindon-camelCase'},
          {'from': '(camelCase)', 'to': '(camelCase)'},
          {'from': '[(camelCase)]', 'to': '[(camelCase)]'},
        ];

        fixtures.forEach((f) => {
          let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
          let attr = visitor.visitAttr(legacyAttr, null);
          expect(attr.name).toEqual(f['to']);
          expect(attr.value).toEqual('expression');
        });
      });

      it('should rewrite all attributes', () => {
        let fixtures = [
          {'from': 'custom-attr', 'to': 'customAttr'},
          {'from': 'ng-if', 'to': 'ngIf'},
        ];

        fixtures.forEach((f) => {
          let legacyAttr = new HtmlAttrAst(f['from'], 'expression', null);
          let attr = visitor.visitAttr(legacyAttr, null);
          expect(attr.name).toEqual(f['to']);
          expect(attr.value).toEqual('expression');
        });
      });
    });
  });
}
