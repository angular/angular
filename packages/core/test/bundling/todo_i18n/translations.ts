/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Make the `$localize()` global function available to the compiled templates, and the direct calls
// below. This would normally be done inside the application `polyfills.ts` file.
import '@angular/localize/init';
import {loadTranslations} from '@angular/localize';

export const translations = {
  // What needs to be done?
  '5102526651904871634': `Qu'y a-t-il à faire ?`,
  // {$START_HEADING_LEVEL1}todos{$CLOSE_HEADING_LEVEL1}{$TAG_INPUT}
  '8643091609122689720':
      '{$START_HEADING_LEVEL1}liste de tâches{$CLOSE_HEADING_LEVEL1}{$TAG_INPUT}',
  // {VAR_PLURAL, plural, =1 {item left} other {items left}}
  '271375439086996113': '{VAR_PLURAL, plural, =1 {tâche restante} other {tâches restantes}}',
  // {$START_TAG_STRONG}{$INTERPOLATION}{$CLOSE_TAG_STRONG}{$ICU}
  '4169337202119891309': '{$START_TAG_STRONG}{$INTERPOLATION}{$CLOSE_TAG_STRONG} {$ICU}',
  // Clear Completed
  '3329962774478249377': ' Effacer terminés ',
  // Demonstrate Components
  '5738403869589701812': ' Démontrer les components',
  // Demonstrate Structural Directives
  '4405796757024158842': 'Démontrer les directives structurelles',
  // Demonstrate {$value}
  '2762077329405284613': 'Démontrer {$value}',
  // Demonstrate zoneless change detection
  '3484387157632222646': 'Démontrer la détection des changements sans zonejs',
  // Demonstrate internationalization
  '442837859415373816': `Démontrer l'internationalisation`
};

loadTranslations(translations);
