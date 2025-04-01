/****************************************************************************************************
 * PARTIAL FILE: basic_deferred.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @defer {Deferred content}
      <p>Content after defer block</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @defer {Deferred content}
      <p>Content after defer block</p>
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_deferred.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_secondary_blocks.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
        this.loadingMessage = 'Calendar is loading';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @defer {
        <button></button>
      } @loading {
        {{loadingMessage}}
      } @placeholder {
        <img src="loading.gif">
      } @error {
        Calendar failed to load <i>sad</i>
      }
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @defer {
        <button></button>
      } @loading {
        {{loadingMessage}}
      } @placeholder {
        <img src="loading.gif">
      } @error {
        Calendar failed to load <i>sad</i>
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_secondary_blocks.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    loadingMessage: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_placeholder_params.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @defer {
      <button></button>
    } @placeholder (minimum 2s) {
      <img src="placeholder.gif">
    }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @defer {
      <button></button>
    } @placeholder (minimum 2s) {
      <img src="placeholder.gif">
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_placeholder_params.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_loading_params.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @defer {
      <button></button>
    } @loading(minimum 2s; after 500ms) {
      <img src="loading.gif">
    }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @defer {
      <button></button>
    } @loading(minimum 2s; after 500ms) {
      <img src="loading.gif">
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_loading_params.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_local_deps.js
 ****************************************************************************************************/
import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class EagerDep {
}
EagerDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EagerDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
EagerDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: EagerDep, isStandalone: true, selector: "eager-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EagerDep, decorators: [{
            type: Directive,
            args: [{ selector: 'eager-dep' }]
        }] });
export class LazyDep {
}
LazyDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LazyDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
LazyDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LazyDep, isStandalone: true, selector: "lazy-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LazyDep, decorators: [{
            type: Directive,
            args: [{ selector: 'lazy-dep' }]
        }] });
