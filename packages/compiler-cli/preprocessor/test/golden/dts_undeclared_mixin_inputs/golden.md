# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { MatButton } from 'material-lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
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
    consts: [['mat-button', '', 3, 'disabled', 'color', 'disableRipple']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button', 0);
        i0.ɵɵtext(1, 'Click');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('disabled', true)('color', 'primary')('disableRipple', false);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [MatButton]),
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
        <button mat-button [disabled]="true" [color]="'primary'" [disableRipple]="false">Click</button>
      `,
                standalone: true,
                imports: [MatButton],
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
      lineNumber: 12,
    });
})();

```