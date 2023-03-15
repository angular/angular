/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {OwningModule, Reference} from '../../imports';
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

    it('should retain an absolute owning module for relative imports', () => {
      const externalPath = absoluteFrom('/external.d.ts');
      const {program} = makeProgram(
          [
            {
              name: externalPath,
              contents: `
          import * as i0 from '@angular/core';
          import * as i1 from 'absolute';
          import * as i2 from './relative';

          export declare class ExternalModule {
            static ɵmod: i0.ɵɵNgModuleDeclaration<RelativeModule, [typeof i2.RelativeDir], never, [typeof i1.AbsoluteDir, typeof i2.RelativeDir]>;
          }
        `
            },
            {
              name: absoluteFrom('/relative.d.ts'),
              contents: `
          import * as i0 from '@angular/core';

          export declare class RelativeDir {
            static ɵdir: i0.ɵɵDirectiveDeclaration<RelativeDir, '[dir]', never, never, never, never>;
          }
        `
            },
            {
              name: absoluteFrom('/node_modules/absolute.d.ts'),
              contents: `
          import * as i0 from '@angular/core';

          export declare class AbsoluteDir {
            static ɵdir: i0.ɵɵDirectiveDeclaration<ExternalDir, '[dir]', never, never, never, never>;
          }
        `
            }
          ],
          {
            skipLibCheck: true,
            lib: ['es6', 'dom'],
          });

      const externalSf = getSourceFileOrError(program, externalPath);
      const clazz = externalSf.statements[3];
      if (!isNamedClassDeclaration(clazz)) {
        return fail('Expected class declaration');
      }

      const typeChecker = program.getTypeChecker();
      const dtsReader =
          new DtsMetadataReader(typeChecker, new TypeScriptReflectionHost(typeChecker));

      const withoutOwningModule = dtsReader.getNgModuleMetadata(new Reference(clazz))!;
      expect(withoutOwningModule.exports.length).toBe(2);

      // `AbsoluteDir` was imported from an absolute module so the export Reference should have
      // a corresponding best guess owning module.
      expect(withoutOwningModule.exports[0].bestGuessOwningModule).toEqual({
        specifier: 'absolute',
        resolutionContext: externalSf.fileName,
      });

      // `RelativeDir` was imported from a relative module specifier so the original reference's
      // best guess owning module should have been retained, which was null.
      expect(withoutOwningModule.exports[1].bestGuessOwningModule).toBeNull();

      const owningModule: OwningModule = {
        specifier: 'module',
        resolutionContext: absoluteFrom('/context.ts'),
      };
      const withOwningModule = dtsReader.getNgModuleMetadata(new Reference(clazz, owningModule))!;
      expect(withOwningModule.exports.length).toBe(2);

      // Again, `AbsoluteDir` was imported from an absolute module so the export Reference should
      // have a corresponding best guess owning module; the owning module of the incoming reference
      // is irrelevant here.
      expect(withOwningModule.exports[0].bestGuessOwningModule).toEqual({
        specifier: 'absolute',
        resolutionContext: externalSf.fileName,
      });

      // As `RelativeDir` was imported from a relative module specifier, the export Reference should
      // continue to have the owning module of the incoming reference as the relatively imported
      // symbol is assumed to also be exported from the absolute module specifier as captured in the
      // best guess owning module.
      expect(withOwningModule.exports[1].bestGuessOwningModule).toEqual(owningModule);
    });
  });

  it('should identify host directives', () => {
    const mainPath = absoluteFrom('/main.d.ts');
    const {program} = makeProgram(
        [{
          name: mainPath,
          contents: `
            import * as i0 from '@angular/core';

            export declare class SimpleHostDir {
              static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {}, {}, never, never, true, never>
            }

            export declare class AdvancedHostDir {
              static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {"input": "inputAlias"}, {"output": "outputAlias"}, never, never, true, never>
            }

            export declare class Dir {
              static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {}, {}, never, never, true, [
                {directive: typeof SimpleHostDir; inputs: {}; outputs: {};},
                {directive: typeof AdvancedHostDir; inputs: { "inputAlias": "customInputAlias"; }; outputs: { "outputAlias": "customOutputAlias"; };}
              ]>
            }
          `
        }],
        {
          skipLibCheck: true,
          lib: ['es6', 'dom'],
        });

    const sf = getSourceFileOrError(program, mainPath);
    const clazz = sf.statements[3];

    if (!isNamedClassDeclaration(clazz)) {
      return fail('Expected class declaration');
    }

    const typeChecker = program.getTypeChecker();
    const dtsReader = new DtsMetadataReader(typeChecker, new TypeScriptReflectionHost(typeChecker));

    const meta = dtsReader.getDirectiveMetadata(new Reference(clazz))!;
    const hostDirectives = meta.hostDirectives?.map(hostDir => ({
                                                      name: hostDir.directive.debugName,
                                                      directive: hostDir.directive,
                                                      inputs: hostDir.inputs,
                                                      outputs: hostDir.outputs
                                                    }));

    expect(hostDirectives).toEqual([
      {
        name: 'SimpleHostDir',
        directive: jasmine.any(Reference),
        inputs: {},
        outputs: {},
      },
      {
        name: 'AdvancedHostDir',
        directive: jasmine.any(Reference),
        inputs: {inputAlias: 'customInputAlias'},
        outputs: {outputAlias: 'customOutputAlias'}
      }
    ]);
  });

  it('should read the post-v16 inputs map syntax', () => {
    const mainPath = absoluteFrom('/main.d.ts');
    const {program} = makeProgram(
        [{
          name: mainPath,
          contents: `
            import * as i0 from '@angular/core';

            export declare class TestDir {
              static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {
                "input": {"alias": "input", "required": false},
                "otherInput": {"alias": "alias", "required": true}
              }, {}, never>
            }
          `
        }],
        {
          skipLibCheck: true,
          lib: ['es6', 'dom'],
        });

    const sf = getSourceFileOrError(program, mainPath);
    const clazz = sf.statements[1];
    if (!isNamedClassDeclaration(clazz)) {
      return fail('Expected class declaration');
    }

    const typeChecker = program.getTypeChecker();
    const dtsReader = new DtsMetadataReader(typeChecker, new TypeScriptReflectionHost(typeChecker));
    const meta = dtsReader.getDirectiveMetadata(new Reference(clazz))!;

    expect(meta.inputs.toDirectMappedObject()).toEqual({input: 'input', otherInput: 'alias'});
    expect(Array.from(meta.inputs).filter(i => i.required).map(i => i.classPropertyName)).toEqual([
      'otherInput'
    ]);
  });

  it('should read the pre-v16 inputs map syntax', () => {
    const mainPath = absoluteFrom('/main.d.ts');
    const {program} = makeProgram(
        [{
          name: mainPath,
          contents: `
            import * as i0 from '@angular/core';

            export declare class TestDir {
              static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {
                "input": "input",
                "otherInput": "alias"
              }, {}, never>
            }
          `
        }],
        {
          skipLibCheck: true,
          lib: ['es6', 'dom'],
        });

    const sf = getSourceFileOrError(program, mainPath);
    const clazz = sf.statements[1];
    if (!isNamedClassDeclaration(clazz)) {
      return fail('Expected class declaration');
    }

    const typeChecker = program.getTypeChecker();
    const dtsReader = new DtsMetadataReader(typeChecker, new TypeScriptReflectionHost(typeChecker));
    const meta = dtsReader.getDirectiveMetadata(new Reference(clazz))!;

    expect(meta.inputs.toDirectMappedObject()).toEqual({input: 'input', otherInput: 'alias'});
    expect(Array.from(meta.inputs).filter(i => i.required)).toEqual([]);
  });
});
