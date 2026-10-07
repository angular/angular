# /out/test.ts
```ts
import {
  Component,
  Inject,
  Injectable,
  Optional,
  Self,
  SkipSelf,
  Host,
  Attribute,
  InjectionToken,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const TOKEN = 'TOKEN';
export const INJECTED_TOKEN = new InjectionToken<string>('INJECTED_TOKEN');

export class Service {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Service, never> = function Service_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Service)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Service,
    factory: Service.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Service, [{ type: Injectable }], null, null);
  }
}

export const Namespace = {
  Token: 'NamespaceToken',
};

export class TestComponent {
  constructor(
    public token: string,
    public literalToken: string,
    public namespaceToken: string,
    public injectedToken: string,
    public optional: Service,
    public self: Service,
    public skipSelf: Service,
    public host: Service,
    public attr: string,
    public optionalToken: string,
    public selfOptional: Service,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<
    TestComponent,
    [
      null,
      null,
      null,
      null,
      { optional: true },
      { self: true },
      { skipSelf: true },
      { host: true },
      { attribute: 'attr' },
      { optional: true },
      { optional: true; self: true },
    ]
  > = function TestComponent_Factory(__ngFactoryType__: any): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestComponent)(
      i0.ɵɵdirectiveInject(TOKEN),
      i0.ɵɵdirectiveInject('literal-token'),
      i0.ɵɵdirectiveInject(Namespace.Token),
      i0.ɵɵdirectiveInject(INJECTED_TOKEN),
      i0.ɵɵdirectiveInject(Service, 8),
      i0.ɵɵdirectiveInject(Service, 2),
      i0.ɵɵdirectiveInject(Service, 4),
      i0.ɵɵdirectiveInject(Service, 1),
      i0.ɵɵinjectAttribute('attr'),
      i0.ɵɵdirectiveInject(TOKEN, 8),
      i0.ɵɵdirectiveInject(Service, 10),
    );
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'app-test',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['app-test']],
    decls: 0,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-test',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [
          { type: undefined, decorators: [{ type: Inject, args: [TOKEN] }] },
          { type: undefined, decorators: [{ type: Inject, args: ['literal-token'] }] },
          { type: undefined, decorators: [{ type: Inject, args: [Namespace.Token] }] },
          { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN] }] },
          { type: Service, decorators: [{ type: Optional }] },
          { type: Service, decorators: [{ type: Self }] },
          { type: Service, decorators: [{ type: SkipSelf }] },
          { type: Service, decorators: [{ type: Host }] },
          { type: undefined, decorators: [{ type: Attribute, args: ['attr'] }] },
          { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [TOKEN] }] },
          { type: Service, decorators: [{ type: Self }, { type: Optional }] },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'test.ts',
      lineNumber: 18,
    });
})();

```