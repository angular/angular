/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {absoluteFrom, absoluteFromSourceFile, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {OptimizeFor} from '../api';

import {getClass, setup, TestDeclaration} from '../testing';

runInEachFileSystem(() => {
  describe('TemplateTypeChecker', () => {
    it('should batch diagnostic operations when requested in WholeProgram mode', () => {
      const file1 = absoluteFrom('/file1.ts');
      const file2 = absoluteFrom('/file2.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {fileName: file1, templates: {'Cmp1': '<div></div>'}},
        {fileName: file2, templates: {'Cmp2': '<span></span>'}}
      ]);

      templateTypeChecker.getDiagnosticsForFile(
          getSourceFileOrError(program, file1), OptimizeFor.WholeProgram);
      const ttcProgram1 = programStrategy.getProgram();
      templateTypeChecker.getDiagnosticsForFile(
          getSourceFileOrError(program, file2), OptimizeFor.WholeProgram);
      const ttcProgram2 = programStrategy.getProgram();

      expect(ttcProgram1).toBe(ttcProgram2);
    });

    it('should not batch diagnostic operations when requested in SingleFile mode', () => {
      const file1 = absoluteFrom('/file1.ts');
      const file2 = absoluteFrom('/file2.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {fileName: file1, templates: {'Cmp1': '<div></div>'}},
        {fileName: file2, templates: {'Cmp2': '<span></span>'}}
      ]);

      templateTypeChecker.getDiagnosticsForFile(
          getSourceFileOrError(program, file1), OptimizeFor.SingleFile);
      const ttcProgram1 = programStrategy.getProgram();

      // ttcProgram1 should not contain a type check block for Cmp2.
      const ttcSf2Before = getSourceFileOrError(ttcProgram1, absoluteFrom('/file2.ngtypecheck.ts'));
      expect(ttcSf2Before.text).not.toContain('Cmp2');

      templateTypeChecker.getDiagnosticsForFile(
          getSourceFileOrError(program, file2), OptimizeFor.SingleFile);
      const ttcProgram2 = programStrategy.getProgram();

      // ttcProgram2 should now contain a type check block for Cmp2.
      const ttcSf2After = getSourceFileOrError(ttcProgram2, absoluteFrom('/file2.ngtypecheck.ts'));
      expect(ttcSf2After.text).toContain('Cmp2');

      expect(ttcProgram1).not.toBe(ttcProgram2);
    });

    it('should allow access to the type-check block of a component', () => {
      const file1 = absoluteFrom('/file1.ts');
      const file2 = absoluteFrom('/file2.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {fileName: file1, templates: {'Cmp1': '<div>{{value}}</div>'}},
        {fileName: file2, templates: {'Cmp2': '<span></span>'}}
      ]);

      const cmp1 = getClass(getSourceFileOrError(program, file1), 'Cmp1');
      const block = templateTypeChecker.getTypeCheckBlock(cmp1);
      expect(block).not.toBeNull();
      expect(block!.getText()).toMatch(/: i[0-9]\.Cmp1/);
      expect(block!.getText()).toContain(`value`);
    });

    it('should clear old inlines when necessary', () => {
      const file1 = absoluteFrom('/file1.ts');
      const file2 = absoluteFrom('/file2.ts');
      const dirFile = absoluteFrom('/dir.ts');
      const dirDeclaration: TestDeclaration = {
        name: 'TestDir',
        selector: '[dir]',
        file: dirFile,
        type: 'directive',
        isGeneric: true,
      };
      const {program, templateTypeChecker, programStrategy} = setup([
        {
          fileName: file1,
          templates: {'CmpA': '<div dir></div>'},
          declarations: [dirDeclaration],
        },
        {
          fileName: file2,
          templates: {'CmpB': '<div dir></div>'},
          declarations: [dirDeclaration],
        },
        {
          fileName: dirFile,
          source: `
                // A non-exported interface used as a type bound for a generic directive causes
                // an inline type constructor to be required.
                interface NotExported {}
                export abstract class TestDir<T extends NotExported> {}`,
          templates: {},
        },
      ]);
      const sf1 = getSourceFileOrError(program, file1);
      const cmpA = getClass(sf1, 'CmpA');
      const sf2 = getSourceFileOrError(program, file2);
      const cmpB = getClass(sf2, 'CmpB');
      // Prime the TemplateTypeChecker by asking for a TCB from file1.
      expect(templateTypeChecker.getTypeCheckBlock(cmpA)).not.toBeNull();

      // Next, ask for a TCB from file2. This operation should clear data on TCBs generated for
      // file1.
      expect(templateTypeChecker.getTypeCheckBlock(cmpB)).not.toBeNull();

      // This can be detected by asking for a TCB again from file1. Since no data should be
      // available for file1, this should cause another type-checking program step.
      const prevTtcProgram = programStrategy.getProgram();
      expect(templateTypeChecker.getTypeCheckBlock(cmpA)).not.toBeNull();
      expect(programStrategy.getProgram()).not.toBe(prevTtcProgram);
    });

    describe('when inlining is unsupported', () => {
      it('should not produce errors for components that do not require inlining', () => {
        const fileName = absoluteFrom('/main.ts');
        const dirFile = absoluteFrom('/dir.ts');
        const {program, templateTypeChecker} = setup(
            [
              {
                fileName,
                source: `export class Cmp {}`,
                templates: {'Cmp': '<div dir></div>'},
                declarations: [{
                  name: 'TestDir',
                  selector: '[dir]',
                  file: dirFile,
                  type: 'directive',
                }]
              },
              {
                fileName: dirFile,
                source: `export class TestDir {}`,
                templates: {},
              }
            ],
            {inlining: false});
        const sf = getSourceFileOrError(program, fileName);
        const diags = templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
        expect(diags.length).toBe(0);
      });

      it('should produce errors for components that require TCB inlining', () => {
        const fileName = absoluteFrom('/main.ts');
        const {program, templateTypeChecker} = setup(
            [{
              fileName,
              source: `abstract class Cmp {} // not exported, so requires inline`,
              templates: {'Cmp': '<div></div>'}
            }],
            {inlining: false});
        const sf = getSourceFileOrError(program, fileName);
        const diags = templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INLINE_TCB_REQUIRED));
      });
    });

    describe('getTemplateOfComponent()', () => {
      it('should provide access to a component\'s real template', () => {
        const fileName = absoluteFrom('/main.ts');
        const {program, templateTypeChecker} = setup([{
          fileName,
          templates: {
            'Cmp': '<div>Template</div>',
          },
        }]);
        const cmp = getClass(getSourceFileOrError(program, fileName), 'Cmp');

        const nodes = templateTypeChecker.getTemplate(cmp)!;
        expect(nodes).not.toBeNull();
        expect(nodes[0].sourceSpan.start.file.content).toBe('<div>Template</div>');
      });
    });
  });
});
