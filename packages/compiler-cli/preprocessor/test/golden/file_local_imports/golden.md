# /out/app.ts
```ts
import { Component, Directive, Pipe, PipeTransform, NgModule } from '@angular/core';
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
    '[localDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LocalDir,
    selectors: [['', 'localDir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[localDir]',
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

export class LocalPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalPipe, never> = function LocalPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<LocalPipe, 'localPipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'localPipe', type: LocalPipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'localPipe',
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

export class LocalComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalComp, never> = function LocalComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalComp,
    'local-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalComp,
    selectors: [['local-comp']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function LocalComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'local');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(LocalComp),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-comp',
                template: '<div>local</div>',
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
    i0.ɵsetClassDebugInfo(LocalComp, {
      className: 'LocalComp',
      filePath: 'app.ts',
      lineNumber: 22,
    });
})();

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
    decls: 3,
    vars: 3,
    consts: [['localDir', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'local-comp', 0);
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'localPipe');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'test'));
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
                template: '<local-comp localDir>{{ "test" | localPipe }}</local-comp>',
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
      filePath: 'app.ts',
      lineNumber: 29,
    });
})();

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
                declarations: [LocalDir, LocalPipe, LocalComp, AppComponent],
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
      declarations: [LocalDir, LocalPipe, LocalComp, AppComponent],
    });
})();

```