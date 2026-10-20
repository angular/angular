# /out/a_second.ngtypecheck.ts
```ts
/**
 * TCB for /a_second.ts
 * @generated
 */

import * as i0 from './a_second';

/*tcb1*/
function _tcb1(this: i0.ASecondComp) {
  if (true) {
  }
}

```

# /out/a_second.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ASecondComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ASecondComp, never> = function ASecondComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ASecondComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ASecondComp,
    'a-second',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: ASecondComp,
      selectors: [['a-second']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function ASecondComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'z-first');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ASecondComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'a-second',
                template: '<z-first></z-first>',
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
    i0.ɵsetClassDebugInfo(ASecondComp, {
      className: 'ASecondComp',
      filePath: 'a_second.ts',
      lineNumber: 8,
    });
})();

```

# /out/module.ts
```ts
import { NgModule } from '@angular/core';
import { ZFirstComp } from './z_first';
import { ASecondComp } from './a_second';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof ZFirstComp, typeof ASecondComp],
    never,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [ZFirstComp, ASecondComp],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [ZFirstComp, ASecondComp] });
})();
i0.ɵɵsetComponentScope(ASecondComp, [ZFirstComp], []);

```

# /out/z_first.ngtypecheck.ts
```ts
/**
 * TCB for /z_first.ts
 * @generated
 */

import * as i0 from './z_first';

/*tcb1*/
function _tcb1(this: i0.ZFirstComp) {
  if (true) {
  }
}

```

# /out/z_first.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './a_second';

export class ZFirstComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ZFirstComp, never> = function ZFirstComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ZFirstComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ZFirstComp,
    'z-first',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: ZFirstComp,
      selectors: [['z-first']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function ZFirstComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'a-second');
        }
      },
      dependencies: [i1.ASecondComp],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ZFirstComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'z-first',
                template: '<a-second></a-second>',
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
    i0.ɵsetClassDebugInfo(ZFirstComp, {
      className: 'ZFirstComp',
      filePath: 'z_first.ts',
      lineNumber: 8,
    });
})();

```