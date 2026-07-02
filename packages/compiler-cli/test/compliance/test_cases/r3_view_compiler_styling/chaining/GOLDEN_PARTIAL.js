/****************************************************************************************************
 * PARTIAL FILE: class_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    yesToApple = true;
    yesToOrange = true;
    yesToTomato = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
   [class.apple]="yesToApple"
   [class.orange]="yesToOrange"
   [class.tomato]="yesToTomato"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
   [class.apple]="yesToApple"
   [class.orange]="yesToOrange"
   [class.tomato]="yesToTomato"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    yesToApple: boolean;
    yesToOrange: boolean;
    yesToTomato: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: style_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    color = 'red';
    border = '1px solid purple';
    transition = 'all 1337ms ease';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
    [style.color]="color"
    [style.border]="border"
    [style.transition]="transition"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
    [style.color]="color"
    [style.border]="border"
    [style.transition]="transition"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: style_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    color: string;
    border: string;
    transition: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: mixed_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    color = 'red';
    border = '1px solid purple';
    transition = 'all 1337ms ease';
    yesToApple = true;
    yesToOrange = true;
    yesToTomato = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
    [class.apple]="yesToApple"
    [style.color]="color"
    [class.orange]="yesToOrange"
    [style.border]="border"
    [class.tomato]="yesToTomato"
    [style.transition]="transition"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
    [class.apple]="yesToApple"
    [style.color]="color"
    [class.orange]="yesToOrange"
    [style.border]="border"
    [class.tomato]="yesToTomato"
    [style.transition]="transition"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: mixed_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    color: string;
    border: string;
    transition: string;
    yesToApple: boolean;
    yesToOrange: boolean;
    yesToTomato: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolations_equal_arity.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    one = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
   style.color="a{{one}}b"
   style.border="a{{one}}b"
   style.transition="a{{one}}b"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
   style.color="a{{one}}b"
   style.border="a{{one}}b"
   style.transition="a{{one}}b"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: interpolations_equal_arity.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    one: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolations_different_arity.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    one = '';
    two = '';
    three = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c"
    style.height="a{{one}}b{{two}}c{{three}}d"
    style.top="a{{one}}b{{two}}c{{three}}d"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c"
    style.height="a{{one}}b{{two}}c{{three}}d"
    style.top="a{{one}}b{{two}}c{{three}}d"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: interpolations_different_arity.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    one: string;
    two: string;
    three: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: break_different_instructions.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    one = '';
    transition = 'all 1337ms ease';
    width = '42px';
    yesToApple = true;
    yesToOrange = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
                    style.color="a{{one}}b"
                    style.border="a{{one}}b"
                    [class.apple]="yesToApple"
                    [style.transition]="transition"
                    [class.orange]="yesToOrange"
                    [style.width]="width"
                    style.height="a{{one}}b"
                    style.top="a{{one}}b"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
                    style.color="a{{one}}b"
                    style.border="a{{one}}b"
                    [class.apple]="yesToApple"
                    [style.transition]="transition"
                    [class.orange]="yesToOrange"
                    [style.width]="width"
                    style.height="a{{one}}b"
                    style.top="a{{one}}b"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: break_different_instructions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    one: string;
    transition: string;
    width: string;
    yesToApple: boolean;
    yesToOrange: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: break_different_interpolation_instructions.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    one = '';
    two = '';
    three = '';
    transition = 'all 1337ms ease';
    width = '42px';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c{{three}}d"
    style.height="a{{one}}b"
    style.top="a{{one}}b"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c{{three}}d"
    style.height="a{{one}}b"
    style.top="a{{one}}b"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: break_different_interpolation_instructions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    one: string;
    two: string;
    three: string;
    transition: string;
    width: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings.js
 ****************************************************************************************************/
import { Component, HostBinding } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    color = 'red';
    transition = 'all 1337ms ease';
    yesToApple = true;
    yesToTomato = false;
    border = '1px solid purple';
    yesToOrange = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", host: { properties: { "class.apple": "yesToApple", "style.color": "color", "class.tomato": "yesToTomato", "style.transition": "transition", "style.border": "this.border", "class.orange": "this.yesToOrange" } }, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: '',
                    host: {
                        '[class.apple]': 'yesToApple',
                        '[style.color]': 'color',
                        '[class.tomato]': 'yesToTomato',
                        '[style.transition]': 'transition'
                    },
                    standalone: false
                }]
        }], propDecorators: { border: [{
                type: HostBinding,
                args: ['style.border']
            }], yesToOrange: [{
                type: HostBinding,
                args: ['class.orange']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: host_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    color: string;
    transition: string;
    yesToApple: boolean;
    yesToTomato: boolean;
    border: string;
    yesToOrange: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

