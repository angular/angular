# /out/app.ts
```ts
import {
  Component,
  Directive,
  Host,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  Optional,
  Pipe,
  PipeTransform,
  Self,
  SkipSelf,
  inject,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function CustomProp(): PropertyDecorator {
  return () => {};
}

export const API_URL = new InjectionToken<string>('API_URL');

export class DepService {}

export class MyService {
  private readonly dep = inject(DepService, { optional: true });

  @CustomProp()
  readonly apiUrl = inject(API_URL);
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
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        {
          dep: [{ type: Optional }],
          apiUrl: [
            { type: Host },
            { type: Self },
            { type: SkipSelf },
            { type: Inject, args: [API_URL] },
          ],
        },
      );
  }
}

export class MyComponent {
  readonly dep = inject(DepService, { optional: true });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['app-comp']],
    decls: 1,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
    },
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
                selector: 'app-comp',
                template: '<div></div>',
              },
            ],
          },
        ],
        null,
        { dep: [{ type: Optional }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'app.ts',
      lineNumber: 42,
    });
})();

export class MyDirective {
  readonly dep = inject(DepService, { optional: true, self: true });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    '[appDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MyDirective, selectors: [['', 'appDir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appDir]',
              },
            ],
          },
        ],
        null,
        { dep: [{ type: Optional }, { type: Self }] },
      );
  }
}

export class MyPipe implements PipeTransform {
  readonly dep = inject(DepService, { optional: true });

  transform(value: string): string {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'myPipe',
    type: MyPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'myPipe',
              },
            ],
          },
        ],
        null,
        { dep: [{ type: Optional }] },
      );
  }
}

export class MyModule {
  readonly dep = inject(DepService, { optional: true });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: MyModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyModule, [{ type: NgModule, args: [{}] }], null, {
        dep: [{ type: Optional }],
      });
  }
}

```