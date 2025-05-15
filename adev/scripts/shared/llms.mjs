/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// The purpose of this script is to generate a llms-full.txt
// Run with `node adev/scripts/shared/llms.mjs` to generate llms-full.txt from the list in llms-list.md

//tslint:disable:no-console
import fs from 'fs/promises';
import path from 'path';

const INPUT_MD_FILENAME = 'adev/scripts/shared/llms-list.md';
const OUTPUT_FILENAME = 'adev/src/llms-full.txt';

function postProcessOutputContent(content) {
  // Helper to map custom languages to standard Markdown languages
  const mapLanguage = (lang) => {
    if (!lang) return ''; // For code blocks without a specified language
    const lowerLang = lang.trim().toLowerCase();
    if (lowerLang === 'angular-ts') return 'typescript';
    if (lowerLang === 'angular-html') return 'html';
    return lowerLang; // Use as is for other languages like shell, etc.
  };

  // Process docs-code-multifile and their inner docs-code elements
  content = content.replace(
    /<docs-code-multifile>([\s\S]*?)<\/docs-code-multifile>/gs,
    (match, innerHTML) => {
      let multifileResult = '';
      // Regex for <docs-code> within <docs-code-multifile>, expecting 'header' and optional 'language'
      const codeRegex =
        /<docs-code\s+header="([^"]+)"(?:\s+language="([^"]*)")?[^>]*>([\s\S]*?)<\/docs-code>/gs;
      let codeMatch;
      while ((codeMatch = codeRegex.exec(innerHTML)) !== null) {
        const header = codeMatch[1].trim();
        const langAttr = codeMatch[2]; // Language attribute might be undefined
        const language = mapLanguage(langAttr);
        let code = codeMatch[3].trim();
        // Note: If code content includes HTML entities like &lt;, they would need unescaping here.
        // e.g., code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        multifileResult += `\`\`\`${language}\n// ${header}\n${code}\n\`\`\`\n`;
      }
      return multifileResult;
    },
  );

  // Process standalone docs-code elements
  content = content.replace(
    /<docs-code(?:\s+language="([^"]*)")?[^>]*>([\s\S]*?)<\/docs-code>/gs,
    (match, langAttr, codeContent) => {
      const language = mapLanguage(langAttr);
      let code = codeContent.trim();
      // Note: HTML entity unescaping might be needed here as well.
      return `\`\`\`${language}\n${code}\n\`\`\`\n`;
    },
  );

  // Process code block languages
  content = content.replace(/```([\w-]+)\s*/gs, (match, lang, code) => {
    const mappedLang = mapLanguage(lang); // lang can be undefined if no language was specified
    return `\`\`\`${mappedLang}\n`;
  });

  // Remove docs-decorative-header elements
  content = content.replace(
    /<docs-decorative-header[^>]*>[\s\S]*?<\/docs-decorative-header>/gs,
    '',
  );

  // Remove docs-card elements
  content = content.replace(/<docs-card\b[^>]*>[\s\S]*?<\/docs-card>/gi, '');

  // remove docs-pill-row elements
  content = content.replace(/<docs-pill-row\b[^>]*>[\s\S]*?<\/docs-pill-row>/gi, '');

  // Remove docs-callout tags, keeping the content within them
  content = content.replace(/<docs-callout[^>]*>([\s\S]*?)<\/docs-callout>/gis, '$1');

  // Remove docs-card-container tags, keeping the content within them
  content = content.replace(/<docs-card-container>/g, '');
  content = content.replace(/<\/docs-card-container>/g, '');

  return content;
}

async function main() {
  const inputFilePath = path.resolve(process.cwd(), INPUT_MD_FILENAME);
  const baseDirForIncludes = path.dirname(inputFilePath);

  console.log(`Starting processing of: ${inputFilePath}`);

  let mainFileContent;
  try {
    mainFileContent = await fs.readFile(inputFilePath, 'utf-8');
  } catch (error) {
    console.error(`Error: Failed to read input file "${inputFilePath}".`);
    console.error(error.message);
    process.exit(1); // Exit with error code
  }

  let processedContent = mainFileContent;
  const matches = [...mainFileContent.matchAll(/(.*\.md)/g)];

  console.log(`Found ${matches.length} files`);

  let resultString = '';

  for (const match of matches) {
    const filePath = match[0];
    const absolutePathToIncludeFile = path.resolve(filePath);

    try {
      console.log(`  Including content from: ${absolutePathToIncludeFile}`);
      const includedFileContent = await fs.readFile(absolutePathToIncludeFile, 'utf-8');
      const processedFile = postProcessOutputContent(includedFileContent);
      resultString += processedFile; // Append the content of the included file
    } catch (fileReadError) {
      console.warn(`  Warning: Could not read file "${absolutePathToIncludeFile}"`);
    }
  }

  // Basic cleanup of blank lines
  processedContent = resultString.replace(/(?:\s*\n){3,}/g, '\n');

  const outputFilePath = path.resolve(process.cwd(), OUTPUT_FILENAME);
  try {
    await fs.writeFile(outputFilePath, processedContent, 'utf-8');
    console.log(`Successfully generated combined file: ${outputFilePath}`);
  } catch (error) {
    console.error(`Error: Failed to write output file "${outputFilePath}".`);
    console.error(error.message);
    process.exit(1); // Exit with error code
  }
}

main();
