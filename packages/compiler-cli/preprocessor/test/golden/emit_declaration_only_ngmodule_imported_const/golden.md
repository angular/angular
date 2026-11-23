# /out/greet.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GreetPipe implements PipeTransform {
  transform(v: string): string {
    return v;
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
import { NgModule } from '@angular/core';
import { LIST } from './list';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './greet.pipe';

export class SharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, never, never, [typeof i1.GreetPipe]> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```