export class LoadingDep {
}
LoadingDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LoadingDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
LoadingDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LoadingDep, isStandalone: true, selector: "loading-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LoadingDep, decorators: [{
            type: Directive,
            args: [{ selector: 'loading-dep' }]
        }] });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: EagerDep, selector: "eager-dep" }, { kind: "directive", type: LoadingDep, selector: "loading-dep" }], deferBlockDependencies: [() => [LazyDep]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `,
                    imports: [EagerDep, LazyDep, LoadingDep],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_local_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class EagerDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<EagerDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<EagerDep, "eager-dep", never, {}, {}, never, never, true, never>;
}
export declare class LazyDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LazyDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LazyDep, "lazy-dep", never, {}, {}, never, never, true, never>;
}
export declare class LoadingDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LoadingDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LoadingDep, "loading-dep", never, {}, {}, never, never, true, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_without_deps_followed_by_one_with.js
 ****************************************************************************************************/
import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class LazyDep {
}
LazyDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LazyDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
LazyDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LazyDep, isStandalone: true, selector: "lazy-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LazyDep, decorators: [{
            type: Directive,
            args: [{
                    selector: 'lazy-dep',
                }]
        }] });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      @defer {
        I'm so independent!
      }
      @defer {
        <lazy-dep/>
      }
    </div>
  `, isInline: true, deferBlockDependencies: [null, () => [LazyDep]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      @defer {
        I'm so independent!
      }
      @defer {
        <lazy-dep/>
      }
    </div>
  `,
                    imports: [LazyDep],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_without_deps_followed_by_one_with.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LazyDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LazyDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LazyDep, "lazy-dep", never, {}, {}, never, never, true, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps_eager.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class EagerDep {
}
EagerDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EagerDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
EagerDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: EagerDep, isStandalone: true, selector: "eager-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EagerDep, decorators: [{
            type: Directive,
            args: [{ selector: 'eager-dep' }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps_eager.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class EagerDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<EagerDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<EagerDep, "eager-dep", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps_lazy.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class LazyDep {
}
LazyDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LazyDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
LazyDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LazyDep, isStandalone: true, selector: "lazy-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LazyDep, decorators: [{
            type: Directive,
            args: [{ selector: 'lazy-dep', }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps_lazy.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LazyDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LazyDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LazyDep, "lazy-dep", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps_loading.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class LoadingDep {
}
LoadingDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LoadingDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
LoadingDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LoadingDep, isStandalone: true, selector: "loading-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LoadingDep, decorators: [{
            type: Directive,
            args: [{ selector: 'loading-dep' }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps_loading.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LoadingDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LoadingDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LoadingDep, "loading-dep", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import { EagerDep } from './deferred_with_external_deps_eager';
import { LoadingDep } from './deferred_with_external_deps_loading';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: EagerDep, selector: "eager-dep" }, { kind: "directive", type: LoadingDep, selector: "loading-dep" }], deferBlockDependencies: [() => [import("./deferred_with_external_deps_lazy").then(m => m.LazyDep)]] });
i0.ɵɵngDeclareClassMetadataAsync({ minVersion: "18.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, resolveDeferredDeps: () => [import("./deferred_with_external_deps_lazy").then(m => m.LazyDep)], resolveMetadata: LazyDep => ({ decorators: [{
                type: Component,
                args: [{
                        template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `,
                        imports: [EagerDep, LazyDep, LoadingDep],
                    }]
            }], ctorParameters: null, propDecorators: null }) });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_external_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_triggers.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
        this.isReady = true;
    }
    isVisible() {
        return false;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    {{message}}
    @defer (
      when isVisible() || isReady;
      on idle, timer(1337);
      on immediate, hover(button);
      on interaction(button);
      on viewport(button)) {
        {{message}}
      } @placeholder {
        <button #button>Click me</button>
      }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{message}}
    @defer (
      when isVisible() || isReady;
      on idle, timer(1337);
      on immediate, hover(button);
      on interaction(button);
      on viewport(button)) {
        {{message}}
      } @placeholder {
        <button #button>Click me</button>
      }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_triggers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    isReady: boolean;
    isVisible(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_prefetch_triggers.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
        this.isReady = true;
    }
    isVisible() {
        return false;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    {{message}}
    @defer (
      prefetch when isVisible() || isReady;
      prefetch on idle, timer(1337);
      prefetch on immediate, hover(button);
      prefetch on interaction(button);
      prefetch on viewport(button)) {
        {{message}}
      } @placeholder {
        <button #button>Click me</button>
      }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{message}}
    @defer (
      prefetch when isVisible() || isReady;
      prefetch on idle, timer(1337);
      prefetch on immediate, hover(button);
      prefetch on interaction(button);
      prefetch on viewport(button)) {
        {{message}}
      } @placeholder {
        <button #button>Click me</button>
      }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_prefetch_triggers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    isReady: boolean;
    isVisible(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer_with_hydrate_triggers.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
        this.isReady = true;
    }
    isVisible() {
        return false;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{message}}
    @defer (
      hydrate when isVisible() || isReady;
      hydrate on idle, timer(1337);
      hydrate on immediate, hover;
      hydrate on interaction;
      hydrate on viewport) {
      {{message}}
    }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{message}}
    @defer (
      hydrate when isVisible() || isReady;
      hydrate on idle, timer(1337);
      hydrate on immediate, hover;
      hydrate on interaction;
      hydrate on viewport) {
      {{message}}
    }
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: defer_with_hydrate_triggers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    isReady: boolean;
    isVisible(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer_hydrate_order.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.isReady = true;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @defer (when isReady; hydrate on timer(1337); prefetch on viewport) {
      Hello
    } @placeholder {
      <span>Placeholder</span>
    }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @defer (when isReady; hydrate on timer(1337); prefetch on viewport) {
      Hello
    } @placeholder {
      <span>Placeholder</span>
    }
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: defer_hydrate_order.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    isReady: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_when_with_pipe.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class TestPipe {
    transform() {
        return true;
    }
}
TestPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
TestPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, isStandalone: true, name: "testPipe" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'testPipe' }]
        }] });
