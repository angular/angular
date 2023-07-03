/****************************************************************************************************
 * PARTIAL FILE: view_child.js
 ****************************************************************************************************/
import { Component, viewChild } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleViewChildWithName {
    constructor() {
        this.buttonEl = viewChild('button');
    }
}
SimpleViewChildWithName.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildWithName, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleViewChildWithName.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleViewChildWithName, isSignal: true, selector: "app", viewQueries: [{ propertyName: "buttonEl", first: true, predicate: ["button"], descendants: true }], ngImport: i0, template: `<button #button></button>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildWithName, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    template: `<button #button></button>`,
                }]
        }] });
export class ButtonComp {
}
ButtonComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ButtonComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
ButtonComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ButtonComp, isStandalone: true, selector: "button-comp", ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ButtonComp, decorators: [{
            type: Component,
            args: [{ selector: 'button-comp', template: '', standalone: true }]
        }] });
export class SimpleViewChildWithType {
    constructor() {
        this.buttonEl = viewChild(ButtonComp);
    }
}
SimpleViewChildWithType.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildWithType, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleViewChildWithType.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleViewChildWithType, isStandalone: true, isSignal: true, selector: "app", viewQueries: [{ propertyName: "buttonEl", first: true, predicate: ButtonComp, descendants: true }], ngImport: i0, template: `<button-comp></button-comp>`, isInline: true, dependencies: [{ kind: "component", type: ButtonComp, selector: "button-comp" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildWithType, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    standalone: true,
                    imports: [ButtonComp],
                    template: `<button-comp></button-comp>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: view_child.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleViewChildWithName {
    buttonEl: import("@angular/core").Signal<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleViewChildWithName, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleViewChildWithName, "app", never, {}, {}, never, never, false, never, true>;
}
export declare class ButtonComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<ButtonComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ButtonComp, "button-comp", never, {}, {}, never, never, true, never>;
}
export declare class SimpleViewChildWithType {
    buttonEl: import("@angular/core").Signal<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleViewChildWithType, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleViewChildWithType, "app", never, {}, {}, never, never, true, never, true>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_children.js
 ****************************************************************************************************/
import { Component, viewChildren } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleViewChildrenWithName {
    constructor() {
        this.buttonEls = viewChildren('buttons');
    }
}
SimpleViewChildrenWithName.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildrenWithName, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleViewChildrenWithName.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleViewChildrenWithName, isSignal: true, selector: "app", viewQueries: [{ propertyName: "buttonEls", predicate: ["buttons"], descendants: true }], ngImport: i0, template: `
    <button #buttons></button>
    <button #buttons></button>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildrenWithName, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    template: `
    <button #buttons></button>
    <button #buttons></button>
  `,
                }]
        }] });
export class ButtonComp {
}
ButtonComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ButtonComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
ButtonComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ButtonComp, isStandalone: true, selector: "button-comp", ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ButtonComp, decorators: [{
            type: Component,
            args: [{ selector: 'button-comp', template: '', standalone: true }]
        }] });
export class SimpleViewChildrenWithType {
    constructor() {
        this.buttonEls = viewChildren(ButtonComp);
    }
}
SimpleViewChildrenWithType.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildrenWithType, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleViewChildrenWithType.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleViewChildrenWithType, isStandalone: true, isSignal: true, selector: "app", viewQueries: [{ propertyName: "buttonEls", predicate: ButtonComp, descendants: true }], ngImport: i0, template: `
    <button-comp></button-comp>
    <button-comp></button-comp>
  `, isInline: true, dependencies: [{ kind: "component", type: ButtonComp, selector: "button-comp" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleViewChildrenWithType, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    standalone: true,
                    imports: [ButtonComp],
                    template: `
    <button-comp></button-comp>
    <button-comp></button-comp>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: view_children.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleViewChildrenWithName {
    buttonEls: import("@angular/core").Signal<unknown[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleViewChildrenWithName, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleViewChildrenWithName, "app", never, {}, {}, never, never, false, never, true>;
}
export declare class ButtonComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<ButtonComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ButtonComp, "button-comp", never, {}, {}, never, never, true, never>;
}
export declare class SimpleViewChildrenWithType {
    buttonEls: import("@angular/core").Signal<unknown[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleViewChildrenWithType, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleViewChildrenWithType, "app", never, {}, {}, never, never, true, never, true>;
}

