import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(runfiles.resolvePackageRelative('list/list.md'), {
      encoding: 'utf-8',
    });
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('should wrap lists in custom classes', () => {
    const orderedList = markdownDocument.querySelector('ol');
    expect(orderedList?.className).toBe('docs-ordered-list');
    expect(orderedList?.childElementCount).toBe(3);
    expect(orderedList?.textContent).toContain('First Item');

    const unorderedList = markdownDocument.querySelector('ul');
    expect(unorderedList?.className).toBe('docs-list');
    expect(unorderedList?.childElementCount).toBe(4);
    expect(unorderedList?.textContent).toContain('matter');
  });
});
