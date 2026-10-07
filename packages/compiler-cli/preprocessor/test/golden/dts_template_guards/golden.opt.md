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
    var _t1 /*T:DIR:0*/ /*215,283*/ = _ctor1({
      'myIf': this.authService /*227,238*/ /*227,238*/.user /*239,243*/ /*227,243*/ /*221,244*/,
    }); /*D:ignore*/
    _t1.myIf /*221,225*/ =
      this.authService /*227,238*/ /*227,238*/.user /*239,243*/ /*227,243*/ /*221,244*/;
    var _t2 = null! as any; /*T:VAE*/
    if (
      i1.MyIf.ngTemplateContextGuard(_t1, _t2) /*D:ignore*/ /*215,314*/ &&
      this.authService /*227,238*/ /*227,238*/.user /*239,243*/ /*D:ignore*/ /*227,243*/ &&
      i1.MyIf.ngTemplateGuard_myIfInvocation(
        _t1,
        this.authService /*265,276*/ /*265,276*/.user /*277,281*/ /*D:ignore*/ /*265,281*/,
      ) /*265,281*/
    ) {
      var _t3 /*247,251*/ = _t2.myIf /*221,225*/; /*221,253*/
      '' + _t3 /*286,290*/.name /*291,295*/ /*286,295*/;
    }
    var _t4 /*T:DIR:0*/ /*319,366*/ = _ctor2({
      'invalidGuards':
        this.authService /*340,351*/ /*340,351*/.user /*352,356*/ /*340,356*/ /*325,357*/,
    }); /*D:ignore*/
    _t4.invalidGuards /*325,338*/ =
      this.authService /*340,351*/ /*340,351*/.user /*352,356*/ /*340,356*/ /*325,357*/;
    var _t5 = null! as any; /*T:VAE*/
    {
      var _t6 /*360,364*/ = _t5.invalidGuards /*325,338*/; /*325,364*/
      '' + _t6 /*369,373*/.name /*374,378*/ /*369,378*/;
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
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
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
                standalone: true,
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
      lineNumber: 17,
    });
})();

```