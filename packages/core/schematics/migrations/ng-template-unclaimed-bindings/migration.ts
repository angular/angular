/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OptimizeFor} from '@angular/compiler-cli';
import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';

export interface CompilationUnitData {
  replacements: Replacement[];
}

/**
 * Error code of the "Can't bind to 'x' since it isn't a known property of 'y'" diagnostic
 * produced by the template type checker (`ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE)`,
 * reported as `NG8002`).
 */
const UNKNOWN_PROPERTY_DIAGNOSTIC_CODE = -998002;

export class NgTemplateUnclaimedBindingsMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];

    if (info.ngCompiler === null) {
      return confirmAsSerializable({replacements});
    }

    const seen = new Set<string>();

    for (const sourceFile of info.sourceFiles) {
      const diagnostics = info.ngCompiler.getDiagnosticsForFile(
        sourceFile,
        OptimizeFor.WholeProgram,
      );

      for (const diag of diagnostics) {
        if (
          diag.code !== UNKNOWN_PROPERTY_DIAGNOSTIC_CODE ||
          diag.file === undefined ||
          diag.start === undefined ||
          diag.length === undefined
        ) {
          continue;
        }

        const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        if (!message.includes(`known property of 'ng-template'`)) {
          continue;
        }

        const text = diag.file.text;
        const end = diag.start + diag.length;

        // Only remove actual property/two-way bindings (`[foo]="..."`, `[(foo)]="..."`).
        if (text[diag.start] !== '[') {
          continue;
        }

        // Include the whitespace between the binding and whatever precedes it.
        let start = diag.start;
        while (start > 0 && /\s/.test(text[start - 1])) {
          start--;
        }

        // The same diagnostic can be reported through multiple source files, e.g. for
        // external templates shared by more than one component.
        const key = `${diag.file.fileName}@${start}:${end}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);

        replacements.push(
          new Replacement(
            projectFile(diag.file, info),
            new TextUpdate({position: start, end, toInsert: ''}),
          ),
        );
      }
    }

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const seen = new Set<string>();
    const replacements: Replacement[] = [];

    for (const replacement of [...unitA.replacements, ...unitB.replacements]) {
      const {position, end, toInsert} = replacement.update.data;
      const key = `${replacement.projectFile.rootRelativePath}@${position}:${end}:${toInsert}`;

      if (!seen.has(key)) {
        seen.add(key);
        replacements.push(replacement);
      }
    }

    return confirmAsSerializable({replacements});
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: CompilationUnitData) {
    return confirmAsSerializable({
      removedBindings: globalMetadata.replacements.length,
    });
  }

  override async migrate(globalData: CompilationUnitData) {
    return {replacements: globalData.replacements};
  }
}
