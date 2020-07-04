/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, CompileDirectiveSummary, CompilePipeMetadata, CompilePipeSummary, SchemaMetadata} from '@angular/compiler';
import {TemplateAst} from '@angular/compiler/src/template_parser/template_ast';
import {TemplateParser} from '@angular/compiler/src/template_parser/template_parser';
import {inject} from '@angular/core/testing';

import {humanizeExpressionSource} from './util/expression';
import {compileDirectiveMetadataCreate, compileTemplateMetadata, createTypeMeta} from './util/metadata';

describe('expression AST absolute source spans', () => {
  const fakeTemplate = compileTemplateMetadata({animations: []});
  const fakeComponent = compileDirectiveMetadataCreate({
    isHost: false,
    selector: 'app-fake',
    template: fakeTemplate,
    type: createTypeMeta({reference: {filePath: 'fake-path', name: 'FakeComponent'}}),
    isComponent: true
  });
  const ngIf = compileDirectiveMetadataCreate({
                 selector: '[ngIf]',
                 template: fakeTemplate,
                 type: createTypeMeta({reference: {filePath: 'fake-path', name: 'NgIf'}}),
                 inputs: ['ngIf']
               }).toSummary();
  let parse: (
      template: string, directives?: CompileDirectiveSummary[], pipes?: CompilePipeSummary[],
      schemas?: SchemaMetadata[], preserveWhitespaces?: boolean) => TemplateAst[];

  beforeEach(inject([TemplateParser], (parser: TemplateParser) => {
    parse =
        (template: string, directives: CompileDirectiveSummary[] = [],
         pipes: CompilePipeSummary[]|null = null, schemas: SchemaMetadata[] = [],
         preserveWhitespaces = true): TemplateAst[] => {
          if (pipes === null) {
            pipes = [];
          }
          return parser
              .parse(
                  fakeComponent, template, directives, pipes, schemas, 'TestComponent',
                  preserveWhitespaces)
              .template;
        };
  }));

  it('should provide absolute offsets of an expression in a bound text', () => {
    expect(humanizeExpressionSource(parse('<div>{{foo}}</div>'))).toContain([
      '{{ foo }}', new AbsoluteSourceSpan(5, 12)
    ]);
  });

  it('should provide absolute offsets of an expression in a bound event', () => {
    expect(humanizeExpressionSource(parse('<div (click)="foo();bar();"></div>'))).toContain([
      'foo(); bar();', new AbsoluteSourceSpan(14, 26)
    ]);

    expect(humanizeExpressionSource(parse('<div on-click="foo();bar();"></div>'))).toContain([
      'foo(); bar();', new AbsoluteSourceSpan(15, 27)
    ]);
  });

  it('should provide absolute offsets of an expression in a bound attribute', () => {
    expect(humanizeExpressionSource(parse('<input [disabled]="condition ? true : false" />')))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(19, 43)]);

    expect(humanizeExpressionSource(parse('<input bind-disabled="condition ? true : false" />')))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(22, 46)]);
  });

  it('should provide absolute offsets of an expression in a template attribute', () => {
    const ngTemplate =
        compileDirectiveMetadataCreate({
          selector: 'ng-template',
          type: createTypeMeta({reference: {filePath: 'fake-path', name: 'OnTemplate'}})
        }).toSummary();

    expect(humanizeExpressionSource(parse('<div *ngIf="value"></div>', [ngIf, ngTemplate])))
        .toContain(['value', new AbsoluteSourceSpan(12, 17)]);
  });

  describe('binary expression', () => {
    it('should provide absolute offsets of a binary expression', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + 2}}<div>'))).toContain([
        '1 + 2', new AbsoluteSourceSpan(7, 12)
      ]);
    });

    it('should provide absolute offsets of expressions in a binary expression', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + 2}}<div>')))
          .toEqual(jasmine.arrayContaining([
            ['1', new AbsoluteSourceSpan(7, 8)],
            ['2', new AbsoluteSourceSpan(11, 12)],
          ]));
    });
  });

  describe('conditional', () => {
    it('should provide absolute offsets of a conditional', () => {
      expect(humanizeExpressionSource(parse('<div>{{bool ? 1 : 0}}<div>'))).toContain([
        'bool ? 1 : 0', new AbsoluteSourceSpan(7, 19)
      ]);
    });

    it('should provide absolute offsets of expressions in a conditional', () => {
      expect(humanizeExpressionSource(parse('<div>{{bool ? 1 : 0}}<div>')))
          .toEqual(jasmine.arrayContaining([
            ['bool', new AbsoluteSourceSpan(7, 11)],
            ['1', new AbsoluteSourceSpan(14, 15)],
            ['0', new AbsoluteSourceSpan(18, 19)],
          ]));
    });
  });

  describe('chain', () => {
    it('should provide absolute offsets of a chain', () => {
      expect(humanizeExpressionSource(parse('<div (click)="a(); b();"><div>'))).toContain([
        'a(); b();', new AbsoluteSourceSpan(14, 23)
      ]);
    });

    it('should provide absolute offsets of expressions in a chain', () => {
      expect(humanizeExpressionSource(parse('<div (click)="a(); b();"><div>')))
          .toEqual(jasmine.arrayContaining([
            ['a()', new AbsoluteSourceSpan(14, 17)],
            ['b()', new AbsoluteSourceSpan(19, 22)],
          ]));
    });
  });

  describe('function call', () => {
    it('should provide absolute offsets of a function call', () => {
      expect(humanizeExpressionSource(parse('<div>{{fn()()}}<div>'))).toContain([
        'fn()()', new AbsoluteSourceSpan(7, 13)
      ]);
    });

    it('should provide absolute offsets of expressions in a function call', () => {
      expect(humanizeExpressionSource(parse('<div>{{fn()(param)}}<div>'))).toContain([
        'param', new AbsoluteSourceSpan(12, 17)
      ]);
    });
  });

  it('should provide absolute offsets of an implicit receiver', () => {
    expect(humanizeExpressionSource(parse('<div>{{a.b}}<div>'))).toContain([
      '', new AbsoluteSourceSpan(7, 7)
    ]);
  });

  describe('interpolation', () => {
    it('should provide absolute offsets of an interpolation', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + foo.length}}<div>'))).toContain([
        '{{ 1 + foo.length }}', new AbsoluteSourceSpan(5, 23)
      ]);
    });

    it('should provide absolute offsets of expressions in an interpolation', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + 2}}<div>')))
          .toEqual(jasmine.arrayContaining([
            ['1', new AbsoluteSourceSpan(7, 8)],
            ['2', new AbsoluteSourceSpan(11, 12)],
          ]));
    });
  });

  describe('keyed read', () => {
    it('should provide absolute offsets of a keyed read', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key]}}<div>'))).toContain([
        'obj[key]', new AbsoluteSourceSpan(7, 15)
      ]);
    });

    it('should provide absolute offsets of expressions in a keyed read', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key]}}<div>'))).toContain([
        'key', new AbsoluteSourceSpan(11, 14)
      ]);
    });
  });

  describe('keyed write', () => {
    it('should provide absolute offsets of a keyed write', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key] = 0}}<div>'))).toContain([
        'obj[key] = 0', new AbsoluteSourceSpan(7, 19)
      ]);
    });

    it('should provide absolute offsets of expressions in a keyed write', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key] = 0}}<div>')))
          .toEqual(jasmine.arrayContaining([
            ['key', new AbsoluteSourceSpan(11, 14)],
            ['0', new AbsoluteSourceSpan(18, 19)],
          ]));
    });
  });

  it('should provide absolute offsets of a literal primitive', () => {
    expect(humanizeExpressionSource(parse('<div>{{100}}<div>'))).toContain([
      '100', new AbsoluteSourceSpan(7, 10)
    ]);
  });

  describe('literal array', () => {
    it('should provide absolute offsets of a literal array', () => {
      expect(humanizeExpressionSource(parse('<div>{{[0, 1, 2]}}<div>'))).toContain([
        '[0, 1, 2]', new AbsoluteSourceSpan(7, 16)
      ]);
    });

    it('should provide absolute offsets of expressions in a literal array', () => {
      expect(humanizeExpressionSource(parse('<div>{{[0, 1, 2]}}<div>')))
          .toEqual(jasmine.arrayContaining([
            ['0', new AbsoluteSourceSpan(8, 9)],
            ['1', new AbsoluteSourceSpan(11, 12)],
            ['2', new AbsoluteSourceSpan(14, 15)],
          ]));
    });
  });

  describe('literal map', () => {
    it('should provide absolute offsets of a literal map', () => {
      expect(humanizeExpressionSource(parse('<div>{{ {a: 0} }}<div>'))).toContain([
        '{a: 0}', new AbsoluteSourceSpan(8, 14)
      ]);
    });

    it('should provide absolute offsets of expressions in a literal map', () => {
      expect(humanizeExpressionSource(parse('<div>{{ {a: 0} }}<div>')))
          .toEqual(jasmine.arrayContaining([
            ['0', new AbsoluteSourceSpan(12, 13)],
          ]));
    });
  });

  describe('method call', () => {
    it('should provide absolute offsets of a method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{method()}}</div>'))).toContain([
        'method()', new AbsoluteSourceSpan(7, 15)
      ]);
    });

    it('should provide absolute offsets of expressions in a method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{method(param)}}<div>'))).toContain([
        'param', new AbsoluteSourceSpan(14, 19)
      ]);
    });
  });

  describe('non-null assert', () => {
    it('should provide absolute offsets of a non-null assert', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop!}}</div>'))).toContain([
        'prop!', new AbsoluteSourceSpan(7, 12)
      ]);
    });

    it('should provide absolute offsets of expressions in a non-null assert', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop!}}<div>'))).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('pipe', () => {
    const testPipe = new CompilePipeMetadata({
                       name: 'test',
                       type: createTypeMeta({reference: {filePath: 'fake-path', name: 'TestPipe'}}),
                       pure: false
                     }).toSummary();

    it('should provide absolute offsets of a pipe', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop | test}}<div>', [], [testPipe])))
          .toContain(['(prop | test)', new AbsoluteSourceSpan(7, 18)]);
    });

    it('should provide absolute offsets expressions in a pipe', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop | test}}<div>', [], [testPipe])))
          .toContain(['prop', new AbsoluteSourceSpan(7, 11)]);
    });
  });

  describe('property read', () => {
    it('should provide absolute offsets of a property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop.obj}}<div>'))).toContain([
        'prop.obj', new AbsoluteSourceSpan(7, 15)
      ]);
    });

    it('should provide absolute offsets of expressions in a property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop.obj}}<div>'))).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('property write', () => {
    it('should provide absolute offsets of a property write', () => {
      expect(humanizeExpressionSource(parse('<div (click)="prop = 0"></div>'))).toContain([
        'prop = 0', new AbsoluteSourceSpan(14, 22)
      ]);
    });

    it('should provide absolute offsets of an accessed property write', () => {
      expect(humanizeExpressionSource(parse('<div (click)="prop.inner = 0"></div>'))).toContain([
        'prop.inner = 0', new AbsoluteSourceSpan(14, 28)
      ]);
    });

    it('should provide absolute offsets of expressions in a property write', () => {
      expect(humanizeExpressionSource(parse('<div (click)="prop = 0"></div>'))).toContain([
        '0', new AbsoluteSourceSpan(21, 22)
      ]);
    });
  });

  describe('"not" prefix', () => {
    it('should provide absolute offsets of a "not" prefix', () => {
      expect(humanizeExpressionSource(parse('<div>{{!prop}}</div>'))).toContain([
        '!prop', new AbsoluteSourceSpan(7, 12)
      ]);
    });

    it('should provide absolute offsets of expressions in a "not" prefix', () => {
      expect(humanizeExpressionSource(parse('<div>{{!prop}}<div>'))).toContain([
        'prop', new AbsoluteSourceSpan(8, 12)
      ]);
    });
  });

  describe('safe method call', () => {
    it('should provide absolute offsets of a safe method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe()}}<div>'))).toContain([
        'prop?.safe()', new AbsoluteSourceSpan(7, 19)
      ]);
    });

    it('should provide absolute offsets of expressions in safe method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe()}}<div>'))).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('safe property read', () => {
    it('should provide absolute offsets of a safe property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe}}<div>'))).toContain([
        'prop?.safe', new AbsoluteSourceSpan(7, 17)
      ]);
    });

    it('should provide absolute offsets of expressions in safe property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe}}<div>'))).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  it('should provide absolute offsets of a quote', () => {
    expect(humanizeExpressionSource(parse('<div [class.some-class]="a:b"></div>'))).toContain([
      'a:b', new AbsoluteSourceSpan(25, 28)
    ]);
  });
});
