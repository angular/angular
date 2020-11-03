/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PluginObj, transformSync} from '@babel/core';
import {createEs2015LinkerPlugin} from '../../../linker/babel';
import {checkExpectations, compileTest, getComplianceTests} from '../mock_compile/run_compliance_tests';

describe('compliance tests (partial compile + link)', () => {
  for (const test of getComplianceTests()) {
    describe(`[${test.group}]`, () => {
      const itFn = test.focusTest ? fit : test.excludeTest ? xit : it;
      itFn(test.description, () => {
        const {fs, env, generatedFiles} = compileTest(
            test.testPath, test.inputFiles, test.compilerOptions,
            {...test.angularCompilerOptions, compilationMode: 'partial'});

        const linkerPlugin = createEs2015LinkerPlugin(test.angularCompilerOptions);
        for (const fileName of generatedFiles) {
          const source = fs.readFile(fileName);
          const linkedSource = applyLinker({fileName, source}, linkerPlugin);
          env.write(fileName, linkedSource);
        }

        for (const expectation of test.expectations) {
          checkExpectations(fs, env, expectation.failureMessage, expectation.files);
        }
      });
    });
  }
});

/**
 * Runs the provided code through the Babel linker plugin, if the file has the .js extension.
 *
 * @param file The file name and its source to be transformed using the linker.
 * @param linkerPlugin The linker plugin to apply.
 * @returns The file's source content, which has been transformed using the linker if necessary.
 */
function applyLinker(file: {fileName: string; source: string}, linkerPlugin: PluginObj): string {
  if (!file.fileName.endsWith('.js')) {
    return file.source;
  }
  const result = transformSync(file.source, {
    filename: file.fileName,
    plugins: [linkerPlugin],
    parserOpts: {sourceType: 'unambiguous'},
  });
  if (result === null) {
    throw fail('Babel transform did not have output');
  }
  if (result.code == null) {
    throw fail('Babel transform result does not have any code');
  }
  return result.code;
}
