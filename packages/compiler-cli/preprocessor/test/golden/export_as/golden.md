# /out/test.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDir {
  value = 'hello';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never> = function MyDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDir,
    '[myDir]',
    ['myDirAlias'],
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    selectors: [['', 'myDir', '']],
    exportAs: ['myDirAlias'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myDir]',
                exportAs: 'myDirAlias',
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
    decls: 3,
    vars: 1,
    consts: [
      ['dir', 'myDirAlias'],
      ['myDir', ''],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 1, 0);
        i0.ɵɵtext(2);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        const dir_r1: any = i0.ɵɵreference(1);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(dir_r1.value);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [MyDir]),
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
                template: '<div myDir #dir="myDirAlias">{{ dir.value }}</div>',
                standalone: true,
                imports: [MyDir],
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
      filePath: 'test.ts',
      lineNumber: 18,
    });
})();

```