import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {docsCodeBlockExtension} from '../../extensions/docs-code/docs-code-block';
import {walkTokens} from '../../walk-tokens';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(runfiles.resolvePackageRelative('./mermaid.md'), {
      encoding: 'utf-8',
    });

    marked.use({
      async: true,
      extensions: [docsCodeBlockExtension],
      walkTokens,
    });
    markdownDocument = JSDOM.fragment(await marked.parse(markdownContent));
  });

  it('should create an svg for each mermaid code block', () => {
    const svgs = markdownDocument.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });
});
