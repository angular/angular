/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Custom elements that are always written as a matching pair of open and close tags. */
const PAIRED_TAGS = [
  'docs-callout',
  'docs-card',
  'docs-card-container',
  'docs-decorative-header',
  'docs-step',
  'docs-tab',
  'docs-tab-group',
  'docs-workflow',
];

/**
 * Throws when a paired custom element is left unclosed.
 *
 * The tokenizers match up to the next closing tag rather than failing, so an unclosed tag pulls
 * the content that follows it into the block and leaves the next block unparsed in the output.
 */
export function validatePairedTags(markdown: string, filePath?: string): void {
  const content = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/`[^`\n]*`/g, '');

  for (const tag of PAIRED_TAGS) {
    const opened = content.match(new RegExp(`<${tag}(?=[\\s>])(?![^>]*/>)`, 'g'))?.length ?? 0;
    const closed = content.match(new RegExp(`</${tag}>`, 'g'))?.length ?? 0;

    if (opened !== closed) {
      throw new Error(
        `Unbalanced <${tag}> in ${filePath || 'markdown'}: ` +
          `${opened} opening tag(s) and ${closed} closing tag(s).`,
      );
    }
  }
}
