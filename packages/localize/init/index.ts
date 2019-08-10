/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {$localize, LocalizeFn, _global} from '../src/localize';

export {LocalizeFn, TranslateFn} from '../src/localize';

// Attach $localize to the global context, as a side-effect of this module.
_global.$localize = $localize;

// `declare global` allows us to escape the current module and place types on the global namespace
declare global {
  /**
   * Tag a template literal string for localization.
   *
   * For example:
   *
   * ```ts
   * $localize `some string to localize`
   * ```
   *
   * **Naming placeholders**
   *
   * If the template literal string contains expressions then you can optionally name the
   * placeholder
   * associated with each expression. Do this by providing the placeholder name wrapped in `:`
   * characters directly after the expression. These placeholder names are stripped out of the
   * rendered localized string.
   *
   * For example, to name the `item.length` expression placeholder `itemCount` you write:
   *
   * ```ts
   * $localize `There are ${item.length}:itemCount: items`;
   * ```
   *
   * If you need to use a `:` character directly an expression you must either provide a name or you
   * can escape the `:` by preceding it with a backslash:
   *
   * For example:
   *
   * ```ts
   * $localize `${label}:label:: ${}`
   * // or
   * $localize `${label}\: ${}`
   * ```
   *
   * **Processing localized strings:**
   *
   * There are three scenarios:
   *
   * * **compile-time inlining**: the `$localize` tag is transformed at compile time by a
   * transpiler,
   * removing the tag and replacing the template literal string with a translated literal string
   * from a collection of translations provided to the transpilation tool.
   *
   * * **run-time evaluation**: the `$localize` tag is a run-time function that replaces and
   * reorders
   * the parts (static strings and expressions) of the template literal string with strings from a
   * collection of translations loaded at run-time.
   *
   * * **pass-through evaluation**: the `$localize` tag is a run-time function that simply evaluates
   * the original template literal string without applying any translations to the parts. This
   * version
   * is used during development or where there is no need to translate the localized template
   * literals.
   *
   * @param messageParts a collection of the static parts of the template string.
   * @param expressions a collection of the values of each placeholder in the template string.
   * @returns the translated string, with the `messageParts` and `expressions` interleaved together.
   */
  const $localize: LocalizeFn;
}
