# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { LocalComponent } from './local.component';
import { ExternalComponent } from '@third-party/components';
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
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-local')(1, 'app-external');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [LocalComponent, ExternalComponent]),
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
                template: '<app-local></app-local><app-external></app-external>',
                standalone: true,
                imports: [LocalComponent, ExternalComponent],
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

# /out/local.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalComponent, never> = function LocalComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalComponent,
    'app-local',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalComponent,
    selectors: [['app-local']],
    decls: 2,
    vars: 0,
    template: function LocalComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Local');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-local',
                template: '<span>Local</span>',
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
    i0.ɵsetClassDebugInfo(LocalComponent, {
      className: 'LocalComponent',
      filePath: 'local.component.ts',
      lineNumber: 8,
    });
})();

```