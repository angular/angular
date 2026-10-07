# /out/forward_ref_host_directives.ngtypecheck.ts
```ts
/**
 * TCB for /forward_ref_host_directives.ts
 * @generated
 */

import * as i0 from './forward_ref_host_directives';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/forward_ref_host_directives.ts
```ts
import { Component, Directive, forwardRef, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    [{ directive: typeof DirectiveB; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [DirectiveB];
      }),
    ],
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
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
                selector: 'my-component',
                template: '',
                hostDirectives: [forwardRef(() => DirectiveB)],
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'forward_ref_host_directives.ts',
      lineNumber: 9,
    });
})();

export class DirectiveB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveB, never> = function DirectiveB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveB)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveB,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DirectiveA; inputs: { 'value': 'value' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveB,
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [{ directive: DirectiveA, inputs: ['value', 'value'] }];
      }),
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveB,
        [
          {
            type: Directive,
            args: [
              {
                hostDirectives: [{ directive: forwardRef(() => DirectiveA), inputs: ['value'] }],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class DirectiveA {
  value: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never> = function DirectiveA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveA,
    never,
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirectiveA, inputs: { value: 'value' } });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DirectiveA, [{ type: Directive, args: [{}] }], null, {
        value: [{ type: Input }],
      });
  }
}

```