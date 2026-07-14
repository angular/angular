/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {FileUpdate, TsCreateProgramDriver, UpdateMode} from '../../program_driver';
import {sfExtensionData, ShimReferenceTagger, untagAllTsFiles} from '../../shims';
import {expectCompleteReuse, makeProgram} from '../../testing';
import {OptimizeFor} from '../api';

import {setup} from '../testing';

runInEachFileSystem(() => {
  describe('template type-checking program', () => {
    it('should not be created if no components need to be checked', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {
          fileName,
          templates: {},
          source: `export class NotACmp {}`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);

      templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
      // expect() here would create a really long error message, so this is checked manually.
      if (programStrategy.getProgram() !== program) {
        fail('Template type-checking created a new ts.Program even though it had no changes.');
      }
    });

    it('should have complete reuse if no structural changes are made to shims', () => {
      const {program, host, options, typecheckPath} = makeSingleFileProgramWithTypecheckShim();
      const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

      // Update /main.ngtypecheck.ts without changing its shape. Verify that the old program was
      // reused completely.
      programStrategy.updateFiles(
        new Map([[typecheckPath, createUpdate('export const VERSION = 2;')]]),
        UpdateMode.Complete,
      );

      expectCompleteReuse(programStrategy.getProgram());
    });

    it('should have complete reuse if no structural changes are made to input files', () => {
      const {program, host, options, mainPath} = makeSingleFileProgramWithTypecheckShim();
      const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

      // Update /main.ts without changing its shape. Verify that the old program was reused
      // completely.
      programStrategy.updateFiles(
        new Map([[mainPath, createUpdate('export const STILL_NOT_A_COMPONENT = true;')]]),
        UpdateMode.Complete,
      );

      expectCompleteReuse(programStrategy.getProgram());
    });

    it('should retain shim tags on shared SourceFiles after updateFiles', () => {
      assertShimTagsRetainedAfterUpdate(UpdateMode.Complete);
    });

    it('should retain shim tags on shared SourceFiles after incremental updateFiles', () => {
      const {program, host, options, typecheckPath, mainPath} =
        makeProgramWhereShimIsIncludedViaReference();

      const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

      programStrategy.updateFiles(
        new Map([[typecheckPath, createUpdate('export const VERSION = 2;')]]),
        UpdateMode.Complete,
      );
      programStrategy.updateFiles(
        new Map([[typecheckPath, createUpdate('export const VERSION = 3;')]]),
        UpdateMode.Incremental,
      );

      assertSharedSourceFileShimTags(programStrategy.getProgram(), mainPath);
    });

    it('should allow untagging the input program for emit after updateFiles', () => {
      const {program, host, options, typecheckPath, mainPath} =
        makeProgramWhereShimIsIncludedViaReference();

      const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

      // Update only the shim file so /main.ts remains a shared SourceFile between programs.
      programStrategy.updateFiles(
        new Map([[typecheckPath, createUpdate('export const VERSION = 2;')]]),
        UpdateMode.Complete,
      );

      const mainSf = getSourceFileOrError(program, mainPath);
      const ext = sfExtensionData(mainSf);

      expect(ext.taggedReferenceFiles).not.toBeNull();
      expect(mainSf.referencedFiles.length).toEqual(ext.taggedReferenceFiles!.length);

      // prepareEmit() untags the input program before emit (#56945).
      untagAllTsFiles(program);

      expect(ext.originalReferencedFiles).not.toBeNull();
      expect(mainSf.referencedFiles).toEqual(ext.originalReferencedFiles!);
      for (const ref of mainSf.referencedFiles) {
        expect(ref.fileName).not.toContain('ngtypecheck');
      }
    });
  });
});

function assertShimTagsRetainedAfterUpdate(updateMode: UpdateMode): void {
  const {program, host, options, typecheckPath, mainPath} =
    makeProgramWhereShimIsIncludedViaReference();

  const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);

  // Update only the shim file so /main.ts remains a shared SourceFile between programs.
  programStrategy.updateFiles(
    new Map([[typecheckPath, createUpdate('export const VERSION = 2;')]]),
    updateMode,
  );

  assertSharedSourceFileShimTags(programStrategy.getProgram(), mainPath);
}

