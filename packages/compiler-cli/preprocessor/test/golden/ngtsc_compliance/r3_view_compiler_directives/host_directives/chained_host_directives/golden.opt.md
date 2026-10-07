# /out/chained_host_directives.ngtypecheck.ts
```ts
/**
 * TCB for /chained_host_directives.ts
 * @generated
 */

import * as i0 from './chained_host_directives';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/chained_host_directives.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DirectiveA {
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
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirectiveA });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DirectiveA, [{ type: Directive, args: [{}] }], null, null);
  }
}

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
    [{ directive: typeof DirectiveA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveB,
    features: [i0.ɵɵHostDirectivesFeature([DirectiveA])],
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
                hostDirectives: [DirectiveA],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class DirectiveC {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveC, never> = function DirectiveC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveC)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveC,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DirectiveB; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveC,
    features: [i0.ɵɵHostDirectivesFeature([DirectiveB])],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveC,
        [
          {
            type: Directive,
            args: [
              {
                hostDirectives: [DirectiveB],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

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
    [{ directive: typeof DirectiveC; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    features: [i0.ɵɵHostDirectivesFeature([DirectiveC])],
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
                hostDirectives: [DirectiveC],
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
      filePath: 'chained_host_directives.ts',
      lineNumber: 25,
    });
})();

```