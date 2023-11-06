/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync, readdirSync} from 'fs';
import {join} from 'path';
import {ClassEntry, DocEntry, EntryType} from '../../api-gen/entities';
import {handleEmoji} from './emoji.mjs';

// global defined in the index
declare const logs: string[];

// API
interface EntryCollection {
  moduleName: string;
  entries: DocEntry[];
}

function parseEntryData(srcs: string[]): EntryCollection[] {
  return srcs.map((jsonDataFilePath) => {
    const fileContent = readFileSync(jsonDataFilePath, {encoding: 'utf8'});
    return JSON.parse(fileContent) as EntryCollection;
  });
}

interface ParsedEntry {
  module: string;
  members: string[];
  type: EntryType;
  isDeprecated: boolean;
}

let apiEntries: undefined | Map<string, Array<ParsedEntry>>;

function getApiEntries(): Map<string, Array<ParsedEntry>> {
  const DEV_DATA_PATH = join('prerender', 'api-gen', 'dev-data', 'api');

  const filePaths = readdirSync(DEV_DATA_PATH).map((fileName) => join(DEV_DATA_PATH, fileName));

  const entryCollections: EntryCollection[] = parseEntryData(filePaths);

  const entries = new Map<string, Array<ParsedEntry>>();

  entryCollections.forEach((module) => {
    const moduleName = module.moduleName.slice(9); // removing "@angular/"" from the name

    module.entries.forEach((entry) => {
      const members = (entry as ClassEntry).members?.map((m) => m.name) ?? [];
      const parsedEntry = {
        module: moduleName,
        members,
        type: entry.entryType,
        isDeprecated: entry.jsdocTags.some((tag) => tag.name === 'deprecated'),
      };
      if (!entries.has(entry.name)) {
        entries.set(entry.name, [parsedEntry]);
      } else {
        entries.get(entry.name)?.push(parsedEntry);
      }
    });
  });

  return entries;
}

function defaultCodeBlock(text: string) {
  return `<code>${handleEmoji(text)}</code>`;
}

export function handleCode(text: string): string {
  if (!apiEntries) {
    apiEntries = getApiEntries();
  }

  // strip trailing the braces for functions,
  // remove leading @ for decorators
  let entity = text.replace(/^@|(\(\))$/g, '');
  let method: string | undefined;

  // We're parsing a class.method
  if (entity.includes('.')) {
    [entity, method] = entity.split('.');
  }

  if (apiEntries.has(entity)) {
    const isDecorator = text.startsWith('@');

    const entries = apiEntries.get(entity);
    const nonDeprecated = entries?.find((e) => e.isDeprecated);
    let entry: ParsedEntry | undefined;

    if (entries?.length === 1) {
      entry = entries[0];
    } else if (entries?.length === 2 && nonDeprecated) {
      // Sometime we move an entry from one package to another and deprecate the original entry.
      // In this case we have 2 entries with one deprecated, we take the non-deprecated one
      entry = nonDeprecated;
    }

    if (entry) {
      if (isDecorator && entry.type !== 'decorator') {
        return defaultCodeBlock(text);
      }

      if (entity && method && entry.members.includes(method)) {
        return `<a href="api/${entry.module}/${entity}#${method}"><code>${text}</code></a>`;
      }

      return `<a href="api/${entry.module}/${entity}"><code>${text}</code></a>`;
    } else {
      logs.push(`Cannot resolve the ambiguity for: ${entity}`);
    }
  }

  return defaultCodeBlock(text);
}
