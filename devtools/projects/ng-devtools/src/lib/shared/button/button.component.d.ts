/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
type ButtonType = 'primary' | 'icon';
type ButtonSize = 'standard' | 'mid' | 'compact';
export declare class ButtonComponent {
    readonly btnType: import("@angular/core").InputSignal<ButtonType>;
    readonly size: import("@angular/core").InputSignal<ButtonSize>;
}
export {};
