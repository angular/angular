# /out/greet.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GreetPipe implements PipeTransform {
  transform(v: string): string {
    return `Hello, ${v}`;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GreetPipe, never> = function GreetPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || GreetPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<GreetPipe, 'greet', false> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'greet',
      type: GreetPipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GreetPipe,
        [{ type: Pipe, args: [{ name: 'greet', standalone: false }] }],
        null,
        null,
      );
  }
}

```

# /out/index.ts
```ts
import { NgModule, Type } from '@angular/core';
import { GreetPipe } from './greet.pipe';
import { SharedWidget } from './widget';
// @ts-ignore
import * as i0 from '@angular/core';

const SHARED: Array<Type<unknown>> = [GreetPipe, SharedWidget];

export class SharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    SharedModule,
    never,
    never,
    [typeof GreetPipe, typeof SharedWidget]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/widget.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedWidget {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedWidget, never> = function SharedWidget_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedWidget)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SharedWidget,
    'shared-widget',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: SharedWidget,
      selectors: [['shared-widget']],
      standalone: false,
      decls: 0,
      vars: 0,
      template: function SharedWidget_Template(rf: number, ctx: any): any {},
      dependencies: i0.ɵɵgetComponentDepsFactory(SharedWidget),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedWidget,
        [
          {
            type: Component,
            args: [{ selector: 'shared-widget', template: '', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SharedWidget, {
      className: 'SharedWidget',
      filePath: 'widget.ts',
      lineNumber: 4,
    });
})();

```