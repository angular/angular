# /out/pipe_invocation.ngtypecheck.ts
```ts
/**
 * TCB for /pipe_invocation.ts
 * @generated
 */

import * as i0 from './pipe_invocation';

var _pipe1 = null! as i0.MyPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      _pipe1.transform(/*363,369*/ this.name /*356,360*/ /*356,360*/) /*356,369*/ +
      _pipe1.transform(/*382,388*/ this.name /*375,379*/ /*375,379*/, 1 /*389,390*/) /*375,390*/ +
      _pipe1.transform(
        /*403,409*/ this.name /*396,400*/ /*396,400*/,
        1 /*410,411*/,
        2 /*412,413*/,
      ) /*396,413*/ +
      _pipe1.transform(
        /*426,432*/ this.name /*419,423*/ /*419,423*/,
        1 /*433,434*/,
        2 /*435,436*/,
        3 /*437,438*/,
      ) /*419,438*/ +
      _pipe1.transform(
        /*451,457*/ this.name /*444,448*/ /*444,448*/,
        1 /*458,459*/,
        2 /*460,461*/,
        3 /*462,463*/,
        4 /*464,465*/,
      ) /*444,465*/;
  }
}

```

# /out/pipe_invocation.ts
```ts
import { Component, NgModule, OnDestroy, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => [a0, 1, 2, 3, 4];

export class MyPipe implements PipeTransform, OnDestroy {
  transform(value: any, ...args: any[]) {
    return value;
  }
  ngOnDestroy(): void {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'myPipe',
    type: MyPipe,
    pure: false,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'myPipe',
                pure: false,
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

export class MyApp {
  name = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 6,
    vars: 27,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'myPipe');
        i0.ɵɵpipe(2, 'myPipe');
        i0.ɵɵpipe(3, 'myPipe');
        i0.ɵɵpipe(4, 'myPipe');
        i0.ɵɵpipe(5, 'myPipe');
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate5(
          '0:',
          i0.ɵɵpipeBind1(1, 5, ctx.name),
          '1:',
          i0.ɵɵpipeBind2(2, 7, ctx.name, 1),
          '2:',
          i0.ɵɵpipeBind3(3, 10, ctx.name, 1, 2),
          '3:',
          i0.ɵɵpipeBind4(4, 14, ctx.name, 1, 2, 3),
          '4:',
          i0.ɵɵpipeBindV(5, 19, i0.ɵɵpureFunction1(25, _c0, ctx.name)),
        );
      }
    },
    dependencies: [MyPipe],
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
                selector: 'my-app',
                template:
                  '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}',
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
      filePath: 'pipe_invocation.ts',
      lineNumber: 19,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyPipe, typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyPipe, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyApp] });
})();

```