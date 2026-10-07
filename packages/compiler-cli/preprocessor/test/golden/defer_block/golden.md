# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { DeferredComponent } from './deferred.cmp';
import { TestPipe } from './test.pipe';
// @ts-ignore
import * as i0 from '@angular/core';

function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'app-deferred');
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, 'testPipe');
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵpipeBind1(2, 1, 'hello'), ' ');
  }
}
function AppComponent_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder ');
  }
}

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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 4,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 3, 3)(
          1,
          AppComponent_DeferPlaceholder_1_Template,
          1,
          0,
        );
        i0.ɵɵdefer(2, 0, null, null, 1);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [DeferredComponent, TestPipe]),
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
        @defer {
          <app-deferred/>
          {{ 'hello' | testPipe }}
        } @placeholder {
          Placeholder
        }
      `,
                standalone: true,
                imports: [DeferredComponent, TestPipe],
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
      lineNumber: 18,
    });
})();

```

# /out/deferred.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeferredComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeferredComponent, never> =
    function DeferredComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DeferredComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DeferredComponent,
    'app-deferred',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DeferredComponent,
    selectors: [['app-deferred']],
    decls: 1,
    vars: 0,
    template: function DeferredComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Deferred content');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeferredComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-deferred',
                template: 'Deferred content',
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
    i0.ɵsetClassDebugInfo(DeferredComponent, {
      className: 'DeferredComponent',
      filePath: 'deferred.cmp.ts',
      lineNumber: 8,
    });
})();

```

# /out/test.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestPipe implements PipeTransform {
  transform(value: string): string {
    return value + ' piped';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never> = function TestPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, 'testPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'testPipe',
    type: TestPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'testPipe',
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

```