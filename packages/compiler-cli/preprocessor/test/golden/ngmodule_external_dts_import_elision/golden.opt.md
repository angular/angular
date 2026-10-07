# /out/minimap.ngtypecheck.ts
```ts
/**
 * TCB for /minimap.ts
 * @generated
 */

import * as i0 from './minimap';

/*tcb1*/
function _tcb1(this: i0.DummyComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/minimap.ts
```ts
import { Component, NgModule } from '@angular/core';
import { CdkScrollable, DragDropModule } from '@angular/cdk/drag-drop';
// @ts-ignore
import * as i0 from '@angular/core';

export class DummyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DummyComponent, never> = function DummyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DummyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DummyComponent,
    'dummy-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DummyComponent,
    selectors: [['dummy-cmp']],
    decls: 2,
    vars: 0,
    template: function DummyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Dummy');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DummyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'dummy-cmp',
                standalone: true,
                imports: [CdkScrollable],
                template: '<div>Dummy</div>',
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
    i0.ɵsetClassDebugInfo(DummyComponent, {
      className: 'DummyComponent',
      filePath: 'minimap.ts',
      lineNumber: 10,
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
    decls: 2,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
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
                standalone: false,
                template: '<div>Hello</div>',
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
      filePath: 'minimap.ts',
      lineNumber: 17,
    });
})();

export class TestModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestModule, never> = function TestModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TestModule,
    [typeof AppComponent],
    [typeof DragDropModule],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TestModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [DragDropModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [DragDropModule],
                declarations: [AppComponent],
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
    i0.ɵɵsetNgModuleScope(TestModule, { declarations: [AppComponent], imports: [DragDropModule] });
})();

```

# /out/node_modules/@angular/cdk/drag-drop/drag-drop-module.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './scrollable';

export declare class DragDropModule {
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    DragDropModule,
    [typeof i1.CdkScrollable],
    never,
    [typeof i1.CdkScrollable]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<DragDropModule>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DragDropModule, never> = function DragDropModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DragDropModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    DragDropModule,
    [typeof i1.CdkScrollable],
    never,
    [typeof i1.CdkScrollable]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DragDropModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DragDropModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DragDropModule, [{ type: NgModule }], null, null);
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(DragDropModule, {
      declarations: [i1.CdkScrollable],
      exports: [i1.CdkScrollable],
    });
})();

```

# /out/node_modules/@angular/cdk/drag-drop/scrollable.d.ts
```ts
import * as i0 from '@angular/core';

export declare class CdkScrollable {
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CdkScrollable,
    '[cdkScrollable]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  >;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CdkScrollable, never> = function CdkScrollable_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CdkScrollable)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CdkScrollable,
    '[cdkScrollable]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: CdkScrollable,
    selectors: [['', 'cdkScrollable', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(CdkScrollable, [{ type: Directive }], null, null);
  }
}

```