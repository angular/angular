/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
/** Represents `import.meta` plus some information that's not in the built-in types. */
type ImportMetaExtended = ImportMeta & {
    hot?: {
        send?: (name: string, payload: unknown) => void;
    };
};
/**
 * Gets the URL from which the client will fetch a new version of a component's metadata so it
 * can be replaced during hot module reloading.
 * @param id Unique ID for the component, generated during compile time.
 * @param timestamp Time at which the request happened.
 * @param base Base URL against which to resolve relative paths.
 * @codeGenApi
 */
export declare function ɵɵgetReplaceMetadataURL(id: string, timestamp: string, base: string): string;
/**
 * Replaces the metadata of a component type and re-renders all live instances of the component.
 * @param type Class whose metadata will be replaced.
 * @param applyMetadata Callback that will apply a new set of metadata on the `type` when invoked.
 * @param environment Syntehtic namespace imports that need to be passed along to the callback.
 * @param locals Local symbols from the source location that have to be exposed to the callback.
 * @param importMeta `import.meta` from the call site of the replacement function. Optional since
 *   it isn't used internally.
 * @param id ID to the class being replaced. **Not** the same as the component definition ID.
 *   Optional since the ID might not be available internally.
 * @codeGenApi
 */
export declare function ɵɵreplaceMetadata(type: Type<unknown>, applyMetadata: (...args: [Type<unknown>, unknown[], ...unknown[]]) => void, namespaces: unknown[], locals: unknown[], importMeta?: ImportMetaExtended | null, id?: string | null): void;
export {};
