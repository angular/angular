# /out/basic_host_directives.ngtypecheck.ts
```ts
/**
 * TCB for /basic_host_directives.ts
 * @generated
 */

import * as i0 from './basic_host_directives';

/*tcb1*/
function _tcb1(this: i0.DirectiveA) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.DirectiveB) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/basic_host_directives.ts
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
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirectiveA, hostAttrs: [1, 'dir-a'] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveA,
        [{ type: Directive, args: [{ host: { 'class': 'dir-a' } }] }],
        null,
        null,
      );
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
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirectiveB, hostAttrs: [1, 'dir-b'] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveB,
        [{ type: Directive, args: [{ host: { 'class': 'dir-b' } }] }],
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
    [
      { directive: typeof DirectiveA; inputs: {}; outputs: {} },
      { directive: typeof DirectiveB; inputs: {}; outputs: {} },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    features: [i0.ɵɵHostDirectivesFeature([DirectiveA, DirectiveB])],
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
                hostDirectives: [DirectiveA, DirectiveB],
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
      filePath: 'basic_host_directives.ts',
      lineNumber: 17,
    });
})();

```