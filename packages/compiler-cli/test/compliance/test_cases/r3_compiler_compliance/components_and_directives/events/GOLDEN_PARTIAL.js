/****************************************************************************************************
 * PARTIAL FILE: listener_modifiers.js
 ****************************************************************************************************/
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComp {
    stop = new EventEmitter();
    clickedHere = new EventEmitter();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComp, isStandalone: true, selector: "my-comp", outputs: { stop: "stop", clickedHere: "clicked.here" }, ngImport: i0, template: ``, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-comp',
                    template: ``,
                }]
        }], propDecorators: { stop: [{
                type: Output
            }], clickedHere: [{
                type: Output,
                args: ['clicked.here']
            }] } });
export class EventModifiers {
    onClick() { }
    onStop() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EventModifiers, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: EventModifiers, isStandalone: true, selector: "my-comp", ngImport: i0, template: `
    <button (click.prevent)="onClick()"></button>
    <button (click.stop)="onClick()"></button>
    <button (click.debounce.500)="onClick()"></button>
    <button (click.prevent.stop)="onClick()"></button>
    <my-comp (clicked.here)="onClick()" (stop)="onStop()"/>
  `, isInline: true, dependencies: [{ kind: "component", type: EventModifiers, selector: "my-comp" }, { kind: "component", type: MyComp, selector: "my-comp", outputs: ["stop", "clicked.here"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EventModifiers, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-comp',
                    imports: [MyComp],
                    template: `
    <button (click.prevent)="onClick()"></button>
    <button (click.stop)="onClick()"></button>
    <button (click.debounce.500)="onClick()"></button>
    <button (click.prevent.stop)="onClick()"></button>
    <my-comp (clicked.here)="onClick()" (stop)="onStop()"/>
  `,
                    standalone: true
                }]
        }] });
export class MockNgModel {
    ngModel;
    ngModelChange = new EventEmitter();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MockNgModel, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MockNgModel, isStandalone: true, selector: "[ngModel]", inputs: { ngModel: "ngModel" }, outputs: { ngModelChange: "ngModelChange" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MockNgModel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngModel]',
                    standalone: true
                }]
        }], propDecorators: { ngModel: [{
                type: Input
            }], ngModelChange: [{
                type: Output
            }] } });
export class TwoWayModifiers {
    name = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TwoWayModifiers, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TwoWayModifiers, isStandalone: true, selector: "two-way", ngImport: i0, template: `
    <input [(ngModel.debounce.200)]="name">
  `, isInline: true, dependencies: [{ kind: "directive", type: MockNgModel, selector: "[ngModel]", inputs: ["ngModel"], outputs: ["ngModelChange"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TwoWayModifiers, decorators: [{
            type: Component,
            args: [{
                    selector: 'two-way',
                    template: `
    <input [(ngModel.debounce.200)]="name">
  `,
                    standalone: true,
                    imports: [MockNgModel]
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: listener_modifiers.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComp {
    stop: EventEmitter<void>;
    clickedHere: EventEmitter<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, { "stop": "stop"; "clickedHere": "clicked.here"; }, never, never, true, never>;
}
export declare class EventModifiers {
    onClick(): void;
    onStop(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EventModifiers, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EventModifiers, "my-comp", never, {}, {}, never, never, true, never>;
}
export declare class MockNgModel {
    ngModel: any;
    ngModelChange: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MockNgModel, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MockNgModel, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": false; }; }, { "ngModelChange": "ngModelChange"; }, never, never, true, never>;
}
export declare class TwoWayModifiers {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TwoWayModifiers, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TwoWayModifiers, "two-way", never, {}, {}, never, never, true, never>;
}

