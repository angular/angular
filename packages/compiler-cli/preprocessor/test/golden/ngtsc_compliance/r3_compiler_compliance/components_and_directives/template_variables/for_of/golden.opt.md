# /out/for_of.ts
```ts
import { Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export interface ForOfContext {
  $implicit: any;
  index: number;
  even: boolean;
  odd: boolean;
}

export class ForOfDirective {
  private previous!: any[];

  constructor(
    private view: ViewContainerRef,
    private template: TemplateRef<any>,
  ) {}

  forOf!: any[];

  ngOnChanges(simpleChanges: SimpleChanges) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never> = function ForOfDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ForOfDirective)(
      i0.ɵɵdirectiveInject(i0.ViewContainerRef),
      i0.ɵɵdirectiveInject(i0.TemplateRef),
    );
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ForOfDirective,
    '[forOf]',
    never,
    { 'forOf': { 'alias': 'forOf'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ForOfDirective,
    selectors: [['', 'forOf', '']],
    inputs: { forOf: 'forOf' },
    standalone: false,
    features: [i0.ɵɵNgOnChangesFeature],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForOfDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[forOf]',
                standalone: false,
              },
            ],
          },
        ],
        (): any => [{ type: ViewContainerRef }, { type: TemplateRef }],
        { forOf: [{ type: Input }] },
      );
  }
}

```