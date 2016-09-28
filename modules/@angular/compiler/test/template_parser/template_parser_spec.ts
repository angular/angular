/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileAnimationEntryMetadata, CompileDiDependencyMetadata, CompileDirectiveMetadata, CompilePipeMetadata, CompileProviderMetadata, CompileQueryMetadata, CompileTemplateMetadata, CompileTokenMetadata, CompileTypeMetadata} from '@angular/compiler/src/compile_metadata';
import {DomElementSchemaRegistry} from '@angular/compiler/src/schema/dom_element_schema_registry';
import {ElementSchemaRegistry} from '@angular/compiler/src/schema/element_schema_registry';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAstType, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '@angular/compiler/src/template_parser/template_ast';
import {TEMPLATE_TRANSFORMS, TemplateParser, splitClasses} from '@angular/compiler/src/template_parser/template_parser';
import {TEST_COMPILER_PROVIDERS} from '@angular/compiler/testing/test_bindings';
import {SchemaMetadata, SecurityContext, Type} from '@angular/core';
import {Console} from '@angular/core/src/console';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {Identifiers, identifierToken, resolveIdentifierToken} from '../../src/identifiers';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../../src/ml_parser/interpolation_config';
import {MockSchemaRegistry} from '../../testing/index';
import {unparse} from '../expression_parser/unparser';

const someModuleUrl = 'package:someModule';

const MOCK_SCHEMA_REGISTRY = [{
  provide: ElementSchemaRegistry,
  useValue: new MockSchemaRegistry(
      {'invalidProp': false}, {'mappedAttr': 'mappedProp'}, {'unknown': false, 'un-known': false},
      ['onEvent'], ['onEvent']),
}];

