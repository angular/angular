# /out/host_directives_with_inputs_outputs.ngtypecheck.ts
```ts
/**
 * TCB for /host_directives_with_inputs_outputs.ts
 * @generated
 */

import * as i0 from './host_directives_with_inputs_outputs';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/host_directives_with_inputs_outputs.ts
```ts
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostDir {
  value = 0;
  color = '';
  opened = new EventEmitter();
  closed = new EventEmitter();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never> = function HostDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostDir,
    never,
    never,
    {
      'value': { 'alias': 'value'; 'required': false };
      'color': { 'alias': 'color'; 'required': false };
    },
    { 'opened': 'opened'; 'closed': 'closed' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostDir,
    inputs: { value: 'value', color: 'color' },
    outputs: { opened: 'opened', closed: 'closed' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(HostDir, [{ type: Directive, args: [{}] }], null, {
        value: [{ type: Input }],
        color: [{ type: Input }],
        opened: [{ type: Output }],
        closed: [{ type: Output }],
      });
  }
}

export class MyComponent {
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
    [
      {
        directive: typeof HostDir;
        inputs: { 'value': 'value'; 'color': 'colorAlias' };
        outputs: { 'opened': 'opened'; 'closed': 'closedAlias' };
      },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    features: [
      i0.ɵɵHostDirectivesFeature([
        {
          directive: HostDir,
          inputs: ['value', 'value', 'color', 'colorAlias'],
          outputs: ['opened', 'opened', 'closed', 'closedAlias'],
        },
      ]),
    ],
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
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
                template: '',
                hostDirectives: [
                  {
                    directive: HostDir,
                    inputs: ['value', 'color: colorAlias'],
                    outputs: ['opened', 'closed: closedAlias'],
                  },
                ],
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
      filePath: 'host_directives_with_inputs_outputs.ts',
      lineNumber: 21,
    });
})();

```