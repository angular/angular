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
import {createDependencyInfo} from '../../src/dependencies/dependency_host';
import {DtsDependencyHost} from '../../src/dependencies/dts_dependency_host';

runInEachFileSystem(() => {
  describe('DtsDependencyHost', () => {
    let _: typeof absoluteFrom;
    let host: DtsDependencyHost;
    beforeEach(() => {
      _ = absoluteFrom;
      setupMockFileSystem();
      const fs = getFileSystem();
      host = new DtsDependencyHost(fs);
    });

    describe('collectDependencies()', () => {
      it('should not generate a TS AST if the source does not contain any imports or re-exports',
         () => {
           spyOn(ts, 'createSourceFile');
           host.collectDependencies(
               _('/no/imports/or/re-exports/index.d.ts'), createDependencyInfo());
           expect(ts.createSourceFile).not.toHaveBeenCalled();
         });

      it('should resolve all the external imports of the source file', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports/index.d.ts'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      });

      it('should ignore synthetic type imports', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/synthetic-type-imports/index.d.ts'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(0);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should resolve all the external re-exports of the source file', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/re-exports/index.d.ts'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
        expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      });

      it('should capture missing external imports', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/imports-missing/index.d.ts'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(1);
        expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
        expect(missing.size).toBe(1);
        expect(missing.has(relativeFrom('missing'))).toBe(true);
        expect(deepImports.size).toBe(0);
      });

      it('should not register deep imports as missing', () => {
        // This scenario verifies the behavior of the dependency analysis when an external import
        // is found that does not map to an entry-point but still exists on disk, i.e. a deep
        // import. Such deep imports are captured for diagnostics purposes.
        // Note that in the DTS version, the deep import may not map to a .d.ts file, but instead
        // a .js file. This test exercises this particular scenario.
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/deep-import/index.d.ts'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(0);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(1);
        expect(deepImports.has(_('/node_modules/lib-1/deep/import'))).toBe(true);
      });

      it('should not register deep imports as missing, if available in `@types/...`', () => {
        // This scenario verifies the behavior of the dependency analysis when an external import
        // is found that does not map to an entry-point but still exists in an `@types/...` package,
        // i.e. a type-only deep import. Such deep imports are captured for diagnostics purposes.
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/external/deep-import-2/index.d.ts'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(0);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(1);
        expect(deepImports.has(_('/node_modules/@types/type-only/deep/import'))).toBe(true);
      });

      it('should recurse into internal dependencies', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/internal/outer/index.d.ts'), {dependencies, missing, deepImports});

        expect(dependencies.size).toBe(1);
        expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should handle circular internal dependencies', () => {
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(
            _('/internal/circular-a/index.d.ts'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(2);
        expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
        expect(missing.size).toBe(0);
        expect(deepImports.size).toBe(0);
      });

      it('should support `paths` alias mappings when resolving modules', () => {
        const fs = getFileSystem();
        host = new DtsDependencyHost(fs, {
          baseUrl: '/dist',
          paths: {
            '@app/*': ['*'],
            '@lib/*/test': ['lib/*/test'],
          }
        });
        const {dependencies, missing, deepImports} = createDependencyInfo();
        host.collectDependencies(_('/path-alias/index.d.ts'), {dependencies, missing, deepImports});
        expect(dependencies.size).toBe(4);
        expect(dependencies.has(_('/dist/components'))).toBe(true);
        expect(dependencies.has(_('/dist/shared'))).toBe(true);
        expect(dependencies.has(_('/dist/lib/shared/test'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
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
        expect(dependencies.has(_('/node_modules/lib-1'))).toBe(true);
        expect(dependencies.has(_('/node_modules/lib-1/sub-1'))).toBe(true);
      });
    });

    function setupMockFileSystem(): void {
      loadTestFiles([
        {
          name: _('/no/imports/or/re-exports/index.d.ts'),
          contents: '// some text but no import-like statements'
        },
        {name: _('/no/imports/or/re-exports/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/no/imports/or/re-exports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/imports/index.d.ts'),
          contents: `import {X} from 'lib-1';\nimport {Y} from 'lib-1/sub-1';`
        },
        {name: _('/external/imports/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/imports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/synthetic-type-imports/index.d.ts'),
          contents: `const function foo(): Array<import("lib-1").X>;`
        },
        {
          name: _('/external/synthetic-type-imports/package.json'),
          contents: '{"esm2015": "./index.js"}'
        },
        {
          name: _('/external/synthetic-type-imports/index.metadata.json'),
          contents: 'MOCK METADATA'
        },
        {
          name: _('/external/re-exports/index.d.ts'),
          contents: `export {X} from 'lib-1';\nexport {Y} from 'lib-1/sub-1';`
        },
        {name: _('/external/re-exports/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/re-exports/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/imports-missing/index.d.ts'),
          contents: `import {X} from 'lib-1';\nimport {Y} from 'missing';`
        },
        {name: _('/external/imports-missing/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/imports-missing/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/deep-import/index.d.ts'),
          contents: `import {Y} from 'lib-1/deep/import';`
        },
        {name: _('/external/deep-import/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/external/deep-import/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/external/deep-import-2/index.d.ts'),
          contents: `import {Y} from 'type-only/deep/import';`
        },
        {
          name: _('/node_modules/@types/type-only/deep/import/index.d.ts'),
          contents: `export declare class Y {}`
        },
        {name: _('/internal/outer/index.d.ts'), contents: `import {X} from '../inner';`},
        {name: _('/internal/outer/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/internal/outer/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/internal/inner/index.d.ts'),
          contents: `import {Y} from 'lib-1/sub-1'; export declare class X {}`
        },
        {
          name: _('/internal/circular-a/index.d.ts'),
          contents:
              `import {B} from '../circular-b'; import {X} from '../circular-b'; export {Y} from 'lib-1/sub-1';`
        },
        {
          name: _('/internal/circular-b/index.d.ts'),
          contents:
              `import {A} from '../circular-a'; import {Y} from '../circular-a'; export {X} from 'lib-1';`
        },
        {name: _('/internal/circular-a/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/internal/circular-a/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/path-alias/index.d.ts'),
          contents:
              `import {TestHelper} from '@app/components';\nimport {Service} from '@app/shared';\nimport {TestHelper} from '@lib/shared/test';\nimport {X} from 'lib-1';`
        },
        {name: _('/path-alias/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/path-alias/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/node_modules/lib-1/index.d.ts'), contents: 'export declare class X {}'},
        {name: _('/node_modules/lib-1/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/node_modules/lib-1/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/node_modules/lib-1/deep/import/index.js'),
          contents: 'export class DeepImport {}'
        },
        {name: _('/node_modules/lib-1/sub-1/index.d.ts'), contents: 'export declare class Y {}'},
        {name: _('/node_modules/lib-1/sub-1/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/node_modules/lib-1/sub-1/index.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/node_modules/lib-1/sub-2.d.ts'), contents: `export * from './sub-2/sub-2';`},
        {name: _('/node_modules/lib-1/sub-2/sub-2.d.ts'), contents: `export declare class Z {}';`},
        {name: _('/node_modules/lib-1/sub-2/package.json'), contents: '{"esm2015": "./sub-2.js"}'},
        {name: _('/node_modules/lib-1/sub-2/sub-2.metadata.json'), contents: 'MOCK METADATA'},
        {name: _('/dist/components/index.d.ts'), contents: `class MyComponent {};`},
        {name: _('/dist/components/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/dist/components/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/dist/shared/index.d.ts'),
          contents: `import {X} from 'lib-1';\nexport declare class Service {}`
        },
        {name: _('/dist/shared/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/dist/shared/index.metadata.json'), contents: 'MOCK METADATA'},
        {
          name: _('/dist/lib/shared/test/index.d.ts'),
          contents: `export declare class TestHelper {}`
        },
        {name: _('/dist/lib/shared/test/package.json'), contents: '{"esm2015": "./index.js"}'},
        {name: _('/dist/lib/shared/test/index.metadata.json'), contents: 'MOCK METADATA'},
      ]);
    }
  });
});
