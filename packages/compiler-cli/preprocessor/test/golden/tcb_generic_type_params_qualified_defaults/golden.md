# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { ProtoBox } from './proto.component';
import { FireTeleportalOutlet } from './teleport';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  myPortal: any;
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
    decls: 2,
    vars: 2,
    consts: [
      [3, 'value'],
      [3, 'fireTeleportalOutlet'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'proto-box', 0)(1, 'div', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', 'test');
        i0.ɵɵadvance();
        i0.ɵɵproperty('fireTeleportalOutlet', ctx.myPortal);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [ProtoBox, FireTeleportalOutlet]),
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
                imports: [ProtoBox, FireTeleportalOutlet],
                template: `
        <proto-box [value]="'test'"></proto-box>
        <div [fireTeleportalOutlet]="myPortal"></div>
      `,
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 14,
    });
})();

```

# /out/proto.component.ts
```ts
import { Component, Input } from '@angular/core';
import { ProtoFormat, ProtoFormatType } from './models';
// @ts-ignore
import * as i0 from '@angular/core';

export class ProtoBox<
  T extends ProtoFormatType[TFormat] = any,
  TFormat extends ProtoFormat = ProtoFormat.JSPB,
> {
  format!: TFormat;
  value!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ProtoBox<any, any>, never> = function ProtoBox_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ProtoBox)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ProtoBox<any, any>,
    'proto-box',
    never,
    {
      'format': { 'alias': 'format'; 'required': false };
      'value': { 'alias': 'value'; 'required': false };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ProtoBox,
    selectors: [['proto-box']],
    inputs: { format: 'format', value: 'value' },
    decls: 0,
    vars: 0,
    template: function ProtoBox_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ProtoBox,
        [
          {
            type: Component,
            args: [
              {
                selector: 'proto-box',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { format: [{ type: Input }], value: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ProtoBox, {
      className: 'ProtoBox',
      filePath: 'proto.component.ts',
      lineNumber: 9,
    });
})();

```

# /out/teleport.d.ts
```ts
import * as i0 from '@angular/core';

type PortalComponentType = any;

export declare class FireTeleportalOutlet<C extends PortalComponentType = any, D = any> {
  portal: C;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FireTeleportalOutlet<any, any>,
    '[fireTeleportalOutlet]',
    never,
    { 'portal': { 'alias': 'fireTeleportalOutlet'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  >;
  static ɵfac: i0.ɵɵFactoryDeclaration<FireTeleportalOutlet<any, any>, never>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FireTeleportalOutlet<any, any>, never> =
    function FireTeleportalOutlet_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FireTeleportalOutlet)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FireTeleportalOutlet<any, any>,
    '[fireTeleportalOutlet]',
    never,
    { 'portal': { 'alias': 'fireTeleportalOutlet'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FireTeleportalOutlet,
    selectors: [['', 'fireTeleportalOutlet', '']],
    inputs: { portal: [0, 'fireTeleportalOutlet', 'portal'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(FireTeleportalOutlet, [{ type: Directive }], null, null);
  }
}

```