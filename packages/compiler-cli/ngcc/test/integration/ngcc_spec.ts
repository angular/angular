/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />
import {readFileSync} from 'fs';
import * as os from 'os';

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {Folder, MockFileSystem, runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadStandardTestFiles, loadTestFiles} from '../../../src/ngtsc/testing';
import {getLockFilePath} from '../../src/locking/lock_file';
import {mainNgcc} from '../../src/main';
import {clearTsConfigCache} from '../../src/ngcc_options';
import {hasBeenProcessed, markAsProcessed} from '../../src/packages/build_marker';
import {EntryPointJsonProperty, EntryPointPackageJson, SUPPORTED_FORMAT_PROPERTIES} from '../../src/packages/entry_point';
import {EntryPointManifestFile} from '../../src/packages/entry_point_manifest';
import {Transformer} from '../../src/packages/transformer';
import {DirectPackageJsonUpdater, PackageJsonUpdater} from '../../src/writing/package_json_updater';

import {compileIntoApf, compileIntoFlatEs2015Package, compileIntoFlatEs5Package} from './util';

const ANGULAR_CORE_IMPORT_REGEX = /import \* as ɵngcc\d+ from '@angular\/core';/;
const testFiles = loadStandardTestFiles({fakeCore: false, rxjs: true});

