# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myPipe',
  standalone: true,
})
export class MyPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

// Directive-free standalone component whose only dependency is a pipe used inside
// a @defer block, declared in the same file (statically resolved). The reference
// counts only directives in `wholeTemplateUsed`, so this has no directive deps.
// In OPTIMIZE mode (golden.opt.md) it therefore takes the DOM-only fast path
// (ɵɵdomElement*) — this is the pipe-only-@defer guard: it must NOT count the pipe
// used in the @defer block as a directive dependency. In LOCAL mode (golden.md) deps
// can't be inspected, so hasDirectiveDependencies is forced true and the FULL
// instruction set (ɵɵelement*) is emitted regardless.
// https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler/src/render3/view/compiler.ts#L201-L203
@Component({
  selector: 'app-root',
  template: `
    <div>
      @defer {
        {{ 'hello' | myPipe }}
      } @placeholder {
        Placeholder
      }
    </div>
  `,
  standalone: true,
  imports: [MyPipe],
})
class AppComponent {}

/*tcb1*/
function _tcb1(this: AppComponent) {
  if (true) {
    var _pipe1 = null! as MyPipe;
    '' + _pipe1.transform(/*1044,1050*/ 'hello' /*1034,1041*/) /*1034,1050*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_3_DepsFn = (): any => [MyPipe];
function AppComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, 'myPipe');
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵpipeBind1(1, 1, 'hello'), ' ');
  }
}
function AppComponent_DeferPlaceholder_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder ');
  }
}

export class MyPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'myPipe',
    type: MyPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'myPipe',
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

// Directive-free standalone component whose only dependency is a pipe used inside
// a @defer block, declared in the same file (statically resolved). The reference
// counts only directives in `wholeTemplateUsed`, so this has no directive deps.
// In OPTIMIZE mode (golden.opt.md) it therefore takes the DOM-only fast path
// (ɵɵdomElement*) — this is the pipe-only-@defer guard: it must NOT count the pipe
// used in the @defer block as a directive dependency. In LOCAL mode (golden.md) deps
// can't be inspected, so hasDirectiveDependencies is forced true and the FULL
// instruction set (ɵɵelement*) is emitted regardless.
// https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler/src/render3/view/compiler.ts#L201-L203
class AppComponent {
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
    decls: 5,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵdomTemplate(1, AppComponent_Defer_1_Template, 2, 3)(
          2,
          AppComponent_DeferPlaceholder_2_Template,
          1,
          0,
        );
        i0.ɵɵdefer(3, 1, AppComponent_Defer_3_DepsFn, null, 2);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomElementEnd();
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
                template: `
        <div>
          @defer {
            {{ 'hello' | myPipe }}
          } @placeholder {
            Placeholder
          }
        </div>
      `,
                standalone: true,
                imports: [MyPipe],
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
      lineNumber: 34,
    });
})();

```