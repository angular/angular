# /out/module.ngtypecheck.ts
```ts
/**
 * TCB for /module.ts
 * @generated
 */

import * as i0 from './module';

/*tcb1*/
function _tcb1(this: i0.ModuleChild) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.ModuleParent) {
  if (true) {
  }
}

```

# /out/module.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ModuleChild {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleChild, never> = function ModuleChild_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleChild)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ModuleChild,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ModuleChild,
    selectors: [['ng-component']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function ModuleChild_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'i');
        i0.ɵɵtext(1, 'module child');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleChild,
        [
          {
            type: Component,
            args: [
              {
                standalone: false,
                template: '<i>module child</i>',
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
    i0.ɵsetClassDebugInfo(ModuleChild, {
      className: 'ModuleChild',
      filePath: 'module.ts',
      lineNumber: 7,
    });
})();

export class ModuleParent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleParent, never> = function ModuleParent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleParent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ModuleParent,
    'module-parent',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ModuleParent,
    selectors: [['module-parent']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function ModuleParent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'ng-component');
      }
    },
    dependencies: [ModuleChild],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleParent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'module-parent',
                standalone: false,
                template: '<ng-component></ng-component>',
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
    i0.ɵsetClassDebugInfo(ModuleParent, {
      className: 'ModuleParent',
      filePath: 'module.ts',
      lineNumber: 14,
    });
})();

export class ChildModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildModule, never> = function ChildModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ChildModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    ChildModule,
    [typeof ModuleChild, typeof ModuleParent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ChildModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ChildModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [ModuleChild, ModuleParent],
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
    i0.ɵɵsetNgModuleScope(ChildModule, { declarations: [ModuleChild, ModuleParent] });
})();

```

# /out/standalone.ngtypecheck.ts
```ts
/**
 * TCB for /standalone.ts
 * @generated
 */

import * as i0 from './standalone';

/*tcb1*/
function _tcb1(this: i0.Child) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.EmptySelector) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.App) {
  if (true) {
  }
}

/*tcb4*/
function _tcb4(this: i0.AppEmpty) {
  if (true) {
  }
}

/*tcb5*/
function _tcb5(this: i0.AppByName) {
  if (true) {
  }
}

/* Diagnostics:
 - (790, 797) 'Child' is not a known element:
1. If 'Child' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.
*/

```

# /out/standalone.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// No `selector`: ngtsc gives a component the default selector `ng-component`.
export class Child {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Child, never> = function Child_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Child)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Child,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Child,
    selectors: [['ng-component']],
    decls: 2,
    vars: 0,
    template: function Child_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'child');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Child,
        [
          {
            type: Component,
            args: [
              {
                template: '<span>child</span>',
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
    i0.ɵsetClassDebugInfo(Child, { className: 'Child', filePath: 'standalone.ts', lineNumber: 7 });
})();

// An empty `selector` also falls back to `ng-component` for a component.
export class EmptySelector {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptySelector, never> = function EmptySelector_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EmptySelector)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EmptySelector,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EmptySelector,
    selectors: [['ng-component']],
    decls: 2,
    vars: 0,
    template: function EmptySelector_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'b');
        i0.ɵɵtext(1, 'empty');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EmptySelector,
        [
          {
            type: Component,
            args: [
              {
                selector: '',
                template: '<b>empty</b>',
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
    i0.ɵsetClassDebugInfo(EmptySelector, {
      className: 'EmptySelector',
      filePath: 'standalone.ts',
      lineNumber: 14,
    });
})();

export class App {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<App, never> = function App_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || App)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    App,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [['app-root']],
    decls: 1,
    vars: 0,
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'ng-component');
      }
    },
    dependencies: [Child],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        App,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                imports: [Child],
                template: '<ng-component></ng-component>',
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
    i0.ɵsetClassDebugInfo(App, { className: 'App', filePath: 'standalone.ts', lineNumber: 21 });
})();

export class AppEmpty {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppEmpty, never> = function AppEmpty_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppEmpty)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppEmpty,
    'app-empty',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppEmpty,
    selectors: [['app-empty']],
    decls: 1,
    vars: 0,
    template: function AppEmpty_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'ng-component');
      }
    },
    dependencies: [EmptySelector],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppEmpty,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-empty',
                imports: [EmptySelector],
                template: '<ng-component></ng-component>',
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
    i0.ɵsetClassDebugInfo(AppEmpty, {
      className: 'AppEmpty',
      filePath: 'standalone.ts',
      lineNumber: 28,
    });
})();

// The class name is not a selector: `<Child>` matches nothing and is an unknown element.
export class AppByName {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppByName, never> = function AppByName_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppByName)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppByName,
    'app-by-name',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppByName,
    selectors: [['app-by-name']],
    decls: 1,
    vars: 0,
    template: function AppByName_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'Child');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppByName,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-by-name',
                imports: [Child],
                template: '<Child></Child>',
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
    i0.ɵsetClassDebugInfo(AppByName, {
      className: 'AppByName',
      filePath: 'standalone.ts',
      lineNumber: 36,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/standalone.ts",
      "category": "error",
      "code": 8001,
      "messageText": "'Child' is not a known element:\n1. If 'Child' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.",
      "span": {
        "start": 790,
        "end": 797
      }
    }
  ]
}

```