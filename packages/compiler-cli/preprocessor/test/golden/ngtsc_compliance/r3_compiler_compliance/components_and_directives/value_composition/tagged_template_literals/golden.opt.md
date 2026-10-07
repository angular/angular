# /out/tagged_template_literals.ngtypecheck.ts
```ts
/**
 * TCB for /tagged_template_literals.ts
 * @generated
 */

import * as i0 from './tagged_template_literals';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.tag /*252,255*/ /*252,255*/ `hello world `;
    '' +
      this
        .tag /*315,318*/ /*315,318*/ `hello ${this.name /*327,331*/ /*327,331*/}, it is currently ${this.timeOfDay /*352,361*/ /*352,361*/}!`;
    '' +
      _pipe1.transform(
        /*421,430*/ this.tag /*400,403*/ /*400,403*/ `hello ${this.name /*412,416*/ /*412,416*/}`,
      ) /*400,430*/;
  }
}

```

# /out/tagged_template_literals.ts
```ts
import { Component, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class UppercasePipe {
  transform(value: string) {
    return value.toUpperCase();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UppercasePipe, never> = function UppercasePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UppercasePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<UppercasePipe, 'uppercase', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'uppercase', type: UppercasePipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UppercasePipe,
        [{ type: Pipe, args: [{ name: 'uppercase' }] }],
        null,
        null,
      );
  }
}

export class MyApp {
  name = 'Frodo';
  timeOfDay = 'morning';
  tag = (strings: TemplateStringsArray, ...args: string[]) => '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    decls: 7,
    vars: 5,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, 'span');
        i0.ɵɵtext(3);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, 'p');
        i0.ɵɵtext(5);
        i0.ɵɵpipe(6, 'uppercase');
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1('No interpolations: ', ctx.tag`hello world `);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'With interpolations: ',
          ctx.tag`hello ${ctx.name}, it is currently ${ctx.timeOfDay}!`,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1('With pipe: ', i0.ɵɵpipeBind1(6, 3, ctx.tag`hello ${ctx.name}`));
      }
    },
    dependencies: [UppercasePipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: `
        <div>No interpolations: {{ tag\`hello world \` }}</div>
        <span>With interpolations: {{ tag\`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
        <p>With pipe: {{ tag\`hello \${name}\` | uppercase }}</p>
      `,
                imports: [UppercasePipe],
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'tagged_template_literals.ts',
      lineNumber: 19,
    });
})();

```