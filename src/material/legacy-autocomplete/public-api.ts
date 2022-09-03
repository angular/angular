/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyAutocomplete} from './autocomplete';
export {MatLegacyAutocompleteModule} from './autocomplete-module';
export {
  MAT_LEGACY_AUTOCOMPLETE_VALUE_ACCESSOR,
  MatLegacyAutocompleteTrigger,
} from './autocomplete-trigger';
export {MatLegacyAutocompleteOrigin} from './autocomplete-origin';

export {
  /**
   * @deprecated Use `getMatAutocompleteMissingPanelError` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  getMatAutocompleteMissingPanelError as getMatLegacyAutocompleteMissingPanelError,

  /**
   * @deprecated Use `MAT_AUTOCOMPLETE_DEFAULT_OPTIONS` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS as MAT_LEGACY_AUTOCOMPLETE_DEFAULT_OPTIONS,

  /**
   * @deprecated Use `MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,

  /**
   * @deprecated Use `MAT_AUTOCOMPLETE_SCROLL_STRATEGY` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY as MAT_LEGACY_AUTOCOMPLETE_SCROLL_STRATEGY,

  /**
   * @deprecated Use `MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,

  /**
   * @deprecated Use `MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER as MAT_LEGACY_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,

  /**
   * @deprecated Use `MatAutocompleteActivatedEvent` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatAutocompleteActivatedEvent as MatLegacyAutocompleteActivatedEvent,

  /**
   * @deprecated Use `MatAutocompleteDefaultOptions` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatAutocompleteDefaultOptions as MatLegacyAutocompleteDefaultOptions,

  /**
   * @deprecated Use `MatAutocompleteSelectedEvent` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatAutocompleteSelectedEvent as MatLegacyAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
