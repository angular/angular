# /out/pipe_di_change_detector_ref.ngtypecheck.ts
```ts
/**
 * TCB for /pipe_di_change_detector_ref.ts
 * @generated
 */

import * as i0 from './pipe_di_change_detector_ref';

var _pipe1 = null! as i0.MyPipe;
var _pipe2 = null! as i0.MyOtherPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + _pipe1.transform(/*627,633*/ this.name /*620,624*/ /*620,624*/) /*620,633*/;
    '' + _pipe2.transform(/*649,660*/ this.name /*642,646*/ /*642,646*/) /*642,660*/;
  }
}

```

# /out/pipe_di_change_detector_ref.ts
```ts
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  Optional,
  Pipe,
  PipeTransform,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyPipe implements PipeTransform {
  constructor(changeDetectorRef: ChangeDetectorRef) {}

  transform(value: any, ...args: any[]) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyPipe)(i0.ɵɵdirectiveInject(i0.ChangeDetectorRef, 16));
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'myPipe',
    type: MyPipe,
    pure: true,
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
                standalone: false,
              },
            ],
          },
        ],
        (): any => [{ type: ChangeDetectorRef }],
        null,
      );
  }
}

export class MyOtherPipe implements PipeTransform {
  constructor(changeDetectorRef: ChangeDetectorRef) {}

  transform(value: any, ...args: any[]) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, [{ optional: true }]> =
    function MyOtherPipe_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || MyOtherPipe)(i0.ɵɵdirectiveInject(i0.ChangeDetectorRef, 24));
    };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, 'myOtherPipe', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'myOtherPipe',
      type: MyOtherPipe,
      pure: true,
      standalone: false,
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
        ],
        (): any => [{ type: ChangeDetectorRef, decorators: [{ type: Optional }] }],
        null,
      );
  }
}

export class MyApp {
  name = 'World';
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
    decls: 5,
    vars: 6,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'myPipe');
        i0.ɵɵelementStart(2, 'p');
        i0.ɵɵtext(3);
        i0.ɵɵpipe(4, 'myOtherPipe');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(1, 2, ctx.name));
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, ctx.name));
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
                template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>',
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
      filePath: 'pipe_di_change_detector_ref.ts',
      lineNumber: 31,
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
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyPipe, MyOtherPipe, MyApp] }] }],
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