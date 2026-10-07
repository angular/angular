# /out/test.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// `host` is typed `{[key: string]: string}`, so the numeric and boolean values below are
// already TypeScript type errors, and ngtsc's partial evaluator rejects them a second time
// with `NG1010: Decorator host metadata must be a string -> string object, but found
// unparseable value` — real ngc emits no definition at all for this class. Having no
// diagnostics channel here, those entries are dropped and the well-typed ones still compile.
// What must not happen is inventing an attribute value out of the rejected source text.
// TODO(parity): once the evaluator feeds a diagnostics channel, report NG1010 and emit no
// definition for the class, as ngtsc does, instead of dropping the offending entries.
export class HostLiteralsComponent {
  expanded = false;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostLiteralsComponent, never> =
    function HostLiteralsComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostLiteralsComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostLiteralsComponent,
    'host-literals-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostLiteralsComponent,
    selectors: [['host-literals-comp']],
    hostVars: 1,
    hostBindings: function HostLiteralsComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('aria-expanded', ctx.expanded ? 'true' : 'false');
      }
    },
    decls: 1,
    vars: 0,
    template: function HostLiteralsComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Host Literals');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostLiteralsComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'host-literals-comp',
                template: 'Host Literals',
                host: {
                  'tabindex': 0,
                  '[class.disabled]': true,
                  '[attr.aria-expanded]': 'expanded ? "true" : "false"',
                },
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
    i0.ɵsetClassDebugInfo(HostLiteralsComponent, {
      className: 'HostLiteralsComponent',
      filePath: 'test.ts',
      lineNumber: 20,
    });
})();

```