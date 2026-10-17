# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
  }
}

```

# /out/test.ts
```ts
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  ViewChild,
  ViewChildren,
  contentChild,
  forwardRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import { IMPORTED_REF } from './refs';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ["sig's"];
const _c1 = ["it's"];
const _c2 = ['sig'];
const _c3 = ['bare'];
const _c4 = ['myRef'];
const _c5 = ['importedRef'];
const _c6 = ['plain'];
const _c7 = ['x', 'y', 'z'];
const _c8 = ['a', 'b'];
const _c9 = ['p', 'q', 'myLegacy'];

const PREFIX = 'my';

export class Marker {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Marker, never> = function Marker_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Marker)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Marker,
    '[marker]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: Marker, selectors: [['', 'marker', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Marker,
        [{ type: Directive, args: [{ selector: '[marker]', standalone: true }] }],
        null,
        null,
      );
  }
}

export class TestComp {
  // A template literal with a substitution is evaluated: ngc emits ["myRef"].
  templated: any;
  // Every array element is split on commas: ngc emits ["x", "y", "z"].
  arrayWithComma: any;
  // Escape sequences are cooked: ngc emits ["it's"].
  escaped: any;
  // A comma-separated string is split: ngc emits ["a", "b"].
  commaString: any;
  // An imported constant is evaluated across files when that file is visible.
  imported: any;
  // Ordinary predicates, with options that must be unaffected.
  plain: any;
  byType: any;
  byForwardRef: any;

  // Signal queries take only a string literal as a selector list; anything else is emitted as
  // an expression, so the substituted template literal stays verbatim.
  signalString = viewChild(
    'sig',
    ...((ngDevMode ? [{ debugName: 'signalString' }] : /* istanbul ignore next */ []) as []),
  );
  signalTemplate = viewChild(
    `${PREFIX}Sig`,
    ...((ngDevMode ? [{ debugName: 'signalTemplate' }] : /* istanbul ignore next */ []) as []),
  );
  signalNoSubstitution = viewChild(
    `bare`,
    ...((ngDevMode
      ? [{ debugName: 'signalNoSubstitution' }]
      : /* istanbul ignore next */ []) as []),
  );
  signalEscaped = contentChild(
    "sig's",
    ...((ngDevMode ? [{ debugName: 'signalEscaped' }] : /* istanbul ignore next */ []) as []),
  );
  signalByType = viewChildren(
    Marker,
    ...((ngDevMode ? [{ debugName: 'signalByType' }] : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'test-comp',
    never,
    {},
    {},
    ['signalEscaped', 'escaped', 'byForwardRef'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['test-comp']],
    contentQueries: function TestComp_ContentQueries(rf: number, ctx: any, dirIndex: number): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.signalEscaped, _c0, 5);
        i0.ɵɵcontentQuery(dirIndex, _c1, 5)(dirIndex, Marker, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.escaped = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.byForwardRef = _t);
      }
    },
    viewQuery: function TestComp_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.signalString, _c2, 5)(ctx.signalTemplate, `${PREFIX}Sig`, 5)(
          ctx.signalNoSubstitution,
          _c3,
          5,
        )(ctx.signalByType, Marker, 5);
        i0.ɵɵviewQuery(_c4, 5)(_c5, 5)(_c6, 7, ElementRef)(Marker, 5)(_c7, 5)(_c8, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(4);
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.templated = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.imported = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.plain = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.byType = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.arrayWithComma = _t);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.commaString = _t);
      }
    },
    decls: 5,
    vars: 0,
    consts: [['myRef', '', 'x', '', 'y', '', 'z', '']],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div', null, 0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-comp',
                template: '<div #myRef #x #y #z></div>',
                standalone: true,
              },
            ],
          },
        ],
        null,
        {
          templated: [{ type: ViewChild, args: [`${PREFIX}Ref`] }],
          arrayWithComma: [{ type: ViewChildren, args: [['x,y', 'z'] as any] }],
          escaped: [{ type: ContentChild, args: ["it's"] }],
          commaString: [{ type: ViewChildren, args: ['a, b'] }],
          imported: [{ type: ViewChild, args: [IMPORTED_REF] }],
          plain: [{ type: ViewChild, args: ['plain', { read: ElementRef, static: true }] }],
          byType: [{ type: ViewChild, args: [Marker] }],
          byForwardRef: [
            { type: ContentChildren, args: [forwardRef(() => Marker), { descendants: true }] },
          ],
          signalEscaped: [
            { type: i0.ContentChild, args: ["sig's", { isSignal: true, descendants: true }] },
          ],
          signalString: [{ type: i0.ViewChild, args: ['sig', { isSignal: true }] }],
          signalTemplate: [
            { type: i0.ViewChild, args: [i0.forwardRef(() => `${PREFIX}Sig`), { isSignal: true }] },
          ],
          signalNoSubstitution: [{ type: i0.ViewChild, args: [`bare`, { isSignal: true }] }],
          signalByType: [
            { type: i0.ViewChildren, args: [i0.forwardRef(() => Marker), { isSignal: true }] },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, { className: 'TestComp', filePath: 'test.ts', lineNumber: 26 });
})();

export class LegacyQueries {
  legacy: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyQueries, never> = function LegacyQueries_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyQueries)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LegacyQueries,
    '[legacy]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LegacyQueries,
    selectors: [['', 'legacy', '']],
    viewQuery: function LegacyQueries_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c9, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.legacy = _t);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyQueries,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[legacy]',
                standalone: true,
                // The `queries` metadata property evaluates its predicates like the decorators do.
                queries: { legacy: new ViewChildren(['p,q', `${PREFIX}Legacy`] as any) },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```