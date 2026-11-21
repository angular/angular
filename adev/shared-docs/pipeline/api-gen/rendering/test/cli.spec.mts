/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resolve} from 'path';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {getRenderable} from '../processing.mjs';
import {renderEntry} from '../rendering.mjs';
import {initHighlighter} from '../../../shared/shiki.mjs';
import {setHighlighterInstance} from '../shiki/shiki.mjs';

describe('CLI docs to html', () => {
  let fragment: DocumentFragment;
  let entryJson: any;

  beforeAll(async () => {
    setHighlighterInstance(await initHighlighter());

    const entryContent = await readFile(resolve('./fake-cli-entries.json'), {
      encoding: 'utf-8',
    });

    entryJson = JSON.parse(entryContent) as any;
    const renderableJson = await getRenderable(entryJson, '', 'angular/cli');
    fragment = JSDOM.fragment(await renderEntry(renderableJson));
  });

  it('should subcommands correctly', async () => {
    const generateComponentSubcommand = entryJson.subcommands.find(
      (subcommand: any) => subcommand.name === 'component',
    );
    const renderableJson = await getRenderable(generateComponentSubcommand, '', 'angular/cli');
    fragment = JSDOM.fragment(await renderEntry(renderableJson));

    const cliTocs = fragment.querySelectorAll('.docs-reference-cli-toc')!;
    expect(cliTocs.length).toBe(2);

    expect(cliTocs[0].textContent).toContain('ng component [name] [options]');
    expect(cliTocs[1].textContent).toContain('ng c [name] [options]');
  });

  it('should rewrite absolute angular.dev hrefs in option descriptions to root-relative', async () => {
    const renderableJson = await getRenderable(entryJson, '', 'angular/cli');
    const localFragment = JSDOM.fragment(renderEntry(renderableJson));
    const hrefs = Array.from(localFragment.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    // Absolute angular.dev URLs are rewritten to root-relative.
    expect(hrefs).toContain('/cli-test-rewrite');
    expect(hrefs).not.toContain('https://angular.dev/cli-test-rewrite');
    // Subdomains are intentionally left as external.
    expect(hrefs).toContain('https://next.angular.dev/cli-test-preview');
  });

  it('should render builder option sections when builders are provided', async () => {
    const buildEntry = {
      name: 'build',
      command: 'ng build [project]',
      shortDescription: 'Compiles an Angular application or library.',
      longDescription: 'Long description.',
      aliases: ['b'],
      deprecated: false,
      options: [
        {
          name: 'project',
          type: 'string',
          description: 'The name of the project.',
          positional: 0,
        },
        {
          name: 'configuration',
          type: 'string',
          aliases: ['c'],
          description: 'One or more named builder configurations.',
        },
      ],
      builders: [
        {
          name: 'Application',
          options: [
            {
              name: 'aot',
              type: 'boolean',
              default: true,
              description: 'Build using Ahead of Time compilation.',
            },
          ],
        },
        {
          name: 'Library',
          options: [
            {
              name: 'compilation-mode',
              type: 'string',
              default: 'partial',
              enum: ['full', 'partial'],
              description: 'Angular compilation mode.',
            },
          ],
        },
      ],
    };

    const renderableJson = await getRenderable(buildEntry as any, '', 'angular/cli');
    const localFragment = JSDOM.fragment(renderEntry(renderableJson));
    const h3Headings = Array.from(localFragment.querySelectorAll('h3')).map((h) =>
      h.textContent?.trim(),
    );
    expect(h3Headings).toContain('Builders');

    const builderLinks = Array.from(
      localFragment.querySelectorAll('.docs-reference-cli-content ul a'),
    ).map((a) => ({
      text: a.textContent?.trim(),
      href: a.getAttribute('href'),
    }));
    expect(builderLinks).toEqual([
      {text: 'Application', href: '#application-builder-options'},
      {text: 'Library', href: '#library-builder-options'},
    ]);

    const headings = Array.from(localFragment.querySelectorAll('h2')).map((h) => ({
      id: h.id,
      text: h.textContent?.trim(),
    }));

    expect(headings).toEqual([
      {id: 'arguments', text: 'Arguments'},
      {id: 'options', text: 'Options'},
      {id: 'application-builder-options', text: 'Application builder options'},
      {id: 'library-builder-options', text: 'Library builder options'},
    ]);

    const cards = localFragment.querySelectorAll('.docs-reference-member-card');
    expect(cards.length).toBe(4);
    expect(cards[2].textContent).toContain('aot');
    expect(cards[2].textContent).toContain('Default');
    expect(cards[2].textContent).toContain('true');
    expect(cards[3].textContent).toContain('compilation-mode');
    expect(cards[3].textContent).toContain('Default');
    expect(cards[3].textContent).toContain('partial');
  });

  it('should render deprecated labels and messages for deprecated CLI options', async () => {
    const newEntry = {
      name: 'new',
      command: 'ng new [name]',
      shortDescription: 'Creates a new Angular workspace.',
      longDescription: 'Long description.',
      aliases: ['n'],
      deprecated: false,
      options: [
        {
          name: 'legacy-flag',
          type: 'boolean',
          deprecated: true,
          description: 'A deprecated boolean option.',
        },
        {
          name: 'test-runner',
          type: 'string',
          deprecated: 'New projects will only be configured with Vitest in a future version.',
          default: 'vitest',
          enum: ['karma', 'vitest'],
          description: 'The unit testing runner to use.',
        },
      ],
    };

    const renderableJson = await getRenderable(newEntry as any, '', 'angular/cli');
    const localFragment = JSDOM.fragment(renderEntry(renderableJson));
    const items = localFragment.querySelectorAll('.docs-ref-content');
    expect(items).toHaveSize(2);

    const booleanDeprecatedBadge = items[0].querySelector('.docs-deprecated');
    expect(booleanDeprecatedBadge?.textContent).toBe('@deprecated');
    expect(items[0].querySelector('.docs-deprecation-message')).toBeNull();

    const messageContainer = items[1].querySelector('.docs-deprecation-message');
    expect(messageContainer).not.toBeNull();
    expect(messageContainer?.querySelector('.docs-deprecated')?.textContent).toBe('@deprecated');
    expect(messageContainer?.textContent).toContain(
      'New projects will only be configured with Vitest in a future version.',
    );
  });
});
