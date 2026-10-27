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
    this.isPressed; /*228,237*/ /*228,237*/
    this.disabled /*264,272*/ /*264,272*/ ? 0.5 /*275,278*/ : 1 /*281,282*/; /*264,282*/
    this.disabled; /*314,322*/ /*314,322*/
    var _t1 = document.createElement('app-button'); /*374,389*/
    _t1.addEventListener(/*330,337*/ 'focus', ($event /*T:EP*/): any => {
      this
        .onFocus /*341,348*/
        (); /*341,350*/
    }); /*330,350*/
    _t1.addEventListener(/*666,679*/ 'keydown.enter', ($event /*T:EP*/): any => {
      this
        .onActivate /*717,727*/
        (); /*717,727*/
    }); /*651,681*/
    _t1.addEventListener(/*699,712*/ 'keydown.space', ($event /*T:EP*/): any => {
      this
        .onActivate /*717,727*/
        (); /*717,727*/
    }); /*684,714*/
    _t1.addEventListener(/*815,826*/ 'keyup.enter', ($event /*T:EP*/): any => {
      this
        .onDeactivate /*862,874*/
        (); /*862,874*/
    }); /*800,828*/
    _t1.addEventListener(/*846,857*/ 'keyup.space', ($event /*T:EP*/): any => {
      this
        .onDeactivate /*862,874*/
        (); /*862,874*/
    }); /*831,859*/
    _t1.addEventListener(/*975,979*/ 'blur', ($event /*T:EP*/): any => {
      this
        .onBlur /*984,990*/
        (); /*984,990*/
    }); /*960,981*/
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
      lineNumber: 15,
    });
})();

```