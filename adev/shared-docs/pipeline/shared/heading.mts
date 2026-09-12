/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Extracts the ID from a heading text.
 * Supports custom ID syntax: `## My Heading {#custom-id}`
 */
export function getIdFromHeading(heading: string): string {
  // extract the extended markdown heading id
  // ex:  ## MyHeading {# myId}
  // This is recommended in case we end up having duplicate Ids but we still want the same heading text.
  // We don't want to make Id generation stateful/too complex to handle duplicates automatically.
  const customIdRegex = /{#\s*([\w-]+)\s*}/g;
  const customId = customIdRegex.exec(heading)?.[1];

  if (customId) {
    return customId;
  }

  return heading
    .toLowerCase()
    .replace(/\s|\//g, '-') // replace spaces and slashes with dashes
    .replace(/[^\p{L}\d\-]/gu, ''); // only keep letters, digits & dashes
}

/**
 * Extracts the anchor ID of every heading on a page, in document order.
 * Covers markdown headings below H1, which is reserved for the page title,
 * and `<docs-step>` titles, which are rendered as headings too. Lines inside
 * fenced code blocks are ignored so that samples cannot contribute headings.
 */
export function extractHeadingIds(content: string): string[] {
  const headings: string[] = [];
  let insideCodeBlock = false;

  for (const line of content.split('\n')) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }

    // Headings can have leading spaces.
    if (!insideCodeBlock && trimmedLine.startsWith('##')) {
      headings.push(trimmedLine.replace(/^#+\s*/, '').trim());
    }
  }

  const stepRegex = /<docs-step[^>]*title="([^"]*)"/g;
  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    headings.push(match[1]);
  }

  return headings.map((heading) => getIdFromHeading(heading));
}

/** Returns the IDs that appear more than once, each reported once. */
export function findDuplicateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  return Array.from(duplicates);
}
