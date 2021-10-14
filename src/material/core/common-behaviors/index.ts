/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {
  MatCommonModule,
  MATERIAL_SANITY_CHECKS,
  SanityChecks,
  GranularSanityChecks,
} from './common-module';

// Note: These need to be exposed privately for cross-package type inference. e.g. if the
// experimental package uses a mixin, TS will try to write an explicit type reference that
// is equivalent to e.g. `CanColorCtor`. For this it needs these two helpers as otherwise it
// would generate a deep cross-package import that breaks in the NPM package output.
export {
  Constructor as _Constructor,
  AbstractConstructor as _AbstractConstructor,
} from './constructor';

export {CanDisable, mixinDisabled} from './disabled';
export {CanColor, mixinColor, ThemePalette} from './color';
export {CanDisableRipple, mixinDisableRipple} from './disable-ripple';
export {HasTabIndex, mixinTabIndex} from './tabindex';
export {CanUpdateErrorState, mixinErrorState} from './error-state';
export {HasInitialized, mixinInitialized} from './initialized';
