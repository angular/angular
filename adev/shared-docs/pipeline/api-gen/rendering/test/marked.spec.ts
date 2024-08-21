import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {renderEntry} from '../rendering';
import {getRenderable} from '../processing';
import {initHighlighter} from '../shiki/shiki';
import {configureMarkedGlobally} from '../marked/configuration';

describe('markdown to html', () => {
  const entries = new Map<string, DocumentFragment>();
  const entries2 = new Map<string, string>();

  beforeAll(async () => {
    await initHighlighter();
    await configureMarkedGlobally();

    const entryContent = await readFile(runfiles.resolvePackageRelative('fake-entries.json'), {
      encoding: 'utf-8',
    });
    const entryJson = JSON.parse(entryContent) as any;
    for (const entry of entryJson.entries) {
      const renderableJson = getRenderable(entry, '@angular/fakeentry');
      const fragment = JSDOM.fragment(await renderEntry(renderableJson));
      entries.set(entry['name'], fragment);
      entries2.set(entry['name'], await renderEntry(renderableJson));
    }
  });

  it('should render description correctly', () => {
    const afterNextRenderEntry = entries.get('afterNextRender')!;
    const header = afterNextRenderEntry.querySelector('.docs-reference-header')!;
    expect(header).toBeDefined();
    expect(header.outerHTML).not.toContain('```');

    console.log(entries2.get('afterNextRender'));
    const list = afterNextRenderEntry.querySelector('ul')!;
    expect(list).toBeDefined();

    // List are rendered
    expect(list.outerHTML).toContain('<li>');

    // Code blocks are rendered
    expect(list.outerHTML).toContain('<code>mixedReadWrite</code>');
  });

  it('should render multiple {@link} blocks', () => {
    const provideClientHydrationEntry = entries.get('provideClientHydration')!;
    expect(provideClientHydrationEntry).toBeDefined();
    const cardItem = provideClientHydrationEntry.querySelector('.docs-reference-card-item ')!;
    expect(cardItem.innerHTML).not.toContain('@link');
  });
});
