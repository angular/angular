/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {DocEntryRenderable} from '../entities/renderables';
import {configureMarkedGlobally} from '../marked/configuration';
import {getRenderable} from '../processing';
import {initHighlighter} from '../shiki/shiki';
import {setSymbols} from '../symbol-context';

// Note: The tests will probably break if the schema of the api extraction changes.
// All entries in the fake-entries are extracted from Angular's api.
// You can just generate them an copy/replace the items in the fake-entries file.

describe('renderable', () => {
  const entries = new Map<string, DocEntryRenderable>();

  beforeAll(async () => {
    await initHighlighter();
    await configureMarkedGlobally();

    const entryContent = await readFile(runfiles.resolvePackageRelative('fake-entries.json'), {
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
      const renderableJson = getRenderable(
        entry,
        '@angular/fakeentry',
        'angular/angular',
      ) as DocEntryRenderable;
      entries.set(entry['name'], renderableJson);
    }
  });

  it('should compute the flags correctly', () => {
    // linkedSignal has the developerPreview tag on the overloads not on the main entry.
    const linkedSignal = entries.get('linkedSignal');
    expect(linkedSignal).toBeDefined();
    expect(linkedSignal!.isDeprecated).toBe(false);
    expect(linkedSignal!.isDeveloperPreview).toBe(true);
    expect(linkedSignal!.isExperimental).toBe(false);
  });
});