export class MyApp {
    constructor() {
        this.message = 'hello';
        this.isReady = true;
    }
    isVisible() {
        return false;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{message}}
    @defer (when isVisible() && (isReady | testPipe)) {
      Hello
    }
  `, isInline: true, dependencies: [{ kind: "pipe", type: TestPipe, name: "testPipe" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{message}}
    @defer (when isVisible() && (isReady | testPipe)) {
      Hello
    }
  `,
                    imports: [TestPipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_when_with_pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestPipe {
    transform(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "testPipe", true>;
}
export declare class MyApp {
    message: string;
    isReady: boolean;
    isVisible(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_interaction_same_view_trigger.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {}

    <div>
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {}

    <div>
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_interaction_same_view_trigger.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_interaction_parent_view_trigger.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <ng-template>
      {{message}}
      <button #button>Click me</button>

      <ng-template>
        <ng-template>
          @defer (on interaction(button); prefetch on interaction(button)) {}
        </ng-template>
      </ng-template>
    </ng-template>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <ng-template>
      {{message}}
      <button #button>Click me</button>

      <ng-template>
        <ng-template>
          @defer (on interaction(button); prefetch on interaction(button)) {}
        </ng-template>
      </ng-template>
    </ng-template>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_interaction_parent_view_trigger.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_interaction_placeholder_trigger.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {
      Main
    } @placeholder {
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {
      Main
    } @placeholder {
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_interaction_placeholder_trigger.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_implicit_triggers.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.message = 'hello';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @defer (on hover, interaction, viewport; prefetch on hover, interaction, viewport) {
      {{message}}
    } @placeholder {
      <button>Click me</button>
    }
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @defer (on hover, interaction, viewport; prefetch on hover, interaction, viewport) {
      {{message}}
    } @placeholder {
      <button>Click me</button>
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_implicit_triggers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer_deps_ext.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class CmpA {
}
CmpA.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CmpA, deps: [], target: i0.ɵɵFactoryTarget.Component });
CmpA.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: CmpA, isStandalone: true, selector: "cmp-a", ngImport: i0, template: 'CmpA!', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CmpA, decorators: [{
            type: Component,
            args: [{ selector: 'cmp-a', template: 'CmpA!' }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: defer_deps_ext.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class CmpA {
    static ɵfac: i0.ɵɵFactoryDeclaration<CmpA, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CmpA, "cmp-a", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer_deps.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class LocalDep {
}
LocalDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LocalDep, deps: [], target: i0.ɵɵFactoryTarget.Component });
LocalDep.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LocalDep, isStandalone: true, selector: "local-dep", ngImport: i0, template: 'Local dependency', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LocalDep, decorators: [{
            type: Component,
            args: [{
                    selector: 'local-dep',
                    template: 'Local dependency',
                }]
        }] });
export class TestCmp {
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "test-cmp", ngImport: i0, template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`, isInline: true, deferBlockDependencies: [() => [import("./defer_deps_ext").then(m => m.CmpA), LocalDep]] });
i0.ɵɵngDeclareClassMetadataAsync({ minVersion: "18.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, resolveDeferredDeps: () => [import("./defer_deps_ext").then(m => m.CmpA)], resolveMetadata: CmpA => ({ decorators: [{
                type: Component,
                args: [{
                        selector: 'test-cmp',
                        imports: [CmpA, LocalDep],
                        template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`,
                    }]
            }], ctorParameters: null, propDecorators: null }) });

