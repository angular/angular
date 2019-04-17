/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestDeclaration, tcb} from './test_utils';

describe('type check blocks diagnostics', () => {
  describe('parse spans', () => {
    it('should annotate binary ops', () => {
      expect(tcbWithSpans('{{ a + b }}'))
          .toContain('"" + (((ctx).a /*3,5*/) + ((ctx).b /*7,9*/) /*3,9*/);');
    });

    it('should annotate conditions', () => {
      expect(tcbWithSpans('{{ a ? b : c }}'))
          .toContain('((ctx).a /*3,5*/ ? (ctx).b /*7,9*/ : (ctx).c /*11,13*/) /*3,13*/;');
    });

    it('should annotate interpolations', () => {
      expect(tcbWithSpans('{{ hello }} {{ world }}'))
          .toContain('"" + (ctx).hello /*3,9*/ + (ctx).world /*15,21*/;');
    });

    it('should annotate literal map expressions', () => {
      // The additional method call is present to avoid that the object literal is emitted as
      // statement, which would wrap it into parenthesis that clutter the expected output.
      const TEMPLATE = '{{ m({foo: a, bar: b}) }}';
      expect(tcbWithSpans(TEMPLATE))
          .toContain('m({ "foo": (ctx).a /*11,12*/, "bar": (ctx).b /*19,20*/ } /*5,21*/)');
    });

    it('should annotate literal array expressions', () => {
      const TEMPLATE = '{{ [a, b] }}';
      expect(tcbWithSpans(TEMPLATE)).toContain('[(ctx).a /*4,5*/, (ctx).b /*7,8*/] /*3,10*/;');
    });

    it('should annotate literals', () => {
      const TEMPLATE = '{{ 123 }}';
      expect(tcbWithSpans(TEMPLATE)).toContain('123 /*3,7*/;');
    });

    it('should annotate non-null assertions', () => {
      const TEMPLATE = `{{ a! }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('(((ctx).a /*3,4*/)! /*3,6*/);');
    });

    it('should annotate prefix not', () => {
      const TEMPLATE = `{{ !a }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('!((ctx).a /*4,6*/) /*3,6*/;');
    });

    it('should annotate method calls', () => {
      const TEMPLATE = `{{ method(a, b) }}`;
      expect(tcbWithSpans(TEMPLATE))
          .toContain('(ctx).method((ctx).a /*10,11*/, (ctx).b /*13,14*/) /*3,16*/;');
    });

    it('should annotate property access', () => {
      const TEMPLATE = `{{ a.b.c }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('(((ctx).a /*3,4*/).b /*3,6*/).c /*3,9*/;');
    });

    it('should annotate keyed property access', () => {
      const TEMPLATE = `{{ a[b] }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('((ctx).a /*3,4*/)[(ctx).b /*5,6*/] /*3,8*/;');
    });

    it('should annotate safe property access', () => {
      const TEMPLATE = `{{ a?.b }}`;
      expect(tcbWithSpans(TEMPLATE))
          .toContain('(((ctx).a /*3,4*/) != null ? ((ctx).a /*3,4*/)!.b : undefined) /*3,8*/;');
    });

    it('should annotate safe method calls', () => {
      const TEMPLATE = `{{ a?.method(b) }}`;
      expect(tcbWithSpans(TEMPLATE))
          .toContain(
              '(((ctx).a /*3,4*/) != null ? ((ctx).a /*3,4*/)!.method((ctx).b /*13,14*/) : undefined) /*3,16*/;');
    });

    it('should annotate $any casts', () => {
      const TEMPLATE = `{{ $any(a) }}`;
      expect(tcbWithSpans(TEMPLATE)).toContain('((ctx).a /*8,9*/ as any) /*3,11*/;');
    });

    it('should annotate pipe usages', () => {
      const TEMPLATE = `{{ a | test:b }}`;
      const PIPES: TestDeclaration[] = [{
        type: 'pipe',
        name: 'TestPipe',
        pipeName: 'test',
      }];
      const block = tcbWithSpans(TEMPLATE, PIPES);
      expect(block).toContain(
          '(null as TestPipe).transform((ctx).a /*3,5*/, (ctx).b /*12,14*/) /*3,14*/;');
    });

    describe('attaching multiple comments for multiple references', () => {
      it('should be correct for element refs', () => {
        const TEMPLATE = `<span #a></span>{{ a || a }}`;
        expect(tcbWithSpans(TEMPLATE)).toContain('((_t1 /*19,21*/) || (_t1 /*24,26*/) /*19,26*/);');
      });
      it('should be correct for template vars', () => {
        const TEMPLATE = `<ng-template let-a="b">{{ a || a }}</ng-template>`;
        expect(tcbWithSpans(TEMPLATE)).toContain('((_t2 /*26,28*/) || (_t2 /*31,33*/) /*26,33*/);');
      });
      it('should be correct for directive refs', () => {
        const DIRECTIVES: TestDeclaration[] = [{
          type: 'directive',
          name: 'MyComponent',
          selector: 'my-cmp',
          isComponent: true,
        }];
        const TEMPLATE = `<my-cmp #a></my-cmp>{{ a || a }}`;
        expect(tcbWithSpans(TEMPLATE, DIRECTIVES))
            .toContain('((_t2 /*23,25*/) || (_t2 /*28,30*/) /*23,30*/);');
      });
    });
  });
});

function tcbWithSpans(template: string, declarations: TestDeclaration[] = []): string {
  return tcb(template, declarations, undefined, {emitSpans: true});
}
