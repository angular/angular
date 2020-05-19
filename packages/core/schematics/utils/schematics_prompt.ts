/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

type Inquirer = typeof import('inquirer');

let resolvedInquirerModule: Inquirer|null;

try {
  // "inquirer" is the prompt module also used by the devkit schematics CLI
  // in order to show prompts for schematics. We transitively depend on this
  // module, but don't want to throw an exception if the module is not
  // installed for some reason. In that case prompts are just not supported.
  resolvedInquirerModule = require('inquirer');
} catch (e) {
  resolvedInquirerModule = null;
}

/** Whether prompts are currently supported. */
export function supportsPrompt(): boolean {
  return !!resolvedInquirerModule && !!process.stdin.isTTY;
}

/**
 * Gets the resolved instance of "inquirer" which can be used to programmatically
 * create prompts.
 */
export function getInquirer(): Inquirer {
  return resolvedInquirerModule!;
}
