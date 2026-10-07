# /out/src/builders/condition_group_builder.ngtypecheck.ts
```ts
/**
 * TCB for /src/builders/condition_group_builder.ts
 * @generated
 */

import * as i0 from './condition_group_builder';

/*tcb1*/
function _tcb1(this: i0.ConditionGroupBuilder) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*207,274*/ = null! as i0.ConditionGroupBuilder; /*T:VAE*/
    _t1['onCelCodeUpdated'] /*233,249*/
      .subscribe(($event /*T:EP*/): any => {
        this.handleUpdate(/*252,264*/ $event /*265,271*/) /*252,272*/;
      }) /*232,273*/;
  }
}

```

# /out/src/builders/condition_group_builder.ts
```ts
import { Component } from '@angular/core';
import { CommonConditionGroupBuilder } from 'app/common/common_builder';
// @ts-ignore
import * as i0 from '@angular/core';

export class ConditionGroupBuilder extends CommonConditionGroupBuilder {
  handleUpdate(code: string): void {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConditionGroupBuilder, never> = /*@__PURE__*/ ((): any => {
    let ɵConditionGroupBuilder_BaseFactory: any;
    return function ConditionGroupBuilder_Factory(__ngFactoryType__: any): any {
      return (
        ɵConditionGroupBuilder_BaseFactory ||
        (ɵConditionGroupBuilder_BaseFactory = i0.ɵɵgetInheritedFactory(ConditionGroupBuilder))
      )(__ngFactoryType__ || ConditionGroupBuilder);
    };
  })();
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ConditionGroupBuilder,
    'condition-group-builder',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ConditionGroupBuilder,
    selectors: [['condition-group-builder']],
    features: [i0.ɵɵInheritDefinitionFeature],
    decls: 1,
    vars: 0,
    consts: [[3, 'onCelCodeUpdated']],
    template: function ConditionGroupBuilder_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'condition-group-builder', 0);
        i0.ɵɵlistener(
          'onCelCodeUpdated',
          function ConditionGroupBuilder_Template_condition_group_builder_onCelCodeUpdated_0_listener(
            $event: any,
          ): any {
            return ctx.handleUpdate($event);
          },
        );
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [ConditionGroupBuilder],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConditionGroupBuilder,
        [
          {
            type: Component,
            args: [
              {
                standalone: true,
                selector: 'condition-group-builder',
                template: `
        <condition-group-builder (onCelCodeUpdated)="handleUpdate($event)">
        </condition-group-builder>
      `,
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
    i0.ɵsetClassDebugInfo(ConditionGroupBuilder, {
      className: 'ConditionGroupBuilder',
      filePath: 'src/builders/condition_group_builder.ts',
      lineNumber: 12,
    });
})();

```

# /out/src/common/common_builder.ts
```ts
import { Directive, EventEmitter, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export abstract class CommonConditionGroupBuilder {
  onCelCodeUpdated = new EventEmitter<string>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CommonConditionGroupBuilder, never> =
    function CommonConditionGroupBuilder_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || CommonConditionGroupBuilder)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CommonConditionGroupBuilder,
    never,
    never,
    {},
    { 'onCelCodeUpdated': 'onCelCodeUpdated' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: CommonConditionGroupBuilder,
    outputs: { onCelCodeUpdated: 'onCelCodeUpdated' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(CommonConditionGroupBuilder, [{ type: Directive }], null, {
        onCelCodeUpdated: [{ type: Output }],
      });
  }
}

```