/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  ProjectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {getImportSpecifier, getNamedImports} from '../../utils/typescript/imports';

const HTTP = '@angular/common/http';
const provideHttpClient = 'provideHttpClient';

const WITH_FETCH = 'withFetch';
const WITH_XHR = 'withXhr';
const CORE_PACKAGE = '@angular/core';
const HTTP_PACKAGE = '@angular/common/http';
const PROVIDE_HTTP_CLIENT = 'provideHttpClient';

export interface CompilationUnitData {
  replacements: Replacement[];
}

export interface MigrationConfig {
  /**
   * Whether to migrate this component template to self-closing tags.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;
}

const provideHttpClientIdentifier = ts.factory.createIdentifier('provideHttpClient');

export class XhrBackendMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();

    for (const sourceFile of info.sourceFiles) {
      const walk = (node: ts.Node): void => {
        const file = projectFile(sourceFile, info);
        if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
          return;
        }

        const httpImports = getNamedImports(sourceFile, HTTP);
        if (!httpImports) {
          return;
        }
        const importSpecifier = getImportSpecifier(sourceFile, HTTP, provideHttpClient);
        if (!importSpecifier) {
          return;
        }

        node.forEachChild(walk);

        if (!ts.isCallExpression(node)) return;
        if (!ts.isIdentifier(node.expression)) return;
        if (node.expression.text !== 'provideHttpClient') return;
        const withFetchNode = node.arguments.find((arg) => {
          return (
            ts.isCallExpression(arg) &&
            ts.isIdentifier(arg.expression) &&
            arg.expression.text === WITH_FETCH
          );
        });
        const withXhrNode = node.arguments.find((arg) => {
          return (
            ts.isCallExpression(arg) &&
            ts.isIdentifier(arg.expression) &&
            arg.expression.text === WITH_XHR
          );
        });

        if (!withFetchNode && !withXhrNode) {
          replacements.push(
            new Replacement(
              projectFile(sourceFile, info),
              new TextUpdate({
                position: node.arguments.pos,
                end: node.arguments.pos,
                toInsert: node.arguments.length ? 'withXhr(), ' : 'withXhr()',
              }),
            ),
          );
          importManager.addImport({
            exportModuleSpecifier: HTTP_PACKAGE,
            exportSymbolName: WITH_XHR,
            requestedFile: sourceFile,
          });
        } else if (withFetchNode) {
          const isLastArg = node.arguments[node.arguments.length - 1] === withFetchNode;
          replacements.push(
            new Replacement(
              projectFile(sourceFile, info),
              new TextUpdate({
                position: withFetchNode.getStart(),
                end: isLastArg ? withFetchNode.getEnd() : withFetchNode.getEnd() + 2, // +2 to remove the comma and space, could be improved
                toInsert: '',
              }),
            ),
          );
          importManager.removeImport(sourceFile, 'withFetch', HTTP_PACKAGE);
        }
      };
      sourceFile.forEachChild(walk);
    }

    applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const combined = [...unitA.replacements, ...unitB.replacements];
    return confirmAsSerializable({replacements: combined});
  }

  override async globalMeta(data: CompilationUnitData): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(data);
  }

  override async stats(data: CompilationUnitData) {
    return confirmAsSerializable({});
  }

  override async migrate(data: CompilationUnitData) {
    return {replacements: data.replacements};
  }
}
