# /out/app.component.ts
```ts
import { Component } from '@angular/core';
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['libBar', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'lib-foo', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent),
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
                template: '<lib-foo libBar></lib-foo>',
                standalone: false,
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
      lineNumber: 8,
    });
})();

```

# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FooComponent } from './foo.component';
import { EXTRA_DECLARATIONS } from './extra';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: AppModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [AppComponent, FooComponent, ...EXTRA_DECLARATIONS],
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
    i0.ɵɵsetNgModuleScope(AppModule, {
      declarations: [AppComponent, FooComponent, ...EXTRA_DECLARATIONS],
    });
})();

```

# /out/bar.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BarDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BarDirective, never> = function BarDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BarDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BarDirective,
    '[libBar]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BarDirective,
    selectors: [['', 'libBar', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BarDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[libBar]',
                standalone: false,
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

# /out/foo.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FooComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FooComponent, never> = function FooComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FooComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FooComponent,
    'lib-foo',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: FooComponent,
    selectors: [['lib-foo']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function FooComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Foo');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(FooComponent),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'lib-foo',
                template: '<span>Foo</span>',
                standalone: false,
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
    i0.ɵsetClassDebugInfo(FooComponent, {
      className: 'FooComponent',
      filePath: 'foo.component.ts',
      lineNumber: 8,
    });
})();

```