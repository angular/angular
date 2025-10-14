/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef } from '../application/application_ref';
import { TView } from '../render3/interfaces/view';
import { SerializedDeferBlock, SerializedView } from './interfaces';
import { TextNodeMarker } from './utils';
/**
 * A collection that tracks all serialized views (`ngh` DOM annotations)
 * to avoid duplication. An attempt to add a duplicate view results in the
 * collection returning the index of the previously collected serialized view.
 * This reduces the number of annotations needed for a given page.
 */
declare class SerializedViewCollection {
    private views;
    private indexByContent;
    add(serializedView: SerializedView): number;
    getAll(): SerializedView[];
}
/**
 * Describes a context available during the serialization
 * process. The context is used to share and collect information
 * during the serialization.
 */
export interface HydrationContext {
    serializedViewCollection: SerializedViewCollection;
    corruptedTextNodes: Map<HTMLElement, TextNodeMarker>;
    isI18nHydrationEnabled: boolean;
    isIncrementalHydrationEnabled: boolean;
    i18nChildren: Map<TView, Set<number> | null>;
    eventTypesToReplay: {
        regular: Set<string>;
        capture: Set<string>;
    };
    shouldReplayEvents: boolean;
    appId: string;
    deferBlocks: Map<string, SerializedDeferBlock>;
}
/**
 * Annotates all components bootstrapped in a given ApplicationRef
 * with info needed for hydration.
 *
 * @param appRef An instance of an ApplicationRef.
 * @param doc A reference to the current Document instance.
 * @return event types that need to be replayed
 */
export declare function annotateForHydration(appRef: ApplicationRef, doc: Document): {
    regular: Set<string>;
    capture: Set<string>;
};
export {};
