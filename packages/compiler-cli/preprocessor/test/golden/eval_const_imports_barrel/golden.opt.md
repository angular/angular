# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { SHARED_IMPORTS } from './barrel';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './foo.component';

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
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'lib-foo');
      }
    },
    dependencies: [i1.FooComponent],
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
                template: '<lib-foo></lib-foo>',
                standalone: true,
                imports: [...SHARED_IMPORTS],
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
      lineNumber: 10,
    });
})();

```

# /out/foo.component.ngtypecheck.ts
```ts
/**
 * TCB for /foo.component.ts
 * @generated
 */

import * as i0 from './foo.component';

/*tcb1*/
function _tcb1(this: i0.FooComponent) {
  if (true) {
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: FooComponent,
    selectors: [['lib-foo']],
    decls: 2,
    vars: 0,
    template: function FooComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'Foo');
        i0.ɵɵdomElementEnd();
      }
    },
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
    i0.ɵsetClassDebugInfo(FooComponent, {
      className: 'FooComponent',
      filePath: 'foo.component.ts',
      lineNumber: 8,
    });
})();

```