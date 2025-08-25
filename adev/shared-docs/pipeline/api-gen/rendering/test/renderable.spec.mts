/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'fs/promises';
import {DocEntryRenderable} from '../entities/renderables.mjs';
import {getRenderable} from '../processing.mjs';
import {setSymbols} from '../symbol-context.mjs';
import {resolve} from 'path';
import {initHighlighter} from '../../../shared/shiki.mjs';
import {setHighlighterInstance} from '../shiki/shiki.mjs';

// Note: The tests will probably break if the schema of the api extraction changes.
// All entries in the fake-entries are extracted from Angular's api.
// You can just generate them an copy/replace the items in the fake-entries file.

describe('renderable', () => {
  const entries = new Map<string, DocEntryRenderable>();

  beforeAll(async () => {
    setHighlighterInstance(await initHighlighter());

    const entryContent = await readFile(resolve('./fake-entries.json'), {
      encoding: 'utf-8',
    });
    const entryJson = JSON.parse(entryContent) as any;
    const symbols = Object.fromEntries([
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
      const renderableJson = (await getRenderable(
        entry,
        '@angular/fakeentry',
        'angular/angular',
      )) as DocEntryRenderable;
      entries.set(entry['name'], renderableJson);
    }
  });

  it('should compute the flags correctly', () => {
    // linkedSignal has the developerPreview tag on the overloads not on the main entry.
    const linkedSignal = entries.get('linkedSignal');
    expect(linkedSignal).toBeDefined();
    expect(linkedSignal!.deprecated).toBe(undefined);
    expect(linkedSignal!.developerPreview).toEqual({version: undefined});
    expect(linkedSignal!.experimental).toBe(undefined);
    expect(linkedSignal!.stable).toBe(undefined);
  });
});
