/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵi18nConfigureLocalize} from '@angular/core';

export const translations: {[key: string]: string} = {
  'What needs to be done?': `Qu'y a-t-il à faire ?`,
  '{$startHeadingLevel1}todos{$closeHeadingLevel1}{$tagInput}':
      '{$startHeadingLevel1}liste de tâches{$closeHeadingLevel1}{$tagInput}',
  '{VAR_PLURAL, plural, =1 {item left} other {items left}}':
      '{VAR_PLURAL, plural, =1 {tâche restante} other {tâches restantes}}',
  '{$startTagStrong}{$interpolation}{$closeTagStrong}{$icu}':
      '{$startTagStrong}{$interpolation}{$closeTagStrong} {$icu}',
  ' Clear completed ': ' Effacer terminés ',
  'Demonstrate Components': 'Démontrer les components',
  'Demonstrate Structural Directives': 'Démontrer les directives structurelles',
  'Demonstrate {$value}': 'Démontrer {$value}',
  'Demonstrate zoneless change detection': 'Démontrer la détection des changements sans zonejs',
  'Demonstrate internationalization': `Démontrer l'internationalisation`
};

ɵi18nConfigureLocalize({translations});
