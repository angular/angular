# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './greeting.component';
import * as i2 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*209,606*/ = null! as i1.GreetingComponent; /*T:VAE*/
    _t1.count /*230,235*/ = 1 /*238,239*/ /*229,240*/;
    _t1.displayName /*248,256*/ = 'User' /*259,265*/ /*247,266*/;
    _t1.title /*274,279*/ = 'Hello' /*282,289*/ /*273,290*/;
    _t1.name[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*298,302*/ = 'Signal' /*305,313*/ /*297,314*/;
    _t1.greeting[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*322,334*/ = 'Hi' /*337,341*/ /*321,342*/;
    _t1.id[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*350,352*/ = 123 /*355,358*/ /*349,359*/;
    _t1.value[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*519,524*/ = i2.ɵunwrapWritableSignal(
      this.value /*528,533*/ /*528,533*/,
    ) /*517,534*/;
    _t1.checked[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*543,552*/ = i2.ɵunwrapWritableSignal(
      this.isChecked /*556,565*/ /*556,565*/,
    ) /*541,566*/;
    _t1.selectedId[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*575,585*/ = i2.ɵunwrapWritableSignal(
      this.selectedId /*589,599*/ /*589,599*/,
    ) /*573,600*/;
    _t1['clicked'] /*367,374*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .handleClick /*377,388*/
          () /*377,390*/;
      }) /*366,391*/;
    _t1['change'] /*399,411*/
      .subscribe(($event /*T:EP*/): any => {
        this.handleChange(/*414,426*/ $event /*427,433*/) /*414,434*/;
      }) /*398,435*/;
    _t1['submitted'] /*443,452*/
      .subscribe(($event /*T:EP*/): any => {
        this.handleSubmit(/*455,467*/ $event /*468,474*/) /*455,475*/;
      }) /*442,476*/;
    _t1['cancelled'] /*484,492*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .handleCancel /*495,507*/
          () /*495,509*/;
      }) /*483,510*/;
    _t1['value'] /*519,524*/
      .subscribe(($event /*T:EP*/): any => {
        this.value /*528,533*/ /*528,533*/;
      }) /*517,534*/;
    _t1['checked'] /*543,552*/
      .subscribe(($event /*T:EP*/): any => {
        this.isChecked /*556,565*/ /*556,565*/;
      }) /*541,566*/;
    _t1['selectedId'] /*575,585*/
      .subscribe(($event /*T:EP*/): any => {
        this.selectedId /*589,599*/ /*589,599*/;
      }) /*573,600*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { GreetingComponent } from './greeting.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  value = '';
  isChecked = false;
  selectedId = 1;

  handleClick() {}
  handleChange(v: number) {}
  handleSubmit(v: string) {}
  handleCancel() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 1,
    vars: 9,
    consts: [
      [
        3,
        'clicked',
        'valueChanged',
        'submitted',
        'onCancel',
        'valueChange',
        'isCheckedChange',
        'selectedIdChange',
        'count',
        'userName',
        'title',
        'name',
        'greetingText',
        'id',
        'value',
        'isChecked',
        'selectedId',
      ],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'app-greeting', 0);
        i0.ɵɵlistener(
          'clicked',
          function AppComponent_Template_app_greeting_clicked_0_listener(): any {
            return ctx.handleClick();
          },
        )(
          'valueChanged',
          function AppComponent_Template_app_greeting_valueChanged_0_listener($event: any): any {
            return ctx.handleChange($event);
          },
        )(
          'submitted',
          function AppComponent_Template_app_greeting_submitted_0_listener($event: any): any {
            return ctx.handleSubmit($event);
          },
        )('onCancel', function AppComponent_Template_app_greeting_onCancel_0_listener(): any {
          return ctx.handleCancel();
        });
        i0.ɵɵtwoWayListener(
          'valueChange',
          function AppComponent_Template_app_greeting_valueChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
            return $event;
          },
        )(
          'isCheckedChange',
          function AppComponent_Template_app_greeting_isCheckedChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.isChecked, $event) || (ctx.isChecked = $event);
            return $event;
          },
        )(
          'selectedIdChange',
          function AppComponent_Template_app_greeting_selectedIdChange_0_listener(
            $event: any,
          ): any {
            i0.ɵɵtwoWayBindingSet(ctx.selectedId, $event) || (ctx.selectedId = $event);
            return $event;
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('count', 1)('userName', 'User')('title', 'Hello')('name', 'Signal')(
          'greetingText',
          'Hi',
        )('id', 123);
        i0.ɵɵtwoWayProperty('value', ctx.value)('isChecked', ctx.isChecked)(
          'selectedId',
          ctx.selectedId,
        );
      }
    },
    dependencies: [GreetingComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                standalone: true,
                imports: [GreetingComponent],
                template: `
        <app-greeting
          [count]="1"
          [userName]="'User'"
          [title]="'Hello'"
          [name]="'Signal'"
          [greetingText]="'Hi'"
          [id]="123"
          (clicked)="handleClick()"
          (valueChanged)="handleChange($event)"
          (submitted)="handleSubmit($event)"
          (onCancel)="handleCancel()"
          [(value)]="value"
          [(isChecked)]="isChecked"
          [(selectedId)]="selectedId"
        ></app-greeting>
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 26,
    });
})();

```

# /out/greeting.component.ngtypecheck.ts
```ts
/**
 * TCB for /greeting.component.ts
 * @generated
 */

import * as i0 from './greeting.component';

/*tcb1*/
function _tcb1(this: i0.GreetingComponent) {
  if (true) {
    '' +
      this
        .name /*163,167*/
        () /*163,169*/ +
      this.count /*182,187*/ /*182,187*/;
  }
}

```

# /out/greeting.component.ts
```ts
import { Component, Input, Output, EventEmitter, input, output, model } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GreetingComponent {
  // Decorator-based input
  count: number = 0;

  // Decorator-based input with alias
  displayName: string = '';

  // Decorator-based required input
  title!: string;

  // Signal input
  name = input<string>(
    'World',
    ...((ngDevMode ? [{ debugName: 'name' }] : /* istanbul ignore next */ []) as []),
  );

  // Signal input with alias
  greeting = input<string>('Hi', {
    ...(ngDevMode ? { debugName: 'greeting' } : /* istanbul ignore next */ {}),
    alias: 'greetingText',
  });

  // Required signal input
  id = input.required<number>(
    ...((ngDevMode ? [{ debugName: 'id' }] : /* istanbul ignore next */ []) as []),
  );

  // Decorator-based output
  clicked = new EventEmitter<void>();

  // Decorator-based output with alias
  change = new EventEmitter<number>();

  // Signal output
  submitted = output<string>();

  // Signal output with alias
  cancelled = output<void>({ alias: 'onCancel' });

  // Model (two-way binding)
  value = model<string>(
    '',
    ...((ngDevMode ? [{ debugName: 'value' }] : /* istanbul ignore next */ []) as []),
  );

  // Model with alias
  checked = model<boolean>(false, {
    ...(ngDevMode ? { debugName: 'checked' } : /* istanbul ignore next */ {}),
    alias: 'isChecked',
  });

  // Required model
  selectedId = model.required<number>(
    ...((ngDevMode ? [{ debugName: 'selectedId' }] : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GreetingComponent, never> =
    function GreetingComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || GreetingComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    GreetingComponent,
    'app-greeting',
    never,
    {
      'count': { 'alias': 'count'; 'required': false };
      'displayName': { 'alias': 'userName'; 'required': false };
      'title': { 'alias': 'title'; 'required': true };
      'name': { 'alias': 'name'; 'required': false; 'isSignal': true };
      'greeting': { 'alias': 'greetingText'; 'required': false; 'isSignal': true };
      'id': { 'alias': 'id'; 'required': true; 'isSignal': true };
      'value': { 'alias': 'value'; 'required': false; 'isSignal': true };
      'checked': { 'alias': 'isChecked'; 'required': false; 'isSignal': true };
      'selectedId': { 'alias': 'selectedId'; 'required': true; 'isSignal': true };
    },
    {
      'clicked': 'clicked';
      'change': 'valueChanged';
      'submitted': 'submitted';
      'cancelled': 'onCancel';
      'value': 'valueChange';
      'checked': 'isCheckedChange';
      'selectedId': 'selectedIdChange';
    },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: GreetingComponent,
    selectors: [['app-greeting']],
    inputs: {
      count: 'count',
      displayName: [0, 'userName', 'displayName'],
      title: 'title',
      name: [1, 'name'],
      greeting: [1, 'greetingText', 'greeting'],
      id: [1, 'id'],
      value: [1, 'value'],
      checked: [1, 'isChecked', 'checked'],
      selectedId: [1, 'selectedId'],
    },
    outputs: {
      clicked: 'clicked',
      change: 'valueChanged',
      submitted: 'submitted',
      cancelled: 'onCancel',
      value: 'valueChange',
      checked: 'isCheckedChange',
      selectedId: 'selectedIdChange',
    },
    decls: 2,
    vars: 2,
    template: function GreetingComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate2('Hello, ', ctx.name(), '! Count: ', ctx.count);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GreetingComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-greeting',
                template: '<div>Hello, {{name()}}! Count: {{count}}</div>',
                standalone: true,
              },
            ],
          },
        ],
        null,
        {
          count: [{ type: Input }],
          displayName: [{ type: Input, args: ['userName'] }],
          title: [{ type: Input, args: [{ required: true }] }],
          clicked: [{ type: Output }],
          change: [{ type: Output, args: ['valueChanged'] }],
          name: [{ type: i0.Input, args: [{ isSignal: true, alias: 'name', required: false }] }],
          greeting: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'greetingText', required: false }] },
          ],
          id: [{ type: i0.Input, args: [{ isSignal: true, alias: 'id', required: true }] }],
          value: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'value', required: false }] },
            { type: i0.Output, args: ['valueChange'] },
          ],
          checked: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'isChecked', required: false }] },
            { type: i0.Output, args: ['isCheckedChange'] },
          ],
          selectedId: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'selectedId', required: true }] },
            { type: i0.Output, args: ['selectedIdChange'] },
          ],
          submitted: [{ type: i0.Output, args: ['submitted'] }],
          cancelled: [{ type: i0.Output, args: ['onCancel'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(GreetingComponent, {
      className: 'GreetingComponent',
      filePath: 'greeting.component.ts',
      lineNumber: 8,
    });
})();

```