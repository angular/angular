# /out/barrel.ts
```ts
import { NgModule } from '@angular/core';
import { Dir } from './lib/index';
// @ts-ignore
import * as i0 from '@angular/core';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: M =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [Dir, Dir] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M,
        [{ type: NgModule, args: [{ imports: [Dir], exports: [Dir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [Dir], exports: [Dir] });
})();

```

# /out/charts/dir.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AwesomechartsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AwesomechartsModule, never> =
    function AwesomechartsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AwesomechartsModule)();
    };
  // @ts-ignore
  static ɵmod: AwesomechartsModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AwesomechartsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AwesomechartsModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(AwesomechartsModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class Other {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Other, never> = function Other_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Other)();
  };
  // @ts-ignore
  static ɵmod: Other =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Other });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Other> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Other, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```

# /out/consumer.ts
```ts
import { Component } from '@angular/core';
import { UpstreamModule } from 'google3/my/upstream/upstream-module';
// @ts-ignore
import * as i0 from '@angular/core';

export class ConsumerComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConsumerComponent, never> =
    function ConsumerComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ConsumerComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ConsumerComponent,
    'consumer-cmp',
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
      type: ConsumerComponent,
      selectors: [['consumer-cmp']],
      decls: 1,
      vars: 0,
      consts: [['dirA', '']],
      template: function ConsumerComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(ConsumerComponent, [UpstreamModule]),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConsumerComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'consumer-cmp',
                template: '<div dirA></div>',
                imports: [UpstreamModule],
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
    i0.ɵsetClassDebugInfo(ConsumerComponent, {
      className: 'ConsumerComponent',
      filePath: 'consumer.ts',
      lineNumber: 9,
    });
})();

```

# /out/lib/dir.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never> = function Dir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, '[dir]', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: Dir, selectors: [['', 'dir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Dir, [{ type: Directive, args: [{ selector: '[dir]' }] }], null, null);
  }
}

```

# /out/my/upstream/directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class DirectiveA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never> = function DirectiveA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveA,
    '[dirA]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: DirectiveA,
      selectors: [['', 'dirA', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveA,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirA]',
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

export { DirectiveA as PublicDirectiveA };

```

# /out/my/upstream/upstream-module.ts
```ts
import { NgModule } from '@angular/core';
import { PublicDirectiveA } from './directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class UpstreamModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UpstreamModule, never> = function UpstreamModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UpstreamModule)();
  };
  // @ts-ignore
  static ɵmod: UpstreamModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: UpstreamModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<UpstreamModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [PublicDirectiveA] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UpstreamModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [PublicDirectiveA],
                exports: [PublicDirectiveA],
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
    i0.ɵɵsetNgModuleScope(UpstreamModule, {
      declarations: [PublicDirectiveA],
      exports: [PublicDirectiveA],
    });
})();

```

# /out/namespace_param.ts
```ts
import { Component, Input } from '@angular/core';
import * as api from './api';
// @ts-ignore
import * as i0 from '@angular/core';

export interface Mapped {
  id: string;
}

export function map(v: api.Item[]): Mapped[] {
  return v;
}

export class C {
  items: Mapped[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C, never> = function C_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || C)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C,
    'c',
    never,
    { 'items': { 'alias': 'items'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C,
      selectors: [['c']],
      inputs: { items: [2, 'items', 'items', map] },
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  // @ts-ignore
  declare static ngAcceptInputType_items: Parameters<typeof map>[0];
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '' }] }],
        null,
        { items: [{ type: Input, args: [{ transform: map }] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'namespace_param.ts', lineNumber: 13 });
})();

```

# /out/paths_alias.ts
```ts
import { NgModule } from '@angular/core';
import { AwesomechartsModule as Ng2AwesomechartsModule } from 'charts-alias';
import { Other } from 'charts-dir';
// @ts-ignore
import * as i0 from '@angular/core';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: M =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [Ng2AwesomechartsModule, Other] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M,
        [{ type: NgModule, args: [{ imports: [Ng2AwesomechartsModule, Other] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [Ng2AwesomechartsModule, Other] });
})();

```