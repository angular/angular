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

// Everything from `material/autocomplete`, except for `MatAutcomplete` and `MatAutocompleteModule`.
export {
  getMatAutocompleteMissingPanelError as getMatLegacyAutocompleteMissingPanelError,
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS as MAT_LEGACY_AUTOCOMPLETE_DEFAULT_OPTIONS,
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY as MAT_LEGACY_AUTOCOMPLETE_SCROLL_STRATEGY,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER as MAT_LEGACY_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatAutocompleteActivatedEvent as MatLegacyAutocompleteActivatedEvent,
  MatAutocompleteDefaultOptions as MatLegacyAutocompleteDefaultOptions,
  MatAutocompleteSelectedEvent as MatLegacyAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
