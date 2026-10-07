# /out/safe_access_deep.ngtypecheck.ts
```ts
/**
 * TCB for /safe_access_deep.ts
 * @generated
 */

import * as i0 from './safe_access_deep';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      this.p /*107,108*/ /*107,108*/?.a /*110,111*/ /*107,111*/?.b /*113,114*/ /*107,114*/
        ?.c /*116,117*/ /*107,117*/?.d /*119,120*/ /*107,120*/;
    '' +
      this.p /*154,155*/ /*154,155*/?.['a' /*158,161*/] /*154,162*/?.[
        'b' /*165,168*/
      ] /*154,169*/?.['c' /*172,175*/] /*154,176*/?.['d' /*179,182*/] /*154,183*/;
    '' +
      this.p /*221,222*/ /*221,222*/?.a /*224,225*/ /*221,225*/?.b /*227,228*/ /*221,228*/
        .c /*229,230*/ /*221,230*/.d /*231,232*/ /*221,232*/?.e /*234,235*/ /*221,235*/
        ?.f /*237,238*/ /*221,238*/?.g /*240,241*/ /*221,241*/.h /*242,243*/ /*221,243*/;
    '' +
      this.p /*291,292*/ /*291,292*/.a /*293,294*/ /*291,294*/['b' /*295,298*/] /*291,299*/
        .c /*300,301*/ /*291,301*/.d /*302,303*/ /*291,303*/?.['e' /*306,309*/] /*291,310*/?.[
        'f' /*313,316*/
      ] /*291,317*/?.g /*319,320*/ /*291,320*/['h' /*321,324*/] /*291,325*/[
        'i' /*326,329*/
      ] /*291,330*/?.j /*332,333*/ /*291,333*/.k /*334,335*/ /*291,335*/;
  }
}

```

# /out/safe_access_deep.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  p: any = null;
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
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1('Safe Property: ', ctx.p?.a?.b?.c?.d);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1('Safe Keyed: ', ctx.p?.['a']?.['b']?.['c']?.['d']);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1('Mixed Property: ', ctx.p?.a?.b.c.d?.e?.f?.g.h);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'Mixed Property and Keyed: ',
          ctx.p.a['b'].c.d?.['e']?.['f']?.g['h']['i']?.j.k,
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
      <span>Safe Property: {{ p?.a?.b?.c?.d }}</span>
      <span>Safe Keyed: {{ p?.['a']?.['b']?.['c']?.['d'] }}</span>
      <span>Mixed Property: {{ p?.a?.b.c.d?.e?.f?.g.h }}</span>
      <span>Mixed Property and Keyed: {{ p.a['b'].c.d?.['e']?.['f']?.g['h']['i']?.j.k }}</span>
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
      filePath: 'safe_access_deep.ts',
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