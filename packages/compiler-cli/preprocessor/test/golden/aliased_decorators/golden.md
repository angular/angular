# /out/component.ts
```ts
import {
  Component as AngularComponent,
  Inject as AngularInject,
  Optional as AngularOptional,
  Self as AngularSelf,
  InjectionToken,
} from '@angular/core';
import { MyDirective } from './directive';
import { MyPipe } from './pipe';
// @ts-ignore
import * as i0 from '@angular/core';

export const MY_TOKEN = new InjectionToken<string>('MY_TOKEN');

export class MyComponent {
  constructor(public service: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, [{ optional: true; self: true }]> =
    function MyComponent_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || MyComponent)(i0.ɵɵdirectiveInject(MY_TOKEN, 10));
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-comp']],
    decls: 3,
    vars: 3,
    consts: [['myDir', '']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'myPipe');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'test'));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyComponent, [MyDirective, MyPipe]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: AngularComponent,
            args: [
              {
                selector: 'my-comp',
                standalone: true,
                imports: [MyDirective, MyPipe],
                template: '<div myDir>{{ "test" | myPipe }}</div>',
              },
            ],
          },
        ],
        (): any => [
          {
            type: undefined,
            decorators: [
              { type: AngularInject, args: [MY_TOKEN] },
              { type: AngularOptional },
              { type: AngularSelf },
            ],
          },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'component.ts',
      lineNumber: 19,
    });
})();

```

# /out/directive.ts
```ts
import {
  Directive as AngularDirective,
  Input as AngularInput,
  Output as AngularOutput,
  HostBinding as AngularHostBinding,
  HostListener as AngularHostListener,
  EventEmitter,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  boundInput: string = '';
  boundOutput = new EventEmitter<void>();
  isActive = true;
  onClick(e: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    '[myDir]',
    never,
    {
      'declaredInput': { 'alias': 'dirInput'; 'required': false };
      'boundInput': { 'alias': 'boundInput'; 'required': false };
    },
    { 'declaredOutput': 'dirOutput'; 'boundOutput': 'boundOutput' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['', 'myDir', '']],
    hostVars: 2,
    hostBindings: function MyDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('click', function MyDirective_click_HostBindingHandler($event: any): any {
          return ctx.onClick($event);
        });
      }
      if (rf & 2) {
        i0.ɵɵclassProp('active', ctx.isActive);
      }
    },
    inputs: { declaredInput: [0, 'dirInput', 'declaredInput'], boundInput: 'boundInput' },
    outputs: { declaredOutput: 'dirOutput', boundOutput: 'boundOutput' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: AngularDirective,
            args: [
              {
                selector: '[myDir]',
                standalone: true,
                inputs: ['declaredInput: dirInput'],
                outputs: ['declaredOutput: dirOutput'],
              },
            ],
          },
        ],
        null,
        {
          boundInput: [{ type: AngularInput }],
          boundOutput: [{ type: AngularOutput }],
          isActive: [{ type: AngularHostBinding, args: ['class.active'] }],
          onClick: [{ type: AngularHostListener, args: ['click', ['$event']] }],
        },
      );
  }
}

```

# /out/injectable.ts
```ts
import {
  Injectable as AngularInjectable,
  Inject as AngularInject,
  Optional as AngularOptional,
  InjectionToken,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const DEP_TOKEN = new InjectionToken<string>('DEP_TOKEN');

export class MyInjectable {
  constructor(public dep: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyInjectable, [{ optional: true }]> =
    function MyInjectable_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || MyInjectable)(i0.ɵɵinject(DEP_TOKEN, 8));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyInjectable,
    factory: MyInjectable.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyInjectable,
        [{ type: AngularInjectable }],
        (): any => [
          {
            type: undefined,
            decorators: [{ type: AngularOptional }, { type: AngularInject, args: [DEP_TOKEN] }],
          },
        ],
        null,
      );
  }
}

```

# /out/namespaced.ts
```ts
import * as core from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const NAMESPACED_TOKEN = new core.InjectionToken<string>('NAMESPACED_TOKEN');

export class NamespacedService {
  constructor(public dep: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NamespacedService, [{ optional: true }]> =
    function NamespacedService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || NamespacedService)(i0.ɵɵinject(NAMESPACED_TOKEN, 8));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: NamespacedService,
    factory: NamespacedService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NamespacedService,
        [{ type: core.Injectable }],
        (): any => [
          {
            type: undefined,
            decorators: [{ type: core.Inject, args: [NAMESPACED_TOKEN] }, { type: core.Optional }],
          },
        ],
        null,
      );
  }
}

export class NamespacedDirective {
  prop: string = '';
  done = new core.EventEmitter<void>();
  role = 'button';
  onFocus() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NamespacedDirective, never> =
    function NamespacedDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NamespacedDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NamespacedDirective,
    '[namespacedDir]',
    never,
    { 'prop': { 'alias': 'prop'; 'required': false } },
    { 'done': 'done' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NamespacedDirective,
    selectors: [['', 'namespacedDir', '']],
    hostVars: 1,
    hostBindings: function NamespacedDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('focus', function NamespacedDirective_focus_HostBindingHandler(): any {
          return ctx.onFocus();
        });
      }
      if (rf & 2) {
        i0.ɵɵattribute('role', ctx.role);
      }
    },
    inputs: { prop: 'prop' },
    outputs: { done: 'done' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NamespacedDirective,
        [
          {
            type: core.Directive,
            args: [
              {
                selector: '[namespacedDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        {
          prop: [{ type: core.Input }],
          done: [{ type: core.Output }],
          role: [{ type: core.HostBinding, args: ['attr.role'] }],
          onFocus: [{ type: core.HostListener, args: ['focus'] }],
        },
      );
  }
}

```

# /out/ngmodule.ts
```ts
import { NgModule as AngularNgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyNgModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyNgModule, never> = function MyNgModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyNgModule)();
  };
  // @ts-ignore
  static ɵmod: MyNgModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyNgModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyNgModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyNgModule, [{ type: AngularNgModule, args: [{}] }], null, null);
  }
}

```

# /out/pipe.ts
```ts
import { Pipe as AngularPipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyPipe {
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
            type: AngularPipe,
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

```

# /out/service.ts
```ts
import { Service as AngularService, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ParentService {
  getData(): string {
    return 'hello';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParentService, never> = function ParentService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ParentService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineService({
    token: ParentService,
    factory: ParentService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ParentService, [{ type: AngularService }], null, null);
  }
}

export class ChildService extends ParentService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildService, never> = /*@__PURE__*/ ((): any => {
    let ɵChildService_BaseFactory: any;
    return function ChildService_Factory(__ngFactoryType__: any): any {
      return (
        ɵChildService_BaseFactory ||
        (ɵChildService_BaseFactory = i0.ɵɵgetInheritedFactory(ChildService))
      )(__ngFactoryType__ || ChildService);
    };
  })();
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ChildService,
    factory: ChildService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ChildService, [{ type: Injectable }], null, null);
  }
}

```