/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {absoluteFrom} from '../../../file_system';
import {runInEachFileSystem} from '../../../file_system/testing';
import {ImportedSymbolsTracker} from '../../../imports';
import {ClassMember} from '../../../reflection';
import {makeProgram} from '../../../testing';
import {tryParseInitializerApiMember} from '../src/initializer_functions';


runInEachFileSystem(() => {
  describe('initializer function detection', () => {
    it('should identify a non-required function that is imported directly', () => {
      const {member, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model(1);
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);

      expect(result).toEqual({
        apiName: 'model',
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a required function that is imported directly', () => {
      const {member, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model.required();
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);

      expect(result).toEqual({
        apiName: 'model',
        isRequired: true,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a non-required function that is aliased', () => {
      const {member, importTracker} = setup(`
        import {Directive, model as alias} from '@angular/core';

        @Directive()
        export class Dir {
          test = alias(1);
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);

      expect(result).toEqual({
        apiName: 'model',
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a required function that is aliased', () => {
      const {member, importTracker} = setup(`
        import {Directive, model as alias} from '@angular/core';

        @Directive()
        export class Dir {
          test = alias.required();
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);

      expect(result).toEqual({
        apiName: 'model',
        isRequired: true,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a non-required function that is imported via namespace import', () => {
      const {member, importTracker} = setup(`
        import * as core from '@angular/core';

        @core.Directive()
        export class Dir {
          test = core.model(1);
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);

      expect(result).toEqual({
        apiName: 'model',
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a required function that is imported via namespace import', () => {
      const {member, importTracker} = setup(`
        import * as core from '@angular/core';

        @core.Directive()
        export class Dir {
          test = core.model.required();
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);

      expect(result).toEqual({
        apiName: 'model',
        isRequired: true,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should not identify a valid core function that is not being checked for', () => {
      const {member, importTracker} = setup(`
        import {Directive, input} from '@angular/core';

        @Directive()
        export class Dir {
          test = input(1);
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);
      expect(result).toBe(null);
    });

    it('should not identify a function coming from a different module', () => {
      const {member, importTracker} = setup(`
        import {Directive} from '@angular/core';
        import {model} from '@not-angular/core';

        @Directive()
        export class Dir {
          test = model(1);
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);
      expect(result).toBe(null);
    });

    it('should not identify an invalid call on a core function', () => {
      const {member, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model.unknown();
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);
      expect(result).toBe(null);
    });

    it('should not identify an invalid call on a core function through a namespace import', () => {
      const {member, importTracker} = setup(`
        import {Directive} from '@angular/core';
        import * as core from '@angular/core';

        @Directive()
        export class Dir {
          test = core.model.unknown();
        }
      `);

      const result = tryParseInitializerApiMember(['model'], member, importTracker, false);
      expect(result).toBe(null);
    });
  });
});


function setup(contents: string) {
  const fileName = absoluteFrom('/test.ts');
  const {program} = makeProgram([
    {
      name: absoluteFrom('/node_modules/@angular/core/index.d.ts'),
      contents: `
        export const Directive: any;

        export interface InitializerFunction {
          (initialValue: any): any;
          required(): any;
          unknown(): any;
        }

        export const input: InitializerFunction;
        export const model: InitializerFunction;
      `,
    },
    {
      name: absoluteFrom('/node_modules/@not-angular/core/index.d.ts'),
      contents: `
        export interface InitializerFunction {
          (initialValue: any): any;
          required(): any;
        }
        export const model: InitializerFunction;
      `,
    },
    {name: fileName, contents}
  ]);
  const sourceFile = program.getSourceFile(fileName);
  const importTracker = new ImportedSymbolsTracker();

  if (sourceFile === undefined) {
    throw new Error(`Cannot resolve test file ${fileName}`);
  }

  let member: Pick<ClassMember, 'value'>|null = null;

  (function walk(node: ts.Node) {
    if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'test') {
      member = {value: node.initializer ?? null};
    } else {
      ts.forEachChild(node, walk);
    }
  })(sourceFile);

  if (member === null) {
    throw new Error(`Could not resolve a class property with a name of "test" in the test file`);
  }

  return {member, importTracker};
}
