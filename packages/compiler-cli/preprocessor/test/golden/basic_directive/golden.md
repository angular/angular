# /out/generic.directive.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GenericDirective<T> {
  value: T | null = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GenericDirective<any>, never> =
    function GenericDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || GenericDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    GenericDirective<any>,
    '[appGeneric]',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: GenericDirective,
    selectors: [['', 'appGeneric', '']],
    inputs: { value: 'value' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GenericDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appGeneric]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { value: [{ type: Input }] },
      );
  }
}

```

# /out/highlight.directive.ts
```ts
import { Directive, ElementRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HighlightDirective {
  constructor(private el: ElementRef) {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HighlightDirective, never> =
    function HighlightDirective_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || HighlightDirective)(i0.ɵɵdirectiveInject(i0.ElementRef));
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HighlightDirective,
    '[appHighlight]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HighlightDirective,
    selectors: [['', 'appHighlight', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HighlightDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appHighlight]',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [
          {
            /* @ts-ignore */
            type: ElementRef,
          },
        ],
        null,
      );
  }
}

```