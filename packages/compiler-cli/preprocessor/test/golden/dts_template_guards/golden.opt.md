# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './my-dir';

const _ctor1: <T = unknown>(init: Pick<i1.MyIf<T>, 'myIf'>) => i1.MyIf<T> = null!;
const _ctor2: <T = unknown>(
  init: Pick<i1.MyDirWithInvalidGuards<T>, 'invalidGuards'>,
) => i1.MyDirWithInvalidGuards<T> = null!;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*195,263*/ = _ctor1({
      'myIf': this.authService /*207,218*/ /*207,218*/.user /*219,223*/ /*207,223*/ /*201,224*/,
    }); /*D:ignore*/
    _t1.myIf /*201,205*/ =
      this.authService /*207,218*/ /*207,218*/.user /*219,223*/ /*207,223*/; /*201,224*/
    var _t2 = null! as any; /*T:VAE*/
    if (
      i1.MyIf.ngTemplateContextGuard(_t1, _t2) /*D:ignore*/ /*195,294*/ &&
      this.authService /*207,218*/ /*207,218*/.user /*219,223*/ /*D:ignore*/ /*207,223*/ &&
      i1.MyIf.ngTemplateGuard_myIfInvocation(
        _t1,
        this.authService /*245,256*/ /*245,256*/.user /*257,261*/ /*D:ignore*/ /*245,261*/,
      ) /*245,261*/
    ) {
      var _t3 /*227,231*/ = _t2.myIf /*201,205*/; /*201,233*/
      '' + _t3 /*272,276*/.name /*277,281*/ /*272,281*/;
    }
    var _t4 /*T:DIR:0*/ /*299,346*/ = _ctor2({
      'invalidGuards':
        this.authService /*320,331*/ /*320,331*/.user /*332,336*/ /*320,336*/ /*305,337*/,
    }); /*D:ignore*/
    _t4.invalidGuards /*305,318*/ =
      this.authService /*320,331*/ /*320,331*/.user /*332,336*/ /*320,336*/; /*305,337*/
    var _t5 = null! as any; /*T:VAE*/
    {
      var _t6 /*340,344*/ = _t5.invalidGuards /*305,318*/; /*305,344*/
      '' + _t6 /*355,359*/.name /*360,364*/ /*355,364*/;
    }
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { MyIf, MyDirWithInvalidGuards } from './my-dir';
// @ts-ignore
import * as i0 from '@angular/core';

function AppComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const user_r1: any = ctx.myIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', user_r1.name, ' ');
  }
}
function AppComponent_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const user_r2: any = ctx.invalidGuards;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', user_r2.name, ' ');
  }
}

export class AppComponent {
  authService = {
    user: { name: 'John' } as { name: string } | null,
  };
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
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComponent,
      selectors: [['app-root']],
      decls: 2,
      vars: 3,
      consts: [
        [4, 'myIf', 'myIfInvocation'],
        [4, 'invalidGuards'],
      ],
      template: function AppComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵtemplate(0, AppComponent_div_0_Template, 2, 1, 'div', 0)(
            1,
            AppComponent_div_1_Template,
            2,
            1,
            'div',
            1,
          );
        }
        if (rf & 2) {
          i0.ɵɵproperty('myIf', ctx.authService.user)('myIfInvocation', ctx.authService.user);
          i0.ɵɵadvance();
          i0.ɵɵproperty('invalidGuards', ctx.authService.user);
        }
      },
      dependencies: [MyIf, MyDirWithInvalidGuards],
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
                imports: [MyIf, MyDirWithInvalidGuards],
                template: `
        <div *myIf="authService.user as user; invocation: authService.user">
          {{user.name}}
        </div>
        <div *invalidGuards="authService.user as user">
          {{user.name}}
        </div>
      `,
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
      filePath: 'app.ts',
      lineNumber: 16,
    });
})();

```