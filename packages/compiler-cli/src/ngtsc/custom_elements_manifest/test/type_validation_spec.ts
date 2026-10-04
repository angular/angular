/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {NgCompilerAdapter} from '../../core/api';
import {absoluteFrom as _, getFileSystem, NgtscCompilerHost} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {getTypeEnvironmentFiles, ManifestLoadContext} from '../src/load_context';
import {parseCustomElementsManifest} from '../src/manifest_parser';
import {resolveManifestSchemas} from '../src/type_resolver';
import {customElementsManifest} from '../testing';

const OPTIONS: ts.CompilerOptions = {
  noLib: true,
  strict: true,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
};

runInEachFileSystem(() => {
  describe('manifest type validation inputs and outputs', () => {
    beforeEach(() => {
      const fs = getFileSystem();
      fs.ensureDir(_('/project/node_modules/types-library'));
      fs.writeFile(_('/project/package.json'), '{"type":"module"}');
      fs.writeFile(_('/project/main.ts'), 'export {};');
      fs.writeFile(_('/project/globals.d.ts'), 'interface GlobalValue {value: string;}');
      fs.writeFile(
        _('/project/node_modules/types-library/package.json'),
        JSON.stringify({
          type: 'module',
          exports: {'.': {import: {types: './import.d.mts'}, require: {types: './require.d.cts'}}},
        }),
      );
      fs.writeFile(
        _('/project/node_modules/types-library/import.d.mts'),
        `export type Choice = 'import'; export type Box<T extends string> = {value: T};`,
      );
      fs.writeFile(
        _('/project/node_modules/types-library/require.d.cts'),
        `export type Choice = 'require';`,
      );
    });

    function makeContext(): ManifestLoadContext {
      const host = new NgtscCompilerHost(getFileSystem(), OPTIONS);
      const adapter: NgCompilerAdapter = {
        fileExists: host.fileExists.bind(host),
        readFile: host.readFile.bind(host),
        directoryExists: (path) => getFileSystem().exists(_(path)),
        getCurrentDirectory: () => '/project',
        getCanonicalFileName: host.getCanonicalFileName.bind(host),
        getSourceFile: host.getSourceFile.bind(host),
        entryPoint: null,
        constructionDiagnostics: [],
        ignoreForEmit: new Set(),
        unifiedModulesHost: null,
        rootDirs: [_('/project')],
        isShim: () => false,
        isResource: () => false,
      };
      const program = ts.createProgram({
        rootNames: [_('/project/main.ts'), _('/project/globals.d.ts')],
        options: OPTIONS,
        host,
      });
      return {
        environment: {
          adapter,
          program,
          basePath: _('/project'),
          options: OPTIONS,
          moduleResolutionCache: null,
          typeModuleResolutionCache: ts.createModuleResolutionCache(
            '/project',
            (name) => name,
            OPTIONS,
          ),
          typeEnvironmentFiles: getTypeEnvironmentFiles(program, adapter),
          programTypeEnvironment: {hasDefaultLibrary: false, isSolutionStyleRoot: false},
        },
        dependencies: {
          manifestPaths: new Set(),
          cacheDependencyPaths: new Set(),
          globalTypeAvailability: new Map(),
        },
      };
    }

    function parseType(text: string, name: string, packageName: string) {
      const type = {text, references: [{name, package: packageName, start: 0, end: name.length}]};
      return parseCustomElementsManifest(
        JSON.stringify(
          customElementsManifest({
            tagName: 'my-element',
            members: [{kind: 'field', name: 'value', type}],
            attributes: [{name: 'value', type}],
          }),
        ),
        'manifest',
      );
    }

    const manifest = () => ({
      path: _('/project/custom-elements.json'),
      label: 'manifest',
      packageName: null,
    });

    it('should reuse consumer sources across manifests on a non-caching host', () => {
      const context = makeContext();
      const {adapter, program} = context.environment;
      const reads = spyOn(adapter, 'getSourceFile').and.callThrough();
      for (let index = 0; index < 2; index++) {
        const [result] = resolveManifestSchemas(
          [{parsed: parseType('GlobalValue', 'GlobalValue', 'global:'), manifest: manifest()}],
          context,
        );
        expect(result.warnings).toEqual([]);
        expect(result.schemas[0].properties[0].checkType).toBe('GlobalValue');
      }
      const reparsedConsumerFiles = reads.calls
        .allArgs()
        .filter(([name]) => program.getSourceFile(name) !== undefined);
      expect(reparsedConsumerFiles).toEqual([]);
    });

    it('should validate the types of all manifests in one program', () => {
      const context = makeContext();
      const reads = spyOn(context.environment.adapter, 'getSourceFile').and.callThrough();
      const results = resolveManifestSchemas(
        [
          {parsed: parseType('Choice', 'Choice', 'types-library'), manifest: manifest()},
          {
            parsed: parseType('Choice', 'Choice', 'types-library'),
            manifest: {...manifest(), path: _('/project/second.json'), label: 'second'},
          },
        ],
        context,
      );
      // Each type-checking program loads the library declarations once.
      const libraryReads = reads.calls
        .allArgs()
        .filter(([name]) => name.endsWith('/types-library/import.d.mts'));
      expect(libraryReads.length).toBe(1);
      expect(results.length).toBe(2);
      for (const result of results) {
        expect(result.warnings).toEqual([]);
        expect(result.schemas[0].attributes[0].stringLiteralValues).toEqual(['import']);
      }
    });

    it('should return semantic warnings with author text without changing parsed warnings', () => {
      const parsed = parseType('Box<number>', 'Box', 'types-library');
      Object.freeze(parsed.warnings);
      const [result] = resolveManifestSchemas([{parsed, manifest: manifest()}], makeContext());
      expect(parsed.warnings).toEqual([]);
      expect(result.warnings.length).toBe(2);
      expect(result.warnings[0].message).toContain('the type "Box<number>" of the property');
      expect(result.schemas[0].properties[0].checkType).toBeUndefined();
      expect(result.schemas[0].properties[0].typeText).toBe('Box<number>');
    });

    for (const [moduleType, choice] of [
      ['module', 'import'],
      ['commonjs', 'require'],
    ]) {
      it(`should validate with ${choice} conditions in a ${moduleType} package`, () => {
        getFileSystem().writeFile(_('/project/package.json'), JSON.stringify({type: moduleType}));
        const [result] = resolveManifestSchemas(
          [{parsed: parseType('Choice', 'Choice', 'types-library'), manifest: manifest()}],
          makeContext(),
        );
        expect(result.warnings).toEqual([]);
        expect(result.schemas[0].attributes[0].stringLiteralValues).toEqual([choice]);
      });
    }
  });
});
