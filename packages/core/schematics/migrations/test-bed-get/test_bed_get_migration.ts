/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  ProjectFile,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

export interface CompilationUnitData {
  locations: Location[];
}

/** Information about the `get` identifier in `TestBed.get`. */
interface Location {
  /** File in which the expression is defined. */
  file: ProjectFile;

  /** Start of the `get` identifier. */
  position: number;
}

/** Name of the method being replaced. */
const METHOD_NAME = 'get';

/** Migration that replaces `TestBed.get` usages with `TestBed.inject`. */
export class TestBedGetMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const locations: Location[] = [];

    for (const sourceFile of info.sourceFiles) {
      const specifier = getImportSpecifier(sourceFile, '@angular/core/testing', 'TestBed');

      if (specifier === null) {
        continue;
      }

      const typeChecker = info.program.getTypeChecker();
      sourceFile.forEachChild(function walk(node) {
        if (
          ts.isPropertyAccessExpression(node) &&
          node.name.text === METHOD_NAME &&
          ts.isIdentifier(node.expression) &&
          isReferenceToImport(typeChecker, node.expression, specifier)
        ) {
          locations.push({file: projectFile(sourceFile, info), position: node.name.getStart()});
        } else {
          node.forEachChild(walk);
        }
      });
    }

    return confirmAsSerializable({locations});
  }

  override async migrate(globalData: CompilationUnitData) {
    const replacements = globalData.locations.map(({file, position}) => {
      return new Replacement(
        file,
        new TextUpdate({
          position: position,
          end: position + METHOD_NAME.length,
          toInsert: 'inject',
        }),
      );
    });

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const seen = new Set<string>();
    const locations: Location[] = [];
    const combined = [...unitA.locations, ...unitB.locations];

    for (const location of combined) {
      const key = `${location.file.id}#${location.position}`;
      if (!seen.has(key)) {
        seen.add(key);
        locations.push(location);
      }
    }

    return confirmAsSerializable({locations});
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats() {
    return confirmAsSerializable({});
  }
}
