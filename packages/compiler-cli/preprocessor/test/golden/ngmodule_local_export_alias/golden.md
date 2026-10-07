# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { MatLegacyRippleModule } from '@angular/material/legacy-core';
import { AliasedLocalModule } from './local_alias';
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
    decls: 1,
    vars: 0,
    consts: [['mat-ripple', '', 'local-dir', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [
      MatLegacyRippleModule,
      AliasedLocalModule,
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
                standalone: true,
                template: '<div mat-ripple local-dir></div>',
                imports: [MatLegacyRippleModule, AliasedLocalModule],
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

# /out/internal_module.ts
```ts
import { NgModule } from '@angular/core';
import { LocalDir } from './local_dir';
// @ts-ignore
import * as i0 from '@angular/core';

export class InternalLocalModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InternalLocalModule, never> =
    function InternalLocalModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || InternalLocalModule)();
    };
  // @ts-ignore
  static ɵmod: InternalLocalModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: InternalLocalModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<InternalLocalModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [LocalDir],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InternalLocalModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [LocalDir],
                exports: [LocalDir],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(InternalLocalModule, { declarations: [LocalDir], exports: [LocalDir] });
})();

```

# /out/local_dir.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDir, never> = function LocalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LocalDir,
    '[local-dir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: LocalDir, selectors: [['', 'local-dir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[local-dir]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```