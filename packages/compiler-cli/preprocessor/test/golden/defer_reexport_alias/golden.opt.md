# /out/network_activity.ngtypecheck.ts
```ts
/**
 * TCB for /network_activity.ts
 * @generated
 */

import * as i0 from './network_activity';
import * as i1 from './ng_for_of';

/*tcb1*/
function _tcb1(this: i0.NetworkActivityComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*217,249*/ = null! as i1.NgForOf; /*T:VAE*/
    _t1.ngForOf /*239,241*/ = this.items /*242,247*/ /*242,247*/ /*239,247*/;
    var _t2 = null! as any; /*T:VAE*/
    {
      var _t3 /*234,238*/ = _t2.$implicit; /*230,239*/
      '' + _t3 /*252,256*/;
    }
  }
}

```

# /out/network_activity.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const NetworkActivityComponent_Defer_2_DepsFn = (): any => [
  /* @ts-ignore */
  import('./common').then((m: any): any => m.NgFor),
];
function NetworkActivityComponent_Defer_0_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function NetworkActivityComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, NetworkActivityComponent_Defer_0_div_0_Template, 2, 1, 'div', 0);
  }
  if (rf & 2) {
    const ctx_r1: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('ngForOf', ctx_r1.items);
  }
}
function NetworkActivityComponent_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1, 'Placeholder');
    i0.ɵɵelementEnd();
  }
}

export class NetworkActivityComponent {
  items: string[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NetworkActivityComponent, never> =
    function NetworkActivityComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NetworkActivityComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NetworkActivityComponent,
    'app-network-activity',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NetworkActivityComponent,
    selectors: [['app-network-activity']],
    decls: 4,
    vars: 0,
    consts: [[4, 'ngFor', 'ngForOf']],
    template: function NetworkActivityComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, NetworkActivityComponent_Defer_0_Template, 1, 1)(
          1,
          NetworkActivityComponent_DeferPlaceholder_1_Template,
          2,
          0,
        );
        i0.ɵɵdefer(2, 0, NetworkActivityComponent_Defer_2_DepsFn, null, 1);
        i0.ɵɵdeferOnInteraction(0, -1);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        NetworkActivityComponent,
        (): any => [
          /* @ts-ignore */
          import('./common').then((m: any): any => m.NgFor),
        ],
        (NgFor: any): any => {
          i0.ɵsetClassMetadata(
            NetworkActivityComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-network-activity',
                    standalone: true,
                    imports: [NgFor],
                    template: `
        @defer (on interaction) {
          <div *ngFor="let item of items">{{ item }}</div>
        } @placeholder {
          <span>Placeholder</span>
        }
      `,
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(NetworkActivityComponent, {
      className: 'NetworkActivityComponent',
      filePath: 'network_activity.ts',
      lineNumber: 16,
    });
})();

```

# /out/ng_for_of.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class NgForOf {
  ngForOf: string[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NgForOf, never> = function NgForOf_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NgForOf)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NgForOf,
    '[ngFor][ngForOf]',
    never,
    { 'ngForOf': { 'alias': 'ngForOf'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgForOf,
    selectors: [['', 'ngFor', '', 'ngForOf', '']],
    inputs: { ngForOf: 'ngForOf' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NgForOf,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[ngFor][ngForOf]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { ngForOf: [{ type: Input }] },
      );
  }
}

```