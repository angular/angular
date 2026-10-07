# /out/component_factory.ngtypecheck.ts
```ts
/**
 * TCB for /component_factory.ts
 * @generated
 */

import * as i0 from './component_factory';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/component_factory.ts
```ts
import {
  Attribute,
  Component,
  Host,
  Injectable,
  NgModule,
  Optional,
  Self,
  SkipSelf,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never> = function MyService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: MyService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyService, [{ type: Injectable }], null, null);
  }
}

function dynamicAttrName() {
  return 'the-attr';
}

export class MyComponent {
  constructor(
    name: string,
    other: string,
    s1: MyService,
    s2: MyService,
    s4: MyService,
    s3: MyService,
    s5: MyService,
    s6: MyService,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<
    MyComponent,
    [
      { attribute: 'name' },
      { attribute: unknown },
      null,
      { host: true },
      { self: true },
      { skipSelf: true },
      { optional: true },
      { optional: true; self: true },
    ]
  > = function MyComponent_Factory(__ngFactoryType__: any): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyComponent)(
      i0.ɵɵinjectAttribute('name'),
      i0.ɵɵinjectAttribute(dynamicAttrName()),
      i0.ɵɵdirectiveInject(MyService),
      i0.ɵɵdirectiveInject(MyService, 1),
      i0.ɵɵdirectiveInject(MyService, 2),
      i0.ɵɵdirectiveInject(MyService, 4),
      i0.ɵɵdirectiveInject(MyService, 8),
      i0.ɵɵdirectiveInject(MyService, 10),
    );
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
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
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
                template: ``,
                standalone: false,
              },
            ],
          },
        ],
        (): any => [
          { type: undefined, decorators: [{ type: Attribute, args: ['name'] }] },
          { type: undefined, decorators: [{ type: Attribute, args: [dynamicAttrName()] }] },
          { type: MyService },
          { type: MyService, decorators: [{ type: Host }] },
          { type: MyService, decorators: [{ type: Self }] },
          { type: MyService, decorators: [{ type: SkipSelf }] },
          { type: MyService, decorators: [{ type: Optional }] },
          { type: MyService, decorators: [{ type: Self }, { type: Optional }] },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'component_factory.ts',
      lineNumber: 15,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [MyService],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent], providers: [MyService] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```