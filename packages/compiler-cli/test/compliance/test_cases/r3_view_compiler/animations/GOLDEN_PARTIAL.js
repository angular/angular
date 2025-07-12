/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_string.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div>
      <p animate.enter="slide">Sliding Content</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div>
      <p animate.enter="slide">Sliding Content</p>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_string.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_string_host_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class ChildComponent {
}
ChildComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ChildComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ChildComponent, isStandalone: true, selector: "child-component", host: { attributes: { "animate.enter": "fade" } }, ngImport: i0, template: `<p>Sliding Content</p>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'child-component',
                    host: { 'animate.enter': 'fade' },
                    template: `<p>Sliding Content</p>`,
                }]
        }] });
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <child-component animate.enter="slide"></child-component>
  `, isInline: true, dependencies: [{ kind: "component", type: ChildComponent, selector: "child-component" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    imports: [ChildComponent],
                    template: `
    <child-component animate.enter="slide"></child-component>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_string_host_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ChildComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChildComponent, "child-component", never, {}, {}, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_binding.js
 ****************************************************************************************************/
import { Component, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.enterClass = signal('slide', ...(ngDevMode ? [{ debugName: "enterClass" }] : []));
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div>
      <p [animate.enter]="enterClass()">Sliding Content</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div>
      <p [animate.enter]="enterClass()">Sliding Content</p>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    enterClass: import("@angular/core").WritableSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_event_listener.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    slideFn(event) {
        event.target.classList.add('slide-in');
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div>
      <p (animate.enter)="slideFn($event)">Sliding Content</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div>
      <p (animate.enter)="slideFn($event)">Sliding Content</p>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_enter_with_event_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    slideFn(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_string.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div>
      <p animate.leave="fade">Fading Content</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div>
      <p animate.leave="fade">Fading Content</p>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_string.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_binding.js
 ****************************************************************************************************/
import { Component, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.leaveClass = signal('fade', ...(ngDevMode ? [{ debugName: "leaveClass" }] : []));
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div>
      <p [animate.leave]="leaveClass()">Fading Content</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div>
      <p [animate.leave]="leaveClass()">Fading Content</p>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    leaveClass: import("@angular/core").WritableSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_event_listener.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    fadeFn(event) {
        event.target.classList.add('fade-out');
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div>
      <p (animate.leave)="fadeFn($event)">Fading Content</p>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div>
      <p (animate.leave)="fadeFn($event)">Fading Content</p>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_event_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    fadeFn(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_string_host_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class ChildComponent {
}
ChildComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ChildComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ChildComponent, isStandalone: true, selector: "child-component", host: { attributes: { "animate.leave": "fade" } }, ngImport: i0, template: `<p>Fading Content</p>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'child-component',
                    template: `<p>Fading Content</p>`,
                    host: { 'animate.leave': 'fade' },
                }]
        }] });
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
      <child-component animate.leave="slide"></child-component>
  `, isInline: true, dependencies: [{ kind: "component", type: ChildComponent, selector: "child-component" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    imports: [ChildComponent],
                    template: `
      <child-component animate.leave="slide"></child-component>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: animate_leave_with_string_host_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ChildComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChildComponent, "child-component", never, {}, {}, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

