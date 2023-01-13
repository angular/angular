/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 * This file is the index file collecting all of the symbols published on the global.ng namespace.
 *
 * The reason why this file/module is separate global_utils.ts file is that we use this file
 * to generate a d.ts file containing all the published symbols that is then compared to the golden
 * file in the public_api_guard test.
 */

export {applyChanges} from './util/change_detection_utils';
export {ComponentDebugMetadata, DirectiveDebugMetadata, getComponent, getContext, getDirectiveMetadata, getDirectives, getHostElement, getInjector, getListeners, getOwningComponent, getRootComponents, Listener} from './util/discovery_utils';
