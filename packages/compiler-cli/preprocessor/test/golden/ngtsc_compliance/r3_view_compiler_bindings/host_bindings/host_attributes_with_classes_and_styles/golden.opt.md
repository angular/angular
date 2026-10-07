# /out/host_attributes_with_classes_and_styles.ngtypecheck.ts
```ts
/**
 * TCB for /host_attributes_with_classes_and_styles.ts
 * @generated
 */

import * as i0 from './host_attributes_with_classes_and_styles';

/*tcb1*/
function _tcb1(this: i0.HostAttributeComp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.HostAttributeDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    true /*415,419*/;
    true /*476,480*/;
  }
}

```

# /out/host_attributes_with_classes_and_styles.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostAttributeComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeComp, never> =
    function HostAttributeComp_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostAttributeComp)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostAttributeComp,
    'my-host-attribute-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostAttributeComp,
    selectors: [['my-host-attribute-component']],
    hostAttrs: ['title', 'hello there from component', 2, 'opacity', '1'],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function HostAttributeComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, '...');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostAttributeComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-host-attribute-component',
                template: '...',
                host: { 'title': 'hello there from component', 'style': 'opacity:1' },
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
    i0.ɵsetClassDebugInfo(HostAttributeComp, {
      className: 'HostAttributeComp',
      filePath: 'host_attributes_with_classes_and_styles.ts',
      lineNumber: 9,
    });
})();

export class HostAttributeDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeDir, never> = function HostAttributeDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostAttributeDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostAttributeDir,
    '[hostAttributeDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostAttributeDir,
    selectors: [['', 'hostAttributeDir', '']],
    hostAttrs: [
      'title',
      'hello there from directive',
      1,
      'one',
      'two',
      2,
      'width',
      '200px',
      'height',
      '500px',
    ],
    hostVars: 4,
    hostBindings: function HostAttributeDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('opacity', true);
        i0.ɵɵclassProp('three', true);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostAttributeDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[hostAttributeDir]',
                host: {
                  'style': 'width: 200px; height: 500px',
                  '[style.opacity]': 'true',
                  'class': 'one two',
                  '[class.three]': 'true',
                  'title': 'hello there from directive',
                },
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
    [typeof HostAttributeComp, typeof HostAttributeDir],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [HostAttributeComp, HostAttributeDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeComp, HostAttributeDir] });
})();

```