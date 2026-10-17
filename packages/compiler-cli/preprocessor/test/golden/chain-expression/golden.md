# /out/app.component.ts
```ts
import { Component, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  sig = signal(
    false,
    ...((ngDevMode ? [{ debugName: 'sig' }] : /* istanbul ignore next */ []) as []),
  );
  a() {}
  b() {}
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
    decls: 4,
    vars: 0,
    consts: [[3, 'click']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button', 0);
        i0.ɵɵlistener('click', function AppComponent_Template_button_click_0_listener(): any {
          ctx.a();
          return ctx.b();
        });
        i0.ɵɵtext(1, 'Chain');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'button', 0);
        i0.ɵɵlistener('click', function AppComponent_Template_button_click_2_listener(): any {
          ctx.sig.set(true);
          return ctx.a();
        });
        i0.ɵɵtext(3, 'Signal Chain');
        i0.ɵɵelementEnd();
      }
    },
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
                template: `
        <button (click)="a(); b()">Chain</button>
        <button (click)="sig.set(true); a()">Signal Chain</button>
      `,
                standalone: true,
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
      lineNumber: 11,
    });
})();

```