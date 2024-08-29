/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {absoluteFromSourceFile} from '@angular/compiler-cli';
import {
  confirmAsSerializable,
  ProgramInfo,
  Replacement,
  Serializable,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';

import {DtsMetadataReader} from '../../../../compiler-cli/src/ngtsc/metadata';
import {TypeScriptReflectionHost} from '../../../../compiler-cli/src/ngtsc/reflection';
import {
  isOutputDeclaration,
  OutputID,
  getUniqueIdForProperty,
  getTargetPropertyDeclaration,
  extractSourceOutputDefinition,
} from './output_helpers';
import {calculateImportReplacements, calculateDeclarationReplacements} from './output-replacements';

interface OutputMigrationData {
  absolutePath: string;
  replacements: Replacement[];
}

interface CompilationUnitData {
  outputFields: Record<OutputID, OutputMigrationData>;
  problematicUsages: Record<OutputID, true>;
  importReplacements: Record<string, {add: Replacement[]; addAndRemove: Replacement[]}>;
}

export class OutputMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze({
    sourceFiles,
    program,
    projectDirAbsPath,
  }: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const outputFields: Record<OutputID, OutputMigrationData> = {};
    const problematicUsages: Record<OutputID, true> = {};

    const filesWithOutputDeclarations = new Set<string>();

    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const dtsReader = new DtsMetadataReader(checker, reflector);

    const outputDeclarationVisitor = (node: ts.Node) => {
      const outputDef = extractSourceOutputDefinition(node, reflector, projectDirAbsPath);

      if (outputDef !== null) {
        const absolutePath = absoluteFromSourceFile(node.getSourceFile());
        filesWithOutputDeclarations.add(absolutePath);
        outputFields[outputDef.id] = {
          absolutePath,
          replacements: calculateDeclarationReplacements(
            node as ts.PropertyDeclaration, // TODO: can I avoid as ts.PropertyDeclaration cast?
            outputDef.aliasParam,
          ),
        };

        return;
      }

      ts.forEachChild(node, outputDeclarationVisitor);
    };

    const outputUsageVisitor = (node: ts.Node) => {
      if (
        ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'pipe'
      ) {
        const targetSymbol = checker.getSymbolAtLocation(node.expression);
        if (targetSymbol !== undefined) {
          const propertyDeclaration = getTargetPropertyDeclaration(targetSymbol);
          if (
            propertyDeclaration !== null &&
            isOutputDeclaration(propertyDeclaration, reflector, dtsReader)
          ) {
            const id = getUniqueIdForProperty(projectDirAbsPath, propertyDeclaration);
            problematicUsages[id] = true;
          }
        }
      }

      ts.forEachChild(node, outputUsageVisitor);
    };

    // calculate output declaration replacements
    for (const sf of sourceFiles) {
      ts.forEachChild(sf, outputDeclarationVisitor);
    }

    // capture problematic usage patterns
    for (const sf of sourceFiles) {
      ts.forEachChild(sf, outputUsageVisitor);
    }

    // calculate import replacements but do so only for files that have output declarations
    const importReplacements = calculateImportReplacements(
      sourceFiles.filter((sf) => {
        const absolutePath = absoluteFromSourceFile(sf);
        return filesWithOutputDeclarations.has(absolutePath);
      }),
    );

    return confirmAsSerializable({
      outputFields,
      importReplacements,
      problematicUsages,
    });
  }

  override async merge(units: CompilationUnitData[]): Promise<Serializable<CompilationUnitData>> {
    const outputFields: Record<OutputID, OutputMigrationData> = {};
    const importReplacements: Record<string, {add: Replacement[]; addAndRemove: Replacement[]}> =
      {};
    const problematicUsages: Record<OutputID, true> = {};

    for (const unit of units) {
      for (const declIdStr of Object.keys(unit.outputFields)) {
        const declId = declIdStr as OutputID;
        // THINK: detect clash? Should we have an utility to merge data based on unique IDs?
        outputFields[declId] = unit.outputFields[declId];
      }

      for (const path of Object.keys(unit.importReplacements)) {
        importReplacements[path] = unit.importReplacements[path];
      }

      for (const declIdStr of Object.keys(unit.problematicUsages)) {
        const declId = declIdStr as OutputID;
        problematicUsages[declId] = unit.problematicUsages[declId];
      }
    }

    return confirmAsSerializable({
      outputFields,
      importReplacements,
      problematicUsages,
    });
  }

  override async migrate(globalData: CompilationUnitData): Promise<Replacement[]> {
    const migratedFiles = new Set<string>();
    const problematicFiles = new Set<string>();

    const replacements: Replacement[] = [];
    for (const declIdStr of Object.keys(globalData.outputFields)) {
      const declId = declIdStr as OutputID;
      const outputField = globalData.outputFields[declId];

      if (!globalData.problematicUsages[declId]) {
        replacements.push(...outputField.replacements);
        migratedFiles.add(outputField.absolutePath);
      } else {
        problematicFiles.add(outputField.absolutePath);
      }
    }

    for (const path of Object.keys(globalData.importReplacements)) {
      if (migratedFiles.has(path)) {
        const importReplacements = globalData.importReplacements[path];
        if (problematicFiles.has(path)) {
          replacements.push(...importReplacements.add);
        } else {
          replacements.push(...importReplacements.addAndRemove);
        }
      }
    }

    return replacements;
  }
}
