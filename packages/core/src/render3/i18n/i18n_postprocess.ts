/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// i18nPostprocess consts
const ROOT_TEMPLATE_ID = 0;
const PP_MULTI_VALUE_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]/;
const PP_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]|(�\/?\*\d+:\d+�)/g;
const PP_ICU_VARS_REGEXP = /({\s*)(VAR_(PLURAL|SELECT)(_\d+)?)(\s*,)/g;
const PP_ICU_PLACEHOLDERS_REGEXP = /{([A-Z0-9_]+)}/g;
const PP_ICUS_REGEXP = /�I18N_EXP_(ICU(_\d+)?)�/g;
const PP_CLOSE_TEMPLATE_REGEXP = /\/\*/;
const PP_TEMPLATE_ID_REGEXP = /\d+\:(\d+)/;

// Parsed placeholder structure used in postprocessing (within `i18nPostprocess` function)
// Contains the following fields: [templateId, isCloseTemplateTag, placeholder]
type PostprocessPlaceholder = [number, boolean, string];

/**
 * Handles message string post-processing for internationalization.
 *
 * Handles message string post-processing by transforming it from intermediate
 * format (that might contain some markers that we need to replace) to the final
 * form, consumable by i18nStart instruction. Post processing steps include:
 *
 * 1. Resolve all multi-value cases (like [�*1:1��#2:1�|�#4:1�|�5�])
 * 2. Replace all ICU vars (like "VAR_PLURAL")
 * 3. Replace all placeholders used inside ICUs in a form of {PLACEHOLDER}
 * 4. Replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�)
 *    in case multiple ICUs have the same placeholder name
 *
 * @param message Raw translation string for post processing
 * @param replacements Set of replacements that should be applied
 *
 * @returns Transformed string that can be consumed by i18nStart instruction
 *
 * @codeGenApi
 */
export function i18nPostprocess(
  message: string,
  replacements: {[key: string]: string | string[]} = {},
): string {
  /**
   * Step 1: resolve all multi-value placeholders like [�#5�|�*1:1��#2:1�|�#4:1�]
   *
   * Note: due to the way we process nested templates (BFS), multi-value placeholders are typically
   * grouped by templates, for example: [�#5�|�#6�|�#1:1�|�#3:2�] where �#5� and �#6� belong to root
   * template, �#1:1� belong to nested template with index 1 and �#1:2� - nested template with index
   * 3. However in real templates the order might be different: i.e. �#1:1� and/or �#3:2� may go in
   * front of �#6�. The post processing step restores the right order by keeping track of the
   * template id stack and looks for placeholders that belong to the currently active template.
   */
  let result: string = message;
  if (PP_MULTI_VALUE_PLACEHOLDERS_REGEXP.test(message)) {
    const matches: {[key: string]: PostprocessPlaceholder[]} = {};
    const templateIdsStack: number[] = [ROOT_TEMPLATE_ID];
    result = result.replace(PP_PLACEHOLDERS_REGEXP, (m: any, phs: string, tmpl: string): string => {
      const content = phs || tmpl;
      const placeholders: PostprocessPlaceholder[] = matches[content] || [];
      if (!placeholders.length) {
        content.split('|').forEach((placeholder: string) => {
          const match = placeholder.match(PP_TEMPLATE_ID_REGEXP);
          const templateId = match ? parseInt(match[1], 10) : ROOT_TEMPLATE_ID;
          const isCloseTemplateTag = PP_CLOSE_TEMPLATE_REGEXP.test(placeholder);
          placeholders.push([templateId, isCloseTemplateTag, placeholder]);
        });
        matches[content] = placeholders;
      }

      if (!placeholders.length) {
        throw new Error(`i18n postprocess: unmatched placeholder - ${content}`);
      }

      const currentTemplateId = templateIdsStack[templateIdsStack.length - 1];
      let idx = 0;
      // find placeholder index that matches current template id
      for (let i = 0; i < placeholders.length; i++) {
        if (placeholders[i][0] === currentTemplateId) {
          idx = i;
          break;
        }
      }
      // update template id stack based on the current tag extracted
      const [templateId, isCloseTemplateTag, placeholder] = placeholders[idx];
      if (isCloseTemplateTag) {
        templateIdsStack.pop();
      } else if (currentTemplateId !== templateId) {
        templateIdsStack.push(templateId);
      }
      // remove processed tag from the list
      placeholders.splice(idx, 1);
      return placeholder;
    });
  }

  // return current result if no replacements specified
  if (!Object.keys(replacements).length) {
    return result;
  }

  /**
   * Step 2: replace all ICU vars (like "VAR_PLURAL")
   */
  result = result.replace(PP_ICU_VARS_REGEXP, (match, start, key, _type, _idx, end): string => {
    return replacements.hasOwnProperty(key) ? `${start}${replacements[key]}${end}` : match;
  });

  /**
   * Step 3: replace all placeholders used inside ICUs in a form of {PLACEHOLDER}
   */
  result = result.replace(PP_ICU_PLACEHOLDERS_REGEXP, (match, key): string => {
    return replacements.hasOwnProperty(key) ? (replacements[key] as string) : match;
  });

  /**
   * Step 4: replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�) in case
   * multiple ICUs have the same placeholder name
   */
  result = result.replace(PP_ICUS_REGEXP, (match, key): string => {
    if (replacements.hasOwnProperty(key)) {
      const list = replacements[key] as string[];
      if (!list.length) {
        throw new Error(`i18n postprocess: unmatched ICU - ${match} with key: ${key}`);
      }
      return list.shift()!;
    }
    return match;
  });

  return result;
}
