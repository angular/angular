# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { ChildComponent, SettingComponent } from './child.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  myCount = 1;
  myValue = 'hello';
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
    decls: 2,
    vars: 2,
    consts: [
      [3, 'counterChange', 'counter'],
      [3, 'valueChange', 'value'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'child-cmp', 0);
        i0.ɵɵtwoWayListener(
          'counterChange',
          function AppComponent_Template_child_cmp_counterChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.myCount, $event) || (ctx.myCount = $event);
            return $event;
          },
        );
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, 'setting-cmp', 1);
        i0.ɵɵtwoWayListener(
          'valueChange',
          function AppComponent_Template_setting_cmp_valueChange_1_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.myValue, $event) || (ctx.myValue = $event);
            return $event;
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty('counter', ctx.myCount);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('value', ctx.myValue);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [ChildComponent, SettingComponent]),
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
                template: `
        <child-cmp [(counter)]="myCount" />
        <setting-cmp [(value)]="myValue" />
      `,
                standalone: true,
                imports: [ChildComponent, SettingComponent],
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
      lineNumber: 13,
    });
})();

```

# /out/base.directive.ts
```ts
import { Directive, model } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BaseDir {
  counter = model(
    0,
    ...((ngDevMode ? [{ debugName: 'counter' }] : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BaseDir, never> = function BaseDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BaseDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BaseDir,
    '[baseDir]',
    never,
    { 'counter': { 'alias': 'counter'; 'required': false; 'isSignal': true } },
    { 'counter': 'counterChange' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BaseDir,
    selectors: [['', 'baseDir', '']],
    inputs: { counter: [1, 'counter'] },
    outputs: { counter: 'counterChange' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BaseDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[baseDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        {
          counter: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'counter', required: false }] },
            { type: i0.Output, args: ['counterChange'] },
          ],
        },
      );
  }
}

```

# /out/child.component.ts
```ts
import { Component } from '@angular/core';
import { BaseDir } from './base.directive';
import { BaseSetting } from 'external-lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class ChildComponent extends BaseDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent, never> = /*@__PURE__*/ ((): any => {
    let ɵChildComponent_BaseFactory: any;
    return function ChildComponent_Factory(__ngFactoryType__: any): any {
      return (
        ɵChildComponent_BaseFactory ||
        (ɵChildComponent_BaseFactory = i0.ɵɵgetInheritedFactory(ChildComponent))
      )(__ngFactoryType__ || ChildComponent);
    };
  })();
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChildComponent,
    'child-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ChildComponent,
    selectors: [['child-cmp']],
    features: [i0.ɵɵInheritDefinitionFeature],
    decls: 2,
    vars: 0,
    template: function ChildComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Child');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'child-cmp',
                template: '<span>Child</span>',
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
    i0.ɵsetClassDebugInfo(ChildComponent, {
      className: 'ChildComponent',
      filePath: 'child.component.ts',
      lineNumber: 10,
    });
})();

export class SettingComponent extends BaseSetting<string> {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SettingComponent, never> = /*@__PURE__*/ ((): any => {
    let ɵSettingComponent_BaseFactory: any;
    return function SettingComponent_Factory(__ngFactoryType__: any): any {
      return (
        ɵSettingComponent_BaseFactory ||
        (ɵSettingComponent_BaseFactory = i0.ɵɵgetInheritedFactory(SettingComponent))
      )(__ngFactoryType__ || SettingComponent);
    };
  })();
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SettingComponent,
    'setting-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SettingComponent,
    selectors: [['setting-cmp']],
    features: [i0.ɵɵInheritDefinitionFeature],
    decls: 2,
    vars: 0,
    template: function SettingComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Setting');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SettingComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'setting-cmp',
                template: '<span>Setting</span>',
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
    i0.ɵsetClassDebugInfo(SettingComponent, {
      className: 'SettingComponent',
      filePath: 'child.component.ts',
      lineNumber: 17,
    });
})();

```