/****************************************************************************************************
 * PARTIAL FILE: defer_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LocalDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LocalDep, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LocalDep, "local-dep", never, {}, {}, never, never, true, never>;
}
export declare class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer_default_deps_ext.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class CmpA {
}
CmpA.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CmpA, deps: [], target: i0.ɵɵFactoryTarget.Component });
CmpA.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: CmpA, isStandalone: true, selector: "cmp-a", ngImport: i0, template: 'CmpA!', isInline: true });
export default CmpA;
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CmpA, decorators: [{
            type: Component,
            args: [{ selector: 'cmp-a', template: 'CmpA!' }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: defer_default_deps_ext.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export default class CmpA {
    static ɵfac: i0.ɵɵFactoryDeclaration<CmpA, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CmpA, "cmp-a", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer_default_deps.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class LocalDep {
}
LocalDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LocalDep, deps: [], target: i0.ɵɵFactoryTarget.Component });
LocalDep.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LocalDep, isStandalone: true, selector: "local-dep", ngImport: i0, template: 'Local dependency', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LocalDep, decorators: [{
            type: Component,
            args: [{
                    selector: 'local-dep',
                    template: 'Local dependency',
                }]
        }] });
export class TestCmp {
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "test-cmp", ngImport: i0, template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`, isInline: true, deferBlockDependencies: [() => [import("./defer_default_deps_ext").then(m => m.default), LocalDep]] });
i0.ɵɵngDeclareClassMetadataAsync({ minVersion: "18.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, resolveDeferredDeps: () => [import("./defer_default_deps_ext").then(m => m.default)], resolveMetadata: CmpA => ({ decorators: [{
                type: Component,
                args: [{
                        selector: 'test-cmp',
                        imports: [CmpA, LocalDep],
                        template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`,
                    }]
            }], ctorParameters: null, propDecorators: null }) });

/****************************************************************************************************
 * PARTIAL FILE: defer_default_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LocalDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<LocalDep, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LocalDep, "local-dep", never, {}, {}, never, never, true, never>;
}
export declare class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: lazy_with_blocks.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class MyLazyCmp {
}
MyLazyCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyLazyCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyLazyCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyLazyCmp, isStandalone: true, selector: "my-lazy-cmp", ngImport: i0, template: 'Hi!', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyLazyCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-lazy-cmp',
                    template: 'Hi!',
                }]
        }] });
class SimpleComponent {
    constructor() {
        this.isVisible = false;
    }
    ngOnInit() {
        setTimeout(() => {
            // This changes the triggering condition of the defer block,
            // but it should be ignored and the placeholder content should be visible.
            this.isVisible = true;
        });
    }
}
SimpleComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleComponent, isStandalone: true, selector: "app", ngImport: i0, template: `
		Visible: {{ isVisible }}.

		@defer (when isVisible) {
			<my-lazy-cmp />
		} @loading {
			Loading...
		} @placeholder {
			Placeholder!
		} @error {
			Failed to load dependencies :(
		}
	`, isInline: true, deferBlockDependencies: [() => [MyLazyCmp]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    imports: [MyLazyCmp],
                    template: `
		Visible: {{ isVisible }}.

		@defer (when isVisible) {
			<my-lazy-cmp />
		} @loading {
			Loading...
		} @placeholder {
			Placeholder!
		} @error {
			Failed to load dependencies :(
		}
	`
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: lazy_with_blocks.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_duplicate_external_dep_lazy.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class DuplicateLazyDep {
}
DuplicateLazyDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DuplicateLazyDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DuplicateLazyDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DuplicateLazyDep, isStandalone: true, selector: "duplicate-lazy-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DuplicateLazyDep, decorators: [{
            type: Directive,
            args: [{ selector: 'duplicate-lazy-dep' }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_duplicate_external_dep_lazy.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DuplicateLazyDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<DuplicateLazyDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DuplicateLazyDep, "duplicate-lazy-dep", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_duplicate_external_dep_other.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class OtherLazyDep {
}
OtherLazyDep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherLazyDep, deps: [], target: i0.ɵɵFactoryTarget.Directive });
OtherLazyDep.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OtherLazyDep, isStandalone: true, selector: "other-lazy-dep", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherLazyDep, decorators: [{
            type: Directive,
            args: [{ selector: 'other-lazy-dep' }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_duplicate_external_dep_other.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class OtherLazyDep {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherLazyDep, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<OtherLazyDep, "other-lazy-dep", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_duplicate_external_dep.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <other-lazy-dep/>
    }
  `, isInline: true, deferBlockDependencies: [() => [import("./deferred_with_duplicate_external_dep_lazy").then(m => m.DuplicateLazyDep)], () => [import("./deferred_with_duplicate_external_dep_lazy").then(m => m.DuplicateLazyDep)], () => [import("./deferred_with_duplicate_external_dep_other").then(m => m.OtherLazyDep)]] });
i0.ɵɵngDeclareClassMetadataAsync({ minVersion: "18.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, resolveDeferredDeps: () => [import("./deferred_with_duplicate_external_dep_lazy").then(m => m.DuplicateLazyDep), import("./deferred_with_duplicate_external_dep_other").then(m => m.OtherLazyDep)], resolveMetadata: (DuplicateLazyDep, OtherLazyDep) => ({ decorators: [{
                type: Component,
                args: [{
                        template: `
    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <other-lazy-dep/>
    }
  `,
                        imports: [DuplicateLazyDep, OtherLazyDep],
                    }]
            }], ctorParameters: null, propDecorators: null }) });

/****************************************************************************************************
 * PARTIAL FILE: deferred_with_duplicate_external_dep.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

