# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './deferred.pipe';

var _pipe1 = null! as i1.DeferredPipe;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    '' + _pipe1.transform(/*306,318*/ 'hello' /*296,303*/) /*296,318*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { EagerComponent } from './eager.cmp';
// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_3_DepsFn = (): any => [
  /* @ts-ignore */
  import('./deferred.cmp').then((m: any): any => m.DeferredComponent),
  /* @ts-ignore */
  import('./deferred.pipe').then((m: any): any => m.DeferredPipe),
];
function AppComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'app-deferred');
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, 'deferredPipe');
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵpipeBind1(2, 1, 'hello'), ' ');
  }
}
function AppComponent_DeferPlaceholder_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder ');
  }
}

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
    decls: 5,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-eager');
        i0.ɵɵdomTemplate(1, AppComponent_Defer_1_Template, 3, 3)(
          2,
          AppComponent_DeferPlaceholder_2_Template,
          1,
          0,
        );
        i0.ɵɵdefer(3, 1, AppComponent_Defer_3_DepsFn, null, 2);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: [EagerComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComponent,
        (): any => [
          /* @ts-ignore */
          import('./deferred.cmp').then((m: any): any => m.DeferredComponent),
          /* @ts-ignore */
          import('./deferred.pipe').then((m: any): any => m.DeferredPipe),
        ],
        (DeferredComponent: any, DeferredPipe: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-root',
                    template: `
        <app-eager/>
        @defer {
          <app-deferred/>
          {{ 'hello' | deferredPipe }}
        } @placeholder {
          Placeholder
        }
      `,
                    standalone: true,
                    imports: [EagerComponent],
                    deferredImports: [DeferredComponent, DeferredPipe],
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 21,
    });
})();

```

# /out/deferred.cmp.ngtypecheck.ts
```ts
/**
 * TCB for /deferred.cmp.ts
 * @generated
 */

import * as i0 from './deferred.cmp';

/*tcb1*/
function _tcb1(this: i0.DeferredComponent) {
  if (true) {
  }
}

```

# /out/deferred.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeferredComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeferredComponent, never> =
    function DeferredComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DeferredComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DeferredComponent,
    'app-deferred',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DeferredComponent,
    selectors: [['app-deferred']],
    decls: 1,
    vars: 0,
    template: function DeferredComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Deferred content');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeferredComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-deferred',
                template: 'Deferred content',
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
    i0.ɵsetClassDebugInfo(DeferredComponent, {
      className: 'DeferredComponent',
      filePath: 'deferred.cmp.ts',
      lineNumber: 8,
    });
})();

```

# /out/deferred.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeferredPipe implements PipeTransform {
  transform(value: string): string {
    return value + ' transformed';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeferredPipe, never> = function DeferredPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DeferredPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<DeferredPipe, 'deferredPipe', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'deferredPipe', type: DeferredPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeferredPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'deferredPipe',
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

```

# /out/eager.cmp.ngtypecheck.ts
```ts
/**
 * TCB for /eager.cmp.ts
 * @generated
 */

import * as i0 from './eager.cmp';

/*tcb1*/
function _tcb1(this: i0.EagerComponent) {
  if (true) {
  }
}

```

# /out/eager.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class EagerComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerComponent, never> = function EagerComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EagerComponent,
    'app-eager',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EagerComponent,
    selectors: [['app-eager']],
    decls: 1,
    vars: 0,
    template: function EagerComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Eager content');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-eager',
                template: 'Eager content',
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
    i0.ɵsetClassDebugInfo(EagerComponent, {
      className: 'EagerComponent',
      filePath: 'eager.cmp.ts',
      lineNumber: 8,
    });
})();

```