# /out/hello.component.ngtypecheck.ts
```ts
/**
 * TCB for /hello.component.ts
 * @generated
 */

import * as i0 from './hello.component';

/*tcb1*/
function _tcb1(this: i0.HelloComponent) {
  if (true) {
  }
}

```

# /out/hello.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HelloComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HelloComponent, never> = function HelloComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HelloComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HelloComponent,
    'app-hello',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HelloComponent,
    selectors: [['app-hello']],
    decls: 2,
    vars: 0,
    template: function HelloComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HelloComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-hello',
                template: '<span>Hello</span>',
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
    i0.ɵsetClassDebugInfo(HelloComponent, {
      className: 'HelloComponent',
      filePath: 'hello.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/highlight.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HighlightDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HighlightDirective, never> =
    function HighlightDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HighlightDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HighlightDirective,
    '[appHighlight]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HighlightDirective,
    selectors: [['', 'appHighlight', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HighlightDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appHighlight]',
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

# /out/parent.component.ngtypecheck.ts
```ts
/**
 * TCB for /parent.component.ts
 * @generated
 */

import * as i0 from './parent.component';
import * as i1 from './upcase.pipe';

var _pipe1 = null! as i1.UpcasePipe;

/*tcb1*/
function _tcb1(this: i0.ParentComponent) {
  if (true) {
    '' + _pipe1.transform(/*288,294*/ 'test' /*279,285*/) /*279,294*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.ForwardRefComponent) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.ForwardRefTargetComponent) {
  if (true) {
  }
}

```

# /out/parent.component.ts
```ts
import { Component } from '@angular/core';
import { HelloComponent } from './hello.component';
import { HighlightDirective } from './highlight.directive';
import { UpcasePipe } from './upcase.pipe';
import { forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ParentComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParentComponent, never> = function ParentComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ParentComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ParentComponent,
    'app-parent',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ParentComponent,
    selectors: [['app-parent']],
    decls: 3,
    vars: 3,
    consts: [['appHighlight', '']],
    template: function ParentComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'app-hello', 0);
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'upcase');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'test'));
      }
    },
    dependencies: [HelloComponent, HighlightDirective, UpcasePipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ParentComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-parent',
                template: '<app-hello appHighlight>{{ "test" | upcase }}</app-hello>',
                standalone: true,
                imports: [HelloComponent, HighlightDirective, UpcasePipe],
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
    i0.ɵsetClassDebugInfo(ParentComponent, {
      className: 'ParentComponent',
      filePath: 'parent.component.ts',
      lineNumber: 12,
    });
})();

export class ForwardRefComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardRefComponent, never> =
    function ForwardRefComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ForwardRefComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ForwardRefComponent,
    'test-forward-ref',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ForwardRefComponent,
    selectors: [['test-forward-ref']],
    decls: 1,
    vars: 0,
    template: function ForwardRefComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-forward-ref-target');
      }
    },
    dependencies: (): any => [ForwardRefTargetComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardRefComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-forward-ref',
                standalone: true,
                imports: [forwardRef(() => ForwardRefTargetComponent)],
                template: '<app-forward-ref-target></app-forward-ref-target>',
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
    i0.ɵsetClassDebugInfo(ForwardRefComponent, {
      className: 'ForwardRefComponent',
      filePath: 'parent.component.ts',
      lineNumber: 22,
    });
})();

export class ForwardRefTargetComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardRefTargetComponent, never> =
    function ForwardRefTargetComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ForwardRefTargetComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ForwardRefTargetComponent,
    'app-forward-ref-target',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ForwardRefTargetComponent,
    selectors: [['app-forward-ref-target']],
    decls: 2,
    vars: 0,
    template: function ForwardRefTargetComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'Target');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardRefTargetComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-forward-ref-target',
                standalone: true,
                template: '<span>Target</span>',
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
    i0.ɵsetClassDebugInfo(ForwardRefTargetComponent, {
      className: 'ForwardRefTargetComponent',
      filePath: 'parent.component.ts',
      lineNumber: 29,
    });
})();

```

# /out/upcase.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class UpcasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UpcasePipe, never> = function UpcasePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UpcasePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<UpcasePipe, 'upcase', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'upcase',
    type: UpcasePipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UpcasePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'upcase',
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