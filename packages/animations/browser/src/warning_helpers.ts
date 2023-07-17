/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


function createListOfWarnings(warnings: string[]): string {
  const LINE_START = '\n - ';
  return `${LINE_START}${warnings.filter(Boolean).map(warning => warning).join(LINE_START)}`;
}

export function warnValidation(warnings: string[]): void {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
      console.warn(`animation validation warnings:${createListOfWarnings(warnings)}`);
}

export function warnTriggerBuild(name: string, warnings: string[]): void {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
      console.warn(`The animation trigger "${name}" has built with the following warnings:${
          createListOfWarnings(warnings)}`);
}

export function warnRegister(warnings: string[]): void {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
      console.warn(`Animation built with the following warnings:${createListOfWarnings(warnings)}`);
}

export function triggerParsingWarnings(name: string, warnings: string[]): void {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
      console.warn(`Animation parsing for the ${name} trigger presents the following warnings:${
          createListOfWarnings(warnings)}`);
}

export function pushUnrecognizedPropertiesWarning(warnings: string[], props: string[]): void {
  if (props.length) {
    warnings.push(`The following provided properties are not recognized: ${props.join(', ')}`);
  }
}
