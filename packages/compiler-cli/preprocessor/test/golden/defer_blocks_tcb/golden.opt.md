# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './eager';
import * as i2 from './deferred';

var _pipe1 = null! as i1.EagerPipe;
var _pipe2 = null! as i2.DeferredPipe;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    '' + _pipe1.transform(/*308,317*/ 1 /*304,305*/) /*304,317*/;
    '' + _pipe2.transform(/*370,382*/ 2 /*366,367*/) /*366,382*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { EagerDirective, EagerPipe } from './eager';

// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_4_DepsFn = (): any => [
  /* @ts-ignore */
  import('./deferred').then((m: any): any => m.DeferredDirective),
  /* @ts-ignore */
  import('./deferred').then((m: any): any => m.DeferredPipe),
];
function AppComponent_Defer_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 1);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, 'deferredPipe');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 2));
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
    decls: 6,
    vars: 3,
    consts: [
      ['eagerDir', ''],
      ['deferredDir', ''],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'eagerPipe');
        i0.ɵɵelementEnd();
        i0.ɵɵdomTemplate(3, AppComponent_Defer_3_Template, 3, 3);
        i0.ɵɵdefer(4, 3, AppComponent_Defer_4_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 1));
      }
    },
    dependencies: [EagerDirective, EagerPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComponent,
        (): any => [
          /* @ts-ignore */
          import('./deferred').then((m: any): any => m.DeferredDirective),
          /* @ts-ignore */
          import('./deferred').then((m: any): any => m.DeferredPipe),
        ],
        (DeferredDirective: any, DeferredPipe: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-root',
                    imports: [EagerDirective, DeferredDirective, EagerPipe, DeferredPipe],
                    template: `
        <div eagerDir>{{ 1 | eagerPipe }}</div>
        @defer {
          <div deferredDir>{{ 2 | deferredPipe }}</div>
        }
      `,
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
      lineNumber: 15,
    });
})();

```

# /out/deferred.ts
```ts
import { Directive, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeferredDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeferredDirective, never> =
    function DeferredDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DeferredDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DeferredDirective,
    '[deferredDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DeferredDirective,
    selectors: [['', 'deferredDir', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeferredDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[deferredDir]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class DeferredPipe implements PipeTransform {
  transform(v: any) {
    return v;
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

# /out/eager.ts
```ts
import { Directive, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class EagerDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerDirective, never> = function EagerDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    EagerDirective,
    '[eagerDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: EagerDirective,
    selectors: [['', 'eagerDir', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[eagerDir]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class EagerPipe implements PipeTransform {
  transform(v: any) {
    return v;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerPipe, never> = function EagerPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<EagerPipe, 'eagerPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'eagerPipe',
    type: EagerPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'eagerPipe',
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