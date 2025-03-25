/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {renderEntry} from '../rendering';
import {getRenderable} from '../processing';
import {initHighlighter} from '../shiki/shiki';
import {configureMarkedGlobally} from '../marked/configuration';

describe('CLI docs to html', () => {
  let fragment: DocumentFragment;
  let entryJson: any;

  beforeAll(async () => {
    await initHighlighter();
    await configureMarkedGlobally();

    const entryContent = await readFile(runfiles.resolvePackageRelative('fake-cli-entries.json'), {
      encoding: 'utf-8',
    });

    entryJson = JSON.parse(entryContent) as any;
    const renderableJson = getRenderable(entryJson, '');
    fragment = JSDOM.fragment(await renderEntry(renderableJson));
  });

  it('should subcommands correctly', async () => {
    const generateComponentSubcommand = entryJson.subcommands.find(
      (subcommand: any) => subcommand.name === 'component',
    );
    const renderableJson = getRenderable(generateComponentSubcommand, '');
    fragment = JSDOM.fragment(await renderEntry(renderableJson));

    const cliTocs = fragment.querySelectorAll('.docs-reference-cli-toc')!;
    expect(cliTocs.length).toBe(2);

    expect(cliTocs[0].textContent).toContain('ng component[name][options]');
    expect(cliTocs[1].textContent).toContain('ng c[name][options]');
  });
});
