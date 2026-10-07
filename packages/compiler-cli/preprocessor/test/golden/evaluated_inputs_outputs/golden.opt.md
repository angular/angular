# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './field';

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*132,368*/ = null! as i1.Field; /*T:VAE*/
    _t1.value /*156,161*/ = this.text /*164,168*/ /*164,168*/ /*155,169*/;
    _t1.size /*177,186*/ = 2 /*189,190*/ /*176,191*/;
    _t1.local /*199,209*/ = this.text /*212,216*/ /*212,216*/ /*198,217*/;
    _t1.extra /*225,235*/ = this.text /*238,242*/ /*238,242*/ /*224,243*/;
    _t1.label /*251,261*/ = this.text /*264,268*/ /*264,268*/ /*250,269*/;
    _t1.hint /*277,286*/ = this.text /*289,293*/ /*289,293*/ /*276,294*/;
    _t1['changed'] /*302,313*/
      .subscribe(($event /*T:EP*/): any => {
        this.onChange(/*316,324*/ $event /*325,331*/) /*316,332*/;
      }) /*301,333*/;
    _t1['done'] /*341,350*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .onDone /*353,359*/
          () /*353,361*/;
      }) /*340,362*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { Field } from './field';
// @ts-ignore
import * as i0 from '@angular/core';

export class App {
  text = 'x';
  onChange(value: string) {}
  onDone() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<App, never> = function App_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || App)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    App,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [['app-root']],
    decls: 1,
    vars: 6,
    consts: [
      [
        'field',
        '',
        3,
        'valueChange',
        'doneAlias',
        'value',
        'sizeAlias',
        'localAlias',
        'extraAlias',
        'labelAlias',
        'hintAlias',
      ],
    ],
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener(
          'valueChange',
          function App_Template_div_valueChange_0_listener($event: any): any {
            return ctx.onChange($event);
          },
        )('doneAlias', function App_Template_div_doneAlias_0_listener(): any {
          return ctx.onDone();
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', ctx.text)('sizeAlias', 2)('localAlias', ctx.text)(
          'extraAlias',
          ctx.text,
        )('labelAlias', ctx.text)('hintAlias', ctx.text);
      }
    },
    dependencies: [Field],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        App,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: `
        <div
          field
          [value]="text"
          [sizeAlias]="2"
          [localAlias]="text"
          [extraAlias]="text"
          [labelAlias]="text"
          [hintAlias]="text"
          (valueChange)="onChange($event)"
          (doneAlias)="onDone()"
        ></div>
      `,
                imports: [Field],
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
    i0.ɵsetClassDebugInfo(App, { className: 'App', filePath: 'app.ts', lineNumber: 21 });
})();

```

# /out/field.ts
```ts
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import {
  DONE_ALIAS,
  EXTRA_INPUT,
  FIELD_INPUTS,
  FIELD_OUTPUTS,
  HINT_ALIAS,
  LABEL_ALIAS,
} from './names';
// @ts-ignore
import * as i0 from '@angular/core';

const LOCAL_INPUTS = ['local: localAlias'];

export class Field {
  value = '';
  size = 0;
  local = '';
  extra = '';
  changed = new EventEmitter<string>();

  // Decorator arguments are evaluated too: a bare alias, and an alias inside an options object.
  label = '';
  hint = '';
  done = new EventEmitter<void>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Field, never> = function Field_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Field)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Field,
    '[field]',
    never,
    {
      'value': { 'alias': 'value'; 'required': false };
      'size': { 'alias': 'sizeAlias'; 'required': false };
      'local': { 'alias': 'localAlias'; 'required': false };
      'extra': { 'alias': 'extraAlias'; 'required': true };
      'label': { 'alias': 'labelAlias'; 'required': false };
      'hint': { 'alias': 'hintAlias'; 'required': true };
    },
    { 'changed': 'valueChange'; 'done': 'doneAlias' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Field,
    selectors: [['', 'field', '']],
    inputs: {
      value: 'value',
      size: [0, 'sizeAlias', 'size'],
      local: [0, 'localAlias', 'local'],
      extra: [0, 'extraAlias', 'extra'],
      label: [0, 'labelAlias', 'label'],
      hint: [0, 'hintAlias', 'hint'],
    },
    outputs: { changed: 'valueChange', done: 'doneAlias' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Field,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[field]',
                // The metadata arrays come from constants: imported, spread from this file, and an object
                // entry held in an imported constant.
                inputs: [...FIELD_INPUTS, ...LOCAL_INPUTS, EXTRA_INPUT],
                outputs: FIELD_OUTPUTS,
              },
            ],
          },
        ],
        null,
        {
          label: [{ type: Input, args: [LABEL_ALIAS] }],
          hint: [{ type: Input, args: [{ alias: HINT_ALIAS, required: true }] }],
          done: [{ type: Output, args: [DONE_ALIAS] }],
        },
      );
  }
}

```