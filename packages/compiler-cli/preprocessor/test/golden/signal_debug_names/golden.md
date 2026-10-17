# /out/app.ts
```ts
import {
  Component,
  computed,
  contentChild,
  effect,
  input,
  linkedSignal,
  model,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { signal as aliasedSignal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['x'];
const _c1 = ['el'];

export const topLevel = signal(
  0,
  ...((ngDevMode ? [{ debugName: 'topLevel' }] : /* istanbul ignore next */ []) as []),
);

export class SignalDebugNamesComponent {
  // No options argument: one is appended, after `undefined` when there are no arguments.
  count = signal(
    0,
    ...((ngDevMode ? [{ debugName: 'count' }] : /* istanbul ignore next */ []) as []),
  );
  noInitial = input(
    ...((ngDevMode
      ? [undefined, { debugName: 'noInitial' }]
      : /* istanbul ignore next */ []) as []),
  );
  typedNoInitial = input<string>(
    ...((ngDevMode
      ? [undefined, { debugName: 'typedNoInitial' }]
      : /* istanbul ignore next */ []) as []),
  );
  twoWay = model(
    0,
    ...((ngDevMode ? [{ debugName: 'twoWay' }] : /* istanbul ignore next */ []) as []),
  );
  required = input.required<string>(
    ...((ngDevMode ? [{ debugName: 'required' }] : /* istanbul ignore next */ []) as []),
  );
  el = viewChild(
    'el',
    ...((ngDevMode ? [{ debugName: 'el' }] : /* istanbul ignore next */ []) as []),
  );
  projected = contentChild.required<string>(
    'x',
    ...((ngDevMode ? [{ debugName: 'projected' }] : /* istanbul ignore next */ []) as []),
  );

  // An options object literal: the name is spread into it.
  withEqual = signal(0, {
    ...(ngDevMode ? { debugName: 'withEqual' } : /* istanbul ignore next */ {}),
    equal: (a, b) => a === b,
  });
  aliased = input(0, {
    ...(ngDevMode ? { debugName: 'aliased' } : /* istanbul ignore next */ {}),
    alias: 'renamed',
  });
  empty = computed(() => this.count() * 2, {
    ...(ngDevMode ? { debugName: 'empty' } : /* istanbul ignore next */ {}),
  });
  requiredWithOptions = model.required<number>({
    ...(ngDevMode ? { debugName: 'requiredWithOptions' } : /* istanbul ignore next */ {}),
    alias: 'req',
  });

  // The options come first.
  linked = linkedSignal({
    ...(ngDevMode ? { debugName: 'linked' } : /* istanbul ignore next */ {}),
    source: this.count,
    computation: (count) => count + 1,
  });
  loaded = resource({
    ...(ngDevMode ? { debugName: 'loaded' } : /* istanbul ignore next */ {}),
    loader: async () => 1,
  });
  fetched = httpResource(
    () => '/api',
    ...((ngDevMode ? [{ debugName: 'fetched' }] : /* istanbul ignore next */ []) as []),
  );

  // Left alone: already named, opaque options, not an Angular import under its own name.
  named = signal(0, { debugName: 'custom' });
  opaque = signal(0, this.options());
  notRecognized = aliasedSignal(0);

  'quoted-name' = signal(
    '',
    ...((ngDevMode ? [{ debugName: "'quoted-name'" }] : /* istanbul ignore next */ []) as []),
  );
  #secret = signal(
    1,
    ...((ngDevMode ? [{ debugName: '#secret' }] : /* istanbul ignore next */ []) as []),
  );
  assigned;

  constructor() {
    this.assigned = computed(
      () => this.#secret() + 1,
      ...((ngDevMode ? [{ debugName: 'assigned' }] : /* istanbul ignore next */ []) as []),
    );
    effect(() => console.log(this.count()));
    const local = signal(
      false,
      ...((ngDevMode ? [{ debugName: 'local' }] : /* istanbul ignore next */ []) as []),
    );
    const outer = computed(
      () => {
        // Not named: ngtsc does not descend into a call it already rewrote.
        const inner = signal(1);
        return inner() + Number(local());
      },
      ...((ngDevMode ? [{ debugName: 'outer' }] : /* istanbul ignore next */ []) as []),
    );
    void outer;
  }

  private options() {
    return {};
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SignalDebugNamesComponent, never> =
    function SignalDebugNamesComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || SignalDebugNamesComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SignalDebugNamesComponent,
    'signal-debug-names',
    never,
    {
      'noInitial': { 'alias': 'noInitial'; 'required': false; 'isSignal': true };
      'typedNoInitial': { 'alias': 'typedNoInitial'; 'required': false; 'isSignal': true };
      'twoWay': { 'alias': 'twoWay'; 'required': false; 'isSignal': true };
      'required': { 'alias': 'required'; 'required': true; 'isSignal': true };
      'aliased': { 'alias': 'renamed'; 'required': false; 'isSignal': true };
      'requiredWithOptions': { 'alias': 'req'; 'required': true; 'isSignal': true };
    },
    { 'twoWay': 'twoWayChange'; 'requiredWithOptions': 'reqChange' },
    ['projected'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SignalDebugNamesComponent,
    selectors: [['signal-debug-names']],
    contentQueries: function SignalDebugNamesComponent_ContentQueries(
      rf: number,
      ctx: any,
      dirIndex: number,
    ): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.projected, _c0, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
      }
    },
    viewQuery: function SignalDebugNamesComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.el, _c1, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
      }
    },
    inputs: {
      noInitial: [1, 'noInitial'],
      typedNoInitial: [1, 'typedNoInitial'],
      twoWay: [1, 'twoWay'],
      required: [1, 'required'],
      aliased: [1, 'renamed', 'aliased'],
      requiredWithOptions: [1, 'req', 'requiredWithOptions'],
    },
    outputs: { twoWay: 'twoWayChange', requiredWithOptions: 'reqChange' },
    decls: 3,
    vars: 1,
    consts: [['el', '']],
    template: function SignalDebugNamesComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', null, 0);
        i0.ɵɵtext(2);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(ctx.count());
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SignalDebugNamesComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'signal-debug-names',
                template: `<div #el>{{ count() }}</div>`,
              },
            ],
          },
        ],
        (): any => [],
        {
          noInitial: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'noInitial', required: false }] },
          ],
          typedNoInitial: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'typedNoInitial', required: false }],
            },
          ],
          twoWay: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'twoWay', required: false }] },
            { type: i0.Output, args: ['twoWayChange'] },
          ],
          required: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'required', required: true }] },
          ],
          aliased: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'renamed', required: false }] },
          ],
          requiredWithOptions: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'req', required: true }] },
            { type: i0.Output, args: ['reqChange'] },
          ],
          projected: [
            { type: i0.ContentChild, args: ['x', { isSignal: true, descendants: true }] },
          ],
          el: [{ type: i0.ViewChild, args: ['el', { isSignal: true }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SignalDebugNamesComponent, {
      className: 'SignalDebugNamesComponent',
      filePath: 'app.ts',
      lineNumber: 22,
    });
})();

```