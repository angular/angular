# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { IoArrayComponent } from './io_array.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  handleEmitter() {}
  handleAliasEmitter(v: number) {}
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
    vars: 2,
    consts: [[3, 'emitter', 'publicEmitter', 'name', 'publicName']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'app-io-array', 0);
        i0.ɵɵlistener(
          'emitter',
          function AppComponent_Template_app_io_array_emitter_0_listener(): any {
            return ctx.handleEmitter();
          },
        )(
          'publicEmitter',
          function AppComponent_Template_app_io_array_publicEmitter_0_listener($event: any): any {
            return ctx.handleAliasEmitter($event);
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('name', 'TestName')('publicName', 'TestAlias');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [IoArrayComponent]),
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
                imports: [IoArrayComponent],
                template: `
        <app-io-array
          [name]="'TestName'"
          [publicName]="'TestAlias'"
          (emitter)="handleEmitter()"
          (publicEmitter)="handleAliasEmitter($event)"
        ></app-io-array>
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
      lineNumber: 17,
    });
})();

```

# /out/io_array.component.ts
```ts
import { Component, EventEmitter } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class IoArrayComponent {
  name!: string;
  aliasInput!: string;
  emitter = new EventEmitter<void>();
  aliasOutput = new EventEmitter<number>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IoArrayComponent, never> = function IoArrayComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || IoArrayComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    IoArrayComponent,
    'app-io-array',
    never,
    {
      'name': { 'alias': 'name'; 'required': false };
      'aliasInput': { 'alias': 'publicName'; 'required': false };
    },
    { 'emitter': 'emitter'; 'aliasOutput': 'publicEmitter' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: IoArrayComponent,
    selectors: [['app-io-array']],
    inputs: { name: 'name', aliasInput: [0, 'publicName', 'aliasInput'] },
    outputs: { emitter: 'emitter', aliasOutput: 'publicEmitter' },
    decls: 2,
    vars: 1,
    template: function IoArrayComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1('Hello ', ctx.name, '!');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IoArrayComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-io-array',
                template: '<div>Hello {{name}}!</div>',
                inputs: ['name', 'aliasInput: publicName'],
                outputs: ['emitter', 'aliasOutput: publicEmitter'],
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
    i0.ɵsetClassDebugInfo(IoArrayComponent, {
      className: 'IoArrayComponent',
      filePath: 'io_array.component.ts',
      lineNumber: 10,
    });
})();

```