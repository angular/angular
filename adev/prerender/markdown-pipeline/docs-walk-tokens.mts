/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {run} from '@mermaid-js/mermaid-cli';
import {readFile, writeFile} from 'fs/promises';
import {marked} from 'marked';
import {v4 as uuidv4} from 'uuid';
import {
  DocsCodeMultifileToken,
  DocsCodeToken,
  DocsCodeTripleTickBlockToken,
} from './tranformations/docs-code.mjs';
import {generateStackblitzExample} from './../../scripts/examples/stackblitz-builder.mjs';

export const MERMAID_TEMP_FOLDER = 'TEMP';
const MERMAID_INPUT = `${MERMAID_TEMP_FOLDER}/mermaid-input-#{id}.mmd`;
const MERMAID_OUTPUT_SVG = `${MERMAID_TEMP_FOLDER}/mermaid-output-#{id}.svg`;

// If token type is 'docs-code' or 'docs-code-triple-tick' and language is 'mermaid' then we can try to render Mermaid svg.
export async function docsWalkTokens(walkToken: marked.Tokens.Generic): Promise<void> {
  const token = walkToken as DocsCodeToken | DocsCodeTripleTickBlockToken | DocsCodeMultifileToken;
  await handleMermaid(token);
  await handleStackblitzExamples(token);
}

async function handleMermaid(
  token: DocsCodeToken | DocsCodeMultifileToken | DocsCodeTripleTickBlockToken,
) {
  if (
    token.language === 'mermaid' &&
    (token.type === 'docs-code' || token.type === 'docs-code-triple-tick')
  ) {
    token.code = await renderMermaidToSvg(token.code);
  }
}

async function handleStackblitzExamples(
  token: DocsCodeToken | DocsCodeTripleTickBlockToken | DocsCodeMultifileToken,
) {
  if (
    (token.type !== 'docs-code' && token.type !== 'docs-code-multifile') ||
    !token.preview ||
    !token.path
  ) {
    return;
  }

  const defaultCodeToken: marked.Tokens.Generic =
    token.type === 'docs-code-multifile' ? token.paneTokens[0] : token;
  const path: string = defaultCodeToken['diff'] ?? defaultCodeToken['path'];

  const pathToExampleRule = /([^\/]+)\/(.+)/s;
  const pathToExampleSegments = path.match(pathToExampleRule);

  if (!pathToExampleSegments) {
    return;
  }

  const exampleFolder = pathToExampleSegments[1];
  const primaryFilePath = pathToExampleSegments[2];

  await generateStackblitzExample(exampleFolder, primaryFilePath, defaultCodeToken['header']);
}

export async function renderMermaidToSvg(content: string): Promise<string> {
  // Generate input and output path
  const mermaidTempFileId = uuidv4();
  const input = MERMAID_INPUT.replace('#{id}', mermaidTempFileId);
  const output = MERMAID_OUTPUT_SVG.replace('#{id}', mermaidTempFileId) as `${string}.svg`;

  // Create *.mmd file with provided content.
  await writeFile(input, content);
  // Execute rendering. The generated SVG file will be written in the output path.
  await run(input, output, {
    quiet: true,
    puppeteerConfig: {headless: 1},
    parseMMDOptions: {
      mermaidConfig: {
        themeCSS: `
          background-color: var(--page-background) !important; // svg background color
          g {
            rect {
              stroke: black !important; // border around the rectangles, same for dark/light theme
              filter: drop-shadow(5px 5px 0px var(--vivid-pink));
            }
          }
          .messageText, .pieTitleText {
            fill: var(--primary-contrast) !important; // pie chart title text and line labels
          }
          .pieOuterCircle {
            stroke-width: 1px;
          }
          .pieCircle {
            stroke-width: 1.5px;
          }
          .legend {
            rect {
              filter: none;
              opacity: 0.7;
            }
            text {
              fill: var(--primary-contrast) !important; // legend label text color
            }
          }
          .slice {  // e.g. text on the pie charts
            fill: var(--primary-contrast) !important;
          }
          .flowchart-link, line { // lines
            stroke: var(--primary-contrast) !important;
          }
          .marker,
          #statediagram-barbEnd,
          .transition,
          #arrowhead path { // arrows
            stroke: var(--primary-contrast) !important;
            fill: var(--primary-contrast) !important;
          }
          .cluster rect {
            stroke: var(--primary-contrast) !important;
            fill: var(--page-background) !important;
          }
        `,
        theme: 'base',
        themeVariables: {
          fontFamily: 'sans-serif',
          primaryColor: '#fff',
          primaryBorderColor: '#000',
          pie1: '#0546ff',
          pie2: '#f637e3',
          pie3: '#f11653',
          pie4: '#8001c6',
          pie5: '#00c572',
          pie6: '#fe3700',
        },
      },
    },
  });

  // Read the content of generated SVG file.
  return await readFile(output, 'utf8');
}
