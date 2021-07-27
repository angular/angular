/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '../../file_system/testing';
import {TypeCheckingConfig} from '../api';

import {ALL_ENABLED_CONFIG, tcb, TestDeclaration, TestDirective} from '../testing';


describe('type check blocks', () => {
  beforeEach(() => initMockFileSystem('Native'));

  it('should generate a basic block for a binding', () => {
    expect(tcb('{{hello}} {{world}}')).toContain('"" + (((ctx).hello)) + (((ctx).world));');
  });

  it('should generate literal map expressions', () => {
    const TEMPLATE = '{{ method({foo: a, bar: b}) }}';
    expect(tcb(TEMPLATE)).toContain('(ctx).method({ "foo": ((ctx).a), "bar": ((ctx).b) })');
  });

  it('should generate literal array expressions', () => {
    const TEMPLATE = '{{ method([a, b]) }}';
    expect(tcb(TEMPLATE)).toContain('(ctx).method([((ctx).a), ((ctx).b)])');
  });

  it('should handle non-null assertions', () => {
    const TEMPLATE = `{{a!}}`;
    expect(tcb(TEMPLATE)).toContain('((((ctx).a))!)');
  });

  it('should handle unary - operator', () => {
    const TEMPLATE = `{{-1}}`;
    expect(tcb(TEMPLATE)).toContain('(-1)');
  });

  it('should handle keyed property access', () => {
    const TEMPLATE = `{{a[b]}}`;
    expect(tcb(TEMPLATE)).toContain('(((ctx).a))[((ctx).b)]');
  });

  it('should handle nested ternary expressions', () => {
    const TEMPLATE = `{{a ? b : c ? d : e}}`;
    expect(tcb(TEMPLATE))
        .toContain('(((ctx).a) ? ((ctx).b) : ((((ctx).c) ? ((ctx).d) : (((ctx).e)))))');
  });

  it('should handle nullish coalescing operator', () => {
    expect(tcb('{{ a ?? b }}')).toContain('((((ctx).a)) ?? (((ctx).b)))');
    expect(tcb('{{ a ?? b ?? c }}')).toContain('(((((ctx).a)) ?? (((ctx).b))) ?? (((ctx).c)))');
    expect(tcb('{{ (a ?? b) + (c ?? e) }}'))
        .toContain('(((((ctx).a)) ?? (((ctx).b))) + ((((ctx).c)) ?? (((ctx).e))))');
  });

  it('should handle quote expressions as any type', () => {
    const TEMPLATE = `<span [quote]="sql:expression"></span>`;
    expect(tcb(TEMPLATE)).toContain('null as any');
  });

  it('should handle attribute values for directive inputs', () => {
    const TEMPLATE = `<div dir inputA="value"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir]',
      inputs: {inputA: 'inputA'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t1: i0.DirA = null!; _t1.inputA = ("value");');
  });

  it('should handle multiple bindings to the same property', () => {
    const TEMPLATE = `<div dir-a [inputA]="1" [inputA]="2"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      inputs: {inputA: 'inputA'},
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).toContain('_t1.inputA = (1);');
    expect(block).toContain('_t1.inputA = (2);');
  });

  it('should handle empty bindings', () => {
    const TEMPLATE = `<div dir-a [inputA]=""></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      inputs: {inputA: 'inputA'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t1.inputA = (undefined);');
  });

  it('should handle bindings without value', () => {
    const TEMPLATE = `<div dir-a [inputA]></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'DirA',
      selector: '[dir-a]',
      inputs: {inputA: 'inputA'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES)).toContain('_t1.inputA = (undefined);');
  });

  it('should handle implicit vars on ng-template', () => {
    const TEMPLATE = `<ng-template let-a></ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should handle method calls of template variables', () => {
    const TEMPLATE = `<ng-template let-a>{{a(1)}}</ng-template>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
    expect(tcb(TEMPLATE)).toContain('(_t2)(1)');
  });

  it('should handle implicit vars when using microsyntax', () => {
    const TEMPLATE = `<div *ngFor="let user of users"></div>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
  });

  it('should handle direct calls of an implicit template variable', () => {
    const TEMPLATE = `<div *ngFor="let a of letters">{{a(1)}}</div>`;
    expect(tcb(TEMPLATE)).toContain('var _t2 = _t1.$implicit;');
    expect(tcb(TEMPLATE)).toContain('(_t2)(1)');
  });

  describe('type constructors', () => {
    it('should handle missing property bindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
          fieldB: 'inputB',
        },
        isGeneric: true,
      }];
      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
          'const _ctor1: <T extends string = any>(init: Pick<i0.Dir<T>, "fieldA" | "fieldB">) => i0.Dir<T> = null!;');
      expect(actual).toContain(
          'var _t1 = _ctor1({ "fieldA": (((ctx).foo)), "fieldB": null as any });');
    });

    it('should handle multiple bindings to the same property', () => {
      const TEMPLATE = `<div dir [inputA]="1" [inputA]="2"></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        isGeneric: true,
      }];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('"fieldA": (1)');
      expect(block).not.toContain('"fieldA": (2)');
    });


    it('should only apply property bindings to directives', () => {
      const TEMPLATE = `
      <div dir [style.color]="'blue'" [class.strong]="false" [attr.enabled]="true"></div>
    `;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {'color': 'color', 'strong': 'strong', 'enabled': 'enabled'},
        isGeneric: true,
      }];
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('Dir.ngTypeCtor');
      expect(block).toContain('"blue"; false; true;');
    });

    it('should generate a circular directive reference correctly', () => {
      const TEMPLATE = `
      <div dir #d="dir" [input]="d"></div>
    `;
      const DIRECTIVES: TestDirective[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
        inputs: {input: 'input'},
        isGeneric: true,
      }];

      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
          'const _ctor1: <T extends string = any>(init: Pick<i0.Dir<T>, "input">) => i0.Dir<T> = null!;');
      expect(actual).toContain(
          'var _t2 = _ctor1({ "input": (null!) }); ' +
          'var _t1 = _t2; ' +
          '_t2.input = (_t1);');
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
        }
      ];
      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
          'const _ctor1: <T extends string = any>(init: Pick<i0.DirA<T>, "inputA">) => i0.DirA<T> = null!; const _ctor2: <T extends string = any>(init: Pick<i0.DirB<T>, "inputB">) => i0.DirB<T> = null!;');
      expect(actual).toContain(
          'var _t4 = _ctor1({ "inputA": (null!) }); ' +
          'var _t3 = _t4; ' +
          'var _t2 = _ctor2({ "inputB": (_t3) }); ' +
          'var _t1 = _t2; ' +
          '_t4.inputA = (_t1); ' +
          '_t2.inputB = (_t3);');
    });

    it('should handle empty bindings', () => {
      const TEMPLATE = `<div dir-a [inputA]=""></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
        isGeneric: true,
      }];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain('"inputA": (undefined)');
    });

    it('should handle bindings without value', () => {
      const TEMPLATE = `<div dir-a [inputA]></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'DirA',
        selector: '[dir-a]',
        inputs: {inputA: 'inputA'},
        isGeneric: true,
      }];
      expect(tcb(TEMPLATE, DIRECTIVES)).toContain('"inputA": (undefined)');
    });

    it('should use coercion types if declared', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {
          fieldA: 'inputA',
        },
        isGeneric: true,
        coercedInputFields: ['fieldA'],
      }];
      expect(tcb(TEMPLATE, DIRECTIVES))
          .toContain(
              'var _t1: typeof i0.Dir.ngAcceptInputType_fieldA = null!; ' +
              '_t1 = (((ctx).foo));');
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
        'var _t2 = document.createElement("button"); ' +
        'var _t1 = _t2; ' +
        '_t2.addEventListener');
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
    expect(block).toContain('var _t1: i0.HasInput = null!');
    expect(block).toContain('_t1.input = (((ctx).value));');
    expect(block).toContain('var _t2: i0.HasOutput = null!');
    expect(block).toContain('_t2["output"]');
    expect(block).toContain('var _t4: i0.HasReference = null!');
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
    expect(tcb(TEMPLATE))
        .toContain(
            'var _t2 = document.createElement("input"); var _t1 = _t2; "" + (((_t1).value));');
  });

  it('should generate a forward directive reference correctly', () => {
    const TEMPLATE = `
      {{d.value}}
      <div dir #d="dir"></div>
    `;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: i0.Dir = null!; ' +
            'var _t1 = _t2; ' +
            '"" + (((_t1).value));');
  });

  it('should handle style and class bindings specially', () => {
    const TEMPLATE = `
      <div [style]="a" [class]="b"></div>
    `;
    const block = tcb(TEMPLATE);
    expect(block).toContain('((ctx).a); ((ctx).b);');

    // There should be no assignments to the class or style properties.
    expect(block).not.toContain('.class = ');
    expect(block).not.toContain('.style = ');
  });

  it('should only apply property bindings to directives', () => {
    const TEMPLATE = `
      <div dir [style.color]="'blue'" [class.strong]="false" [attr.enabled]="true"></div>
    `;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {'color': 'color', 'strong': 'strong', 'enabled': 'enabled'},
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1: Dir = null!;');
    expect(block).not.toContain('"color"');
    expect(block).not.toContain('"strong"');
    expect(block).not.toContain('"enabled"');
    expect(block).toContain('"blue"; false; true;');
  });

  it('should generate a circular directive reference correctly', () => {
    const TEMPLATE = `
      <div dir #d="dir" [input]="d"></div>
    `;
    const DIRECTIVES: TestDirective[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
      inputs: {input: 'input'},
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: i0.Dir = null!; ' +
            'var _t1 = _t2; ' +
            '_t2.input = (_t1);');
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
      }
    ];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t2: i0.DirB = null!; ' +
            'var _t1 = _t2; ' +
            'var _t3: i0.DirA = null!; ' +
            '_t3.inputA = (_t1); ' +
            'var _t4 = _t3; ' +
            '_t2.inputA = (_t4);');
  });

  it('should handle undeclared properties', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      undeclaredInputFields: ['fieldA']
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1: Dir = null!;');
    expect(block).toContain('(((ctx).foo)); ');
  });

  it('should assign restricted properties to temp variables by default', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      restrictedInputFields: ['fieldA']
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t1: i0.Dir = null!; ' +
            'var _t2: typeof _t1["fieldA"] = null!; ' +
            '_t2 = (((ctx).foo)); ');
  });

  it('should assign properties via element access for field names that are not JS identifiers',
     () => {
       const TEMPLATE = `<div dir [inputA]="foo"></div>`;
       const DIRECTIVES: TestDeclaration[] = [{
         type: 'directive',
         name: 'Dir',
         selector: '[dir]',
         inputs: {
           'some-input.xs': 'inputA',
         },
         stringLiteralInputFields: ['some-input.xs'],
       }];
       const block = tcb(TEMPLATE, DIRECTIVES);
       expect(block).toContain(
           'var _t1: i0.Dir = null!; ' +
           '_t1["some-input.xs"] = (((ctx).foo)); ');
     });

  it('should handle a single property bound to multiple fields', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        field1: 'inputA',
        field2: 'inputA',
      },
    }];
    expect(tcb(TEMPLATE, DIRECTIVES))
        .toContain(
            'var _t1: i0.Dir = null!; ' +
            '_t1.field2 = _t1.field1 = (((ctx).foo));');
  });

  it('should handle a single property bound to multiple fields, where one of them is coerced',
     () => {
       const TEMPLATE = `<div dir [inputA]="foo"></div>`;
       const DIRECTIVES: TestDeclaration[] = [{
         type: 'directive',
         name: 'Dir',
         selector: '[dir]',
         inputs: {
           field1: 'inputA',
           field2: 'inputA',
         },
         coercedInputFields: ['field1'],
       }];
       expect(tcb(TEMPLATE, DIRECTIVES))
           .toContain(
               'var _t1: typeof i0.Dir.ngAcceptInputType_field1 = null!; ' +
               'var _t2: i0.Dir = null!; ' +
               '_t2.field2 = _t1 = (((ctx).foo));');
     });

  it('should handle a single property bound to multiple fields, where one of them is undeclared',
     () => {
       const TEMPLATE = `<div dir [inputA]="foo"></div>`;
       const DIRECTIVES: TestDeclaration[] = [{
         type: 'directive',
         name: 'Dir',
         selector: '[dir]',
         inputs: {
           field1: 'inputA',
           field2: 'inputA',
         },
         undeclaredInputFields: ['field1'],
       }];
       expect(tcb(TEMPLATE, DIRECTIVES))
           .toContain(
               'var _t1: i0.Dir = null!; ' +
               '_t1.field2 = (((ctx).foo));');
     });

  it('should use coercion types if declared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      coercedInputFields: ['fieldA'],
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1: Dir = null!;');
    expect(block).toContain(
        'var _t1: typeof i0.Dir.ngAcceptInputType_fieldA = null!; ' +
        '_t1 = (((ctx).foo));');
  });

  it('should use coercion types if declared, even when backing field is not declared', () => {
    const TEMPLATE = `<div dir [inputA]="foo"></div>`;
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        fieldA: 'inputA',
      },
      coercedInputFields: ['fieldA'],
      undeclaredInputFields: ['fieldA'],
    }];
    const block = tcb(TEMPLATE, DIRECTIVES);
    expect(block).not.toContain('var _t1: Dir = null!;');
    expect(block).toContain(
        'var _t1: typeof i0.Dir.ngAcceptInputType_fieldA = null!; ' +
        '_t1 = (((ctx).foo));');
  });

  it('should handle $any casts', () => {
    const TEMPLATE = `{{$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('(((ctx).a) as any)');
  });

  it('should handle $any accessed through `this`', () => {
    const TEMPLATE = `{{this.$any(a)}}`;
    const block = tcb(TEMPLATE);
    expect(block).toContain('((ctx).$any(((ctx).a)))');
  });

  describe('experimental DOM checking via lib.dom.d.ts', () => {
    it('should translate unclaimed bindings to their property equivalent', () => {
      const TEMPLATE = `<label [for]="'test'"></label>`;
      const CONFIG = {...ALL_ENABLED_CONFIG, checkTypeOfDomBindings: true};
      expect(tcb(TEMPLATE, /* declarations */ undefined, CONFIG))
          .toContain('_t1["htmlFor"] = ("test");');
    });
  });

  describe('template guards', () => {
    it('should emit invocation guards', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'NgIf',
        selector: '[ngIf]',
        inputs: {'ngIf': 'ngIf'},
        ngTemplateGuards: [{
          inputName: 'ngIf',
          type: 'invocation',
        }]
      }];
      const TEMPLATE = `<div *ngIf="person">{{person.name}}</div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('if (i0.NgIf.ngTemplateGuard_ngIf(_t1, ((ctx).person)))');
    });

    it('should emit binding guards', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'NgIf',
        selector: '[ngIf]',
        inputs: {'ngIf': 'ngIf'},
        ngTemplateGuards: [{
          inputName: 'ngIf',
          type: 'binding',
        }]
      }];
      const TEMPLATE = `<div *ngIf="person !== null">{{person.name}}</div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain('if ((((ctx).person)) !== (null))');
    });

    it('should not emit guards when the child scope is empty', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'NgIf',
        selector: '[ngIf]',
        inputs: {'ngIf': 'ngIf'},
        ngTemplateGuards: [{
          inputName: 'ngIf',
          type: 'invocation',
        }]
      }];
      const TEMPLATE = `<div *ngIf="person">static</div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).not.toContain('NgIf.ngTemplateGuard_ngIf');
    });
  });

  describe('outputs', () => {
    it('should emit subscribe calls for directive outputs', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        outputs: {'outputField': 'dirOutput'},
      }];
      const TEMPLATE = `<div dir (dirOutput)="foo($event)"></div>`;
      const block = tcb(TEMPLATE, DIRECTIVES);
      expect(block).toContain(
          '_t1["outputField"].subscribe(function ($event): any { (ctx).foo($event); });');
    });

    it('should emit a listener function with AnimationEvent for animation events', () => {
      const TEMPLATE = `<div (@animation.done)="foo($event)"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain('function ($event: i1.AnimationEvent): any { (ctx).foo($event); }');
    });

    it('should emit addEventListener calls for unclaimed outputs', () => {
      const TEMPLATE = `<div (event)="foo($event)"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          '_t1.addEventListener("event", function ($event): any { (ctx).foo($event); });');
    });

    it('should allow to cast $event using $any', () => {
      const TEMPLATE = `<div (event)="foo($any($event))"></div>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          '_t1.addEventListener("event", function ($event): any { (ctx).foo(($event as any)); });');
    });

    it('should detect writes to template variables', () => {
      const TEMPLATE = `<ng-template let-v><div (event)="v = 3"></div></ng-template>`;
      const block = tcb(TEMPLATE);
      expect(block).toContain(
          '_t3.addEventListener("event", function ($event): any { (_t2 = 3); });');
    });

    it('should ignore accesses to $event through `this`', () => {
      const TEMPLATE = `<div (event)="foo(this.$event)"></div>`;
      const block = tcb(TEMPLATE);

      expect(block).toContain(
          '_t1.addEventListener("event", function ($event): any { (ctx).foo(((ctx).$event)); });');
    });
  });

  describe('config', () => {
    const DIRECTIVES: TestDeclaration[] = [{
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      exportAs: ['dir'],
      inputs: {'dirInput': 'dirInput'},
      outputs: {'outputField': 'dirOutput'},
      hasNgTemplateContextGuard: true,
    }];
    const BASE_CONFIG: TypeCheckingConfig = {
      applyTemplateContextGuards: true,
      checkQueries: false,
      checkTemplateBodies: true,
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
    };

    describe('config.applyTemplateContextGuards', () => {
      const TEMPLATE = `<div *dir>{{ value }}</div>`;
      const GUARD_APPLIED = 'if (i0.Dir.ngTemplateContextGuard(';

      it('should apply template context guards when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(GUARD_APPLIED);
      });
      it('should not apply template context guards when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, applyTemplateContextGuards: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain(GUARD_APPLIED);
      });
    });

    describe('config.checkTemplateBodies', () => {
      const TEMPLATE = `<ng-template #ref>{{a}}</ng-template>{{ref}}`;

      it('should descend into template bodies when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('((ctx).a)');
      });
      it('should not descend into template bodies when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTemplateBodies: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).not.toContain('((ctx).a)');
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
        expect(block).toContain('_t1.dirInput = (((ctx).a));');
        expect(block).toContain('((ctx).b);');
      });
      it('should use the non-null assertion operator when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, strictNullInputBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t1.dirInput = (((ctx).a)!);');
        expect(block).toContain('((ctx).b)!;');
      });
    });

    describe('config.checkTypeOfBindings', () => {
      it('should check types of bindings when enabled', () => {
        const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('_t1.dirInput = (((ctx).a));');
        expect(block).toContain('((ctx).b);');
      });

      it('should not check types of bindings when disabled', () => {
        const TEMPLATE = `<div dir [dirInput]="a" [nonDirInput]="b"></div>`;
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfInputBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t1.dirInput = ((((ctx).a) as any));');
        expect(block).toContain('(((ctx).b) as any);');
      });

      it('should wrap the cast to any in parentheses when required', () => {
        const TEMPLATE = `<div dir [dirInput]="a === b"></div>`;
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfInputBindings: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('_t1.dirInput = ((((((ctx).a)) === (((ctx).b))) as any));');
      });
    });

    describe('config.checkTypeOfOutputEvents', () => {
      const TEMPLATE = `<div dir (dirOutput)="foo($event)" (nonDirOutput)="foo($event)"></div>`;

      it('should check types of directive outputs when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
            '_t1["outputField"].subscribe(function ($event): any { (ctx).foo($event); });');
        expect(block).toContain(
            '_t2.addEventListener("nonDirOutput", function ($event): any { (ctx).foo($event); });');
      });
      it('should not check types of directive outputs when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfOutputEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('function ($event: any): any { (ctx).foo($event); }');
        // Note that DOM events are still checked, that is controlled by `checkTypeOfDomEvents`
        expect(block).toContain(
            'addEventListener("nonDirOutput", function ($event): any { (ctx).foo($event); });');
      });
    });

    describe('config.checkTypeOfAnimationEvents', () => {
      const TEMPLATE = `<div (@animation.done)="foo($event)"></div>`;

      it('should check types of animation events when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('function ($event: i1.AnimationEvent): any { (ctx).foo($event); }');
      });
      it('should not check types of animation events when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfAnimationEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('function ($event: any): any { (ctx).foo($event); }');
      });
    });

    describe('config.checkTypeOfDomEvents', () => {
      const TEMPLATE = `<div dir (dirOutput)="foo($event)" (nonDirOutput)="foo($event)"></div>`;

      it('should check types of DOM events when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
            '_t1["outputField"].subscribe(function ($event): any { (ctx).foo($event); });');
        expect(block).toContain(
            '_t2.addEventListener("nonDirOutput", function ($event): any { (ctx).foo($event); });');
      });
      it('should not check types of DOM events when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfDomEvents: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        // Note that directive outputs are still checked, that is controlled by
        // `checkTypeOfOutputEvents`
        expect(block).toContain(
            '_t1["outputField"].subscribe(function ($event): any { (ctx).foo($event); });');
        expect(block).toContain('function ($event: any): any { (ctx).foo($event); }');
      });
    });

    describe('config.checkTypeOfDomReferences', () => {
      const TEMPLATE = `<input #ref>{{ref.value}}`;

      it('should trace references when enabled', () => {
        const block = tcb(TEMPLATE);
        expect(block).toContain('(_t1).value');
      });

      it('should use any for reference types when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfDomReferences: false};
        const block = tcb(TEMPLATE, [], DISABLED_CONFIG);
        expect(block).toContain(
            'var _t1 = _t2 as any; ' +
            '"" + (((_t1).value));');
      });
    });

    describe('config.checkTypeOfNonDomReferences', () => {
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
        inputs: {'dirInput': 'dirInput'},
        outputs: {'outputField': 'dirOutput'},
        hasNgTemplateContextGuard: true,
      }];
      const TEMPLATE =
          `<div dir #ref="dir">{{ref.value}}</div><ng-template #ref2></ng-template>{{ref2.value2}}`;

      it('should trace references to a directive when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(_t1).value');
      });

      it('should trace references to an <ng-template> when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain(
            'var _t3 = (_t4 as any as i1.TemplateRef<any>); ' +
            '"" + (((_t3).value2));');
      });

      it('should use any for reference types when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfNonDomReferences: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain(
            'var _t1 = _t2 as any; ' +
            '"" + (((_t1).value));');
      });
    });

    describe('config.checkTypeOfAttributes', () => {
      const TEMPLATE = `<textarea dir disabled cols="3" [rows]="2">{{ref.value}}</textarea>`;
      const DIRECTIVES: TestDeclaration[] = [{
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        inputs: {'disabled': 'disabled', 'cols': 'cols', 'rows': 'rows'},
      }];

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
      const PIPES: TestDeclaration[] = [{
        type: 'pipe',
        name: 'TestPipe',
        pipeName: 'test',
      }];

      it('should check types of pipes when enabled', () => {
        const block = tcb(TEMPLATE, PIPES);
        expect(block).toContain('var _pipe1: i0.TestPipe = null!;');
        expect(block).toContain('(_pipe1.transform(((ctx).a), ((ctx).b), ((ctx).c)));');
      });
      it('should not check types of pipes when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, checkTypeOfPipes: false};
        const block = tcb(TEMPLATE, PIPES, DISABLED_CONFIG);
        expect(block).toContain('var _pipe1: i0.TestPipe = null!;');
        expect(block).toContain('((_pipe1.transform as any)(((ctx).a), ((ctx).b), ((ctx).c))');
      });
    });

    describe('config.strictSafeNavigationTypes', () => {
      const TEMPLATE = `{{a?.b}} {{a?.method()}} {{a?.[0]}}`;

      it('should use undefined for safe navigation operations when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(null as any ? (((ctx).a))!.method() : undefined)');
        expect(block).toContain('(null as any ? (((ctx).a))!.b : undefined)');
        expect(block).toContain('(null as any ? (((ctx).a))![0] : undefined)');
      });
      it('should use an \'any\' type for safe navigation operations when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, strictSafeNavigationTypes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('((((ctx).a))!.method() as any)');
        expect(block).toContain('((((ctx).a))!.b as any)');
        expect(block).toContain('(((((ctx).a))![0] as any)');
      });
    });

    describe('config.strictSafeNavigationTypes (View Engine bug emulation)', () => {
      const TEMPLATE = `{{a.method()?.b}} {{a()?.method()}} {{a.method()?.[0]}}`;
      it('should check the presence of a property/method on the receiver when enabled', () => {
        const block = tcb(TEMPLATE, DIRECTIVES);
        expect(block).toContain('(null as any ? ((((ctx).a)).method())!.b : undefined)');
        expect(block).toContain('(null as any ? ((ctx).a())!.method() : undefined)');
        expect(block).toContain('(null as any ? ((((ctx).a)).method())![0] : undefined)');
      });
      it('should not check the presence of a property/method on the receiver when disabled', () => {
        const DISABLED_CONFIG:
            TypeCheckingConfig = {...BASE_CONFIG, strictSafeNavigationTypes: false};
        const block = tcb(TEMPLATE, DIRECTIVES, DISABLED_CONFIG);
        expect(block).toContain('(((((ctx).a)).method()) as any).b');
        expect(block).toContain('(((ctx).a()) as any).method()');
        expect(block).toContain('(((((ctx).a)).method()) as any)[0]');
      });
    });

    describe('config.strictContextGenerics', () => {
      const TEMPLATE = `Test`;

      it('should use the generic type of the context when enabled', () => {
        const block = tcb(TEMPLATE);
        expect(block).toContain('function _tcb1<T extends string>(ctx: i0.Test<T>)');
      });

      it('should use any for the context generic type when disabled', () => {
        const DISABLED_CONFIG: TypeCheckingConfig = {...BASE_CONFIG, useContextGenericType: false};
        const block = tcb(TEMPLATE, undefined, DISABLED_CONFIG);
        expect(block).toContain('function _tcb1(ctx: i0.Test<any>)');
      });
    });

    describe('config.checkAccessModifiersForInputBindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;

      it('should assign restricted properties via element access for field names that are not JS identifiers',
         () => {
           const DIRECTIVES: TestDeclaration[] = [{
             type: 'directive',
             name: 'Dir',
             selector: '[dir]',
             inputs: {
               'some-input.xs': 'inputA',
             },
             restrictedInputFields: ['some-input.xs'],
             stringLiteralInputFields: ['some-input.xs'],
           }];
           const enableChecks:
               TypeCheckingConfig = {...BASE_CONFIG, honorAccessModifiersForInputBindings: true};
           const block = tcb(TEMPLATE, DIRECTIVES, enableChecks);
           expect(block).toContain(
               'var _t1: i0.Dir = null!; ' +
               '_t1["some-input.xs"] = (((ctx).foo)); ');
         });

      it('should assign restricted properties via property access', () => {
        const DIRECTIVES: TestDeclaration[] = [{
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: 'inputA',
          },
          restrictedInputFields: ['fieldA']
        }];
        const enableChecks:
            TypeCheckingConfig = {...BASE_CONFIG, honorAccessModifiersForInputBindings: true};
        const block = tcb(TEMPLATE, DIRECTIVES, enableChecks);
        expect(block).toContain(
            'var _t1: i0.Dir = null!; ' +
            '_t1.fieldA = (((ctx).foo)); ');
      });
    });
  });

  it('should use `any` type for type constructors with bound generic params ' +
         'when `useInlineTypeConstructors` is `false`',
     () => {
       const template = `
    <div dir
      [inputA]='foo'
      [inputB]='bar'
      ></div>
    `;
       const declarations: TestDeclaration[] = [{
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
         isGeneric: true
       }];

       const renderedTcb = tcb(template, declarations, {useInlineTypeConstructors: false});

       expect(renderedTcb).toContain(`var _t1: i0.Dir<any, any> = null!;`);
       expect(renderedTcb).toContain(`_t1.inputA = (((ctx).foo));`);
       expect(renderedTcb).toContain(`_t1.inputB = (((ctx).bar));`);
     });
});
