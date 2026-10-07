# /out/app.module.ngtypecheck.ts
```ts
/**
 * TCB for /app.module.ts
 * @generated
 */

import * as i0 from './app.module';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.compInput /*269,278*/ /*269,278*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.AppRoot) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*793,824*/ = null! as i0.MyComponent; /*T:VAE*/
    _t1.compInput /*803,812*/ = 'hello' /*815,822*/ /*802,823*/;
    var _t2 /*T:DIR:0*/ /*843,875*/ = null! as i0.MyDirective; /*T:VAE*/
    _t2.dirInput /*855,863*/ = 'world' /*866,873*/ /*854,874*/;
  }
}

```

# /out/app.module.ts
```ts
import { Component, Directive, NgModule, Input, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  dirInput!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    '[myDir]',
    never,
    { 'dirInput': { 'alias': 'dirInput'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['', 'myDir', '']],
    inputs: { dirInput: 'dirInput' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myDir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { dirInput: [{ type: Input }] },
      );
  }
}

export class MyComponent {
  compInput!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-comp',
    never,
    { 'compInput': { 'alias': 'compInput'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-comp']],
    inputs: { compInput: 'compInput' },
    standalone: false,
    decls: 2,
    vars: 1,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.compInput);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp',
                template: '<div>{{compInput}}</div>',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { compInput: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'app.module.ts',
      lineNumber: 16,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyDirective, typeof MyComponent],
    never,
    [typeof MyDirective, typeof MyComponent]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MyModule,
    bootstrap: [MyComponent],
    id: 'MyModuleId',
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyDirective, forwardRef(() => MyComponent)],
                exports: [MyDirective, forwardRef(() => MyComponent)],
                id: 'MyModuleId',
                bootstrap: [forwardRef(() => MyComponent)],
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
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [MyDirective, MyComponent],
      exports: [MyDirective, MyComponent],
    });
})();
i0.ɵɵregisterNgModuleType(MyModule, 'MyModuleId');

export class ConfigService {}

export class ModuleWithDeps {
  constructor(config: ConfigService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleWithDeps, never> = function ModuleWithDeps_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ModuleWithDeps)(i0.ɵɵinject(ConfigService));
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModuleWithDeps, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModuleWithDeps });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModuleWithDeps> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleWithDeps,
        [{ type: NgModule, args: [{}] }],
        (): any => [{ type: ConfigService }],
        null,
      );
  }
}

export class AppRoot {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppRoot, never> = function AppRoot_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppRoot)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppRoot,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppRoot,
    selectors: [['app-root']],
    decls: 2,
    vars: 2,
    consts: [
      [3, 'compInput'],
      ['myDir', '', 3, 'dirInput'],
    ],
    template: function AppRoot_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'my-comp', 0)(1, 'div', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('compInput', 'hello');
        i0.ɵɵadvance();
        i0.ɵɵproperty('dirInput', 'world');
      }
    },
    dependencies: [MyModule, MyDirective, MyComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppRoot,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: `
            <my-comp [compInput]="'hello'"></my-comp>
            <div myDir [dirInput]="'world'"></div>
        `,
                standalone: true,
                imports: [MyModule],
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
    i0.ɵsetClassDebugInfo(AppRoot, {
      className: 'AppRoot',
      filePath: 'app.module.ts',
      lineNumber: 44,
    });
})();

```