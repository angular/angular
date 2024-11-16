/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {absoluteFrom} from '../../../file_system';
import {runInEachFileSystem} from '../../../file_system/testing';
import {ImportedSymbolsTracker} from '../../../imports';
import {ClassMember, ClassMemberAccessLevel, TypeScriptReflectionHost} from '../../../reflection';
import {reflectClassMember} from '../../../reflection/src/typescript';
import {makeProgram} from '../../../testing';
import {validateAccessOfInitializerApiMember} from '../src/initializer_function_access';
import {InitializerApiFunction, tryParseInitializerApi} from '../src/initializer_functions';

runInEachFileSystem(() => {
  const modelApi: InitializerApiFunction = {
    functionName: 'model',
    owningModule: '@angular/core',
    allowedAccessLevels: [ClassMemberAccessLevel.PublicWritable],
  };

  describe('initializer function detection', () => {
    it('should identify a non-required function that is imported directly', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).toEqual({
        api: modelApi,
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should check for multiple initializer APIs', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model(1);
        }
      `);

      const result = tryParseInitializerApi(
        [
          {
            functionName: 'input',
            owningModule: '@angular/core',
            allowedAccessLevels: [ClassMemberAccessLevel.PublicWritable],
          },
          modelApi,
        ],
        member.value!,
        reflector,
        importTracker,
      );

      expect(result).toEqual({
        api: modelApi,
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should support initializer APIs from different modules', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive} from '@angular/core';
        import {outputFromObservable} from '@angular/core/rxjs-interop';

        @Directive()
        export class Dir {
          test = outputFromObservable(1);
        }
      `);

      const result = tryParseInitializerApi(
        [
          modelApi,
          {
            functionName: 'outputFromObservable',
            owningModule: '@angular/core/rxjs-interop',
            allowedAccessLevels: [ClassMemberAccessLevel.PublicWritable],
          },
        ],
        member.value!,
        reflector,
        importTracker,
      );

      expect(result).toEqual({
        api: {
          functionName: 'outputFromObservable',
          owningModule: '@angular/core/rxjs-interop',
          allowedAccessLevels: [ClassMemberAccessLevel.PublicWritable],
        },
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a required function that is imported directly', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model.required();
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).toEqual({
        api: modelApi,
        isRequired: true,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a non-required function that is aliased', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model as alias} from '@angular/core';

        @Directive()
        export class Dir {
          test = alias(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).toEqual({
        api: modelApi,
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a required function that is aliased', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model as alias} from '@angular/core';

        @Directive()
        export class Dir {
          test = alias.required();
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).toEqual({
        api: modelApi,
        isRequired: true,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a non-required function that is imported via namespace import', () => {
      const {member, reflector, importTracker} = setup(`
        import * as core from '@angular/core';

        @core.Directive()
        export class Dir {
          test = core.model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).toEqual({
        api: modelApi,
        isRequired: false,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should identify a required function that is imported via namespace import', () => {
      const {member, reflector, importTracker} = setup(`
        import * as core from '@angular/core';

        @core.Directive()
        export class Dir {
          test = core.model.required();
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).toEqual({
        api: modelApi,
        isRequired: true,
        call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
      });
    });

    it('should not identify a valid core function that is not being checked for', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, input} from '@angular/core';

        @Directive()
        export class Dir {
          test = input(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);
      expect(result).toBe(null);
    });

    it('should not identify a function coming from a different module', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive} from '@angular/core';
        import {model} from '@not-angular/core';

        @Directive()
        export class Dir {
          test = model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);
      expect(result).toBe(null);
    });

    it('should not identify an invalid call on a core function', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        export class Dir {
          test = model.unknown();
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);
      expect(result).toBe(null);
    });

    it('should not identify an invalid call on a core function through a namespace import', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive} from '@angular/core';
        import * as core from '@angular/core';

        @Directive()
        export class Dir {
          test = core.model.unknown();
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);
      expect(result).toBe(null);
    });

    it('should identify shadowed declarations', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        function wrapper() {
          function model(value: number): any {}

          @Directive()
          class Dir {
            test = model(1);
          }
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);
      expect(result).toBe(null);
    });
  });

  it('should identify an initializer function in a file containing an import whose name overlaps with an object prototype member', () => {
    const {member, reflector, importTracker} = setup(`
          import {Directive, model} from '@angular/core';
          import {toString} from '@unknown/utils';

          @Directive()
          export class Dir {
            test = model(1);
          }
        `);

    const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

    expect(result).toEqual({
      api: modelApi,
      isRequired: false,
      call: jasmine.objectContaining({kind: ts.SyntaxKind.CallExpression}),
    });
  });

  describe('`validateAccessOfInitializerApiMember`', () => {
    it('should report errors if a private field is used, but not allowed', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        class Dir {
          private test = model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).not.toBeNull();
      expect(() => validateAccessOfInitializerApiMember(result!, member)).toThrowMatching(
        (err) =>
          err instanceof FatalDiagnosticError &&
          err.code === ErrorCode.INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY,
      );
    });

    it('should report errors if a protected field is used, but not allowed', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        class Dir {
          protected test = model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).not.toBeNull();
      expect(() => validateAccessOfInitializerApiMember(result!, member)).toThrowMatching(
        (err) =>
          err instanceof FatalDiagnosticError &&
          err.code === ErrorCode.INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY,
      );
    });

    it('should report errors if an ECMAScript private field is used, but not allowed', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        class Dir {
          #test = model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).not.toBeNull();
      expect(() => validateAccessOfInitializerApiMember(result!, member)).toThrowMatching(
        (err) =>
          err instanceof FatalDiagnosticError &&
          err.code === ErrorCode.INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY,
      );
    });

    it('should report errors if a readonly public field is used, but not allowed', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        class Dir {
          // test model initializer API definition doesn't even allow readonly!
          readonly test = model(1);
        }
      `);

      const result = tryParseInitializerApi([modelApi], member.value!, reflector, importTracker);

      expect(result).not.toBeNull();
      expect(() => validateAccessOfInitializerApiMember(result!, member)).toThrowMatching(
        (err) =>
          err instanceof FatalDiagnosticError &&
          err.code === ErrorCode.INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY,
      );
    });

    it('should allow private field if API explicitly allows it', () => {
      const {member, reflector, importTracker} = setup(`
        import {Directive, model} from '@angular/core';

        @Directive()
        class Dir {
          // test model initializer API definition doesn't even allow readonly!
          private test = model(1);
        }
      `);

      const result = tryParseInitializerApi(
        [{...modelApi, allowedAccessLevels: [ClassMemberAccessLevel.Private]}],
        member.value!,
        reflector,
        importTracker,
      );

      expect(result?.api).toEqual(
        jasmine.objectContaining<InitializerApiFunction>({
          functionName: 'model',
        }),
      );
      expect(() => validateAccessOfInitializerApiMember(result!, member)).not.toThrow();
    });
  });
});

function setup(contents: string) {
  const fileName = absoluteFrom('/test.ts');
  const {program} = makeProgram(
    [
      {
        name: absoluteFrom('/node_modules/@angular/core/index.d.ts'),
        contents: `
        export const Directive: any;
        export const input: any;
        export const model: any;
      `,
      },
      {
        name: absoluteFrom('/node_modules/@angular/core/rxjs-interop/index.d.ts'),
        contents: `
        export const outputFromObservable: any;
      `,
      },
      {
        name: absoluteFrom('/node_modules/@unknown/utils/index.d.ts'),
        contents: `
        export declare function toString(value: any): string;
      `,
      },
      {
        name: absoluteFrom('/node_modules/@not-angular/core/index.d.ts'),
        contents: `
        export const model: any;
      `,
      },
      {name: fileName, contents},
    ],
    {target: ts.ScriptTarget.ESNext},
  );
  const sourceFile = program.getSourceFile(fileName);
  const importTracker = new ImportedSymbolsTracker();
  const reflector = new TypeScriptReflectionHost(program.getTypeChecker());

  if (sourceFile === undefined) {
    throw new Error(`Cannot resolve test file ${fileName}`);
  }

  let member: Pick<ClassMember, 'value' | 'accessLevel'> | null = null;

  (function walk(node: ts.Node) {
    if (
      ts.isPropertyDeclaration(node) &&
      ((ts.isIdentifier(node.name) && node.name.text === 'test') ||
        (ts.isPrivateIdentifier(node.name) && node.name.text === '#test'))
    ) {
      member = reflectClassMember(node);
    } else {
      ts.forEachChild(node, walk);
    }
  })(sourceFile);

  if (member === null) {
    throw new Error(`Could not resolve a class property with a name of "test" in the test file`);
  }

  return {member, reflector, importTracker};
}
