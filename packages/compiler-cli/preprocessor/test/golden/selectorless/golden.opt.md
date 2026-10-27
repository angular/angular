# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';

/*tcb1*/
function _tcb1(this: i0.SelectorlessComp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*458,527*/ = null! as i0.SelectorlessComp; /*T:VAE*/
    _t1.heroName /*477,485*/ = this.hello /*488,493*/ /*488,493*/; /*476,494*/
    _t1['heroSelect'] /*496,506*/
      .subscribe(($event /*T:EP*/): any => {
        this.onSelect(/*509,517*/ $event /*518,524*/); /*509,525*/
      }); /*495,526*/
    var _t2 /*T:DIR:0*/ /*556,573*/ = null! as i0.SelectorlessDir; /*T:VAE*/
    _t2.dirInput /*573,581*/ = 'hello'; /*573,589*/
  }
}

```

# /out/app.ts
```ts
import { Component, Directive, Input, Output, EventEmitter } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SelectorlessComp {
  heroName: string = '';
  heroSelect = new EventEmitter<string>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SelectorlessComp, never> = function SelectorlessComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SelectorlessComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SelectorlessComp,
    'ng-component',
    never,
    { 'heroName': { 'alias': 'heroName'; 'required': false } },
    { 'heroSelect': 'heroSelect' },
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: SelectorlessComp,
      selectors: [['ng-component']],
      inputs: { heroName: 'heroName' },
      outputs: { heroSelect: 'heroSelect' },
      decls: 2,
      vars: 0,
      template: function SelectorlessComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵdomElementStart(0, 'div');
          i0.ɵɵtext(1, 'Selectorless Component');
          i0.ɵɵdomElementEnd();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SelectorlessComp,
        [
          {
            type: Component,
            args: [
              {
                template: '<div>Selectorless Component</div>',
              },
            ],
          },
        ],
        null,
        { heroName: [{ type: Input }], heroSelect: [{ type: Output }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SelectorlessComp, {
      className: 'SelectorlessComp',
      filePath: 'app.ts',
      lineNumber: 6,
    });
})();

export class SelectorlessDir {
  dirInput: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SelectorlessDir, never> = function SelectorlessDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SelectorlessDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SelectorlessDir,
    never,
    never,
    { 'dirInput': { 'alias': 'dirInput'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: SelectorlessDir, inputs: { dirInput: 'dirInput' } });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(SelectorlessDir, [{ type: Directive, args: [{}] }], null, {
        dirInput: [{ type: Input }],
      });
  }
}

export class AppComponent {
  hello = 'world';
  onSelect(hero: string) {}
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComponent,
      selectors: [['app-root']],
      decls: 1,
      vars: 0,
      template: function AppComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵdomElement(0, 'div');
        }
      },
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
                imports: [SelectorlessComp, SelectorlessDir],
                template: `
        <SelectorlessComp [heroName]="hello" (heroSelect)="onSelect($event)"></SelectorlessComp>
        <div @SelectorlessDir(dirInput="hello")></div>
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
      filePath: 'app.ts',
      lineNumber: 25,
    });
})();

```