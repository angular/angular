/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.list = [];
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: ' {{list[0]}} {{list[1]}} {{list[2]}} {{list[3]}} {{list[4]}} {{list[5]}} {{list[6]}} {{list[7]}} {{list[8]}} ', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: ' {{list[0]}} {{list[1]}} {{list[2]}} {{list[3]}} {{list[4]}} {{list[5]}} {{list[6]}} {{list[7]}} {{list[8]}} ',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    list: any[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

