/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare var global: any;
declare var window: any;

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

// Runtime i18n uses Closure goog.getMsg for now
// It will be replaced by the runtime service for external people
const glob = typeof global !== 'undefined' ? global : window;
glob.goog = glob.goog || {};
glob.goog.getMsg =
    glob.goog.getMsg || function(input: string, placeholders: {[key: string]: string} = {}) {
      if (typeof translations[input] !== 'undefined') {  // to account for empty string
        input = translations[input];
      }
      return Object.keys(placeholders).length ?
          input.replace(/\{\$(.*?)\}/g, (match, key) => placeholders[key] || '') :
          input;
    };

export const localize = goog.getMsg;
