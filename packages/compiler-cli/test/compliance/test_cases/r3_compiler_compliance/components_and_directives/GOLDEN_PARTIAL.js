/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingComp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingComp, isStandalone: false, selector: "host-binding-comp", ngImport: i0, template: `
    <my-forward-directive></my-forward-directive>
  `, isInline: true, dependencies: [{ kind: "directive", type: i0.forwardRef(() => MyForwardDirective), selector: "my-forward-directive" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'host-binding-comp',
                    template: `
    <my-forward-directive></my-forward-directive>
  `,
                    standalone: false
                }]
        }] });
class MyForwardDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyForwardDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyForwardDirective, isStandalone: false, selector: "my-forward-directive", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyForwardDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'my-forward-directive',
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingComp, MyForwardDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingComp, MyForwardDirective] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HostBindingComp, "host-binding-comp", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingComp, typeof MyForwardDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_pipe.js
 ****************************************************************************************************/
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingComp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingComp, isStandalone: false, selector: "host-binding-comp", ngImport: i0, template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
  `, isInline: true, dependencies: [{ kind: "pipe", type: i0.forwardRef(() => MyForwardPipe), name: "my_forward_pipe" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'host-binding-comp',
                    template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
  `,
                    standalone: false
                }]
        }] });
class MyForwardPipe {
    transform(param) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyForwardPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyForwardPipe, isStandalone: false, name: "my_forward_pipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyForwardPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'my_forward_pipe',
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingComp, MyForwardPipe] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingComp, MyForwardPipe] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HostBindingComp, "host-binding-comp", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingComp, typeof MyForwardPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: export_as.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, isStandalone: false, selector: "[some-directive]", exportAs: ["someDir", "otherDir"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[some-directive]', exportAs: 'someDir, otherDir',
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: export_as.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[some-directive]", ["someDir", "otherDir"], {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_selector.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class AbstractDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AbstractDirective, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractDirective, decorators: [{
            type: Directive
        }] });

