/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './module';
export * from './autocomplete';
export * from './autocomplete-origin';
export * from './autocomplete-trigger';

// Everything from `material/autocomplete`, except for `MatAutcomplete` and `MatAutocompleteModule`.
export {
  getMatAutocompleteMissingPanelError,
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatAutocompleteActivatedEvent,
  MatAutocompleteDefaultOptions,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
