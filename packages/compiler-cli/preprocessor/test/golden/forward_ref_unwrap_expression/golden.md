# /out/test.ts
```ts
import { Component, Directive, ViewChild, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

declare const log: (value: unknown) => void;

// Upstream reaches a `forwardRef(...)` through `unwrapExpression`, which strips ONLY
// parentheses and `as` casts -- never `!`, `<T>x` or `satisfies`. Query predicates take the
// syntactic `tryUnwrapForwardRef` path, so every spelling upstream declines to unwrap must be
// emitted as the original `forwardRef(...)` call rather than as `DepDirective`.
export class HostComponent {
  // Unwrapped: plain call, `as` cast, parentheses, and an `as` cast on the argument.
  plain!: DepDirective;
  asCast!: DepDirective;
  parenthesized!: DepDirective;
  parenthesizedArg!: DepDirective;
  asCastArg!: DepDirective;

  // NOT unwrapped: wrappers `unwrapExpression` leaves in place.
  nonNull!: DepDirective;
  typeAssertion!: DepDirective;
  satisfiesCast!: DepDirective;
  nonNullArg!: DepDirective;

  // NOT unwrapped: upstream requires the block body to hold exactly one statement, so a body
  // that merely *starts* with `return` is rejected.
  returnFirst!: DepDirective;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostComponent, never> = function HostComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostComponent,
    'app-host',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepDirective; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostComponent,
    selectors: [['app-host']],
    viewQuery: function HostComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(DepDirective, 5)(DepDirective, 5)(DepDirective, 5)(DepDirective, 5)(
          DepDirective,
          5,
        )(
          forwardRef(() => DepDirective),
          5,
        )(
          forwardRef(() => DepDirective),
          5,
        )(
          forwardRef(() => DepDirective),
          5,
        )(forwardRef((() => DepDirective)!), 5)(
          forwardRef(() => {
            return DepDirective;
            log(1);
          }),
          5,
        );
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.plain = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.asCast = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.parenthesized = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.parenthesizedArg = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.asCastArg = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.nonNull = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.typeAssertion = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.satisfiesCast = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.nonNullArg = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.returnFirst = _t.first);
      }
    },
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [DepDirective];
      }),
    ],
    decls: 0,
    vars: 0,
    template: function HostComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-host',
                standalone: true,
                template: '',
                // `!` is stripped by the partial evaluator, so this one still resolves.
                hostDirectives: [{ directive: forwardRef(() => DepDirective)! }],
              },
            ],
          },
        ],
        null,
        {
          plain: [{ type: ViewChild, args: [forwardRef(() => DepDirective)] }],
          asCast: [{ type: ViewChild, args: [forwardRef(() => DepDirective) as any] }],
          parenthesized: [{ type: ViewChild, args: [forwardRef(() => DepDirective)] }],
          parenthesizedArg: [{ type: ViewChild, args: [forwardRef(() => DepDirective)] }],
          asCastArg: [{ type: ViewChild, args: [forwardRef((() => DepDirective) as any)] }],
          nonNull: [{ type: ViewChild, args: [forwardRef(() => DepDirective)!] }],
          typeAssertion: [{ type: ViewChild, args: [<any>forwardRef(() => DepDirective)] }],
          satisfiesCast: [
            { type: ViewChild, args: [forwardRef(() => DepDirective) satisfies any] },
          ],
          nonNullArg: [{ type: ViewChild, args: [forwardRef((() => DepDirective)!)] }],
          returnFirst: [
            {
              type: ViewChild,
              args: [
                forwardRef(() => {
                  return DepDirective;
                  log(1);
                }),
              ],
            },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(HostComponent, {
      className: 'HostComponent',
      filePath: 'test.ts',
      lineNumber: 16,
    });
})();

// `imports` is resolved by the partial evaluator upstream, not syntactically, and the
// evaluator sees through `!` as well. Every spelling here must keep resolving to
// `DepDirective` -- narrowing the syntactic helper must not reach this path.
export class ImportsComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportsComponent, never> = function ImportsComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ImportsComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportsComponent,
    'app-imports',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportsComponent,
    selectors: [['app-imports']],
    decls: 1,
    vars: 0,
    consts: [['dep', '']],
    template: function ImportsComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ImportsComponent, [
      forwardRef(() => DepDirective)!,
      forwardRef(() => DepDirective) as any,
      forwardRef(() => DepDirective),
      forwardRef(() => DepDirective),
    ]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportsComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-imports',
                standalone: true,
                template: '<div dep></div>',
                imports: [
                  forwardRef(() => DepDirective)!,
                  forwardRef(() => DepDirective) as any,
                  forwardRef(() => DepDirective),
                  forwardRef(() => DepDirective),
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ImportsComponent, {
      className: 'ImportsComponent',
      filePath: 'test.ts',
      lineNumber: 55,
    });
})();

export class DepDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DepDirective, never> = function DepDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DepDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DepDirective,
    '[dep]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DepDirective, selectors: [['', 'dep', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DepDirective,
        [{ type: Directive, args: [{ selector: '[dep]', standalone: true }] }],
        null,
        null,
      );
  }
}

```