function assertSharedSourceFileShimTags(program: ts.Program, mainPath: AbsoluteFsPath): void {
  const mainSf = getSourceFileOrError(program, mainPath);
  const ext = sfExtensionData(mainSf);

  // Without the fix, untagging the old program also untags shared SourceFiles in the new
  // program, leaving referencedFiles shorter than taggedReferenceFiles.
  expect(ext.taggedReferenceFiles).not.toBeNull();
  expect(mainSf.referencedFiles.length).toEqual(ext.taggedReferenceFiles!.length);

  // Replicates the TS 5.5+ crash from #68164: with composite, a shim included only via
  // referencedFiles gets a lazy "not listed in project" diagnostic. Expanding that diagnostic
  // walks the ReferenceFile include reason and reads main.referencedFiles[index].
  expect(() => program.getSemanticDiagnostics(mainSf)).not.toThrow();
}

function createUpdate(text: string): FileUpdate {
  return {
    newText: text,
    originalFile: null,
  };
}

function makeSingleFileProgramWithTypecheckShim(): {
  program: ts.Program;
  host: ts.CompilerHost;
  options: ts.CompilerOptions;
  mainPath: AbsoluteFsPath;
  typecheckPath: AbsoluteFsPath;
} {
  const mainPath = absoluteFrom('/main.ts');
  const typecheckPath = absoluteFrom('/main.ngtypecheck.ts');
  const {program, host, options} = makeProgram([
    {
      name: mainPath,
      contents: 'export const NOT_A_COMPONENT = true;',
    },
    {
      name: typecheckPath,
      contents: 'export const VERSION = 1;',
    },
  ]);

  const sf = getSourceFileOrError(program, mainPath);
  const typecheckSf = getSourceFileOrError(program, typecheckPath);

  // To ensure this test is validating the correct behavior, the initial conditions of the
  // input program must be such that:
  //
  // 1) /main.ts was previously tagged with a reference to its ngtypecheck shim.
  // 2) /main.ngtypecheck.ts is marked as a shim itself.

  // Condition 1:
  const tagger = new ShimReferenceTagger(['ngtypecheck']);
  tagger.tag(sf);
  tagger.finalize();

  // Condition 2:
  sfExtensionData(typecheckSf).fileShim = {
    extension: 'ngtypecheck',
    generatedFrom: mainPath,
  };

  return {program, host, options, mainPath, typecheckPath};
}

/**
 * Build a program where the ngtypecheck shim is pulled in only through a tagged
 * `referencedFiles` entry (not as a root). Combined with `composite`, TypeScript records a lazy
 * project-file-list diagnostic whose expansion exercises `referencedFiles[index]` — the path that
 * crashes when shared SourceFiles are untagged after `updateFiles()`.
 */
function makeProgramWhereShimIsIncludedViaReference(): {
  program: ts.Program;
  host: ts.CompilerHost;
  options: ts.CompilerOptions;
  mainPath: AbsoluteFsPath;
  typecheckPath: AbsoluteFsPath;
} {
  const mainPath = absoluteFrom('/main.ts');
  const typecheckPath = absoluteFrom('/main.ngtypecheck.ts');
  const {host, options} = makeProgram(
    [
      {
        name: mainPath,
        contents: 'export const NOT_A_COMPONENT = true;',
      },
      {
        name: typecheckPath,
        contents: 'export const VERSION = 1;',
        isRoot: false,
      },
    ],
    {
      composite: true,
      declaration: true,
    },
    /* host */ undefined,
    /* checkForErrors */ false,
  );

  const shimTagger = new ShimReferenceTagger(['ngtypecheck']);
  // Inherit prototype methods from the real host; object spread would drop them.
  const taggingHost = Object.create(host) as ts.CompilerHost;
  taggingHost.getSourceFile = (
    fileName: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean,
  ): ts.SourceFile | undefined => {
    const sf = host.getSourceFile(
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile,
    );
    if (sf !== undefined) {
      shimTagger.tag(sf);
    }
    return sf;
  };

  const program = ts.createProgram({
    rootNames: [host.getCanonicalFileName(mainPath)],
    options,
    host: taggingHost,
  });
  shimTagger.finalize();

  const typecheckSf = getSourceFileOrError(program, typecheckPath);
  sfExtensionData(typecheckSf).fileShim = {
    extension: 'ngtypecheck',
    generatedFrom: mainPath,
  };

  // Return the unwrapped host; TsCreateProgramDriver installs its own tagging host on updates.
  return {program, host, options, mainPath, typecheckPath};
}
