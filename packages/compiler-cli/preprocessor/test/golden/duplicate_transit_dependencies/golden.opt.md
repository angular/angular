# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './first.module';

var _pipe1 = null! as i1.TransitPipe;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    '' + _pipe1.transform(/*216,223*/ 'hello' /*206,213*/) /*206,223*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { FirstModule } from './first.module';
import { SecondModule } from './second.module';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './first.module';

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    standalone: false,
    decls: 3,
    vars: 3,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'transit');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'hello'));
      }
    },
    dependencies: (): any => [i1.TransitPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: `<div>{{ 'hello' | transit }}</div>`,
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 10,
    });
})();

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
    [typeof AppComponent],
    [typeof FirstModule, typeof SecondModule],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [FirstModule, SecondModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [FirstModule, SecondModule],
                declarations: [AppComponent],
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
    i0.ɵɵsetNgModuleScope(AppModule, {
      declarations: [AppComponent],
      imports: [FirstModule, SecondModule],
    });
})();

```

# /out/first.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TransitPipe implements PipeTransform {
  transform(value: string): string {
    return `[Transit] ${value}`;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TransitPipe, never> = function TransitPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TransitPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<TransitPipe, 'transit', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'transit', type: TransitPipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TransitPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'transit',
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

export class FirstModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FirstModule, never> = function FirstModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FirstModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    FirstModule,
    [typeof TransitPipe],
    never,
    [typeof TransitPipe]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FirstModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FirstModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FirstModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [TransitPipe],
                exports: [TransitPipe],
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
    i0.ɵɵsetNgModuleScope(FirstModule, { declarations: [TransitPipe], exports: [TransitPipe] });
})();

```

# /out/second.module.ts
```ts
import { NgModule } from '@angular/core';
import { FirstModule } from './first.module';
// @ts-ignore
import * as i0 from '@angular/core';

export class SecondModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SecondModule, never> = function SecondModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SecondModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    SecondModule,
    never,
    [typeof FirstModule],
    [typeof FirstModule]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SecondModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SecondModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [FirstModule, FirstModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SecondModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [FirstModule],
                exports: [FirstModule],
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
    i0.ɵɵsetNgModuleScope(SecondModule, { imports: [FirstModule], exports: [FirstModule] });
})();

```