/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {CliCommand} from './cli-entities.mjs';
import {DocEntry} from './entities.mjs';
import {isCliEntry, isHiddenEntry} from './entities/categorization.mjs';
import {getRenderable} from './processing.mjs';
import {renderEntry} from './rendering.mjs';
import {setCurrentSymbol, setSymbols} from './symbol-context.mjs';
import {CliCommandRenderable, DocEntryRenderable} from './entities/renderables.mjs';
import {initHighlighter} from '../../shared/shiki.mjs';
import {setHighlighterInstance} from './shiki/shiki.mjs';

/** The JSON data file format for extracted API reference info. */
interface EntryCollection {
  repo: string;
  moduleName: string;
  moduleLabel?: string;
  normalizedModuleName: string;
  entries: DocEntry[] | CliCommand[];
  symbols: Record<string, string>;
}

/** Parse all JSON data source files into an array of collections. */
function parseEntryData(srcs: string[]): EntryCollection[] {
  return srcs.flatMap((jsonDataFilePath): EntryCollection | EntryCollection[] => {
    const fileContent = readFileSync(jsonDataFilePath, {encoding: 'utf8'});
    const fileContentJson = JSON.parse(fileContent) as unknown;
    if ((fileContentJson as EntryCollection).entries) {
      const symbols = Object.fromEntries(
        // TODO: refactor that, it's dirty and we can probably do better than this.
        // We're removing the leading `@angular/` from module names.
        (((fileContentJson as any).symbols ?? []) as [string, string][]).map(
          ([symbol, moduleName]) => [symbol, moduleName.slice(9)],
        ),
      );

      return {...(fileContentJson as EntryCollection), symbols};
    }

    // CLI subcommands should generate a separate file for each subcommand.
    // We are artificially creating a collection for each subcommand here.
    if ((fileContentJson as CliCommand).subcommands) {
      const command = fileContentJson as CliCommand;
      return [
        {
          repo: 'anglar/cli',
          moduleName: 'unknown',
          normalizedModuleName: 'unknown',
          entries: [fileContentJson as DocEntry],
          symbols: {},
        },
        ...command.subcommands!.map((subCommand) => {
          return {
            repo: 'angular/cli',
            moduleName: 'unknown',
            normalizedModuleName: 'unknown',
            entries: [{...subCommand, parentCommand: command} as any],
            symbols: {},
          };
        }),
      ];
    }

    return {
      repo: 'unknown',
      moduleName: 'unknown',
      normalizedModuleName: 'unknown',
      entries: [fileContentJson as DocEntry], // TODO: fix the typing cli entries aren't DocEntry
      symbols: {},
    };
  });
}

/** Gets a normalized filename for a doc entry. */
function getNormalizedFilename(normalizedModuleName: string, entry: DocEntry | CliCommand): string {
  if (isCliEntry(entry)) {
    return entry.parentCommand
      ? `${entry.parentCommand.name}/${entry.name}.html`
      : `${entry.name}.html`;
  }

  entry = entry as DocEntry;

  // Append entry type as suffix to prevent writing to file that only differs in casing or query string from already written file.
  // This will lead to a race-condition and corrupted files on case-insensitive file systems.
  return `${normalizedModuleName}_${entry.name}_${entry.entryType.toLowerCase()}.html`;
}

async function main() {
  // Shiki highlighter needs to be setup in an async context
  setHighlighterInstance(await initHighlighter());

  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');

  const [srcs, outputFilenameExecRootRelativePath] = rawParamLines;

  // Docs rendering happens in three phases that occur here:
  // 1) Aggregate all the raw extracted doc info.
  // 2) Transform the raw data to a renderable state.
  // 3) Render to HTML.

  // Parse all the extracted data from the source JSON files.
  // Each file represents one "collection" of docs entries corresponding to
  // a particular JS module name.
  const entryCollections: EntryCollection[] = parseEntryData(srcs.split(','));

  for (const collection of entryCollections) {
    const extractedEntries = collection.entries.filter(
      (entry) => isCliEntry(entry) || !isHiddenEntry(entry),
    );

    // Setting the symbols are a global context for the rendering templates of this entry
    setSymbols(collection.symbols);

    const renderableEntries: (DocEntryRenderable | CliCommandRenderable)[] = [];
    for (const entry of extractedEntries) {
      setCurrentSymbol(entry.name);
      renderableEntries.push(await getRenderable(entry, collection.moduleName, collection.repo));
    }

    const htmlOutputs = renderableEntries.map(renderEntry);

    for (let i = 0; i < htmlOutputs.length; i++) {
      const filename = getNormalizedFilename(collection.normalizedModuleName, extractedEntries[i]);
      const outputPath = path.join(outputFilenameExecRootRelativePath, filename);

      // in case the output path is nested, ensure the directory exists
      mkdirSync(path.parse(outputPath).dir, {recursive: true});

      writeFileSync(outputPath, htmlOutputs[i], {encoding: 'utf8'});
    }
  }
}

main();
