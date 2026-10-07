# /out/test.ts
```ts
import { Component, Directive, Input, Output, EventEmitter } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDir {
  myDirInput: string = '';
  myDirOutput = new EventEmitter<string>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never> = function MyDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDir,
    '[myDir]',
    never,
    { 'myDirInput': { 'alias': 'myDirInput'; 'required': false } },
    { 'myDirOutput': 'myDirOutput' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    selectors: [['', 'myDir', '']],
    inputs: { myDirInput: 'myDirInput' },
    outputs: { myDirOutput: 'myDirOutput' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { myDirInput: [{ type: Input }], myDirOutput: [{ type: Output }] },
      );
  }
}

export class MyOtherDir {
  myOtherDirInput: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherDir, never> = function MyOtherDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyOtherDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyOtherDir,
    '[myOtherDir]',
    never,
    { 'myOtherDirInput': { 'alias': 'myOtherDirInput'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyOtherDir,
    selectors: [['', 'myOtherDir', '']],
    inputs: { myOtherDirInput: 'myOtherDirInput' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyOtherDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myOtherDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { myOtherDirInput: [{ type: Input }] },
      );
  }
}

export class MyComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never> = function MyComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComp,
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      {
        directive: typeof MyDir;
        inputs: { 'myDirInput': 'myDirInputAlias' };
        outputs: { 'myDirOutput': 'myDirOutputAlias' };
      },
      { directive: typeof MyOtherDir; inputs: {}; outputs: {} },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [['my-comp']],
    features: [
      i0.ɵɵHostDirectivesFeature([
        {
          directive: MyDir,
          inputs: ['myDirInput', 'myDirInputAlias'],
          outputs: ['myDirOutput', 'myDirOutputAlias'],
        },
        MyOtherDir,
      ]),
    ],
    decls: 2,
    vars: 0,
    template: function MyComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp',
                standalone: true,
                template: '<div>Hello</div>',
                hostDirectives: [
                  {
                    directive: MyDir,
                    inputs: ['myDirInput: myDirInputAlias'],
                    outputs: ['myDirOutput: myDirOutputAlias'],
                  },
                  MyOtherDir,
                ],
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
    i0.ɵsetClassDebugInfo(MyComp, { className: 'MyComp', filePath: 'test.ts', lineNumber: 33 });
})();

```