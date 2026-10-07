# /out/button.component.ngtypecheck.ts
```ts
/**
 * TCB for /button.component.ts
 * @generated
 */

import * as i0 from './button.component';

/*tcb1*/
function _tcb1(this: i0.ButtonComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.isPressed /*248,257*/ /*248,257*/;
    this.disabled /*284,292*/ /*284,292*/ ? 0.5 /*295,298*/ : 1 /*301,302*/ /*284,302*/;
    this.disabled /*334,342*/ /*334,342*/;
    this.focusedClass /*490,505*/ /*490,505*/;
    this.cursor /*577,591*/ /*577,591*/;
    var _t1 = document.createElement('app-button'); /*394,409*/
    _t1.addEventListener(/*350,357*/ 'focus', ($event /*T:EP*/): any => {
      this
        .onFocus /*361,368*/
        () /*361,370*/;
    }) /*350,370*/;
    _t1.addEventListener(/*685,700*/ 'keydown.enter', ($event /*T:EP*/): any => {
      this
        .onActivate /*737,747*/
        () /*737,747*/;
    }) /*671,701*/;
    _t1.addEventListener(/*718,733*/ 'keydown.space', ($event /*T:EP*/): any => {
      this
        .onActivate /*737,747*/
        () /*737,747*/;
    }) /*704,734*/;
    _t1.addEventListener(/*834,847*/ 'keyup.enter', ($event /*T:EP*/): any => {
      this
        .onDeactivate /*882,894*/
        () /*882,894*/;
    }) /*820,848*/;
    _t1.addEventListener(/*865,878*/ 'keyup.space', ($event /*T:EP*/): any => {
      this
        .onDeactivate /*882,894*/
        () /*882,894*/;
    }) /*851,879*/;
    _t1.addEventListener(/*994,1000*/ 'blur', ($event /*T:EP*/): any => {
      this
        .onBlur /*1004,1010*/
        () /*1004,1010*/;
    }) /*980,1001*/;
  }
}

```

# /out/button.component.ts
```ts
import { Component, HostBinding, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];

export class ButtonComponent {
  isPressed = false;
  disabled = false;
  isFocused = false;

  get focusedClass() {
    return this.isFocused;
  }

  get cursor() {
    return this.disabled ? 'not-allowed' : 'pointer';
  }

  onActivate() {
    if (!this.disabled) {
      this.isPressed = true;
    }
  }

  onDeactivate() {
    this.isPressed = false;
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonComponent, never> = function ButtonComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ButtonComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ButtonComponent,
    'app-button',
    never,
    {},
    {},
    never,
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ButtonComponent,
    selectors: [['app-button']],
    hostAttrs: ['role', 'button', 'tabindex', '0'],
    hostVars: 9,
    hostBindings: function ButtonComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('focus', function ButtonComponent_focus_HostBindingHandler(): any {
          return ctx.onFocus();
        })('keydown.enter', function ButtonComponent_keydown_enter_HostBindingHandler(): any {
          return ctx.onActivate();
        })('keydown.space', function ButtonComponent_keydown_space_HostBindingHandler(): any {
          return ctx.onActivate();
        })('keyup.enter', function ButtonComponent_keyup_enter_HostBindingHandler(): any {
          return ctx.onDeactivate();
        })('keyup.space', function ButtonComponent_keyup_space_HostBindingHandler(): any {
          return ctx.onDeactivate();
        })('blur', function ButtonComponent_blur_HostBindingHandler(): any {
          return ctx.onBlur();
        });
      }
      if (rf & 2) {
        i0.ɵɵattribute('aria-disabled', ctx.disabled);
        i0.ɵɵstyleProp('opacity', ctx.disabled ? 0.5 : 1)('cursor', ctx.cursor);
        i0.ɵɵclassProp('pressed', ctx.isPressed)('focused', ctx.focusedClass);
      }
    },
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function ButtonComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ButtonComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-button',
                standalone: true,
                template: `<ng-content></ng-content>`,
                host: {
                  'role': 'button',
                  'tabindex': '0',
                  '[class.pressed]': 'isPressed',
                  '[style.opacity]': 'disabled ? 0.5 : 1',
                  '[attr.aria-disabled]': 'disabled',
                  '(focus)': 'onFocus()',
                },
              },
            ],
          },
        ],
        null,
        {
          focusedClass: [{ type: HostBinding, args: ['class.focused'] }],
          cursor: [{ type: HostBinding, args: ['style.cursor'] }],
          onActivate: [
            { type: HostListener, args: ['keydown.enter'] },
            { type: HostListener, args: ['keydown.space'] },
          ],
          onDeactivate: [
            { type: HostListener, args: ['keyup.enter'] },
            { type: HostListener, args: ['keyup.space'] },
          ],
          onBlur: [{ type: HostListener, args: ['blur'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ButtonComponent, {
      className: 'ButtonComponent',
      filePath: 'button.component.ts',
      lineNumber: 16,
    });
})();

```