import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  inject,
  beforeEachBindings
} from 'angular2/test_lib';
import {bind} from 'angular2/src/core/di';

import {TEST_BINDINGS} from './test_bindings';
import {isPresent} from 'angular2/src/core/facade/lang';
import {TemplateParser, splitClasses} from 'angular2/src/compiler/template_parser';
import {
  NormalizedDirectiveMetadata,
  TypeMetadata,
  ChangeDetectionMetadata,
  NormalizedTemplateMetadata
} from 'angular2/src/compiler/directive_metadata';
import {
  templateVisitAll,
  TemplateAstVisitor,
  TemplateAst,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundEventAst,
  BoundElementPropertyAst,
  BoundDirectivePropertyAst,
  AttrAst,
  BoundTextAst,
  TextAst,
  PropertyBindingType,
  DirectiveAst
} from 'angular2/src/compiler/template_ast';

import {ElementSchemaRegistry} from 'angular2/src/core/render/dom/schema/element_schema_registry';
import {MockSchemaRegistry} from './schema_registry_mock';

import {Unparser} from '../core/change_detection/parser/unparser';

var expressionUnparser = new Unparser();

export function main() {
  describe('TemplateParser', () => {
    beforeEachBindings(() => [
      TEST_BINDINGS,
      bind(ElementSchemaRegistry)
          .toValue(new MockSchemaRegistry({'invalidProp': false}, {'mappedAttr': 'mappedProp'}))
    ]);

    var parser: TemplateParser;
    var ngIf;

    beforeEach(inject([TemplateParser], (_parser) => {
      parser = _parser;
      ngIf = new NormalizedDirectiveMetadata({
        selector: '[ng-if]',
        type: new TypeMetadata({name: 'NgIf'}),
        changeDetection: new ChangeDetectionMetadata({properties: ['ngIf']})
      });
    }));

    function parse(template: string, directives: NormalizedDirectiveMetadata[]): TemplateAst[] {
      return parser.parse(template, directives, 'TestComp');
    }

    describe('parse', () => {
      describe('nodes without bindings', () => {

        it('should parse text nodes', () => {
          expect(humanizeTemplateAsts(parse('a', [])))
              .toEqual([[TextAst, 'a', 'TestComp > #text(a):nth-child(0)']]);
        });

        it('should parse elements with attributes', () => {
          expect(humanizeTemplateAsts(parse('<div a=b>', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [AttrAst, 'a', 'b', 'TestComp > div:nth-child(0)[a=b]']
              ]);
        });
      });

      it('should parse ngContent', () => {
        var parsed = parse('<ng-content select="a">', []);
        expect(humanizeTemplateAsts(parsed))
            .toEqual([[NgContentAst, 'TestComp > ng-content:nth-child(0)']]);
      });

      it('should parse bound text nodes', () => {
        expect(humanizeTemplateAsts(parse('{{a}}', [])))
            .toEqual([[BoundTextAst, '{{ a }}', 'TestComp > #text({{a}}):nth-child(0)']]);
      });

      describe('bound properties', () => {

        it('should parse and camel case bound properties', () => {
          expect(humanizeTemplateAsts(parse('<div [some-prop]="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'someProp',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[[some-prop]=v]'
                ]
              ]);
        });

        it('should normalize property names via the element schema', () => {
          expect(humanizeTemplateAsts(parse('<div [mapped-attr]="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'mappedProp',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[[mapped-attr]=v]'
                ]
              ]);
        });

        it('should parse and camel case bound attributes', () => {
          expect(humanizeTemplateAsts(parse('<div [attr.some-attr]="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Attribute,
                  'someAttr',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[[attr.some-attr]=v]'
                ]
              ]);
        });

        it('should parse and dash case bound classes', () => {
          expect(humanizeTemplateAsts(parse('<div [class.some-class]="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Class,
                  'some-class',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[[class.some-class]=v]'
                ]
              ]);
        });

        it('should parse and camel case bound styles', () => {
          expect(humanizeTemplateAsts(parse('<div [style.some-style]="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Style,
                  'someStyle',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[[style.some-style]=v]'
                ]
              ]);
        });

        it('should parse bound properties via [...] and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div [prop]="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'prop',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[[prop]=v]'
                ]
              ]);
        });

        it('should parse bound properties via bind- and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div bind-prop="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'prop',
                  'v',
                  null,
                  'TestComp > div:nth-child(0)[bind-prop=v]'
                ]
              ]);
        });

        it('should parse bound properties via {{...}} and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div prop="{{v}}">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'prop',
                  '{{ v }}',
                  null,
                  'TestComp > div:nth-child(0)[prop={{v}}]'
                ]
              ]);
        });

      });

      describe('events', () => {

        it('should parse bound events with a target', () => {
          expect(humanizeTemplateAsts(parse('<div (window:event)="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundEventAst,
                  'event',
                  'window',
                  'v',
                  'TestComp > div:nth-child(0)[(window:event)=v]'
                ]
              ]);
        });

        it('should parse bound events via (...) and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div (event)="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [BoundEventAst, 'event', null, 'v', 'TestComp > div:nth-child(0)[(event)=v]']
              ]);
        });

        it('should camel case event names', () => {
          expect(humanizeTemplateAsts(parse('<div (some-event)="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundEventAst,
                  'someEvent',
                  null,
                  'v',
                  'TestComp > div:nth-child(0)[(some-event)=v]'
                ]
              ]);
        });

        it('should parse bound events via on- and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div on-event="v">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [BoundEventAst, 'event', null, 'v', 'TestComp > div:nth-child(0)[on-event=v]']
              ]);
        });

      });

      describe('bindon', () => {
        it('should parse bound events and properties via [(...)] and not report them as attributes',
           () => {
             expect(humanizeTemplateAsts(parse('<div [(prop)]="v">', [])))
                 .toEqual([
                   [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                   [
                     BoundElementPropertyAst,
                     PropertyBindingType.Property,
                     'prop',
                     'v',
                     null,
                     'TestComp > div:nth-child(0)[[(prop)]=v]'
                   ],
                   [
                     BoundEventAst,
                     'prop',
                     null,
                     'v = $event',
                     'TestComp > div:nth-child(0)[[(prop)]=v]'
                   ]
                 ]);
           });

        it('should parse bound events and properties via bindon- and not report them as attributes',
           () => {
             expect(humanizeTemplateAsts(parse('<div bindon-prop="v">', [])))
                 .toEqual([
                   [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                   [
                     BoundElementPropertyAst,
                     PropertyBindingType.Property,
                     'prop',
                     'v',
                     null,
                     'TestComp > div:nth-child(0)[bindon-prop=v]'
                   ],
                   [
                     BoundEventAst,
                     'prop',
                     null,
                     'v = $event',
                     'TestComp > div:nth-child(0)[bindon-prop=v]'
                   ]
                 ]);
           });

      });

      describe('variables', () => {

        it('should parse variables via #... and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div #a="b">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[#a=b]']
              ]);
        });

        it('should parse variables via var-... and not report them as attributes', () => {
          expect(humanizeTemplateAsts(parse('<div var-a="b">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[var-a=b]']
              ]);
        });

        it('should camel case variables', () => {
          expect(humanizeTemplateAsts(parse('<div var-some-a="b">', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [VariableAst, 'someA', 'b', 'TestComp > div:nth-child(0)[var-some-a=b]']
              ]);
        });

        it('should use $implicit as variable name if none was specified', () => {
          expect(humanizeTemplateAsts(parse('<div var-a>', [])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', '$implicit', 'TestComp > div:nth-child(0)[var-a=]']
              ]);
        });
      });

      describe('directives', () => {
        it('should locate directives ordered by name and components first', () => {
          var dirA = new NormalizedDirectiveMetadata(
              {selector: '[a=b]', type: new TypeMetadata({name: 'DirA'})});
          var dirB = new NormalizedDirectiveMetadata(
              {selector: '[a]', type: new TypeMetadata({name: 'DirB'})});
          var comp = new NormalizedDirectiveMetadata({
            selector: 'div',
            isComponent: true,
            type: new TypeMetadata({name: 'ZComp'}),
            template: new NormalizedTemplateMetadata({ngContentSelectors: []})
          });
          expect(humanizeTemplateAsts(parse('<div a="b">', [dirB, dirA, comp])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [AttrAst, 'a', 'b', 'TestComp > div:nth-child(0)[a=b]'],
                [DirectiveAst, comp, 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirB, 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should locate directives in property bindings', () => {
          var dirA = new NormalizedDirectiveMetadata(
              {selector: '[a=b]', type: new TypeMetadata({name: 'DirA'})});
          var dirB = new NormalizedDirectiveMetadata(
              {selector: '[b]', type: new TypeMetadata({name: 'DirB'})});
          expect(humanizeTemplateAsts(parse('<div [a]="b">', [dirA, dirB])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'a',
                  'b',
                  null,
                  'TestComp > div:nth-child(0)[[a]=b]'
                ],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should locate directives in variable bindings', () => {
          var dirA = new NormalizedDirectiveMetadata(
              {selector: '[a=b]', type: new TypeMetadata({name: 'DirA'})});
          var dirB = new NormalizedDirectiveMetadata(
              {selector: '[b]', type: new TypeMetadata({name: 'DirB'})});
          expect(humanizeTemplateAsts(parse('<div #a="b">', [dirA, dirB])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[#a=b]'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse directive host properties', () => {
          var dirA = new NormalizedDirectiveMetadata({
            selector: 'div',
            type: new TypeMetadata({name: 'DirA'}),
            changeDetection: new ChangeDetectionMetadata({hostProperties: {'a': 'expr'}})
          });
          expect(humanizeTemplateAsts(parse('<div></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                [
                  BoundElementPropertyAst,
                  PropertyBindingType.Property,
                  'a',
                  'expr',
                  null,
                  'TestComp > div:nth-child(0)'
                ]
              ]);
        });

        it('should parse directive host listeners', () => {
          var dirA = new NormalizedDirectiveMetadata({
            selector: 'div',
            type: new TypeMetadata({name: 'DirA'}),
            changeDetection: new ChangeDetectionMetadata({hostListeners: {'a': 'expr'}})
          });
          expect(humanizeTemplateAsts(parse('<div></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                [BoundEventAst, 'a', null, 'expr', 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse directive properties', () => {
          var dirA = new NormalizedDirectiveMetadata({
            selector: 'div',
            type: new TypeMetadata({name: 'DirA'}),
            changeDetection: new ChangeDetectionMetadata({properties: ['aProp']})
          });
          expect(humanizeTemplateAsts(parse('<div [a-prop]="expr"></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                [
                  BoundDirectivePropertyAst,
                  'aProp',
                  'expr',
                  'TestComp > div:nth-child(0)[[a-prop]=expr]'
                ]
              ]);
        });

        it('should parse renamed directive properties', () => {
          var dirA = new NormalizedDirectiveMetadata({
            selector: 'div',
            type: new TypeMetadata({name: 'DirA'}),
            changeDetection: new ChangeDetectionMetadata({properties: ['b:a']})
          });
          expect(humanizeTemplateAsts(parse('<div [a]="expr"></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                [BoundDirectivePropertyAst, 'b', 'expr', 'TestComp > div:nth-child(0)[[a]=expr]']
              ]);
        });

        it('should parse literal directive properties', () => {
          var dirA = new NormalizedDirectiveMetadata({
            selector: 'div',
            type: new TypeMetadata({name: 'DirA'}),
            changeDetection: new ChangeDetectionMetadata({properties: ['a']})
          });
          expect(humanizeTemplateAsts(parse('<div a="literal"></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [AttrAst, 'a', 'literal', 'TestComp > div:nth-child(0)[a=literal]'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                [
                  BoundDirectivePropertyAst,
                  'a',
                  '"literal"',
                  'TestComp > div:nth-child(0)[a=literal]'
                ]
              ]);
        });

        it('should support optional directive properties', () => {
          var dirA = new NormalizedDirectiveMetadata({
            selector: 'div',
            type: new TypeMetadata({name: 'DirA'}),
            changeDetection: new ChangeDetectionMetadata({properties: ['a']})
          });
          expect(humanizeTemplateAsts(parse('<div></div>', [dirA])))
              .toEqual([
                [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                [DirectiveAst, dirA, 'TestComp > div:nth-child(0)']
              ]);
        });

      });

      describe('explicit templates', () => {
        it('should create embedded templates for <template> elements', () => {
          expect(humanizeTemplateAsts(parse('<template></template>', [])))
              .toEqual([[EmbeddedTemplateAst, 'TestComp > template:nth-child(0)']]);
        });
      });

      describe('inline templates', () => {
        it('should wrap the element into an EmbeddedTemplateAST', () => {
          expect(humanizeTemplateAsts(parse('<div template>', [])))
              .toEqual([
                [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                [ElementAst, 'div', 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse bound properties', () => {
          expect(humanizeTemplateAsts(parse('<div template="ngIf test">', [ngIf])))
              .toEqual([
                [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                [DirectiveAst, ngIf, 'TestComp > div:nth-child(0)'],
                [
                  BoundDirectivePropertyAst,
                  'ngIf',
                  'test',
                  'TestComp > div:nth-child(0)[template=ngIf test]'
                ],
                [ElementAst, 'div', 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse variables via #...', () => {
          expect(humanizeTemplateAsts(parse('<div template="ngIf #a=b">', [])))
              .toEqual([
                [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=ngIf #a=b]'],
                [ElementAst, 'div', 'TestComp > div:nth-child(0)']
              ]);
        });

        it('should parse variables via var ...', () => {
          expect(humanizeTemplateAsts(parse('<div template="ngIf var a=b">', [])))
              .toEqual([
                [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=ngIf var a=b]'],
                [ElementAst, 'div', 'TestComp > div:nth-child(0)']
              ]);
        });

        describe('directives', () => {
          it('should locate directives in property bindings', () => {
            var dirA = new NormalizedDirectiveMetadata({
              selector: '[a=b]',
              type: new TypeMetadata({name: 'DirA'}),
              changeDetection: new ChangeDetectionMetadata({properties: ['a']})
            });
            var dirB = new NormalizedDirectiveMetadata(
                {selector: '[b]', type: new TypeMetadata({name: 'DirB'})});
            expect(humanizeTemplateAsts(parse('<div template="a b" b>', [dirA, dirB])))
                .toEqual([
                  [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                  [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                  [
                    BoundDirectivePropertyAst,
                    'a',
                    'b',
                    'TestComp > div:nth-child(0)[template=a b]'
                  ],
                  [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                  [AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]'],
                  [DirectiveAst, dirB, 'TestComp > div:nth-child(0)']
                ]);
          });

          it('should locate directives in variable bindings', () => {
            var dirA = new NormalizedDirectiveMetadata(
                {selector: '[a=b]', type: new TypeMetadata({name: 'DirA'})});
            var dirB = new NormalizedDirectiveMetadata(
                {selector: '[b]', type: new TypeMetadata({name: 'DirB'})});
            expect(humanizeTemplateAsts(parse('<div template="#a=b" b>', [dirA, dirB])))
                .toEqual([
                  [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                  [VariableAst, 'a', 'b', 'TestComp > div:nth-child(0)[template=#a=b]'],
                  [DirectiveAst, dirA, 'TestComp > div:nth-child(0)'],
                  [ElementAst, 'div', 'TestComp > div:nth-child(0)'],
                  [AttrAst, 'b', '', 'TestComp > div:nth-child(0)[b=]'],
                  [DirectiveAst, dirB, 'TestComp > div:nth-child(0)']
                ]);
          });

        });

        it('should work with *... and use the attribute name as property binding name', () => {
          expect(humanizeTemplateAsts(parse('<div *ng-if="test">', [ngIf])))
              .toEqual([
                [EmbeddedTemplateAst, 'TestComp > div:nth-child(0)'],
                [DirectiveAst, ngIf, 'TestComp > div:nth-child(0)'],
                [
                  BoundDirectivePropertyAst,
                  'ngIf',
                  'test',
                  'TestComp > div:nth-child(0)[*ng-if=test]'
                ],
                [ElementAst, 'div', 'TestComp > div:nth-child(0)']
              ]);
        });
      });

    });

    describe('content projection', () => {
      function createComp(selector: string, ngContentSelectors: string[]):
          NormalizedDirectiveMetadata {
        return new NormalizedDirectiveMetadata({
          selector: selector,
          isComponent: true,
          type: new TypeMetadata({name: 'SomeComp'}),
          template: new NormalizedTemplateMetadata({ngContentSelectors: ngContentSelectors})
        })
      }

      describe('project text nodes', () => {
        it('should project text nodes with wildcard selector', () => {
          expect(humanizeContentProjection(parse('<div>hello</div>', [createComp('div', ['*'])])))
              .toEqual([['div', null], ['#text(hello)', 0]]);
        });
      });

      describe('project elements', () => {
        it('should project elements with wildcard selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><span></span></div>', [createComp('div', ['*'])])))
              .toEqual([['div', null], ['span', 0]]);
        });

        it('should project elements with css selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><a x></a><b></b></div>', [createComp('div', ['a[x]'])])))
              .toEqual([['div', null], ['a', 0], ['b', null]]);
        });
      });

      describe('embedded templates', () => {
        it('should project embedded templates with wildcard selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><template></template></div>', [createComp('div', ['*'])])))
              .toEqual([['div', null], ['template', 0]]);
        });

        it('should project embedded templates with css selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><template x></template><template></template></div>',
                           [createComp('div', ['template[x]'])])))
              .toEqual([['div', null], ['template', 0], ['template', null]]);
        });
      });

      describe('ng-content', () => {
        it('should project ng-content with wildcard selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><ng-content></ng-content></div>', [createComp('div', ['*'])])))
              .toEqual([['div', null], ['ng-content', 0]]);
        });

        it('should project ng-content with css selector', () => {
          expect(humanizeContentProjection(
                     parse('<div><ng-content x></ng-content><ng-content></ng-content></div>',
                           [createComp('div', ['ng-content[x]'])])))
              .toEqual([['div', null], ['ng-content', 0], ['ng-content', null]]);
        });
      });

      it('should project into the first matching ng-content', () => {
        expect(humanizeContentProjection(
                   parse('<div>hello<b></b><a></a></div>', [createComp('div', ['a', 'b', '*'])])))
            .toEqual([['div', null], ['#text(hello)', 2], ['b', 1], ['a', 0]]);
      });

      it('should only project direct child nodes', () => {
        expect(humanizeContentProjection(
                   parse('<div><span><a></a></span><a></a></div>', [createComp('div', ['a'])])))
            .toEqual([['div', null], ['span', null], ['a', null], ['a', 0]]);
      });

      it('should project nodes of nested components', () => {
        expect(humanizeContentProjection(
                   parse('<a><b>hello</b></a>', [createComp('a', ['*']), createComp('b', ['*'])])))
            .toEqual([['a', null], ['b', 0], ['#text(hello)', 0]]);
      });

    });

    describe('splitClasses', () => {
      it('should keep an empty class', () => { expect(splitClasses('a')).toEqual(['a']); });

      it('should split 2 classes', () => { expect(splitClasses('a b')).toEqual(['a', 'b']); });

      it('should trim classes', () => { expect(splitClasses(' a  b ')).toEqual(['a', 'b']); });
    });

    describe('error cases', () => {
      it('should throw on invalid property names', () => {
        expect(() => parse('<div [invalid-prop]></div>', [])).toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known native property in TestComp > div:nth-child(0)[[invalid-prop]=]`);
      });

      it('should report errors in expressions', () => {
        expect(() => parse('<div [prop]="a b"></div>', [])).toThrowErrorWith(`Template parse errors:
Parser Error: Unexpected token 'b' at column 3 in [a b] in TestComp > div:nth-child(0)[[prop]=a b]`);
      });

      it('should not throw on invalid property names if the property is used by a directive',
         () => {
           var dirA = new NormalizedDirectiveMetadata({
             selector: 'div',
             type: new TypeMetadata({name: 'DirA'}),
             changeDetection: new ChangeDetectionMetadata({properties: ['invalidProp']})
           });
           expect(() => parse('<div [invalid-prop]></div>', [dirA])).not.toThrow();
         });

      it('should not allow more than 1 component per element', () => {
        var dirA = new NormalizedDirectiveMetadata({
          selector: 'div',
          isComponent: true,
          type: new TypeMetadata({name: 'DirA'}),
          template: new NormalizedTemplateMetadata({ngContentSelectors: []})
        });
        var dirB = new NormalizedDirectiveMetadata({
          selector: 'div',
          isComponent: true,
          type: new TypeMetadata({name: 'DirB'}),
          template: new NormalizedTemplateMetadata({ngContentSelectors: []})
        });
        expect(() => parse('<div>', [dirB, dirA])).toThrowError(`Template parse errors:
More than one component: DirA,DirB in TestComp > div:nth-child(0)`);
      });

      it('should not allow components or element nor event bindings on explicit embedded templates',
         () => {
           var dirA = new NormalizedDirectiveMetadata({
             selector: '[a]',
             isComponent: true,
             type: new TypeMetadata({name: 'DirA'}),
             template: new NormalizedTemplateMetadata({ngContentSelectors: []})
           });
           expect(() => parse('<template [a]="b" (e)="f"></template>', [dirA]))
               .toThrowError(`Template parse errors:
Components on an embedded template: DirA in TestComp > template:nth-child(0)
Property binding a not used by any directive on an embedded template in TestComp > template:nth-child(0)[[a]=b]
Event binding e on an embedded template in TestComp > template:nth-child(0)[(e)=f]`);
         });

      it('should not allow components or element bindings on inline embedded templates', () => {
        var dirA = new NormalizedDirectiveMetadata({
          selector: '[a]',
          isComponent: true,
          type: new TypeMetadata({name: 'DirA'}),
          template: new NormalizedTemplateMetadata({ngContentSelectors: []})
        });
        expect(() => parse('<div *a="b">', [dirA])).toThrowError(`Template parse errors:
Components on an embedded template: DirA in TestComp > div:nth-child(0)
Property binding a not used by any directive on an embedded template in TestComp > div:nth-child(0)[*a=b]`);
      });
    });
  });
}

export function humanizeTemplateAsts(templateAsts: TemplateAst[]): any[] {
  var humanizer = new TemplateHumanizer();
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  result: any[] = [];
  visitNgContent(ast: NgContentAst, context: any): any {
    this.result.push([NgContentAst, ast.sourceInfo]);
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.result.push([EmbeddedTemplateAst, ast.sourceInfo]);
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    this.result.push([ElementAst, ast.name, ast.sourceInfo]);
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.properties);
    templateVisitAll(this, ast.events);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitVariable(ast: VariableAst, context: any): any {
    this.result.push([VariableAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }
  visitEvent(ast: BoundEventAst, context: any): any {
    this.result.push([
      BoundEventAst,
      ast.name,
      ast.target,
      expressionUnparser.unparse(ast.handler),
      ast.sourceInfo
    ]);
    return null;
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    this.result.push([
      BoundElementPropertyAst,
      ast.type,
      ast.name,
      expressionUnparser.unparse(ast.value),
      ast.unit,
      ast.sourceInfo
    ]);
    return null;
  }
  visitAttr(ast: AttrAst, context: any): any {
    this.result.push([AttrAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }
  visitBoundText(ast: BoundTextAst, context: any): any {
    this.result.push([BoundTextAst, expressionUnparser.unparse(ast.value), ast.sourceInfo]);
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    this.result.push([TextAst, ast.value, ast.sourceInfo]);
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any {
    this.result.push([DirectiveAst, ast.directive, ast.sourceInfo]);
    templateVisitAll(this, ast.properties);
    templateVisitAll(this, ast.hostProperties);
    templateVisitAll(this, ast.hostEvents);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    this.result.push([
      BoundDirectivePropertyAst,
      ast.directiveName,
      expressionUnparser.unparse(ast.value),
      ast.sourceInfo
    ]);
    return null;
  }
}

function humanizeContentProjection(templateAsts: TemplateAst[]): any[] {
  var humanizer = new TemplateContentProjectionHumanizer();
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateContentProjectionHumanizer implements TemplateAstVisitor {
  result: any[] = [];
  visitNgContent(ast: NgContentAst, context: any): any {
    this.result.push(['ng-content', ast.ngContentIndex]);
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.result.push(['template', ast.ngContentIndex]);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    this.result.push([ast.name, ast.ngContentIndex]);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitVariable(ast: VariableAst, context: any): any { return null; }
  visitEvent(ast: BoundEventAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
  visitAttr(ast: AttrAst, context: any): any { return null; }
  visitBoundText(ast: BoundTextAst, context: any): any {
    this.result.push([`#text(${expressionUnparser.unparse(ast.value)})`, ast.ngContentIndex]);
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    this.result.push([`#text(${ast.value})`, ast.ngContentIndex]);
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
}
