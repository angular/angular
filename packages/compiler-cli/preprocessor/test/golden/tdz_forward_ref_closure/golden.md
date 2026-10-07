# /out/src/modules/forward_ref_module.ts
```ts
import { NgModule } from '@angular/core';
import { ForwardRefPanel, ForwardRefPipe } from 'app/panels/forward_ref_panel';
// @ts-ignore
import * as i0 from '@angular/core';

export class ForwardRefModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardRefModule, never> = function ForwardRefModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ForwardRefModule)();
  };
  // @ts-ignore
  static ɵmod: ForwardRefModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardRefModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ForwardRefModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [ForwardRefPanel],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardRefModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [ForwardRefPanel, ForwardRefPipe],
                exports: [ForwardRefPanel],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ForwardRefModule, {
      declarations: [ForwardRefPanel, ForwardRefPipe],
      exports: [ForwardRefPanel],
    });
})();

```

# /out/src/panels/forward_ref_panel.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ForwardRefPanel {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardRefPanel, never> = function ForwardRefPanel_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ForwardRefPanel)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ForwardRefPanel,
    'forward-ref-panel',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ForwardRefPanel,
    selectors: [['forward-ref-panel']],
    standalone: false,
    decls: 3,
    vars: 3,
    template: function ForwardRefPanel_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'forwardRefPipe');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'test'));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ForwardRefPanel),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardRefPanel,
        [
          {
            type: Component,
            args: [
              {
                standalone: false,
                selector: 'forward-ref-panel',
                template: '<div>{{ "test" | forwardRefPipe }}</div>',
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
    i0.ɵsetClassDebugInfo(ForwardRefPanel, {
      className: 'ForwardRefPanel',
      filePath: 'src/panels/forward_ref_panel.ts',
      lineNumber: 8,
    });
})();

export class ForwardRefPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardRefPipe, never> = function ForwardRefPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ForwardRefPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<ForwardRefPipe, 'forwardRefPipe', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'forwardRefPipe',
      type: ForwardRefPipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardRefPipe,
        [
          {
            type: Pipe,
            args: [
              {
                standalone: false,
                name: 'forwardRefPipe',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```