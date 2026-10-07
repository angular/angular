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
        /*690,700*/ _pipe1.transform(
          /*676,682*/ this.name /*669,673*/ /*669,673*/,
          this.size /*683,687*/ /*683,687*/,
        ) /*669,687*/,
        this.size /*701,705*/ /*701,705*/,
      ) /*669,705*/;
    '' +
      _pipe1.transform(
        /*721,727*/ this.name /*714,718*/ /*714,718*/,
        1 /*728,729*/,
        2 /*730,731*/,
        3 /*732,733*/,
        4 /*734,735*/,
        5 /*736,737*/,
      ) /*714,737*/ +
      (this.name /*744,748*/ /*744,748*/
        ? 1 /*751,752*/
        : _pipe1.transform(/*759,765*/ 2 /*755,756*/) /*755,765*/) /*744,765*/;
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
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'PipeWithoutName', type: PipeWithoutName, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(PipeWithoutName, [{ type: Pipe }], null, null);
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
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'pipes.ts', lineNumber: 37 });
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
    [typeof MyPipe, typeof MyPurePipe, typeof MyApp, typeof PipeWithoutName],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [{ declarations: [MyPipe, MyPurePipe, MyApp, PipeWithoutName] }],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyPurePipe, MyApp, PipeWithoutName] });
})();

```