# /out/safe_access_temporaries_use_null.ngtypecheck.ts
```ts
/**
 * TCB for /safe_access_temporaries_use_null.ts
 * @generated
 */

import * as i0 from './safe_access_temporaries_use_null';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      this
        .p /*118,119*/
        () /*118,121*/
        ?.a /*123,124*/ /*118,124*/
        ?.() /*118,126*/
        ?.b /*128,129*/ /*118,129*/
        ?.() /*118,131*/
        ?.c /*133,134*/ /*118,134*/
        ?.() /*118,136*/
        ?.d /*138,139*/ /*118,139*/
        ?.() /*118,141*/;
    '' +
      this.p /*200,201*/ /*200,201*/
        ?.a /*203,204*/ /*200,204*/
        ?.() /*200,206*/
        ?.b /*208,209*/ /*200,209*/
        ?.() /*200,211*/
        .c /*212,213*/
        () /*200,215*/
        .d /*216,217*/
        () /*200,219*/
        ?.e /*221,222*/ /*200,222*/
        ?.() /*200,224*/
        ?.f /*226,227*/ /*200,227*/
        ?.g /*229,230*/ /*200,230*/
        .h /*231,232*/ /*200,232*/
        ?.i /*234,235*/ /*200,235*/
        ?.() /*200,237*/
        ?.j /*239,240*/ /*200,240*/
        ?.() /*200,242*/
        ?.k /*244,245*/ /*200,245*/
        ?.() /*200,247*/.l /*248,249*/ /*200,249*/;
    '' +
      this
        .f1 /*295,297*/
        () /*295,299*/?.[
        this
          .f2 /*302,304*/
          () /*302,306*/?.a /*308,309*/ /*302,309*/
      ] /*295,310*/?.b /*312,313*/ /*295,313*/;
    '' +
      this
        .f1 /*364,366*/
        () /*364,368*/
        ?.[
          this
            .f2 /*371,373*/
            () /*371,375*/
            ?.f3 /*377,379*/ /*371,379*/
            ?.() /*371,381*/?.[
            this
              .f4 /*384,386*/
              () /*384,388*/
              ?.f5 /*390,392*/ /*384,392*/
              ?.() /*384,394*/
          ] /*371,395*/
        ] /*364,396*/
        ?.f6 /*398,400*/ /*364,400*/
        ?.() /*364,402*/;
  }
}

```

# /out/safe_access_temporaries_use_null.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  p: any = null;
  f1(): any {}
  f2(): any {}
  f3(): any {}
  f4(): any {}
  f5(): any {}
  f6(): any {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 8,
    vars: 4,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'span');
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, 'span');
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, 'span');
        i0.ɵɵtext(7);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_0_0;
        let tmp_1_0;
        let tmp_2_0;
        let tmp_2_1;
        let tmp_3_0;
        let tmp_3_1;
        let tmp_3_2;
        let tmp_3_3;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(
          'Safe Property with Calls: ',
          (tmp_0_0 = ctx.p()) == null
            ? null
            : (tmp_0_0 = tmp_0_0.a()) == null
              ? null
              : (tmp_0_0 = tmp_0_0.b()) == null
                ? null
                : (tmp_0_0 = tmp_0_0.c()) == null
                  ? null
                  : tmp_0_0.d(),
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'Safe and Unsafe Property with Calls: ',
          ctx.p == null
            ? null
            : (tmp_1_0 = ctx.p.a()) == null
              ? null
              : (tmp_1_0 = tmp_1_0.b().c().d()) == null
                ? null
                : (tmp_1_0 = tmp_1_0.e()) == null
                  ? null
                  : tmp_1_0.f == null
                    ? null
                    : tmp_1_0.f.g.h == null
                      ? null
                      : (tmp_1_0 = tmp_1_0.f.g.h.i()) == null
                        ? null
                        : (tmp_1_0 = tmp_1_0.j()) == null
                          ? null
                          : tmp_1_0.k().l,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'Nested Safe with Calls: ',
          (tmp_2_0 = ctx.f1()) == null
            ? null
            : tmp_2_0[(tmp_2_1 = ctx.f2()) == null ? null : tmp_2_1.a] == null
              ? null
              : tmp_2_0[(tmp_2_1 = tmp_2_1) == null ? null : tmp_2_1.a].b,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'Deep Nested Safe with Calls: ',
          (tmp_3_0 = ctx.f1()) == null
            ? null
            : tmp_3_0[
                  (tmp_3_1 = ctx.f2()) == null
                    ? null
                    : (tmp_3_2 = tmp_3_1.f3()) == null
                      ? null
                      : tmp_3_2[(tmp_3_3 = ctx.f4()) == null ? null : tmp_3_3.f5()]
                ] == null
              ? null
              : tmp_3_0[
                  (tmp_3_1 = tmp_3_1) == null
                    ? null
                    : (tmp_3_2 = tmp_3_2) == null
                      ? null
                      : tmp_3_2[(tmp_3_3 = tmp_3_3) == null ? null : tmp_3_3.f5()]
                ].f6(),
        );
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
      <span>Safe Property with Calls: {{ p()?.a()?.b()?.c()?.d() }}</span>
      <span>Safe and Unsafe Property with Calls: {{ p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l }}</span>
      <span>Nested Safe with Calls: {{ f1()?.[f2()?.a]?.b }}</span>
      <span>Deep Nested Safe with Calls: {{ f1()?.[f2()?.f3()?.[f4()?.f5()]]?.f6() }}</span>
    `,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'safe_access_temporaries_use_null.ts',
      lineNumber: 12,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] });
})();

```