/****************************************************************************************************
 * PARTIAL FILE: safe_keyed_read.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.unknownNames = null;
        this.knownNames = [['Frodo', 'Bilbo']];
        this.species = null;
        this.keys = null;
        this.speciesMap = { key: 'unknown' };
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
      Hello, {{ knownNames?.[0]?.[1] }}!
      You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
      You are an Elf: {{ speciesMap?.[keys?.[0] ?? 'key'] }}
      You are an Orc: {{ speciesMap?.['key'] }}
    </span>
`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
      Hello, {{ knownNames?.[0]?.[1] }}!
      You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
      You are an Elf: {{ speciesMap?.[keys?.[0] ?? 'key'] }}
      You are an Orc: {{ speciesMap?.['key'] }}
    </span>
`,
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
 * PARTIAL FILE: safe_keyed_read.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    unknownNames: string[] | null;
    knownNames: string[][];
    species: null;
    keys: null;
    speciesMap: Record<string, string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: safe_access_deep.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.p = null;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
  <span>Safe Property: {{ p?.a?.b?.c?.d }}</span>
  <span>Safe Keyed: {{ p?.['a']?.['b']?.['c']?.['d'] }}</span>
  <span>Mixed Property: {{ p?.a?.b.c.d?.e?.f?.g.h }}</span>
  <span>Mixed Property and Keyed: {{ p.a['b'].c.d?.['e']?.['f']?.g['h']['i']?.j.k }}</span>
`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
  <span>Safe Property: {{ p?.a?.b?.c?.d }}</span>
  <span>Safe Keyed: {{ p?.['a']?.['b']?.['c']?.['d'] }}</span>
  <span>Mixed Property: {{ p?.a?.b.c.d?.e?.f?.g.h }}</span>
  <span>Mixed Property and Keyed: {{ p.a['b'].c.d?.['e']?.['f']?.g['h']['i']?.j.k }}</span>
`,
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
 * PARTIAL FILE: safe_access_deep.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    p: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: safe_access_temporaries.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.p = null;
    }
    f1() { }
    f2() { }
    f3() { }
    f4() { }
    f5() { }
    f6() { }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
  <span>Safe Property with Calls: {{ p()?.a()?.b()?.c()?.d() }}</span>
  <span>Safe and Unsafe Property with Calls: {{ p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l }}</span>
  <span>Nested Safe with Calls: {{ f1()?.[f2()?.a]?.b }}</span>
  <span>Deep Nested Safe with Calls: {{ f1()?.[f2()?.f3()?.[f4()?.f5()]]?.f6() }}</span>
`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
  <span>Safe Property with Calls: {{ p()?.a()?.b()?.c()?.d() }}</span>
  <span>Safe and Unsafe Property with Calls: {{ p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l }}</span>
  <span>Nested Safe with Calls: {{ f1()?.[f2()?.a]?.b }}</span>
  <span>Deep Nested Safe with Calls: {{ f1()?.[f2()?.f3()?.[f4()?.f5()]]?.f6() }}</span>
`,
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
 * PARTIAL FILE: safe_access_temporaries.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    p: any;
    f1(): any;
    f2(): any;
    f3(): any;
    f4(): any;
    f5(): any;
    f6(): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: safe_method_call.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <span [title]="person?.getName(false)"></span>
    <span [title]="person?.getName(false) || ''"></span>
    <span [title]="person?.getName(false)?.toLowerCase()"></span>
    <span [title]="person?.getName(config.get('title')?.enabled)"></span>
    <span [title]="person?.getName(config.get('title')?.enabled ?? true)"></span>
`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <span [title]="person?.getName(false)"></span>
    <span [title]="person?.getName(false) || ''"></span>
    <span [title]="person?.getName(false)?.toLowerCase()"></span>
    <span [title]="person?.getName(config.get('title')?.enabled)"></span>
    <span [title]="person?.getName(config.get('title')?.enabled ?? true)"></span>
`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: safe_method_call.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    person?: {
        getName: (includeTitle: boolean | undefined) => string;
    };
    config: {
        get: (name: string) => {
            enabled: boolean;
        } | undefined;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: safe_call.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.person = { getName: () => 'Bilbo' };
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
      Hello, {{ person.getName?.() }}!
      You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
    </span>
`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
      Hello, {{ person.getName?.() }}!
      You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
    </span>
`,
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
 * PARTIAL FILE: safe_call.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    person: {
        getName: () => string;
        getLastName?: () => string;
        getSpecies?: () => () => () => () => () => string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: safe_access_non_null.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.val = null;
    }
    foo(val) {
        return val;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    {{ val?.foo!.bar }}
    {{ val?.[0].foo!.bar }}
    {{ foo(val)?.foo!.bar }}
    {{ $any(val)?.foo!.bar }}
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{ val?.foo!.bar }}
    {{ val?.[0].foo!.bar }}
    {{ foo(val)?.foo!.bar }}
    {{ $any(val)?.foo!.bar }}
  `,
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
 * PARTIAL FILE: safe_access_non_null.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    val: any;
    foo(val: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

