# /out/template_literals.ngtypecheck.ts
```ts
/**
 * TCB for /template_literals.ts
 * @generated
 */

import * as i0 from './template_literals';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + `hello world `;
    '' +
      `hello ${this.name /*321,325*/ /*321,325*/}, it is currently ${this.timeOfDay /*346,355*/ /*346,355*/}!`;
    '' + _pipe1.transform(/*411,420*/ `hello ${this.name /*402,406*/ /*402,406*/}`) /*393,420*/;
    const _t1 /*443,452*/ = `Hello ${this.name /*464,468*/ /*464,468*/}`; /*438,474*/
    '' + _t1 /*489,498*/;
  }
}

```

# /out/template_literals.ts
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
    decls: 9,
    vars: 6,
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
        i0.ɵɵdomElementStart(7, 'h4');
        i0.ɵɵtext(8);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1('No interpolations: ', `hello world `);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'With interpolations: ',
          `hello ${ctx.name}, it is currently ${ctx.timeOfDay}!`,
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1('With pipe: ', i0.ɵɵpipeBind1(6, 4, `hello ${ctx.name}`));
        const insideLet_r1: any = `Hello ${ctx.name}`;
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate1(' Inside let: ', insideLet_r1);
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
        <div>No interpolations: {{ \`hello world \` }}</div>
        <span>With interpolations: {{ \`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
        <p>With pipe: {{\`hello \${name}\` | uppercase}}</p>
        <h4>@let insideLet = \`Hello \${name}\`; Inside let: {{insideLet}}</h4>
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
      filePath: 'template_literals.ts',
      lineNumber: 20,
    });
})();

```