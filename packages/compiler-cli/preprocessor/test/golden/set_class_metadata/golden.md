# /out/app.ts
```ts
import {
  Component,
  Directive,
  Injectable,
  Pipe,
  PipeTransform,
  Service,
  NgModule,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MetaComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MetaComponent, never> = function MetaComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MetaComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MetaComponent,
    'meta-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MetaComponent,
    selectors: [['meta-comp']],
    decls: 2,
    vars: 0,
    template: function MetaComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Metadata');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MetaComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'meta-comp',
                template: '<div>Metadata</div>',
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
    i0.ɵsetClassDebugInfo(MetaComponent, {
      className: 'MetaComponent',
      filePath: 'app.ts',
      lineNumber: 8,
    });
})();

export class MetaDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MetaDirective, never> = function MetaDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MetaDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MetaDirective,
    '[metaDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MetaDirective, selectors: [['', 'metaDir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MetaDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[metaDir]',
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

export class MetaService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MetaService, never> = function MetaService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MetaService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MetaService,
    factory: MetaService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MetaService,
        [
          {
            type: Injectable,
            args: [
              {
                providedIn: 'root',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class MetaPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MetaPipe, never> = function MetaPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MetaPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MetaPipe, 'metaPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'metaPipe',
    type: MetaPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MetaPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'metaPipe',
                pure: true,
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

export class NoArgDecorator {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NoArgDecorator, never> = function NoArgDecorator_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NoArgDecorator)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineService({
    token: NoArgDecorator,
    factory: NoArgDecorator.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(NoArgDecorator, [{ type: Service }], null, null);
  }
}

export class MultiMetaComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MultiMetaComponent, never> =
    function MultiMetaComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MultiMetaComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MultiMetaComponent,
    'multi-meta',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MultiMetaComponent,
    selectors: [['multi-meta']],
    decls: 2,
    vars: 0,
    template: function MultiMetaComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Multi');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MultiMetaComponent,
    factory: MultiMetaComponent.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MultiMetaComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'multi-meta',
                template: '<div>Multi</div>',
                standalone: true,
              },
            ],
          },
          { type: Injectable },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MultiMetaComponent, {
      className: 'MultiMetaComponent',
      filePath: 'app.ts',
      lineNumber: 41,
    });
})();

export class MetaNgModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MetaNgModule, never> = function MetaNgModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MetaNgModule)();
  };
  // @ts-ignore
  static ɵmod: MetaNgModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MetaNgModule,
    id: 'MetaNgModuleId',
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MetaNgModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MetaDirective],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MetaNgModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MetaDirective],
                exports: [MetaDirective],
                id: 'MetaNgModuleId',
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
    i0.ɵɵsetNgModuleScope(MetaNgModule, {
      declarations: [MetaDirective],
      exports: [MetaDirective],
    });
})();
i0.ɵɵregisterNgModuleType(MetaNgModule, 'MetaNgModuleId');

```