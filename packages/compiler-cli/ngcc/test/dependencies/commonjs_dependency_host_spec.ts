/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom, getFileSystem, relativeFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {CommonJsDependencyHost} from '../../src/dependencies/commonjs_dependency_host';
import {createDependencyInfo} from '../../src/dependencies/dependency_host';
import {ModuleResolver} from '../../src/dependencies/module_resolver';

runInEachFileSystem(() => {
  describe('CommonJsDependencyHost', () => {
    let _: typeof absoluteFrom;
    let host: CommonJsDependencyHost;

    beforeEach(() => {
      _ = absoluteFrom;
      loadTestFiles([
        {
          name: _('/no/imports/or/re-exports/index.js'),
          contents: '// some text but no import-like statements'
        },
        {name: _('/no/imports/or/re-exports/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/no/imports/or/re-exports/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/external/imports/index.js'), contents: commonJs(['lib_1', 'lib_1/sub_1'])},
        {name: _('/external/imports/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/external/imports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/re-exports/index.js'),
          contents: commonJs(['lib_1', 'lib_1/sub_1'], ['lib_1.X', 'lib_1sub_1.Y'])
        },
        {name: _('/external/re-exports/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/external/re-exports/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/external/imports-missing/index.js'), contents: commonJs(['lib_1', 'missing'])},
        {name: _('/external/imports-missing/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/external/imports-missing/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/external/deep-import/index.js'), contents: commonJs(['lib_1/deep/import'])},
        {name: _('/external/deep-import/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/external/deep-import/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/internal/outer/index.js'), contents: commonJs(['../inner'])},
        {name: _('/internal/outer/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/internal/outer/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/internal/inner/index.js'), contents: commonJs(['lib_1/sub_1'], ['X'])},
        {
          name: _('/internal/circular_a/index.js'),
          contents: commonJs(['../circular_b', 'lib_1/sub_1'], ['Y'])
        },
        {
          name: _('/internal/circular_b/index.js'),
          contents: commonJs(['../circular_a', 'lib_1'], ['X'])
        },
        {name: _('/internal/circular_a/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/internal/circular_a/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/re-directed/index.js'), contents: commonJs(['lib_1/sub_2'])},
        {name: _('/re-directed/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/re-directed/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/path-alias/index.js'),
          contents: commonJs(['@app/components', '@app/shared', '@lib/shared/test', 'lib_1'])
        },
        {name: _('/path-alias/package.json'), contents: '{"main": "./index.js"}'},
        {name: _('/path-alias/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/node_modules/lib_1/index.d.ts'), contents: 'export declare class X {}'},
        {
          name: _('/node_modules/lib_1/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/lib_1/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/node_modules/lib_1/deep/import/index.js'),
          contents: 'export class DeepImport {}'
        },
        {name: _('/node_modules/lib_1/sub_1/index.d.ts'), contents: 'export declare class Y {}'},
        {
          name: _('/node_modules/lib_1/sub_1/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/lib_1/sub_1/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/node_modules/lib_1/sub_2.d.ts'), contents: `export * from './sub_2/sub_2';`},
        {name: _('/node_modules/lib_1/sub_2/sub_2.d.ts'), contents: `export declare class Z {}';`},
        {
          name: _('/node_modules/lib_1/sub_2/package.json'),
          contents: '{"esm2015": "./sub_2.js", "typings": "./sub_2.d.ts"}'
        },
        {name: _('/node_modules/lib_1/sub_2/sub_2.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/dist/components/index.d.ts'), contents: `export declare class MyComponent {};`},
        {
          name: _('/dist/components/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/components/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/dist/shared/index.d.ts'),
          contents: `import {X} from 'lib_1';\nexport declare class Service {}`
        },
        {
          name: _('/dist/shared/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/shared/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/dist/lib/shared/test/index.d.ts'), contents: `export class TestHelper {}`},
        {
          name: _('/dist/lib/shared/test/package.json'),
          contents: '{"esm2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/lib/shared/test/index.metadata.json'), contents: 'MOCK METADATA'},
      ]);
      const fs = getFileSystem();
      host = new CommonJsDependencyHost(fs, new ModuleResolver(fs));
    });

    describe('collectDependencies()', () => {
      it('should not generate a TS AST if the source does not contain any require calls', () => {
        spyOn(ts, 'createSourceFile');
        host.collectDependencies(_('/no/imports/or/re-exports/index.js'), createDependencyInfo());
        expect(ts.createSourceFile).not.toHaveBeenCalled();
      });

      it('should resolve all the external imports of the source file', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      });

      it('should resolve all the external re-exports of the source file', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/re-exports/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      });

      it('should recognize imports in a variable declaration list', () => {
        loadTestFiles([
          {
            name: _('/test/index.js'),
            contents: commonJs({
              varDeclarations: [
                ['lib_1/sub_1', 'lib_1/sub_2'],
              ],
            }),
          },
          {name: _('/test/package.json'), contents: '{"main": "./index.js"}'},
          {name: _('/test/index.metadata.json'), contents: 'MOCK METADATA'},
        ]);

        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/test/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_2'))).toBe(true);
      });

      it('should recognize imports as property assignments (on existing object)', () => {
        loadTestFiles([
          {
            name: _('/test/index.js'),
            contents: commonJs({
              propAssignment: ['lib_1/sub_1', 'lib_1/sub_2'],
            }),
          },
          {name: _('/test/package.json'), contents: '{"main": "./index.js"}'},
          {name: _('/test/index.metadata.json'), contents: 'MOCK METADATA'},
        ]);

        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/test/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_2'))).toBe(true);
      });

      it('should recognize imports as property assignments (in object literal)', () => {
        loadTestFiles([
          {
            name: _('/test/index.js'),
            contents: commonJs({
              inObjectLiteral: ['lib_1/sub_1', 'lib_1/sub_2'],
            }),
          },
          {name: _('/test/package.json'), contents: '{"main": "./index.js"}'},
          {name: _('/test/index.metadata.json'), contents: 'MOCK METADATA'},
        ]);

        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/test/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_2'))).toBe(true);
      });

      it('should recognize imports used for their side-effects only', () => {
        loadTestFiles([
          {
            name: _('/test/index.js'),
            contents: commonJs({
              forSideEffects: ['lib_1/sub_1', 'lib_1/sub_2'],
            }),
          },
          {name: _('/test/package.json'), contents: '{"main": "./index.js"}'},
          {name: _('/test/index.metadata.json'), contents: 'MOCK METADATA'},
        ]);

        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/test/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_2'))).toBe(true);
      });

      it('should recognize star re-exports (with both emitted and imported helpers)', () => {
        loadTestFiles([
          {
            name: _('/test/index.js'),
            contents: commonJs({
              reExportsWithEmittedHelper: ['lib_1', 'lib_1/sub_1'],
              reExportsWithImportedHelper: ['lib_1', 'lib_1/sub_2'],
            }),
          },
          {name: _('/test/package.json'), contents: '{"main": "./index.js"}'},
          {name: _('/test/index.metadata.json'), contents: 'MOCK METADATA'},
        ]);

        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/test/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(3);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_2'))).toBe(true);
      });

      it('should not get confused by re-exports with a separate `require()` call', () => {
        loadTestFiles([
          {
            name: _('/test/index.js'),
            contents: commonJs({
              reExportsWithoutRequire: ['lib_1', 'lib_1/sub_2'],
            }),
          },
          {name: _('/test/package.json'), contents: '{"main": "./index.js"}'},
          {name: _('/test/index.metadata.json'), contents: 'MOCK METADATA'},
        ]);

        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/test/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_2'))).toBe(true);
      });

      it('should capture missing external imports', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports-missing/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(1);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(missing.size).toBe(1);
        expect(missing.has(relativeFrom('missing'))).toBe(true);
        expect(deepImports.size).toBe(0);
      });

      it('should not register deep imports as missing', () => {
        // This scenario verifies the behavior of the dependency analysis when an external import
        // is found that does not map to an entry-point but still exists on disk, i.e. a deep
        // import. Such deep imports are captured for diagnostics purposes.
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/deep-import/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(0);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(1);
        expect(deepImports.has(_('/node_modules/lib_1/deep/import'))).toBe(true);
      });

      it('should recurse into internal dependencies', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/internal/outer/index.js'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(1);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should handle circular internal dependencies', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/internal/circular_a/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should support `paths` alias mappings when resolving modules', () => {
        const fs = getFileSystem();
        host = new CommonJsDependencyHost(fs, new ModuleResolver(fs, {
                                            baseUrl: '/dist',
                                            paths: {
                                              '@app/*': ['*'],
                                              '@lib/*/test': ['lib/*/test'],
                                            }
                                          }));
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/path-alias/index.js'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(4);
        expect(dependencies.has(_('/dist/components'))).toBe(true);
        expect(dependencies.has(_('/dist/shared'))).toBe(true);
        expect(dependencies.has(_('/dist/lib/shared/test'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should handle entry-point paths with no extension', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports/index'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib_1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib_1/sub_1'))).toBe(true);
      });
    });
  });

  interface ImportsPerType {
    // var foo = require('...');
    varDeclaration?: string[];

    // var foo = require('...'), bar = require('...');
    varDeclarations?: string[][];

    // exports.foo = require('...');
    propAssignment?: string[];

    // module.exports = {foo: require('...')};
    inObjectLiteral?: string[];

    // require('...');
    forSideEffects?: string[];

    // __export(require('...'));
    reExportsWithEmittedHelper?: string[];

    // tslib_1.__exportStar(require('...'), exports);
    reExportsWithImportedHelper?: string[];

    // var foo = require('...');
    // __export(foo);
    reExportsWithoutRequire?: string[];
  }

  function commonJs(importsPerType: ImportsPerType|string[], exportNames: string[] = []): string {
    if (Array.isArray(importsPerType)) {
      importsPerType = {varDeclaration: importsPerType};
    }

    const importStatements = generateImportStatements(importsPerType);
    const exportStatements =
        exportNames.map(e => `exports.${e.replace(/.+\./, '')} = ${e};`).join('\n');

    return `${importStatements}\n\n${exportStatements}`;
  }

  function generateImportStatements(importsPerType: ImportsPerType): string {
    const importStatements: string[] = [];

    const {
      varDeclaration: importsOfTypeVarDeclaration = [],
      varDeclarations: importsOfTypeVarDeclarations = [],
      propAssignment: importsOfTypePropAssignment = [],
      inObjectLiteral: importsOfTypeInObjectLiteral = [],
      forSideEffects: importsOfTypeForSideEffects = [],
      reExportsWithEmittedHelper: importsOfTypeReExportsWithEmittedHelper = [],
      reExportsWithImportedHelper: importsOfTypeReExportsWithImportedHelper = [],
      reExportsWithoutRequire: importsOfTypeReExportsWithoutRequire = [],
    } = importsPerType;

    // var foo = require('...');
    importsOfTypeVarDeclaration.forEach(p => {
      importStatements.push(`var ${pathToVarName(p)} = require('${p}');`);
    });

    // var foo = require('...'), bar = require('...');
    importsOfTypeVarDeclarations.forEach(pp => {
      const declarations = pp.map(p => `${pathToVarName(p)} = require('${p}')`);
      importStatements.push(`var ${declarations.join(', ')};`);
    });

    // exports.foo = require('...');
    importsOfTypePropAssignment.forEach(p => {
      importStatements.push(`exports.${pathToVarName(p)} = require('${p}');`);
    });

    // module.exports = {foo: require('...')};
    const propAssignments =
        importsOfTypeInObjectLiteral.map(p => `\n  ${pathToVarName(p)}: require('${p}')`)
            .join(', ');
    importStatements.push(`module.exports = {${propAssignments}\n};`);

    // require('...');
    importsOfTypeForSideEffects.forEach(p => {
      importStatements.push(`require('${p}');`);
    });

    // __export(require('...'));
    importsOfTypeReExportsWithEmittedHelper.forEach(p => {
      importStatements.push(`__export(require('${p}'));`);
    });

    // tslib_1.__exportStar(require('...'), exports);
    importsOfTypeReExportsWithImportedHelper.forEach(p => {
      importStatements.push(`tslib_1.__exportStar(require('${p}'), exports);`);
    });

    // var foo = require('...');
    // __export(foo);
    importsOfTypeReExportsWithoutRequire.forEach(p => {
      const varName = pathToVarName(p);
      importStatements.push(`var ${varName} = require('${p}');`);
      importStatements.push(`__export(varName);`);
    });

    return importStatements.join('\n');
  }

  function pathToVarName(path: string): string {
    return path.replace(/^@(angular\/)?/, '').replace(/\.{0,2}\//g, '');
  }
});
