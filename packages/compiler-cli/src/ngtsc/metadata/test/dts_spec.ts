/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ExternalExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {Reference} from '../../imports';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {loadFakeCore, makeProgram} from '../../testing';

import {DtsMetadataReader} from '../src/dts';

runInEachFileSystem(() => {
  beforeEach(() => {
    loadFakeCore(getFileSystem());
  });

  describe('DtsMetadataReader', () => {
    it('should not assume directives are structural', () => {
      const mainPath = absoluteFrom('/main.d.ts');
      const {program} = makeProgram(
          [{
            name: mainPath,
            contents: `
          import {ViewContainerRef} from '@angular/core';
          import * as i0 from '@angular/core';

          export declare class TestDir {
            constructor(p0: ViewContainerRef);
            static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {}, {}, never>
          }
        `
          }],
          {
            skipLibCheck: true,
            lib: ['es6', 'dom'],
          });

      const sf = getSourceFileOrError(program, mainPath);
      const clazz = sf.statements[2];
      if (!isNamedClassDeclaration(clazz)) {
        return fail('Expected class declaration');
      }

      const typeChecker = program.getTypeChecker();
      const dtsReader =
          new DtsMetadataReader(typeChecker, new TypeScriptReflectionHost(typeChecker));

      const meta = dtsReader.getDirectiveMetadata(new Reference(clazz))!;
      expect(meta.isStructural).toBeFalse();
    });

    it('should identify a structural directive by its constructor', () => {
      const mainPath = absoluteFrom('/main.d.ts');
      const {program} = makeProgram(
          [{
            name: mainPath,
            contents: `
          import {TemplateRef, ViewContainerRef} from '@angular/core';
          import * as i0 from '@angular/core';

          export declare class TestDir {
            constructor(p0: ViewContainerRef, p1: TemplateRef);
            static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {}, {}, never>
          }
        `
          }],
          {
            skipLibCheck: true,
            lib: ['es6', 'dom'],
          });

      const sf = getSourceFileOrError(program, mainPath);
      const clazz = sf.statements[2];
      if (!isNamedClassDeclaration(clazz)) {
        return fail('Expected class declaration');
      }

      const typeChecker = program.getTypeChecker();
      const dtsReader =
          new DtsMetadataReader(typeChecker, new TypeScriptReflectionHost(typeChecker));

      const meta = dtsReader.getDirectiveMetadata(new Reference(clazz))!;
      expect(meta.isStructural).toBeTrue();
    });
  });
});