export function main() {
  var ngIf: CompileDirectiveMetadata;
  var parse: (
      template: string, directives: CompileDirectiveMetadata[], pipes?: CompilePipeMetadata[],
      schemas?: SchemaMetadata[]) => TemplateAst[];
  var console: ArrayConsole;

  function commonBeforeEach() {
    beforeEach(() => {
      console = new ArrayConsole();
      TestBed.configureCompiler({providers: [{provide: Console, useValue: console}]});
    });
    beforeEach(inject([TemplateParser], (parser: TemplateParser) => {
      var someAnimation = new CompileAnimationEntryMetadata('someAnimation', []);
      var someTemplate = new CompileTemplateMetadata({animations: [someAnimation]});
      var component = CompileDirectiveMetadata.create({
        selector: 'root',
        template: someTemplate,
        type: new CompileTypeMetadata(
            {moduleUrl: someModuleUrl, name: 'Root', reference: {} as Type<any>}),
        isComponent: true
      });
      ngIf = CompileDirectiveMetadata.create({
        selector: '[ngIf]',
        template: someTemplate,
        type: new CompileTypeMetadata(
            {moduleUrl: someModuleUrl, name: 'NgIf', reference: {} as Type<any>}),
        inputs: ['ngIf']
      });

      parse =
          (template: string, directives: CompileDirectiveMetadata[],
           pipes: CompilePipeMetadata[] = null, schemas: SchemaMetadata[] = []): TemplateAst[] => {
            if (pipes === null) {
              pipes = [];
            }
            return parser.parse(component, template, directives, pipes, schemas, 'TestComp');
          };
    }));
  }

  describe('TemplateParser template transform', () => {
    beforeEach(() => { TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS}); });

    beforeEach(() => {
      TestBed.configureCompiler({
        providers:
            [{provide: TEMPLATE_TRANSFORMS, useValue: new FooAstTransformer(), multi: true}]
      });
    });

    describe('single', () => {
      commonBeforeEach();
      it('should transform TemplateAST', () => {
        expect(humanizeTplAst(parse('<div>', []))).toEqual([[ElementAst, 'foo']]);
      });
    });

    describe('multiple', () => {
      beforeEach(() => {
        TestBed.configureCompiler({
          providers:
              [{provide: TEMPLATE_TRANSFORMS, useValue: new BarAstTransformer(), multi: true}]
        });
      });

      commonBeforeEach();
      it('should compose transformers', () => {
        expect(humanizeTplAst(parse('<div>', []))).toEqual([[ElementAst, 'bar']]);
      });
    });
  });

  describe('TemplateParser Security', () => {
    // Semi-integration test to make sure TemplateParser properly sets the security context.
    // Uses the actual DomElementSchemaRegistry.
    beforeEach(() => {
      TestBed.configureCompiler({
        providers: [
          TEST_COMPILER_PROVIDERS,
          {provide: ElementSchemaRegistry, useClass: DomElementSchemaRegistry}
        ]
      });
    });

    commonBeforeEach();

    describe('security context', () => {
      function secContext(tpl: string): SecurityContext {
        let ast = parse(tpl, []);
        let propBinding = (<ElementAst>ast[0]).inputs[0];
        return propBinding.securityContext;
      }

      it('should set for properties', () => {
        expect(secContext('<div [title]="v">')).toBe(SecurityContext.NONE);
        expect(secContext('<div [innerHTML]="v">')).toBe(SecurityContext.HTML);
      });
      it('should set for property value bindings',
         () => { expect(secContext('<div innerHTML="{{v}}">')).toBe(SecurityContext.HTML); });
      it('should set for attributes', () => {
        expect(secContext('<a [attr.href]="v">')).toBe(SecurityContext.URL);
        // NB: attributes below need to change case.
        expect(secContext('<a [attr.innerHtml]="v">')).toBe(SecurityContext.HTML);
        expect(secContext('<a [attr.formaction]="v">')).toBe(SecurityContext.URL);
      });
      it('should set for style', () => {
        expect(secContext('<a [style.backgroundColor]="v">')).toBe(SecurityContext.STYLE);
      });
    });
  });

  describe(
      'TemplateParser', () => {
        beforeEach(() => {
          TestBed.configureCompiler({providers: [TEST_COMPILER_PROVIDERS, MOCK_SCHEMA_REGISTRY]});
        });

        commonBeforeEach();

        describe('parse', () => {
          describe('nodes without bindings', () => {

            it('should parse text nodes', () => {
              expect(humanizeTplAst(parse('a', []))).toEqual([[TextAst, 'a']]);
            });

            it('should parse elements with attributes', () => {
              expect(humanizeTplAst(parse('<div a=b>', [
              ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'a', 'b']]);
            });
          });

          it('should parse ngContent', () => {
            var parsed = parse('<ng-content select="a">', []);
            expect(humanizeTplAst(parsed)).toEqual([[NgContentAst]]);
          });

          it('should parse ngContent regardless the namespace', () => {
            var parsed = parse('<svg><ng-content></ng-content></svg>', []);
            expect(humanizeTplAst(parsed)).toEqual([
              [ElementAst, ':svg:svg'],
              [NgContentAst],
            ]);
          });

          it('should parse bound text nodes', () => {
            expect(humanizeTplAst(parse('{{a}}', []))).toEqual([[BoundTextAst, '{{ a }}']]);
          });

          it('should parse with custom interpolation config',
             inject([TemplateParser], (parser: TemplateParser) => {
               const component = CompileDirectiveMetadata.create({
                 selector: 'test',
                 type: new CompileTypeMetadata(
                     {moduleUrl: someModuleUrl, name: 'Test', reference: {} as Type<any>}),
                 isComponent: true,
                 template: new CompileTemplateMetadata({interpolation: ['{%', '%}']})
               });
               expect(humanizeTplAst(parser.parse(component, '{%a%}', [], [], [], 'TestComp'), {
                 start: '{%',
                 end: '%}'
               })).toEqual([[BoundTextAst, '{% a %}']]);
             }));

          describe('bound properties', () => {

            it('should parse mixed case bound properties', () => {
              expect(humanizeTplAst(parse('<div [someProp]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'someProp', 'v', null]
              ]);
            });

            it('should parse dash case bound properties', () => {
              expect(humanizeTplAst(parse('<div [some-prop]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'some-prop', 'v', null]
              ]);
            });

            it('should normalize property names via the element schema', () => {
              expect(humanizeTplAst(parse('<div [mappedAttr]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'mappedProp', 'v', null]
              ]);
            });

            it('should parse mixed case bound attributes', () => {
              expect(humanizeTplAst(parse('<div [attr.someAttr]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Attribute, 'someAttr', 'v', null]
              ]);
            });

            it('should parse and dash case bound classes', () => {
              expect(humanizeTplAst(parse('<div [class.some-class]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Class, 'some-class', 'v', null]
              ]);
            });

            it('should parse mixed case bound classes', () => {
              expect(humanizeTplAst(parse('<div [class.someClass]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Class, 'someClass', 'v', null]
              ]);
            });

            it('should parse mixed case bound styles', () => {
              expect(humanizeTplAst(parse('<div [style.someStyle]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Style, 'someStyle', 'v', null]
              ]);
            });

            it('should report invalid prefixes', () => {
              expect(() => parse('<p [atTr.foo]>', []))
                  .toThrowError(
                      `Template parse errors:\nInvalid property name 'atTr.foo' ("<p [ERROR ->][atTr.foo]>"): TestComp@0:3`);
              expect(() => parse('<p [sTyle.foo]>', []))
                  .toThrowError(
                      `Template parse errors:\nInvalid property name 'sTyle.foo' ("<p [ERROR ->][sTyle.foo]>"): TestComp@0:3`);
              expect(() => parse('<p [Class.foo]>', []))
                  .toThrowError(
                      `Template parse errors:\nInvalid property name 'Class.foo' ("<p [ERROR ->][Class.foo]>"): TestComp@0:3`);
              expect(() => parse('<p [bar.foo]>', []))
                  .toThrowError(
                      `Template parse errors:\nInvalid property name 'bar.foo' ("<p [ERROR ->][bar.foo]>"): TestComp@0:3`);
            });

            describe('errors', () => {
              it('should throw error when binding to an unknown property', () => {
                expect(() => parse('<my-component [invalidProp]="bar"></my-component>', []))
                    .toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'my-component'.
1. If 'my-component' is an Angular component and it has 'invalidProp' input, then verify that it is part of this module.
2. If 'my-component' is a Web Component then add "CUSTOM_ELEMENTS_SCHEMA" to the '@NgModule.schemas' of this component to suppress this message.
 ("<my-component [ERROR ->][invalidProp]="bar"></my-component>"): TestComp@0:14`);
              });

              it('should throw error when binding to an unknown element w/o bindings', () => {
                expect(() => parse('<unknown></unknown>', [])).toThrowError(`Template parse errors:
'unknown' is not a known element:
1. If 'unknown' is an Angular component, then verify that it is part of this module.
2. If 'unknown' is a Web Component then add "CUSTOM_ELEMENTS_SCHEMA" to the '@NgModule.schemas' of this component to suppress this message. ("[ERROR ->]<unknown></unknown>"): TestComp@0:0`);
              });

              it('should throw error when binding to an unknown custom element w/o bindings',
                 () => {
                   expect(() => parse('<un-known></un-known>', []))
                       .toThrowError(`Template parse errors:
'un-known' is not a known element:
1. If 'un-known' is an Angular component, then verify that it is part of this module.
2. If 'un-known' is a Web Component then add "CUSTOM_ELEMENTS_SCHEMA" to the '@NgModule.schemas' of this component to suppress this message. ("[ERROR ->]<un-known></un-known>"): TestComp@0:0`);
                 });

              it('should throw error when binding to an invalid property', () => {
                expect(() => parse('<my-component [onEvent]="bar"></my-component>', []))
                    .toThrowError(`Template parse errors:
Binding to property 'onEvent' is disallowed for security reasons ("<my-component [ERROR ->][onEvent]="bar"></my-component>"): TestComp@0:14`);
              });

              it('should throw error when binding to an invalid attribute', () => {
                expect(() => parse('<my-component [attr.onEvent]="bar"></my-component>', []))
                    .toThrowError(`Template parse errors:
Binding to attribute 'onEvent' is disallowed for security reasons ("<my-component [ERROR ->][attr.onEvent]="bar"></my-component>"): TestComp@0:14`);
              });
            });

            it('should parse bound properties via [...] and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div [prop]="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null]
              ]);
            });

            it('should parse bound properties via bind- and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div bind-prop="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null]
              ]);
            });

            it('should parse bound properties via {{...}} and not report them as attributes',
               () => {
                 expect(humanizeTplAst(parse('<div prop="{{v}}">', []))).toEqual([
                   [ElementAst, 'div'],
                   [
                     BoundElementPropertyAst, PropertyBindingType.Property, 'prop', '{{ v }}', null
                   ]
                 ]);
               });

            it('should parse bound properties via bind-animate- and not report them as attributes',
               () => {
                 expect(
                     humanizeTplAst(parse('<div bind-animate-someAnimation="value2">', [], [], [])))
                     .toEqual([
                       [ElementAst, 'div'],
                       [
                         BoundElementPropertyAst, PropertyBindingType.Animation, 'someAnimation',
                         'value2', null
                       ]
                     ]);
               });

            it('should throw an error when parsing detects non-bound properties via @ that contain a value',
               () => {
                 expect(() => { parse('<div @someAnimation="value2">', [], [], []); })
                     .toThrowError(
                         /Assigning animation triggers via @prop="exp" attributes with an expression is invalid. Use property bindings \(e.g. \[@prop\]="exp"\) or use an attribute without a value \(e.g. @prop\) instead. \("<div \[ERROR ->\]@someAnimation="value2">"\): TestComp@0:5/);
               });

            it('should not issue a warning when host attributes contain a valid property-bound animation trigger',
               () => {
                 const animationEntries = [new CompileAnimationEntryMetadata('prop', [])];
                 var dirA = CompileDirectiveMetadata.create({
                   selector: 'div',
                   template: new CompileTemplateMetadata({animations: animationEntries}),
                   type: new CompileTypeMetadata(
                       {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                   host: {'[@prop]': 'expr'}
                 });

                 humanizeTplAst(parse('<div></div>', [dirA]));
                 expect(console.warnings.length).toEqual(0);
               });

            it('should throw descriptive error when a host binding is not a string expression', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'broken',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                host: {'[class.foo]': null}
              });

              expect(() => { parse('<broken></broken>', [dirA]); })
                  .toThrowError(
                      `Template parse errors:\nValue of the host property binding "class.foo" needs to be a string representing an expression but got "null" (object) ("[ERROR ->]<broken></broken>"): TestComp@0:0, Directive DirA`);
            });

            it('should throw descriptive error when a host event is not a string expression', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'broken',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                host: {'(click)': null}
              });

              expect(() => { parse('<broken></broken>', [dirA]); })
                  .toThrowError(
                      `Template parse errors:\nValue of the host listener "click" needs to be a string representing an expression but got "null" (object) ("[ERROR ->]<broken></broken>"): TestComp@0:0, Directive DirA`);
            });

            it('should not issue a warning when an animation property is bound without an expression',
               () => {
                 humanizeTplAst(parse('<div @someAnimation>', [], [], []));
                 expect(console.warnings.length).toEqual(0);
               });

            it('should parse bound properties via [@] and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div [@someAnimation]="value2">', [], [], []))).toEqual([
                [ElementAst, 'div'],
                [
                  BoundElementPropertyAst, PropertyBindingType.Animation, 'someAnimation', 'value2',
                  null
                ]
              ]);
            });
          });

          describe('events', () => {

            it('should parse bound events with a target', () => {
              expect(humanizeTplAst(parse('<div (window:event)="v">', []))).toEqual([
                [ElementAst, 'div'],
                [BoundEventAst, 'event', 'window', 'v'],
              ]);
            });

            it('should report an error on empty expression', () => {
              expect(() => parse('<div (event)="">', []))
                  .toThrowError(/Empty expressions are not allowed/);

              expect(() => parse('<div (event)="  ">', []))
                  .toThrowError(/Empty expressions are not allowed/);
            });

            it('should parse bound events via (...) and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div (event)="v">', [
              ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'event', null, 'v']]);
            });

            it('should parse event names case sensitive', () => {
              expect(humanizeTplAst(parse('<div (some-event)="v">', [
              ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'some-event', null, 'v']]);
              expect(humanizeTplAst(parse('<div (someEvent)="v">', [
              ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'someEvent', null, 'v']]);
            });

            it('should parse bound events via on- and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div on-event="v">', [
              ]))).toEqual([[ElementAst, 'div'], [BoundEventAst, 'event', null, 'v']]);
            });

            it('should allow events on explicit embedded templates that are emitted by a directive',
               () => {
                 var dirA = CompileDirectiveMetadata.create({
                   selector: 'template',
                   outputs: ['e'],
                   type: new CompileTypeMetadata(
                       {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
                 });
                 expect(humanizeTplAst(parse('<template (e)="f"></template>', [dirA]))).toEqual([
                   [EmbeddedTemplateAst],
                   [BoundEventAst, 'e', null, 'f'],
                   [DirectiveAst, dirA],
                 ]);
               });
          });

          describe('bindon', () => {
            it('should parse bound events and properties via [(...)] and not report them as attributes',
               () => {
                 expect(humanizeTplAst(parse('<div [(prop)]="v">', []))).toEqual([
                   [ElementAst, 'div'],
                   [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null],
                   [BoundEventAst, 'propChange', null, 'v = $event']
                 ]);
               });

            it('should parse bound events and properties via bindon- and not report them as attributes',
               () => {
                 expect(humanizeTplAst(parse('<div bindon-prop="v">', []))).toEqual([
                   [ElementAst, 'div'],
                   [BoundElementPropertyAst, PropertyBindingType.Property, 'prop', 'v', null],
                   [BoundEventAst, 'propChange', null, 'v = $event']
                 ]);
               });

          });

          describe('directives', () => {
            it('should order directives by the directives array in the View and match them only once',
               () => {
                 var dirA = CompileDirectiveMetadata.create({
                   selector: '[a]',
                   type: new CompileTypeMetadata(
                       {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
                 });
                 var dirB = CompileDirectiveMetadata.create({
                   selector: '[b]',
                   type: new CompileTypeMetadata(
                       {moduleUrl: someModuleUrl, name: 'DirB', reference: {} as Type<any>})
                 });
                 var dirC = CompileDirectiveMetadata.create({
                   selector: '[c]',
                   type: new CompileTypeMetadata(
                       {moduleUrl: someModuleUrl, name: 'DirC', reference: {} as Type<any>})
                 });
                 expect(humanizeTplAst(parse('<div a c b a b>', [dirA, dirB, dirC]))).toEqual([
                   [ElementAst, 'div'], [AttrAst, 'a', ''], [AttrAst, 'c', ''], [AttrAst, 'b', ''],
                   [AttrAst, 'a', ''], [AttrAst, 'b', ''], [DirectiveAst, dirA],
                   [DirectiveAst, dirB], [DirectiveAst, dirC]
                 ]);
               });

            it('should locate directives in property bindings', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: '[a=b]',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
              });
              var dirB = CompileDirectiveMetadata.create({
                selector: '[b]',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirB', reference: {} as Type<any>})
              });
              expect(humanizeTplAst(parse('<div [a]="b">', [dirA, dirB]))).toEqual([
                [ElementAst, 'div'],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'a', 'b', null],
                [DirectiveAst, dirA]
              ]);
            });

            it('should locate directives in event bindings', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: '[a]',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirB', reference: {} as Type<any>})
              });

              expect(humanizeTplAst(parse('<div (a)="b">', [dirA]))).toEqual([
                [ElementAst, 'div'], [BoundEventAst, 'a', null, 'b'], [DirectiveAst, dirA]
              ]);
            });

            it('should parse directive host properties', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                host: {'[a]': 'expr'}
              });
              expect(humanizeTplAst(parse('<div></div>', [dirA]))).toEqual([
                [ElementAst, 'div'], [DirectiveAst, dirA],
                [BoundElementPropertyAst, PropertyBindingType.Property, 'a', 'expr', null]
              ]);
            });

            it('should parse directive host listeners', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                host: {'(a)': 'expr'}
              });
              expect(humanizeTplAst(parse('<div></div>', [dirA]))).toEqual([
                [ElementAst, 'div'], [DirectiveAst, dirA], [BoundEventAst, 'a', null, 'expr']
              ]);
            });

            it('should parse directive properties', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                inputs: ['aProp']
              });
              expect(humanizeTplAst(parse('<div [aProp]="expr"></div>', [dirA]))).toEqual([
                [ElementAst, 'div'], [DirectiveAst, dirA],
                [BoundDirectivePropertyAst, 'aProp', 'expr']
              ]);
            });

            it('should parse renamed directive properties', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                inputs: ['b:a']
              });
              expect(humanizeTplAst(parse('<div [a]="expr"></div>', [dirA]))).toEqual([
                [ElementAst, 'div'], [DirectiveAst, dirA],
                [BoundDirectivePropertyAst, 'b', 'expr']
              ]);
            });

            it('should parse literal directive properties', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                inputs: ['a']
              });
              expect(humanizeTplAst(parse('<div a="literal"></div>', [dirA]))).toEqual([
                [ElementAst, 'div'], [AttrAst, 'a', 'literal'], [DirectiveAst, dirA],
                [BoundDirectivePropertyAst, 'a', '"literal"']
              ]);
            });

            it('should favor explicit bound properties over literal properties', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                inputs: ['a']
              });
              expect(humanizeTplAst(parse('<div a="literal" [a]="\'literal2\'"></div>', [dirA])))
                  .toEqual([
                    [ElementAst, 'div'], [AttrAst, 'a', 'literal'], [DirectiveAst, dirA],
                    [BoundDirectivePropertyAst, 'a', '"literal2"']
                  ]);
            });

            it('should support optional directive properties', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: 'div',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                inputs: ['a']
              });
              expect(humanizeTplAst(parse('<div></div>', [dirA]))).toEqual([
                [ElementAst, 'div'], [DirectiveAst, dirA]
              ]);
            });

          });

          describe('providers', () => {
            var nextProviderId: number;

            function createToken(value: string): CompileTokenMetadata {
              let token: CompileTokenMetadata;
              if (value.startsWith('type:')) {
                const name = value.substring(5);
                token = new CompileTokenMetadata({
                  identifier: new CompileTypeMetadata(
                      {moduleUrl: someModuleUrl, name, reference: name as any as Type<any>})
                });
              } else {
                token = new CompileTokenMetadata({value: value});
              }
              return token;
            }

            function createDep(value: string): CompileDiDependencyMetadata {
              var isOptional = false;
              if (value.startsWith('optional:')) {
                isOptional = true;
                value = value.substring(9);
              }
              var isSelf = false;
              if (value.startsWith('self:')) {
                isSelf = true;
                value = value.substring(5);
              }
              var isHost = false;
              if (value.startsWith('host:')) {
                isHost = true;
                value = value.substring(5);
              }
              return new CompileDiDependencyMetadata({
                token: createToken(value),
                isOptional: isOptional,
                isSelf: isSelf,
                isHost: isHost
              });
            }

            function createProvider(
                token: string, {multi = false, deps = []}: {multi?: boolean, deps?: string[]} = {}):
                CompileProviderMetadata {
              const name = `provider${nextProviderId++}`;
              return new CompileProviderMetadata({
                token: createToken(token),
                multi: multi,
                useClass: new CompileTypeMetadata({name, reference: name as any as Type<any>}),
                deps: deps.map(createDep)
              });
            }

            function createDir(
                selector: string,
                {providers = null, viewProviders = null, deps = [], queries = []}: {
                  providers?: CompileProviderMetadata[],
                  viewProviders?: CompileProviderMetadata[],
                  deps?: string[],
                  queries?: string[]
                } = {}): CompileDirectiveMetadata {
              var isComponent = !selector.startsWith('[');
              return CompileDirectiveMetadata.create({
                selector: selector,
                type: new CompileTypeMetadata({
                  moduleUrl: someModuleUrl,
                  name: selector,
                  diDeps: deps.map(createDep),
                  reference: selector as any as Type<any>
                }),
                isComponent: isComponent,
                template: new CompileTemplateMetadata({ngContentSelectors: []}),
                providers: providers,
                viewProviders: viewProviders,
                queries: queries.map(
                    (value) => new CompileQueryMetadata({selectors: [createToken(value)]}))
              });
            }

            beforeEach(() => { nextProviderId = 0; });

            it('should provide a component', () => {
              var comp = createDir('my-comp');
              var elAst: ElementAst = <ElementAst>parse('<my-comp>', [comp])[0];
              expect(elAst.providers.length).toBe(1);
              expect(elAst.providers[0].providerType).toBe(ProviderAstType.Component);
              expect(elAst.providers[0].providers[0].useClass).toBe(comp.type);
            });

            it('should provide a directive', () => {
              var dirA = createDir('[dirA]');
              var elAst: ElementAst = <ElementAst>parse('<div dirA>', [dirA])[0];
              expect(elAst.providers.length).toBe(1);
              expect(elAst.providers[0].providerType).toBe(ProviderAstType.Directive);
              expect(elAst.providers[0].providers[0].useClass).toBe(dirA.type);
            });

            it('should use the public providers of a directive', () => {
              var provider = createProvider('service');
              var dirA = createDir('[dirA]', {providers: [provider]});
              var elAst: ElementAst = <ElementAst>parse('<div dirA>', [dirA])[0];
              expect(elAst.providers.length).toBe(2);
              expect(elAst.providers[1].providerType).toBe(ProviderAstType.PublicService);
              expect(elAst.providers[1].providers).toEqual([provider]);
            });

            it('should use the private providers of a component', () => {
              var provider = createProvider('service');
              var comp = createDir('my-comp', {viewProviders: [provider]});
              var elAst: ElementAst = <ElementAst>parse('<my-comp>', [comp])[0];
              expect(elAst.providers.length).toBe(2);
              expect(elAst.providers[1].providerType).toBe(ProviderAstType.PrivateService);
              expect(elAst.providers[1].providers).toEqual([provider]);
            });

            it('should support multi providers', () => {
              var provider0 = createProvider('service0', {multi: true});
              var provider1 = createProvider('service1', {multi: true});
              var provider2 = createProvider('service0', {multi: true});
              var dirA = createDir('[dirA]', {providers: [provider0, provider1]});
              var dirB = createDir('[dirB]', {providers: [provider2]});
              var elAst: ElementAst = <ElementAst>parse('<div dirA dirB>', [dirA, dirB])[0];
              expect(elAst.providers.length).toBe(4);
              expect(elAst.providers[2].providers).toEqual([provider0, provider2]);
              expect(elAst.providers[3].providers).toEqual([provider1]);
            });

            it('should overwrite non multi providers', () => {
              var provider1 = createProvider('service0');
              var provider2 = createProvider('service1');
              var provider3 = createProvider('service0');
              var dirA = createDir('[dirA]', {providers: [provider1, provider2]});
              var dirB = createDir('[dirB]', {providers: [provider3]});
              var elAst: ElementAst = <ElementAst>parse('<div dirA dirB>', [dirA, dirB])[0];
              expect(elAst.providers.length).toBe(4);
              expect(elAst.providers[2].providers).toEqual([provider3]);
              expect(elAst.providers[3].providers).toEqual([provider2]);
            });

            it('should overwrite component providers by directive providers', () => {
              var compProvider = createProvider('service0');
              var dirProvider = createProvider('service0');
              var comp = createDir('my-comp', {providers: [compProvider]});
              var dirA = createDir('[dirA]', {providers: [dirProvider]});
              var elAst: ElementAst = <ElementAst>parse('<my-comp dirA>', [dirA, comp])[0];
              expect(elAst.providers.length).toBe(3);
              expect(elAst.providers[2].providers).toEqual([dirProvider]);
            });

            it('should overwrite view providers by directive providers', () => {
              var viewProvider = createProvider('service0');
              var dirProvider = createProvider('service0');
              var comp = createDir('my-comp', {viewProviders: [viewProvider]});
              var dirA = createDir('[dirA]', {providers: [dirProvider]});
              var elAst: ElementAst = <ElementAst>parse('<my-comp dirA>', [dirA, comp])[0];
              expect(elAst.providers.length).toBe(3);
              expect(elAst.providers[2].providers).toEqual([dirProvider]);
            });

            it('should overwrite directives by providers', () => {
              var dirProvider = createProvider('type:my-comp');
              var comp = createDir('my-comp', {providers: [dirProvider]});
              var elAst: ElementAst = <ElementAst>parse('<my-comp>', [comp])[0];
              expect(elAst.providers.length).toBe(1);
              expect(elAst.providers[0].providers).toEqual([dirProvider]);
            });

            it('if mixing multi and non multi providers', () => {
              var provider0 = createProvider('service0');
              var provider1 = createProvider('service0', {multi: true});
              var dirA = createDir('[dirA]', {providers: [provider0]});
              var dirB = createDir('[dirB]', {providers: [provider1]});
              expect(() => parse('<div dirA dirB>', [dirA, dirB]))
                  .toThrowError(
                      `Template parse errors:\n` +
                      `Mixing multi and non multi provider is not possible for token service0 ("[ERROR ->]<div dirA dirB>"): TestComp@0:0`);
            });

            it('should sort providers by their DI order', () => {
              var provider0 = createProvider('service0', {deps: ['type:[dir2]']});
              var provider1 = createProvider('service1');
              var dir2 = createDir('[dir2]', {deps: ['service1']});
              var comp = createDir('my-comp', {providers: [provider0, provider1]});
              var elAst: ElementAst = <ElementAst>parse('<my-comp dir2>', [comp, dir2])[0];
              expect(elAst.providers.length).toBe(4);
              expect(elAst.providers[0].providers[0].useClass).toEqual(comp.type);
              expect(elAst.providers[1].providers).toEqual([provider1]);
              expect(elAst.providers[2].providers[0].useClass).toEqual(dir2.type);
              expect(elAst.providers[3].providers).toEqual([provider0]);
            });

            it('should sort directives by their DI order', () => {
              var dir0 = createDir('[dir0]', {deps: ['type:my-comp']});
              var dir1 = createDir('[dir1]', {deps: ['type:[dir0]']});
              var dir2 = createDir('[dir2]', {deps: ['type:[dir1]']});
              var comp = createDir('my-comp');
              var elAst: ElementAst =
                  <ElementAst>parse('<my-comp dir2 dir0 dir1>', [comp, dir2, dir0, dir1])[0];
              expect(elAst.providers.length).toBe(4);
              expect(elAst.directives[0].directive).toBe(comp);
              expect(elAst.directives[1].directive).toBe(dir0);
              expect(elAst.directives[2].directive).toBe(dir1);
              expect(elAst.directives[3].directive).toBe(dir2);
            });

            it('should mark directives and dependencies of directives as eager', () => {
              var provider0 = createProvider('service0');
              var provider1 = createProvider('service1');
              var dirA =
                  createDir('[dirA]', {providers: [provider0, provider1], deps: ['service0']});
              var elAst: ElementAst = <ElementAst>parse('<div dirA>', [dirA])[0];
              expect(elAst.providers.length).toBe(3);
              expect(elAst.providers[0].providers).toEqual([provider0]);
              expect(elAst.providers[0].eager).toBe(true);
              expect(elAst.providers[1].providers[0].useClass).toEqual(dirA.type);
              expect(elAst.providers[1].eager).toBe(true);
              expect(elAst.providers[2].providers).toEqual([provider1]);
              expect(elAst.providers[2].eager).toBe(false);
            });

            it('should mark dependencies on parent elements as eager', () => {
              var provider0 = createProvider('service0');
              var provider1 = createProvider('service1');
              var dirA = createDir('[dirA]', {providers: [provider0, provider1]});
              var dirB = createDir('[dirB]', {deps: ['service0']});
              var elAst: ElementAst =
                  <ElementAst>parse('<div dirA><div dirB></div></div>', [dirA, dirB])[0];
              expect(elAst.providers.length).toBe(3);
              expect(elAst.providers[0].providers[0].useClass).toEqual(dirA.type);
              expect(elAst.providers[0].eager).toBe(true);
              expect(elAst.providers[1].providers).toEqual([provider0]);
              expect(elAst.providers[1].eager).toBe(true);
              expect(elAst.providers[2].providers).toEqual([provider1]);
              expect(elAst.providers[2].eager).toBe(false);
            });

            it('should mark queried providers as eager', () => {
              var provider0 = createProvider('service0');
              var provider1 = createProvider('service1');
              var dirA =
                  createDir('[dirA]', {providers: [provider0, provider1], queries: ['service0']});
              var elAst: ElementAst = <ElementAst>parse('<div dirA></div>', [dirA])[0];
              expect(elAst.providers.length).toBe(3);
              expect(elAst.providers[0].providers[0].useClass).toEqual(dirA.type);
              expect(elAst.providers[0].eager).toBe(true);
              expect(elAst.providers[1].providers).toEqual([provider0]);
              expect(elAst.providers[1].eager).toBe(true);
              expect(elAst.providers[2].providers).toEqual([provider1]);
              expect(elAst.providers[2].eager).toBe(false);
            });

            it('should not mark dependencies accross embedded views as eager', () => {
              var provider0 = createProvider('service0');
              var dirA = createDir('[dirA]', {providers: [provider0]});
              var dirB = createDir('[dirB]', {deps: ['service0']});
              var elAst: ElementAst =
                  <ElementAst>parse('<div dirA><div *ngIf dirB></div></div>', [dirA, dirB])[0];
              expect(elAst.providers.length).toBe(2);
              expect(elAst.providers[0].providers[0].useClass).toEqual(dirA.type);
              expect(elAst.providers[0].eager).toBe(true);
              expect(elAst.providers[1].providers).toEqual([provider0]);
              expect(elAst.providers[1].eager).toBe(false);
            });

            it('should report missing @Self() deps as errors', () => {
              var dirA = createDir('[dirA]', {deps: ['self:provider0']});
              expect(() => parse('<div dirA></div>', [dirA]))
                  .toThrowError(
                      'Template parse errors:\nNo provider for provider0 ("[ERROR ->]<div dirA></div>"): TestComp@0:0');
            });

            it('should change missing @Self() that are optional to nulls', () => {
              var dirA = createDir('[dirA]', {deps: ['optional:self:provider0']});
              var elAst: ElementAst = <ElementAst>parse('<div dirA></div>', [dirA])[0];
              expect(elAst.providers[0].providers[0].deps[0].isValue).toBe(true);
              expect(elAst.providers[0].providers[0].deps[0].value).toBe(null);
            });

            it('should report missing @Host() deps as errors', () => {
              var dirA = createDir('[dirA]', {deps: ['host:provider0']});
              expect(() => parse('<div dirA></div>', [dirA]))
                  .toThrowError(
                      'Template parse errors:\nNo provider for provider0 ("[ERROR ->]<div dirA></div>"): TestComp@0:0');
            });

            it('should change missing @Host() that are optional to nulls', () => {
              var dirA = createDir('[dirA]', {deps: ['optional:host:provider0']});
              var elAst: ElementAst = <ElementAst>parse('<div dirA></div>', [dirA])[0];
              expect(elAst.providers[0].providers[0].deps[0].isValue).toBe(true);
              expect(elAst.providers[0].providers[0].deps[0].value).toBe(null);
            });
          });

          describe('references', () => {

            it('should parse references via #... and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div #a>', [
              ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'a', null]]);
            });

            it('should parse references via ref-... and not report them as attributes', () => {
              expect(humanizeTplAst(parse('<div ref-a>', [
              ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'a', null]]);
            });

            it('should parse camel case references', () => {
              expect(humanizeTplAst(parse('<div ref-someA>', [
              ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'someA', null]]);
            });

            it('should assign references with empty value to the element', () => {
              expect(humanizeTplAst(parse('<div #a></div>', [
              ]))).toEqual([[ElementAst, 'div'], [ReferenceAst, 'a', null]]);
            });

            it('should assign references to directives via exportAs', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: '[a]',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                exportAs: 'dirA'
              });
              expect(humanizeTplAst(parse('<div a #a="dirA"></div>', [dirA]))).toEqual([
                [ElementAst, 'div'],
                [AttrAst, 'a', ''],
                [ReferenceAst, 'a', identifierToken(dirA.type)],
                [DirectiveAst, dirA],
              ]);
            });

            it('should report references with values that dont match a directive as errors', () => {
              expect(() => parse('<div #a="dirA"></div>', [])).toThrowError(`Template parse errors:
There is no directive with "exportAs" set to "dirA" ("<div [ERROR ->]#a="dirA"></div>"): TestComp@0:5`);
            });

            it('should report invalid reference names', () => {
              expect(() => parse('<div #a-b></div>', [])).toThrowError(`Template parse errors:
"-" is not allowed in reference names ("<div [ERROR ->]#a-b></div>"): TestComp@0:5`);
            });

            it('should report variables as errors', () => {
              expect(() => parse('<div let-a></div>', [])).toThrowError(`Template parse errors:
"let-" is only supported on template elements. ("<div [ERROR ->]let-a></div>"): TestComp@0:5`);
            });

            it('should report duplicate reference names', () => {
              expect(() => parse('<div #a></div><div #a></div>', []))
                  .toThrowError(`Template parse errors:
Reference "#a" is defined several times ("<div #a></div><div [ERROR ->]#a></div>"): TestComp@0:19`);

            });

            it('should not throw error when there is same reference name in different templates',
               () => {
                 expect(() => parse('<div #a><template #a><span>OK</span></template></div>', []))
                     .not.toThrowError();

               });

            it('should assign references with empty value to components', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: '[a]',
                isComponent: true,
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                exportAs: 'dirA',
                template: new CompileTemplateMetadata({ngContentSelectors: []})
              });
              expect(humanizeTplAst(parse('<div a #a></div>', [dirA]))).toEqual([
                [ElementAst, 'div'],
                [AttrAst, 'a', ''],
                [ReferenceAst, 'a', identifierToken(dirA.type)],
                [DirectiveAst, dirA],
              ]);
            });

            it('should not locate directives in references', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: '[a]',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
              });
              expect(humanizeTplAst(parse('<div ref-a>', [dirA]))).toEqual([
                [ElementAst, 'div'], [ReferenceAst, 'a', null]
              ]);
            });
          });

          describe('explicit templates', () => {
            it('should create embedded templates for <template> elements', () => {
              expect(humanizeTplAst(parse('<template></template>', [
              ]))).toEqual([[EmbeddedTemplateAst]]);
              expect(humanizeTplAst(parse('<TEMPLATE></TEMPLATE>', [
              ]))).toEqual([[EmbeddedTemplateAst]]);
            });

            it('should create embedded templates for <template> elements regardless the namespace',
               () => {
                 expect(humanizeTplAst(parse('<svg><template></template></svg>', []))).toEqual([
                   [ElementAst, ':svg:svg'],
                   [EmbeddedTemplateAst],
                 ]);
               });

            it('should support references via #...', () => {
              expect(humanizeTplAst(parse('<template #a>', []))).toEqual([
                [EmbeddedTemplateAst],
                [ReferenceAst, 'a', resolveIdentifierToken(Identifiers.TemplateRef)]
              ]);
            });

            it('should support references via ref-...', () => {
              expect(humanizeTplAst(parse('<template ref-a>', []))).toEqual([
                [EmbeddedTemplateAst],
                [ReferenceAst, 'a', resolveIdentifierToken(Identifiers.TemplateRef)]
              ]);
            });

            it('should parse variables via let-...', () => {
              expect(humanizeTplAst(parse('<template let-a="b">', [
              ]))).toEqual([[EmbeddedTemplateAst], [VariableAst, 'a', 'b']]);
            });

            it('should not locate directives in variables', () => {
              var dirA = CompileDirectiveMetadata.create({
                selector: '[a]',
                type: new CompileTypeMetadata(
                    {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
              });
              expect(humanizeTplAst(parse('<template let-a="b"></template>', [dirA]))).toEqual([
                [EmbeddedTemplateAst], [VariableAst, 'a', 'b']
              ]);
            });

          });

          describe('inline templates', () => {
            it('should wrap the element into an EmbeddedTemplateAST', () => {
              expect(humanizeTplAst(parse('<div template>', [
              ]))).toEqual([[EmbeddedTemplateAst], [ElementAst, 'div']]);
            });

            it('should wrap the element with data-template attribute into an EmbeddedTemplateAST ',
               () => {
                 expect(humanizeTplAst(parse('<div data-template>', [
                 ]))).toEqual([[EmbeddedTemplateAst], [ElementAst, 'div']]);
               });

            it('should parse bound properties', () => {
              expect(humanizeTplAst(parse('<div template="ngIf test">', [ngIf]))).toEqual([
                [EmbeddedTemplateAst], [DirectiveAst, ngIf],
                [BoundDirectivePropertyAst, 'ngIf', 'test'], [ElementAst, 'div']
              ]);
            });

            it('should report an error on variables declared with #', () => {
              expect(() => humanizeTplAst(parse('<div *ngIf="#a=b">', [])))
                  .toThrowError(/Parser Error: Unexpected token # at column 6/);
            });

            it('should parse variables via let ...', () => {
              expect(humanizeTplAst(parse('<div *ngIf="let a=b">', [
              ]))).toEqual([[EmbeddedTemplateAst], [VariableAst, 'a', 'b'], [ElementAst, 'div']]);
            });

            describe('directives', () => {
              it('should locate directives in property bindings', () => {
                var dirA = CompileDirectiveMetadata.create({
                  selector: '[a=b]',
                  type: new CompileTypeMetadata(
                      {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                  inputs: ['a']
                });
                var dirB = CompileDirectiveMetadata.create({
                  selector: '[b]',
                  type: new CompileTypeMetadata(
                      {moduleUrl: someModuleUrl, name: 'DirB', reference: {} as Type<any>})
                });
                expect(humanizeTplAst(parse('<div template="a b" b>', [dirA, dirB]))).toEqual([
                  [EmbeddedTemplateAst], [DirectiveAst, dirA],
                  [BoundDirectivePropertyAst, 'a', 'b'], [ElementAst, 'div'], [AttrAst, 'b', ''],
                  [DirectiveAst, dirB]
                ]);
              });

              it('should not locate directives in variables', () => {
                var dirA = CompileDirectiveMetadata.create({
                  selector: '[a]',
                  type: new CompileTypeMetadata(
                      {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
                });
                expect(humanizeTplAst(parse('<div template="let a=b">', [dirA]))).toEqual([
                  [EmbeddedTemplateAst], [VariableAst, 'a', 'b'], [ElementAst, 'div']
                ]);
              });

              it('should not locate directives in references', () => {
                var dirA = CompileDirectiveMetadata.create({
                  selector: '[a]',
                  type: new CompileTypeMetadata(
                      {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
                });
                expect(humanizeTplAst(parse('<div ref-a>', [dirA]))).toEqual([
                  [ElementAst, 'div'], [ReferenceAst, 'a', null]
                ]);
              });

            });

            it('should work with *... and use the attribute name as property binding name', () => {
              expect(humanizeTplAst(parse('<div *ngIf="test">', [ngIf]))).toEqual([
                [EmbeddedTemplateAst], [DirectiveAst, ngIf],
                [BoundDirectivePropertyAst, 'ngIf', 'test'], [ElementAst, 'div']
              ]);
            });

            it('should work with *... and empty value', () => {
              expect(humanizeTplAst(parse('<div *ngIf>', [ngIf]))).toEqual([
                [EmbeddedTemplateAst], [DirectiveAst, ngIf],
                [BoundDirectivePropertyAst, 'ngIf', 'null'], [ElementAst, 'div']
              ]);
            });
          });
        });

        describe('content projection', () => {
          var compCounter: any /** TODO #9100 */;
          beforeEach(() => { compCounter = 0; });

          function createComp(
              selector: string, ngContentSelectors: string[]): CompileDirectiveMetadata {
            return CompileDirectiveMetadata.create({
              selector: selector,
              isComponent: true,
              type: new CompileTypeMetadata({
                moduleUrl: someModuleUrl,
                name: `SomeComp${compCounter++}`,
                reference: {} as Type<any>
              }),
              template: new CompileTemplateMetadata({ngContentSelectors: ngContentSelectors})
            });
          }

          function createDir(selector: string): CompileDirectiveMetadata {
            return CompileDirectiveMetadata.create({
              selector: selector,
              type: new CompileTypeMetadata({
                moduleUrl: someModuleUrl,
                name: `SomeDir${compCounter++}`,
                reference: {} as Type<any>
              })
            });
          }

          describe('project text nodes', () => {
            it('should project text nodes with wildcard selector', () => {
              expect(humanizeContentProjection(parse('<div>hello</div>', [
                createComp('div', ['*'])
              ]))).toEqual([['div', null], ['#text(hello)', 0]]);
            });
          });

          describe('project elements', () => {
            it('should project elements with wildcard selector', () => {
              expect(humanizeContentProjection(parse('<div><span></span></div>', [
                createComp('div', ['*'])
              ]))).toEqual([['div', null], ['span', 0]]);
            });

            it('should project elements with css selector', () => {
              expect(humanizeContentProjection(parse('<div><a x></a><b></b></div>', [
                createComp('div', ['a[x]'])
              ]))).toEqual([['div', null], ['a', 0], ['b', null]]);
            });
          });

          describe('embedded templates', () => {
            it('should project embedded templates with wildcard selector', () => {
              expect(humanizeContentProjection(parse('<div><template></template></div>', [
                createComp('div', ['*'])
              ]))).toEqual([['div', null], ['template', 0]]);
            });

            it('should project embedded templates with css selector', () => {
              expect(humanizeContentProjection(parse(
                         '<div><template x></template><template></template></div>',
                         [createComp('div', ['template[x]'])])))
                  .toEqual([['div', null], ['template', 0], ['template', null]]);
            });
          });

          describe('ng-content', () => {
            it('should project ng-content with wildcard selector', () => {
              expect(humanizeContentProjection(parse('<div><ng-content></ng-content></div>', [
                createComp('div', ['*'])
              ]))).toEqual([['div', null], ['ng-content', 0]]);
            });

            it('should project ng-content with css selector', () => {
              expect(humanizeContentProjection(parse(
                         '<div><ng-content x></ng-content><ng-content></ng-content></div>',
                         [createComp('div', ['ng-content[x]'])])))
                  .toEqual([['div', null], ['ng-content', 0], ['ng-content', null]]);
            });
          });

          it('should project into the first matching ng-content', () => {
            expect(humanizeContentProjection(parse('<div>hello<b></b><a></a></div>', [
              createComp('div', ['a', 'b', '*'])
            ]))).toEqual([['div', null], ['#text(hello)', 2], ['b', 1], ['a', 0]]);
          });

          it('should project into wildcard ng-content last', () => {
            expect(humanizeContentProjection(parse('<div>hello<a></a></div>', [
              createComp('div', ['*', 'a'])
            ]))).toEqual([['div', null], ['#text(hello)', 0], ['a', 1]]);
          });

          it('should only project direct child nodes', () => {
            expect(humanizeContentProjection(parse('<div><span><a></a></span><a></a></div>', [
              createComp('div', ['a'])
            ]))).toEqual([['div', null], ['span', null], ['a', null], ['a', 0]]);
          });

          it('should project nodes of nested components', () => {
            expect(humanizeContentProjection(parse('<a><b>hello</b></a>', [
              createComp('a', ['*']), createComp('b', ['*'])
            ]))).toEqual([['a', null], ['b', 0], ['#text(hello)', 0]]);
          });

          it('should project children of components with ngNonBindable', () => {
            expect(
                humanizeContentProjection(parse(
                    '<div ngNonBindable>{{hello}}<span></span></div>', [createComp('div', ['*'])])))
                .toEqual([['div', null], ['#text({{hello}})', 0], ['span', 0]]);
          });

          it('should match the element when there is an inline template', () => {
            expect(humanizeContentProjection(parse('<div><b *ngIf="cond"></b></div>', [
              createComp('div', ['a', 'b']), ngIf
            ]))).toEqual([['div', null], ['template', 1], ['b', null]]);
          });

          describe('ngProjectAs', () => {
            it('should override elements', () => {
              expect(humanizeContentProjection(parse('<div><a ngProjectAs="b"></a></div>', [
                createComp('div', ['a', 'b'])
              ]))).toEqual([['div', null], ['a', 1]]);
            });

            it('should override <ng-content>', () => {
              expect(humanizeContentProjection(parse(
                         '<div><ng-content ngProjectAs="b"></ng-content></div>',
                         [createComp('div', ['ng-content', 'b'])])))
                  .toEqual([['div', null], ['ng-content', 1]]);
            });

            it('should override <template>', () => {
              expect(humanizeContentProjection(parse(
                         '<div><template ngProjectAs="b"></template></div>',
                         [createComp('div', ['template', 'b'])])))
                  .toEqual([['div', null], ['template', 1]]);
            });

            it('should override inline templates', () => {
              expect(humanizeContentProjection(parse(
                         '<div><a *ngIf="cond" ngProjectAs="b"></a></div>',
                         [createComp('div', ['a', 'b']), ngIf])))
                  .toEqual([['div', null], ['template', 1], ['a', null]]);
            });
          });

          it('should support other directives before the component', () => {
            expect(humanizeContentProjection(parse('<div>hello</div>', [
              createDir('div'), createComp('div', ['*'])
            ]))).toEqual([['div', null], ['#text(hello)', 0]]);
          });
        });

        describe('splitClasses', () => {
          it('should keep an empty class', () => { expect(splitClasses('a')).toEqual(['a']); });

          it('should split 2 classes', () => { expect(splitClasses('a b')).toEqual(['a', 'b']); });

          it('should trim classes', () => { expect(splitClasses(' a  b ')).toEqual(['a', 'b']); });
        });

        describe('error cases', () => {
          it('should report when ng-content has content', () => {
            expect(() => parse('<ng-content>content</ng-content>', []))
                .toThrowError(`Template parse errors:
<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content> ("[ERROR ->]<ng-content>content</ng-content>"): TestComp@0:0`);
          });

          it('should treat *attr on a template element as valid',
             () => { expect(() => parse('<template *ngIf>', [])).not.toThrowError(); });

          it('should treat template attribute on a template element as valid',
             () => { expect(() => parse('<template template="ngIf">', [])).not.toThrowError(); });

          it('should report when mutliple *attrs are used on the same element', () => {
            expect(() => parse('<div *ngIf *ngFor>', [])).toThrowError(`Template parse errors:
Can't have multiple template bindings on one element. Use only one attribute named 'template' or prefixed with * ("<div *ngIf [ERROR ->]*ngFor>"): TestComp@0:11`);
          });

          it('should report when mix of template and *attrs are used on the same element', () => {
            expect(() => parse('<span template="ngIf" *ngFor>', []))
                .toThrowError(`Template parse errors:
Can't have multiple template bindings on one element. Use only one attribute named 'template' or prefixed with * ("<span template="ngIf" [ERROR ->]*ngFor>"): TestComp@0:22`);
          });

          it('should report invalid property names', () => {
            expect(() => parse('<div [invalidProp]></div>', []))
                .toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'div'. ("<div [ERROR ->][invalidProp]></div>"): TestComp@0:5`);
          });

          it('should report invalid host property names', () => {
            var dirA = CompileDirectiveMetadata.create({
              selector: 'div',
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
              host: {'[invalidProp]': 'someProp'}
            });
            expect(() => parse('<div></div>', [dirA])).toThrowError(`Template parse errors:
Can't bind to 'invalidProp' since it isn't a known property of 'div'. ("[ERROR ->]<div></div>"): TestComp@0:0, Directive DirA`);
          });

          it('should report errors in expressions', () => {
            expect(() => parse('<div [prop]="a b"></div>', [])).toThrowError(`Template parse errors:
Parser Error: Unexpected token 'b' at column 3 in [a b] in TestComp@0:5 ("<div [ERROR ->][prop]="a b"></div>"): TestComp@0:5`);
          });

          it('should not throw on invalid property names if the property is used by a directive',
             () => {
               var dirA = CompileDirectiveMetadata.create({
                 selector: 'div',
                 type: new CompileTypeMetadata(
                     {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                 inputs: ['invalidProp']
               });
               expect(() => parse('<div [invalid-prop]></div>', [dirA])).not.toThrow();
             });

          it('should not allow more than 1 component per element', () => {
            var dirA = CompileDirectiveMetadata.create({
              selector: 'div',
              isComponent: true,
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
              template: new CompileTemplateMetadata({ngContentSelectors: []})
            });
            var dirB = CompileDirectiveMetadata.create({
              selector: 'div',
              isComponent: true,
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirB', reference: {} as Type<any>}),
              template: new CompileTemplateMetadata({ngContentSelectors: []})
            });
            expect(() => parse('<div>', [dirB, dirA])).toThrowError(`Template parse errors:
More than one component: DirB,DirA ("[ERROR ->]<div>"): TestComp@0:0`);
          });

          it('should not allow components or element bindings nor dom events on explicit embedded templates',
             () => {
               var dirA = CompileDirectiveMetadata.create({
                 selector: '[a]',
                 isComponent: true,
                 type: new CompileTypeMetadata(
                     {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
                 template: new CompileTemplateMetadata({ngContentSelectors: []})
               });
               expect(() => parse('<template [a]="b" (e)="f"></template>', [dirA]))
                   .toThrowError(`Template parse errors:
Event binding e not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the "directives" section. ("<template [a]="b" [ERROR ->](e)="f"></template>"): TestComp@0:18
Components on an embedded template: DirA ("[ERROR ->]<template [a]="b" (e)="f"></template>"): TestComp@0:0
Property binding a not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "directives" section. ("[ERROR ->]<template [a]="b" (e)="f"></template>"): TestComp@0:0`);
             });

          it('should not allow components or element bindings on inline embedded templates', () => {
            var dirA = CompileDirectiveMetadata.create({
              selector: '[a]',
              isComponent: true,
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
              template: new CompileTemplateMetadata({ngContentSelectors: []})
            });
            expect(() => parse('<div *a="b"></div>', [dirA])).toThrowError(`Template parse errors:
Components on an embedded template: DirA ("[ERROR ->]<div *a="b"></div>"): TestComp@0:0
Property binding a not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "directives" section. ("[ERROR ->]<div *a="b"></div>"): TestComp@0:0`);
          });
        });

        describe('ignore elements', () => {
          it('should ignore <script> elements', () => {
            expect(humanizeTplAst(parse('<script></script>a', []))).toEqual([[TextAst, 'a']]);

          });

          it('should ignore <style> elements', () => {
            expect(humanizeTplAst(parse('<style></style>a', []))).toEqual([[TextAst, 'a']]);
          });

          describe('<link rel="stylesheet">', () => {

            it('should keep <link rel="stylesheet"> elements if they have an absolute non package: url',
               () => {
                 expect(humanizeTplAst(parse('<link rel="stylesheet" href="http://someurl">a', [])))
                     .toEqual([
                       [ElementAst, 'link'], [AttrAst, 'rel', 'stylesheet'],
                       [AttrAst, 'href', 'http://someurl'], [TextAst, 'a']
                     ]);
               });

            it('should keep <link rel="stylesheet"> elements if they have no uri', () => {
              expect(humanizeTplAst(parse('<link rel="stylesheet">a', [
              ]))).toEqual([[ElementAst, 'link'], [AttrAst, 'rel', 'stylesheet'], [TextAst, 'a']]);
              expect(humanizeTplAst(parse('<link REL="stylesheet">a', [
              ]))).toEqual([[ElementAst, 'link'], [AttrAst, 'REL', 'stylesheet'], [TextAst, 'a']]);
            });

            it('should ignore <link rel="stylesheet"> elements if they have a relative uri', () => {
              expect(humanizeTplAst(parse('<link rel="stylesheet" href="./other.css">a', [
              ]))).toEqual([[TextAst, 'a']]);
              expect(humanizeTplAst(parse('<link rel="stylesheet" HREF="./other.css">a', [
              ]))).toEqual([[TextAst, 'a']]);
            });

            it('should ignore <link rel="stylesheet"> elements if they have a package: uri', () => {
              expect(humanizeTplAst(parse('<link rel="stylesheet" href="package:somePackage">a', [
              ]))).toEqual([[TextAst, 'a']]);
            });

          });

          it('should ignore bindings on children of elements with ngNonBindable', () => {
            expect(humanizeTplAst(parse('<div ngNonBindable>{{b}}</div>', [
            ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, '{{b}}']]);
          });

          it('should keep nested children of elements with ngNonBindable', () => {
            expect(humanizeTplAst(parse('<div ngNonBindable><span>{{b}}</span></div>', [])))
                .toEqual([
                  [ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [ElementAst, 'span'],
                  [TextAst, '{{b}}']
                ]);
          });

          it('should ignore <script> elements inside of elements with ngNonBindable', () => {
            expect(humanizeTplAst(parse('<div ngNonBindable><script></script>a</div>', [
            ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, 'a']]);
          });

          it('should ignore <style> elements inside of elements with ngNonBindable', () => {
            expect(humanizeTplAst(parse('<div ngNonBindable><style></style>a</div>', [
            ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, 'a']]);
          });

          it('should ignore <link rel="stylesheet"> elements inside of elements with ngNonBindable',
             () => {
               expect(humanizeTplAst(parse('<div ngNonBindable><link rel="stylesheet">a</div>', [
               ]))).toEqual([[ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''], [TextAst, 'a']]);
             });

          it('should convert <ng-content> elements into regular elements inside of elements with ngNonBindable',
             () => {
               expect(
                   humanizeTplAst(parse('<div ngNonBindable><ng-content></ng-content>a</div>', [])))
                   .toEqual([
                     [ElementAst, 'div'], [AttrAst, 'ngNonBindable', ''],
                     [ElementAst, 'ng-content'], [TextAst, 'a']
                   ]);
             });

        });

        describe('source spans', () => {
          it('should support ng-content', () => {
            var parsed = parse('<ng-content select="a">', []);
            expect(humanizeTplAstSourceSpans(parsed)).toEqual([
              [NgContentAst, '<ng-content select="a">']
            ]);
          });

          it('should support embedded template', () => {
            expect(humanizeTplAstSourceSpans(parse('<template></template>', [
            ]))).toEqual([[EmbeddedTemplateAst, '<template>']]);

          });

          it('should support element and attributes', () => {
            expect(humanizeTplAstSourceSpans(parse('<div key=value>', []))).toEqual([
              [ElementAst, 'div', '<div key=value>'], [AttrAst, 'key', 'value', 'key=value']
            ]);

          });

          it('should support references', () => {
            expect(humanizeTplAstSourceSpans(parse('<div #a></div>', [
            ]))).toEqual([[ElementAst, 'div', '<div #a>'], [ReferenceAst, 'a', null, '#a']]);
          });

          it('should support variables', () => {
            expect(humanizeTplAstSourceSpans(parse('<template let-a="b"></template>', [])))
                .toEqual([
                  [EmbeddedTemplateAst, '<template let-a="b">'],
                  [VariableAst, 'a', 'b', 'let-a="b"']
                ]);
          });

          it('should support events', () => {
            expect(humanizeTplAstSourceSpans(parse('<div (window:event)="v">', []))).toEqual([
              [ElementAst, 'div', '<div (window:event)="v">'],
              [BoundEventAst, 'event', 'window', 'v', '(window:event)="v"']
            ]);

          });

          it('should support element property', () => {
            expect(humanizeTplAstSourceSpans(parse('<div [someProp]="v">', []))).toEqual([
              [ElementAst, 'div', '<div [someProp]="v">'],
              [
                BoundElementPropertyAst, PropertyBindingType.Property, 'someProp', 'v', null,
                '[someProp]="v"'
              ]
            ]);
          });

          it('should support bound text', () => {
            expect(humanizeTplAstSourceSpans(parse('{{a}}', [
            ]))).toEqual([[BoundTextAst, '{{ a }}', '{{a}}']]);
          });

          it('should support text nodes', () => {
            expect(humanizeTplAstSourceSpans(parse('a', []))).toEqual([[TextAst, 'a', 'a']]);
          });

          it('should support directive', () => {
            var dirA = CompileDirectiveMetadata.create({
              selector: '[a]',
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
            });
            var comp = CompileDirectiveMetadata.create({
              selector: 'div',
              isComponent: true,
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'ZComp', reference: {} as Type<any>}),
              template: new CompileTemplateMetadata({ngContentSelectors: []})
            });
            expect(humanizeTplAstSourceSpans(parse('<div a>', [dirA, comp]))).toEqual([
              [ElementAst, 'div', '<div a>'], [AttrAst, 'a', '', 'a'],
              [DirectiveAst, dirA, '<div a>'], [DirectiveAst, comp, '<div a>']
            ]);
          });

          it('should support directive in namespace', () => {
            var tagSel = CompileDirectiveMetadata.create({
              selector: 'circle',
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'elDir', reference: {} as Type<any>})
            });
            var attrSel = CompileDirectiveMetadata.create({
              selector: '[href]',
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'attrDir', reference: {} as Type<any>})
            });

            expect(humanizeTplAstSourceSpans(
                       parse('<svg><circle /><use xlink:href="Port" /></svg>', [tagSel, attrSel])))
                .toEqual([
                  [ElementAst, ':svg:svg', '<svg>'],
                  [ElementAst, ':svg:circle', '<circle />'],
                  [DirectiveAst, tagSel, '<circle />'],
                  [ElementAst, ':svg:use', '<use xlink:href="Port" />'],
                  [AttrAst, ':xlink:href', 'Port', 'xlink:href="Port"'],
                  [DirectiveAst, attrSel, '<use xlink:href="Port" />'],
                ]);
          });

          it('should support directive property', () => {
            var dirA = CompileDirectiveMetadata.create({
              selector: 'div',
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>}),
              inputs: ['aProp']
            });
            expect(humanizeTplAstSourceSpans(parse('<div [aProp]="foo"></div>', [dirA]))).toEqual([
              [ElementAst, 'div', '<div [aProp]="foo">'],
              [DirectiveAst, dirA, '<div [aProp]="foo">'],
              [BoundDirectivePropertyAst, 'aProp', 'foo', '[aProp]="foo"']
            ]);
          });

        });

        describe('pipes', () => {
          it('should allow pipes that have been defined as dependencies', () => {
            var testPipe = new CompilePipeMetadata({
              name: 'test',
              type: new CompileTypeMetadata(
                  {moduleUrl: someModuleUrl, name: 'DirA', reference: {} as Type<any>})
            });
            expect(() => parse('{{a | test}}', [], [testPipe])).not.toThrow();
          });

          it('should report pipes as error that have not been defined as dependencies', () => {
            expect(() => parse('{{a | test}}', [])).toThrowError(`Template parse errors:
The pipe 'test' could not be found ("[ERROR ->]{{a | test}}"): TestComp@0:0`);
          });

        });

        describe('ICU messages', () => {
          it('should expand plural messages', () => {
            const shortForm = '{ count, plural, =0 {small} many {big} }';
            const expandedForm = '<ng-container [ngPlural]="count">' +
                '<template ngPluralCase="=0">small</template>' +
                '<template ngPluralCase="many">big</template>' +
                '</ng-container>';

            expect(humanizeTplAst(parse(shortForm, [
            ]))).toEqual(humanizeTplAst(parse(expandedForm, [])));
          });

          it('should expand other messages', () => {
            const shortForm = '{ sex, gender, =f {foo} other {bar} }';
            const expandedForm = '<ng-container [ngSwitch]="sex">' +
                '<template ngSwitchCase="=f">foo</template>' +
                '<template ngSwitchCase="other">bar</template>' +
                '</ng-container>';

            expect(humanizeTplAst(parse(shortForm, [
            ]))).toEqual(humanizeTplAst(parse(expandedForm, [])));
          });

          it('should be possible to escape ICU messages', () => {
            const escapedForm = 'escaped {{ "{" }}  }';

            expect(humanizeTplAst(parse(escapedForm, []))).toEqual([
              [BoundTextAst, 'escaped {{ "{" }}  }'],
            ]);
          });
        });
      });
}

function humanizeTplAst(
    templateAsts: TemplateAst[], interpolationConfig?: InterpolationConfig): any[] {
  const humanizer = new TemplateHumanizer(false, interpolationConfig);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

function humanizeTplAstSourceSpans(
    templateAsts: TemplateAst[], interpolationConfig?: InterpolationConfig): any[] {
  const humanizer = new TemplateHumanizer(true, interpolationConfig);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  result: any[] = [];

  constructor(
      private includeSourceSpan: boolean,
      private interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG){};

  visitNgContent(ast: NgContentAst, context: any): any {
    var res = [NgContentAst];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    var res = [EmbeddedTemplateAst];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.references);
    templateVisitAll(this, ast.variables);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    var res = [ElementAst, ast.name];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.references);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitReference(ast: ReferenceAst, context: any): any {
    var res = [ReferenceAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitVariable(ast: VariableAst, context: any): any {
    var res = [VariableAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitEvent(ast: BoundEventAst, context: any): any {
    var res = [BoundEventAst, ast.name, ast.target, unparse(ast.handler, this.interpolationConfig)];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    var res = [
      BoundElementPropertyAst, ast.type, ast.name, unparse(ast.value, this.interpolationConfig),
      ast.unit
    ];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitAttr(ast: AttrAst, context: any): any {
    var res = [AttrAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitBoundText(ast: BoundTextAst, context: any): any {
    var res = [BoundTextAst, unparse(ast.value, this.interpolationConfig)];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    var res = [TextAst, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any {
    var res = [DirectiveAst, ast.directive];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostProperties);
    templateVisitAll(this, ast.hostEvents);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    var res = [
      BoundDirectivePropertyAst, ast.directiveName, unparse(ast.value, this.interpolationConfig)
    ];
    this.result.push(this._appendContext(ast, res));
    return null;
  }

  private _appendContext(ast: TemplateAst, input: any[]): any[] {
    if (!this.includeSourceSpan) return input;
    input.push(ast.sourceSpan.toString());
    return input;
  }
}

function sourceInfo(ast: TemplateAst): string {
  return `${ast.sourceSpan}: ${ast.sourceSpan.start}`;
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
  visitReference(ast: ReferenceAst, context: any): any { return null; }
  visitVariable(ast: VariableAst, context: any): any { return null; }
  visitEvent(ast: BoundEventAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
  visitAttr(ast: AttrAst, context: any): any { return null; }
  visitBoundText(ast: BoundTextAst, context: any): any {
    this.result.push([`#text(${unparse(ast.value)})`, ast.ngContentIndex]);
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    this.result.push([`#text(${ast.value})`, ast.ngContentIndex]);
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
}

class FooAstTransformer implements TemplateAstVisitor {
  visitNgContent(ast: NgContentAst, context: any): any { throw 'not implemented'; }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any { throw 'not implemented'; }
  visitElement(ast: ElementAst, context: any): any {
    if (ast.name != 'div') return ast;
    return new ElementAst(
        'foo', [], [], [], [], [], [], false, [], ast.ngContentIndex, ast.sourceSpan);
  }
  visitReference(ast: ReferenceAst, context: any): any { throw 'not implemented'; }
  visitVariable(ast: VariableAst, context: any): any { throw 'not implemented'; }
  visitEvent(ast: BoundEventAst, context: any): any { throw 'not implemented'; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { throw 'not implemented'; }
  visitAttr(ast: AttrAst, context: any): any { throw 'not implemented'; }
  visitBoundText(ast: BoundTextAst, context: any): any { throw 'not implemented'; }
  visitText(ast: TextAst, context: any): any { throw 'not implemented'; }
  visitDirective(ast: DirectiveAst, context: any): any { throw 'not implemented'; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    throw 'not implemented';
  }
}

class BarAstTransformer extends FooAstTransformer {
  visitElement(ast: ElementAst, context: any): any {
    if (ast.name != 'foo') return ast;
    return new ElementAst(
        'bar', [], [], [], [], [], [], false, [], ast.ngContentIndex, ast.sourceSpan);
  }
}

class ArrayConsole implements Console {
  logs: string[] = [];
  warnings: string[] = [];
  log(msg: string) { this.logs.push(msg); }
  warn(msg: string) { this.warnings.push(msg); }
}
