# /out/extra/pipes/format.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FormatPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FormatPipe, never> = function FormatPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FormatPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<FormatPipe, 'format', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'format',
    type: FormatPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FormatPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'format',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /out/generated/button.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ButtonComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonComponent, never> = function ButtonComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ButtonComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ButtonComponent,
    'btn',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ButtonComponent,
    selectors: [['btn']],
    decls: 2,
    vars: 0,
    template: function ButtonComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button');
        i0.ɵɵtext(1, 'Click');
        i0.ɵɵelementEnd();
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
                selector: 'btn',
                template: '<button>Click</button>',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(ButtonComponent, {
      className: 'ButtonComponent',
      filePath: 'generated/button.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/src/app/parent.component.ts
```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '../../generated/button.component';
import { FormatPipe } from '../../extra/pipes/format.pipe';
// @ts-ignore
import * as i0 from '@angular/core';

export class ParentComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParentComponent, never> = function ParentComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ParentComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ParentComponent,
    'parent-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ParentComponent,
    selectors: [['parent-comp']],
    decls: 4,
    vars: 3,
    template: function ParentComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'btn');
        i0.ɵɵelementStart(1, 'span');
        i0.ɵɵtext(2);
        i0.ɵɵpipe(3, 'format');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, 'hello'));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ParentComponent, [ButtonComponent, FormatPipe]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ParentComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'parent-comp',
                imports: [ButtonComponent, FormatPipe],
                template: '<btn></btn><span>{{ "hello" | format }}</span>',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(ParentComponent, {
      className: 'ParentComponent',
      filePath: 'src/app/parent.component.ts',
      lineNumber: 11,
    });
})();

```