/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {initMockFileSystem} from '../../file_system/testing';
import {Reference} from '../../imports';
import {OptimizeFor, TypeCheckingConfig} from '../api';
import {ALL_ENABLED_CONFIG, setup, tcb, TestDeclaration, TestDirective} from '../testing';

describe('type check blocks', () => {
  beforeEach(() => initMockFileSystem('Native'));

  it('should generate a basic block for a binding', () => {
    expect(tcb('{{hello}} {{world}}')).toContain('"" + (((this).hello)) + (((this).world));');
  });

  it('should generate an animation leave function call', () => {
    const TEMPLATE = '<p (animate.leave)="animateFn($event)"></p>';
    const results = tcb(TEMPLATE);
    expect(results).toContain(
      '($event: i1.AnimationCallbackEvent): any => { (this).animateFn($event); };',
    );
  });

  it('should generate literal map expressions', () => {
    const TEMPLATE = '{{ method({foo: a, bar: b}) }}';
    expect(tcb(TEMPLATE)).toContain('(this).method({ "foo": ((this).a), "bar": ((this).b) })');
  });

  it('should generate literal array expressions', () => {
    const TEMPLATE = '{{ method([a, b]) }}';
    expect(tcb(TEMPLATE)).toContain('(this).method([((this).a), ((this).b)])');
  });

  it('should handle non-null assertions', () => {
    const TEMPLATE = `{{a!}}`;
    expect(tcb(TEMPLATE)).toContain('((((this).a))!)');
  });

  it('should handle unary - operator', () => {
    const TEMPLATE = `{{-1}}`;
    expect(tcb(TEMPLATE)).toContain('(-1)');
  });

  it('should assert the type for DOM events bound on void elements', () => {
    const result = tcb(`<input (input)="handleInput($event.target.value)">`);
    expect(result).toContain('i1.ɵassertType<typeof _t1>($event.target);');
    expect(result).toContain('(this).handleInput((((($event).target)).value));');
  });

  it('should handle keyed property access', () => {
    const TEMPLATE = `{{a[b]}}`;
    expect(tcb(TEMPLATE)).toContain('(((this).a))[((this).b)]');
  });

  it('should handle nested ternary expressions', () => {
    const TEMPLATE = `{{a ? b : c ? d : e}}`;
    expect(tcb(TEMPLATE)).toContain(
      '(((this).a) ? ((this).b) : ((((this).c) ? ((this).d) : (((this).e)))))',
    );
  });

  it('should handle nullish coalescing operator', () => {
    expect(tcb('{{ a ?? b }}')).toContain('((((this).a)) ?? (((this).b)))');
    expect(tcb('{{ a ?? b ?? c }}')).toContain('(((((this).a)) ?? (((this).b))) ?? (((this).c)))');
    expect(tcb('{{ (a ?? b) + (c ?? e) }}')).toContain(
      '((((((this).a)) ?? (((this).b)))) + (((((this).c)) ?? (((this).e)))))',
    );
  });

  it('should handle typeof expressions', () => {
    expect(tcb('{{typeof a}}')).toContain('typeof (((this).a))');
    expect(tcb('{{!(typeof a)}}')).toContain('!((typeof (((this).a))))');
    expect(tcb('{{!(typeof a === "object")}}')).toContain(
      '!(((typeof (((this).a))) === ("object")))',
    );
  });

  it('should handle void expressions', () => {
    expect(tcb('{{void a}}')).toContain('void (((this).a))');
    expect(tcb('{{!(void a)}}')).toContain('!((void (((this).a))))');
    expect(tcb('{{!(void a === "object")}}')).toContain('!(((void (((this).a))) === ("object")))');
  });

  it('should handle assignment expressions', () => {
    expect(tcb('<b (click)="a = b"></b>')).toContain('(((this).a)) = (((this).b));');
    expect(tcb('<b (click)="a += b"></b>')).toContain('(((this).a)) += (((this).b));');
    expect(tcb('<b (click)="a -= b"></b>')).toContain('(((this).a)) -= (((this).b));');
    expect(tcb('<b (click)="a *= b"></b>')).toContain('(((this).a)) *= (((this).b));');
    expect(tcb('<b (click)="a /= b"></b>')).toContain('(((this).a)) /= (((this).b));');
    expect(tcb('<b (click)="a %= b"></b>')).toContain('(((this).a)) %= (((this).b));');
    expect(tcb('<b (click)="a **= b"></b>')).toContain('(((this).a)) **= (((this).b));');
    expect(tcb('<b (click)="a &&= b"></b>')).toContain('(((this).a)) &&= (((this).b));');
    expect(tcb('<b (click)="a ||= b"></b>')).toContain('(((this).a)) ||= (((this).b));');
    expect(tcb('<b (click)="a ??= b"></b>')).toContain('(((this).a)) ??= (((this).b));');
  });

  it('should handle exponentiation expressions', () => {
    expect(tcb('{{a * b ** c + d}}')).toContain(
      '(((((this).a)) * ((((this).b)) ** (((this).c)))) + (((this).d)))',
    );
    expect(tcb('{{a ** b ** c}}')).toContain('((((this).a)) ** ((((this).b)) ** (((this).c))))');
  });

  it('should handle "in" expressions', () => {
    expect(tcb(`{{'bar' in {bar: 'bar'} }}`)).toContain(`(("bar") in ({ "bar": "bar" }))`);
    expect(tcb(`{{!('bar' in {bar: 'bar'}) }}`)).toContain(`!((("bar") in ({ "bar": "bar" })))`);
  });

  it('should handle attribute values for directive inputs', () => {
    const TEMPLATE = `<div dir inputA="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'DirA',
        selector: '[dir]',
        inputs: {inputA: 'inputA'},
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t1 = null! as i0.DirA; _t1.inputA = ("value");');
  });

  it('should handle multiple bindings to the same property', () => {
    const TEMPLATE = `<div dir-a [inputA]="1" [inputA]="2"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('_t1.inputA = (1);');
    expect(block).toContain('_t1.inputA = (2);');
  });

  it('should handle empty bindings', () => {
    const TEMPLATE = `<div dir-a [inputA]=""></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t1.inputA = (undefined);');
  });

  it('should handle bindings without value', () => {
    const TEMPLATE = `<div dir-a [inputA]></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t1.inputA = (undefined);');
  });

  it('should handle implicit vars on ng-template', () => {
    const TEMPLATE = `<ng-template let-a></ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should handle method calls of template variables', () => {
    const TEMPLATE = `<ng-template let-a>{{a(1)}}</ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
    expect(tcb(TEMPLATE)).toContain('_t2(1)');
  });

  it('should handle implicit vars when using microsyntax', () => {
    const TEMPLATE = `<div *ngFor="let user of users"></div>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should handle direct calls of an implicit template variable', () => {
    const TEMPLATE = `<div *ngFor="let a of letters">{{a(1)}}</div>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
    expect(tcb(TEMPLATE)).toContain('_t2(1)');
  });

  it('should handle template literals', () => {
    expect(tcb('{{ `hello world` }}')).toContain('"" + (`hello world`);');
    expect(tcb('{{ `hello \\${name}!!!` }}')).toContain('"" + (`hello \\${name}!!!`);');
    expect(tcb('{{ `${a} - ${b} - ${c}` }}')).toContain(
      '"" + (`${((this).a)} - ${((this).b)} - ${((this).c)}`);',
    );
  });

  it('should handle tagged template literals', () => {
    expect(tcb('{{ tag`hello world` }}')).toContain('"" + (((this).tag) `hello world`);');
    expect(tcb('{{ tag`hello \\${name}!!!` }}')).toContain(
      '"" + (((this).tag) `hello \\${name}!!!`);',
    );
    expect(tcb('{{ tag`${a} - ${b} - ${c}` }}')).toContain(
      '"" + (((this).tag) `${((this).a)} - ${((this).b)} - ${((this).c)}`);',
    );
  });

  describe('type constructors', () => {
    it('should handle missing property bindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: 'inputA',
            fieldB: 'inputB',
          },
          isGeneric: true,
        },
      ];
      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
        'const _ctor1: <T extends string = any>(init: Pick<i0.Dir<T>, "fieldA" | "fieldB">) => i0.Dir<T> = null!;',
      );
      expect(actual).toContain(
        'var _t1 = _ctor1({ "fieldA": (((this).foo)), "fieldB": 0 as any });',
      );
    });

    it('should handle multiple bindings to the same property', () => {
      const TEMPLATE = `<div dir [inputA]="1" [inputA]="2"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: 'inputA',
          },
          isGeneric: true,
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('"fieldA": (1)');
      expect(block).not.toContain('"fieldA": (2)');
    });

    it('should only apply property bindings to directives', () => {
      const TEMPLATE = `
      <div dir [style.color]="'blue'" [class.strong]="false" [attr.enabled]="true"></div>
    `;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {'color': 'color', 'strong': 'strong', 'enabled': 'enabled'},
          isGeneric: true,
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('Dir.ngTypeCtor');
      expect(block).toContain('"blue"; false; true;');
    });

    it('should generate a circular directive reference correctly', () => {
      const TEMPLATE = `
      <div dir #d="dir" [input]="d"></div>
    `;
      const DIRECTIVES: TestDirective[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          exportAs: ['dir'],
          inputs: {input: 'input'},
          isGeneric: true,
        },
      ];

      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
        'const _ctor1: <T extends string = any>(init: Pick<i0.Dir<T>, "input">) => i0.Dir<T> = null!;',
      );
      expect(actual).toContain(
        'var _t2 = _ctor1({ "input": (null!) }); ' + 'var _t1 = _t2; ' + '_t2.input = (_t1);',
      );
    });

    it('should generate circular references between two directives correctly', () => {
      const TEMPLATE = `
    <div #a="dirA" dir-a [inputA]="b">A</div>
    <div #b="dirB" dir-b [inputB]="a">B</div>
`;
      const DIRECTIVES: TestDirective[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          exportAs: ['dirA'],
          inputs: {inputA: 'inputA'},
          isGeneric: true,
        },
        {
          type: 'directive',
          name: 'DirB',
          selector: '[dir-b]',
          exportAs: ['dirB'],
          inputs: {inputB: 'inputB'},
          isGeneric: true,
        },
      ];
      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
        'const _ctor1: <T extends string = any>(init: Pick<i0.DirA<T>, "inputA">) => i0.DirA<T> = null!; const _ctor2: <T extends string = any>(init: Pick<i0.DirB<T>, "inputB">) => i0.DirB<T> = null!;',
      );
      expect(actual).toContain(
        'var _t4 = _ctor1({ "inputA": (null!) }); ' +
          'var _t3 = _t4; ' +
          'var _t2 = _ctor2({ "inputB": (_t3) }); ' +
          'var _t1 = _t2; ' +
          '_t4.inputA = (_t1); ' +
          '_t2.inputB = (_t3);',
      );
    });

    it('should handle empty bindings', () => {
      const TEMPLATE = `<div dir-a [inputA]=""></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          inputs: {inputA: 'inputA'},
          isGeneric: true,
        },
      ];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain('"inputA": (undefined)');
    });

    it('should handle bindings without value', () => {
      const TEMPLATE = `<div dir-a [inputA]></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          inputs: {inputA: 'inputA'},
          isGeneric: true,
        },
      ];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain('"inputA": (undefined)');
    });

    it('should use coercion types if declared', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: 'inputA',
          },
          isGeneric: true,
          coercedInputFields: ['fieldA'],
        },
      ];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
        'var _t1 = null! as typeof i0.Dir.ngAcceptInputType_fieldA; ' + '_t1 = (((this).foo));',
      );
    });
  });

  it('should only generate code for DOM elements that are actually referenced', () => {
    const TEMPLATE = `
      <div></div>
      <button #me (click)="handle(me)"></button>
    `;
    const block = tcb(TEMPLATE);
    expect(block).not.toContain('"div"');
    expect(block).toContain(
      'var _t1 = document.createElement("button"); ' + 'var _t2 = _t1; ' + '_t1.addEventListener',
    );
  });

  it('should generate code for event targeting `window`', () => {
    const block = tcb(`<button (window:scroll)="handle()"></button>`);
    expect(block).toContain(
      'window.addEventListener("scroll", ($event): any => { (this).handle(); });',
    );
  });

  it('should generate code for event targeting `document`', () => {
    const block = tcb(`<button (document:click)="handle()"></button>`);
    expect(block).toContain(
      'document.addEventListener("click", ($event): any => { (this).handle(); });',
    );
  });

  it('should only generate directive declarations that have bindings or are referenced', () => {
    const TEMPLATE = `
      <div
        hasInput [input]="value"
        hasOutput (output)="handle()"
        hasReference #ref="ref"
        noReference
        noBindings>{{ref.a}}</div>
    `;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'HasInput',
        selector: '[hasInput]',
        inputs: {input: 'input'},
      },
      {
        type: 'directive',
        name: 'HasOutput',
        selector: '[hasOutput]',
        outputs: {output: 'output'},
      },
      {
        type: 'directive',
        name: 'HasReference',
        selector: '[hasReference]',
        exportAs: ['ref'],
      },
      {
        type: 'directive',
        name: 'NoReference',
        selector: '[noReference]',
        exportAs: ['no-ref'],
      },
      {
        type: 'directive',
        name: 'NoBindings',
        selector: '[noBindings]',
        inputs: {unset: 'unset'},
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('var _t1 = null! as i0.HasInput');
    expect(block).toContain('_t1.input = (((this).value));');
    expect(block).toContain('var _t2 = null! as i0.HasOutput');
    expect(block).toContain('_t2["output"]');
    expect(block).toContain('var _t4 = null! as i0.HasReference');
    expect(block).toContain('var _t3 = _t4;');
    expect(block).toContain('(_t3).a');
    expect(block).not.toContain('NoBindings');
    expect(block).not.toContain('NoReference');
  });

  it('should generate a forward element reference correctly', () => {
    const TEMPLATE = `
      {{ i.value }}
      <input #i>
    `;
    expect(tcb(TEMPLATE)).toContain(
      'var _t2 = document.createElement("input"); var _t1 = _t2; "" + (((_t1).value));',
    );
  });

  it('should generate a forward directive reference correctly', () => {
    const TEMPLATE = `
      {{d.value}}
      <div dir #d="dir"></div>
    `;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t2 = null! as i0.Dir; ' + 'var _t1 = _t2; ' + '"" + (((_t1).value));',
    );
  });

  it('should handle style and class bindings specially', () => {
    const TEMPLATE = `
      <div [style]="a" [class]="b"></div>
    `;
    const block = tcb(TEMPLATE);
    expect(block).toContain('((this).a); ((this).b);');

    // There should be no assignments to the class or style properties.
    expect(block).not.toContain('.class = ');
    expect(block).not.toContain('.style = ');
  });

  it('should only apply property bindings to directives', () => {
    const TEMPLATE = `
      <div dir [style.color]="'blue'" [class.strong]="false" [attr.enabled]="true"></div>
    `;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {'color': 'color', 'strong': 'strong', 'enabled': 'enabled'},
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1 = null! as Dir;');
    expect(block).not.toContain('"color"');
    expect(block).not.toContain('"strong"');
    expect(block).not.toContain('"enabled"');
    expect(block).toContain('"blue"; false; true;');
  });

  it('should generate a circular directive reference correctly', () => {
    const TEMPLATE = `
      <div dir #d="dir" [input]="d"></div>
    `;
    const DIRECTIVES: TestDirective[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
        inputs: {input: 'input'},
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t2 = null! as i0.Dir; ' + 'var _t1 = _t2; ' + '_t2.input = (_t1);',
    );
  });

  it('should generate circular references between two directives correctly', () => {
    const TEMPLATE = `
    <div #a="dirA" dir-a [inputA]="b">A</div>
    <div #b="dirB" dir-b [inputB]="a">B</div>
`;
    const DIRECTIVES: TestDirective[] = [
      {
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        exportAs: ['dirA'],
        inputs: {inputA: 'inputA'},
      },
      {
        type: 'directive',
        name: 'DirB',
        selector: '[dir-b]',
        exportAs: ['dirB'],
        inputs: {inputA: 'inputB'},
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t2 = null! as i0.DirB; ' +
        'var _t1 = _t2; ' +
        'var _t3 = null! as i0.DirA; ' +
        '_t3.inputA = (_t1); ' +
        'var _t4 = _t3; ' +
        '_t2.inputA = (_t4);',
    );
  });

  it('should handle undeclared properties', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        undeclaredInputFields: ['fieldA'],
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1 = null! as Dir;');
    expect(block).toContain('(((this).foo)); ');
  });

  it('should assign restricted properties to temp variables by default', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        restrictedInputFields: ['fieldA'],
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t1 = null! as i0.Dir; ' +
        'var _t2 = null! as (typeof _t1)["fieldA"]; ' +
        '_t2 = (((this).foo)); ',
    );
  });

  it('should assign properties via element access for field names that are not JS identifiers', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          'some-input.xs': 'inputA',
        },
        stringLiteralInputFields: ['some-input.xs'],
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain(
      'var _t1 = null! as i0.Dir; ' + '_t1["some-input.xs"] = (((this).foo)); ',
    );
  });

  it('should handle a single property bound to multiple fields', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          field1: 'inputA',
          field2: 'inputA',
        },
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t1 = null! as i0.Dir; ' + '_t1.field2 = _t1.field1 = (((this).foo));',
    );
  });

  it('should handle a single property bound to multiple fields, where one of them is coerced', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          field1: 'inputA',
          field2: 'inputA',
        },
        coercedInputFields: ['field1'],
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t1 = null! as typeof i0.Dir.ngAcceptInputType_field1; ' +
        'var _t2 = null! as i0.Dir; ' +
        '_t2.field2 = _t1 = (((this).foo));',
    );
  });

  it('should handle a single property bound to multiple fields, where one of them is undeclared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          field1: 'inputA',
          field2: 'inputA',
        },
        undeclaredInputFields: ['field1'],
      },
    ];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain(
      'var _t1 = null! as i0.Dir; ' + '_t1.field2 = (((this).foo));',
    );
  });

  it('should use coercion types if declared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        coercedInputFields: ['fieldA'],
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1 = null! as Dir;');
    expect(block).toContain(
      'var _t1 = null! as typeof i0.Dir.ngAcceptInputType_fieldA; ' + '_t1 = (((this).foo));',
    );
  });

  it('should use coercion types if declared, even when backing field is not declared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        coercedInputFields: ['fieldA'],
        undeclaredInputFields: ['fieldA'],
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1 = null! as Dir;');
    expect(block).toContain(
      'var _t1 = null! as typeof i0.Dir.ngAcceptInputType_fieldA; ' + '_t1 = (((this).foo));',
    );
  });

  it('should use transform type if an input has one', () => {
    const TEMPLATE = `<div dir [fieldA]="expr"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: {
            bindingPropertyName: 'fieldA',
            classPropertyName: 'fieldA',
            required: false,
            isSignal: false,
            transform: {
              node: ts.factory.createFunctionDeclaration(
                undefined,
                undefined,
                undefined,
                undefined,
                [],
                undefined,
                undefined,
              ),
              type: new Reference(
                ts.factory.createUnionTypeNode([
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ]),
              ),
            },
          },
        },
        coercedInputFields: ['fieldA'],
      },
    ];

    const block = tcb(TEMPLATE, DIRECTIVES);

    expect(block).toContain('var _t1 = null! as boolean | string; ' + '_t1 = (((this).expr));');
  });

  it('should handle $any casts', () => {
    const TEMPLATE = `{{$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('(((this).a) as any)');
  });

  it('should handle $any accessed through `this`', () => {
    const TEMPLATE = `{{this.$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('((this).$any(((this).a)))');
  });

  it('should handle $any accessed through a property read', () => {
    const TEMPLATE = `{{foo.$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('((((this).foo)).$any(((this).a)))');
  });

  it('should handle a two-way binding to an input/output pair', () => {
    const TEMPLATE = `<div twoWay [(input)]="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'TwoWay',
        selector: '[twoWay]',
        inputs: {input: 'input'},
        outputs: {inputChange: 'inputChange'},
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('var _t1 = null! as i0.TwoWay;');
    expect(block).toContain('_t1.input = i1.ɵunwrapWritableSignal((((this).value)));');
    expect(block).toContain('var _t2 = i1.ɵunwrapWritableSignal(((this).value));');
    expect(block).toContain('_t2 = $event;');
  });

  it('should handle a two-way binding to an input/output pair of a generic directive', () => {
    const TEMPLATE = `<div twoWay [(input)]="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'TwoWay',
        selector: '[twoWay]',
        inputs: {input: 'input'},
        outputs: {inputChange: 'inputChange'},
        isGeneric: true,
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain(
      'const _ctor1: <T extends string = any>(init: Pick<i0.TwoWay<T>, "input">) => i0.TwoWay<T> = null!',
    );
    expect(block).toContain(
      'var _t1 = _ctor1({ "input": (i1.ɵunwrapWritableSignal(((this).value))) });',
    );
    expect(block).toContain('_t1.input = i1.ɵunwrapWritableSignal((((this).value)));');
    expect(block).toContain('var _t2 = i1.ɵunwrapWritableSignal(((this).value));');
    expect(block).toContain('_t2 = $event;');
  });

  it('should handle a two-way binding to a model()', () => {
    const TEMPLATE = `<div twoWay [(input)]="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'TwoWay',
        selector: '[twoWay]',
        inputs: {
          input: {
            classPropertyName: 'input',
            bindingPropertyName: 'input',
            required: false,
            isSignal: true,
            transform: null,
          },
        },
        outputs: {inputChange: 'inputChange'},
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('var _t1 = null! as i0.TwoWay;');
    expect(block).toContain(
      '_t1.input[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] = i1.ɵunwrapWritableSignal((((this).value)));',
    );
    expect(block).toContain('var _t2 = i1.ɵunwrapWritableSignal(((this).value));');
    expect(block).toContain('_t2 = $event;');
  });

  it('should handle a two-way binding to an input with a transform', () => {
    const TEMPLATE = `<div twoWay [(input)]="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'TwoWay',
        selector: '[twoWay]',
        inputs: {
          input: {
            classPropertyName: 'input',
            bindingPropertyName: 'input',
            required: false,
            isSignal: false,
            transform: {
              node: ts.factory.createFunctionDeclaration(
                undefined,
                undefined,
                undefined,
                undefined,
                [],
                undefined,
                undefined,
              ),
              type: new Reference(
                ts.factory.createUnionTypeNode([
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ]),
              ),
            },
          },
        },
        outputs: {inputChange: 'inputChange'},
        coercedInputFields: ['input'],
      },
    ];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('var _t1 = null! as boolean | string;');
    expect(block).toContain('_t1 = i1.ɵunwrapWritableSignal((((this).value)));');
    expect(block).toContain('var _t3 = i1.ɵunwrapWritableSignal(((this).value));');
    expect(block).toContain('_t3 = $event;');
  });

  describe('experimental DOM checking via lib.dom.d.ts', () => {
    it('should translate unclaimed bindings to their property equivalent', () => {
      const TEMPLATE = `<label [for]="'test'"></label>`;
      const CONFIG = {...ALL_ENABLED_CONFIG, checkTypeOfDomBindings: true};
      expect(tcb(TEMPLATE, /* declarations */ undefined, CONFIG)).toContain(
        '_t1["htmlFor"] = ("test");',
      );
    });
  });

  describe('template guards', () => {
    it('should emit invocation guards', () => {
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'NgIf',
          selector: '[ngIf]',
          inputs: {'ngIf': 'ngIf'},
          ngTemplateGuards: [
            {
              inputName: 'ngIf',
              type: 'invocation',
            },
          ],
        },
      ];
      const TEMPLATE = `<div *ngIf="person">{{person.name}}</div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('if (i0.NgIf.ngTemplateGuard_ngIf(_t1, ((this).person)))');
    });

    it('should emit binding guards', () => {
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'NgIf',
          selector: '[ngIf]',
          inputs: {'ngIf': 'ngIf'},
          ngTemplateGuards: [
            {
              inputName: 'ngIf',
              type: 'binding',
            },
          ],
        },
      ];
      const TEMPLATE = `<div *ngIf="person !== null">{{person.name}}</div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('if ((((this).person)) !== (null))');
    });

    it('should not emit guards when the child scope is empty', () => {
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'NgIf',
          selector: '[ngIf]',
          inputs: {'ngIf': 'ngIf'},
          ngTemplateGuards: [
            {
              inputName: 'ngIf',
              type: 'invocation',
            },
          ],
        },
      ];
      const TEMPLATE = `<div *ngIf="person">static</div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('NgIf.ngTemplateGuard_ngIf');
    });
  });

  describe('outputs', () => {
    it('should emit subscribe calls for directive outputs', () => {
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          outputs: {'outputField': 'dirOutput'},
        },
      ];
      const TEMPLATE = `<div dir (dirOutput)="foo($event)"></div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain(
        '_t1["outputField"].subscribe(($event): any => { (this).foo($event); });',
      );
    });

    it('should emit a listener function with AnimationEvent for animation events', () => {
      const TEMPLATE = `<div (@animation.done)="foo($event)"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain('($event: i1.AnimationEvent): any => { (this).foo($event); }');
    });

    it('should emit addEventListener calls for unclaimed outputs', () => {
      const TEMPLATE = `<div (event)="foo($event)"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
        '_t1.addEventListener("event", ($event): any => { (this).foo($event); });',
      );
    });

    it('should allow to cast $event using $any', () => {
      const TEMPLATE = `<div (event)="foo($any($event))"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
        '_t1.addEventListener("event", ($event): any => { (this).foo(($event as any)); });',
      );
    });

    it('should handle $any cast in a two-way binding', () => {
      const TEMPLATE = `<div twoWay [(input)]="$any(value)"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'TwoWay',
          selector: '[twoWay]',
          inputs: {input: 'input'},
          outputs: {inputChange: 'inputChange'},
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.TwoWay;');
      expect(block).toContain('_t1.input = i1.ɵunwrapWritableSignal(((((this).value) as any)));');
      expect(block).toContain('var _t2 = i1.ɵunwrapWritableSignal((((this).value) as any));');
      expect(block).toContain('_t2 = $event;');
    });

    it('should detect writes to template variables', () => {
      const TEMPLATE = `<ng-template let-v><div (event)="v = 3"></div></ng-template>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain('_t3.addEventListener("event", ($event): any => { (_t2 = 3); });');
    });

    it('should ignore accesses to $event through `this`', () => {
      const TEMPLATE = `<div (event)="foo(this.$event)"></div>`;
      const block = tcb(TEMPLATE);

      expect(block).toContain(
        '_t1.addEventListener("event", ($event): any => { (this).foo(((this).$event)); });',
      );
    });
  });

  describe('config', () => {
    const DIRECTIVES: TestDeclaration[] = [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
        inputs: {'dirInput': 'dirInput'},
        outputs: {'outputField': 'dirOutput'},
        hasNgTemplateContextGuard: true,
      },
    ];
    const BASE_CONFIG: TypeCheckingConfig = {
      applyTemplateContextGuards: true,
      checkQueries: false,
      checkTemplateBodies: true,
      checkControlFlowBodies: true,
      alwaysCheckSchemaInTemplateBodies: true,
      checkTypeOfInputBindings: true,
      honorAccessModifiersForInputBindings: false,
      strictNullInputBindings: true,
      checkTypeOfAttributes: true,
      checkTypeOfDomBindings: false,
      checkTypeOfOutputEvents: true,
      checkTypeOfAnimationEvents: true,
      checkTypeOfDomEvents: true,
      checkTypeOfDomReferences: true,
      checkTypeOfNonDomReferences: true,
      checkTypeOfPipes: true,
      strictSafeNavigationTypes: true,
      useContextGenericType: true,
      strictLiteralTypes: true,
      enableTemplateTypeChecker: false,
      useInlineTypeConstructors: true,
      suggestionsForSuboptimalTypeInference: false,
      controlFlowPreventingContentProjection: 'warning',
      unusedStandaloneImports: 'warning',
      allowSignalsInTwoWayBindings: true,
      checkTwoWayBoundEvents: true,
      allowDomEventAssertion: true,
    };

    describe('config.applyTemplateContextGuards', () => {
      const TEMPLATE = `<div *dir>{{ value }}</div>`;
      const GUARD_APPLIED = 'if (i0.Dir.ngTemplateContextGuard(';

      it('should apply template context guards when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(GUARD_APPLIED);
      });
      it('should not apply template context guards when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          applyTemplateContextGuards: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain(GUARD_APPLIED);
      });
    });

    describe('config.checkTemplateBodies', () => {
      const TEMPLATE = `<ng-template #ref>{{a}}</ng-template>{{ref}}`;

      it('should descend into template bodies when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('((this).a)');
      });
      it('should not descend into template bodies when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTemplateBodies: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain('((this).a)');
      });

      it('generates a references var when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('var _t1 = (_t2 as any as i1.TemplateRef<any>);');
      });

      it('generates a reference var when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTemplateBodies: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('var _t1 = (_t2 as any as i1.TemplateRef<any>);');
      });
    });

    describe('config.strictNullInputBindings', () => {
      const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;

      it('should include null and undefined when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t1.dirInput = (((this).a));');
        expect(block).toContain('((this).b);');
      });
      it('should use the non-null assertion operator when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          strictNullInputBindings: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t1.dirInput = (((this).a)!);');
        expect(block).toContain('((this).b)!;');
      });
    });

    describe('config.checkTypeOfBindings', () => {
      it('should check types of bindings when enabled', () => {
        const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t1.dirInput = (((this).a));');
        expect(block).toContain('((this).b);');
      });

      it('should not check types of bindings when disabled', () => {
        const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          checkTypeOfInputBindings: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t1.dirInput = ((((this).a) as any));');
        expect(block).toContain('(((this).b) as any);');
      });

      it('should wrap the cast to any in parentheses when required', () => {
        const TEMPLATE = `<div dir [dirInput]="a === b"></div>`;
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          checkTypeOfInputBindings: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t1.dirInput = ((((((this).a)) === (((this).b))) as any));');
      });
    });

    describe('config.checkTypeOfOutputEvents', () => {
      const TEMPLATE = `<div dir (dirOutput)="foo($event)" (nonDirOutput)="foo($event)"></div>`;

      it('should check types of directive outputs when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
          '_t1["outputField"].subscribe(($event): any => { (this).foo($event); });',
        );
        expect(block).toContain(
          '_t2.addEventListener("nonDirOutput", ($event): any => { (this).foo($event); });',
        );
      });
      it('should not check types of directive outputs when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          checkTypeOfOutputEvents: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('($event: any): any => { (this).foo($event); }');
        // Note that DOM events are still checked, that is controlled by `checkTypeOfDomEvents`
        expect(block).toContain(
          'addEventListener("nonDirOutput", ($event): any => { (this).foo($event); });',
        );
      });
    });

    describe('config.checkTypeOfAnimationEvents', () => {
      const TEMPLATE = `<div (@animation.done)="foo($event)"></div>`;

      it('should check types of animation events when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('($event: i1.AnimationEvent): any => { (this).foo($event); }');
      });
      it('should not check types of animation events when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          checkTypeOfAnimationEvents: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('($event: any): any => { (this).foo($event); }');
      });
    });

    describe('config.checkTypeOfDomEvents', () => {
      const TEMPLATE = `<div dir (dirOutput)="foo($event)" (nonDirOutput)="foo($event)"></div>`;

      it('should check types of DOM events when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
          '_t1["outputField"].subscribe(($event): any => { (this).foo($event); });',
        );
        expect(block).toContain(
          '_t2.addEventListener("nonDirOutput", ($event): any => { (this).foo($event); });',
        );
      });
      it('should not check types of DOM events when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfDomEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        // Note that directive outputs are still checked, that is controlled by
        // `checkTypeOfOutputEvents`
        expect(block).toContain(
          '_t1["outputField"].subscribe(($event): any => { (this).foo($event); });',
        );
        expect(block).toContain('($event: any): any => { (this).foo($event); }');
      });
    });

    describe('config.checkTypeOfDomReferences', () => {
      const TEMPLATE = `<input #ref>{{ref.value}}`;

      it('should trace references when enabled', () => {
        const block = tcb(TEMPLATE);
        expect(block).toContain('(_t1).value');
      });

      it('should use any for reference types when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          checkTypeOfDomReferences: false,
        };
        const block = tcb(TEMPLATE, [], DISABLED_CONFIG);
        expect(block).toContain('var _t1 = _t2 as any; ' + '"" + (((_t1).value));');
      });
    });

    describe('config.checkTypeOfNonDomReferences', () => {
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          exportAs: ['dir'],
          inputs: {'dirInput': 'dirInput'},
          outputs: {'outputField': 'dirOutput'},
          hasNgTemplateContextGuard: true,
        },
      ];
      const TEMPLATE = `<div dir #ref="dir">{{ref.value}}</div><ng-template #ref2></ng-template>{{ref2.value2}}`;

      it('should trace references to a directive when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(_t1).value');
      });

      it('should trace references to an <ng-template> when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
          'var _t3 = (_t4 as any as i1.TemplateRef<any>); ' + '"" + (((_t3).value2));',
        );
      });

      it('should use any for reference types when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          checkTypeOfNonDomReferences: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('var _t1 = _t2 as any; ' + '"" + (((_t1).value));');
      });
    });

    describe('config.checkTypeOfAttributes', () => {
      const TEMPLATE = `<textarea dir disabled cols="3" [rows]="2">{{ref.value}}</textarea>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {'disabled': 'disabled', 'cols': 'cols', 'rows': 'rows'},
        },
      ];

      it('should assign string value to the input when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t1.disabled = ("");');
        expect(block).toContain('_t1.cols = ("3");');
        expect(block).toContain('_t1.rows = (2);');
      });

      it('should use any for attributes but still check bound attributes when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfAttributes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain('"disabled"');
        expect(block).not.toContain('"cols"');
        expect(block).toContain('_t1.rows = (2);');
      });
    });

    describe('config.checkTypeOfPipes', () => {
      const TEMPLATE = `{{a | test:b:c}}`;
      const PIPES: TestDeclaration[] = [
        {
          type: 'pipe',
          name: 'TestPipe',
          pipeName: 'test',
        },
      ];

      it('should check types of pipes when enabled', () => {
        const block = tcb(TEMPLATE, PIPES);
        expect(block).toContain('var _pipe1 = null! as i0.TestPipe;');
        expect(block).toContain('(_pipe1.transform(((this).a), ((this).b), ((this).c)));');
      });
      it('should not check types of pipes when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfPipes: false};
        const block = tcb(TEMPLATE, PIPES, DISABLED_CONFIG);
        expect(block).toContain('var _pipe1 = null! as i0.TestPipe;');
        expect(block).toContain('((_pipe1.transform as any)(((this).a), ((this).b), ((this).c))');
      });
    });

    describe('config.strictSafeNavigationTypes', () => {
      const TEMPLATE = `{{a?.b}} {{a?.method()}} {{a?.[0]}} {{a.optionalMethod?.()}}`;

      it('should use undefined for safe navigation operations when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
          '(0 as any ? (0 as any ? (((this).a))!.method : undefined)!() : undefined)',
        );
        expect(block).toContain('(0 as any ? (((this).a))!.b : undefined)');
        expect(block).toContain('(0 as any ? (((this).a))![0] : undefined)');
        expect(block).toContain('(0 as any ? (((((this).a)).optionalMethod))!() : undefined)');
      });
      it("should use an 'any' type for safe navigation operations when disabled", () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          strictSafeNavigationTypes: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('((((((this).a))!.method as any) as any)())');
        expect(block).toContain('((((this).a))!.b as any)');
        expect(block).toContain('(((((this).a))![0] as any)');
        expect(block).toContain('((((((this).a)).optionalMethod))!() as any)');
      });
    });

    describe('config.strictSafeNavigationTypes (View Engine bug emulation)', () => {
      const TEMPLATE = `{{a.method()?.b}} {{a()?.method()}} {{a.method()?.[0]}} {{a.method()?.otherMethod?.()}}`;
      it('should check the presence of a property/method on the receiver when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(0 as any ? ((((this).a)).method())!.b : undefined)');
        expect(block).toContain(
          '(0 as any ? (0 as any ? ((this).a())!.method : undefined)!() : undefined)',
        );
        expect(block).toContain('(0 as any ? ((((this).a)).method())![0] : undefined)');
        expect(block).toContain(
          '(0 as any ? ((0 as any ? ((((this).a)).method())!.otherMethod : undefined))!() : undefined)',
        );
      });
      it('should not check the presence of a property/method on the receiver when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {
          ...BASE_CONFIG,
          strictSafeNavigationTypes: false,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('(((((this).a)).method()) as any).b');
        expect(block).toContain('(((((this).a()) as any).method as any)())');
        expect(block).toContain('(((((this).a)).method()) as any)[0]');
        expect(block).toContain('(((((((this).a)).method()) as any).otherMethod)!() as any)');
      });
    });

    describe('config.strictContextGenerics', () => {
      const TEMPLATE = `Test`;

      it('should use the generic type of the context when enabled', () => {
        const block = tcb(TEMPLATE);
        expect(block).toContain('function _tcb1<T extends string>(this: i0.Test<T>)');
      });

      it('should use any for the context generic type when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, useContextGenericType: false};
        const block = tcb(TEMPLATE, undefined, DISABLED_CONFIG);
        expect(block).toContain('function _tcb1(this: i0.Test<any>)');
      });
    });

    describe('config.checkAccessModifiersForInputBindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;

      it('should assign restricted properties via element access for field names that are not JS identifiers', () => {
        const DIRECTIVES: TestDeclaration[] = [
          {
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              'some-input.xs': 'inputA',
            },
            restrictedInputFields: ['some-input.xs'],
            stringLiteralInputFields: ['some-input.xs'],
          },
        ];
        const enableChecks: TypeCheckingConfig = {
          ...BASE_CONFIG,
          honorAccessModifiersForInputBindings: true,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, enableChecks);
        expect(block).toContain(
          'var _t1 = null! as i0.Dir; ' + '_t1["some-input.xs"] = (((this).foo)); ',
        );
      });

      it('should assign restricted properties via property access', () => {
        const DIRECTIVES: TestDeclaration[] = [
          {
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              fieldA: 'inputA',
            },
            restrictedInputFields: ['fieldA'],
          },
        ];
        const enableChecks: TypeCheckingConfig = {
          ...BASE_CONFIG,
          honorAccessModifiersForInputBindings: true,
        };
        const block = tcb(TEMPLATE, DIRECTIVES, enableChecks);
        expect(block).toContain('var _t1 = null! as i0.Dir; ' + '_t1.fieldA = (((this).foo)); ');
      });
    });

    it('should _not_ assert the type for DOM events bound on void elements when disabled', () => {
      const result = tcb(`<input (input)="handleInput($event.target.value)">`, undefined, {
        ...BASE_CONFIG,
        allowDomEventAssertion: false,
      });
      expect(result).not.toContain('ɵassertType');
    });

    describe('config.allowSignalsInTwoWayBindings', () => {
      it('should not unwrap signals in two-way binding expressions', () => {
        const TEMPLATE = `<div twoWay [(input)]="value"></div>`;
        const DIRECTIVES: TestDeclaration[] = [
          {
            type: 'directive',
            name: 'TwoWay',
            selector: '[twoWay]',
            inputs: {input: 'input'},
            outputs: {inputChange: 'inputChange'},
          },
        ];
        const block = tcb(TEMPLATE, DIRECTIVES, {
          ...BASE_CONFIG,
          allowSignalsInTwoWayBindings: false,
        });
        expect(block).not.toContain('ɵunwrapWritableSignal');
      });

      it('should not unwrap signals in two-way bindings to generic directives', () => {
        const TEMPLATE = `<div twoWay [(input)]="value"></div>`;
        const DIRECTIVES: TestDeclaration[] = [
          {
            type: 'directive',
            name: 'TwoWay',
            selector: '[twoWay]',
            inputs: {input: 'input'},
            outputs: {inputChange: 'inputChange'},
            isGeneric: true,
          },
        ];
        const block = tcb(TEMPLATE, DIRECTIVES, {
          ...BASE_CONFIG,
          allowSignalsInTwoWayBindings: false,
        });
        expect(block).not.toContain('ɵunwrapWritableSignal');
      });
    });
  });

  it(
    'should use `any` type for type constructors with bound generic params ' +
      'when `useInlineTypeConstructors` is `false`',
    () => {
      const template = `
    <div dir
      [inputA]='foo'
      [inputB]='bar'
      ></div>
    `;
      const declarations: TestDeclaration[] = [
        {
          code: `
           interface PrivateInterface{};
           export class Dir<T extends PrivateInterface, U extends string> {};
        `,
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            inputA: 'inputA',
            inputB: 'inputB',
          },
          isGeneric: true,
        },
      ];

      const renderedTcb = tcb(template, declarations, {useInlineTypeConstructors: false});

      expect(renderedTcb).toContain(`var _t1 = null! as i0.Dir<any, any>;`);
      expect(renderedTcb).toContain(`_t1.inputA = (((this).foo));`);
      expect(renderedTcb).toContain(`_t1.inputB = (((this).bar));`);
    },
  );

  describe('host directives', () => {
    it('should generate bindings to host directive inputs/outputs', () => {
      const TEMPLATE = `<div dir-a [hostInput]="1" (hostOutput)="handle($event)"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {hostInput: 'hostInput'},
                outputs: {hostOutput: 'hostOutput'},
                isStandalone: true,
              },
              inputs: ['hostInput'],
              outputs: ['hostOutput'],
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.HostDir');
      expect(block).toContain('_t1.hostInput = (1)');
      expect(block).toContain('_t1["hostOutput"].subscribe');
    });

    it('should generate bindings to aliased host directive inputs/outputs', () => {
      const TEMPLATE = `<div dir-a [inputAlias]="1" (outputAlias)="handle($event)"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {hostInput: 'hostInput'},
                outputs: {hostOutput: 'hostOutput'},
                isStandalone: true,
              },
              inputs: ['hostInput: inputAlias'],
              outputs: ['hostOutput: outputAlias'],
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.HostDir');
      expect(block).toContain('_t1.hostInput = (1)');
      expect(block).toContain('_t1["hostOutput"].subscribe');
    });

    it('should generate bindings to an input from a multi-level host directive', () => {
      const TEMPLATE = `<div dir-a [multiLevelHostInput]="1"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                isStandalone: true,
                hostDirectives: [
                  {
                    directive: {
                      type: 'directive',
                      name: 'MultiLevelHostDir',
                      selector: '',
                      isStandalone: true,
                      inputs: {'multiLevelHostInput': 'multiLevelHostInput'},
                    },
                    inputs: ['multiLevelHostInput'],
                  },
                ],
              },
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.MultiLevelHostDir;');
      expect(block).toContain('_t1.multiLevelHostInput = (1)');
    });

    it('should generate references to host directives', () => {
      const TEMPLATE = `<div dir-a #a="hostA" #b="hostB">{{a.propA}} {{b.propB}}</div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostA',
                selector: '',
                isStandalone: true,
                exportAs: ['hostA'],
              },
            },
            {
              directive: {
                type: 'directive',
                name: 'HostB',
                selector: '',
                isStandalone: true,
                exportAs: ['hostB'],
              },
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t2 = null! as i0.HostA;');
      expect(block).toContain('var _t4 = null! as i0.HostB;');
      expect(block).toContain('(((_t1).propA)) + (((_t3).propB))');
    });

    it('should generate bindings to the same input both from the host and host input', () => {
      const TEMPLATE = `<div dir-a [input]="1"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          inputs: {input: 'input'},
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {input: 'input'},
                isStandalone: true,
              },
              inputs: ['input'],
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.HostDir');
      expect(block).toContain('var _t2 = null! as i0.DirA;');
      expect(block).toContain('_t1.input = (1)');
      expect(block).toContain('_t2.input = (1)');
    });

    it('should not generate bindings to host directive inputs/outputs that have not been exposed', () => {
      const TEMPLATE = `<div dir-a [hostInput]="1" (hostOutput)="handle($event)"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {hostInput: 'hostInput'},
                outputs: {hostOutput: 'hostOutput'},
                isStandalone: true,
              },
              // Intentionally left blank.
              inputs: [],
              outputs: [],
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('var _t1 = null! i0.HostDir');
      expect(block).not.toContain('_t1.hostInput = (1)');
      expect(block).not.toContain('_t1["hostOutput"].subscribe');
      expect(block).toContain('_t1.addEventListener("hostOutput"');
    });

    it('should generate bindings to aliased host directive inputs/outputs on a host with its own aliases', () => {
      const TEMPLATE = `<div dir-a [inputAlias]="1" (outputAlias)="handle($event)"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'DirA',
          selector: '[dir-a]',
          hostDirectives: [
            {
              directive: {
                type: 'directive',
                name: 'HostDir',
                selector: '',
                inputs: {hostInput: 'hostInputAlias'},
                outputs: {hostOutput: 'hostOutputAlias'},
                isStandalone: true,
              },
              inputs: ['hostInputAlias: inputAlias'],
              outputs: ['hostOutputAlias: outputAlias'],
            },
          ],
        },
      ];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.HostDir');
      expect(block).toContain('_t1.hostInput = (1)');
      expect(block).toContain('_t1["hostOutput"].subscribe');
    });
  });

  describe('deferred blocks', () => {
    it('should generate bindings inside deferred blocks', () => {
      const TEMPLATE = `
        @defer {
          {{main()}}
        } @placeholder {
          {{placeholder()}}
        } @loading {
          {{loading()}}
        } @error {
          {{error()}}
        }
      `;

      expect(tcb(TEMPLATE)).toContain(
        '"" + ((this).main()); "" + ((this).placeholder()); "" + ((this).loading()); "" + ((this).error());',
      );
    });

    it('should generate `when` trigger', () => {
      const TEMPLATE = `
        @defer (when shouldShow() && isVisible) {
          {{main()}}
        }
      `;

      expect(tcb(TEMPLATE)).toContain('((this).shouldShow()) && (((this).isVisible));');
    });

    it('should generate `prefetch when` trigger', () => {
      const TEMPLATE = `
        @defer (prefetch when shouldShow() && isVisible) {
          {{main()}}
        }
      `;

      expect(tcb(TEMPLATE)).toContain('((this).shouldShow()) && (((this).isVisible));');
    });

    it('should generate `hydrate when` trigger', () => {
      const TEMPLATE = `
        @defer (hydrate when shouldShow() && isVisible) {
          {{main()}}
        }
      `;

      expect(tcb(TEMPLATE)).toContain('((this).shouldShow()) && (((this).isVisible));');
    });
  });

  describe('conditional blocks', () => {
    it('should generate an if block', () => {
      const TEMPLATE = `
        @if (expr === 0) {
          {{main()}}
        } @else if (expr1 === 1) {
          {{one()}}
        } @else if (expr2 === 2) {
          {{two()}}
        } @else {
          {{other()}}
        }
      `;

      expect(tcb(TEMPLATE)).toContain(
        'if ((((this).expr)) === (0)) { "" + ((this).main()); } ' +
          'else if ((((this).expr1)) === (1)) { "" + ((this).one()); } ' +
          'else if ((((this).expr2)) === (2)) { "" + ((this).two()); } ' +
          'else { "" + ((this).other()); }',
      );
    });

    it('should generate a guard expression for listener inside conditional', () => {
      const TEMPLATE = `
        @if (expr === 0) {
          <button (click)="zero()"></button>
        } @else if (expr === 1) {
          <button (click)="one()"></button>
        } @else if (expr === 2) {
          <button (click)="two()"></button>
        } @else {
          <button (click)="otherwise()"></button>
        }
      `;

      const result = tcb(TEMPLATE);

      expect(result).toContain(`if ((((this).expr)) === (0)) { (this).zero(); }`);
      expect(result).toContain(
        `if (!((((this).expr)) === (0)) && (((this).expr)) === (1)) { (this).one(); }`,
      );
      expect(result).toContain(
        `if (!((((this).expr)) === (0)) && !((((this).expr)) === (1)) && (((this).expr)) === (2)) { (this).two(); }`,
      );
      expect(result).toContain(
        `if (!((((this).expr)) === (0)) && !((((this).expr)) === (1)) && !((((this).expr)) === (2))) { (this).otherwise(); }`,
      );
    });

    it('should generate an if block with an `as` expression', () => {
      const TEMPLATE = `@if (expr === 1; as alias) {
        {{alias}}
      }`;

      expect(tcb(TEMPLATE)).toContain(
        'var _t1 = ((((this).expr)) === (1)); if (((((this).expr)) === (1)) && _t1) { "" + (_t1); } } }',
      );
    });

    it('should not generate the body of if blocks when `checkControlFlowBodies` is disabled', () => {
      const TEMPLATE = `
          @if (expr === 0) {
            {{main()}}
          } @else if (expr1 === 1) {
            {{one()}}
          } @else if (expr2 === 2) {
            {{two()}}
          } @else {
            {{other()}}
          }
        `;

      expect(tcb(TEMPLATE, undefined, {checkControlFlowBodies: false})).toContain(
        'if ((((this).expr)) === (0)) { } ' +
          'else if ((((this).expr1)) === (1)) { } ' +
          'else if ((((this).expr2)) === (2)) { } ' +
          'else { }',
      );
    });

    it('should generate a switch block', () => {
      const TEMPLATE = `
        @switch (expr) {
          @case (1) {
            {{one()}}
          }
          @case (2) {
            {{two()}}
          }
          @default {
            {{default()}}
          }
        }
      `;

      expect(tcb(TEMPLATE)).toContain(
        'switch (((this).expr)) { ' +
          'case 1: "" + ((this).one()); break; ' +
          'case 2: "" + ((this).two()); break; ' +
          'default: "" + ((this).default()); break; }',
      );
    });

    it('should generate a switch block that only has a default case', () => {
      const TEMPLATE = `
        @switch (expr) {
          @default {
            {{default()}}
          }
        }
      `;

      expect(tcb(TEMPLATE)).toContain(
        'switch (((this).expr)) { default: "" + ((this).default()); break; }',
      );
    });

    it('should generate a guard expression for a listener inside a switch case', () => {
      const TEMPLATE = `
        @switch (expr) {
          @case (1) {
            <button (click)="one()"></button>
          }
          @case (2) {
            <button (click)="two()"></button>
          }
          @default {
            <button (click)="default()"></button>
          }
        }
      `;

      const result = tcb(TEMPLATE);

      expect(result).toContain(`if (((this).expr) === 1) { (this).one(); }`);
      expect(result).toContain(`if (((this).expr) === 2) { (this).two(); }`);
      expect(result).toContain(
        `if (((this).expr) !== 1 && ((this).expr) !== 2) { (this).default(); }`,
      );
    });

    it('should generate a switch block inside a template', () => {
      const TEMPLATE = `
        <ng-template let-expr="exp">
          @switch (expr()) {
            @case ('one') {
              {{one()}}
            }
            @case ('two') {
              {{two()}}
            }
            @default {
              {{default()}}
            }
          }
        </ng-template>
      `;

      expect(tcb(TEMPLATE)).toContain(
        'var _t1 = null! as any; { var _t2 = (_t1.exp); switch (_t2()) { ' +
          'case "one": "" + ((this).one()); break; ' +
          'case "two": "" + ((this).two()); break; ' +
          'default: "" + ((this).default()); break; } }',
      );
    });

    it('should handle an empty switch block', () => {
      expect(tcb('@switch (expr) {}')).toContain('if (true) { switch (((this).expr)) { } }');
    });

    it('should not generate the body of a switch block if checkControlFlowBodies is disabled', () => {
      const TEMPLATE = `
          @switch (expr) {
            @case (1) {
              {{one()}}
            }
            @case (2) {
              {{two()}}
            }
            @default {
              {{default()}}
            }
          }
        `;

      expect(tcb(TEMPLATE, undefined, {checkControlFlowBodies: false})).toContain(
        'switch (((this).expr)) { ' + 'case 1: break; ' + 'case 2: break; ' + 'default: break; }',
      );
    });
  });

  describe('for loop blocks', () => {
    it('should generate a for block', () => {
      const TEMPLATE = `
        @for (item of items; track item) {
          {{main(item)}}
        } @empty {
          {{empty()}}
        }
      `;

      const result = tcb(TEMPLATE);
      expect(result).toContain('for (const _t1 of ((this).items)!) {');
      expect(result).toContain('"" + ((this).main(_t1))');
      expect(result).toContain('"" + ((this).empty())');
    });

    it('should generate a for block with implicit variables', () => {
      const TEMPLATE = `
        @for (item of items; track item) {
          {{$index}} {{$first}} {{$last}} {{$even}} {{$odd}} {{$count}}
        }
      `;

      const result = tcb(TEMPLATE);
      expect(result).toContain('for (const _t1 of ((this).items)!) {');
      expect(result).toContain('var _t2 = null! as number;');
      expect(result).toContain('var _t3 = null! as boolean;');
      expect(result).toContain('var _t4 = null! as boolean;');
      expect(result).toContain('var _t5 = null! as boolean;');
      expect(result).toContain('var _t6 = null! as boolean;');
      expect(result).toContain('var _t7 = null! as number;');
      expect(result).toContain('"" + (_t2) + (_t3) + (_t4) + (_t5) + (_t6) + (_t7)');
    });

    it('should generate a for block with aliased variables', () => {
      const TEMPLATE = `
        @for (item of items; track item; let i = $index, f = $first, l = $last, e = $even, o = $odd, c = $count) {
          {{i}} {{f}} {{l}} {{e}} {{o}} {{c}}
        }
      `;

      const result = tcb(TEMPLATE);
      expect(result).toContain('for (const _t1 of ((this).items)!) {');
      expect(result).toContain('var _t2 = null! as number;');
      expect(result).toContain('var _t3 = null! as boolean;');
      expect(result).toContain('var _t4 = null! as boolean;');
      expect(result).toContain('var _t5 = null! as boolean;');
      expect(result).toContain('var _t6 = null! as boolean;');
      expect(result).toContain('var _t7 = null! as number;');
      expect(result).toContain('"" + (_t2) + (_t3) + (_t4) + (_t5) + (_t6) + (_t7)');
    });

    it('should read both implicit variables and their alias at the same time', () => {
      const TEMPLATE = `
        @for (item of items; track item; let i = $index) { {{$index}} {{i}} }
      `;

      const result = tcb(TEMPLATE);
      expect(result).toContain('for (const _t1 of ((this).items)!) {');
      expect(result).toContain('var _t2 = null! as number;');
      expect(result).toContain('var _t3 = null! as number;');
      expect(result).toContain('"" + (_t2) + (_t3)');
    });

    it('should read variable from a parent for loop', () => {
      const TEMPLATE = `
        @for (item of items; track item; let indexAlias = $index) {
          {{item}} {{indexAlias}}

          @for (inner of item.items; track inner) {
            {{item}} {{indexAlias}} {{inner}} {{$index}}
          }
        }
      `;

      const result = tcb(TEMPLATE);
      expect(result).toContain('for (const _t1 of ((this).items)!) { var _t2 = null! as number;');
      expect(result).toContain('"" + (_t1) + (_t2)');
      expect(result).toContain('for (const _t3 of ((_t1).items)!) { var _t4 = null! as number;');
      expect(result).toContain('"" + (_t1) + (_t2) + (_t3) + (_t4)');
    });

    it('should generate the tracking expression of a for loop', () => {
      const result = tcb(`@for (item of items; track trackingFn($index, item, prop)) {}`);
      expect(result).toContain('for (const _t1 of ((this).items)!) { var _t2 = null! as number;');
      expect(result).toContain('(this).trackingFn(_t2, _t1, ((this).prop));');
    });

    it('should not generate the body of a for block when checkControlFlowBodies is disabled', () => {
      const TEMPLATE = `
            @for (item of items; track item) {
              {{main(item)}}
            } @empty {
              {{empty()}}
            }
          `;

      const result = tcb(TEMPLATE, undefined, {checkControlFlowBodies: false});
      expect(result).toContain('for (const _t1 of ((this).items)!) {');
      expect(result).not.toContain('.main');
      expect(result).not.toContain('.empty');
    });
  });

  describe('let declarations', () => {
    it('should generate let declarations as constants', () => {
      const result = tcb(`
        @let one = 1;
        @let two = 2;
        @let sum = one + two;
        {{sum}}
      `);

      expect(result).toContain('const _t1 = (1);');
      expect(result).toContain('const _t2 = (2);');
      expect(result).toContain('const _t3 = ((_t1) + (_t2));');
      expect(result).toContain('"" + (_t3);');
    });

    it('should rewrite references to let declarations inside event listeners', () => {
      const result = tcb(`
        @let value = 1;
        <button (click)="doStuff(value)"></button>
      `);

      expect(result).toContain('const _t1 = (1);');
      expect(result).toContain('var _t2 = document.createElement("button");');
      expect(result).toContain(
        '_t2.addEventListener("click", ($event): any => { (this).doStuff(_t1); });',
      );
    });
  });

  describe('import generation', () => {
    const TEMPLATE = `<div dir [test]="null"></div>`;
    const DIRECTIVE: TestDeclaration = {
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        test: {
          isSignal: true,
          bindingPropertyName: 'test',
          classPropertyName: 'test',
          required: true,
          transform: null,
        },
      },
    };

    it('should prefer namespace imports in type check files for new imports', () => {
      const result = tcb(TEMPLATE, [DIRECTIVE]);

      expect(result).toContain(`import * as i1 from '@angular/core';`);
      expect(result).toContain(`[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]`);
    });

    it('should re-use existing imports from original source files', () => {
      // This is especially important for inline type check blocks.
      // See: https://github.com/angular/angular/pull/53521#pullrequestreview-1778130879.
      const {templateTypeChecker, program, programStrategy} = setup([
        {
          fileName: absoluteFrom('/test.ts'),
          templates: {'AppComponent': TEMPLATE},
          declarations: [DIRECTIVE],
          source: `
          import {Component} from '@angular/core'; // should be re-used

          class AppComponent {}
          export class Dir {}
        `,
        },
      ]);

      // Trigger type check block generation.
      templateTypeChecker.getDiagnosticsForFile(
        getSourceFileOrError(program, absoluteFrom('/test.ts')),
        OptimizeFor.SingleFile,
      );

      const testSf = getSourceFileOrError(programStrategy.getProgram(), absoluteFrom('/test.ts'));
      expect(testSf.text).toContain(
        `import { Component, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core'; // should be re-used`,
      );
      expect(testSf.text).toContain(`[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]`);
    });
  });

  describe('selectorless', () => {
    function selectorlessTcb(template: string, declarations: TestDeclaration[]) {
      return tcb(template, declarations, undefined, undefined, {enableSelectorless: true});
    }

    it('should generate component input bindings', () => {
      const TEMPLATE = `<Comp [dynamic]="value" static="staticValue"/>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isStandalone: true,
          inputs: {dynamic: 'dynamic', static: 'static'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Comp;');
      expect(block).toContain('_t1.dynamic = (((this).value));');
      expect(block).toContain('_t1.static = ("staticValue");');
    });

    it('should generate directive input bindings', () => {
      const TEMPLATE = `<div @Dir([dynamic]="value" static="staticValue")></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
          inputs: {dynamic: 'dynamic', static: 'static'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Dir;');
      expect(block).toContain('_t1.dynamic = (((this).value));');
      expect(block).toContain('_t1.static = ("staticValue");');
    });

    it('should generate directive input bindings on an ng-template', () => {
      const TEMPLATE = `<ng-template @Dir([dynamic]="value" static="staticValue")></ng-template>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
          inputs: {dynamic: 'dynamic', static: 'static'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Dir;');
      expect(block).toContain('_t1.dynamic = (((this).value));');
      expect(block).toContain('_t1.static = ("staticValue");');
    });

    it('should generate type guards on a template with directives', () => {
      const TEMPLATE = `<ng-template @Dir([someInput]="value")>{{value}}</ng-template>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
          inputs: {someInput: 'someInput'},
          ngTemplateGuards: [
            {
              inputName: 'someInput',
              type: 'binding',
            },
          ],
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Dir;');
      expect(block).toContain('_t1.someInput = (((this).value));');
      expect(block).toContain('if (((this).value)) { "" + (((this).value)); } }');
    });

    it('should generate bindings for unclaimed component inputs', () => {
      const TEMPLATE = `<Comp [claimed]="value" [uncalimed]="unclaimedValue"/>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isStandalone: true,
          inputs: {claimed: 'claimed'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Comp;');
      expect(block).toContain('_t1.claimed = (((this).value));');
      expect(block).toContain('((this).unclaimedValue);');
    });

    // This raises a diagnostic that will be tested separately.
    it('should not generate bindings for unclaimed directive inputs', () => {
      const TEMPLATE = `<div @Dir([claimed]="value" [uncalimed]="unclaimedValue")></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
          inputs: {claimed: 'claimed'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Dir;');
      expect(block).toContain('_t1.claimed = (((this).value));');
      expect(block).not.toContain('unclaimedValue');
    });

    it('should generate component output bindings', () => {
      const TEMPLATE = `<Comp (someEvent)="handleEvent($event)"/>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isStandalone: true,
          outputs: {someEvent: 'someEvent'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Comp;');
      expect(block).toContain(
        '_t1["someEvent"].subscribe(($event): any => { (this).handleEvent($event); });',
      );
    });

    it('should generate directive output bindings', () => {
      const TEMPLATE = `<div @Dir((someEvent)="handleEvent($event)")></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
          outputs: {someEvent: 'someEvent'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = null! as i0.Dir;');
      expect(block).toContain(
        '_t1["someEvent"].subscribe(($event): any => { (this).handleEvent($event); });',
      );
    });

    it('should generate unclaimed component output bindings for a node without a tag name', () => {
      const TEMPLATE = `<Comp (click)="handleEvent($event)"/>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isStandalone: true,
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = document.createElement("ng-component");');
      expect(block).toContain(
        '_t1.addEventListener("click", ($event): any => { (this).handleEvent($event); });',
      );
    });

    it('should generate unclaimed component output bindings for a node with a tag name', () => {
      const TEMPLATE = `<Comp:button (click)="handleEvent($event)"/>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isStandalone: true,
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t1 = document.createElement("button");');
      expect(block).toContain(
        '_t1.addEventListener("click", ($event): any => { (this).handleEvent($event); });',
      );
    });

    // This raises a diagnostic that will be tested separately.
    it('should not generate unclaimed directive output bindings', () => {
      const TEMPLATE = `<div @Dir((click)="handleEvent($event)")></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('Dir');
      expect(block).not.toContain('addEventListener');
    });

    it('should not match directives by selector when selectorless is enabled', () => {
      const TEMPLATE = `<div my-dir [dirInput]="value"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[my-dir]',
          isStandalone: true,
          inputs: {dirInput: 'dirInput'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('Dir');
      expect(block).not.toContain('dirInput');
      expect(block).toContain('((this).value);');
    });

    it('should generate local references to components', () => {
      const TEMPLATE = `<Comp #foo>{{foo.bar}}</Comp>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isStandalone: true,
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t2 = null! as i0.Comp;');
      expect(block).toContain('var _t1 = _t2;');
      expect(block).toContain('"" + (((_t1).bar));');
    });

    it('should generate local references to directives', () => {
      const TEMPLATE = `<div @Dir(#foo)>{{foo.bar}}</div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isStandalone: true,
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('var _t2 = null! as i0.Dir;');
      expect(block).toContain('var _t1 = _t2;');
      expect(block).toContain('"" + (((_t1).bar));');
    });

    it('should generate input binding for generic component', () => {
      const TEMPLATE = `<Comp [input]="value"/>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Comp',
          isComponent: true,
          selector: null,
          isGeneric: true,
          isStandalone: true,
          inputs: {input: 'input'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain(
        'const _ctor1: <T extends string = any>(init: Pick<i0.Comp<T>, "input">) => i0.Comp<T> = null!;',
      );
      expect(block).toContain('var _t1 = _ctor1({ "input": (((this).value)) });');
      expect(block).toContain('_t1.input = (((this).value));');
    });

    it('should generate input binding for generic directive', () => {
      const TEMPLATE = `<div @Dir([input]="value")></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: null,
          isGeneric: true,
          isStandalone: true,
          inputs: {input: 'input'},
        },
      ];
      const block = selectorlessTcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain(
        'const _ctor1: <T extends string = any>(init: Pick<i0.Dir<T>, "input">) => i0.Dir<T> = null!;',
      );
      expect(block).toContain('var _t1 = _ctor1({ "input": (((this).value)) });');
      expect(block).toContain('_t1.input = (((this).value));');
    });
  });
});
