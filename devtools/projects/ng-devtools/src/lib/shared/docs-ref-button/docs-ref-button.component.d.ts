/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
type Docs = 'view-encapsulation' | 'change-detection' | 'dependency-injection' | 'injector-hierarchies';
export declare class DocsRefButtonComponent {
    protected readonly docs: import("@angular/core").InputSignal<Docs>;
    protected readonly url: import("@angular/core").Signal<string>;
}
export {};
