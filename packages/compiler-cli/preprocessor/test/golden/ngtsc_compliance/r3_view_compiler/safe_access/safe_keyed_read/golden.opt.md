# /out/safe_keyed_read.ngtypecheck.ts
```ts
/**
 * TCB for /safe_keyed_read.ts
 * @generated
 */

import * as i0 from './safe_keyed_read';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    'Your last name is ' /*100,120*/ +
      (this.unknownNames /*124,136*/ /*124,136*/?.[0 /*139,140*/] /*124,141*/ ||
        'unknown' /*145,154*/) /*124,154*/ /*100,155*/;
    '' +
      this
        .knownNames /*168,178*/ /*168,178*/?.[0 /*181,182*/] /*168,183*/?.[1 /*186,187*/] /*168,188*/ +
      (this
        .species /*214,221*/ /*214,221*/?.[0 /*224,225*/] /*214,226*/?.[1 /*229,230*/] /*214,231*/?.[2 /*234,235*/] /*214,236*/?.[3 /*239,240*/] /*214,241*/?.[4 /*244,245*/] /*214,246*/?.[5 /*249,250*/] /*214,251*/ ||
        'unknown' /*255,264*/) /*214,264*/ +
      this.speciesMap /*287,297*/ /*287,297*/?.[
        this.keys /*300,304*/ /*300,304*/?.[0 /*307,308*/] /*300,309*/ ??
          'key' /*313,318*/ /*300,318*/
      ] /*287,319*/ +
      this.speciesMap /*342,352*/ /*342,352*/?.['key' /*355,360*/] /*342,361*/;
  }
}

```

# /out/safe_keyed_read.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  unknownNames: string[] | null = null;
  knownNames: string[][] = [['Frodo', 'Bilbo']];
  species = null;
  keys = null;
  speciesMap: Record<string, string> = { key: 'unknown' };
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
    decls: 2,
    vars: 5,
    consts: [[3, 'title']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span', 0);
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', 'Your last name is ' + (ctx.unknownNames?.[0] || 'unknown'));
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate4(
          ' Hello, ',
          ctx.knownNames?.[0]?.[1],
          '! You are a Balrog: ',
          ctx.species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown',
          ' You are an Elf: ',
          ctx.speciesMap?.[ctx.keys?.[0] ?? 'key'],
          ' You are an Orc: ',
          ctx.speciesMap?.['key'],
          ' ',
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
        <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
          Hello, {{ knownNames?.[0]?.[1] }}!
          You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
          You are an Elf: {{ speciesMap?.[keys?.[0] ?? 'key'] }}
          You are an Orc: {{ speciesMap?.['key'] }}
        </span>
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
      filePath: 'safe_keyed_read.ts',
      lineNumber: 14,
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