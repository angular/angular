/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
function createListOfWarnings(warnings) {
  const LINE_START = '\n - ';
  return `${LINE_START}${warnings
    .filter(Boolean)
    .map((warning) => warning)
    .join(LINE_START)}`;
}
export function warnValidation(warnings) {
  console.warn(`animation validation warnings:${createListOfWarnings(warnings)}`);
}
export function warnTriggerBuild(name, warnings) {
  console.warn(
    `The animation trigger "${name}" has built with the following warnings:${createListOfWarnings(warnings)}`,
  );
}
export function warnRegister(warnings) {
  console.warn(`Animation built with the following warnings:${createListOfWarnings(warnings)}`);
}
export function triggerParsingWarnings(name, warnings) {
  console.warn(
    `Animation parsing for the ${name} trigger presents the following warnings:${createListOfWarnings(warnings)}`,
  );
}
export function pushUnrecognizedPropertiesWarning(warnings, props) {
  if (props.length) {
    warnings.push(`The following provided properties are not recognized: ${props.join(', ')}`);
  }
}
//# sourceMappingURL=warning_helpers.js.map
