/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SerializedInjector } from '../../../../../../../../../../protocol';
export declare const NODE_TYPE_CLASS_MAP: {
    [key in SerializedInjector['type']]: string;
};
export declare class ResolutionPathComponent {
    readonly path: import("@angular/core").InputSignal<SerializedInjector[]>;
    readonly reversedPath: import("@angular/core").Signal<SerializedInjector[]>;
    NODE_TYPE_CLASS_MAP: {
        hidden: string;
        environment: string;
        null: string;
        element: string;
        "imported-module": string;
    };
}