/****************************************************************************************************
 * PARTIAL FILE: no_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class AbstractDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<AbstractDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<AbstractDirective, never, never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: constant_object_literals.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComp {
    prop;
    otherProp;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeComp, isStandalone: false, selector: "some-comp", inputs: { prop: "prop", otherProp: "otherProp" }, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'some-comp', template: '',
                    standalone: false
                }]
        }], propDecorators: { prop: [{
                type: Input
            }], otherProp: [{
                type: Input
            }] } });
export class MyApp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>', isInline: true, dependencies: [{ kind: "component", type: SomeComp, selector: "some-comp", inputs: ["prop", "otherProp"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>',
                    standalone: false
                }]
        }] });
export class MyMod {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [SomeComp, MyApp] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeComp, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: constant_object_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeComp {
    prop: any;
    otherProp: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeComp, "some-comp", never, { "prop": { "alias": "prop"; "required": false; }; "otherProp": { "alias": "otherProp"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof SomeComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: constant_array_literals.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComp {
    prop;
    otherProp;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeComp, isStandalone: false, selector: "some-comp", inputs: { prop: "prop", otherProp: "otherProp" }, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'some-comp', template: '',
                    standalone: false
                }]
        }], propDecorators: { prop: [{
                type: Input
            }], otherProp: [{
                type: Input
            }] } });
export class MyApp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: '<some-comp [prop]="[]" [otherProp]="[0, 1, 2]"></some-comp>', isInline: true, dependencies: [{ kind: "component", type: SomeComp, selector: "some-comp", inputs: ["prop", "otherProp"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: '<some-comp [prop]="[]" [otherProp]="[0, 1, 2]"></some-comp>',
                    standalone: false
                }]
        }] });
export class MyMod {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [MyApp, SomeComp] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp, SomeComp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: constant_array_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeComp {
    prop: any;
    otherProp: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeComp, "some-comp", never, { "prop": { "alias": "prop"; "required": false; }; "otherProp": { "alias": "otherProp"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof MyApp, typeof SomeComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_empty.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: {}}"></div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: {}}"></div>
  `,
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_empty.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: array_literals_null_vs_empty.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: []}"></div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: []}"></div>
  `,
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: array_literals_null_vs_empty.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_function.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    getFoo() {
        return 'foo!';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: getFoo()}"></div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: getFoo()}"></div>
  `,
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_function.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    getFoo(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: custom_decorator_es5.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
var token = new InjectionToken('token');
export function Custom() {
    return function (target) { };
}
var Comp = /** @class */ (function () {
    function Comp() {
    }
    Comp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    Comp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Comp, isStandalone: true, selector: "ng-component", providers: [{ provide: token, useExisting: Comp }], ngImport: i0, template: '', isInline: true });
    Comp = __decorate([
        Custom()
    ], Comp);
    return Comp;
}());
export { Comp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, decorators: [{
            type: Component,
            args: [{
                    template: '',
                    providers: [{ provide: token, useExisting: Comp }],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: custom_decorator_es5.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare function Custom(): (target: any) => void;
export declare class Comp {
    static ɵfac: i0.ɵɵFactoryDeclaration<Comp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Comp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_empty_binding.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-app", ngImport: i0, template: '<ng-template [id]=""></ng-template>', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '<ng-template [id]=""></ng-template>',
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_template_empty_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: non_literal_template.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
const myTemplate = `<div *ngIf="show">Hello</div>`;
export class TestCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: false, selector: "test-cmp", ngImport: i0, template: "<div *ngIf=\"show\">Hello</div>", isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp', template: myTemplate,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: non_literal_template.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: non_literal_template_with_substitution.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
const greeting = 'Hello!';
const myTemplate = `<div *ngIf="show">${greeting}</div>`;
export class TestCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: false, selector: "test-cmp", ngImport: i0, template: "<div *ngIf=\"show\">Hello!</div>", isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp', template: myTemplate,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: non_literal_template_with_substitution.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: non_literal_template_with_concatenation.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
const greeting = 'Hello!';
const myTemplate = '<div *ngIf="show">' + greeting + '</div>';
export class TestCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: false, selector: "test-cmp", ngImport: i0, template: "<div *ngIf=\"show\">Hello!</div>", isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp', template: myTemplate,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: non_literal_template_with_concatenation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: library_exports.js
 ****************************************************************************************************/
// This test verifies that a directive from an external library is emitted using its declared name,
// even in the presence of alias exports that could have been chosen.
// See https://github.com/angular/angular/issues/41277.
import { Component, NgModule } from '@angular/core';
import { LibModule } from 'external_library';
import * as i0 from "@angular/core";
import * as i1 from "external_library";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <lib-dir></lib-dir>
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.LibDirective, selector: "lib-dir" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <lib-dir></lib-dir>
  `,
                    standalone: false
                }]
        }] });
export class TestModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, declarations: [TestComponent], imports: [LibModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, imports: [LibModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [TestComponent],
                    imports: [LibModule],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: library_exports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
import * as i1 from "external_library";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class TestModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, [typeof TestComponent], [typeof i1.LibModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<TestModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: debug_info.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class Main {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Main, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Main, isStandalone: true, selector: "ng-component", ngImport: i0, template: 'Hello Angular!', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Main, decorators: [{
            type: Component,
            args: [{
                    template: 'Hello Angular!',
                }]
        }] });
export class MainStandalone {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MainStandalone, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MainStandalone, isStandalone: true, selector: "ng-component", ngImport: i0, template: 'Hello Angular!', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MainStandalone, decorators: [{
            type: Component,
            args: [{
                    template: 'Hello Angular!',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: debug_info.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Main {
    static ɵfac: i0.ɵɵFactoryDeclaration<Main, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Main, "ng-component", never, {}, {}, never, never, true, never>;
}
export declare class MainStandalone {
    static ɵfac: i0.ɵɵFactoryDeclaration<MainStandalone, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MainStandalone, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_component_definition.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Outer {
    constructor() {
        class Inner {
            static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Inner, deps: [], target: i0.ɵɵFactoryTarget.Component });
            static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Inner, isStandalone: true, selector: "ng-component", ngImport: i0, template: 'inner', isInline: true });
        }
        i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Inner, decorators: [{
                    type: Component,
                    args: [{
                            template: 'inner',
                        }]
                }] });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Outer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Outer, isStandalone: true, selector: "ng-component", ngImport: i0, template: 'outer', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Outer, decorators: [{
            type: Component,
            args: [{
                    template: 'outer',
                }]
        }], ctorParameters: () => [] });

/****************************************************************************************************
 * PARTIAL FILE: nested_component_definition.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: abstract_directive.js
 ****************************************************************************************************/
import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class AbstractDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AbstractDir, isStandalone: true, selector: "[test-dir]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractDir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[test-dir]',
                }]
        }] });
export class AbstractInherited extends AbstractDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractInherited, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AbstractInherited, isStandalone: true, selector: "[dir2]", usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractInherited, decorators: [{
            type: Directive,
            args: [{
                    selector: '[dir2]',
                }]
        }] });
export class AbstractComp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AbstractComp, isStandalone: true, selector: "test-comp", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AbstractComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-comp',
                    template: ''
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: abstract_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare abstract class AbstractDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<AbstractDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<AbstractDir, "[test-dir]", never, {}, {}, never, never, true, never>;
}
export declare abstract class AbstractInherited extends AbstractDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<AbstractInherited, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<AbstractInherited, "[dir2]", never, {}, {}, never, never, true, never>;
}
export declare abstract class AbstractComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<AbstractComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AbstractComp, "test-comp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_animate_enter.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestCmp {
    disabled = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "test-cmp", host: { properties: { "animate.enter": "disabled ? undefined : 'enter-class'" } }, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp',
                    template: '',
                    host: {
                        '[animate.enter]': "disabled ? undefined : 'enter-class'",
                    }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_animate_enter.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestCmp {
    disabled: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: change_detection.js
 ****************************************************************************************************/
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
export class OnPushComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OnPushComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OnPushComponent, isStandalone: true, selector: "on-push", ngImport: i0, template: '<div>hello</div>', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.ShadowDom, preserveWhitespaces: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OnPushComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'on-push',
                    template: '<div>hello</div>',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.ShadowDom,
                    preserveWhitespaces: true,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: change_detection.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class OnPushComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<OnPushComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OnPushComponent, "on-push", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: export_as_query.js
 ****************************************************************************************************/
import { Component, Directive, ViewChild } from '@angular/core';
import * as i0 from "@angular/core";
export class FooDirective {
    open() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: FooDirective, isStandalone: true, selector: "[foo]", exportAs: ["foo"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[foo]',
                    exportAs: 'foo',
                }]
        }] });
export class AppComponent {
    ref;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AppComponent, isStandalone: true, selector: "app-root", viewQueries: [{ propertyName: "ref", first: true, predicate: ["ref"], descendants: true }], ngImport: i0, template: '<div foo #ref="foo"></div>', isInline: true, dependencies: [{ kind: "directive", type: FooDirective, selector: "[foo]", exportAs: ["foo"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'app-root',
                    imports: [FooDirective],
                    template: '<div foo #ref="foo"></div>',
                }]
        }], propDecorators: { ref: [{
                type: ViewChild,
                args: ['ref']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: export_as_query.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class FooDirective {
    open(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FooDirective, "[foo]", ["foo"], {}, {}, never, never, true, never>;
}
export declare class AppComponent {
    ref?: FooDirective;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AppComponent, "app-root", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: cross_file_inheritance_base.js
 ****************************************************************************************************/
import { Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class BaseDirective {
    value = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: BaseDirective, isStandalone: true, inputs: { value: "value" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseDirective, decorators: [{
            type: Directive
        }], propDecorators: { value: [{
                type: Input
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: cross_file_inheritance_base.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class BaseDirective {
    value: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BaseDirective, never, never, { "value": { "alias": "value"; "required": false; }; }, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: cross_file_inheritance.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import { BaseDirective } from './cross_file_inheritance_base';
import * as i0 from "@angular/core";
export class ChildDirective extends BaseDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ChildDirective, isStandalone: false, selector: "[child]", usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[child]',
                    standalone: false,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: cross_file_inheritance.d.ts
 ****************************************************************************************************/
import { BaseDirective } from './cross_file_inheritance_base';
import * as i0 from "@angular/core";
export declare class ChildDirective extends BaseDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ChildDirective, "[child]", never, {}, {}, never, never, false, never>;
}

