/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the router/testing package.
 */
export * from './router_testing_module';
export {RouterTestingHarness} from './router_testing_harness';

// Re-export the symbols that are exposed by the `RouterTestingModule` (which re-exports
// the symbols from the `RouterModule`). Re-exports are needed for the Angular compiler
// to overcome its limitation (on the consumer side) of not knowing where to import import
// symbols when relative imports are used within the package.
// Note: These exports need to be stable and shouldn't be renamed unnecessarily because
// consuming libraries might have references to them in their own partial compilation output.
export {RouterOutlet as ɵɵRouterOutlet} from '../../src/directives/router_outlet';
export {RouterLink as ɵɵRouterLink} from '../../src/directives/router_link';
export {RouterLinkActive as ɵɵRouterLinkActive} from '../../src/directives/router_link_active';
export {EmptyOutletComponent as ɵɵEmptyOutletComponent} from '../../src/components/empty_outlet';
