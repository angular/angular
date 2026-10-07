# /out/directive_host_binding_slots.ngtypecheck.ts
```ts
/**
 * TCB for /directive_host_binding_slots.ts
 * @generated
 */

import * as i0 from './directive_host_binding_slots';

/*tcb1*/
function _tcb1(this: i0.WidthDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myWidth /*168,181*/ /*168,181*/;
    this.myFooClass /*214,225*/ /*214,225*/;
    this.id /*262,266*/ /*262,266*/;
    this.title /*300,307*/ /*300,307*/;
  }
}

```

# /out/directive_host_binding_slots.ts
```ts
import { Directive, HostBinding } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class WidthDirective {
  myWidth = 200;

  myFooClass = true;

  id = 'some id';

  title = 'some title';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WidthDirective, never> = function WidthDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WidthDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    WidthDirective,
    '[myWidthDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WidthDirective,
    selectors: [['', 'myWidthDir', '']],
    hostVars: 6,
    hostBindings: function WidthDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('id', ctx.id)('title', ctx.title);
        i0.ɵɵstyleProp('width', ctx.myWidth);
        i0.ɵɵclassProp('foo', ctx.myFooClass);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WidthDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myWidthDir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myWidth: [{ type: HostBinding, args: ['style.width'] }],
          myFooClass: [{ type: HostBinding, args: ['class.foo'] }],
          id: [{ type: HostBinding, args: ['id'] }],
          title: [{ type: HostBinding, args: ['title'] }],
        },
      );
  }
}

```