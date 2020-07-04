/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import * as ts from 'typescript';

import {MetadataCollector} from '../../src/metadata/collector';
import {CompilerHost, CompilerOptions, LibrarySummary} from '../../src/transformers/api';
import {createCompilerHost, TsCompilerAotCompilerTypeCheckHostAdapter} from '../../src/transformers/compiler_host';
import {Directory, Entry, MockAotContext, MockCompilerHost} from '../mocks';

const dummyModule = 'export let foo: any[];';
const aGeneratedFile = new compiler.GeneratedFile(
    '/tmp/src/index.ts', '/tmp/src/index.ngfactory.ts',
    [new compiler.DeclareVarStmt('x', new compiler.LiteralExpr(1))]);
const aGeneratedFileText = `var x:any = 1;\n`;

describe('NgCompilerHost', () => {
  let codeGenerator: {generateFile: jasmine.Spy; findGeneratedFileNames: jasmine.Spy;};

  beforeEach(() => {
    codeGenerator = {
      generateFile: jasmine.createSpy('generateFile').and.returnValue(null),
      findGeneratedFileNames: jasmine.createSpy('findGeneratedFileNames').and.returnValue([]),
    };
  });

  function createNgHost({files = {}}: {files?: Directory} = {}): CompilerHost {
    const context = new MockAotContext('/tmp/', files);
    return new MockCompilerHost(context) as ts.CompilerHost;
  }

  function createHost({
    files = {},
    options = {
      basePath: '/tmp',
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    rootNames = ['/tmp/index.ts'],
    ngHost = createNgHost({files}),
    librarySummaries = [],
  }: {
    files?: Directory,
    options?: CompilerOptions,
    rootNames?: string[],
    ngHost?: CompilerHost,
    librarySummaries?: LibrarySummary[]
  } = {}) {
    return new TsCompilerAotCompilerTypeCheckHostAdapter(
        rootNames, options, ngHost, new MetadataCollector(), codeGenerator,
        new Map(
            librarySummaries.map(entry => [entry.fileName, entry] as [string, LibrarySummary])));
  }

  describe('fileNameToModuleName', () => {
    let host: TsCompilerAotCompilerTypeCheckHostAdapter;
    beforeEach(() => {
      host = createHost();
    });

    it('should use a package import when accessing a package from a source file', () => {
      expect(host.fileNameToModuleName('/tmp/node_modules/@angular/core.d.ts', '/tmp/main.ts'))
          .toBe('@angular/core');
    });

    it('should allow an import o a package whose name contains dot (e.g. @angular.io)', () => {
      expect(host.fileNameToModuleName('/tmp/node_modules/@angular.io/core.d.ts', '/tmp/main.ts'))
          .toBe('@angular.io/core');
    });

    it('should use a package import when accessing a package from another package', () => {
      expect(host.fileNameToModuleName(
                 '/tmp/node_modules/mod1/index.d.ts', '/tmp/node_modules/mod2/index.d.ts'))
          .toBe('mod1/index');
      expect(host.fileNameToModuleName(
                 '/tmp/node_modules/@angular/core/index.d.ts',
                 '/tmp/node_modules/@angular/common/index.d.ts'))
          .toBe('@angular/core/index');
    });

    it('should use a relative import when accessing a file in the same package', () => {
      expect(host.fileNameToModuleName(
                 '/tmp/node_modules/mod/a/child.d.ts', '/tmp/node_modules/mod/index.d.ts'))
          .toBe('./a/child');
      expect(host.fileNameToModuleName(
                 '/tmp/node_modules/@angular/core/src/core.d.ts',
                 '/tmp/node_modules/@angular/core/index.d.ts'))
          .toBe('./src/core');
    });

    it('should use a relative import when accessing a source file from a source file', () => {
      expect(host.fileNameToModuleName('/tmp/src/a/child.ts', '/tmp/src/index.ts'))
          .toBe('./a/child');
    });

    it('should use a relative import when accessing generated files, even if crossing packages',
       () => {
         expect(host.fileNameToModuleName(
                    '/tmp/node_modules/mod2/b.ngfactory.d.ts',
                    '/tmp/node_modules/mod1/a.ngfactory.d.ts'))
             .toBe('../mod2/b.ngfactory');
       });

    it('should support multiple rootDirs when accessing a source file form a source file', () => {
      const hostWithMultipleRoots = createHost({
        options: {
          basePath: '/tmp/',
          rootDirs: [
            'src/a',
            'src/b',
          ]
        }
      });
      // both files are in the rootDirs
      expect(hostWithMultipleRoots.fileNameToModuleName('/tmp/src/b/b.ts', '/tmp/src/a/a.ts'))
          .toBe('./b');

      // one file is not in the rootDirs
      expect(hostWithMultipleRoots.fileNameToModuleName('/tmp/src/c/c.ts', '/tmp/src/a/a.ts'))
          .toBe('../c/c');
    });

    it('should error if accessing a source file from a package', () => {
      expect(
          () => host.fileNameToModuleName(
              '/tmp/src/a/child.ts', '/tmp/node_modules/@angular/core.d.ts'))
          .toThrowError(
              'Trying to import a source file from a node_modules package: ' +
              'import /tmp/src/a/child.ts from /tmp/node_modules/@angular/core.d.ts');
    });

    it('should use the provided implementation if any', () => {
      const ngHost = createNgHost();
      ngHost.fileNameToModuleName = () => 'someResult';
      const host = createHost({ngHost});
      expect(host.fileNameToModuleName('a', 'b')).toBe('someResult');
    });
  });

  describe('moduleNameToFileName', () => {
    it('should resolve an import using the containing file', () => {
      const host = createHost({files: {'tmp': {'src': {'a': {'child.d.ts': dummyModule}}}}});
      expect(host.moduleNameToFileName('./a/child', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.d.ts');
    });

    it('should allow to skip the containing file for package imports', () => {
      const host =
          createHost({files: {'tmp': {'node_modules': {'@core': {'index.d.ts': dummyModule}}}}});
      expect(host.moduleNameToFileName('@core/index')).toBe('/tmp/node_modules/@core/index.d.ts');
    });

    it('should use the provided implementation if any', () => {
      const ngHost = createNgHost();
      ngHost.moduleNameToFileName = () => 'someResult';
      const host = createHost({ngHost});
      expect(host.moduleNameToFileName('a', 'b')).toBe('someResult');
    });

    it('should work well with windows paths', () => {
      const host = createHost({
        rootNames: ['\\tmp\\index.ts'],
        options: {basePath: '\\tmp'},
        files: {'tmp': {'node_modules': {'@core': {'index.d.ts': dummyModule}}}}
      });
      expect(host.moduleNameToFileName('@core/index')).toBe('/tmp/node_modules/@core/index.d.ts');
    });
  });

  describe('resourceNameToFileName', () => {
    it('should resolve a relative import', () => {
      const host = createHost({files: {'tmp': {'src': {'a': {'child.html': '<div>'}}}}});
      expect(host.resourceNameToFileName('./a/child.html', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.html');

      expect(host.resourceNameToFileName('./a/non-existing.html', '/tmp/src/index.ts')).toBe(null);
    });

    it('should resolve package paths as relative paths', () => {
      const host = createHost({files: {'tmp': {'src': {'a': {'child.html': '<div>'}}}}});
      expect(host.resourceNameToFileName('a/child.html', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/child.html');
    });

    it('should resolve absolute paths as package paths', () => {
      const host = createHost({files: {'tmp': {'node_modules': {'a': {'child.html': '<div>'}}}}});
      expect(host.resourceNameToFileName('/a/child.html', ''))
          .toBe('/tmp/node_modules/a/child.html');
    });

    it('should use the provided implementation if any', () => {
      const ngHost = createNgHost();
      ngHost.resourceNameToFileName = () => 'someResult';
      const host = createHost({ngHost});
      expect(host.resourceNameToFileName('a', 'b')).toBe('someResult');
    });
    it('should resolve Sass imports to generated .css files', () => {
      const host = createHost({files: {'tmp': {'src': {'a': {'style.css': 'h1: bold'}}}}});
      expect(host.resourceNameToFileName('./a/style.scss', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/style.css');
    });
    it('should resolve Less imports to generated .css files', () => {
      const host = createHost({files: {'tmp': {'src': {'a': {'style.css': 'h1: bold'}}}}});
      expect(host.resourceNameToFileName('./a/style.less', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/style.css');
    });
    it('should resolve Stylus imports to generated .css files', () => {
      const host = createHost({files: {'tmp': {'src': {'a': {'style.css': 'h1: bold'}}}}});
      expect(host.resourceNameToFileName('./a/style.styl', '/tmp/src/index.ts'))
          .toBe('/tmp/src/a/style.css');
    });
  });

  describe('addGeneratedFile', () => {
    function generate(path: string, files: {}) {
      codeGenerator.findGeneratedFileNames.and.returnValue([`${path}.ngfactory.ts`]);
      codeGenerator.generateFile.and.returnValue(
          new compiler.GeneratedFile(`${path}.ts`, `${path}.ngfactory.ts`, []));
      const host = createHost({
        files,
        options: {
          basePath: '/tmp',
          moduleResolution: ts.ModuleResolutionKind.NodeJs,
          // Request UMD, which should get default module names
          module: ts.ModuleKind.UMD
        },
      });
      return host.getSourceFile(`${path}.ngfactory.ts`, ts.ScriptTarget.Latest);
    }

    it('should include a moduleName when the file is in node_modules', () => {
      const genSf = generate(
          '/tmp/node_modules/@angular/core/core',
          {'tmp': {'node_modules': {'@angular': {'core': {'core.ts': `// some content`}}}}});
      expect(genSf.moduleName).toBe('@angular/core/core.ngfactory');
    });

    it('should not get tripped on nested node_modules', () => {
      const genSf = generate('/tmp/node_modules/lib1/node_modules/lib2/thing', {
        'tmp':
            {'node_modules': {'lib1': {'node_modules': {'lib2': {'thing.ts': `// some content`}}}}}
      });
      expect(genSf.moduleName).toBe('lib2/thing.ngfactory');
    });
  });

  describe('getSourceFile', () => {
    it('should cache source files by name', () => {
      const host = createHost({files: {'tmp': {'src': {'index.ts': ``}}}});

      const sf1 = host.getSourceFile('/tmp/src/index.ts', ts.ScriptTarget.Latest);
      const sf2 = host.getSourceFile('/tmp/src/index.ts', ts.ScriptTarget.Latest);
      expect(sf1).toBe(sf2);
    });

    it('should generate code when asking for the base name and add it as referencedFiles', () => {
      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);
      codeGenerator.generateFile.and.returnValue(aGeneratedFile);
      const host = createHost({
        files: {
          'tmp': {
            'src': {
              'index.ts': `
              /// <reference path="main.ts"/>
            `
            }
          }
        }
      });

      const sf = host.getSourceFile('/tmp/src/index.ts', ts.ScriptTarget.Latest);
      expect(sf.referencedFiles[0].fileName).toBe('main.ts');
      expect(sf.referencedFiles[1].fileName).toBe('/tmp/src/index.ngfactory.ts');

      const genSf = host.getSourceFile('/tmp/src/index.ngfactory.ts', ts.ScriptTarget.Latest);
      expect(genSf.text).toBe(aGeneratedFileText);

      // the codegen should have been cached
      expect(codeGenerator.generateFile).toHaveBeenCalledTimes(1);
      expect(codeGenerator.findGeneratedFileNames).toHaveBeenCalledTimes(1);
    });

    it('should generate code when asking for the generated name first', () => {
      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);
      codeGenerator.generateFile.and.returnValue(aGeneratedFile);
      const host = createHost({
        files: {
          'tmp': {
            'src': {
              'index.ts': `
              /// <reference path="main.ts"/>
            `
            }
          }
        }
      });

      const genSf = host.getSourceFile('/tmp/src/index.ngfactory.ts', ts.ScriptTarget.Latest);
      expect(genSf.text).toBe(aGeneratedFileText);

      const sf = host.getSourceFile('/tmp/src/index.ts', ts.ScriptTarget.Latest);
      expect(sf.referencedFiles[0].fileName).toBe('main.ts');
      expect(sf.referencedFiles[1].fileName).toBe('/tmp/src/index.ngfactory.ts');

      // the codegen should have been cached
      expect(codeGenerator.generateFile).toHaveBeenCalledTimes(1);
      expect(codeGenerator.findGeneratedFileNames).toHaveBeenCalledTimes(1);
    });

    it('should clear old generated references if the original host cached them', () => {
      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);

      const sfText = `
          /// <reference path="main.ts"/>
      `;
      const ngHost = createNgHost({files: {'tmp': {'src': {'index.ts': sfText}}}});
      const sf = ts.createSourceFile('/tmp/src/index.ts', sfText, ts.ScriptTarget.Latest);
      ngHost.getSourceFile = () => sf;

      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);
      codeGenerator.generateFile.and.returnValue(
          new compiler.GeneratedFile('/tmp/src/index.ts', '/tmp/src/index.ngfactory.ts', []));
      const host1 = createHost({ngHost});

      host1.getSourceFile('/tmp/src/index.ts', ts.ScriptTarget.Latest);
      expect(sf.referencedFiles.length).toBe(2);
      expect(sf.referencedFiles[0].fileName).toBe('main.ts');
      expect(sf.referencedFiles[1].fileName).toBe('/tmp/src/index.ngfactory.ts');

      codeGenerator.findGeneratedFileNames.and.returnValue([]);
      codeGenerator.generateFile.and.returnValue(null);
      const host2 = createHost({ngHost});

      host2.getSourceFile('/tmp/src/index.ts', ts.ScriptTarget.Latest);
      expect(sf.referencedFiles.length).toBe(1);
      expect(sf.referencedFiles[0].fileName).toBe('main.ts');
    });

    it('should generate for tsx files', () => {
      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);
      codeGenerator.generateFile.and.returnValue(aGeneratedFile);
      const host = createHost({files: {'tmp': {'src': {'index.tsx': ``}}}});

      const genSf = host.getSourceFile('/tmp/src/index.ngfactory.ts', ts.ScriptTarget.Latest);
      expect(genSf.text).toBe(aGeneratedFileText);

      const sf = host.getSourceFile('/tmp/src/index.tsx', ts.ScriptTarget.Latest);
      expect(sf.referencedFiles[0].fileName).toBe('/tmp/src/index.ngfactory.ts');

      // the codegen should have been cached
      expect(codeGenerator.generateFile).toHaveBeenCalledTimes(1);
      expect(codeGenerator.findGeneratedFileNames).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateSourceFile', () => {
    it('should update source files', () => {
      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);
      codeGenerator.generateFile.and.returnValue(aGeneratedFile);
      const host = createHost({files: {'tmp': {'src': {'index.ts': ''}}}});

      let genSf = host.getSourceFile('/tmp/src/index.ngfactory.ts', ts.ScriptTarget.Latest);
      expect(genSf.text).toBe(aGeneratedFileText);

      host.updateGeneratedFile(new compiler.GeneratedFile(
          '/tmp/src/index.ts', '/tmp/src/index.ngfactory.ts',
          [new compiler.DeclareVarStmt('x', new compiler.LiteralExpr(2))]));
      genSf = host.getSourceFile('/tmp/src/index.ngfactory.ts', ts.ScriptTarget.Latest);
      expect(genSf.text).toBe(`var x:any = 2;\n`);
    });

    it('should error if the imports changed', () => {
      codeGenerator.findGeneratedFileNames.and.returnValue(['/tmp/src/index.ngfactory.ts']);
      codeGenerator.generateFile.and.returnValue(new compiler.GeneratedFile(
          '/tmp/src/index.ts', '/tmp/src/index.ngfactory.ts',
          [new compiler.DeclareVarStmt(
              'x',
              new compiler.ExternalExpr(new compiler.ExternalReference('aModule', 'aName')))]));
      const host = createHost({files: {'tmp': {'src': {'index.ts': ''}}}});

      host.getSourceFile('/tmp/src/index.ngfactory.ts', ts.ScriptTarget.Latest);

      expect(
          () => host.updateGeneratedFile(new compiler.GeneratedFile(
              '/tmp/src/index.ts', '/tmp/src/index.ngfactory.ts',
              [new compiler.DeclareVarStmt(
                  'x',
                  new compiler.ExternalExpr(
                      new compiler.ExternalReference('otherModule', 'aName')))])))
          .toThrowError([
            `Illegal State: external references changed in /tmp/src/index.ngfactory.ts.`,
            `Old: aModule.`, `New: otherModule`
          ].join('\n'));
    });
  });
});
