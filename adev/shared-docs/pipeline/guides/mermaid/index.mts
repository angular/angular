/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocsCodeToken} from '../extensions/docs-code/docs-code.mjs';
import {chromium} from 'playwright-core';
import {Mermaid, MermaidConfig} from 'mermaid';
import {runfiles} from '@bazel/runfiles';

// Declare mermarid in the context of this file so that typescript doesn't get upset when we
// access it within the `page.evaluate` function. At runtime the context in with the method
// is run difference than this file, but this makes typescript happy.
declare const mermaid: Mermaid;

/** Mermaid configuration to use when creating mermaid svgs. */
const mermaidConfig: MermaidConfig = {
  // The `base` theme is the only configurable theme provided by mermaid.
  theme: 'base',
};

/** The full path to the mermaid script. */
let mermaidScriptTagData: {path: string} | undefined;

/** Get the mermaid script file path, resolving it if necessary first. */
function getMermaidScriptTagData() {
  if (mermaidScriptTagData) {
    return mermaidScriptTagData;
  }

  return (mermaidScriptTagData = {
    path: runfiles.resolve('npm/node_modules/mermaid/dist/mermaid.js'),
  });
}

/** Replace the code block content with the mermaid generated SVG element string in place. */
export async function processMermaidCodeBlock(token: DocsCodeToken) {
  /**
   * The diagram source code contents. Marked reuses the token object, causing the need for
   * extracting the value before async actions occur in the function.
   */
  const diagram = token.code;
  // TODO(josephperrott): Determine if we can reuse the browser across token processing.
  /** Browser instance to run mermaid within. */
  const browser = await chromium.launch({
    headless: true,
    // The browser binary needs to be discoverable in a build and test environment, which seems to only
    // work when provided at the execroot path. We choose to resolve it using the runfiles helper due
    // to this requirement.
    executablePath: runfiles.resolveWorkspaceRelative(process.env['CHROME_BIN']!),
    args: ['--no-sandbox'],
  });
  /** Page to run mermaid in. */
  const page = await browser.newPage();

  try {
    // We goto a data URI so that we don't have to manage an html file and loading an html file.
    await page.goto(`data:text/html,<html></html>`);
    await page.addScriptTag(getMermaidScriptTagData());

    /** The generated SVG element string for the provided token's code. */
    let {svg} = await page.evaluate(
      ({diagram, config}) => {
        mermaid.initialize(config);

        return mermaid.render('mermaid-generated-diagram', diagram);
      },
      {diagram, config: mermaidConfig},
    );

    // Replace the token's code content with the generated SVG.
    token.code = svg;
  } finally {
    await browser.close();
  }
}
