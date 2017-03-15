/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {main} from '../src/main';

import {makeTempDir} from './test_support';

describe('tsc-wrapped', () => {
  let basePath: string;
  let write: (fileName: string, content: string) => void;

  beforeEach(() => {
    basePath = makeTempDir();
    write = (fileName: string, content: string) => {
      fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
    };
    write('decorators.ts', '/** @Annotation */ export var Component: Function;');
    fs.mkdirSync(path.join(basePath, 'dep'));
    write('dep/index.ts', `
      export const A = 1;
      export const B = 2;
    `);
    write('test.ts', `
      import {Component} from './decorators';
      export * from './dep';

      @Component({})
      export class Comp {
        /**
         * Comment that is
         * multiple lines
         */
        method(x: string): void {}
      }
    `);
  });

  function readOut(ext: string) {
    return fs.readFileSync(path.join(basePath, 'built', `test.${ext}`), {encoding: 'utf-8'});
  }

  it('should report error if project not found', () => {
    main('not-exist', null as any)
        .then(() => fail('should report error'))
        .catch(e => expect(e.message).toContain('ENOENT'));
  });

  it('should pre-process sources', (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "moduleResolution": "node",
        "target": "es2015"
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "files": ["test.ts"]
    }`);

    main(basePath, {basePath})
        .then(() => {
          const out = readOut('js');
          // No helpers since decorators were lowered
          expect(out).not.toContain('__decorate');
          // Expand `export *` and fix index import
          expect(out).toContain(`export { A, B } from './dep/index'`);
          // Annotated for Closure compiler
          expect(out).toContain('* @param {?} x');
          // Comments should stay multi-line
          expect(out).not.toContain('Comment that is multiple lines');
          // Decorator is now an annotation
          expect(out).toMatch(/Comp.decorators = \[\s+\{ type: Component/);
          const decl = readOut('d.ts');
          expect(decl).toContain('declare class Comp');
          const metadata = readOut('metadata.json');
          expect(metadata).toContain('"Comp":{"__symbolic":"class"');
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should pre-process sources using config from vinyl like object', (done) => {
    const config = {
      path: basePath + '/tsconfig.json',
      contents: new Buffer(JSON.stringify({
        compilerOptions: {
          experimentalDecorators: true,
          types: [],
          outDir: 'built',
          declaration: true,
          moduleResolution: 'node',
          target: 'es2015'
        },
        angularCompilerOptions: {annotateForClosureCompiler: true},
        files: ['test.ts']
      }))
    };

    main(config, {basePath})
        .then(() => {
          const out = readOut('js');
          // Expand `export *` and fix index import
          expect(out).toContain(`export { A, B } from './dep/index'`);
          // Annotated for Closure compiler
          expect(out).toContain('* @param {?} x');
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should allow all options disabled', (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": false,
        "module": "es2015",
        "moduleResolution": "node"
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": false,
        "annotationsAs": "decorators",
        "skipMetadataEmit": true,
        "skipTemplateCodegen": true
      },
      "files": ["test.ts"]
    }`);

    main(basePath, {basePath})
        .then(() => {
          const out = readOut('js');
          // TypeScript's decorator emit
          expect(out).toContain('__decorate');
          // Not annotated for Closure compiler
          expect(out).not.toContain('* @param {?} x');
          expect(() => fs.accessSync(path.join(basePath, 'built', 'test.metadata.json'))).toThrow();
          expect(() => fs.accessSync(path.join(basePath, 'built', 'test.d.ts'))).toThrow();
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should allow all options disabled with metadata emit', (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": false,
        "module": "es2015",
        "moduleResolution": "node"
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": false,
        "annotationsAs": "decorators",
        "skipMetadataEmit": false,
        "skipTemplateCodegen": true
      },
      "files": ["test.ts"]
    }`);

    main(basePath, {basePath})
        .then(() => {
          const out = readOut('js');
          // TypeScript's decorator emit
          expect(out).toContain('__decorate');
          // Not annotated for Closure compiler
          expect(out).not.toContain('* @param {?} x');
          expect(() => fs.accessSync(path.join(basePath, 'built', 'test.d.ts'))).toThrow();
          const metadata = readOut('metadata.json');
          expect(metadata).toContain('"Comp":{"__symbolic":"class"');
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should allow JSDoc annotations without decorator downleveling', (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true,
        "annotationsAs": "decorators"
      },
      "files": ["test.ts"]
    }`);
    main(basePath, {basePath}).then(() => done()).catch(e => done.fail(e));
  });

  xit('should run quickly (performance baseline)', (done) => {
    for (let i = 0; i < 1000; i++) {
      write(`input${i}.ts`, `
        import {Component} from './decorators';
        @Component({})
        export class Input${i} {
          private __brand: string;
        }
      `);
    }
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "diagnostics": true
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": false,
        "annotationsAs": "decorators",
        "skipMetadataEmit": true
      },
      "include": ["input*.ts"]
    }`);
    console.time('BASELINE');

    main(basePath, {basePath})
        .then(() => {
          console.timeEnd('BASELINE');
          done();
        })
        .catch(e => done.fail(e));
  });

  xit('should run quickly (performance test)', (done) => {
    for (let i = 0; i < 1000; i++) {
      write(`input${i}.ts`, `
        import {Component} from './decorators';
        @Component({})
        export class Input${i} {
          private __brand: string;
        }
      `);
    }
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "diagnostics": true,
        "skipLibCheck": true
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "include": ["input*.ts"]
    }`);
    console.time('TSICKLE');

    main(basePath, {basePath})
        .then(() => {
          console.timeEnd('TSICKLE');
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should produce valid source maps', (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "moduleResolution": "node",
        "target": "es2015",
        "sourceMap": true
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "files": ["test.ts"]
    }`);

    main(basePath, {basePath})
        .then(() => {
          const out = readOut('js.map');
          expect(out).toContain('"sources":["../test.ts"]');
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should accept input source maps', (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "moduleResolution": "node",
        "target": "es2015",
        "sourceMap": true
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "files": ["test.ts"]
    }`);
    // Provide a file called test.ts that has an inline source map
    // which says that it was transpiled from a file other_test.ts
    // with exactly the same content.
    const inputSourceMap =
        `{"version":3,"sources":["other_test.ts"],"names":[],"mappings":"AAAA,MAAM,EAAE,EAAE,CAAC","file":"../test.ts","sourceRoot":""}`;
    const encodedSourceMap = new Buffer(inputSourceMap, 'utf8').toString('base64');
    write('test.ts', `const x = 3;
//# sourceMappingURL=data:application/json;base64,${encodedSourceMap}`);

    main(basePath, {basePath})
        .then(() => {
          const out = readOut('js.map');
          expect(out).toContain('"sources":["other_test.ts"]');
          done();
        })
        .catch(e => done.fail(e));
  });

  it(`should accept input source maps that don't match the file name`, (done) => {
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "moduleResolution": "node",
        "target": "es2015",
        "sourceMap": true
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "files": ["test.ts"]
    }`);
    // Provide a file called test.ts that has an inline source map
    // which says that it was transpiled from a file other_test.ts
    // with exactly the same content.
    const inputSourceMap =
        `{"version":3,"sources":["other_test.ts"],"names":[],"mappings":"AAAA,MAAM,EAAE,EAAE,CAAC","file":"test.ts","sourceRoot":""}`;
    const encodedSourceMap = new Buffer(inputSourceMap, 'utf8').toString('base64');
    write('test.ts', `const x = 3;
//# sourceMappingURL=data:application/json;base64,${encodedSourceMap}`);

    main(basePath, {basePath})
        .then(() => {
          const out = readOut('js.map');
          expect(out).toContain('"sources":["other_test.ts"]');
          done();
        })
        .catch(e => done.fail(e));
  });
});
