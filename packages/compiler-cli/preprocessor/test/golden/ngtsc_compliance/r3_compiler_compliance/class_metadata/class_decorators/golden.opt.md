# /out/class_decorators.ngtypecheck.ts
```ts
/**
 * TCB for /class_decorators.ts
 * @generated
 */

import * as i0 from './class_decorators';

/*tcb1*/
function _tcb1(this: i0.ComponentWithExternalResource) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateFile":"/test_cmp_template.html"}}*/

```

# /out/class_decorators.ts
```ts
import { Component, Injectable } from '@angular/core';

import { CustomClassDecorator } from './custom';
// @ts-ignore
import * as i0 from '@angular/core';

export class BasicInjectable {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BasicInjectable, never> = function BasicInjectable_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BasicInjectable)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: BasicInjectable,
    factory: BasicInjectable.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(BasicInjectable, [{ type: Injectable }], null, null);
  }
}

export class RootInjectable {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RootInjectable, never> = function RootInjectable_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RootInjectable)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: RootInjectable,
    factory: RootInjectable.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RootInjectable,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

@CustomClassDecorator()
class CustomInjectable {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomInjectable, never> = function CustomInjectable_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CustomInjectable)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: CustomInjectable,
    factory: CustomInjectable.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(CustomInjectable, [{ type: Injectable }], null, null);
  }
}

export class ComponentWithExternalResource {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ComponentWithExternalResource, never> =
    function ComponentWithExternalResource_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ComponentWithExternalResource)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ComponentWithExternalResource,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComponentWithExternalResource,
    selectors: [['test-cmp']],
    decls: 2,
    vars: 0,
    template: function ComponentWithExternalResource_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'Test template');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ComponentWithExternalResource,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template: '<span>Test template</span>',
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
    i0.ɵsetClassDebugInfo(ComponentWithExternalResource, {
      className: 'ComponentWithExternalResource',
      filePath: 'class_decorators.ts',
      lineNumber: 22,
    });
})();

```