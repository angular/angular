/****************************************************************************************************
 * PARTIAL FILE: basic_host_directives.js
 ****************************************************************************************************/
import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
class DirectiveA {
}
DirectiveA.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveA, isStandalone: true, host: { classAttribute: "dir-a" }, ngImport: i0 });
export { DirectiveA };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, decorators: [{
            type: Directive,
            args: [{ standalone: true, host: { 'class': 'dir-a' } }]
        }] });
class DirectiveB {
}
DirectiveB.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveB, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveB.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveB, isStandalone: true, host: { classAttribute: "dir-b" }, ngImport: i0 });
export { DirectiveB };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveB, decorators: [{
            type: Directive,
            args: [{ standalone: true, host: { 'class': 'dir-b' } }]
        }] });
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", hostDirectives: [{ directive: DirectiveA }, { directive: DirectiveB }], ngImport: i0, template: '', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    hostDirectives: [DirectiveA, DirectiveB],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_host_directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, never, never, {}, {}, never, never, true, never>;
}
export declare class DirectiveB {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveB, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, {}, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof DirectiveA; inputs: {}; outputs: {}; }, { directive: typeof DirectiveB; inputs: {}; outputs: {}; }]>;
}

/****************************************************************************************************
 * PARTIAL FILE: chained_host_directives.js
 ****************************************************************************************************/
import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
class DirectiveA {
}
DirectiveA.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveA, isStandalone: true, ngImport: i0 });
export { DirectiveA };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }] });
class DirectiveB {
}
DirectiveB.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveB, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveB.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveB, isStandalone: true, hostDirectives: [{ directive: DirectiveA }], ngImport: i0 });
export { DirectiveB };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveB, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    hostDirectives: [DirectiveA],
                }]
        }] });
class DirectiveC {
}
DirectiveC.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveC, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveC.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveC, isStandalone: true, hostDirectives: [{ directive: DirectiveB }], ngImport: i0 });
export { DirectiveC };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveC, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    hostDirectives: [DirectiveB],
                }]
        }] });
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", hostDirectives: [{ directive: DirectiveC }], ngImport: i0, template: '', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    hostDirectives: [DirectiveC],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: chained_host_directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, never, never, {}, {}, never, never, true, never>;
}
export declare class DirectiveB {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveB, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, {}, never, never, true, [{ directive: typeof DirectiveA; inputs: {}; outputs: {}; }]>;
}
export declare class DirectiveC {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveC, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveC, never, never, {}, {}, never, never, true, [{ directive: typeof DirectiveB; inputs: {}; outputs: {}; }]>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof DirectiveC; inputs: {}; outputs: {}; }]>;
}

/****************************************************************************************************
 * PARTIAL FILE: forward_ref_host_directives.js
 ****************************************************************************************************/
import { Component, Directive, forwardRef, Input } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", hostDirectives: [{ directive: i0.forwardRef(function () { return DirectiveB; }) }], ngImport: i0, template: '', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    hostDirectives: [forwardRef(() => DirectiveB)],
                }]
        }] });
class DirectiveB {
}
DirectiveB.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveB, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveB.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveB, isStandalone: true, hostDirectives: [{ directive: i0.forwardRef(function () { return DirectiveA; }), inputs: ["value", "value"] }], ngImport: i0 });
export { DirectiveB };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveB, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    hostDirectives: [{ directive: forwardRef(() => DirectiveA), inputs: ['value'] }],
                }]
        }] });
class DirectiveA {
}
DirectiveA.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectiveA, isStandalone: true, inputs: { value: "value" }, ngImport: i0 });
export { DirectiveA };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], propDecorators: { value: [{
                type: Input
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: forward_ref_host_directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof DirectiveB; inputs: {}; outputs: {}; }]>;
}
export declare class DirectiveB {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveB, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, {}, never, never, true, [{ directive: typeof DirectiveA; inputs: { "value": "value"; }; outputs: {}; }]>;
}
export declare class DirectiveA {
    value: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, never, never, { "value": { "alias": "value"; "required": false; }; }, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_directives_with_inputs_outputs.js
 ****************************************************************************************************/
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import * as i0 from "@angular/core";
class HostDir {
    constructor() {
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
    }
}
HostDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostDir, isStandalone: true, inputs: { value: "value", color: "color" }, outputs: { opened: "opened", closed: "closed" }, ngImport: i0 });
export { HostDir };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], propDecorators: { value: [{
                type: Input
            }], color: [{
                type: Input
            }], opened: [{
                type: Output
            }], closed: [{
                type: Output
            }] } });
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", hostDirectives: [{ directive: HostDir, inputs: ["value", "value", "color", "colorAlias"], outputs: ["opened", "opened", "closed", "closedAlias"] }], ngImport: i0, template: '', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    hostDirectives: [{
                            directive: HostDir,
                            inputs: ['value', 'color: colorAlias'],
                            outputs: ['opened', 'closed: closedAlias'],
                        }],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_directives_with_inputs_outputs.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class HostDir {
    value: number;
    color: string;
    opened: EventEmitter<unknown>;
    closed: EventEmitter<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, never, never, { "value": { "alias": "value"; "required": false; }; "color": { "alias": "color"; "required": false; }; }, { "opened": "opened"; "closed": "closed"; }, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof HostDir; inputs: { "value": "value"; "color": "colorAlias"; }; outputs: { "opened": "opened"; "closed": "closedAlias"; }; }]>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_directives_with_host_aliases.js
 ****************************************************************************************************/
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import * as i0 from "@angular/core";
class HostDir {
    constructor() {
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
    }
}
HostDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HostDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostDir, isStandalone: true, inputs: { value: ["valueAlias", "value"], color: ["colorAlias", "color"] }, outputs: { opened: "openedAlias", closed: "closedAlias" }, ngImport: i0 });
export { HostDir };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], propDecorators: { value: [{
                type: Input,
                args: ['valueAlias']
            }], color: [{
                type: Input,
                args: ['colorAlias']
            }], opened: [{
                type: Output,
                args: ['openedAlias']
            }], closed: [{
                type: Output,
                args: ['closedAlias']
            }] } });
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", hostDirectives: [{ directive: HostDir, inputs: ["valueAlias", "valueAlias", "colorAlias", "customColorAlias"], outputs: ["openedAlias", "openedAlias", "closedAlias", "customClosedAlias"] }], ngImport: i0, template: '', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    hostDirectives: [{
                            directive: HostDir,
                            inputs: ['valueAlias', 'colorAlias: customColorAlias'],
                            outputs: ['openedAlias', 'closedAlias: customClosedAlias'],
                        }],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_directives_with_host_aliases.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class HostDir {
    value: number;
    color: string;
    opened: EventEmitter<unknown>;
    closed: EventEmitter<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, never, never, { "value": { "alias": "valueAlias"; "required": false; }; "color": { "alias": "colorAlias"; "required": false; }; }, { "opened": "openedAlias"; "closed": "closedAlias"; }, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof HostDir; inputs: { "valueAlias": "valueAlias"; "colorAlias": "customColorAlias"; }; outputs: { "openedAlias": "openedAlias"; "closedAlias": "customClosedAlias"; }; }]>;
}

