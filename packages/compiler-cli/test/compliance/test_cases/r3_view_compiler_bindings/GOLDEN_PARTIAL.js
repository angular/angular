/****************************************************************************************************
 * PARTIAL FILE: order_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeCmp {
}
SomeCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
SomeCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeCmp, isStandalone: true, selector: "some-elem", inputs: { attr1: "attr1", prop1: "prop1", attrInterp1: "attrInterp1", propInterp1: "propInterp1" }, ngImport: i0, template: ``, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'some-elem',
                    template: ``,
                    inputs: ['attr1', 'prop1', 'attrInterp1', 'propInterp1'],
                }]
        }] });
export class MyCmp {
}
MyCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyCmp, isStandalone: true, selector: "my-cmp", host: { attributes: { "literal1": "foo" }, listeners: { "event1": "foo()" }, properties: { "attr.attr1": "foo", "prop1": "foo", "class.class1": "false", "style.style1": "true", "class": "foo", "style": "foo" } }, ngImport: i0, template: `
		<some-elem
			literal1="foo"
			(event1)="foo()"
			[attr.attr1]="foo"
			[prop1]="foo",
			[class.class1]="foo",
			[style.style1]="foo"
			style="foo"
			class="foo"
			attr.attrInterp1="interp {{foo}}"
			propInterp1="interp {{foo}}"
			/>
	`, isInline: true, dependencies: [{ kind: "component", type: SomeCmp, selector: "some-elem", inputs: ["attr1", "prop1", "attrInterp1", "propInterp1"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-cmp',
                    imports: [SomeCmp],
                    host: {
                        'literal1': 'foo',
                        '(event1)': 'foo()',
                        '[attr.attr1]': 'foo',
                        '[prop1]': 'foo',
                        '[class.class1]': 'false',
                        '[style.style1]': 'true',
                        '[class]': 'foo',
                        '[style]': 'foo',
                    },
                    template: `
		<some-elem
			literal1="foo"
			(event1)="foo()"
			[attr.attr1]="foo"
			[prop1]="foo",
			[class.class1]="foo",
			[style.style1]="foo"
			style="foo"
			class="foo"
			attr.attrInterp1="interp {{foo}}"
			propInterp1="interp {{foo}}"
			/>
	`
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: order_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeCmp, "some-elem", never, { "attr1": { "alias": "attr1"; "required": false; }; "prop1": { "alias": "prop1"; "required": false; }; "attrInterp1": { "alias": "attrInterp1"; "required": false; }; "propInterp1": { "alias": "propInterp1"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyCmp {
    foo: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyCmp, "my-cmp", never, {}, {}, never, never, true, never>;
}

