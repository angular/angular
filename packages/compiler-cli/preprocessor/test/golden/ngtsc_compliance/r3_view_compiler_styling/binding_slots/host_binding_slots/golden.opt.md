# /out/host_binding_slots.ngtypecheck.ts
```ts
/**
 * TCB for /host_binding_slots.ts
 * @generated
 */

import * as i0 from './host_binding_slots';

/*tcb1*/
function _tcb1(this: i0.MyDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.title /*134,139*/ /*134,139*/;
    this.foo /*166,169*/ /*166,169*/;
    ({
      'value' /*200,205*/: this._animValue /*207,217*/ /*207,217*/,
      'params' /*225,231*/: {
        'param1' /*243,249*/: this._animParam1 /*251,262*/ /*251,262*/,
        'param2' /*272,278*/: this._animParam2 /*280,291*/ /*280,291*/,
      } /*233,299*/,
    }) /*192,305*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyAppComp) {
  if (true) {
  }
}

```

# /out/host_binding_slots.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any, a1: any): any => ({ param1: a0, param2: a1 });
const _c1 = (a0: any, a1: any): any => ({ value: a0, params: a1 });

export class MyDir {
  title = '';
  foo = true;
  _animValue = null;
  _animParam1 = null;
  _animParam2 = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never> = function MyDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDir,
    '[my-dir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    selectors: [['', 'my-dir', '']],
    hostVars: 10,
    hostBindings: function MyDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('title', ctx.title);
        i0.ɵɵsyntheticHostProperty(
          '@anim',
          i0.ɵɵpureFunction2(
            7,
            _c1,
            ctx._animValue,
            i0.ɵɵpureFunction2(4, _c0, ctx._animParam1, ctx._animParam2),
          ),
        );
        i0.ɵɵclassProp('foo', ctx.foo);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[my-dir]',
                host: {
                  '[title]': 'title',
                  '[class.foo]': 'foo',
                  '[@anim]': `{
          value: _animValue,
          params: {
            param1: _animParam1,
            param2: _animParam2
          }
        }`,
                },
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

export class MyAppComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyAppComp, never> = function MyAppComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyAppComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyAppComp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyAppComp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['my-dir', '']],
    template: function MyAppComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: [MyDir],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyAppComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: `
        <div my-dir></div>
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
    i0.ɵsetClassDebugInfo(MyAppComp, {
      className: 'MyAppComp',
      filePath: 'host_binding_slots.ts',
      lineNumber: 33,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyAppComp, typeof MyDir], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyAppComp, MyDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyAppComp, MyDir] });
})();

```