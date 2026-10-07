# /out/attr_binding_on_structural_inside_ng_template.ngtypecheck.ts
```ts
/**
 * TCB for /attr_binding_on_structural_inside_ng_template.ts
 * @generated
 */

import * as i0 from './attr_binding_on_structural_inside_ng_template';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      {
        this.someField /*165,174*/ /*165,174*/;
      }
    }
  }
}

```

# /out/attr_binding_on_structural_inside_ng_template.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_span_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'span');
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext(2);
    i0.ɵɵattribute('someAttr', ctx_r0.someField);
  }
}
function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyComponent_ng_template_0_span_0_Template, 1, 1, 'span', 1);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('ngIf', ctx_r0.someBooleanField);
  }
}

export class MyComponent {
  someField!: any;
  someBooleanField!: boolean;
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
    decls: 2,
    vars: 0,
    consts: [
      ['someLocalRef', ''],
      [4, 'ngIf'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(
          0,
          MyComponent_ng_template_0_Template,
          1,
          1,
          'ng-template',
          null,
          0,
          i0.ɵɵtemplateRefExtractor,
        );
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
                selector: 'my-component',
                template: `
    	<ng-template #someLocalRef>
    		<span [attr.someAttr]="someField" *ngIf="someBooleanField"></span>
    	</ng-template>
    `,
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
      filePath: 'attr_binding_on_structural_inside_ng_template.ts',
      lineNumber: 12,
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
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
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