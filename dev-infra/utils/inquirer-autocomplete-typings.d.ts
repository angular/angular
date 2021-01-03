/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// inquirer-autocomplete-prompt doesn't provide types and no types are made available via
// DefinitelyTyped.
declare module "inquirer-autocomplete-prompt" {

  import {registerPrompt} from 'inquirer';

  let AutocompletePrompt: Parameters<typeof registerPrompt>[1];
  export = AutocompletePrompt;
}
