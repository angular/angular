# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  obj: any = { foo: { bar: 'hello' } };
  arr: any[] = [];
  index = 0;
  svc: any;
  fallback = 'none';
  matrix: any[][] = [];
  row = 0;
  col = 0;
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
    decls: 10,
    vars: 5,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'div');
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, 'div');
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, 'div');
        i0.ɵɵtext(7);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(8, 'div');
        i0.ɵɵtext(9);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_2_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.obj == null ? null : ctx.obj.foo == null ? null : ctx.obj.foo.bar);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(
          ctx.arr == null ? null : ctx.arr[ctx.index] == null ? null : ctx.arr[ctx.index].name,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(
          ctx.svc == null ? null : (tmp_2_0 = ctx.svc.lookup()) == null ? null : tmp_2_0.value,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(
          (ctx.obj == null ? null : ctx.obj.foo == null ? null : ctx.obj.foo.bar) ?? ctx.fallback,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(
          ctx.matrix == null
            ? null
            : ctx.matrix[ctx.row] == null
              ? null
              : ctx.matrix[ctx.row][ctx.col],
        );
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
        <div>{{ obj?.foo?.bar }}</div>
        <div>{{ arr?.[index]?.name }}</div>
        <div>{{ svc?.lookup()?.value }}</div>
        <div>{{ obj?.foo?.bar ?? fallback }}</div>
        <div>{{ matrix?.[row]?.[col] }}</div>
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
      lineNumber: 14,
    });
})();

```