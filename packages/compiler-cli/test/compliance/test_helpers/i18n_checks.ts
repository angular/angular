/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EXTRACT_GENERATED_TRANSLATIONS_REGEXP =
    /const\s*(.*?)\s*=\s*goog\.getMsg\("(.*?)",?\s*(.*?)\)/g;

/**
 * Verify that placeholders in translation strings match placeholders in the object defined in the
 * `goog.getMsg()` function arguments.
 */
export function verifyPlaceholdersIntegrity(output: string): boolean {
  const translations = extractTranslations(output);
  translations.forEach(([msg, args]) => {
    const bodyPhs = extractPlaceholdersFromMsg(msg);
    const argsPhs = extractPlaceholdersFromArgs(args);
    if (bodyPhs.size !== argsPhs.size || diff(bodyPhs, argsPhs).size) {
      return false;
    }
  });
  return true;
}

/**
 * Verify that all the variables initialized with `goog.getMsg()` calls have
 * unique names.
 */
export function verifyUniqueConsts(output: string): boolean {
  extract(
      output, EXTRACT_GENERATED_TRANSLATIONS_REGEXP,
      (current: string[], state: Set<string>): string => {
        const key = current[1];
        if (state.has(key)) {
          throw new Error(`Duplicate const ${key} found in generated output!`);
        }
        return key;
      });
  return true;
}


/**
 * Extract pairs of `[msg, placeholders]`, in calls to `goog.getMsg()`, from the `source`.
 *
 * @param source The source code to parse.
 */
function extractTranslations(source: string): Set<string[]> {
  return extract(
      source, EXTRACT_GENERATED_TRANSLATIONS_REGEXP,
      ([, , msg, placeholders]) => [msg, placeholders]);
}

/**
 * Extract placeholder names (of the form `{$PLACEHOLDER}`) from the `msg`.
 *
 * @param msg The text of the message to parse.
 */
function extractPlaceholdersFromMsg(msg: string): Set<string> {
  const regex = /{\$(.*?)}/g;
  return extract(msg, regex, ([, placeholders]) => placeholders);
}

/**
 * Extract the placeholder names (of the form `"PLACEHOLDER": "XXX"`) from the body of the argument
 * provided as `args`.
 *
 * @param args The body of an object literal containing placeholder info.
 */
function extractPlaceholdersFromArgs(args: string): Set<string> {
  const regex = /\s+"(.+?)":\s*".*?"/g;
  return extract(args, regex, ([, placeholders]) => placeholders);
}

function extract<T>(
    from: string, regex: RegExp, transformFn: (match: string[], state: Set<T>) => T): Set<T> {
  const result = new Set<T>();
  let item;
  while ((item = regex.exec(from)) !== null) {
    result.add(transformFn(item, result));
  }
  return result;
}

function diff(a: Set<string>, b: Set<string>): Set<string> {
  return new Set(Array.from(a).filter(x => !b.has(x)));
}
