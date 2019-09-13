/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface LocalizeFn {
  (messageParts: TemplateStringsArray, ...expressions: readonly any[]): string;

  /**
   * A function that converts an input "message with expressions" into a translated "message with
   * expressions".
   *
   * The conversion may be done in place, modifying the array passed to the function, so
   * don't assume that this has no side-effects.
   *
   * The expressions must be passed in since it might be they need to be reordered for
   * different translations.
   */
  translate?: TranslateFn;
}

export interface TranslateFn {
  (messageParts: TemplateStringsArray,
   expressions: readonly any[]): [TemplateStringsArray, readonly any[]];
}

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
 * If the template literal string contains expressions then you can optionally name the placeholder
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
 * * **compile-time inlining**: the `$localize` tag is transformed at compile time by a transpiler,
 * removing the tag and replacing the template literal string with a translated literal string
 * from a collection of translations provided to the transpilation tool.
 *
 * * **run-time evaluation**: the `$localize` tag is a run-time function that replaces and reorders
 * the parts (static strings and expressions) of the template literal string with strings from a
 * collection of translations loaded at run-time.
 *
 * * **pass-through evaluation**: the `$localize` tag is a run-time function that simply evaluates
 * the original template literal string without applying any translations to the parts. This version
 * is used during development or where there is no need to translate the localized template
 * literals.
 *
 * @param messageParts a collection of the static parts of the template string.
 * @param expressions a collection of the values of each placeholder in the template string.
 * @returns the translated string, with the `messageParts` and `expressions` interleaved together.
 */
export const $localize: LocalizeFn = function(
    messageParts: TemplateStringsArray, ...expressions: readonly any[]) {
  if ($localize.translate) {
    // Don't use array expansion here to avoid the compiler adding `__read()` helper unnecessarily.
    const translation = $localize.translate(messageParts, expressions);
    messageParts = translation[0];
    expressions = translation[1];
  }
  let message = stripBlock(messageParts[0], messageParts.raw[0]);
  for (let i = 1; i < messageParts.length; i++) {
    message += expressions[i - 1] + stripBlock(messageParts[i], messageParts.raw[i]);
  }
  return message;
};

const BLOCK_MARKER = ':';

/**
 * Strip a delimited "block" from the start of the `messagePart`, if it is found.
 *
 * If a marker character (:) actually appears in the content at the start of a tagged string or
 * after a substitution expression, where a block has not been provided the character must be
 * escaped with a backslash, `\:`. This function checks for this by looking at the `raw`
 * messagePart, which should still contain the backslash.
 *
 * If the template literal was synthesized, rather than appearing in original source code, then its
 * raw array will only contain empty strings. This is because the current TypeScript compiler use
 * the original source code to find the raw text and in the case of synthesized AST nodes, there is
 * no source code to draw upon.
 *
 * The workaround in this function is to assume that the template literal did not contain an escaped
 * placeholder name, and fall back on checking the cooked array instead. This should be OK because
 * synthesized nodes (from the Angular template compiler) will always provide explicit delimited
 * blocks and so will never need to escape placeholder name markers.
 *
 * @param messagePart The cooked message part to process.
 * @param rawMessagePart The raw message part to check.
 * @returns the message part with the placeholder name stripped, if found.
 */
function stripBlock(messagePart: string, rawMessagePart: string) {
  return (rawMessagePart || messagePart).charAt(0) === BLOCK_MARKER ?
      messagePart.substring(messagePart.indexOf(BLOCK_MARKER, 1) + 1) :
      messagePart;
}
