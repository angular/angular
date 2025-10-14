/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { ContainerType } from '../../../../../../../../../../protocol';
type EditorType = string | number | boolean;
type EditorResult = EditorType | Array<EditorType>;
declare enum PropertyEditorState {
    Read = 0,
    Write = 1
}
export declare class PropertyEditorComponent {
    readonly key: import("@angular/core").InputSignal<string>;
    readonly initialValue: import("@angular/core").InputSignal<EditorResult>;
    readonly containerType: import("@angular/core").InputSignal<ContainerType | undefined>;
    readonly updateValue: import("@angular/core").OutputEmitterRef<EditorResult>;
    readonly inputEl: import("@angular/core").Signal<ElementRef<HTMLInputElement> | undefined>;
    readState: PropertyEditorState;
    writeState: PropertyEditorState;
    readonly valueToSubmit: import("@angular/core").WritableSignal<EditorResult | undefined>;
    readonly currentPropertyState: import("@angular/core").WritableSignal<PropertyEditorState>;
    constructor();
    accept(): void;
    reject(): void;
    onClick(): void;
    onBlur(): void;
}
export {};
