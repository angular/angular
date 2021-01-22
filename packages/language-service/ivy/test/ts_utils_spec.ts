/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';
import {LanguageServiceTestEnv, OpenBuffer, Project} from '../testing';
import {collectMemberMethods, findTightestNode} from '../ts_utils';

describe('ts utils', () => {
  describe('collectMemberMethods', () => {
    beforeEach(() => {
      initMockFileSystem('Native');
    });

    it('gets only methods in class, not getters, setters, or properties', () => {
      const files = {
        'app.ts': `
              export class AppCmp {
                prop!: string;
                get myString(): string {
                    return '';
                }
                set myString(v: string) {
                }

                one() {}
                two() {}
              }`,
      };
      const env = LanguageServiceTestEnv.setup();
      const project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('AppC¦mp');
      const memberMethods = getMemberMethodNames(project, appFile);
      expect(memberMethods).toEqual(['one', 'two']);
    });

    it('gets inherited methods in class', () => {
      const files = {
        'app.ts': `
              export class BaseClass {
                baseMethod() {}
              }
              export class AppCmp extends BaseClass {}`,
      };
      const env = LanguageServiceTestEnv.setup();
      const project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('AppC¦mp');
      const memberMethods = getMemberMethodNames(project, appFile);
      expect(memberMethods).toEqual(['baseMethod']);
    });

    it('does not return duplicates if base method is overridden', () => {
      const files = {
        'app.ts': `
              export class BaseClass {
                baseMethod() {}
              }
              export class AppCmp extends BaseClass {
                  baseMethod() {}
              }`,
      };
      const env = LanguageServiceTestEnv.setup();
      const project = env.addProject('test', files);
      const appFile = project.openFile('app.ts');
      appFile.moveCursorToText('AppC¦mp');
      const memberMethods = getMemberMethodNames(project, appFile);
      expect(memberMethods).toEqual(['baseMethod']);
    });

    function getMemberMethodNames(project: Project, file: OpenBuffer): string[] {
      const sf = project.getSourceFile('app.ts')!;
      const node = findTightestNode(sf, file.cursor)!;
      expect(ts.isClassDeclaration(node.parent)).toBe(true);
      return collectMemberMethods(node.parent as ts.ClassDeclaration, project.getTypeChecker())
          .map(m => m.name.getText())
          .sort();
    }
  });
});
