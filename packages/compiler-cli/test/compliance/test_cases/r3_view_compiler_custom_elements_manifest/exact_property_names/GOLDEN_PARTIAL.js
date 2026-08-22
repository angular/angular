/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class ForceFull {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForceFull, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ForceFull, isStandalone: true, selector: "[forceFull]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForceFull, decorators: [{
            type: Directive,
            args: [{ selector: '[forceFull]' }]
        }] });
export class ManifestDomProperties {
    readonly = false;
    formaction = '/submit';
    html = '<strong>content</strong>';
    tabindex = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestDomProperties, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.2.0", version: "0.0.0-PLACEHOLDER", type: ManifestDomProperties, isStandalone: true, selector: "manifest-dom-properties", ngImport: i0, template: `
    <my-button
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
      [tabindex]="tabindex"
    ></my-button>
  `, isInline: true, customElementPropertyNames: { "my-button": ["readonly", "formaction", "innerHTML"] } });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestDomProperties, decorators: [{
            type: Component,
            args: [{
                    selector: 'manifest-dom-properties',
                    template: `
    <my-button
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
      [tabindex]="tabindex"
    ></my-button>
  `,
                }]
        }] });
export class ManifestProperties {
    readonly = false;
    formaction = '/submit';
    html = '<strong>content</strong>';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestProperties, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.2.0", version: "0.0.0-PLACEHOLDER", type: ManifestProperties, isStandalone: true, selector: "manifest-properties", ngImport: i0, template: `
    <my-button
      forceFull
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
    ></my-button>
  `, isInline: true, customElementPropertyNames: { "my-button": ["readonly", "formaction", "innerHTML"] }, dependencies: [{ kind: "directive", type: ForceFull, selector: "[forceFull]" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestProperties, decorators: [{
            type: Component,
            args: [{
                    selector: 'manifest-properties',
                    imports: [ForceFull],
                    template: `
    <my-button
      forceFull
      [readonly]="readonly"
      [(formaction)]="formaction"
      [innerHTML]="html"
    ></my-button>
  `,
                }]
        }] });
export class ManifestDomPropertyShapes {
    readonly = false;
    html = '<strong>content</strong>';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestDomPropertyShapes, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.2.0", version: "0.0.0-PLACEHOLDER", type: ManifestDomPropertyShapes, isStandalone: true, selector: "manifest-dom-property-shapes", ngImport: i0, template: `
    <my-button [readonly]="readonly" />
    <input [readonly]="readonly" />
    @if (readonly) {
      <my-button [readonly]="readonly" [innerHTML]="html" />
    }
    <my-button innerHTML="{{html}}" />
  `, isInline: true, customElementPropertyNames: { "my-button": ["readonly", "innerHTML"] } });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestDomPropertyShapes, decorators: [{
            type: Component,
            args: [{
                    selector: 'manifest-dom-property-shapes',
                    template: `
    <my-button [readonly]="readonly" />
    <input [readonly]="readonly" />
    @if (readonly) {
      <my-button [readonly]="readonly" [innerHTML]="html" />
    }
    <my-button innerHTML="{{html}}" />
  `,
                }]
        }] });
export class ManifestPropertyShapes {
    readonly = false;
    html = '<strong>content</strong>';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestPropertyShapes, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "22.2.0", version: "0.0.0-PLACEHOLDER", type: ManifestPropertyShapes, isStandalone: true, selector: "manifest-property-shapes", ngImport: i0, template: `
    <my-button forceFull [readonly]="readonly" [innerHTML]="html" />
    <input forceFull [readonly]="readonly" />
    @if (readonly) {
      <my-button forceFull innerHTML="{{html}}" />
    }
  `, isInline: true, customElementPropertyNames: { "my-button": ["readonly", "innerHTML"] }, dependencies: [{ kind: "directive", type: ForceFull, selector: "[forceFull]" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ManifestPropertyShapes, decorators: [{
            type: Component,
            args: [{
                    selector: 'manifest-property-shapes',
                    imports: [ForceFull],
                    template: `
    <my-button forceFull [readonly]="readonly" [innerHTML]="html" />
    <input forceFull [readonly]="readonly" />
    @if (readonly) {
      <my-button forceFull innerHTML="{{html}}" />
    }
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ForceFull {
    static ɵfac: i0.ɵɵFactoryDeclaration<ForceFull, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ForceFull, "[forceFull]", never, {}, {}, never, never, true, never>;
}
export declare class ManifestDomProperties {
    readonly: boolean;
    formaction: string;
    html: string;
    tabindex: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<ManifestDomProperties, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ManifestDomProperties, "manifest-dom-properties", never, {}, {}, never, never, true, never>;
}
export declare class ManifestProperties {
    readonly: boolean;
    formaction: string;
    html: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ManifestProperties, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ManifestProperties, "manifest-properties", never, {}, {}, never, never, true, never>;
}
export declare class ManifestDomPropertyShapes {
    readonly: boolean;
    html: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ManifestDomPropertyShapes, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ManifestDomPropertyShapes, "manifest-dom-property-shapes", never, {}, {}, never, never, true, never>;
}
export declare class ManifestPropertyShapes {
    readonly: boolean;
    html: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ManifestPropertyShapes, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ManifestPropertyShapes, "manifest-property-shapes", never, {}, {}, never, never, true, never>;
}

