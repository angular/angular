# /out/app.component.ts
```ts
import { Component, ContentChild, forwardRef } from '@angular/core';
import { GenericComponent } from './generic.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  child!: GenericComponent<string>;
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
    ['child'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    contentQueries: function AppComponent_ContentQueries(
      rf: number,
      ctx: any,
      dirIndex: number,
    ): any {
      if (rf & 1) {
        i0.ɵɵcontentQuery(dirIndex, GenericComponent, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.child = _t.first);
      }
    },
    decls: 1,
    vars: 1,
    consts: [[3, 'value']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-generic', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', 'string');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [GenericComponent]),
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
        <app-generic [value]="'string'"></app-generic>
      `,
                standalone: true,
                imports: [GenericComponent],
              },
            ],
          },
        ],
        null,
        { child: [{ type: ContentChild, args: [forwardRef(() => GenericComponent)] }] },
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

# /out/generic.component.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GenericComponent<T> {
  value: T | null = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GenericComponent<any>, never> =
    function GenericComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || GenericComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    GenericComponent<any>,
    'app-generic',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: GenericComponent,
    selectors: [['app-generic']],
    inputs: { value: 'value' },
    decls: 1,
    vars: 1,
    template: function GenericComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(ctx.value);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GenericComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-generic',
                template: '{{ value }}',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { value: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(GenericComponent, {
      className: 'GenericComponent',
      filePath: 'generic.component.ts',
      lineNumber: 8,
    });
})();

```