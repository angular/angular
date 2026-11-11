/****************************************************************************************************
 * PARTIAL FILE: class_resolver_element.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    wide = true;
    extra = 'py-1';
    classes(cn) {
        return cn(this.extra);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `<div class="p-2" [class.px-4]="wide" (class)="classes"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div class="p-2" [class.px-4]="wide" (class)="classes"></div>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_element.d.ts
 ****************************************************************************************************/
import { BoundClassResolver, ResolvedAttribute } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    wide: boolean;
    extra: string;
    classes(cn: BoundClassResolver): ResolvedAttribute;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_component.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class UiButton {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UiButton, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: UiButton, isStandalone: true, selector: "ui-button", ngImport: i0, template: '<ng-content />', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UiButton, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-button',
                    template: '<ng-content />',
                }]
        }] });
export class MyComponent {
    classes(cn) {
        return cn();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `<ui-button class="px-2" (class)="classes">Save</ui-button>`, isInline: true, dependencies: [{ kind: "component", type: UiButton, selector: "ui-button" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    imports: [UiButton],
                    template: `<ui-button class="px-2" (class)="classes">Save</ui-button>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_component.d.ts
 ****************************************************************************************************/
import { BoundClassResolver, ResolvedAttribute } from '@angular/core';
import * as i0 from "@angular/core";
export declare class UiButton {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UiButton, "ui-button", never, {}, {}, never, ["*"], true, never>;
}
export declare class MyComponent {
    classes(cn: BoundClassResolver): ResolvedAttribute;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_arrow_function.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    size = 'px-2';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `<div (class)="(cn) => cn(size)"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div (class)="(cn) => cn(size)"></div>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_arrow_function.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    size: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_host.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    classes(cn) {
        return cn();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", host: { listeners: { "class": "classes" }, classAttribute: "px-4" }, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    host: { class: 'px-4', '(class)': 'classes' },
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_host.d.ts
 ****************************************************************************************************/
import { BoundClassResolver, ResolvedAttribute } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    classes(cn: BoundClassResolver): ResolvedAttribute;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_ng_template.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    resolve = (cn) => cn();
    capture(event) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <ng-template (class)="resolve"></ng-template>
    <ng-template (attr.class)="capture($event)"></ng-template>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <ng-template (class)="resolve"></ng-template>
    <ng-template (attr.class)="capture($event)"></ng-template>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_ng_template.d.ts
 ****************************************************************************************************/
import { ClassCallback, ClassResolveEvent } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    resolve: ClassCallback;
    capture(event: ClassResolveEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_with_blocks.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    show = true;
    classes(cn) {
        return cn();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `@if (show) { <div (class)="classes"></div> }`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `@if (show) { <div (class)="classes"></div> }`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_with_blocks.d.ts
 ****************************************************************************************************/
import { BoundClassResolver, ResolvedAttribute } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    show: boolean;
    classes(cn: BoundClassResolver): ResolvedAttribute;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_host_with_blocks.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    show = true;
    classes(cn) {
        return cn();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", host: { listeners: { "class": "classes" } }, ngImport: i0, template: `@if (show) { <span></span> }`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `@if (show) { <span></span> }`,
                    host: { '(class)': 'classes' },
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_host_with_blocks.d.ts
 ****************************************************************************************************/
import { BoundClassResolver, ResolvedAttribute } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    show: boolean;
    classes(cn: BoundClassResolver): ResolvedAttribute;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_attr_class_element.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    resolve(event) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `<div (attr.class)="resolve($event)"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div (attr.class)="resolve($event)"></div>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_attr_class_element.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    resolve(event: unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_attr_class_host.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    resolve(event) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, isStandalone: true, selector: "[myDir]", host: { listeners: { "attr.class": "resolve($event)" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[myDir]',
                    host: { '(attr.class)': 'resolve($event)' },
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_attr_class_host.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    resolve(event: unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[myDir]", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_shorthand_safe_read.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    choice = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div (class)="choice?.classes"></div>
    <span (attr.class)="$event.resolve((choice?.classes)($event.resolver))"></span>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div (class)="choice?.classes"></div>
    <span (attr.class)="$event.resolve((choice?.classes)($event.resolver))"></span>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_shorthand_safe_read.d.ts
 ****************************************************************************************************/
import { ClassCallback } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    choice: {
        classes: ClassCallback;
    } | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_shorthand_safe_read_host.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class ShorthandDirective {
    choice = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ShorthandDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: ShorthandDirective, isStandalone: true, selector: "[shorthand]", host: { listeners: { "class": "choice?.classes" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ShorthandDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[shorthand]',
                    host: { '(class)': 'choice?.classes' },
                }]
        }] });
export class ExpansionDirective {
    choice = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ExpansionDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: ExpansionDirective, isStandalone: true, selector: "[expansion]", host: { listeners: { "attr.class": "$event.resolve((choice?.classes)($event.resolver))" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ExpansionDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[expansion]',
                    host: { '(attr.class)': '$event.resolve((choice?.classes)($event.resolver))' },
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_resolver_shorthand_safe_read_host.d.ts
 ****************************************************************************************************/
import { ClassCallback } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ShorthandDirective {
    choice: {
        classes: ClassCallback;
    } | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<ShorthandDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ShorthandDirective, "[shorthand]", never, {}, {}, never, never, true, never>;
}
export declare class ExpansionDirective {
    choice: {
        classes: ClassCallback;
    } | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<ExpansionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ExpansionDirective, "[expansion]", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: attribute_resolver_role_element.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    resolve(event) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `<div (attr.role)="resolve($event)"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div (attr.role)="resolve($event)"></div>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: attribute_resolver_role_element.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    resolve(event: unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: attribute_resolver_i18n_attribute.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    name = '';
    resolve(event) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `<div attr.title="Hi {{name}}" i18n-attr.title (attr.title)="resolve($event)"></div>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div attr.title="Hi {{name}}" i18n-attr.title (attr.title)="resolve($event)"></div>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: attribute_resolver_i18n_attribute.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    name: string;
    resolve(event: unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: attribute_resolver_role_host.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    resolve(event) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "22.3.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, isStandalone: true, selector: "[myDir]", host: { listeners: { "attr.role": "resolve($event)" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[myDir]',
                    host: { '(attr.role)': 'resolve($event)' },
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: attribute_resolver_role_host.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    resolve(event: unknown): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[myDir]", never, {}, {}, never, never, true, never>;
}

