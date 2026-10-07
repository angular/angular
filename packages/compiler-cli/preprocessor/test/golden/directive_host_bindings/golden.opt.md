# /out/tooltip.directive.ngtypecheck.ts
```ts
/**
 * TCB for /tooltip.directive.ts
 * @generated
 */

import * as i0 from './tooltip.directive';

/*tcb1*/
function _tcb1(this: i0.TooltipDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.isHidden /*192,200*/ /*192,200*/;
    this.activeClass /*298,312*/ /*298,312*/;
    this.tooltipId /*382,386*/ /*382,386*/;
    var _t1 = document.createElement('ng-directive'); /*224,240*/
    _t1.addEventListener(/*432,439*/ 'click', ($event /*T:EP*/): any => {
      this.onClick(/*455,462*/ $event /*442,448*/) /*455,462*/;
    }) /*418,452*/;
    _t1.addEventListener(/*541,553*/ 'mouseenter', ($event /*T:EP*/): any => {
      this
        .onMouseEnter /*557,569*/
        () /*557,569*/;
    }) /*527,554*/;
    _t1.addEventListener(/*622,629*/ 'input', ($event /*T:EP*/): any => {
      this.onInput(
        /*668,675*/ $event /*632,638*/.target /*639,645*/ /*632,645*/.value /*646,651*/ /*632,651*/,
        'test' /*655,661*/,
      ) /*668,675*/;
    }) /*608,665*/;
  }
}

```

# /out/tooltip.directive.ts
```ts
import { Directive, HostBinding, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TooltipDirective {
  isHidden = true;
  isActive = false;

  get activeClass() {
    return this.isActive;
  }

  tooltipId = 'tooltip-1';

  onClick(event: MouseEvent) {
    this.isActive = !this.isActive;
  }

  onMouseEnter() {
    this.isHidden = false;
  }

  onInput(val: string, staticStr: string) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TooltipDirective, never> = function TooltipDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TooltipDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TooltipDirective,
    '[appTooltip]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TooltipDirective,
    selectors: [['', 'appTooltip', '']],
    hostAttrs: ['role', 'tooltip'],
    hostVars: 4,
    hostBindings: function TooltipDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener(
          'click',
          function TooltipDirective_click_HostBindingHandler($event: any): any {
            return ctx.onClick($event);
          },
        )('mouseenter', function TooltipDirective_mouseenter_HostBindingHandler(): any {
          return ctx.onMouseEnter();
        })('input', function TooltipDirective_input_HostBindingHandler($event: any): any {
          return ctx.onInput($event.target.value, 'test');
        });
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('id', ctx.tooltipId);
        i0.ɵɵattribute('aria-hidden', ctx.isHidden);
        i0.ɵɵclassProp('active', ctx.activeClass);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TooltipDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appTooltip]',
                standalone: true,
                host: {
                  'role': 'tooltip',
                  '[attr.aria-hidden]': 'isHidden',
                },
              },
            ],
          },
        ],
        null,
        {
          activeClass: [{ type: HostBinding, args: ['class.active'] }],
          tooltipId: [{ type: HostBinding, args: ['id'] }],
          onClick: [{ type: HostListener, args: ['click', ['$event']] }],
          onMouseEnter: [{ type: HostListener, args: ['mouseenter'] }],
          onInput: [{ type: HostListener, args: ['input', ['$event.target.value', '"test"']] }],
        },
      );
  }
}

```