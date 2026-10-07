# /out/test.component.ngtypecheck.ts
```ts
/**
 * TCB for /test.component.ts
 * @generated
 */

import * as i0 from './test.component';

/*tcb1*/
function _tcb1(this: i0.TestComponent) {
  if (true) {
  }
}

```

# /out/test.component.ts
```ts
import { Component, HostBinding, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComponent {
  myId = '1';

  isActive = true;

  onClick() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['test-comp']],
    hostAttrs: ['role', 'button'],
    hostVars: 3,
    hostBindings: function TestComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('click', function TestComponent_click_HostBindingHandler(): any {
          return ctx.onClick();
        });
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('id', ctx.myId);
        i0.ɵɵclassProp('active', ctx.isActive);
      }
    },
    decls: 2,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'hello');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-comp',
                template: '<span>hello</span>',
                standalone: true,
                host: {
                  'role': 'button',
                  '[id]': 'myId',
                },
              },
            ],
          },
        ],
        null,
        {
          isActive: [{ type: HostBinding, args: ['class.active'] }],
          onClick: [{ type: HostListener, args: ['click'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'test.component.ts',
      lineNumber: 12,
    });
})();

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