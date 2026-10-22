/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseMarkdown} from '../../parse.mjs';
import {rendererContext, setHighlighter} from '../renderer-context.mjs';

describe('paired tag validation', () => {
  beforeAll(async () => {
    await setHighlighter();
  });

  const parse = (markdown: string) =>
    parseMarkdown(markdown, {...rendererContext, markdownFilePath: 'guide/example.md'});

  it('throws when a step is left unclosed', () => {
    expect(() =>
      parse(`
<docs-workflow>
<docs-step title="First">
First step.
<docs-step title="Second">
Second step.
</docs-step>
</docs-workflow>`),
    ).toThrowError(
      /Unbalanced <docs-step> in guide\/example\.md: 2 opening tag\(s\) and 1 closing/,
    );
  });

  it('throws when a workflow is left unclosed', () => {
    expect(() =>
      parse(`
<docs-workflow>
<docs-step title="Only">
Only step.
</docs-step>`),
    ).toThrowError(/Unbalanced <docs-workflow>/);
  });

  it('accepts balanced tags', () => {
    expect(() =>
      parse(`
<docs-workflow>
<docs-step title="Only">
Only step.
</docs-step>
</docs-workflow>`),
    ).not.toThrow();
  });

  it('ignores tags inside code blocks, inline code and comments', () => {
    expect(() =>
      parse(
        [
          '```html',
          '<docs-step title="In a fence">',
          '```',
          '',
          'Steps are written as `<docs-step>` elements.',
          '',
          '<!-- <docs-workflow> -->',
        ].join('\n'),
      ),
    ).not.toThrow();
  });

  it('does not confuse docs-card with docs-card-container', () => {
    expect(() =>
      parse(`
<docs-card-container>
<docs-card title="One">Body</docs-card>
</docs-card-container>`),
    ).not.toThrow();
  });
});
