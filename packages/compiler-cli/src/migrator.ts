/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {I18nVersion} from '@angular/core';
import * as tsc from '@angular/tsc-wrapped';
import * as inquirer from 'inquirer';
import * as ts from 'typescript';

import {getTranslations} from './codegen';
import {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter} from './compiler_host';
import {Extractor} from './extractor';
import {PathMappedCompilerHost} from './path_mapped_compiler_host';


/**
 * Migrate i18n messages from an old version to the last one
 *
 * @experimental
 */
export class Migrator {
  constructor(public host: ts.CompilerHost, private extractor: Extractor, private files: string[]) {
  }

  migrate(format: string, version: I18nVersion, isMapping: boolean, resolve: string):
      Promise<string[]> {
    return this.extractor.extractBundle().then((bundle: compiler.MessageBundle) => {
      const mapping = compiler.getIdsMapping(bundle, format, version);

      if (isMapping) {
        return this.files.map((file: string) => this.map(mapping, file));
      } else {
        return Promise.all(
            this.files.map((file: string) => this.update(mapping, file, format, version, resolve)));
      }
    });
  }

  private map(
      mapping: {newToOld: {[newId: string]: string[]}, oldToNew: {[oldId: string]: string}},
      i18nFile: string): string {
    let dstPath = `${i18nFile.split('.').slice(0, -1).join('.')}_mapping.json`;
    this.host.writeFile(dstPath, JSON.stringify(mapping.newToOld), false);
    return dstPath;
  }

  private update(
      mapping: {newToOld: {[newId: string]: string[]}, oldToNew: {[oldId: string]: string}},
      i18nFile: string, formatName: string, version: I18nVersion,
      resolve: string): Promise<string> {
    const translations = getTranslations(i18nFile);
    const msgIdToElement = compiler.getElementsMapping(translations, formatName, version);
    const duplicates: {[newId: string]: {id: string, content: string}[]} = {};
    const contentDuplicates: {[newId: string]: string[]} = {};

    if (resolve === 'manual') {
      msgIdToElement.forEach(([id, element, content]: [string, compiler.Element, string]) => {
        const newId = mapping.oldToNew[id];
        if (mapping.newToOld[newId].length > 1) {
          if (!contentDuplicates[newId]) {
            contentDuplicates[newId] = [];
          }
          if (contentDuplicates[newId].indexOf(content) === -1) {
            contentDuplicates[newId].push(content);
            if (!duplicates[newId]) {
              duplicates[newId] = [];
            }
            duplicates[newId].push({id, content});
          }
        }
      });
    }

    const onComplete = (res: {[newId: string]: string} = {}): string => {
      const newMapping: {[oldId: string]: string | null} = {};
      Object.keys(mapping.newToOld).forEach((newId: string) => {
        if (res[newId]) {
          newMapping[res[newId]] = newId;
          // set the other values to null to be removed
          mapping.newToOld[newId].forEach((oldId: string) => {
            if (oldId !== res[newId]) {
              newMapping[oldId] = null;
            }
          });
        } else {
          // auto resolve, take the first value
          newMapping[mapping.newToOld[newId][0]] = newId;
        }
      });

      const updatedTranslations = compiler.applyIdsMapping(translations, newMapping);
      this.host.writeFile(i18nFile, updatedTranslations, false);
      return i18nFile;
    };

    if (Object.keys(duplicates).length) {
      return inquirer
          .prompt(Object.keys(duplicates)
                      .map((newId: string) => ({
                             type: 'list',
                             name: newId,
                             message: 'Duplicates detected, which message do you want to keep?',
                             choices: duplicates[newId].map(
                                 ({id, content}: {id: string, content: string}) => {
                                   return {name: content, value: id};
                                 })
                           })))
          .then(onComplete);
    } else {
      return Promise.resolve(onComplete());
    }
  }

  static create(
      options: tsc.AngularCompilerOptions, program: ts.Program, tsCompilerHost: ts.CompilerHost,
      files: string[], compilerHostContext?: CompilerHostContext,
      ngCompilerHost?: CompilerHost): Migrator {
    if (!ngCompilerHost) {
      const usePathMapping = !!options.rootDirs && options.rootDirs.length > 0;
      const context = compilerHostContext || new ModuleResolutionHostAdapter(tsCompilerHost);
      ngCompilerHost = usePathMapping ? new PathMappedCompilerHost(program, options, context) :
                                        new CompilerHost(program, options, context);
    }

    const msgBundleExtractor = Extractor.create(
        options, program, tsCompilerHost, null, compilerHostContext, ngCompilerHost,
        I18nVersion.Version1);

    return new Migrator(tsCompilerHost, msgBundleExtractor, files);
  }
}
