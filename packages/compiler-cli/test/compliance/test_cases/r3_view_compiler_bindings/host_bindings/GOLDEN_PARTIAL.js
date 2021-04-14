/****************************************************************************************************
 * PARTIAL FILE: host_bindings.js
 ****************************************************************************************************/
import { Directive, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingDir {
    constructor() {
        this.dirId = 'some id';
    }
}
HostBindingDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostBindingDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingDir, selector: "[hostBindingDir]", host: { properties: { "id": "this.dirId" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostBindingDir]' }]
        }], propDecorators: { dirId: [{
                type: HostBinding,
                args: ['id']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingDir {
    dirId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostBindingDir, "[hostBindingDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_temporaries.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingDir {
}
HostBindingDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostBindingDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingDir, selector: "[hostBindingDir]", host: { properties: { "id": "getData()?.id" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostBindingDir]', host: { '[id]': 'getData()?.id' } }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_temporaries.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingDir {
    getData?: () => {
        id: number;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostBindingDir, "[hostBindingDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_pure_functions.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingComp {
    constructor() {
        this.id = 'some id';
    }
}
HostBindingComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
HostBindingComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingComp, selector: "host-binding-comp", host: { properties: { "id": "[\"red\", id]" } }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingComp, decorators: [{
            type: Component,
            args: [{ selector: 'host-binding-comp', host: { '[id]': '["red", id]' }, template: '' }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingComp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingComp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_pure_functions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingComp {
    id: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HostBindingComp, "host-binding-comp", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_attribute_bindings.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostAttributeDir {
    constructor() {
        this.required = true;
    }
}
HostAttributeDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostAttributeDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostAttributeDir, selector: "[hostAttributeDir]", host: { properties: { "attr.required": "required" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostAttributeDir]', host: { '[attr.required]': 'required' } }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostAttributeDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostAttributeDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_attribute_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostAttributeDir {
    required: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostAttributeDir, "[hostAttributeDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostAttributeDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_attributes.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostAttributeDir {
}
HostAttributeDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostAttributeDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostAttributeDir, selector: "[hostAttributeDir]", host: { attributes: { "aria-label": "label" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostAttributeDir]', host: { 'aria-label': 'label' } }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostAttributeDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostAttributeDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostAttributeDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostAttributeDir, "[hostAttributeDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostAttributeDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_attributes_with_classes_and_styles.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostAttributeComp {
}
HostAttributeComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
HostAttributeComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostAttributeComp, selector: "my-host-attribute-component", host: { attributes: { "title": "hello there from component" }, styleAttribute: "opacity:1" }, ngImport: i0, template: '...', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-host-attribute-component',
                    template: '...',
                    host: { 'title': 'hello there from component', 'style': 'opacity:1' }
                }]
        }] });
export class HostAttributeDir {
}
HostAttributeDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostAttributeDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostAttributeDir, selector: "[hostAttributeDir]", host: { attributes: { "title": "hello there from directive" }, properties: { "style.opacity": "true", "class.three": "true" }, styleAttribute: "width: 200px; height: 500px", classAttribute: "one two" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostAttributeDir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[hostAttributeDir]',
                    host: {
                        'style': 'width: 200px; height: 500px',
                        '[style.opacity]': 'true',
                        'class': 'one two',
                        '[class.three]': 'true',
                        'title': 'hello there from directive',
                    }
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostAttributeComp, HostAttributeDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostAttributeComp, HostAttributeDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_attributes_with_classes_and_styles.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostAttributeComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HostAttributeComp, "my-host-attribute-component", never, {}, {}, never, never>;
}
export declare class HostAttributeDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostAttributeDir, "[hostAttributeDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostAttributeComp, typeof HostAttributeDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_property_bindings.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "title": "myTitle", "tabindex": "1", "id": "myId" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[my-dir]', host: { '[title]': 'myTitle', '[tabindex]': '1', '[id]': 'myId' } }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_property_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_all.js
 ****************************************************************************************************/
import { Directive, HostBinding } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "tabindex": "1", "title": "this.myTitle", "id": "this.myId" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[my-dir]', host: { '[tabindex]': '1' } }]
        }], propDecorators: { myTitle: [{
                type: HostBinding,
                args: ['title']
            }], myId: [{
                type: HostBinding,
                args: ['id']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_all.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_mixed.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "title": "\"my title\"", "attr.tabindex": "1", "id": "\"my-id\"" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-dir]',
                    host: { '[title]': '"my title"', '[attr.tabindex]': '1', '[id]': '"my-id"' }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_properties.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.expandedState = 'collapsed';
        this.isSmall = true;
    }
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "@expand": "expandedState", "@fadeOut": "true", "@shrink": "isSmall" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-dir]',
                    host: { '[@expand]': 'expandedState', '[@fadeOut]': 'true', '[@shrink]': 'isSmall' }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_properties.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    expandedState: string;
    isSmall: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_attribute_bindings.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "attr.title": "myTitle", "attr.tabindex": "1", "attr.id": "myId" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-dir]',
                    host: { '[attr.title]': 'myTitle', '[attr.tabindex]': '1', '[attr.id]': 'myId' }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_attribute_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_all.js
 ****************************************************************************************************/
