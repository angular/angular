/****************************************************************************************************
 * PARTIAL FILE: query_in_directive.js
 ****************************************************************************************************/
import { contentChild, contentChildren, Directive, forwardRef, viewChild, viewChildren } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeToken {
}
const nonAnalyzableRefersToString = 'a, b, c';
export class TestDir {
    constructor() {
        this.query1 = viewChild('locatorA', ...(ngDevMode ? [{ debugName: "query1" }] : []));
        this.query2 = viewChildren('locatorB', ...(ngDevMode ? [{ debugName: "query2" }] : []));
        this.query3 = contentChild('locatorC', ...(ngDevMode ? [{ debugName: "query3" }] : []));
        this.query4 = contentChildren('locatorD', ...(ngDevMode ? [{ debugName: "query4" }] : []));
        this.query5 = viewChild(forwardRef(() => SomeToken), ...(ngDevMode ? [{ debugName: "query5" }] : []));
        this.query6 = viewChildren(SomeToken, ...(ngDevMode ? [{ debugName: "query6" }] : []));
        this.query7 = viewChild('locatorE', ...(ngDevMode ? [{ debugName: "query7", read: SomeToken }] : [{ read: SomeToken }]));
        this.query8 = contentChildren('locatorF, locatorG', ...(ngDevMode ? [{ debugName: "query8", descendants: true }] : [{ descendants: true }]));
        this.query9 = contentChildren(nonAnalyzableRefersToString, ...(ngDevMode ? [{ debugName: "query9", descendants: true }] : [{ descendants: true }]));
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, queries: [{ propertyName: "query3", first: true, predicate: ["locatorC"], descendants: true, isSignal: true }, { propertyName: "query4", predicate: ["locatorD"], isSignal: true }, { propertyName: "query8", predicate: ["locatorF, locatorG"], descendants: true, isSignal: true }, { propertyName: "query9", predicate: nonAnalyzableRefersToString, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "query1", first: true, predicate: ["locatorA"], descendants: true, isSignal: true }, { propertyName: "query2", predicate: ["locatorB"], descendants: true, isSignal: true }, { propertyName: "query5", first: true, predicate: i0.forwardRef(() => SomeToken), descendants: true, isSignal: true }, { propertyName: "query6", predicate: SomeToken, descendants: true, isSignal: true }, { propertyName: "query7", first: true, predicate: ["locatorE"], descendants: true, read: SomeToken, isSignal: true }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: query_in_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeToken {
}
export declare class TestDir {
    query1: import("@angular/core").Signal<unknown>;
    query2: import("@angular/core").Signal<readonly unknown[]>;
    query3: import("@angular/core").Signal<unknown>;
    query4: import("@angular/core").Signal<readonly unknown[]>;
    query5: import("@angular/core").Signal<any>;
    query6: import("@angular/core").Signal<readonly SomeToken[]>;
    query7: import("@angular/core").Signal<SomeToken | undefined>;
    query8: import("@angular/core").Signal<readonly unknown[]>;
    query9: import("@angular/core").Signal<readonly unknown[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, ["query3", "query4", "query8", "query9"], never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: query_in_component.js
 ****************************************************************************************************/
import { Component, contentChild, contentChildren, viewChild, viewChildren } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    constructor() {
        this.query1 = viewChild('locatorA', ...(ngDevMode ? [{ debugName: "query1" }] : []));
        this.query2 = viewChildren('locatorB', ...(ngDevMode ? [{ debugName: "query2" }] : []));
        this.query3 = contentChild('locatorC', ...(ngDevMode ? [{ debugName: "query3" }] : []));
        this.query4 = contentChildren('locatorD', ...(ngDevMode ? [{ debugName: "query4" }] : []));
    }
}
TestComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", queries: [{ propertyName: "query3", first: true, predicate: ["locatorC"], descendants: true, isSignal: true }, { propertyName: "query4", predicate: ["locatorD"], isSignal: true }], viewQueries: [{ propertyName: "query1", first: true, predicate: ["locatorA"], descendants: true, isSignal: true }, { propertyName: "query2", predicate: ["locatorB"], descendants: true, isSignal: true }], ngImport: i0, template: 'Works', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: 'Works',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: query_in_component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    query1: import("@angular/core").Signal<unknown>;
    query2: import("@angular/core").Signal<readonly unknown[]>;
    query3: import("@angular/core").Signal<unknown>;
    query4: import("@angular/core").Signal<readonly unknown[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, ["query3", "query4"], never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: mixed_query_variants.js
 ****************************************************************************************************/
import { ContentChild, contentChild, Directive, ViewChild, viewChild } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    constructor() {
        this.signalViewChild = viewChild('locator1', ...(ngDevMode ? [{ debugName: "signalViewChild" }] : []));
        this.signalContentChild = contentChild('locator2', ...(ngDevMode ? [{ debugName: "signalContentChild" }] : []));
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, queries: [{ propertyName: "signalContentChild", first: true, predicate: ["locator2"], descendants: true, isSignal: true }, { propertyName: "decoratorContentChild", first: true, predicate: ["locator2"], descendants: true }], viewQueries: [{ propertyName: "signalViewChild", first: true, predicate: ["locator1"], descendants: true, isSignal: true }, { propertyName: "decoratorViewChild", first: true, predicate: ["locator1"], descendants: true }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { decoratorViewChild: [{
                type: ViewChild,
                args: ['locator1']
            }], decoratorContentChild: [{
                type: ContentChild,
                args: ['locator2']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: mixed_query_variants.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    decoratorViewChild: unknown;
    signalViewChild: import("@angular/core").Signal<unknown>;
    decoratorContentChild: unknown;
    signalContentChild: import("@angular/core").Signal<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, ["signalContentChild", "decoratorContentChild"], never, true, never>;
}

