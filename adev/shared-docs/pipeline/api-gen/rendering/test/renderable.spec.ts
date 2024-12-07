/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {getRenderable} from '../processing';
import {DocEntryRenderable} from '../entities/renderables';
import {initHighlighter} from '../shiki/shiki';
import {configureMarkedGlobally} from '../marked/configuration';

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
    for (const entry of entryJson.entries) {
      const renderableJson = getRenderable(entry, '@angular/fakeentry') as DocEntryRenderable;
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
