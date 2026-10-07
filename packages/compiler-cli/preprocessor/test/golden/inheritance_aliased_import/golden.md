# /out/app.ts
```ts
import { Component } from '@angular/core';
import { ChildComponent } from './child';
import { Widget } from './widget';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  currentValue = '';
  currentItems: string[] = [];
  onValueChange(value: string) {}
  onSelected(index: number) {}
  onItemsSubmit(items: string[]) {}
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
      [3, 'valueChange', 'selected', 'value'],
      [3, 'itemsSubmit', 'items'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'child-comp', 0);
        i0.ɵɵlistener(
          'valueChange',
          function AppComponent_Template_child_comp_valueChange_0_listener($event: any): any {
            return ctx.onValueChange($event);
          },
        )(
          'selected',
          function AppComponent_Template_child_comp_selected_0_listener($event: any): any {
            return ctx.onSelected($event);
          },
        );
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, 'app-widget', 1);
        i0.ɵɵlistener(
          'itemsSubmit',
          function AppComponent_Template_app_widget_itemsSubmit_1_listener($event: any): any {
            return ctx.onItemsSubmit($event);
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', ctx.currentValue);
        i0.ɵɵadvance();
        i0.ɵɵproperty('items', ctx.currentItems);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [ChildComponent, Widget]),
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
        <child-comp
          [value]="currentValue"
          (valueChange)="onValueChange($event)"
          (selected)="onSelected($event)"
        ></child-comp>
        <app-widget
          [items]="currentItems"
          (itemsSubmit)="onItemsSubmit($event)"
        ></app-widget>
      `,
                imports: [ChildComponent, Widget],
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
      filePath: 'app.ts',
      lineNumber: 20,
    });
})();

```

# /out/base.ts
```ts
import { Directive, EventEmitter, Input, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BaseDirective {
  value = '';
  readonly valueChange = new EventEmitter<string>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BaseDirective, never> = function BaseDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BaseDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BaseDirective,
    never,
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    { 'valueChange': 'valueChange' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BaseDirective,
    inputs: { value: 'value' },
    outputs: { valueChange: 'valueChange' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(BaseDirective, [{ type: Directive }], null, {
        value: [{ type: Input }],
        valueChange: [{ type: Output }],
      });
  }
}

```

# /out/child.ts
```ts
import { Component, EventEmitter, Output } from '@angular/core';
import { BaseDirective as AliasedBase } from './base';
// @ts-ignore
import * as i0 from '@angular/core';

export class ChildComponent extends AliasedBase {
  readonly selected = new EventEmitter<number>();
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
    'child-comp',
    never,
    {},
    { 'selected': 'selected' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ChildComponent,
    selectors: [['child-comp']],
    outputs: { selected: 'selected' },
    features: [i0.ɵɵInheritDefinitionFeature],
    decls: 0,
    vars: 0,
    template: function ChildComponent_Template(rf: number, ctx: any): any {},
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
                selector: 'child-comp',
                template: '',
              },
            ],
          },
        ],
        null,
        { selected: [{ type: Output }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ChildComponent, {
      className: 'ChildComponent',
      filePath: 'child.ts',
      lineNumber: 8,
    });
})();

```

# /out/widget.ts
```ts
import { Component } from '@angular/core';
import { Widget as BaseWidget } from 'some-lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class Widget extends BaseWidget {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Widget, never> = /*@__PURE__*/ ((): any => {
    let ɵWidget_BaseFactory: any;
    return function Widget_Factory(__ngFactoryType__: any): any {
      return (ɵWidget_BaseFactory || (ɵWidget_BaseFactory = i0.ɵɵgetInheritedFactory(Widget)))(
        __ngFactoryType__ || Widget,
      );
    };
  })();
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Widget,
    'app-widget',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Widget,
    selectors: [['app-widget']],
    features: [i0.ɵɵInheritDefinitionFeature],
    decls: 0,
    vars: 0,
    template: function Widget_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Widget,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-widget',
                template: '',
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
    i0.ɵsetClassDebugInfo(Widget, { className: 'Widget', filePath: 'widget.ts', lineNumber: 8 });
})();

```