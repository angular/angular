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

@Component({
  selector: 'app-root',
  template: '<div>{{ "hello" | myPipe }}</div>',
  standalone: true,
  imports: [MyPipe],
})
class AppComponent {}

/*tcb1*/
function _tcb1(this: AppComponent) {
  if (true) {
    var _pipe1 = null! as MyPipe;
    '' + _pipe1.transform(/*284,290*/ 'hello' /*274,281*/) /*274,290*/;
  }
}

@Component({
  selector: 'app-root',
  template: '<div>{{ "hello" | myPipe }}</div>',
  standalone: true,
  imports: [MyPipe],
})
export class ExportedAppComponent {}

/*tcb2*/
function _tcb2(this: ExportedAppComponent) {
  if (true) {
    var _pipe1 = null! as MyPipe;
    '' + _pipe1.transform(/*436,442*/ 'hello' /*426,433*/) /*426,442*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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
    decls: 3,
    vars: 3,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'myPipe');
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'hello'));
      }
    },
    dependencies: [MyPipe],
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
                template: '<div>{{ "hello" | myPipe }}</div>',
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
      lineNumber: 17,
    });
})();

export class ExportedAppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExportedAppComponent, never> =
    function ExportedAppComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExportedAppComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExportedAppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ExportedAppComponent,
    selectors: [['app-root']],
    decls: 3,
    vars: 3,
    template: function ExportedAppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'myPipe');
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'hello'));
      }
    },
    dependencies: [MyPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExportedAppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<div>{{ "hello" | myPipe }}</div>',
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
    i0.ɵsetClassDebugInfo(ExportedAppComponent, {
      className: 'ExportedAppComponent',
      filePath: 'app.component.ts',
      lineNumber: 25,
    });
})();

```

# /out/app.exported-later.ngtypecheck.ts
```ts
/**
 * TCB for /app.exported-later.ts
 * @generated
 */

import * as i0 from './app.exported-later';

var _pipe1 = null! as i0.MyPipe;

/*tcb1*/
function _tcb1(this: i0.ExportedAppComponent) {
  if (true) {
    '' + _pipe1.transform(/*284,290*/ 'hello' /*274,281*/) /*274,290*/;
  }
}

```

# /out/app.exported-later.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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

class ExportedAppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExportedAppComponent, never> =
    function ExportedAppComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExportedAppComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExportedAppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ExportedAppComponent,
    selectors: [['app-root']],
    decls: 3,
    vars: 3,
    template: function ExportedAppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'myPipe');
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'hello'));
      }
    },
    dependencies: [MyPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExportedAppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<div>{{ "hello" | myPipe }}</div>',
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
    i0.ɵsetClassDebugInfo(ExportedAppComponent, {
      className: 'ExportedAppComponent',
      filePath: 'app.exported-later.ts',
      lineNumber: 17,
    });
})();

// Not exported above but exported here so we should _not_ end up inlining
export { ExportedAppComponent };

```