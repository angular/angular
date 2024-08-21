import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-callout/docs-callout.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it(`defaults to a helpful callout`, () => {
    const calloutDiv =
      markdownDocument.querySelector('#default-marker')!.parentElement?.parentElement;
    calloutDiv?.classList.contains('docs-callout-helpful');
  });
});
