# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './pipes';

var _pipe1 = null! as i1.ShoutPipe;
var _pipe2 = null! as i1.WhisperPipe;

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    '' +
      _pipe1.transform(/*158,163*/ this.greeting /*147,155*/ /*147,155*/) /*147,163*/ +
      _pipe2.transform(/*181,188*/ this.greeting /*170,178*/ /*170,178*/) /*170,188*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { ShoutPipe, WhisperPipe } from './pipes';
// @ts-ignore
import * as i0 from '@angular/core';

export class App {
  greeting = 'hello';
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
    decls: 3,
    vars: 6,
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'shout');
        i0.ɵɵpipe(2, 'whisper');
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate2(
          '',
          i0.ɵɵpipeBind1(1, 2, ctx.greeting),
          ' ',
          i0.ɵɵpipeBind1(2, 4, ctx.greeting),
        );
      }
    },
    dependencies: [ShoutPipe, WhisperPipe],
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
                template: '{{ greeting | shout }} {{ greeting | whisper }}',
                imports: [ShoutPipe, WhisperPipe],
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
    i0.ɵsetClassDebugInfo(App, { className: 'App', filePath: 'app.ts', lineNumber: 9 });
})();

```

# /out/pipes.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
import { PIPE_NAME, PREFIX } from './names';
// @ts-ignore
import * as i0 from '@angular/core';

// The name comes from an imported constant: ngtsc's partial evaluator follows the import.
export class ShoutPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ShoutPipe, never> = function ShoutPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ShoutPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<ShoutPipe, 'shout', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'shout',
    type: ShoutPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ShoutPipe, [{ type: Pipe, args: [{ name: PIPE_NAME }] }], null, null);
  }
}

// An expression over an imported constant folds as well.
export class WhisperPipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WhisperPipe, never> = function WhisperPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WhisperPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<WhisperPipe, 'whisper', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'whisper',
    type: WhisperPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WhisperPipe,
        [{ type: Pipe, args: [{ name: PREFIX + 'isper' }] }],
        null,
        null,
      );
  }
}

```