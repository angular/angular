# /out/pipe_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /pipe_bindings.ts
 * @generated
 */

import * as i0 from './pipe_bindings';

var _pipe1 = null! as i0.StylePipe;
var _pipe2 = null! as i0.ClassPipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    _pipe1.transform(/*357,366*/ this.myStyleExp /*344,354*/ /*344,354*/) /*344,366*/;
    _pipe2.transform(/*390,399*/ this.myClassExp /*377,387*/ /*377,387*/) /*377,399*/;
  }
}

```

# /out/pipe_bindings.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StylePipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StylePipe, never> = function StylePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StylePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<StylePipe, 'stylePipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'stylePipe', type: StylePipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StylePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'stylePipe',
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

export class ClassPipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ClassPipe, never> = function ClassPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ClassPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<ClassPipe, 'classPipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'classPipe', type: ClassPipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ClassPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'classPipe',
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

export class MyComponent {
  myStyleExp = [{ color: 'red' }, { color: 'blue', duration: 1000 }];
  myClassExp = 'foo bar apple';
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
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 3,
    vars: 8,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
        i0.ɵɵpipe(1, 'stylePipe');
        i0.ɵɵpipe(2, 'classPipe');
      }
      if (rf & 2) {
        i0.ɵɵstyleMap(i0.ɵɵpipeBind1(1, 4, ctx.myStyleExp));
        i0.ɵɵclassMap(i0.ɵɵpipeBind1(2, 6, ctx.myClassExp));
      }
    },
    dependencies: [StylePipe, ClassPipe],
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
                template: `<div [style]="myStyleExp | stylePipe" [class]="myClassExp | classPipe"></div>`,
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
      filePath: 'pipe_bindings.ts',
      lineNumber: 24,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyComponent, typeof StylePipe, typeof ClassPipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, StylePipe, ClassPipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, StylePipe, ClassPipe] });
})();

```