/****************************************************************************************************
 * PARTIAL FILE: directive_styles.js
 ****************************************************************************************************/
import { Directive, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, isStandalone: true, selector: "[myDir]", styles: ["div.foo { color: red; }", ":host { color: blue; }"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[myDir]', styles: ["div.foo { color: red; }", ":host { color: blue; }"] }]
        }] });
export class MyNoneDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyNoneDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", type: MyNoneDirective, isStandalone: true, selector: "[myNoneDir]", styles: ["div.none { color: green; }"], encapsulation: i0.ViewEncapsulation.None, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyNoneDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[myNoneDir]', encapsulation: ViewEncapsulation.None, styles: ["div.none { color: green; }"] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: directive_styles.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[myDir]", never, {}, {}, never, never, true, never>;
}
export declare class MyNoneDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyNoneDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyNoneDirective, "[myNoneDir]", never, {}, {}, never, never, true, never>;
}

