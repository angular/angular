# /out/pipes.ngtypecheck.ts
```ts
/**
 * TCB for /pipes.ts
 * @generated
 */

import * as i0 from './pipes';

var _pipe1 = null! as i0.MyPipe;
var _pipe2 = null! as i0.MyPurePipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      _pipe2.transform(
        /*679,689*/ _pipe1.transform(
          /*665,671*/ this.name /*658,662*/ /*658,662*/,
          this.size /*672,676*/ /*672,676*/,
        ) /*658,676*/,
        this.size /*690,694*/ /*690,694*/,
      ) /*658,694*/;
    '' +
      _pipe1.transform(
        /*710,716*/ this.name /*703,707*/ /*703,707*/,
        1 /*717,718*/,
        2 /*719,720*/,
        3 /*721,722*/,
        4 /*723,724*/,
        5 /*725,726*/,
      ) /*703,726*/ +
      (this.name /*733,737*/ /*733,737*/
        ? 1 /*740,741*/
        : _pipe1.transform(/*748,754*/ 2 /*744,745*/) /*744,754*/) /*733,754*/;
  }
}

```

# /out/pipes.ts
```ts
import { Component, NgModule, OnDestroy, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => [a0, 1, 2, 3, 4, 5];

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
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', false> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'myPipe', type: MyPipe, pure: false, standalone: false });
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

export class MyPurePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPurePipe, never> = function MyPurePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyPurePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPurePipe, 'myPurePipe', false> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'myPurePipe',
      type: MyPurePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyPurePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'myPurePipe',
                pure: true,
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

export class PipeWithoutName implements PipeTransform {
  transform(value: unknown) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeWithoutName, never> = function PipeWithoutName_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeWithoutName)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeWithoutName, 'PipeWithoutName', true> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'PipeWithoutName', type: PipeWithoutName, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(PipeWithoutName, [{ type: Pipe, args: [null!] }], null, null);
  }
}

export class MyApp {
  name = 'World';
  size = 0;
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: MyApp,
      selectors: [['my-app']],
      standalone: false,
      decls: 7,
      vars: 20,
      template: function MyApp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵtext(0);
          i0.ɵɵpipe(1, 'myPipe');
          i0.ɵɵpipe(2, 'myPurePipe');
          i0.ɵɵelementStart(3, 'p');
          i0.ɵɵtext(4);
          i0.ɵɵpipe(5, 'myPipe');
          i0.ɵɵpipe(6, 'myPipe');
          i0.ɵɵelementEnd();
        }
        if (rf & 2) {
          i0.ɵɵtextInterpolate(
            i0.ɵɵpipeBind2(2, 6, i0.ɵɵpipeBind2(1, 3, ctx.name, ctx.size), ctx.size),
          );
          i0.ɵɵadvance(4);
          i0.ɵɵtextInterpolate2(
            '',
            i0.ɵɵpipeBindV(5, 9, i0.ɵɵpureFunction1(18, _c0, ctx.name)),
            ' ',
            ctx.name ? 1 : i0.ɵɵpipeBind1(6, 16, 2),
          );
        }
      },
      dependencies: [MyPipe, MyPurePipe],
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
                  '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>',
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'pipes.ts', lineNumber: 38 });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyPipe, typeof MyPurePipe, typeof MyApp],
    never,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyPipe, MyPurePipe, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyPurePipe, MyApp] });
})();

```