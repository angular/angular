# /out/app.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyPipe implements PipeTransform {
  transform(value: any) {
    return value + ' filtered';
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
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 2,
    vars: 3,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'myPipe');
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(1, 1, 'hello'));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [MyPipe]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                standalone: true,
                imports: [MyPipe],
                template: '{{ "hello" | myPipe }}',
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.ts',
      lineNumber: 17,
    });
})();

```