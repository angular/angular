# /out/host_directives_with_host_aliases.ngtypecheck.ts
```ts
/**
 * TCB for /host_directives_with_host_aliases.ts
 * @generated
 */

import * as i0 from './host_directives_with_host_aliases';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/host_directives_with_host_aliases.ts
```ts
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostDir {
  value = 1;
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
      'value': { 'alias': 'valueAlias'; 'required': false };
      'color': { 'alias': 'colorAlias'; 'required': false };
    },
    { 'opened': 'openedAlias'; 'closed': 'closedAlias' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostDir,
    inputs: { value: [0, 'valueAlias', 'value'], color: [0, 'colorAlias', 'color'] },
    outputs: { opened: 'openedAlias', closed: 'closedAlias' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(HostDir, [{ type: Directive, args: [{}] }], null, {
        value: [{ type: Input, args: ['valueAlias'] }],
        color: [{ type: Input, args: ['colorAlias'] }],
        opened: [{ type: Output, args: ['openedAlias'] }],
        closed: [{ type: Output, args: ['closedAlias'] }],
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
        inputs: { 'valueAlias': 'valueAlias'; 'colorAlias': 'customColorAlias' };
        outputs: { 'openedAlias': 'openedAlias'; 'closedAlias': 'customClosedAlias' };
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
          inputs: ['valueAlias', 'valueAlias', 'colorAlias', 'customColorAlias'],
          outputs: ['openedAlias', 'openedAlias', 'closedAlias', 'customClosedAlias'],
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
                    inputs: ['valueAlias', 'colorAlias: customColorAlias'],
                    outputs: ['openedAlias', 'closedAlias: customClosedAlias'],
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
      filePath: 'host_directives_with_host_aliases.ts',
      lineNumber: 21,
    });
})();

```