# /out/host_binding_accessor_type_check.ngtypecheck.ts
```ts
/**
 * TCB for /host_binding_accessor_type_check.ts
 * @generated
 */

import * as i0 from './host_binding_accessor_type_check';

/*tcb1*/
function _tcb1(this: i0.DisableWhenBusyDirective) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.ValueDirective) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.DisabledPropertyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.isDisabled; /*614,622*/ /*614,622*/
  }
}

/* Diagnostics:
 - (614, 622) Can't bind to 'disabled' since it isn't a known property of 'ng-directive'.
*/

```

# /out/host_binding_accessor_type_check.ts
```ts
import { Directive, HostBinding, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DisableWhenBusyDirective {
  readonly busy = signal(
    false,
    ...((ngDevMode ? [{ debugName: 'busy' }] : /* istanbul ignore next */ []) as []),
  );

  get isDisabled(): boolean {
    return this.busy();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DisableWhenBusyDirective, never> =
    function DisableWhenBusyDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DisableWhenBusyDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DisableWhenBusyDirective,
    '[appDisableWhenBusy]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: DisableWhenBusyDirective,
      selectors: [['', 'appDisableWhenBusy', '']],
      hostVars: 1,
      hostBindings: function DisableWhenBusyDirective_HostBindings(rf: number, ctx: any): any {
        if (rf & 2) {
          i0.ɵɵdomProperty('disabled', ctx.isDisabled);
        }
      },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DisableWhenBusyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appDisableWhenBusy]',
              },
            ],
          },
        ],
        null,
        { isDisabled: [{ type: HostBinding, args: ['disabled'] }] },
      );
  }
}

export class ValueDirective {
  private _value = '';

  set value(v: string) {
    this._value = v;
  }
  get value(): string {
    return this._value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ValueDirective, never> = function ValueDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ValueDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ValueDirective,
    '[appValue]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: ValueDirective,
      selectors: [['', 'appValue', '']],
      hostVars: 1,
      hostBindings: function ValueDirective_HostBindings(rf: number, ctx: any): any {
        if (rf & 2) {
          i0.ɵɵdomProperty('value', ctx.value);
        }
      },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ValueDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appValue]',
              },
            ],
          },
        ],
        null,
        { value: [{ type: HostBinding, args: ['value'] }] },
      );
  }
}

export class DisabledPropertyDirective {
  isDisabled = false;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DisabledPropertyDirective, never> =
    function DisabledPropertyDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DisabledPropertyDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DisabledPropertyDirective,
    '[appDisabledProperty]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: DisabledPropertyDirective,
      selectors: [['', 'appDisabledProperty', '']],
      hostVars: 1,
      hostBindings: function DisabledPropertyDirective_HostBindings(rf: number, ctx: any): any {
        if (rf & 2) {
          i0.ɵɵdomProperty('disabled', ctx.isDisabled);
        }
      },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DisabledPropertyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appDisabledProperty]',
              },
            ],
          },
        ],
        null,
        { isDisabled: [{ type: HostBinding, args: ['disabled'] }] },
      );
  }
}

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/host_binding_accessor_type_check.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'disabled' since it isn't a known property of 'ng-directive'. Find more at https://next.angular.dev/errors/NG8002",
      "span": {
        "start": 614,
        "end": 622
      }
    }
  ]
}

```