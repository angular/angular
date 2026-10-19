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
    this.isHidden; /*172,180*/ /*172,180*/
    this.tooltipId; /*363,365*/ /*363,365*/
    var _t1 = document.createElement('ng-directive'); /*204,220*/
    _t1.addEventListener(/*413,418*/ 'click', ($event /*T:EP*/): any => {
      this.onClick(/*435,442*/ $event /*423,429*/); /*435,442*/
    }); /*398,432*/
    _t1.addEventListener(/*522,532*/ 'mouseenter', ($event /*T:EP*/): any => {
      this
        .onMouseEnter /*537,549*/
        (); /*537,549*/
    }); /*507,534*/
    _t1.addEventListener(/*603,608*/ 'input', ($event /*T:EP*/): any => {
      this.onInput(
        /*648,655*/ $event /*613,619*/.target /*620,626*/ /*613,626*/.value /*627,632*/ /*613,632*/,
        'test' /*636,642*/,
      ); /*648,655*/
    }); /*588,645*/
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
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