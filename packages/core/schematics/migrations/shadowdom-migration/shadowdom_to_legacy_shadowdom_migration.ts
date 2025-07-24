/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
import ts from 'typescript';

const VIEW_ENCAPSULATION_SHADOW_DOM = 'ViewEncapsulation.ShadowDom';
const VIEW_ENCAPSULATION_LEGACY_SHADOW_DOM = 'ViewEncapsulation.LegacyShadowDom';

interface CompilationUnitData {
  locations: Location[];
}

interface Location {
  file: ProjectFile;
  position: number;
  end: number;
}

export class ShadowDomToLegacyShadowDomMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  readonly name = 'ViewEncapsulation.ShadowDom to ViewEncapsulation.LegacyShadowDom';

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const locations: Location[] = [];

    for (const sourceFile of info.sourceFiles) {
      // Skip files in node_modules
      if (sourceFile.fileName.includes('node_modules')) {
        continue;
      }
      sourceFile.forEachChild(function walk(node) {
        if (
          ts.isPropertyAccessExpression(node) &&
          node.getText() === VIEW_ENCAPSULATION_SHADOW_DOM
        ) {
          locations.push({
            file: projectFile(sourceFile, info),
            position: node.getStart(),
            end: node.getEnd(),
          });
        }
        node.forEachChild(walk);
      });
    }

    return confirmAsSerializable({locations});
  }

  override async migrate(globalData: CompilationUnitData) {
    const replacements = globalData.locations.map(({file, position, end}) => {
      return new Replacement(
        file,
        new TextUpdate({
          position,
          end,
          toInsert: VIEW_ENCAPSULATION_LEGACY_SHADOW_DOM,
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

  override async stats(
    globalMetadata: CompilationUnitData,
  ): Promise<Serializable<{replaced: {name: string; value: number}}>> {
    return confirmAsSerializable({
      replaced: {
        name: 'Usages of `ViewEncapsulation.ShadowDom` replaced',
        value: globalMetadata.locations.length,
      },
    });
  }
}