import { Directive, HostBinding } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "attr.tabindex": "1", "attr.title": "this.myTitle", "attr.id": "this.myId" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[my-dir]', host: { '[attr.tabindex]': '1' } }]
        }], propDecorators: { myTitle: [{
                type: HostBinding,
                args: ['attr.title']
            }], myId: [{
                type: HostBinding,
                args: ['attr.id']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_all.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_mixed.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { properties: { "attr.title": "\"my title\"", "tabindex": "1", "attr.id": "\"my-id\"" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-dir]',
                    host: { '[attr.title]': '"my title"', '[tabindex]': '1', '[attr.id]': '"my-id"' }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_listeners.js
 ****************************************************************************************************/
import { Directive, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    mousedown() { }
    mouseup() { }
    click() {
    }
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-dir]", host: { listeners: { "mousedown": "mousedown()", "mouseup": "mouseup()", "click": "click()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-dir]',
                    host: {
                        '(mousedown)': 'mousedown()',
                        '(mouseup)': 'mouseup()',
                    }
                }]
        }], propDecorators: { click: [{
                type: HostListener,
                args: ['click']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    mousedown(): void;
    mouseup(): void;
    click(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners.js
 ****************************************************************************************************/
import { Component, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    start() {
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-comp", host: { listeners: { "@animation.done": "done()", "@animation.start": "start()" } }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-comp',
                    template: '',
                    host: {
                        '(@animation.done)': 'done()',
                    }
                }]
        }], propDecorators: { start: [{
                type: HostListener,
                args: ['@animation.start']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    start(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-comp", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners_mixed.js
 ****************************************************************************************************/
import { Component, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    start() {
    }
    click() {
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-comp", host: { listeners: { "mousedown": "mousedown()", "@animation.done": "done()", "mouseup": "mouseup()", "@animation.start": "start()", "click": "click()" } }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-comp',
                    template: '',
                    host: {
                        '(mousedown)': 'mousedown()',
                        '(@animation.done)': 'done()',
                        '(mouseup)': 'mouseup()',
                    }
                }]
        }], propDecorators: { start: [{
                type: HostListener,
                args: ['@animation.start']
            }], click: [{
                type: HostListener,
                args: ['click']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    start(): void;
    click(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-comp", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_primitive_names.js
 ****************************************************************************************************/
import { Directive, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingDir {
}
HostBindingDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostBindingDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingDir, selector: "[hostBindingDir]", host: { properties: { "class.a": "true", "class.b": "false", "class.c": "this.true", "class.d": "this.false", "class.e": "this.other" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[hostBindingDir]',
                    host: {
                        '[class.a]': 'true',
                        '[class.b]': 'false',
                    }
                }]
        }], propDecorators: { true: [{
                type: HostBinding,
                args: ['class.c']
            }], false: [{
                type: HostBinding,
                args: ['class.d']
            }], other: [{
                type: HostBinding,
                args: ['class.e']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_primitive_names.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingDir {
    true: any;
    false: any;
    other: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostBindingDir, "[hostBindingDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_quoted_names.js
 ****************************************************************************************************/
import { Directive, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingDir {
}
HostBindingDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostBindingDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: HostBindingDir, selector: "[hostBindingDir]", host: { properties: { "class.a": "this['is-a']", "class.b": "this['is-\"b\"']", "class.c": "this['\"is-c\"']" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostBindingDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostBindingDir]' }]
        }], propDecorators: { 'is-a': [{
                type: HostBinding,
                args: ['class.a']
            }], 'is-"b"': [{
                type: HostBinding,
                args: ['class.b']
            }], '"is-c"': [{
                type: HostBinding,
                args: ['class.c']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [HostBindingDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [HostBindingDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_quoted_names.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingDir {
    'is-a': any;
    'is-"b"': any;
    '"is-c"': any;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostBindingDir, "[hostBindingDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

