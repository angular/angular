/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MetadataOverride } from './metadata_override';
export declare class MetadataOverrider {
    private _references;
    /**
     * Creates a new instance for the given metadata class
     * based on an old instance and overrides.
     */
    overrideMetadata<C extends T, T>(metadataClass: {
        new (options: T): C;
    }, oldMetadata: C, override: MetadataOverride<T>): C;
}
