# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { ImportedComponent } from './imported';
import { ExcludedButImportedComponent } from './excluded_but_imported';
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
        i0.ɵɵelement(0, 'imported-comp')(1, 'excluded-but-imported-comp');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [
      ImportedComponent,
      ExcludedButImportedComponent,
    ]),
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
                template:
                  '<imported-comp></imported-comp><excluded-but-imported-comp></excluded-but-imported-comp>',
                standalone: true,
                imports: [ImportedComponent, ExcludedButImportedComponent],
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

# /out/excluded_but_imported.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ExcludedButImportedComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExcludedButImportedComponent, never> =
    function ExcludedButImportedComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExcludedButImportedComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExcludedButImportedComponent,
    'excluded-but-imported-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ExcludedButImportedComponent,
    selectors: [['excluded-but-imported-comp']],
    decls: 1,
    vars: 0,
    template: function ExcludedButImportedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'excluded but imported');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExcludedButImportedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'excluded-but-imported-comp',
                template: 'excluded but imported',
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
    i0.ɵsetClassDebugInfo(ExcludedButImportedComponent, {
      className: 'ExcludedButImportedComponent',
      filePath: 'excluded_but_imported.ts',
      lineNumber: 8,
    });
})();

```

# /out/imported.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ImportedComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedComponent, never> =
    function ImportedComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImportedComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportedComponent,
    'imported-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportedComponent,
    selectors: [['imported-comp']],
    decls: 1,
    vars: 0,
    template: function ImportedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'imported');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'imported-comp',
                template: 'imported',
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
    i0.ɵsetClassDebugInfo(ImportedComponent, {
      className: 'ImportedComponent',
      filePath: 'imported.ts',
      lineNumber: 8,
    });
})();

```