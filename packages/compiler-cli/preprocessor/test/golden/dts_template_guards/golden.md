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
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [MyIf, MyDirWithInvalidGuards]),
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