/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chai from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as main from '../lib/main';
import {assertFileEqual, unlinkRecursively} from './helpers';

describe('integration test: public api', () => {
  let _warn: any = null;
  let warnings: string[] = [];
  beforeEach(() => {
    _warn = console.warn;
    console.warn = (...args: string[]) => warnings.push(args.join(' '));
  });

  afterEach(() => {
    console.warn = _warn;
    warnings = [];
    _warn = null;
  });

  it('should handle empty files', () => {
    check('test/fixtures/empty.d.ts', 'test/fixtures/empty_expected.d.ts');
  });

  it('should include symbols', () => {
    check('test/fixtures/simple.d.ts', 'test/fixtures/simple_expected.d.ts');
  });

  it('should include symbols reexported explicitly', () => {
    check('test/fixtures/reexported.d.ts', 'test/fixtures/reexported_expected.d.ts');
  });

  it('should include symbols reexported with *', () => {
    check('test/fixtures/reexported_star.d.ts', 'test/fixtures/reexported_star_expected.d.ts');
  });

  it('should include members of classes and interfaces', () => {
    check(
        'test/fixtures/classes_and_interfaces.d.ts',
        'test/fixtures/classes_and_interfaces_expected.d.ts');
  });

  it('should include value and type', () => {
    check(
        'test/fixtures/exports_type_and_value.d.ts',
        'test/fixtures/exports_type_and_value_expected.d.ts');
  });

  it('should include members reexported classes', () => {
    check(
        'test/fixtures/reexported_classes.d.ts', 'test/fixtures/reexported_classes_expected.d.ts');
  });

  it('should remove reexported external symbols', () => {
    check('test/fixtures/reexported_extern.d.ts', 'test/fixtures/reexported_extern_expected.d.ts');
    chai.assert.deepEqual(warnings, [
      'test/fixtures/reexported_extern.d.ts(5,1): error: No export declaration found for symbol "CompilerHost"'
    ]);
  });

  it('should support type literals', () => {
    check('test/fixtures/type_literals.d.ts', 'test/fixtures/type_literals_expected.d.ts');
  });

  it('should allow enums as types', () => {
    check('test/fixtures/enum_as_type.d.ts', 'test/fixtures/enum_as_type_expected.d.ts');
  });

  it('should throw on passing a .ts file as an input', () => {
    chai.assert.throws(() => {
      main.publicApi('test/fixtures/empty.ts');
    }, 'Source file "test/fixtures/empty.ts" is not a declaration file');
  });

  it('should respect serialization options', () => {
    check(
        'test/fixtures/underscored.d.ts', 'test/fixtures/underscored_expected.d.ts',
        {stripExportPattern: /^__.*/});
  });
});

describe('integration test: generateGoldenFile', () => {
  const outDir = path.join(process.env['TEST_TMPDIR'], 'tmp');
  const outFile = path.join(outDir, 'out.d.ts');
  const deepOutFile = path.join(outDir, 'a/b/c/out.d.ts');

  beforeEach(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  });

  afterEach(() => {
    unlinkRecursively(outDir);
  });


  it('should generate a golden file', () => {
    main.generateGoldenFile('test/fixtures/reexported_classes.d.ts', outFile);
    assertFileEqual(outFile, 'test/fixtures/reexported_classes_expected.d.ts');
  });

  it('should generate a golden file with any ancestor directory created', () => {
    main.generateGoldenFile('test/fixtures/reexported_classes.d.ts', deepOutFile);
    assertFileEqual(deepOutFile, 'test/fixtures/reexported_classes_expected.d.ts');
  });

  it('should respect serialization options', () => {
    main.generateGoldenFile(
        'test/fixtures/underscored.d.ts', outFile, {stripExportPattern: /^__.*/});
    assertFileEqual(outFile, 'test/fixtures/underscored_expected.d.ts');
  });

  it('should generate a golden file with keyof', () => {
    main.generateGoldenFile('test/fixtures/keyof.d.ts', outFile);
    assertFileEqual(outFile, 'test/fixtures/keyof_expected.d.ts');
  });
});

describe('integration test: verifyAgainstGoldenFile', () => {
  it('should check an entrypoint against a golden file on equal', () => {
    const diff = main.verifyAgainstGoldenFile(
        'test/fixtures/reexported_classes.d.ts', 'test/fixtures/reexported_classes_expected.d.ts');
    chai.assert.equal(diff, '');
  });

  it('should check an entrypoint against a golden file with proper diff message', () => {
    const diff = main.verifyAgainstGoldenFile(
        'test/fixtures/verify_entrypoint.d.ts', 'test/fixtures/verify_expected.d.ts');
    chai.assert.equal(diff, fs.readFileSync('test/fixtures/verify.patch').toString());
  });

  it('should respect serialization options', () => {
    const diff = main.verifyAgainstGoldenFile(
        'test/fixtures/underscored.d.ts', 'test/fixtures/underscored_expected.d.ts',
        {stripExportPattern: /^__.*/});
    chai.assert.equal(diff, '');
  });
});

function check(sourceFile: string, expectedFile: string, options: main.SerializationOptions = {}) {
  chai.assert.equal(main.publicApi(sourceFile, options), fs.readFileSync(expectedFile).toString());
}
