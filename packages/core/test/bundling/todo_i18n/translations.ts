/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Make the `$localize()` global function available to the compiled templates, and the direct calls
// below. This would normally be done inside the application `polyfills.ts` file.
import '@angular/localize/init';

import {computeMsgId} from '@angular/compiler';
import {loadTranslations} from '@angular/localize';

export const translations = {
  [computeMsgId('What needs to be done?', '')]: `Qu'y a-t-il à faire ?`,
  [computeMsgId('{$START_HEADING_LEVEL1}todos{$CLOSE_HEADING_LEVEL1}{$TAG_INPUT}', '')]:
      '{$START_HEADING_LEVEL1}liste de tâches{$CLOSE_HEADING_LEVEL1}{$TAG_INPUT}',
  [computeMsgId('{VAR_PLURAL, plural, =1 {item left} other {items left}}', '')]:
      '{VAR_PLURAL, plural, =1 {tâche restante} other {tâches restantes}}',
  [computeMsgId('{$START_TAG_STRONG}{$INTERPOLATION}{$CLOSE_TAG_STRONG}{$ICU}', '')]:
      '{$START_TAG_STRONG}{$INTERPOLATION}{$CLOSE_TAG_STRONG} {$ICU}',
  [computeMsgId('Clear Completed', '')]: ' Effacer terminés ',
  [computeMsgId('Demonstrate Components', '')]: ' Démontrer les components',
  [computeMsgId('Demonstrate Structural Directives', '')]: 'Démontrer les directives structurelles',
  [computeMsgId('Demonstrate {$value}', '')]: 'Démontrer {$value}',
  [computeMsgId('Demonstrate zoneless change detection', '')]:
      'Démontrer la détection des changements sans zonejs',
  [computeMsgId('Demonstrate internationalization', '')]: `Démontrer l'internationalisation`
};

loadTranslations(translations);
