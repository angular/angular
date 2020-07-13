/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';

import {getClass, setup} from './test_utils';

runInEachFileSystem(() => {
  describe('TemplateTypeChecker', () => {
    it('should batch diagnostic operations when requested in WholeProgram mode', () => {
      const file1 = absoluteFrom('/file1.ts');
      const file2 = absoluteFrom('/file2.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {fileName: file1, templates: {'Cmp1': '<div></div>'}},
        {fileName: file2, templates: {'Cmp2': '<span></span>'}}
      ]);

      templateTypeChecker.getDiagnosticsForFile(getSourceFileOrError(program, file1));
      const ttcProgram1 = programStrategy.getProgram();
      templateTypeChecker.getDiagnosticsForFile(getSourceFileOrError(program, file2));
      const ttcProgram2 = programStrategy.getProgram();

      expect(ttcProgram1).toBe(ttcProgram2);
    });

    it('should allow access to the type-check block of a component', () => {
      const file1 = absoluteFrom('/file1.ts');
      const file2 = absoluteFrom('/file2.ts');
      const {program, templateTypeChecker, programStrategy} = setup([
        {fileName: file1, templates: {'Cmp1': '<div></div>'}},
        {fileName: file2, templates: {'Cmp2': '<span></span>'}}
      ]);

      const cmp1 = getClass(getSourceFileOrError(program, file1), 'Cmp1');
      const block = templateTypeChecker.getTypeCheckBlock(cmp1);
      expect(block).not.toBeNull();
      expect(block!.getText()).toMatch(/: i[0-9]\.Cmp1/);
      expect(block!.getText()).toContain(`document.createElement("div")`);
    });
  });
});
