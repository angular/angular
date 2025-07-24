/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '../../file_system/testing';
import {tcb, TestDeclaration} from '../testing';

describe('type check blocks diagnostics', () => {
  beforeEach(() => initMockFileSystem('Native'));

  describe('parse spans', () => {
    it('should annotate unary ops', () => {
      expect(tcbWithSpans('{{ -a }}')).toContain('(-((this).a /*4,5*/) /*4,5*/) /*3,5*/');
    });

    it('should annotate binary ops', () => {
      expect(tcbWithSpans('{{ a + b }}')).toContain(
        '(((this).a /*3,4*/) /*3,4*/) + (((this).b /*7,8*/) /*7,8*/) /*3,8*/',
      );
    });

    it('should annotate conditions', () => {
      expect(tcbWithSpans('{{ a ? b : c }}')).toContain(
        '(((this).a /*3,4*/) /*3,4*/ ? ((this).b /*7,8*/) /*7,8*/ : (((this).c /*11,12*/) /*11,12*/)) /*3,12*/',
      );
    });

    it('should annotate interpolations', () => {
      expect(tcbWithSpans('{{ hello }} {{ world }}')).toContain(
        '"" + (((this).hello /*3,8*/) /*3,8*/) + (((this).world /*15,20*/) /*15,20*/)',
      );
    });

    it('should annotate literal map expressions', () => {
      // The additional method call is present to avoid that the object literal is emitted as
      // statement, which would wrap it into parenthesis that clutter the expected output.
      const TEMPLATE = '{{ m({foo: a, bar: b}) }}';
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(this).m /*3,4*/({ "foo": ((this).a /*11,12*/) /*11,12*/, "bar": ((this).b /*19,20*/) /*19,20*/ } /*5,21*/) /*3,22*/',
      );
    });

    it('should annotate literal map expressions with shorthand declarations', () => {
      // The additional method call is present to avoid that the object literal is emitted as
      // statement, which would wrap it into parenthesis that clutter the expected output.
      const TEMPLATE = '{{ m({a, b}) }}';
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '((this).m /*3,4*/({ "a": ((this).a /*6,7*/) /*6,7*/, "b": ((this).b /*9,10*/) /*9,10*/ } /*5,11*/) /*3,12*/)',
      );
    });

    it('should annotate literal array expressions', () => {
      const TEMPLATE = '{{ [a, b] }}';
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '[((this).a /*4,5*/) /*4,5*/, ((this).b /*7,8*/) /*7,8*/] /*3,9*/',
      );
    });

    it('should annotate literals', () => {
      const TEMPLATE = '{{ 123 }}';
      expect(tcbWithSpans(TEMPLATE)).toContain('123 /*3,6*/');
    });

    it('should annotate non-null assertions', () => {
      const TEMPLATE = `{{ a! }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('(((this).a /*3,4*/) /*3,4*/)! /*3,5*/');
    });

    it('should annotate prefix not', () => {
      const TEMPLATE = `{{ !a }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('!(((this).a /*4,5*/) /*4,5*/) /*3,5*/');
    });

    it('should annotate method calls', () => {
      const TEMPLATE = `{{ method(a, b) }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(this).method /*3,9*/(((this).a /*10,11*/) /*10,11*/, ((this).b /*13,14*/) /*13,14*/) /*3,15*/',
      );
    });

    it('should annotate safe calls', () => {
      const TEMPLATE = `{{ method?.(a, b) }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '((0 as any ? (((this).method /*3,9*/) /*3,9*/)!(((this).a /*12,13*/) /*12,13*/, ((this).b /*15,16*/) /*15,16*/) : undefined) /*3,17*/)',
      );
    });

    it('should annotate method calls of variables', () => {
      const TEMPLATE = `<ng-template let-method>{{ method(a, b) }}</ng-template>`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '_t2 /*27,33*/(((this).a /*34,35*/) /*34,35*/, ((this).b /*37,38*/) /*37,38*/) /*27,39*/',
      );
    });

    it('should annotate function calls', () => {
      const TEMPLATE = `{{ method(a)(b, c) }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(this).method /*3,9*/(((this).a /*10,11*/) /*10,11*/) /*3,12*/(((this).b /*13,14*/) /*13,14*/, ((this).c /*16,17*/) /*16,17*/) /*3,18*/',
      );
    });

    it('should annotate property access', () => {
      const TEMPLATE = `{{ a.b.c }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '((((((this).a /*3,4*/) /*3,4*/).b /*5,6*/) /*3,6*/).c /*7,8*/) /*3,8*/',
      );
    });

    it('should annotate property writes', () => {
      const TEMPLATE = `<div (click)='a.b.c = d'></div>`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(((((((this).a /*14,15*/) /*14,15*/).b /*16,17*/) /*14,17*/).c /*18,19*/) /*14,19*/) = (((this).d /*22,23*/) /*22,23*/) /*14,23*/;',
      );
    });

    it('should annotate $event property writes', () => {
      const TEMPLATE = `<div (click)='a = $event'></div>`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(((this).a /*14,15*/) /*14,15*/) = ($event /*18,24*/) /*14,24*/; }) /*5,25*/;',
      );
    });

    it('should annotate keyed property access', () => {
      const TEMPLATE = `{{ a[b] }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(((this).a /*3,4*/) /*3,4*/)[((this).b /*5,6*/) /*5,6*/] /*3,7*/',
      );
    });

    it('should annotate keyed property writes', () => {
      const TEMPLATE = `<div (click)="a[b] = c"></div>`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '((((this).a /*14,15*/) /*14,15*/)[((this).b /*16,17*/) /*16,17*/] /*14,18*/) = (((this).c /*21,22*/) /*21,22*/) /*14,22*/;',
      );
    });

    it('should annotate safe property access', () => {
      const TEMPLATE = `{{ a?.b }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(0 as any ? (((this).a /*3,4*/) /*3,4*/)!.b /*6,7*/ : undefined) /*3,7*/',
      );
    });

    it('should annotate safe method calls', () => {
      const TEMPLATE = `{{ a?.method(b) }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '((0 as any ? (0 as any ? (((this).a /*3,4*/) /*3,4*/)!.method /*6,12*/ : undefined) /*3,12*/!(((this).b /*13,14*/) /*13,14*/) : undefined) /*3,15*/)',
      );
    });

    it('should annotate safe keyed reads', () => {
      const TEMPLATE = `{{ a?.[0] }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(0 as any ? (((this).a /*3,4*/) /*3,4*/)![0 /*7,8*/] /*3,9*/ : undefined) /*3,9*/',
      );
    });

    it('should annotate $any casts', () => {
      const TEMPLATE = `{{ $any(a) }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('(((this).a /*8,9*/) /*8,9*/ as any) /*3,10*/');
    });

    it('should annotate chained expressions', () => {
      const TEMPLATE = `<div (click)='a; b; c'></div>`;
      expect(tcbWithSpans(TEMPLATE)).toContain(
        '(((this).a /*14,15*/) /*14,15*/, ((this).b /*17,18*/) /*17,18*/, ((this).c /*20,21*/) /*20,21*/) /*14,21*/',
      );
    });

    it('should annotate pipe usages', () => {
      const TEMPLATE = `{{ a | test:b }}`;
      const PIPES: TestDeclaration[] = [
        {
          type: 'pipe',
          name: 'TestPipe',
          pipeName: 'test',
        },
      ];
      const block = tcbWithSpans(TEMPLATE, PIPES);
      expect(block).toContain('var _pipe1 = null! as i0.TestPipe');
      expect(block).toContain(
        '(_pipe1.transform /*7,11*/(((this).a /*3,4*/) /*3,4*/, ((this).b /*12,13*/) /*12,13*/) /*3,13*/);',
      );
    });

    describe('attaching multiple comments for multiple references', () => {
      it('should be correct for element refs', () => {
        const TEMPLATE = `<span #a></span>{{ a || a }}`;
        expect(tcbWithSpans(TEMPLATE)).toContain('((_t1 /*19,20*/) || (_t1 /*24,25*/) /*19,25*/);');
      });
      it('should be correct for template vars', () => {
        const TEMPLATE = `<ng-template let-a='b'>{{ a || a }}</ng-template>`;
        expect(tcbWithSpans(TEMPLATE)).toContain('((_t2 /*26,27*/) || (_t2 /*31,32*/) /*26,32*/);');
      });
      it('should be correct for directive refs', () => {
        const DIRECTIVES: TestDeclaration[] = [
          {
            type: 'directive',
            name: 'MyComponent',
            selector: 'my-cmp',
            isComponent: true,
          },
        ];
        const TEMPLATE = `<my-cmp #a></my-cmp>{{ a || a }}`;
        expect(tcbWithSpans(TEMPLATE, DIRECTIVES)).toContain(
          '((_t1 /*23,24*/) || (_t1 /*28,29*/) /*23,29*/);',
        );
      });
    });

    describe('attaching comments for generic directive inputs', () => {
      it('should be correct for directive refs', () => {
        const DIRECTIVES: TestDeclaration[] = [
          {
            type: 'directive',
            name: 'MyComponent',
            selector: 'my-cmp',
            isComponent: true,
            isGeneric: true,
            inputs: {'inputA': 'inputA'},
          },
        ];
        const TEMPLATE = `<my-cmp [inputA]="''"></my-cmp>`;
        expect(tcbWithSpans(TEMPLATE, DIRECTIVES)).toContain(
          '_t1.inputA /*9,15*/ = ("" /*18,20*/) /*8,21*/;',
        );
      });
    });

    describe('control flow', () => {
      it('@for', () => {
        const template = `@for (user of users; track user; let i = $index) { {{i}} }`;
        // user variable
        expect(tcbWithSpans(template, [])).toContain('const _t1 /*6,10*/');
        expect(tcbWithSpans(template, [])).toContain('(this).users /*14,19*/');
        // index variable
        expect(tcbWithSpans(template, [])).toContain(
          'var _t2 /*37,38*/ = null! as number /*T:VAE*/ /*37,47*/',
        );
        // track expression
        expect(tcbWithSpans(template, [])).toContain('_t1 /*27,31*/;');
      });

      it('@for with comma separated variables', () => {
        const template = `@for (x of y; track x; let i = $index, odd   =    $odd,e_v_e_n=$even) { {{i + odd + e_v_e_n}} }`;
        expect(tcbWithSpans(template, [])).toContain(
          'var _t2 /*27,28*/ = null! as number /*T:VAE*/ /*27,37*/',
        );
        expect(tcbWithSpans(template, [])).toContain(
          'var _t3 /*39,42*/ = null! as boolean /*T:VAE*/ /*39,54*/',
        );
        expect(tcbWithSpans(template, [])).toContain(
          'var _t4 /*55,62*/ = null! as boolean /*T:VAE*/ /*55,68*/',
        );
      });

      it('@if', () => {
        const template = `@if (x; as alias) { {{alias}} }`;
        expect(tcbWithSpans(template, [])).toContain('var _t1 /*11,16*/');
        expect(tcbWithSpans(template, [])).toContain('(this).x /*5,6*/');
      });
    });
  });
});

function tcbWithSpans(template: string, declarations: TestDeclaration[] = []): string {
  return tcb(template, declarations, undefined, {emitSpans: true});
}
