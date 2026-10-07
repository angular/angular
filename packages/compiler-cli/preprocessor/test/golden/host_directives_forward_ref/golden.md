# /out/test.ts
```ts
import { Component, Directive, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostDirComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostDirComponent, never> = function HostDirComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostDirComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostDirComponent,
    'host-dir-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      { directive: typeof ExplicitForwardDirective; inputs: {}; outputs: {} },
      {
        directive: typeof ExplicitObjectForwardDirective;
        inputs: { 'inputName': 'inputAlias' };
        outputs: {};
      },
      { directive: typeof ImplicitForwardDirective; inputs: {}; outputs: {} },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostDirComponent,
    selectors: [['host-dir-comp']],
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [
          ExplicitForwardDirective,
          { directive: ExplicitObjectForwardDirective, inputs: ['inputName', 'inputAlias'] },
          ImplicitForwardDirective,
        ];
      }),
    ],
    decls: 1,
    vars: 0,
    template: function HostDirComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Host Directives');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostDirComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'host-dir-comp',
                template: 'Host Directives',
                hostDirectives: [
                  forwardRef(() => ExplicitForwardDirective),
                  {
                    directive: forwardRef(() => ExplicitObjectForwardDirective),
                    inputs: ['inputName: inputAlias'],
                  },
                  // @ts-ignore
                  ImplicitForwardDirective,
                ],
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
    i0.ɵsetClassDebugInfo(HostDirComponent, {
      className: 'HostDirComponent',
      filePath: 'test.ts',
      lineNumber: 15,
    });
})();

export class ExplicitForwardDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExplicitForwardDirective, never> =
    function ExplicitForwardDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExplicitForwardDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ExplicitForwardDirective,
    '[explicit-fwd]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ExplicitForwardDirective,
    selectors: [['', 'explicit-fwd', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExplicitForwardDirective,
        [{ type: Directive, args: [{ selector: '[explicit-fwd]', standalone: true }] }],
        null,
        null,
      );
  }
}

export class ExplicitObjectForwardDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExplicitObjectForwardDirective, never> =
    function ExplicitObjectForwardDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExplicitObjectForwardDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ExplicitObjectForwardDirective,
    '[explicit-obj-fwd]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ExplicitObjectForwardDirective,
    selectors: [['', 'explicit-obj-fwd', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExplicitObjectForwardDirective,
        [{ type: Directive, args: [{ selector: '[explicit-obj-fwd]', standalone: true }] }],
        null,
        null,
      );
  }
}

export class ImplicitForwardDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImplicitForwardDirective, never> =
    function ImplicitForwardDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImplicitForwardDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ImplicitForwardDirective,
    '[implicit-fwd]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ImplicitForwardDirective,
    selectors: [['', 'implicit-fwd', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImplicitForwardDirective,
        [{ type: Directive, args: [{ selector: '[implicit-fwd]', standalone: true }] }],
        null,
        null,
      );
  }
}

```