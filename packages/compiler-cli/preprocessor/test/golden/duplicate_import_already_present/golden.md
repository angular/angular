# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './first.module';
import * as i2 from './sub/sub.pipe';

var _pipe1 = null! as i1.TransitPipe;
var _pipe2 = null! as i2.SubPipe;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    '' +
      _pipe1.transform(/*367,374*/ 'hello' /*357,364*/) /*357,374*/ +
      _pipe2.transform(/*393,396*/ 'world' /*383,390*/) /*383,396*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { FirstModule } from './first.module';
import { SecondModule } from './second.module';
import { TransitPipe } from '@first/module'; // Imported via alias
import { SubModule, SubPipe } from './sub'; // Imported from directory (Scenario 2)
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './first.module';
// @ts-ignore
import * as i2 from './sub/sub.pipe';

export class AppComponent {
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    standalone: false,
    decls: 4,
    vars: 6,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'transit');
        i0.ɵɵpipe(3, 'sub');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate2(
          '',
          i0.ɵɵpipeBind1(2, 2, 'hello'),
          ' | ',
          i0.ɵɵpipeBind1(3, 4, 'world'),
        );
      }
    },
    dependencies: (): any => [i1.TransitPipe, i2.SubPipe],
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
                template: `<div>{{ 'hello' | transit }} | {{ 'world' | sub }}</div>`,
                standalone: false,
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
      lineNumber: 12,
    });
})();

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof AppComponent],
    [typeof FirstModule, typeof SecondModule, typeof SubModule],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [FirstModule, SecondModule, SubModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [FirstModule, SecondModule, SubModule],
                declarations: [AppComponent],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, {
      declarations: [AppComponent],
      imports: [FirstModule, SecondModule, SubModule],
    });
})();

```

# /out/first.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TransitPipe implements PipeTransform {
  transform(value: string): string {
    return `[Transit] ${value}`;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TransitPipe, never> = function TransitPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TransitPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<TransitPipe, 'transit', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'transit', type: TransitPipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TransitPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'transit',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class FirstModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FirstModule, never> = function FirstModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FirstModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    FirstModule,
    [typeof TransitPipe],
    never,
    [typeof TransitPipe]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FirstModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FirstModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FirstModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [TransitPipe],
                exports: [TransitPipe],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(FirstModule, { declarations: [TransitPipe], exports: [TransitPipe] });
})();

```

# /out/second.module.ts
```ts
import { NgModule } from '@angular/core';
import { FirstModule } from './first.module';
// @ts-ignore
import * as i0 from '@angular/core';

export class SecondModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SecondModule, never> = function SecondModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SecondModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    SecondModule,
    never,
    [typeof FirstModule],
    [typeof FirstModule]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SecondModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SecondModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [FirstModule, FirstModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SecondModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [FirstModule],
                exports: [FirstModule],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(SecondModule, { imports: [FirstModule], exports: [FirstModule] });
})();

```

# /out/sub/sub.module.ts
```ts
import { NgModule } from '@angular/core';
import { SubPipe } from './sub.pipe';
// @ts-ignore
import * as i0 from '@angular/core';

export class SubModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SubModule, never> = function SubModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SubModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<SubModule, [typeof SubPipe], never, [typeof SubPipe]> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SubModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SubModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SubModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [SubPipe],
                exports: [SubPipe],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(SubModule, { declarations: [SubPipe], exports: [SubPipe] });
})();

```

# /out/sub/sub.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SubPipe implements PipeTransform {
  transform(value: string): string {
    return `[Sub] ${value}`;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SubPipe, never> = function SubPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SubPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<SubPipe, 'sub', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'sub',
    type: SubPipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SubPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'sub',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```