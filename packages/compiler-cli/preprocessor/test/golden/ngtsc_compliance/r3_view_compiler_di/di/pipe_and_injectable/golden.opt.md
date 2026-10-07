# /out/pipe_and_injectable.ngtypecheck.ts
```ts
/**
 * TCB for /pipe_and_injectable.ts
 * @generated
 */

import * as i0 from './pipe_and_injectable';

var _pipe1 = null! as i0.MyPipe;
var _pipe2 = null! as i0.MyOtherPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      _pipe2.transform(
        /*623,634*/ _pipe1.transform(/*614,620*/ 0 /*610,611*/) /*610,620*/,
      ) /*610,634*/;
  }
}

```

# /out/pipe_and_injectable.ts
```ts
import { Component, Injectable, NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Service {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Service, never> = function Service_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Service)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Service,
    factory: Service.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Service, [{ type: Injectable }], null, null);
  }
}

export class MyPipe implements PipeTransform {
  constructor(service: Service) {}
  transform(value: any, ...args: any[]) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyPipe)(i0.ɵɵdirectiveInject(Service, 16));
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'myPipe',
    type: MyPipe,
    pure: true,
    standalone: false,
  });
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyPipe,
    factory: MyPipe.ɵfac,
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
                standalone: false,
              },
            ],
          },
          { type: Injectable },
        ],
        (): any => [{ type: Service }],
        null,
      );
  }
}

export class MyOtherPipe implements PipeTransform {
  constructor(service: Service) {}
  transform(value: any, ...args: any[]) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, never> = function MyOtherPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyOtherPipe)(i0.ɵɵdirectiveInject(Service, 16));
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, 'myOtherPipe', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'myOtherPipe',
      type: MyOtherPipe,
      pure: true,
      standalone: false,
    });
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyOtherPipe,
    factory: MyOtherPipe.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyOtherPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'myOtherPipe',
                standalone: false,
              },
            ],
          },
          { type: Injectable },
        ],
        (): any => [{ type: Service }],
        null,
      );
  }
}

export class MyApp {
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
    decls: 3,
    vars: 5,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'myPipe');
        i0.ɵɵpipe(2, 'myOtherPipe');
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, i0.ɵɵpipeBind1(1, 1, 0)));
      }
    },
    dependencies: [MyPipe, MyOtherPipe],
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
                template: '{{0 | myPipe | myOtherPipe}}',
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
      filePath: 'pipe_and_injectable.ts',
      lineNumber: 35,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyPipe, typeof MyOtherPipe, typeof MyApp],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [Service],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [{ declarations: [MyPipe, MyOtherPipe, MyApp], providers: [Service] }],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyOtherPipe, MyApp] });
})();

```