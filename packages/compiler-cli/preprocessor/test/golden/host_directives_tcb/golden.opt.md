# /out/src/app/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/app/app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from '../directives/nested/host_dir';

/*tcb1*/
function _tcb1(this: i0.AppCmp) {
  if (true) {
    var _t1 /*T:HOSTDIR:0*/ /*176,248*/ = null! as i1.HostDir; /*T:VAE*/
    _t1.hostInp /*188,203*/ = this.text /*206,210*/ /*206,210*/ /*187,211*/;
    _t1['hostOut'] /*213,228*/
      .subscribe(($event /*T:EP*/): any => {
        this.onEvent(/*231,238*/ $event /*239,245*/) /*231,246*/;
      }) /*212,247*/;
  }
}

```

# /out/src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { MyDir } from '../directives/dir';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppCmp {
  text = 'hello';
  onEvent(val: string) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppCmp, never> = function AppCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppCmp,
    'app-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppCmp,
    selectors: [['app-cmp']],
    decls: 1,
    vars: 1,
    consts: [['myDir', '', 3, 'myDirAliasedOut', 'myDirAliasedInp']],
    template: function AppCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener(
          'myDirAliasedOut',
          function AppCmp_Template_div_myDirAliasedOut_0_listener($event: any): any {
            return ctx.onEvent($event);
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('myDirAliasedInp', ctx.text);
      }
    },
    dependencies: [MyDir],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-cmp',
                standalone: true,
                imports: [MyDir],
                template:
                  '<div myDir [myDirAliasedInp]="text" (myDirAliasedOut)="onEvent($event)"></div>',
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
    i0.ɵsetClassDebugInfo(AppCmp, {
      className: 'AppCmp',
      filePath: 'src/app/app.component.ts',
      lineNumber: 10,
    });
})();

```

# /out/src/directives/dir.ts
```ts
import { Directive } from '@angular/core';
import { HostDir } from './nested/host_dir';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDir {
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
    {},
    {},
    never,
    never,
    true,
    [
      {
        directive: typeof HostDir;
        inputs: { 'hostInp': 'myDirAliasedInp' };
        outputs: { 'hostOut': 'myDirAliasedOut' };
      },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    selectors: [['', 'myDir', '']],
    features: [
      i0.ɵɵHostDirectivesFeature([
        {
          directive: HostDir,
          inputs: ['hostInp', 'myDirAliasedInp'],
          outputs: ['hostOut', 'myDirAliasedOut'],
        },
      ]),
    ],
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
                hostDirectives: [
                  {
                    directive: HostDir,
                    inputs: ['hostInp: myDirAliasedInp'],
                    outputs: ['hostOut: myDirAliasedOut'],
                  },
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

```

# /out/src/directives/nested/host_dir.ts
```ts
import { Directive, Input, Output, EventEmitter } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostDir {
  hostInp: string = '';
  hostOut = new EventEmitter<string>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never> = function HostDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostDir,
    never,
    never,
    { 'hostInp': { 'alias': 'hostInp'; 'required': false } },
    { 'hostOut': 'hostOut' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostDir,
    inputs: { hostInp: 'hostInp' },
    outputs: { hostOut: 'hostOut' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostDir,
        [
          {
            type: Directive,
            args: [
              {
                standalone: true,
              },
            ],
          },
        ],
        null,
        { hostInp: [{ type: Input }], hostOut: [{ type: Output }] },
      );
  }
}

```