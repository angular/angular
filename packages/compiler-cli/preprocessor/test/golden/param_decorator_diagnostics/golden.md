# /out/foreign-param.directive.ts
```ts
import { Directive } from '@angular/core';
import { Logged } from './logged';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dep {}

export class ForeignParamDirective {
  constructor(@Logged() dep: Dep) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignParamDirective, never> =
    function ForeignParamDirective_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || ForeignParamDirective)(i0.ɵɵdirectiveInject(Dep));
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ForeignParamDirective,
    '[appForeignParam]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ForeignParamDirective,
    selectors: [['', 'appForeignParam', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForeignParamDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appForeignParam]',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [{ type: Dep, decorators: [] }],
        null,
      );
  }
}

```

# /out/unexpected-core.component.ts
```ts
import { Component, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dep {}

export class UnexpectedCoreComponent {
  constructor(dep: Dep, @Injectable() other: Dep) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UnexpectedCoreComponent, never> =
    function UnexpectedCoreComponent_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || UnexpectedCoreComponent)(
        i0.ɵɵdirectiveInject(Dep),
        i0.ɵɵdirectiveInject(Dep),
      );
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    UnexpectedCoreComponent,
    'unexpected-core',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: UnexpectedCoreComponent,
    selectors: [['unexpected-core']],
    decls: 2,
    vars: 0,
    template: function UnexpectedCoreComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Unexpected');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UnexpectedCoreComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'unexpected-core',
                standalone: true,
                template: '<div>Unexpected</div>',
              },
            ],
          },
        ],
        (): any => [{ type: Dep }, { type: Dep, decorators: [{ type: Injectable }] }],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(UnexpectedCoreComponent, {
      className: 'UnexpectedCoreComponent',
      filePath: 'unexpected-core.component.ts',
      lineNumber: 10,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/unexpected-core.component.ts",
      "category": "error",
      "code": 1005,
      "messageText": "Unexpected decorator Injectable on parameter.",
      "span": {
        "start": 244,
        "end": 257
      }
    }
  ]
}

```