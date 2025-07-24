/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {configureMarkedGlobally} from '../marked/configuration.mjs';
import {getRenderable} from '../processing.mjs';
import {renderEntry} from '../rendering.mjs';
import {initHighlighter} from '../shiki/shiki.mjs';
import {setSymbols} from '../symbol-context.mjs';
import {resolve} from 'path';

// Note: The tests will probably break if the schema of the api extraction changes.
// All entries in the fake-entries are extracted from Angular's api.
// You can just generate them an copy/replace the items in the fake-entries file.

describe('markdown to html', () => {
  const entries = new Map<string, DocumentFragment>();
  const entries2 = new Map<string, string>();

  beforeAll(async () => {
    await initHighlighter();
    await configureMarkedGlobally();

    const entryContent = await readFile(resolve('./fake-entries.json'), {
      encoding: 'utf-8',
    });
    const entryJson = JSON.parse(entryContent) as any;
    const symbols = new Map<string, string>([
      ['AfterRenderPhase', 'core'],
      ['afterRender', 'core'],
      ['EmbeddedViewRef', 'core'],
      ['ChangeDetectionStrategy', 'core'],
      ['ChangeDetectorRef', 'core'],
      ['withNoHttpTransferCache', 'platform-browser'],
      ['withHttpTransferCacheOptions', 'platform-browser'],
      ['withI18nSupport', 'platform-browser'],
      ['withEventReplay', 'platform-browser'],
    ]);
    setSymbols(symbols);
    for (const entry of entryJson.entries) {
      const renderableJson = await getRenderable(entry, '@angular/fakeentry', 'angular/angular');
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
    const cardItem = provideClientHydrationEntry.querySelector('.docs-reference-card-item')!;
    expect(cardItem.innerHTML).not.toContain('@link');
  });

  it('should create cross-links', () => {
    const entry = entries.get('AfterRenderOptions')!;
    expect(entry).toBeDefined();

    // In the description
    const descriptionItem = entry.querySelector('.docs-reference-description')!;
    expect(descriptionItem.innerHTML).toContain('<a href="/api/core/afterRender">afterRender</a>');

    // In the card
    const cardItem = entry.querySelectorAll('.docs-reference-card-item')[1];
    expect(cardItem.innerHTML).toContain(
      '<a href="/api/core/AfterRenderPhase#MixedReadWrite">AfterRenderPhase.MixedReadWrite</a>',
    );
  });
});
