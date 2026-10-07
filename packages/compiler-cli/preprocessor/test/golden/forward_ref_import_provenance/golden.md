# /out/test.ts
```ts
import { Component, Directive, Input, ViewChild, forwardRef as ngForwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// Not Angular's `forwardRef` -- it merely shares the name, so it must NOT be unwrapped.
function forwardRef<T>(fn: () => T): T {
  return fn();
}

export class HostComponent {
  aliased!: DepDirective;
  notAngular!: DepDirective;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostComponent, never> = function HostComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostComponent,
    'app-host',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepDirective; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostComponent,
    selectors: [['app-host']],
    viewQuery: function HostComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(DepDirective, 5)(
          forwardRef(() => DepDirective),
          5,
        );
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.aliased = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.notAngular = _t.first);
      }
    },
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [DepDirective];
      }),
    ],
    decls: 0,
    vars: 0,
    template: function HostComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-host',
                standalone: true,
                template: '',
                hostDirectives: [ngForwardRef(() => DepDirective)],
              },
            ],
          },
        ],
        null,
        {
          aliased: [{ type: ViewChild, args: [ngForwardRef(() => DepDirective)] }],
          notAngular: [{ type: ViewChild, args: [forwardRef(() => DepDirective)] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(HostComponent, {
      className: 'HostComponent',
      filePath: 'test.ts',
      lineNumber: 14,
    });
})();

export class DepDirective {
  value!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DepDirective, never> = function DepDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DepDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DepDirective,
    '[dep]',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DepDirective,
    selectors: [['', 'dep', '']],
    inputs: { value: 'value' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DepDirective,
        [{ type: Directive, args: [{ selector: '[dep]', standalone: true }] }],
        null,
        { value: [{ type: Input }] },
      );
  }
}

```