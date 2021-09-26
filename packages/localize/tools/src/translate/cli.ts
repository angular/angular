#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeJSFileSystem, setFileSystem} from '@angular/compiler-cli/private/localize';
import glob from 'glob';
import yargs from 'yargs';

import {DiagnosticHandlingStrategy, Diagnostics} from '../diagnostics';
import {getOutputPathFn} from './output_path';
import {translateFiles} from './index';

process.title = 'Angular Localization Message Translator (localize-translate)';
const args = process.argv.slice(2);
const options =
    yargs(args)
        .option('r', {
          alias: 'root',
          required: true,
          describe:
              'The root path of the files to translate, either absolute or relative to the current working directory. E.g. `dist/en`.',
          type: 'string',
        })
        .option('s', {
          alias: 'source',
          required: true,
          describe:
              'A glob pattern indicating what files to translate, relative to the `root` path. E.g. `bundles/**/*`.',
          type: 'string',
        })

        .option('l', {
          alias: 'source-locale',
          describe:
              'The source locale of the application. If this is provided then a copy of the application will be created with no translation but just the `$localize` calls stripped out.',
          type: 'string',
        })

        .option('t', {
          alias: 'translations',
          required: true,
          array: true,
          describe:
              'A list of paths to the translation files to load, either absolute or relative to the current working directory.\n' +
              'E.g. `-t src/locale/messages.en.xlf src/locale/messages.fr.xlf src/locale/messages.de.xlf`.\n' +
              'If you want to merge multiple translation files for each locale, then provide the list of files in an array.\n' +
              'Note that the arrays must be in double quotes if you include any whitespace within the array.\n' +
              'E.g. `-t "[src/locale/messages.en.xlf, src/locale/messages-2.en.xlf]" [src/locale/messages.fr.xlf,src/locale/messages-2.fr.xlf]`',
          type: 'string',
        })

        .option('target-locales', {
          array: true,
          describe:
              'A list of target locales for the translation files, which will override any target locale parsed from the translation file.\n' +
              'E.g. "-t en fr de".',
          type: 'string',
        })

        .option('o', {
          alias: 'outputPath',
          required: true,
          describe: 'A output path pattern to where the translated files will be written.\n' +
              'The path must be either absolute or relative to the current working directory.\n' +
              'The marker `{{LOCALE}}` will be replaced with the target locale. E.g. `dist/{{LOCALE}}`.',
          type: 'string',
        })

        .option('m', {
          alias: 'missingTranslation',
          describe: 'How to handle missing translations.',
          choices: ['error', 'warning', 'ignore'],
          default: 'warning',
          type: 'string',
        })

        .option('d', {
          alias: 'duplicateTranslation',
          describe: 'How to handle duplicate translations.',
          choices: ['error', 'warning', 'ignore'],
          default: 'warning',
          type: 'string',
        })

        .strict()
        .help()
        .parseSync();

const fs = new NodeJSFileSystem();
setFileSystem(fs);

const sourceRootPath = options.r;
const sourceFilePaths = glob.sync(options.s, {cwd: sourceRootPath, nodir: true});
const translationFilePaths: (string|string[])[] = convertArraysFromArgs(options.t);
const outputPathFn = getOutputPathFn(fs, fs.resolve(options.o));
const diagnostics = new Diagnostics();
const missingTranslation = options.m as DiagnosticHandlingStrategy;
const duplicateTranslation = options.d as DiagnosticHandlingStrategy;
const sourceLocale: string|undefined = options.l;
const translationFileLocales: string[] = options['target-locales'] || [];

translateFiles({
  sourceRootPath,
  sourceFilePaths,
  translationFilePaths,
  translationFileLocales,
  outputPathFn,
  diagnostics,
  missingTranslation,
  duplicateTranslation,
  sourceLocale
});

diagnostics.messages.forEach(m => console.warn(`${m.type}: ${m.message}`));
process.exit(diagnostics.hasErrors ? 1 : 0);

/**
 * Parse each of the given string `args` and convert it to an array if it is of the form
 * `[abc, def, ghi]`, i.e. it is enclosed in square brackets with comma delimited items.
 * @param args The string to potentially convert to arrays.
 */
function convertArraysFromArgs(args: string[]): (string|string[])[] {
  return args.map(
      arg => (arg.startsWith('[') && arg.endsWith(']')) ?
          arg.slice(1, -1).split(',').map(arg => arg.trim()) :
          arg);
}
