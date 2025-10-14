/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Below are constants for LView indices to help us look up LView members
// without having to remember the specific indices.
// Uglify will inline these when minifying so there shouldn't be a cost.
export const HOST = 0;
export const TVIEW = 1;
// Shared with LContainer
export const FLAGS = 2;
export const PARENT = 3;
export const NEXT = 4;
export const T_HOST = 5;
// End shared with LContainer
export const HYDRATION = 6;
export const CLEANUP = 7;
export const CONTEXT = 8;
export const INJECTOR = 9;
export const ENVIRONMENT = 10;
export const RENDERER = 11;
export const CHILD_HEAD = 12;
export const CHILD_TAIL = 13;
// FIXME(misko): Investigate if the three declarations aren't all same thing.
export const DECLARATION_VIEW = 14;
export const DECLARATION_COMPONENT_VIEW = 15;
export const DECLARATION_LCONTAINER = 16;
export const PREORDER_HOOK_FLAGS = 17;
export const QUERIES = 18;
export const ID = 19;
export const EMBEDDED_VIEW_INJECTOR = 20;
export const ON_DESTROY_HOOKS = 21;
export const EFFECTS_TO_SCHEDULE = 22;
export const EFFECTS = 23;
export const REACTIVE_TEMPLATE_CONSUMER = 24;
export const AFTER_RENDER_SEQUENCES_TO_ADD = 25;
export const ANIMATIONS = 26;
/**
 * Size of LView's header. Necessary to adjust for it when setting slots.
 *
 * IMPORTANT: `HEADER_OFFSET` should only be referred to the in the `ɵɵ*` instructions to translate
 * instruction index into `LView` index. All other indexes should be in the `LView` index space and
 * there should be no need to refer to `HEADER_OFFSET` anywhere else.
 */
export const HEADER_OFFSET = 27;
//# sourceMappingURL=view.js.map