runInEachFileSystem(() => {
  describe('ngcc main()', () => {
    let _: typeof absoluteFrom;
    let fs: FileSystem;
    let pkgJsonUpdater: PackageJsonUpdater;
    const STANDARD_MARKERS = {
      main: '0.0.0-PLACEHOLDER',
      module: '0.0.0-PLACEHOLDER',
      es2015: '0.0.0-PLACEHOLDER',
      esm2015: '0.0.0-PLACEHOLDER',
      fesm2015: '0.0.0-PLACEHOLDER',
      typings: '0.0.0-PLACEHOLDER',
    };

    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      pkgJsonUpdater = new DirectPackageJsonUpdater(fs);
      initMockFileSystem(fs, testFiles);

      // Force single-process execution in unit tests by mocking available CPUs to 1.
      spyOn(os, 'cpus').and.returnValue([{model: 'Mock CPU'} as any]);
    });

    afterEach(() => {
      clearTsConfigCache();
    });

    /**
     * Sets up the esm5 format in the Angular core package. By default, package output
     * no longer contains esm5 output, so we process the fesm2015 file into ES5 and
     * link it as if its the ESM5 output.
     */
    function setupAngularCoreEsm5() {
      const pkgPath = _('/node_modules/@angular/core');
      const pkgJsonPath = fs.join(pkgPath, 'package.json');
      const pkgJson = JSON.parse(fs.readFile(pkgJsonPath)) as EntryPointPackageJson;

      fs.ensureDir(fs.join(pkgPath, 'fesm5'));
      fs.writeFile(
          fs.join(pkgPath, 'fesm5/core.js'),
          readFileSync(require.resolve('../fesm5_angular_core.js'), 'utf8'));

      pkgJson.esm5 = './fesm5/core.js';
      pkgJson.fesm5 = './fesm5/core.js';

      fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    }

    it('should run ngcc without errors for esm2015', () => {
      expect(() => mainNgcc({basePath: '/node_modules', propertiesToConsider: ['esm2015']}))
          .not.toThrow();
    });

    it('should run ngcc without errors for esm5', () => {
      setupAngularCoreEsm5();

      expect(() => mainNgcc({
               basePath: '/node_modules',
               propertiesToConsider: ['esm5'],
               targetEntryPointPath: '@angular/core',
               logger: new MockLogger(),
             }))
          .not.toThrow();

      expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toBeDefined();
    });

    it('should run ngcc without errors when "main" property is not present', () => {
      mainNgcc({
        basePath: '/dist',
        propertiesToConsider: ['main', 'es2015'],
        logger: new MockLogger(),
      });

      expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
        es2015: '0.0.0-PLACEHOLDER',
        typings: '0.0.0-PLACEHOLDER',
      });
    });

    it('should throw, if some of the entry-points are unprocessable', () => {
      const createEntryPoint = (name: string, prop: EntryPointJsonProperty): TestFile[] => {
        return [
          {
            name: _(`/dist/${name}/package.json`),
            contents: `{"name": "${name}", "typings": "./index.d.ts", "${prop}": "./index.js"}`,
          },
          {name: _(`/dist/${name}/index.js`), contents: 'var DUMMY_DATA = true;'},
          {name: _(`/dist/${name}/index.d.ts`), contents: 'export type DummyData = boolean;'},
          {name: _(`/dist/${name}/index.metadata.json`), contents: 'DUMMY DATA'},
        ];
      };

      loadTestFiles([
        ...createEntryPoint('processable-1', 'es2015'),
        ...createEntryPoint('unprocessable-2', 'main'),
        ...createEntryPoint('unprocessable-3', 'main'),
      ]);

      expect(() => mainNgcc({
               basePath: '/dist',
               propertiesToConsider: ['es2015', 'fesm5', 'module'],
               logger: new MockLogger(),
             }))
          .toThrowError(
              'Unable to process any formats for the following entry-points (tried es2015, fesm5, module): \n' +
              `  - ${_('/dist/unprocessable-2')}\n` +
              `  - ${_('/dist/unprocessable-3')}`);
    });

    it('should throw, if an error happens during processing', () => {
      spyOn(Transformer.prototype, 'transform').and.throwError('Test error.');

      expect(() => mainNgcc({
               basePath: '/dist',
               targetEntryPointPath: 'local-package',
               propertiesToConsider: ['main', 'es2015'],
               logger: new MockLogger(),
             }))
          .toThrowError(`Test error.`);

      expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toBeUndefined();
      expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toBeUndefined();
    });

    it('should report an error, if one of the format-paths is missing or empty', () => {
      loadTestFiles([
        // A package with a format-path (main) that points to a missing file.
        {
          name: _(`/dist/pkg-with-missing-main/package.json`),
          contents: `
            {
              "name": "pkg-with-missing-main",
              "typings": "./index.d.ts",
              "es2015": "./index-es2015.js",
              "fesm5": "./index-es5.js",
              "main": "./index-missing.js"
            }
          `,
        },
        {
          name: _('/dist/pkg-with-missing-main/index.d.ts'),
          contents: 'export type DummyData = boolean;'
        },
        {
          name: _('/dist/pkg-with-missing-main/index-es2015.js'),
          contents: 'var DUMMY_DATA = true;'
        },
        {name: _('/dist/pkg-with-missing-main/index-es5.js'), contents: 'var DUMMY_DATA = true;'},
        {name: _('/dist/pkg-with-missing-main/index.metadata.json'), contents: 'DUMMY DATA'},

        // A package with a format-path (main) that points to an empty file.
        {
          name: _(`/dist/pkg-with-empty-main/package.json`),
          contents: `
            {
              "name": "pkg-with-empty-main",
              "typings": "./index.d.ts",
              "es2015": "./index-es2015.js",
              "fesm5": "./index-es5.js",
              "main": "./index-empty.js"
            }
          `,
        },
        {
          name: _('/dist/pkg-with-empty-main/index.d.ts'),
          contents: 'export type DummyData = boolean;'
        },
        {name: _('/dist/pkg-with-empty-main/index-empty.js'), contents: ''},
        {name: _('/dist/pkg-with-empty-main/index-es2015.js'), contents: 'var DUMMY_DATA = true;'},
        {name: _('/dist/pkg-with-empty-main/index-es5.js'), contents: 'var DUMMY_DATA = true;'},
        {name: _('/dist/pkg-with-empty-main/index.metadata.json'), contents: 'DUMMY DATA'},
      ]);

      const logger = new MockLogger();
      mainNgcc({
        basePath: '/dist',
        propertiesToConsider: ['es2015', 'main', 'fesm5'],
        logger,
      });

      expect(loadPackage('pkg-with-missing-main', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
        es2015: jasmine.any(String),
        fesm5: jasmine.any(String),
        typings: jasmine.any(String),
      });
      expect(loadPackage('pkg-with-empty-main', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
        es2015: jasmine.any(String),
        fesm5: jasmine.any(String),
        typings: jasmine.any(String),
      });

      expect(logger.logs.error).toEqual([
        [
          'Failed to compile entry-point pkg-with-missing-main (`main` as unknown format) due to ' +
              'property `main` pointing to a missing or empty file: ./index-missing.js',
        ],
        [
          'Failed to compile entry-point pkg-with-empty-main (`main` as unknown format) due to ' +
              'property `main` pointing to a missing or empty file: ./index-empty.js',
        ],
      ]);
    });

    it('should generate correct metadata for decorated getter/setter properties', () => {
      setupAngularCoreEsm5();
      compileIntoFlatEs5Package('test-package', {
        '/index.ts': `
          import {Directive, Input, NgModule} from '@angular/core';

          @Directive({selector: '[foo]'})
          export class FooDirective {
            @Input() get bar() { return 'bar'; }
            set bar(value: string) {}
          }

          @NgModule({
            declarations: [FooDirective],
          })
          export class FooModule {}
        `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm5'],
      });

      const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`)).replace(/\s+/g, ' ');
      expect(jsContents)
          .toContain(
              '(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ' +
              'ɵngcc0.ɵsetClassMetadata(FooDirective, ' +
              '[{ type: Directive, args: [{ selector: \'[foo]\' }] }], ' +
              'function () { return []; }, ' +
              '{ bar: [{ type: Input }] }); })();');
    });

    ['esm5', 'esm2015'].forEach(target => {
      it(`should be able to process spread operator inside objects for ${
             target} format (imported helpers)`,
         () => {
           setupAngularCoreEsm5();
           compileIntoApf(
               'test-package', {
                 '/index.ts': `
                  import {Directive, Input, NgModule} from '@angular/core';

                  const a = { '[class.a]': 'true' };
                  const b = { '[class.b]': 'true' };

                  @Directive({
                    selector: '[foo]',
                    host: {...a, ...b, '[class.c]': 'false'}
                  })
                  export class FooDirective {}

                  @NgModule({
                    declarations: [FooDirective],
                  })
                  export class FooModule {}
                `,
               },
               {importHelpers: true, noEmitHelpers: true});

           fs.writeFile(
               _('/node_modules/tslib/index.d.ts'),
               `export declare function __assign(...args: object[]): object;`);

           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: [target],
           });

           const jsContents = fs.readFile(_(`/node_modules/test-package/${target}/src/index.js`))
                                  .replace(/\s+/g, ' ');
           expect(jsContents).toContain('ngcc0.ɵɵclassProp("a", true)("b", true)("c", false)');
         });

      it(`should be able to process emitted spread operator inside objects for ${
             target} format (emitted helpers)`,
         () => {
           setupAngularCoreEsm5();
           compileIntoApf(
               'test-package', {
                 '/index.ts': `
                    import {Directive, Input, NgModule} from '@angular/core';

                    const a = { '[class.a]': 'true' };
                    const b = { '[class.b]': 'true' };

                    @Directive({
                      selector: '[foo]',
                      host: {...a, ...b, '[class.c]': 'false'}
                    })
                    export class FooDirective {}

                    @NgModule({
                      declarations: [FooDirective],
                    })
                    export class FooModule {}
                  `,
               },
               {importHelpers: false, noEmitHelpers: false});

           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: [target],
           });

           const jsContents = fs.readFile(_(`/node_modules/test-package/${target}/src/index.js`))
                                  .replace(/\s+/g, ' ');
           expect(jsContents).toContain('ngcc0.ɵɵclassProp("a", true)("b", true)("c", false)');
         });
    });

    it(`should be able to detect synthesized constructors in ES5 with downlevelIteration enabled (imported helpers)`,
       () => {
         setupAngularCoreEsm5();
         compileIntoApf(
             'test-package', {
               '/index.ts': `
                import {Injectable} from '@angular/core';

                @Injectable()
                export class Base {}

                @Injectable()
                export class SubClass extends Base {
                  constructor() {
                    // Note: mimic the situation where TS is first emitted into ES2015, resulting
                    // in the spread super call below, and then downleveled into ES5 using the
                    // "downlevelIteration" option.
                    super(...arguments);
                    this.foo = 'bar';
                  }
                }
              `,
             },
             {importHelpers: true, noEmitHelpers: true, downlevelIteration: true});

         mainNgcc({
           basePath: '/node_modules',
           targetEntryPointPath: 'test-package',
           propertiesToConsider: ['esm5'],
         });

         const jsContents = fs.readFile(_(`/node_modules/test-package/esm5/src/index.js`));
         // Verify that the ES5 bundle does contain the expected downleveling syntax.
         expect(jsContents).toContain('__spreadArray([], __read(arguments))');
         expect(jsContents)
             .toContain(
                 'var ɵSubClass_BaseFactory; return function SubClass_Factory(t) { return (ɵSubClass_BaseFactory || (ɵSubClass_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(SubClass)))(t || SubClass); };');
       });

    it(`should be able to detect synthesized constructors in ES5 with downlevelIteration enabled (emitted helpers)`,
       () => {
         setupAngularCoreEsm5();
         compileIntoApf(
             'test-package', {
               '/index.ts': `
                import {Injectable} from '@angular/core';

                @Injectable()
                export class Base {}

                @Injectable()
                export class SubClass extends Base {
                  constructor() {
                    // Note: mimic the situation where TS is first emitted into ES2015, resulting
                    // in the spread super call below, and then downleveled into ES5 using the
                    // "downlevelIteration" option.
                    super(...arguments);
                    this.foo = 'bar';
                  }
                }
              `,
             },
             {importHelpers: false, noEmitHelpers: false, downlevelIteration: true});

         mainNgcc({
           basePath: '/node_modules',
           targetEntryPointPath: 'test-package',
           propertiesToConsider: ['esm5'],
         });

         const jsContents = fs.readFile(_(`/node_modules/test-package/esm5/src/index.js`));
         // Verify that the ES5 bundle does contain the expected downleveling syntax.
         expect(jsContents).toContain('__spreadArray([], __read(arguments))');
         expect(jsContents)
             .toContain(
                 'var ɵSubClass_BaseFactory; return function SubClass_Factory(t) { return (ɵSubClass_BaseFactory || (ɵSubClass_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(SubClass)))(t || SubClass); };');
       });

    it('should not add `const` in ES5 generated code', () => {
      setupAngularCoreEsm5();
      compileIntoFlatEs5Package('test-package', {
        '/index.ts': `
          import {Directive, Input, NgModule} from '@angular/core';

          @Directive({
            selector: '[foo]',
            host: {bar: ''},
          })
          export class FooDirective {
          }

          @NgModule({
            declarations: [FooDirective],
          })
          export class FooModule {}
        `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm5'],
      });

      const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
      expect(jsContents).not.toMatch(/\bconst \w+\s*=/);
    });

    it('should be able to reflect into external libraries', () => {
      compileIntoApf('lib', {
        '/index.ts': `
          export * from './constants';
          export * from './module';
        `,
        '/constants.ts': `
          export const selectorA = '[selector-a]';

          export class Selectors {
            static readonly B = '[selector-b]';
          }
        `,
        '/module.ts': `
          import {NgModule, ModuleWithProviders} from '@angular/core';

          @NgModule()
          export class MyOtherModule {}

          export class MyModule {
            static forRoot(): ModuleWithProviders<MyOtherModule> {
              return {ngModule: MyOtherModule};
            }
          }
        `
      });

      compileIntoFlatEs2015Package('test-package', {
        '/index.ts': `
          import {Directive, Input, NgModule} from '@angular/core';
          import * as lib from 'lib';

          @Directive({
            selector: lib.selectorA,
          })
          export class DirectiveA {
          }

          @Directive({
            selector: lib.Selectors.B,
          })
          export class DirectiveB {
          }

          @NgModule({
            imports: [lib.MyModule.forRoot()],
            declarations: [DirectiveA, DirectiveB],
          })
          export class FooModule {}
        `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm2015'],
      });

      const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
      expect(jsContents).toContain('"selector-a"');
      expect(jsContents).toContain('"selector-b"');
      expect(jsContents).toContain('imports: [ɵngcc1.MyOtherModule]');
    });

    it('should be able to resolve enum values', () => {
      compileIntoApf('test-package', {
        '/index.ts': `
          import {Component, NgModule} from '@angular/core';

          export enum StringEnum {
            ValueA = "a",
            ValueB = "b",
          }

          export enum NumericEnum {
            Value3 = 3,
            Value4,
          }

          @Component({
            template: \`\${StringEnum.ValueA} - \${StringEnum.ValueB} - \${NumericEnum.Value3} - \${NumericEnum.Value4}\`,
          })
          export class FooCmp {}

          @NgModule({
            declarations: [FooCmp],
          })
          export class FooModule {}
        `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm2015', 'esm5'],
      });

      const es2015Contents = fs.readFile(_(`/node_modules/test-package/esm2015/src/index.js`));
      expect(es2015Contents).toContain('ɵngcc0.ɵɵtext(0, "a - b - 3 - 4")');

      const es5Contents = fs.readFile(_(`/node_modules/test-package/esm5/src/index.js`));
      expect(es5Contents).toContain('ɵngcc0.ɵɵtext(0, "a - b - 3 - 4")');
    });

    it('should not crash when scanning for ModuleWithProviders needs to evaluate code from an external package',
       () => {
         // Regression test for https://github.com/angular/angular/issues/37508
         // During `ModuleWithProviders` analysis, return statements in methods are evaluated using
         // the partial evaluator to identify whether they correspond with a `ModuleWithProviders`
         // function. If an arbitrary method has a return statement that calls into an external
         // module which doesn't have declaration files, ngcc would attempt to reflect on said
         // module using the reflection host of the entry-point. This would crash in the case where
         // e.g. the entry-point is UMD and the external module would be CommonJS, as the UMD
         // reflection host would throw because it is unable to deal with CommonJS.

         // Setup a non-TS package with CommonJS module format
         loadTestFiles([
           {
             name: _(`/node_modules/identity/package.json`),
             contents: `{"name": "identity", "main": "./index.js"}`,
           },
           {
             name: _(`/node_modules/identity/index.js`),
             contents: `
            function identity(x) { return x; };
            exports.identity = identity;
            module.exports = identity;
          `,
           },
         ]);

         // Setup an Angular entry-point with UMD module format that references an export of the
         // CommonJS package.
         loadTestFiles([
           {
             name: _('/node_modules/test-package/package.json'),
             contents: '{"name": "test-package", "main": "./index.js", "typings": "./index.d.ts"}'
           },
           {
             name: _('/node_modules/test-package/index.js'),
             contents: `
            (function (global, factory) {
              typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('identity')) :
              typeof define === 'function' && define.amd ? define('test', ['exports', 'identity'], factory) :
              (factory(global.test, global.identity));
            }(this, (function (exports, identity) { 'use strict';
              function Foo(x) {
                // The below statement is analyzed for 'ModuleWithProviders', so is evaluated
                // by ngcc. The reference into the non-TS CommonJS package used to crash ngcc.
                return identity.identity(x);
              }
              exports.Foo = Foo;
            })));
          `
           },
           {
             name: _('/node_modules/test-package/index.d.ts'),
             contents: 'export declare class Foo { static doSomething(x: any): any; }'
           },
           {name: _('/node_modules/test-package/index.metadata.json'), contents: 'DUMMY DATA'},
         ]);

         expect(() => mainNgcc({
                  basePath: '/node_modules',
                  targetEntryPointPath: 'test-package',
                  propertiesToConsider: ['main'],
                }))
             .not.toThrow();
       });

    it('should support inline UMD/CommonJS exports declarations', () => {
      // Setup an Angular entry-point in UMD module format that has an inline exports declaration
      // referenced by an NgModule.
      loadTestFiles([
        {
          name: _('/node_modules/test-package/package.json'),
          contents: '{"name": "test-package", "main": "./index.js", "typings": "./index.d.ts"}'
        },
        {
          name: _('/node_modules/test-package/index.js'),
          contents: `
          (function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
            typeof define === 'function' && define.amd ? define('test', ['exports', 'core'], factory) :
            (factory(global.test, global.core));
          }(this, (function (exports, core) { 'use strict';
            exports.FooModule = /** @class */ (function () {
              function FooModule() {}
              FooModule = __decorate([
                  core.NgModule({declarations: exports.declarations})
              ], FooModule);
              return FooModule;
            }());

            exports.declarations = [exports.FooDirective];

            exports.FooDirective = /** @class */ (function () {
              function FooDirective() {}
              FooDirective = __decorate([
                core.Directive({selector: '[foo]'})
              ], FooDirective);
              return FooDirective;
            }());
          })));
          `
        },
        {
          name: _('/node_modules/test-package/index.d.ts'),
          contents: `
          export declare class FooModule { }
          export declare class FooDirective { }
          `
        },
        {name: _('/node_modules/test-package/index.metadata.json'), contents: 'DUMMY DATA'},
      ]);

      expect(() => mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: 'test-package',
               propertiesToConsider: ['main'],
             }))
          .not.toThrow();

      const processedFile = fs.readFile(_('/node_modules/test-package/index.js'));
      expect(processedFile)
          .toContain(
              'FooModule.ɵmod = /*@__PURE__*/ ɵngcc0.ɵɵdefineNgModule({ type: FooModule });');
      expect(processedFile)
          .toContain(
              'ɵngcc0.ɵɵsetNgModuleScope(FooModule, { declarations: function () { return [exports.FooDirective]; } });');
    });

    it('should not be able to evaluate code in external packages when no .d.ts files are present',
       () => {
         loadTestFiles([
           {
             name: _(`/node_modules/external/package.json`),
             contents: `{"name": "external", "main": "./index.js"}`,
           },
           {
             name: _(`/node_modules/external/index.js`),
             contents: `
            export const selector = 'my-selector';
          `,
           },
         ]);

         compileIntoApf('test-package', {
           '/index.ts': `
          import {NgModule, Component} from '@angular/core';
          import {selector} from 'external';

          @Component({
            selector,
            template: ''
          })
          export class FooComponent {
          }

          @NgModule({
            declarations: [FooComponent],
          })
          export class FooModule {}
        `,
         });

         try {
           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: ['esm2015', 'esm5'],
           });
           fail('should have thrown');
         } catch (e) {
           expect(e.message).toContain(
               'Failed to compile entry-point test-package (`esm2015` as esm2015) due to compilation errors:');
           expect(e.message).toContain('NG1010');
           expect(e.message).toContain('selector must be a string');
         }
       });

    it('should add ɵfac but not duplicate ɵprov properties on injectables', () => {
      compileIntoFlatEs2015Package('test-package', {
        '/index.ts': `
        import {Injectable, ɵɵdefineInjectable} from '@angular/core';
        export const TestClassToken = 'TestClassToken';
        @Injectable({providedIn: 'module'})
        export class TestClass {
          static ɵprov = ɵɵdefineInjectable({ factory: () => {}, token: TestClassToken, providedIn: "module" });
        }
        `,
      });

      const before = fs.readFile(_(`/node_modules/test-package/index.js`));
      const originalProp = /ɵprov[^;]+/.exec(before)![0];
      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm2015'],
      });
      const after = fs.readFile(_(`/node_modules/test-package/index.js`));

      expect(before).toContain(originalProp);
      expect(countOccurrences(before, 'ɵprov')).toEqual(1);
      expect(countOccurrences(before, 'ɵfac')).toEqual(0);

      expect(after).toContain(originalProp);
      expect(countOccurrences(after, 'ɵprov')).toEqual(1);
      expect(countOccurrences(after, 'ɵfac')).toEqual(1);
    });

    // This is necessary to ensure XPipeDef.fac is defined when delegated from injectable def
    it('should always generate factory def (fac) before injectable def (prov)', () => {
      compileIntoFlatEs2015Package('test-package', {
        '/index.ts': `
        import {Injectable, Pipe, PipeTransform} from '@angular/core';

        @Injectable()
        @Pipe({
          name: 'myTestPipe'
        })
        export class TestClass implements PipeTransform {
          transform(value: any) { return value; }
        }
        `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm2015'],
      });

      const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
      expect(jsContents)
          .toContain(
              `TestClass.ɵfac = function TestClass_Factory(t) { return new (t || TestClass)(); };\n` +
              `TestClass.ɵpipe = /*@__PURE__*/ ɵngcc0.ɵɵdefinePipe({ name: "myTestPipe", type: TestClass, pure: true });\n` +
              `TestClass.ɵprov = /*@__PURE__*/ ɵngcc0.ɵɵdefineInjectable({`);
    });

    // https://github.com/angular/angular/issues/38883
    it('should recognize ChangeDetectorRef as special symbol for pipes', () => {
      compileIntoFlatEs2015Package('test-package', {
        '/index.ts': `
        import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'myTestPipe'
        })
        export class TestClass implements PipeTransform {
          constructor(cdr: ChangeDetectorRef) {}
          transform(value: any) { return value; }
        }
        `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm2015'],
      });

      const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
      expect(jsContents)
          .toContain(
              `TestClass.ɵfac = function TestClass_Factory(t) { ` +
              `return new (t || TestClass)(ɵngcc0.ɵɵdirectiveInject(ɵngcc0.ChangeDetectorRef, 16)); };`);
    });

    it('should use the correct type name in typings files when an export has a different name in source files',
       () => {
         // We need to make sure that changes to the typings files use the correct name
         // static ɵprov: ɵngcc0.ɵɵInjectableDeclaration<ɵangular_packages_common_common_a>;
         mainNgcc({
           basePath: '/node_modules',
           targetEntryPointPath: '@angular/common',
           propertiesToConsider: ['esm2015']
         });

         // In `@angular/common` the `BrowserPlatformLocation` class gets exported as something like
         // `ɵangular_packages_common_common_a`.
         const jsContents = fs.readFile(_(`/node_modules/@angular/common/fesm2015/common.js`));
         const exportedNameMatch =
             jsContents.match(/export.* BrowserPlatformLocation as ([^ ,}]+)/);
         if (exportedNameMatch === null) {
           return fail(
               'Expected `/node_modules/@angular/common/fesm2015/common.js` to export `BrowserPlatformLocation` via an alias');
         }
         const exportedName = exportedNameMatch[1];

         // We need to make sure that the flat typings file exports this directly
         const dtsContents = fs.readFile(_('/node_modules/@angular/common/common.d.ts'));
         expect(dtsContents)
             .toContain(`export declare class ${exportedName} extends PlatformLocation`);
         // And that ngcc's modifications to that class use the correct (exported) name
         expect(dtsContents)
             .toContain(`static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<${exportedName}, never>`);
       });

    it('should include constructor metadata in factory definitions', () => {
      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: '@angular/common',
        propertiesToConsider: ['esm2015']
      });

      const dtsContents = fs.readFile(_('/node_modules/@angular/common/common.d.ts'));
      expect(dtsContents)
          .toContain(
              `static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<NgPluralCase, [{ attribute: "ngPluralCase"; }, null, null, { host: true; }]>`);
    });

    it('should add generic type for ModuleWithProviders and generate exports for private modules',
       () => {
         compileIntoApf('test-package', {
           '/index.ts': `
              import {ModuleWithProviders} from '@angular/core';
              import {InternalFooModule} from './internal';

              export class FooModule {
                static forRoot(): ModuleWithProviders {
                  return {
                    ngModule: InternalFooModule,
                  };
                }
              }
            `,
           '/internal.ts': `
              import {NgModule} from '@angular/core';

              @NgModule()
              export class InternalFooModule {}
           `,
         });

         mainNgcc({
           basePath: '/node_modules',
           targetEntryPointPath: 'test-package',
           propertiesToConsider: ['esm2015', 'esm5', 'module'],
         });

         // The .d.ts where FooModule is declared should have a generic type added
         const dtsContents = fs.readFile(_(`/node_modules/test-package/src/index.d.ts`));
         expect(dtsContents).toContain(`import * as ɵngcc0 from './internal';`);
         expect(dtsContents)
             .toContain(`static forRoot(): ModuleWithProviders<ɵngcc0.InternalFooModule>`);

         // The public facing .d.ts should export the InternalFooModule
         const entryDtsContents = fs.readFile(_(`/node_modules/test-package/index.d.ts`));
         expect(entryDtsContents).toContain(`export {InternalFooModule} from './src/internal';`);

         // The esm2015 index source should export the InternalFooModule
         const esm2015Contents = fs.readFile(_(`/node_modules/test-package/esm2015/index.js`));
         expect(esm2015Contents).toContain(`export {InternalFooModule} from './src/internal';`);

         // The esm5 index source should also export the InternalFooModule
         const esm5Contents = fs.readFile(_(`/node_modules/test-package/esm5/index.js`));
         expect(esm5Contents).toContain(`export {InternalFooModule} from './src/internal';`);
       });

    it('should use `$localize` calls rather than tagged templates in ES5 generated code', () => {
      setupAngularCoreEsm5();
      compileIntoFlatEs5Package('test-package', {
        '/index.ts': `
        import {Component, Input, NgModule} from '@angular/core';

        @Component({
          selector: '[foo]',
          template: '<div i18n="some:\`description\`">A message</div>'
        })
        export class FooComponent {
        }

        @NgModule({
          declarations: [FooComponent],
        })
        export class FooModule {}
      `,
      });

      mainNgcc({
        basePath: '/node_modules',
        targetEntryPointPath: 'test-package',
        propertiesToConsider: ['esm5'],
      });

      const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
      expect(jsContents).not.toMatch(/\$localize\s*`/);
      expect(jsContents)
          .toMatch(
              /\$localize\(ɵngcc\d+\.__makeTemplateObject\(\[":some:`description`\\u241Fefc92f285b3c24b083a8a594f62c7fccf3118766\\u241F3806630072763809030:A message"], \[":some\\\\:\\\\`description\\\\`\\u241Fefc92f285b3c24b083a8a594f62c7fccf3118766\\u241F3806630072763809030:A message"]\)\);/);
    });

    describe('in async mode', () => {
      it('should run ngcc without errors for fesm2015', async () => {
        const promise = mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['fesm2015'],
          async: true,
        });

        expect(promise).toEqual(jasmine.any(Promise));
        await promise;
      });

      it('should reject, if some of the entry-points are unprocessable', async () => {
        const createEntryPoint = (name: string, prop: EntryPointJsonProperty): TestFile[] => {
          return [
            {
              name: _(`/dist/${name}/package.json`),
              contents: `{"name": "${name}", "typings": "./index.d.ts", "${prop}": "./index.js"}`,
            },
            {name: _(`/dist/${name}/index.js`), contents: 'var DUMMY_DATA = true;'},
            {name: _(`/dist/${name}/index.d.ts`), contents: 'export type DummyData = boolean;'},
            {name: _(`/dist/${name}/index.metadata.json`), contents: 'DUMMY DATA'},
          ];
        };

        loadTestFiles([
          ...createEntryPoint('processable-1', 'es2015'),
          ...createEntryPoint('unprocessable-2', 'main'),
          ...createEntryPoint('unprocessable-3', 'main'),
        ]);

        const promise = mainNgcc({
          basePath: '/dist',
          propertiesToConsider: ['es2015', 'fesm5', 'module'],
          logger: new MockLogger(),
          async: true,
        });

        await promise.then(
            () => Promise.reject('Expected promise to be rejected.'),
            err => expect(err).toEqual(new Error(
                'Unable to process any formats for the following entry-points (tried es2015, fesm5, module): \n' +
                `  - ${_('/dist/unprocessable-2')}\n` +
                `  - ${_('/dist/unprocessable-3')}`)));
      });

      it('should reject, if an error happens during processing', async () => {
        spyOn(Transformer.prototype, 'transform').and.throwError('Test error.');

        const promise = mainNgcc({
          basePath: '/dist',
          targetEntryPointPath: 'local-package',
          propertiesToConsider: ['main', 'es2015'],
          logger: new MockLogger(),
          async: true,
        });

        await promise.then(
            () => Promise.reject('Expected promise to be rejected.'),
            err => expect(err).toEqual(new Error('Test error.')));

        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toBeUndefined();
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toBeUndefined();
      });
    });

    describe('with targetEntryPointPath', () => {
      it('should only compile the given package entry-point (and its dependencies).', () => {
        mainNgcc({basePath: '/node_modules', targetEntryPointPath: '@angular/common/http/testing'});
        expect(loadPackage('@angular/common/http/testing').__processed_by_ivy_ngcc__)
            .toEqual(STANDARD_MARKERS);
        // * `common/http` is a dependency of `common/http/testing`, so is compiled.
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__)
            .toEqual(STANDARD_MARKERS);
        // * `core` is a dependency of `common/http`, so is compiled.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual(STANDARD_MARKERS);
        // * `common` is a private (only in .js not .d.ts) dependency so is compiled.
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual(STANDARD_MARKERS);
        // * `common/testing` is not a dependency so is not compiled.
        expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toBeUndefined();
      });

      it('should not mark a non-Angular package as processed if it is the target', () => {
        mainNgcc({basePath: '/node_modules', targetEntryPointPath: 'test-package'});

        // * `test-package` has no Angular and is not marked as processed.
        expect(loadPackage('test-package').__processed_by_ivy_ngcc__).toBeUndefined();

        // * `core` is a dependency of `test-package`, but it is also not processed, since
        // `test-package` was not processed.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toBeUndefined();
      });

      it('should not mark a non-Angular package as processed if it is a dependency', () => {
        // `test-package-user` is a valid Angular package that depends upon `test-package`.
        loadTestFiles([
          {
            name: _('/node_modules/test-package-user/package.json'),
            contents:
                '{"name": "test-package-user", "es2015": "./index.js", "typings": "./index.d.ts"}'
          },
          {
            name: _('/node_modules/test-package-user/index.js'),
            contents: 'import * as x from \'test-package\';'
          },
          {
            name: _('/node_modules/test-package-user/index.d.ts'),
            contents: 'import * as x from \'test-package\';'
          },
          {name: _('/node_modules/test-package-user/index.metadata.json'), contents: 'DUMMY DATA'},
        ]);

        mainNgcc({basePath: '/node_modules', targetEntryPointPath: 'test-package-user'});

        // * `test-package-user` is processed because it is compiled by Angular
        expect(loadPackage('test-package-user').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });

        // * `test-package` is a dependency of `test-package-user` but has not been compiled by
        // Angular, and so is not marked as processed
        expect(loadPackage('test-package').__processed_by_ivy_ngcc__).toBeUndefined();

        // * `core` is a dependency of `test-package`, but it is not processed, because
        // `test-package` was not processed.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toBeUndefined();
      });

      it('should report an error if a dependency of the target does not exist', () => {
        expect(() => {
          mainNgcc({basePath: '/node_modules', targetEntryPointPath: 'invalid-package'});
        })
            .toThrowError(
                'The target entry-point "invalid-package" has missing dependencies:\n - @angular/missing\n');
      });
    });

    describe('early skipping of target entry-point', () => {
      describe('[compileAllFormats === true]', () => {
        it('should skip all processing if all the properties are marked as processed', () => {
          const logger = new MockLogger();
          markPropertiesAsProcessed('@angular/common/http/testing', SUPPORTED_FORMAT_PROPERTIES);
          mainNgcc({
            basePath: '/node_modules',
            targetEntryPointPath: '@angular/common/http/testing',
            logger,
          });
          expect(logger.logs.debug).toContain([
            'The target entry-point has already been processed'
          ]);
        });

        it('should process the target if any `propertyToConsider` is not marked as processed',
           () => {
             const logger = new MockLogger();
             markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015', 'fesm2015']);
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: '@angular/common/http/testing',
               propertiesToConsider: ['fesm2015', 'main', 'esm2015'],
               logger,
             });
             expect(logger.logs.debug).not.toContain([
               'The target entry-point has already been processed'
             ]);
           });
      });

      describe('[compileAllFormats === false]', () => {
        it('should process the target if the first matching `propertyToConsider` is not marked as processed',
           () => {
             const logger = new MockLogger();
             markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015']);
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: '@angular/common/http/testing',
               propertiesToConsider: ['main', 'esm2015'],
               compileAllFormats: false,
               logger,
             });

             expect(logger.logs.debug).not.toContain([
               'The target entry-point has already been processed'
             ]);
           });

        it('should skip all processing if the first matching `propertyToConsider` is marked as processed',
           () => {
             const logger = new MockLogger();
             markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015']);
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: '@angular/common/http/testing',
               // Simulate a property that does not exist on the package.json and will be ignored.
               propertiesToConsider: ['missing', 'esm2015', 'esm5'],
               compileAllFormats: false,
               logger,
             });

             expect(logger.logs.debug).toContain([
               'The target entry-point has already been processed'
             ]);
           });
      });

      it('should skip all processing if the first matching `propertyToConsider` is marked as processed',
         () => {
           const logger = new MockLogger();
           markPropertiesAsProcessed('@angular/common/http/testing', ['esm2015']);
           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: '@angular/common/http/testing',
             // Simulate a property that does not exist on the package.json and will be ignored.
             propertiesToConsider: ['missing', 'esm2015', 'esm5'],
             compileAllFormats: false,
             logger,
           });

           expect(logger.logs.debug).toContain([
             'The target entry-point has already been processed'
           ]);
         });
    });

    function markPropertiesAsProcessed(packagePath: string, properties: EntryPointJsonProperty[]) {
      const basePath = _('/node_modules');
      const targetPackageJsonPath = fs.join(basePath, packagePath, 'package.json');
      const targetPackage = loadPackage(packagePath);
      markAsProcessed(
          pkgJsonUpdater, targetPackage, targetPackageJsonPath, ['typings', ...properties]);
    }

    describe('with findEntryPointsFromTsConfigProgram', () => {
      it('should only compile the package entry-points (and their dependencies) reachable from the program in tsconfig.json.',
         () => {
           mainNgcc({basePath: '/node_modules', findEntryPointsFromTsConfigProgram: true});
           // * `common/testing` is a dependency of `./y`, so is compiled.
           expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__)
               .toEqual(STANDARD_MARKERS);
           // * `common/http` is a dependency of `./x`, so is compiled.
           expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__)
               .toEqual(STANDARD_MARKERS);
           // * `core` is a dependency of `common/http`, so is compiled.
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual(STANDARD_MARKERS);
           // * `common` is a private (only in .js not .d.ts) dependency so is compiled.
           expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__)
               .toEqual(STANDARD_MARKERS);
           // * `common/http/testing` is not a dependency of the program so is not compiled.
           expect(loadPackage('@angular/common/http/testing').__processed_by_ivy_ngcc__)
               .toBeUndefined();
         });
    });

    it('should clean up outdated artifacts', () => {
      compileIntoFlatEs2015Package('test-package', {
        'index.ts': `
        import {Directive} from '@angular/core';

        @Directive({selector: '[foo]'})
        export class FooDirective {
        }
      `,
      });
      mainNgcc({
        basePath: '/node_modules',
        propertiesToConsider: ['esm2015'],
        logger: new MockLogger(),
      });

      // Now hack the files to look like it was processed by an outdated version of ngcc
      const packageJson = loadPackage('test-package', _('/node_modules'));
      packageJson.__processed_by_ivy_ngcc__!.typings = '8.0.0';
      packageJson.main_ivy_ngcc = '__ivy_ngcc__/main.js';
      fs.writeFile(_('/node_modules/test-package/package.json'), JSON.stringify(packageJson));
      fs.writeFile(_('/node_modules/test-package/x.js'), 'processed content');
      fs.writeFile(_('/node_modules/test-package/x.js.__ivy_ngcc_bak'), 'original content');
      fs.ensureDir(_('/node_modules/test-package/__ivy_ngcc__/foo'));

      // Now run ngcc again to see that it cleans out the outdated artifacts
      mainNgcc({
        basePath: '/node_modules',
        propertiesToConsider: ['esm2015'],
        logger: new MockLogger(),
      });
      const newPackageJson = loadPackage('test-package', _('/node_modules'));
      expect(newPackageJson.__processed_by_ivy_ngcc__).toEqual({
        esm2015: '0.0.0-PLACEHOLDER',
        typings: '0.0.0-PLACEHOLDER',
      });
      expect(newPackageJson.module_ivy_ngcc).toBeUndefined();
      expect(fs.exists(_('/node_modules/test-package/x.js'))).toBe(true);
      expect(fs.exists(_('/node_modules/test-package/x.js.__ivy_ngcc_bak'))).toBe(false);
      expect(fs.readFile(_('/node_modules/test-package/x.js'))).toEqual('original content');
      expect(fs.exists(_('/node_modules/test-package/__ivy_ngcc__'))).toBe(false);
    });


    describe('with propertiesToConsider', () => {
      it('should complain if none of the properties in the `propertiesToConsider` list is supported',
         () => {
           const propertiesToConsider = ['es1337', 'fesm42'];
           const errorMessage =
               'No supported format property to consider among [es1337, fesm42]. Supported ' +
               'properties: fesm2015, fesm5, es2015, esm2015, esm5, main, module, browser';

           expect(() => mainNgcc({basePath: '/node_modules', propertiesToConsider}))
               .toThrowError(errorMessage);
         });

      it('should only compile the entry-point formats given in the `propertiesToConsider` list',
         () => {
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['main', 'module'],
             logger: new MockLogger(),
           });

           // The ES2015 formats are not compiled as they are not in `propertiesToConsider`.
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             main: '0.0.0-PLACEHOLDER',
             // `module` and `es2015` are aliases of `fesm2015`.
             module: '0.0.0-PLACEHOLDER',
             es2015: '0.0.0-PLACEHOLDER',
             fesm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
             main: '0.0.0-PLACEHOLDER',
             // `module` and `es2015` are aliases of `fesm2015`.
             module: '0.0.0-PLACEHOLDER',
             es2015: '0.0.0-PLACEHOLDER',
             fesm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toEqual({
             main: '0.0.0-PLACEHOLDER',
             // `module` and `es2015` are aliases for `fesm2015`.
             module: '0.0.0-PLACEHOLDER',
             es2015: '0.0.0-PLACEHOLDER',
             fesm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
             main: '0.0.0-PLACEHOLDER',
             // `module` and `es2015` are aliases for `fesm2015`.
             module: '0.0.0-PLACEHOLDER',
             es2015: '0.0.0-PLACEHOLDER',
             fesm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
         });

      it('should mark all matching properties as processed in order not to compile them on a subsequent run',
         () => {
           const logger = new MockLogger();
           const logs = logger.logs.debug;

           // `fesm2015` and `es2015` map to the same file: `./fesm2015/common.js`
           mainNgcc({
             basePath: '/node_modules/@angular/common',
             propertiesToConsider: ['fesm2015'],
             logger,
           });

           expect(logs).not.toContain(['Skipping @angular/common : es2015 (already compiled).']);
           expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
             // `module` and `es2015` are aliases of `fesm2015`.
             module: '0.0.0-PLACEHOLDER',
             es2015: '0.0.0-PLACEHOLDER',
             fesm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });

           // Now, compiling `es2015` should be a no-op.
           mainNgcc({
             basePath: '/node_modules/@angular/common',
             propertiesToConsider: ['es2015'],
             logger,
           });

           expect(logs).toContain(['Skipping @angular/common : es2015 (already compiled).']);
         });
    });

    describe('with compileAllFormats set to false', () => {
      it('should only compile the first matching format', () => {
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['module', 'fesm2015', 'main'],
          compileAllFormats: false,
          logger: new MockLogger(),
        });
        // * In the Angular packages fesm2015, module and `es2015` have the same
        //   underlying format, so both are marked as compiled.
        // * The `main` is not compiled because we stopped after the `fesm2015` format.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          fesm2015: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
          fesm2015: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toEqual({
          fesm2015: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
          fesm2015: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });

      it('should cope with compiling the same entry-point multiple times with different formats',
         () => {
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['main'],
             compileAllFormats: false,
             logger: new MockLogger(),

           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             main: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           // If ngcc tries to write out the typings files again, this will throw an exception.
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['esm2015'],
             compileAllFormats: false,
             logger: new MockLogger(),
           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             main: '0.0.0-PLACEHOLDER',
             esm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
         });
    });

    describe('with typingsOnly set to true', () => {
      it('should only compile the typings', () => {
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['module', 'fesm2015', 'main'],
          typingsOnly: true,
          compileAllFormats: true,
          logger: new MockLogger(),
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common/testing').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });

        // Doesn't touch original source files
        expect(fs.readFile(_(`/node_modules/@angular/common/esm2015/src/common_module.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        // Or create a backup of the original
        expect(fs.exists(
                   _(`/node_modules/@angular/common/esm2015/src/common_module.js.__ivy_ngcc_bak`)))
            .toBe(false);

        // Overwrites .d.ts files
        expect(fs.readFile(_(`/node_modules/@angular/common/common.d.ts`)))
            .toMatch(ANGULAR_CORE_IMPORT_REGEX);
        // And makes a backup
        expect(fs.exists(_(`/node_modules/@angular/common/common.d.ts.__ivy_ngcc_bak`))).toBe(true);
      });

      it('should not compile anything when typings have already been processed', () => {
        let logger = new MockLogger();
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015'],
          targetEntryPointPath: '@angular/core',
          typingsOnly: true,
          logger,
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(fs.readFile(_(`/node_modules/@angular/core/esm2015/src/application_init.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        expect(logger.logs.debug).toContain(['  Successfully compiled @angular/core : esm2015']);

        // Try to process the typings for @angular/core again, now using a different format
        // property, to verify that it does not process the entry-point again and that the JS
        // files are still untouched.
        logger = new MockLogger();
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['main'],
          targetEntryPointPath: '@angular/core',
          typingsOnly: true,
          logger,
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(fs.readFile(_(`/node_modules/@angular/core/esm2015/src/application_init.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        expect(logger.logs.debug).toContain([
          'Skipping @angular/core : typings have already been processed.'
        ]);

        // Now also process the typings for @angular/common to verify that its dependency on
        // @angular/core, which has already been processed and will therefore be skipped, is able
        // to succeed.
        logger = new MockLogger();
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015'],
          targetEntryPointPath: '@angular/common',
          typingsOnly: true,
          logger,
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(fs.readFile(_(`/node_modules/@angular/core/esm2015/src/application_init.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        expect(fs.readFile(_(`/node_modules/@angular/common/esm2015/src/common_module.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        expect(logger.logs.debug).toContain([
          'Skipping @angular/core : typings have already been processed.'
        ]);
        expect(logger.logs.debug).toContain(['  Successfully compiled @angular/common : esm2015']);
      });

      it('should cope with compiling the same entry-point multiple times with different formats',
         () => {
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['main'],
             typingsOnly: true,
             logger: new MockLogger(),
           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             typings: '0.0.0-PLACEHOLDER',
           });

           // If ngcc tries to write out the typings files again, this will throw an exception.
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['esm2015'],
             typingsOnly: true,
             logger: new MockLogger(),
           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             typings: '0.0.0-PLACEHOLDER',
           });
         });

      it('should cope with compiling typings only followed by javascript formats', () => {
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015', 'main'],
          typingsOnly: true,
          logger: new MockLogger(),
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          typings: '0.0.0-PLACEHOLDER',
        });

        // If ngcc tries to write out the typings files again, this will throw an exception.
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015', 'main'],
          logger: new MockLogger(),
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          main: '0.0.0-PLACEHOLDER',
          esm2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });
    });

    describe('with createNewEntryPointFormats', () => {
      it('should create new files rather than overwriting the originals', () => {
        mainNgcc({
          basePath: '/node_modules',
          createNewEntryPointFormats: true,
          propertiesToConsider: ['esm2015'],
          logger: new MockLogger(),
        });

        // Updates the package.json
        expect(loadPackage('@angular/common').esm2015).toEqual('./esm2015/common.js');
        expect((loadPackage('@angular/common') as any).esm2015_ivy_ngcc)
            .toEqual('__ivy_ngcc__/esm2015/common.js');

        // Doesn't touch original files
        expect(fs.readFile(_(`/node_modules/@angular/common/esm2015/src/common_module.js`)))
            .not.toMatch(ANGULAR_CORE_IMPORT_REGEX);
        // Or create a backup of the original
        expect(fs.exists(
                   _(`/node_modules/@angular/common/esm2015/src/common_module.js.__ivy_ngcc_bak`)))
            .toBe(false);

        // Creates new files
        expect(fs.readFile(
                   _(`/node_modules/@angular/common/__ivy_ngcc__/esm2015/src/common_module.js`)))
            .toMatch(ANGULAR_CORE_IMPORT_REGEX);

        // Copies over files (unchanged) that did not need compiling
        expect(fs.exists(_(`/node_modules/@angular/common/__ivy_ngcc__/esm2015/src/version.js`)))
            .toBeTrue();
        expect(fs.readFile(_(`/node_modules/@angular/common/__ivy_ngcc__/esm2015/src/version.js`)))
            .toEqual(fs.readFile(_(`/node_modules/@angular/common/esm2015/src/version.js`)));

        // Overwrites .d.ts files (as usual)
        expect(fs.readFile(_(`/node_modules/@angular/common/common.d.ts`)))
            .toMatch(ANGULAR_CORE_IMPORT_REGEX);
        expect(fs.exists(_(`/node_modules/@angular/common/common.d.ts.__ivy_ngcc_bak`))).toBe(true);
      });

      it('should update `package.json` for all matching format properties', () => {
        mainNgcc({
          basePath: '/node_modules/@angular/core',
          createNewEntryPointFormats: true,
          propertiesToConsider: ['fesm2015', 'main'],
        });

        const pkg: any = loadPackage('@angular/core');

        // `es2015` and `module` are aliases of `fesm2015`.
        expect(pkg.fesm2015).toEqual('./fesm2015/core.js');
        expect(pkg.es2015).toEqual('./fesm2015/core.js');
        expect(pkg.module).toEqual('./fesm2015/core.js');
        expect(pkg.fesm2015_ivy_ngcc).toEqual('__ivy_ngcc__/fesm2015/core.js');
        expect(pkg.es2015_ivy_ngcc).toEqual('__ivy_ngcc__/fesm2015/core.js');
        expect(pkg.module_ivy_ngcc).toEqual('__ivy_ngcc__/fesm2015/core.js');

        expect(pkg.main).toEqual('./bundles/core.umd.js');
        expect(pkg.main_ivy_ngcc).toEqual('__ivy_ngcc__/bundles/core.umd.js');
      });

      it('should update `package.json` deterministically (regardless of entry-point processing order)',
         () => {
           // Ensure formats are not marked as processed in `package.json` at the beginning.
           let pkg = loadPackage('@angular/core');
           expectNotToHaveProp(pkg, 'main_ivy_ngcc');
           expectNotToHaveProp(pkg, 'esm2015_ivy_ngcc');
           expectNotToHaveProp(pkg, 'fesm2015_ivy_ngcc');
           expectNotToHaveProp(pkg, 'module_ivy_ngcc');
           expectNotToHaveProp(pkg, '__processed_by_ivy_ngcc__');

           // Process `fesm2015` and update `package.json`.
           pkg = processFormatAndUpdatePackageJson('fesm2015');
           expectNotToHaveProp(pkg, 'main_ivy_ngcc');
           expectNotToHaveProp(pkg, 'esm2015_ivy_ngcc');
           expectToHaveProp(pkg, 'fesm2015_ivy_ngcc');
           expectToHaveProp(pkg, 'module_ivy_ngcc');
           expectToHaveProp(pkg.__processed_by_ivy_ngcc__!, 'fesm2015');

           // Process `esm2015` and update `package.json`.
           pkg = processFormatAndUpdatePackageJson('esm2015');
           expectNotToHaveProp(pkg, 'main_ivy_ngcc');
           expectToHaveProp(pkg, 'esm2015_ivy_ngcc');
           expectToHaveProp(pkg, 'fesm2015_ivy_ngcc');
           expectToHaveProp(pkg, 'module_ivy_ngcc');
           expectToHaveProp(pkg.__processed_by_ivy_ngcc__!, 'esm2015');

           // Process `main` and update `package.json`.
           pkg = processFormatAndUpdatePackageJson('main');
           expectToHaveProp(pkg, 'main_ivy_ngcc');
           expectToHaveProp(pkg, 'esm2015_ivy_ngcc');
           expectToHaveProp(pkg, 'fesm2015_ivy_ngcc');
           expectToHaveProp(pkg, 'module_ivy_ngcc');
           expectToHaveProp(pkg.__processed_by_ivy_ngcc__!, 'main');

           // Ensure the properties are in deterministic order (regardless of processing order).
           const pkgKeys = stringifyKeys(pkg);
           expect(pkgKeys).toContain('|main_ivy_ngcc|main|');
           expect(pkgKeys).toContain('|fesm2015_ivy_ngcc|fesm2015|');
           expect(pkgKeys).toContain('|esm2015_ivy_ngcc|esm2015|');

           // NOTE:
           // Along with the first format that is processed, the typings are processed as well.
           // Also, once a property has been processed, alias properties as also marked as
           // processed. Aliases properties are properties that point to the same entry-point file.
           // For example:
           // - `fesm2015` <=> `module <=> es2015`
           expect(stringifyKeys(pkg.__processed_by_ivy_ngcc__!))
               .toBe('|es2015|esm2015|fesm2015|main|module|typings|');

           // Helpers
           function expectNotToHaveProp(obj: object, prop: string) {
             expect(obj.hasOwnProperty(prop))
                 .toBe(
                     false,
                     `Expected object not to have property '${prop}': ${
                         JSON.stringify(obj, null, 2)}`);
           }

           function expectToHaveProp(obj: object, prop: string) {
             expect(obj.hasOwnProperty(prop))
                 .toBe(
                     true,
                     `Expected object to have property '${prop}': ${JSON.stringify(obj, null, 2)}`);
           }

           function processFormatAndUpdatePackageJson(formatProp: string) {
             mainNgcc({
               basePath: '/node_modules/@angular/core',
               createNewEntryPointFormats: true,
               propertiesToConsider: [formatProp],
             });
             return loadPackage('@angular/core');
           }

           function stringifyKeys(obj: object) {
             return `|${Object.keys(obj).join('|')}|`;
           }
         });
    });

    describe('with ignoreEntryPointManifest', () => {
      it('should not read the entry-point manifest file', () => {
        // Ensure there is a lock-file. Otherwise the manifest will not be written
        fs.writeFile(_('/yarn.lock'), 'DUMMY YARN LOCK FILE');
        // Populate the manifest file
        mainNgcc(
            {basePath: '/node_modules', propertiesToConsider: ['main'], logger: new MockLogger()});
        // Check that common/testing ES5 was processed
        let commonTesting =
            JSON.parse(fs.readFile(_('/node_modules/@angular/common/testing/package.json'))) as
            EntryPointPackageJson;
        expect(hasBeenProcessed(commonTesting, 'main')).toBe(true);
        expect(hasBeenProcessed(commonTesting, 'esm2015')).toBe(false);
        // Modify the manifest to test that is has no effect
        let manifest = JSON.parse(fs.readFile(_('/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        manifest.entryPointPaths =
            manifest.entryPointPaths.filter(paths => paths[1] !== '@angular/common/testing');
        fs.writeFile(_('/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifest));
        // Now run ngcc again ignoring this manifest but trying to process ES2015, which are not yet
        // processed.
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015'],
          logger: new MockLogger(),
          invalidateEntryPointManifest: true,
        });
        // Check that common/testing ES2015 is now processed, despite the manifest not listing it
        commonTesting =
            JSON.parse(fs.readFile(_('/node_modules/@angular/common/testing/package.json'))) as
            EntryPointPackageJson;
        expect(hasBeenProcessed(commonTesting, 'main')).toBe(true);
        expect(hasBeenProcessed(commonTesting, 'esm2015')).toBe(true);
        // Check that the newly computed manifest has written to disk, containing the path that we
        // had removed earlier.
        manifest = JSON.parse(fs.readFile(_('/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        expect(manifest.entryPointPaths).toContain([
          '@angular/common',
          '@angular/common/testing',
          [
            _('/node_modules/@angular/core'), _('/node_modules/@angular/common'),
            _('/node_modules/rxjs')
          ],
        ]);
      });
    });

    describe('diagnostics', () => {
      it('should fail with formatted diagnostics when an error diagnostic is produced, if targetEntryPointPath is provided',
         () => {
           loadTestFiles([
             {
               name: _('/node_modules/fatal-error/package.json'),
               contents:
                   '{"name": "fatal-error", "es2015": "./index.js", "typings": "./index.d.ts"}',
             },
             {name: _('/node_modules/fatal-error/index.metadata.json'), contents: 'DUMMY DATA'},
             {
               name: _('/node_modules/fatal-error/index.js'),
               contents: `
              import {Component} from '@angular/core';
              export class FatalError {}
              FatalError.decorators = [
                {type: Component, args: [{selector: 'fatal-error'}]}
              ];
            `,
             },
             {
               name: _('/node_modules/fatal-error/index.d.ts'),
               contents: `
              export declare class FatalError {}
            `,
             },
           ]);

           try {
             mainNgcc({
               basePath: '/node_modules',
               targetEntryPointPath: 'fatal-error',
               propertiesToConsider: ['es2015']
             });
             fail('should have thrown');
           } catch (e) {
             expect(e.message).toContain(
                 'Failed to compile entry-point fatal-error (`es2015` as esm2015) due to compilation errors:');
             expect(e.message).toContain('NG2001');
             expect(e.message).toContain('component is missing a template');
           }
         });

      it('should not fail but log an error with formatted diagnostics when an error diagnostic is produced, if targetEntryPoint is not provided and errorOnFailedEntryPoint is false',
         () => {
           loadTestFiles([
             {
               name: _('/node_modules/fatal-error/package.json'),
               contents:
                   '{"name": "fatal-error", "es2015": "./index.js", "typings": "./index.d.ts"}',
             },
             {name: _('/node_modules/fatal-error/index.metadata.json'), contents: 'DUMMY DATA'},
             {
               name: _('/node_modules/fatal-error/index.js'),
               contents: `
             import {Component} from '@angular/core';
             export class FatalError {}
             FatalError.decorators = [
               {type: Component, args: [{selector: 'fatal-error'}]}
             ];`,
             },
             {
               name: _('/node_modules/fatal-error/index.d.ts'),
               contents: `export declare class FatalError {}`,
             },
             {
               name: _('/node_modules/dependent/package.json'),
               contents: '{"name": "dependent", "es2015": "./index.js", "typings": "./index.d.ts"}',
             },
             {name: _('/node_modules/dependent/index.metadata.json'), contents: 'DUMMY DATA'},
             {
               name: _('/node_modules/dependent/index.js'),
               contents: `
             import {Component} from '@angular/core';
             import {FatalError} from 'fatal-error';
             export class Dependent {}
             Dependent.decorators = [
               {type: Component, args: [{selector: 'dependent', template: ''}]}
             ];`,
             },
             {
               name: _('/node_modules/dependent/index.d.ts'),
               contents: `export declare class Dependent {}`,
             },
             {
               name: _('/node_modules/independent/package.json'),
               contents:
                   '{"name": "independent", "es2015": "./index.js", "typings": "./index.d.ts"}',
             },
             {name: _('/node_modules/independent/index.metadata.json'), contents: 'DUMMY DATA'},
             {
               name: _('/node_modules/independent/index.js'),
               contents: `
             import {Component} from '@angular/core';
             export class Independent {}
             Independent.decorators = [
               {type: Component, args: [{selector: 'independent', template: ''}]}
             ];`,
             },
             {
               name: _('/node_modules/independent/index.d.ts'),
               contents: `export declare class Independent {}`,
             },
           ]);

           const logger = new MockLogger();
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['es2015'],
             errorOnFailedEntryPoint: false,
             logger,
           });
           expect(logger.logs.error.length).toEqual(1);
           const message = logger.logs.error[0][0];
           expect(message).toContain(
               'Failed to compile entry-point fatal-error (`es2015` as esm2015) due to compilation errors:');
           expect(message).toContain('NG2001');
           expect(message).toContain('component is missing a template');

           expect(hasBeenProcessed(loadPackage('fatal-error', _('/node_modules')), 'es2015'))
               .toBe(false);
           expect(hasBeenProcessed(loadPackage('dependent', _('/node_modules')), 'es2015'))
               .toBe(false);
           expect(hasBeenProcessed(loadPackage('independent', _('/node_modules')), 'es2015'))
               .toBe(true);
         });
    });

    describe('logger', () => {
      it('should log info message to the console by default', () => {
        const consoleInfoSpy = spyOn(console, 'info');
        mainNgcc({basePath: '/node_modules', propertiesToConsider: ['esm2015']});
        expect(consoleInfoSpy)
            .toHaveBeenCalledWith('Compiling @angular/common/http : esm2015 as esm2015');
      });

      it('should use a custom logger if provided', () => {
        const logger = new MockLogger();
        mainNgcc({
          basePath: '/node_modules',
          propertiesToConsider: ['esm2015'],
          logger,
        });
        expect(logger.logs.info).toContain(['Compiling @angular/common/http : esm2015 as esm2015']);
      });
    });

    describe('with pathMappings', () => {
      it('should infer the @app pathMapping from a local tsconfig.json path', () => {
        fs.writeFile(
            _('/tsconfig.json'),
            JSON.stringify({compilerOptions: {paths: {'@app/*': ['dist/*']}, baseUrl: './'}}));
        const logger = new MockLogger();
        mainNgcc({basePath: '/dist', propertiesToConsider: ['es2015'], logger});
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('local-package-2', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        // The local-package-3 and local-package-4 will not be processed because there is no path
        // mappings for `@x` and plain local imports.
        expect(loadPackage('local-package-3', _('/dist')).__processed_by_ivy_ngcc__)
            .toBeUndefined();
        expect(logger.logs.debug).toContain([
          `Invalid entry-point ${_('/dist/local-package-3')}.`,
          'It is missing required dependencies:\n - @x/local-package'
        ]);
        expect(loadPackage('local-package-4', _('/dist')).__processed_by_ivy_ngcc__)
            .toBeUndefined();
        expect(logger.logs.debug).toContain([
          `Invalid entry-point ${_('/dist/local-package-4')}.`,
          'It is missing required dependencies:\n - local-package'
        ]);
      });

      it('should read the @x pathMapping from a specified tsconfig.json path', () => {
        fs.writeFile(
            _('/tsconfig.app.json'),
            JSON.stringify({compilerOptions: {paths: {'@x/*': ['dist/*']}, baseUrl: './'}}));
        const logger = new MockLogger();
        mainNgcc({
          basePath: '/dist',
          propertiesToConsider: ['es2015'],
          tsConfigPath: _('/tsconfig.app.json'),
          logger
        });
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('local-package-3', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        // The local-package-2 and local-package-4 will not be processed because there is no path
        // mappings for `@app` and plain local imports.
        expect(loadPackage('local-package-2', _('/dist')).__processed_by_ivy_ngcc__)
            .toBeUndefined();
        expect(logger.logs.debug).toContain([
          `Invalid entry-point ${_('/dist/local-package-2')}.`,
          'It is missing required dependencies:\n - @app/local-package'
        ]);
        expect(loadPackage('local-package-4', _('/dist')).__processed_by_ivy_ngcc__)
            .toBeUndefined();
        expect(logger.logs.debug).toContain([
          `Invalid entry-point ${_('/dist/local-package-4')}.`,
          'It is missing required dependencies:\n - local-package'
        ]);
      });

      it('should use the explicit `pathMappings`, ignoring the local tsconfig.json settings',
         () => {
           const logger = new MockLogger();
           fs.writeFile(
               _('/tsconfig.json'),
               JSON.stringify({compilerOptions: {paths: {'@app/*': ['dist/*']}, baseUrl: './'}}));
           mainNgcc({
             basePath: '/node_modules',
             propertiesToConsider: ['es2015'],
             pathMappings: {paths: {'*': ['dist/*']}, baseUrl: '/'},
             logger
           });
           expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
             // `module` and `es2015` are aliases for `fesm2015`.
             module: '0.0.0-PLACEHOLDER',
             es2015: '0.0.0-PLACEHOLDER',
             fesm2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
             es2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           expect(loadPackage('local-package-4', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
             es2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           // The local-package-2 and local-package-3 will not be processed because there is no path
           // mappings for `@app` and `@x` local imports.
           expect(loadPackage('local-package-2', _('/dist')).__processed_by_ivy_ngcc__)
               .toBeUndefined();
           expect(logger.logs.debug).toContain([
             `Invalid entry-point ${_('/dist/local-package-2')}.`,
             'It is missing required dependencies:\n - @app/local-package'
           ]);
           expect(loadPackage('local-package-3', _('/dist')).__processed_by_ivy_ngcc__)
               .toBeUndefined();
           expect(logger.logs.debug).toContain([
             `Invalid entry-point ${_('/dist/local-package-3')}.`,
             'It is missing required dependencies:\n - @x/local-package'
           ]);
         });

      it('should not use pathMappings from a local tsconfig.json path if tsConfigPath is null',
         () => {
           const logger = new MockLogger();
           fs.writeFile(
               _('/tsconfig.json'),
               JSON.stringify({compilerOptions: {paths: {'@app/*': ['dist/*']}, baseUrl: './'}}));
           mainNgcc({
             basePath: '/dist',
             propertiesToConsider: ['es2015'],
             tsConfigPath: null,
             logger,
           });
           expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
             es2015: '0.0.0-PLACEHOLDER',
             typings: '0.0.0-PLACEHOLDER',
           });
           // Since the tsconfig is not loaded, the `@app/local-package` import in `local-package-2`
           // is not path-mapped correctly, and so it fails to be processed.
           expect(loadPackage('local-package-2', _('/dist')).__processed_by_ivy_ngcc__)
               .toBeUndefined();
           expect(logger.logs.debug).toContain([
             `Invalid entry-point ${_('/dist/local-package-2')}.`,
             'It is missing required dependencies:\n - @app/local-package'
           ]);
         });
    });

    describe('whitespace preservation', () => {
      it('should default not to preserve whitespace', () => {
        mainNgcc({basePath: '/dist', propertiesToConsider: ['es2015']});
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(fs.readFile(_('/dist/local-package/index.js')))
            .toMatch(/ɵɵtext\(\d+, " Hello\\n"\);/);
      });

      it('should preserve whitespace if set in a loaded tsconfig.json', () => {
        fs.writeFile(
            _('/tsconfig.json'),
            JSON.stringify({angularCompilerOptions: {preserveWhitespaces: true}}));
        mainNgcc({basePath: '/dist', propertiesToConsider: ['es2015']});
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(fs.readFile(_('/dist/local-package/index.js')))
            .toMatch(/ɵɵtext\(\d+, "\\n  Hello\\n"\);/);
      });

      it('should not preserve whitespace if set to false in a loaded tsconfig.json', () => {
        fs.writeFile(
            _('/tsconfig.json'),
            JSON.stringify({angularCompilerOptions: {preserveWhitespaces: false}}));
        mainNgcc({basePath: '/dist', propertiesToConsider: ['es2015']});
        expect(loadPackage('local-package', _('/dist')).__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(fs.readFile(_('/dist/local-package/index.js')))
            .toMatch(/ɵɵtext\(\d+, " Hello\\n"\);/);
      });
    });

    describe('with Closure Compiler', () => {
      it('should give closure annotated output with annotateForClosureCompiler: true', () => {
        fs.writeFile(
            _('/tsconfig.json'),
            JSON.stringify({angularCompilerOptions: {annotateForClosureCompiler: true}}));
        mainNgcc({basePath: '/dist', propertiesToConsider: ['es2015']});
        const jsContents = fs.readFile(_(`/dist/local-package/index.js`));
        expect(jsContents).toContain('/** @nocollapse */\nAppComponent.ɵcmp =');
      });
      it('should default to not give closure annotated output', () => {
        mainNgcc({basePath: '/dist', propertiesToConsider: ['es2015']});
        const jsContents = fs.readFile(_(`/dist/local-package/index.js`));
        expect(jsContents).not.toContain('@nocollapse');
      });
    });

    describe('with configuration files', () => {
      it('should process a configured deep-import as an entry-point', () => {
        loadTestFiles([
          {
            name: _('/ngcc.config.js'),
            contents: `module.exports = { packages: {
            'deep_import': {
              entryPoints: {
                './entry_point': { override: { typings: '../entry_point.d.ts', es2015: '../entry_point.js' } }
              }
            }
          }};`,
          },
          {
            name: _('/node_modules/deep_import/package.json'),
            contents: '{"name": "deep_import", "es2015": "./index.js", "typings": "./index.d.ts"}',
          },
          {
            name: _('/node_modules/deep_import/entry_point.js'),
            contents: `
              import {Component} from '@angular/core';
              @Component({selector: 'entry-point'})
              export class EntryPoint {}
            `,
          },
          {
            name: _('/node_modules/deep_import/entry_point.d.ts'),
            contents: `
              import {Component} from '@angular/core';
              @Component({selector: 'entry-point'})
              export class EntryPoint {}
            `,
          },
        ]);
        mainNgcc({
          basePath: '/node_modules',
          targetEntryPointPath: 'deep_import/entry_point',
          propertiesToConsider: ['es2015']
        });
        // The containing package is not processed
        expect(loadPackage('deep_import').__processed_by_ivy_ngcc__).toBeUndefined();
        // But the configured entry-point and its dependency (@angular/core) are processed.
        expect(loadPackage('deep_import/entry_point').__processed_by_ivy_ngcc__).toEqual({
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          module: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          fesm2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });

      it('should not process ignored entry-points', () => {
        loadTestFiles([
          {
            name: _('/ngcc.config.js'),
            contents: `
              module.exports = {
                packages: {
                  '@angular/core': {
                    entryPoints: {
                      './testing': {ignore: true},
                    },
                  },
                  '@angular/common': {
                    entryPoints: {
                      '.': {ignore: true},
                      './http': {override: {fesm2015: undefined}},
                    },
                  },
                },
              };
            `,
          },
        ]);

        mainNgcc({basePath: '/node_modules', propertiesToConsider: ['es2015']});

        // We process core but not core/testing.
        expect(loadPackage('@angular/core').__processed_by_ivy_ngcc__).toEqual({
          module: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          fesm2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
        expect(loadPackage('@angular/core/testing').__processed_by_ivy_ngcc__).toBeUndefined();

        // We do not compile common but we do compile its sub-entry-points.
        expect(loadPackage('@angular/common').__processed_by_ivy_ngcc__).toBeUndefined();
        expect(loadPackage('@angular/common/http').__processed_by_ivy_ngcc__).toEqual({
          // `fesm2015` is not processed, because the ngcc config removes it.
          // fesm2015: '0.0.0-PLACEHOLDER',
          module: '0.0.0-PLACEHOLDER',
          es2015: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });

      it('should support removing a format property by setting it to `undefined`', () => {
        loadTestFiles([
          {
            name: _('/ngcc.config.js'),
            contents: `
              module.exports = {
                packages: {
                  'test-package': {
                    entryPoints: {
                      '.': {
                        override: {
                          fesm2015: undefined,
                        },
                      },
                    },
                  },
                },
              };
            `,
          },
          {
            name: _('/node_modules/test-package/package.json'),
            contents: `
              {
                "name": "test-package",
                "fesm2015": "./index.es2015.js",
                "fesm5": "./index.es5.js",
                "typings": "./index.d.ts"
              }
            `,
          },
          {
            name: _('/node_modules/test-package/index.es5.js'),
            contents: `
              var TestService = (function () {
                function TestService() {
                }
                return TestService;
              }());
            `,
          },
          {
            name: _('/node_modules/test-package/index.d.js'),
            contents: `
              export declare class TestService {}
            `,
          },
        ]);

        mainNgcc({
          basePath: '/node_modules',
          targetEntryPointPath: 'test-package',
          propertiesToConsider: ['fesm2015', 'fesm5'],
        });

        expect(loadPackage('test-package').__processed_by_ivy_ngcc__).toEqual({
          fesm5: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });
      });
    });

    describe('undecorated child class migration', () => {
      it('should generate a directive definition with CopyDefinitionFeature for an undecorated child directive',
         () => {
           compileIntoFlatEs2015Package('test-package', {
             '/index.ts': `
              import {Directive, NgModule} from '@angular/core';

              @Directive({
                selector: '[base]',
                exportAs: 'base1, base2',
              })
              export class BaseDir {}

              export class DerivedDir extends BaseDir {}

              @NgModule({
                declarations: [DerivedDir],
              })
              export class Module {}
            `,
           });

           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: ['esm2015'],
           });


           const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
           expect(jsContents)
               .toContain(
                   'DerivedDir.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: DerivedDir, ' +
                   'selectors: [["", "base", ""]], exportAs: ["base1", "base2"], ' +
                   'features: [ɵngcc0.ɵɵInheritDefinitionFeature, ɵngcc0.ɵɵCopyDefinitionFeature] });');

           const dtsContents = fs.readFile(_(`/node_modules/test-package/index.d.ts`));
           expect(dtsContents)
               .toContain(
                   'static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<DerivedDir, "[base]", ["base1", "base2"], {}, {}, never>;');
         });

      it('should generate a component definition with CopyDefinitionFeature for an undecorated child component',
         () => {
           compileIntoFlatEs2015Package('test-package', {
             '/index.ts': `
           import {Component, NgModule} from '@angular/core';

           @Component({
             selector: '[base]',
             template: '<span>This is the base template</span>',
           })
           export class BaseCmp {}

           export class DerivedCmp extends BaseCmp {}

           @NgModule({
             declarations: [DerivedCmp],
           })
           export class Module {}
         `,
           });

           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: ['esm2015'],
           });


           const jsContents = fs.readFile(_(`/node_modules/test-package/index.js`));
           expect(jsContents).toContain('DerivedCmp.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent');
           expect(jsContents)
               .toContain(
                   'features: [ɵngcc0.ɵɵInheritDefinitionFeature, ɵngcc0.ɵɵCopyDefinitionFeature]');

           const dtsContents = fs.readFile(_(`/node_modules/test-package/index.d.ts`));
           expect(dtsContents)
               .toContain(
                   'static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<DerivedCmp, "[base]", never, {}, {}, never, never>;');
         });

      it('should generate directive definitions with CopyDefinitionFeature for undecorated child directives in a long inheritance chain',
         () => {
           compileIntoFlatEs2015Package('test-package', {
             '/index.ts': `
           import {Directive, NgModule} from '@angular/core';

           @Directive({
             selector: '[base]',
           })
           export class BaseDir {}

           export class DerivedDir1 extends BaseDir {}

           export class DerivedDir2 extends DerivedDir1 {}

           export class DerivedDir3 extends DerivedDir2 {}

           @NgModule({
             declarations: [DerivedDir3],
           })
           export class Module {}
         `,
           });

           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: ['esm2015'],
           });

           const dtsContents = fs.readFile(_(`/node_modules/test-package/index.d.ts`));
           expect(dtsContents)
               .toContain(
                   'static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<DerivedDir1, "[base]", never, {}, {}, never>;');
           expect(dtsContents)
               .toContain(
                   'static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<DerivedDir2, "[base]", never, {}, {}, never>;');
           expect(dtsContents)
               .toContain(
                   'static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<DerivedDir3, "[base]", never, {}, {}, never>;');
         });
    });

    describe('aliasing re-exports in commonjs', () => {
      it('should add re-exports to commonjs files', () => {
        loadTestFiles([
          {
            name: _('/node_modules/test-package/package.json'),
            contents: `
              {
                "name": "test-package",
                "main": "./index.js",
                "typings": "./index.d.ts"
              }
            `,
          },
          {
            name: _('/node_modules/test-package/index.js'),
            contents: `
              var __export = null;
              __export(require("./module"));
            `,
          },
          {
            name: _('/node_modules/test-package/index.d.ts'),
            contents: `
              export * from "./module";
            `,
          },
          {
            name: _('/node_modules/test-package/index.metadata.json'),
            contents: '{}',
          },
          {
            name: _('/node_modules/test-package/module.js'),
            contents: `
              var __decorate = null;
              var core_1 = require("@angular/core");
              var directive_1 = require("./directive");
              var LocalDir = /** @class */ (function () {
                  function LocalDir() {
                  }
                  LocalDir = __decorate([
                      core_1.Directive({
                          selector: '[local]',
                      })
                  ], LocalDir);
                  return LocalDir;
              }());
              var FooModule = /** @class */ (function () {
                  function FooModule() {
                  }
                  FooModule = __decorate([
                      core_1.NgModule({
                          declarations: [directive_1.Foo, LocalDir],
                          exports: [directive_1.Foo, LocalDir],
                      })
                  ], FooModule);
                  return FooModule;
              }());
              exports.LocalDir = LocalDir;
              exports.FooModule = FooModule;
            `,
          },
          {
            name: _('/node_modules/test-package/module.d.ts'),
            contents: `
              export declare class LocalDir {}
              export declare class FooModule {}
            `,
          },
          {
            name: _('/node_modules/test-package/module.metadata.json'),
            contents: '{}',
          },
          {
            name: _('/node_modules/test-package/directive.js'),
            contents: `
              var __decorate = null;
              var core_1 = require("@angular/core");
              var Foo = /** @class */ (function () {
                  function Foo() {
                  }
                  Foo = __decorate([
                      core_1.Directive({
                          selector: '[foo]',
                      })
                  ], Foo);
                  return Foo;
              }());
              exports.Foo = Foo;
            `,
          },
          {
            name: _('/node_modules/test-package/directive.d.ts'),
            contents: `
              export declare class Foo {}
            `,
          },
          {
            name: _('/node_modules/test-package/directive.metadata.json'),
            contents: '{}',
          },
          {
            name: _('/ngcc.config.js'),
            contents: `
              module.exports = {
                packages: {
                  'test-package': {
                    entryPoints: {
                      '.': {
                        generateDeepReexports: true
                      },
                    },
                  },
                },
              };
            `,
          }
        ]);

        mainNgcc({
          basePath: '/node_modules',
          targetEntryPointPath: 'test-package',
          propertiesToConsider: ['main'],
        });

        expect(loadPackage('test-package').__processed_by_ivy_ngcc__).toEqual({
          main: '0.0.0-PLACEHOLDER',
          typings: '0.0.0-PLACEHOLDER',
        });

        const jsContents = fs.readFile(_(`/node_modules/test-package/module.js`));
        const dtsContents = fs.readFile(_(`/node_modules/test-package/module.d.ts`));
        expect(jsContents).toContain(`var ɵngcc1 = require('./directive');`);
        expect(jsContents).toContain('exports.ɵngExportɵFooModuleɵFoo = ɵngcc1.Foo;');
        expect(dtsContents)
            .toContain(`export {Foo as ɵngExportɵFooModuleɵFoo} from './directive';`);
        expect(dtsContents.match(/ɵngExportɵFooModuleɵFoo/g)!.length).toBe(1);
        expect(dtsContents).not.toContain(`ɵngExportɵFooModuleɵLocalDir`);
      });
    });

    describe('legacy message ids', () => {
      it('should render legacy message ids when compiling i18n tags in component templates', () => {
        compileIntoApf('test-package', {
          '/index.ts': `
           import {Component} from '@angular/core';

           @Component({
             selector: '[base]',
             template: '<div i18n>Some message</div>'
           })
           export class AppComponent {}
         `,
        });

        mainNgcc({
          basePath: '/node_modules',
          targetEntryPointPath: 'test-package',
          propertiesToConsider: ['esm2015'],
        });


        const jsContents = fs.readFile(_(`/node_modules/test-package/esm2015/src/index.js`));
        expect(jsContents)
            .toContain(
                '$localize `:␟888aea0e46f7e9dddbd95fc1ef380a3ff70ada9d␟1812794354835616626:Some message');
      });

      it('should not render legacy message ids when compiling i18n tags in component templates if `enableI18nLegacyMessageIdFormat` is false',
         () => {
           compileIntoApf('test-package', {
             '/index.ts': `
           import {Component} from '@angular/core';

           @Component({
             selector: '[base]',
             template: '<div i18n>Some message</div>'
           })
           export class AppComponent {}
         `,
           });

           mainNgcc({
             basePath: '/node_modules',
             targetEntryPointPath: 'test-package',
             propertiesToConsider: ['esm2015'],
             enableI18nLegacyMessageIdFormat: false,
           });


           const jsContents = fs.readFile(_(`/node_modules/test-package/esm2015/src/index.js`));
           expect(jsContents).not.toContain('␟888aea0e46f7e9dddbd95fc1ef380a3ff70ada9d');
           expect(jsContents).not.toContain('␟1812794354835616626');
           expect(jsContents).not.toContain('␟');
         });
    });

    function loadPackage(
        packageName: string, basePath: AbsoluteFsPath = _('/node_modules')): EntryPointPackageJson {
      return JSON.parse(fs.readFile(fs.resolve(basePath, packageName, 'package.json'))) as
          EntryPointPackageJson;
    }

    function initMockFileSystem(fs: FileSystem, testFiles: Folder) {
      if (fs instanceof MockFileSystem) {
        fs.init(testFiles);
        fs.ensureDir(fs.dirname(getLockFilePath(fs)));
      }

      // a random test package that no metadata.json file so not compiled by Angular.
      loadTestFiles([
        {
          name: _('/node_modules/test-package/package.json'),
          contents: '{"name": "test-package", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {
          name: _('/node_modules/test-package/index.js'),
          contents:
              'import {AppModule} from "@angular/common"; export class MyApp extends AppModule {};'
        },
        {
          name: _('/node_modules/test-package/index.d.ts'),
          contents:
              'import {AppModule} from "@angular/common"; export declare class MyApp extends AppModule;'
        },
      ]);

      // Angular packages that have been built locally and stored in the `dist` directory.
      loadTestFiles([
        {
          name: _('/dist/local-package/package.json'),
          contents: '{"name": "local-package", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/local-package/index.metadata.json'), contents: 'DUMMY DATA'},
        {
          name: _('/dist/local-package/index.js'),
          contents:
              `import {Component} from '@angular/core';\nexport class AppComponent {};\nAppComponent.decorators = [\n{ type: Component, args: [{selector: 'app', template: '<h2>\\n  Hello\\n</h2>'}] }\n];`
        },
        {
          name: _('/dist/local-package/index.d.ts'),
          contents: `export declare class AppComponent {};`
        },
        // local-package-2 depends upon local-package, via an `@app` aliased import.
        {
          name: _('/dist/local-package-2/package.json'),
          contents: '{"name": "local-package-2", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/local-package-2/index.metadata.json'), contents: 'DUMMY DATA'},
        {
          name: _('/dist/local-package-2/index.js'),
          contents:
              `import {Component} from '@angular/core';\nexport {AppComponent} from '@app/local-package';`
        },
        {
          name: _('/dist/local-package-2/index.d.ts'),
          contents:
              `import {Component} from '@angular/core';\nexport {AppComponent} from '@app/local-package';`
        },
        // local-package-3 depends upon local-package, via an `@x` aliased import.
        {
          name: _('/dist/local-package-3/package.json'),
          contents: '{"name": "local-package-3", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/local-package-3/index.metadata.json'), contents: 'DUMMY DATA'},
        {
          name: _('/dist/local-package-3/index.js'),
          contents:
              `import {Component} from '@angular/core';\nexport {AppComponent} from '@x/local-package';`
        },
        {
          name: _('/dist/local-package-3/index.d.ts'),
          contents:
              `import {Component} from '@angular/core';\nexport {AppComponent} from '@x/local-package';`
        },
        // local-package-4 depends upon local-package, via a plain import.
        {
          name: _('/dist/local-package-4/package.json'),
          contents: '{"name": "local-package-", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {name: _('/dist/local-package-4/index.metadata.json'), contents: 'DUMMY DATA'},
        {
          name: _('/dist/local-package-4/index.js'),
          contents:
              `import {Component} from '@angular/core';\nexport {AppComponent} from 'local-package';`
        },
        {
          name: _('/dist/local-package-4/index.d.ts'),
          contents:
              `import {Component} from '@angular/core';\nexport {AppComponent} from 'local-package';`
        },
      ]);

      // An Angular package that has a missing dependency
      loadTestFiles([
        {
          name: _('/node_modules/invalid-package/package.json'),
          contents: '{"name": "invalid-package", "es2015": "./index.js", "typings": "./index.d.ts"}'
        },
        {
          name: _('/node_modules/invalid-package/index.js'),
          contents: `
          import {AppModule} from "@angular/missing";
          import {Component} from '@angular/core';
          export class AppComponent {};
          AppComponent.decorators = [
            { type: Component, args: [{selector: 'app', template: '<h2>Hello</h2>'}] }
          ];
          `
        },
        {
          name: _('/node_modules/invalid-package/index.d.ts'),
          contents: `export declare class AppComponent {}`
        },
        {name: _('/node_modules/invalid-package/index.metadata.json'), contents: 'DUMMY DATA'},
      ]);

      // A sample application that imports entry-points
      loadTestFiles([
        {name: _('/tsconfig.json'), contents: '{"files": ["src/index.ts"]}'},
        {name: _('/src/index.ts'), contents: `import {X} from './x';\nimport {Y} from './y';`},
        {name: _('/src/x.ts'), contents: `import '@angular/common/http';\nexport class X {}`},
        {
          name: _('/src/y.ts'),
          contents: `import * as t from '@angular/common/testing';\n export class Y {}`
        },
      ]);
    }
  });
});

function countOccurrences(haystack: string, needle: string): number {
  const matches = haystack.match(new RegExp(needle, 'g'));
  return matches !== null ? matches.length : 0;
}
