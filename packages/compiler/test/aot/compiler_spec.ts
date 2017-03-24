/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, AotCompilerOptions, GeneratedFile, createAotCompiler} from '@angular/compiler';
import {RenderComponentType, ɵReflectionCapabilities as ReflectionCapabilities, ɵreflector as reflector} from '@angular/core';
import {NodeFlags} from '@angular/core/src/view/index';
import {async} from '@angular/core/testing';
import {MetadataBundler, MetadataCollector, ModuleMetadata, privateEntriesToIndex} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {extractSourceMap, originalPositionFor} from '../output/source_map_util';

import {EmittingCompilerHost, MockAotCompilerHost, MockCompilerHost, MockData, MockDirectory, MockMetadataBundlerHost, settings} from './test_util';

const DTS = /\.d\.ts$/;

const minCoreIndex = `
  export * from './src/application_module';
  export * from './src/change_detection';
  export * from './src/metadata';
  export * from './src/di/metadata';
  export * from './src/di/injector';
  export * from './src/di/injection_token';
  export * from './src/linker';
  export * from './src/render';
  export * from './src/codegen_private_exports';
`;

describe('compiler (unbundled Angular)', () => {
  let angularFiles: Map<string, string>;

  beforeAll(() => {
    const emittingHost = new EmittingCompilerHost([], {emitMetadata: true});
    emittingHost.addScript('@angular/core/index.ts', minCoreIndex);
    const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
    emittingProgram.emit();

    angularFiles = emittingHost.written;
  });

  // Restore reflector since AoT compiler will update it with a new static reflector
  afterEach(() => { reflector.updateCapabilities(new ReflectionCapabilities()); });

  describe('Quickstart', () => {
    let host: MockCompilerHost;
    let aotHost: MockAotCompilerHost;

    beforeEach(() => {
      host = new MockCompilerHost(QUICKSTART, FILES, angularFiles);
      aotHost = new MockAotCompilerHost(host);
    });

    it('should compile',
       async(() => compile(host, aotHost, expectNoDiagnostics).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
       })));

    it('should compile using summaries',
       async(() => summaryCompile(host, aotHost).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
       })));
  });

  describe('aot source mapping', () => {
    const componentPath = '/app/app.component.ts';
    const ngComponentPath = 'ng:///app/app.component.ts'

    let rootDir: MockDirectory;
    let appDir: MockDirectory;

    beforeEach(() => {
      appDir = {
        'app.module.ts': `
              import { NgModule }      from '@angular/core';

              import { AppComponent }  from './app.component';

              @NgModule({
                declarations: [ AppComponent ],
                bootstrap:    [ AppComponent ]
              })
              export class AppModule { }
            `
      };
      rootDir = {'app': appDir};
    });

    function compileApp(): Promise<GeneratedFile> {
      return new Promise((resolve, reject) => {
        const host = new MockCompilerHost(['/app/app.module.ts'], rootDir, angularFiles);
        const aotHost = new MockAotCompilerHost(host);
        let result: GeneratedFile[];
        let error: Error;
        resolve(compile(host, aotHost, expectNoDiagnostics, expectNoDiagnostics)
                    .then(
                        (files) => files.find(
                            genFile => genFile.srcFileUrl === componentPath &&
                                genFile.genFileUrl.endsWith('.ts'))));
      });
    }

    function findLineAndColumn(
        file: string, token: string): {line: number | null, column: number | null} {
      const index = file.indexOf(token);
      if (index === -1) {
        return {line: null, column: null};
      }
      const linesUntilToken = file.slice(0, index).split('\n');
      const line = linesUntilToken.length;
      const column = linesUntilToken[linesUntilToken.length - 1].length;
      return {line, column};
    }

    function createComponentSource(componentDecorator: string) {
      return `
        import { NgModule, Component } from '@angular/core';

        @Component({
          ${componentDecorator}
        })
        export class AppComponent {
          someMethod() {}
        }
      `;
    }

    describe('inline templates', () => {
      const ngUrl = `${ngComponentPath}.AppComponent.html`;

      function templateDecorator(template: string) { return `template: \`${template}\`,`; }

      declareTests({ngUrl, templateDecorator});
    });

    describe('external templates', () => {
      const ngUrl = 'ng:///app/app.component.html';
      const templateUrl = '/app/app.component.html';

      function templateDecorator(template: string) {
        appDir['app.component.html'] = template;
        return `templateUrl: 'app.component.html',`;
      }

      declareTests({ngUrl, templateDecorator});
    });

    function declareTests({ngUrl, templateDecorator}:
                              {ngUrl: string, templateDecorator: (template: string) => string}) {
      it('should use the right source url in html parse errors', async(() => {
           appDir['app.component.ts'] =
               createComponentSource(templateDecorator('<div>\n  </error>'));

           expectPromiseToThrow(
               compileApp(), new RegExp(`Template parse errors[\\s\\S]*${ngUrl}@1:2`));
         }));

      it('should use the right source url in template parse errors', async(() => {
           appDir['app.component.ts'] = createComponentSource(
               templateDecorator('<div>\n  <div unknown="{{ctxProp}}"></div>'));

           expectPromiseToThrow(
               compileApp(), new RegExp(`Template parse errors[\\s\\S]*${ngUrl}@1:7`));
         }));

      it('should create a sourceMap for the template', async(() => {
           const template = 'Hello World!';

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           compileApp().then((genFile) => {
             const sourceMap = extractSourceMap(genFile.source) !;
             expect(sourceMap.file).toEqual(genFile.genFileUrl);

             // the generated file contains code that is not mapped to
             // the template but rather to the original source file (e.g. import statements, ...)
             const templateIndex = sourceMap.sources.indexOf(ngUrl);
             expect(sourceMap.sourcesContent[templateIndex]).toEqual(template);

             // for the mapping to the original source file we don't store the source code
             // as we want to keep whatever TypeScript / ... produced for them.
             const sourceIndex = sourceMap.sources.indexOf(ngComponentPath);
             expect(sourceMap.sourcesContent[sourceIndex]).toBe(' ');
           });
         }));

      it('should map elements correctly to the source', async(() => {
           const template = '<div>\n   <span></span></div>';

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           compileApp().then((genFile) => {
             const sourceMap = extractSourceMap(genFile.source) !;
             expect(originalPositionFor(sourceMap, findLineAndColumn(genFile.source, `'span'`)))
                 .toEqual({line: 2, column: 3, source: ngUrl});
           });
         }));

      it('should map bindings correctly to the source', async(() => {
           const template = `<div>\n   <span [title]="someMethod()"></span></div>`;

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           compileApp().then((genFile) => {
             const sourceMap = extractSourceMap(genFile.source) !;
             expect(
                 originalPositionFor(sourceMap, findLineAndColumn(genFile.source, `someMethod()`)))
                 .toEqual({line: 2, column: 9, source: ngUrl});
           });
         }));

      it('should map events correctly to the source', async(() => {
           const template = `<div>\n   <span (click)="someMethod()"></span></div>`;

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           compileApp().then((genFile) => {
             const sourceMap = extractSourceMap(genFile.source) !;
             expect(
                 originalPositionFor(sourceMap, findLineAndColumn(genFile.source, `someMethod()`)))
                 .toEqual({line: 2, column: 9, source: ngUrl});
           });
         }));

      it('should map non template parts to the source file', async(() => {
           appDir['app.component.ts'] = createComponentSource(templateDecorator('Hello World!'));

           compileApp().then((genFile) => {
             const sourceMap = extractSourceMap(genFile.source) !;
             expect(originalPositionFor(sourceMap, {line: 1, column: 0}))
                 .toEqual({line: 1, column: 0, source: ngComponentPath});
           });
         }));
    }
  });

  describe('errors', () => {
    it('should only warn if not all arguments of an @Injectable class can be resolved',
       async(() => {
         const FILES: MockData = {
           app: {
             'app.ts': `
                import {Injectable} from '@angular/core';

                @Injectable()
                export class MyService {
                  constructor(a: boolean) {}
                }
              `
           }
         };
         const host = new MockCompilerHost(['/app/app.ts'], FILES, angularFiles);
         const aotHost = new MockAotCompilerHost(host);
         const warnSpy = spyOn(console, 'warn');
         compile(host, aotHost, expectNoDiagnostics).then(() => {
           expect(warnSpy).toHaveBeenCalledWith(
               `Warning: Can't resolve all parameters for MyService in /app/app.ts: (?). This will become an error in Angular v5.x`);
         });

       }));
  });

  it('should add the preamble to generated files', async(() => {
       const FILES: MockData = {
         app: {
           'app.ts': `
              import { NgModule, Component } from '@angular/core';

              @Component({ template: '' })
              export class AppComponent {}

              @NgModule({ declarations: [ AppComponent ] })
              export class AppModule { }
            `
         }
       };
       const host = new MockCompilerHost(['/app/app.ts'], FILES, angularFiles);
       const aotHost = new MockAotCompilerHost(host);
       const genFilePreamble = '/* Hello world! */';
       compile(host, aotHost, expectNoDiagnostics, expectNoDiagnostics, {genFilePreamble})
           .then((generatedFiles) => {
             const genFile = generatedFiles.find(
                 gf => gf.srcFileUrl === '/app/app.ts' && gf.genFileUrl.endsWith('.ts'));
             expect(genFile.source.startsWith(genFilePreamble)).toBe(true);
           });

     }));

  describe('ComponentFactories', () => {
    it('should include inputs, outputs and ng-content selectors in the component factory',
       async(() => {
         const FILES: MockData = {
           app: {
             'app.ts': `
                import {Component, NgModule, Input, Output} from '@angular/core';

                @Component({
                  selector: 'my-comp',
                  template: '<ng-content></ng-content><ng-content select="child"></ng-content>'
                })
                export class MyComp {
                  @Input('aInputName')
                  aInputProp: string;

                  @Output('aOutputName')
                  aOutputProp: any;
                }

                @NgModule({
                  declarations: [MyComp]
                })
                export class MyModule {}
              `
           }
         };
         const host = new MockCompilerHost(['/app/app.ts'], FILES, angularFiles);
         const aotHost = new MockAotCompilerHost(host);
         let generatedFiles: GeneratedFile[];
         compile(host, aotHost, expectNoDiagnostics).then((generatedFiles) => {
           const genFile = generatedFiles.find(genFile => genFile.srcFileUrl === '/app/app.ts');
           const createComponentFactoryCall =
               /ɵccf\([^)]*\)/m.exec(genFile.source) ![0].replace(/\s*/g, '');
           // selector
           expect(createComponentFactoryCall).toContain('my-comp');
           // inputs
           expect(createComponentFactoryCall).toContain(`{aInputProp:'aInputName'}`);
           // outputs
           expect(createComponentFactoryCall).toContain(`{aOutputProp:'aOutputName'}`);
           // ngContentSelectors
           expect(createComponentFactoryCall).toContain(`['*','child']`);
         });
       }));
  });

  describe('generated templates', () => {
    it('should not call `check` for directives without bindings nor ngDoCheck/ngOnInit',
       async(() => {
         const FILES: MockData = {
           app: {
             'app.ts': `
                import { NgModule, Component } from '@angular/core';

                @Component({ template: '' })
                export class AppComponent {}

                @NgModule({ declarations: [ AppComponent ] })
                export class AppModule { }
              `
           }
         };
         const host = new MockCompilerHost(['/app/app.ts'], FILES, angularFiles);
         const aotHost = new MockAotCompilerHost(host);
         const genFilePreamble = '/* Hello world! */';
         compile(host, aotHost, expectNoDiagnostics, expectNoDiagnostics, {genFilePreamble})
             .then((generatedFiles) => {
               const genFile = generatedFiles.find(
                   gf => gf.srcFileUrl === '/app/app.ts' && gf.genFileUrl.endsWith('.ts'));
               expect(genFile.source).not.toContain('check(');
             });

       }));
  });

  describe('inheritance with summaries', () => {
    function compileWithSummaries(
        libInput: MockData, appInput: MockData): Promise<GeneratedFile[]> {
      const libHost = new MockCompilerHost(['/lib/base.ts'], libInput, angularFiles);
      const libAotHost = new MockAotCompilerHost(libHost);
      libAotHost.tsFilesOnly();
      const appHost = new MockCompilerHost(['/app/main.ts'], appInput, angularFiles);
      const appAotHost = new MockAotCompilerHost(appHost);
      appAotHost.tsFilesOnly();
      return compile(libHost, libAotHost, expectNoDiagnostics, expectNoDiagnosticsAndEmit)
          .then(() => {
            libHost.writtenFiles.forEach((value, key) => appHost.writeFile(key, value, false));
            libHost.overrides.forEach((value, key) => appHost.override(key, value));

            return compile(appHost, appAotHost, expectNoDiagnostics, expectNoDiagnosticsAndEmit);
          });
    }

    function compileParentAndChild(
        {parentClassDecorator, parentModuleDecorator, childClassDecorator, childModuleDecorator}: {
          parentClassDecorator: string,
          parentModuleDecorator: string,
          childClassDecorator: string,
          childModuleDecorator: string
        }) {
      const libInput: MockData = {
        'lib': {
          'base.ts': `
              import {Injectable, Pipe, Directive, Component, NgModule} from '@angular/core';

              ${parentClassDecorator}
              export class Base {}

              ${parentModuleDecorator}
              export class BaseModule {}
            `
        }
      };
      const appInput: MockData = {
        'app': {
          'main.ts': `
              import {Injectable, Pipe, Directive, Component, NgModule} from '@angular/core';
              import {Base} from '../lib/base';

              ${childClassDecorator}
              export class Extends extends Base {}

              ${childModuleDecorator}
              export class MyModule {}
            `
        }
      };

      return compileWithSummaries(libInput, appInput)
          .then((generatedFiles) => generatedFiles.find(gf => gf.srcFileUrl === '/app/main.ts'));
    }

    it('should inherit ctor and lifecycle hooks from classes in other compilation units',
       async(() => {
         const libInput: MockData = {
           'lib': {
             'base.ts': `
            export class AParam {}

            export class Base {
              constructor(a: AParam) {}
              ngOnDestroy() {}
            }
          `
           }
         };
         const appInput: MockData = {
           'app': {
             'main.ts': `
            import {NgModule, Component} from '@angular/core';
            import {Base} from '../lib/base';

            @Component({template: ''})
            export class Extends extends Base {}

            @NgModule({
              declarations: [Extends]
            })
            export class MyModule {}
          `
           }
         };

         compileWithSummaries(libInput, appInput).then((generatedFiles) => {
           const mainNgFactory = generatedFiles.find(gf => gf.srcFileUrl === '/app/main.ts');
           const flags = NodeFlags.TypeDirective | NodeFlags.Component | NodeFlags.OnDestroy;
           expect(mainNgFactory.source)
               .toContain(`${flags},(null as any),0,import1.Extends,[import2.AParam]`);
         });
       }));

    it('should inherit ctor and lifecycle hooks from classes in other compilation units over 2 levels',
       async(() => {
         const lib1Input: MockData = {
           'lib1': {
             'base.ts': `
            export class AParam {}

            export class Base {
              constructor(a: AParam) {}
              ngOnDestroy() {}
            }
          `
           }
         };

         const lib2Input: MockData = {
           'lib2': {
             'middle.ts': `
            import {Base} from '../lib1/base';
            export class Middle extends Base {}
          `
           }
         };


         const appInput: MockData = {
           'app': {
             'main.ts': `
            import {NgModule, Component} from '@angular/core';
            import {Middle} from '../lib2/middle';

            @Component({template: ''})
            export class Extends extends Middle {}

            @NgModule({
              declarations: [Extends]
            })
            export class MyModule {}
          `
           }
         };
         const lib1Host = new MockCompilerHost(['/lib1/base.ts'], lib1Input, angularFiles);
         const lib1AotHost = new MockAotCompilerHost(lib1Host);
         lib1AotHost.tsFilesOnly();
         const lib2Host = new MockCompilerHost(['/lib2/middle.ts'], lib2Input, angularFiles);
         const lib2AotHost = new MockAotCompilerHost(lib2Host);
         lib2AotHost.tsFilesOnly();
         const appHost = new MockCompilerHost(['/app/main.ts'], appInput, angularFiles);
         const appAotHost = new MockAotCompilerHost(appHost);
         appAotHost.tsFilesOnly();
         compile(lib1Host, lib1AotHost, expectNoDiagnostics, expectNoDiagnosticsAndEmit)
             .then(() => {
               lib1Host.writtenFiles.forEach((value, key) => lib2Host.writeFile(key, value, false));
               lib1Host.overrides.forEach((value, key) => lib2Host.override(key, value));
               return compile(
                   lib2Host, lib2AotHost, expectNoDiagnostics, expectNoDiagnosticsAndEmit);
             })
             .then(() => {
               lib2Host.writtenFiles.forEach((value, key) => appHost.writeFile(key, value, false));
               lib2Host.overrides.forEach((value, key) => appHost.override(key, value));
               return compile(appHost, appAotHost, expectNoDiagnostics, expectNoDiagnosticsAndEmit);
             })
             .then((generatedFiles) => {
               const mainNgFactory = generatedFiles.find(gf => gf.srcFileUrl === '/app/main.ts');
               const flags = NodeFlags.TypeDirective | NodeFlags.Component | NodeFlags.OnDestroy;
               expect(mainNgFactory.source)
                   .toContain(`${flags},(null as any),0,import1.Extends,[import2.AParam_2]`);
             });
       }));

    describe('Injectable', () => {
      it('should allow to inherit', async(() => {
           compileParentAndChild({
             parentClassDecorator: '@Injectable()',
             parentModuleDecorator: '@NgModule({providers: [Base]})',
             childClassDecorator: '@Injectable()',
             childModuleDecorator: '@NgModule({providers: [Extends]})',
           }).then((mainNgFactory) => { expect(mainNgFactory).toBeTruthy(); });
         }));

      it('should error if the child class has no matching decorator', async(() => {
           compileParentAndChild({
             parentClassDecorator: '@Injectable()',
             parentModuleDecorator: '@NgModule({providers: [Base]})',
             childClassDecorator: '',
             childModuleDecorator: '@NgModule({providers: [Extends]})',
           }).then(fail, (e) => {
             expect(e.message).toContain(
                 'Class Extends in /app/main.ts extends from a Injectable in another compilation unit without duplicating the decorator. ' +
                 'Please add a Injectable or Pipe or Directive or Component or NgModule decorator to the class.');
           });
         }));
    });

    describe('Component', () => {
      it('should allow to inherit', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@Component({template: ''})`,
             parentModuleDecorator: '@NgModule({declarations: [Base]})',
             childClassDecorator: `@Component({template: ''})`,
             childModuleDecorator: '@NgModule({declarations: [Extends]})',
           }).then((mainNgFactory) => { expect(mainNgFactory).toBeTruthy(); });
         }));

      it('should error if the child class has no matching decorator', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@Component({template: ''})`,
             parentModuleDecorator: '@NgModule({declarations: [Base]})',
             childClassDecorator: '',
             childModuleDecorator: '@NgModule({declarations: [Extends]})',
           }).then(fail, (e) => {
             expect(e.message).toContain(
                 'Class Extends in /app/main.ts extends from a Directive in another compilation unit without duplicating the decorator. ' +
                 'Please add a Directive or Component decorator to the class.');
           });
         }));
    });

    describe('Directive', () => {
      it('should allow to inherit', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@Directive({selector: '[someDir]'})`,
             parentModuleDecorator: '@NgModule({declarations: [Base]})',
             childClassDecorator: `@Directive({selector: '[someDir]'})`,
             childModuleDecorator: '@NgModule({declarations: [Extends]})',
           }).then((mainNgFactory) => { expect(mainNgFactory).toBeTruthy(); });
         }));

      it('should error if the child class has no matching decorator', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@Directive({selector: '[someDir]'})`,
             parentModuleDecorator: '@NgModule({declarations: [Base]})',
             childClassDecorator: '',
             childModuleDecorator: '@NgModule({declarations: [Extends]})',
           }).then(fail, (e) => {
             expect(e.message).toContain(
                 'Class Extends in /app/main.ts extends from a Directive in another compilation unit without duplicating the decorator. ' +
                 'Please add a Directive or Component decorator to the class.');
           });
         }));
    });

    describe('Pipe', () => {
      it('should allow to inherit', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@Pipe({name: 'somePipe'})`,
             parentModuleDecorator: '@NgModule({declarations: [Base]})',
             childClassDecorator: `@Pipe({name: 'somePipe'})`,
             childModuleDecorator: '@NgModule({declarations: [Extends]})',
           }).then((mainNgFactory) => { expect(mainNgFactory).toBeTruthy(); });
         }));

      it('should error if the child class has no matching decorator', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@Pipe({name: 'somePipe'})`,
             parentModuleDecorator: '@NgModule({declarations: [Base]})',
             childClassDecorator: '',
             childModuleDecorator: '@NgModule({declarations: [Extends]})',
           }).then(fail, (e) => {
             expect(e.message).toContain(
                 'Class Extends in /app/main.ts extends from a Pipe in another compilation unit without duplicating the decorator. ' +
                 'Please add a Pipe decorator to the class.');
           });
         }));
    });

    describe('NgModule', () => {
      it('should allow to inherit', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@NgModule()`,
             parentModuleDecorator: '',
             childClassDecorator: `@NgModule()`,
             childModuleDecorator: '',
           }).then((mainNgFactory) => { expect(mainNgFactory).toBeTruthy(); });
         }));

      it('should error if the child class has no matching decorator', async(() => {
           compileParentAndChild({
             parentClassDecorator: `@NgModule()`,
             parentModuleDecorator: '',
             childClassDecorator: '',
             childModuleDecorator: '',
           }).then(fail, (e) => {
             expect(e.message).toContain(
                 'Class Extends in /app/main.ts extends from a NgModule in another compilation unit without duplicating the decorator. ' +
                 'Please add a NgModule decorator to the class.');
           });
         }));
    });
  });
});

describe('compiler (bundled Angular)', () => {
  let angularFiles: Map<string, string>;

  beforeAll(() => {
    const emittingHost = new EmittingCompilerHost(['@angular/core/index'], {emitMetadata: false});

    // Create the metadata bundled
    const indexModule = emittingHost.effectiveName('@angular/core/index');
    const bundler = new MetadataBundler(
        indexModule, '@angular/core', new MockMetadataBundlerHost(emittingHost));
    const bundle = bundler.getMetadataBundle();
    const metadata = JSON.stringify(bundle.metadata, null, ' ');
    const bundleIndexSource = privateEntriesToIndex('./index', bundle.privates);
    emittingHost.override('@angular/core/bundle_index.ts', bundleIndexSource);
    emittingHost.addWrittenFile(
        '@angular/core/package.json', JSON.stringify({typings: 'bundle_index.d.ts'}));
    emittingHost.addWrittenFile('@angular/core/bundle_index.metadata.json', metadata);

    // Emit the sources
    const bundleIndexName = emittingHost.effectiveName('@angular/core/bundle_index.ts');
    const emittingProgram = ts.createProgram([bundleIndexName], settings, emittingHost);
    emittingProgram.emit();
    angularFiles = emittingHost.written;
  });

  describe('Quickstart', () => {
    let host: MockCompilerHost;
    let aotHost: MockAotCompilerHost;

    beforeEach(() => {
      host = new MockCompilerHost(QUICKSTART, FILES, angularFiles);
      aotHost = new MockAotCompilerHost(host);
    });

    // Restore reflector since AoT compiler will update it with a new static reflector
    afterEach(() => { reflector.updateCapabilities(new ReflectionCapabilities()); });

    it('should compile',
       async(() => compile(host, aotHost, expectNoDiagnostics).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
       })));
  });

  describe('Bundled library', () => {
    let host: MockCompilerHost;
    let aotHost: MockAotCompilerHost;
    let libraryFiles: Map<string, string>;

    beforeAll(() => {
      // Emit the library bundle
      const emittingHost =
          new EmittingCompilerHost(['/bolder/index.ts'], {emitMetadata: false, mockData: LIBRARY});

      // Create the metadata bundled
      const indexModule = '/bolder/public-api';
      const bundler =
          new MetadataBundler(indexModule, 'bolder', new MockMetadataBundlerHost(emittingHost));
      const bundle = bundler.getMetadataBundle();
      const metadata = JSON.stringify(bundle.metadata, null, ' ');
      const bundleIndexSource = privateEntriesToIndex('./public-api', bundle.privates);
      emittingHost.override('/bolder/index.ts', bundleIndexSource);
      emittingHost.addWrittenFile('/bolder/index.metadata.json', metadata);

      // Emit the sources
      const emittingProgram = ts.createProgram(['/bolder/index.ts'], settings, emittingHost);
      emittingProgram.emit();
      libraryFiles = emittingHost.written;

      // Copy the .html file
      const htmlFileName = '/bolder/src/bolder.component.html';
      libraryFiles.set(htmlFileName, emittingHost.readFile(htmlFileName));
    });

    beforeEach(() => {
      host = new MockCompilerHost(
          LIBRARY_USING_APP_MODULE, LIBRARY_USING_APP, angularFiles, [libraryFiles]);
      aotHost = new MockAotCompilerHost(host);
    });

    it('should compile',
       async(() => compile(host, aotHost, expectNoDiagnostics, expectNoDiagnostics)));

    // Restore reflector since AoT compiler will update it with a new static reflector
    afterEach(() => { reflector.updateCapabilities(new ReflectionCapabilities()); });
  });
});

function expectNoDiagnostics(program: ts.Program) {
  function fileInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      return `${diagnostic.file.fileName}(${diagnostic.start}): `;
    }
    return '';
  }

  function chars(len: number, ch: string): string { return new Array(len).fill(ch).join(''); }

  function lineNoOf(offset: number, text: string): number {
    let result = 1;
    for (let i = 0; i < offset; i++) {
      if (text[i] == '\n') result++;
    }
    return result;
  }

  function lineInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      const start = diagnostic.start;
      let end = diagnostic.start + diagnostic.length;
      const source = diagnostic.file.text;
      let lineStart = start;
      let lineEnd = end;
      while (lineStart > 0 && source[lineStart] != '\n') lineStart--;
      if (lineStart < start) lineStart++;
      while (lineEnd < source.length && source[lineEnd] != '\n') lineEnd++;
      let line = source.substring(lineStart, lineEnd);
      const lineIndex = line.indexOf('/n');
      if (lineIndex > 0) {
        line = line.substr(0, lineIndex);
        end = start + lineIndex;
      }
      const lineNo = lineNoOf(start, source) + ': ';
      return '\n' + lineNo + line + '\n' + chars(start - lineStart + lineNo.length, ' ') +
          chars(end - start, '^');
    }
    return '';
  }

  function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
    if (diagnostics && diagnostics.length) {
      throw new Error(
          'Errors from TypeScript:\n' +
          diagnostics.map(d => `${fileInfo(d)}${d.messageText}${lineInfo(d)}`).join(' \n'));
    }
  }
  expectNoDiagnostics(program.getOptionsDiagnostics());
  expectNoDiagnostics(program.getSyntacticDiagnostics());
  expectNoDiagnostics(program.getSemanticDiagnostics());
}

function expectNoDiagnosticsAndEmit(program: ts.Program) {
  expectNoDiagnostics(program);
  program.emit();
}

function isDTS(fileName: string): boolean {
  return /\.d\.ts$/.test(fileName);
}

function isSource(fileName: string): boolean {
  return /\.ts$/.test(fileName);
}

function isFactory(fileName: string): boolean {
  return /\.ngfactory\./.test(fileName);
}

function summaryCompile(
    host: MockCompilerHost, aotHost: MockAotCompilerHost,
    preCompile?: (program: ts.Program) => void) {
  // First compile the program to generate the summary files.
  return compile(host, aotHost).then(generatedFiles => {
    // Remove generated files that were not generated from a DTS file
    host.remove(generatedFiles.filter(f => !isDTS(f.srcFileUrl)).map(f => f.genFileUrl));

    // Next compile the program shrowding metadata and only treating .ts files as source.
    aotHost.hideMetadata();
    aotHost.tsFilesOnly();

    return compile(host, aotHost);
  });
}

function compile(
    host: MockCompilerHost, aotHost: AotCompilerHost, preCompile?: (program: ts.Program) => void,
    postCompile: (program: ts.Program) => void = expectNoDiagnostics,
    options: AotCompilerOptions = {}): Promise<GeneratedFile[]> {
  const scripts = host.scriptNames.slice(0);
  const program = ts.createProgram(scripts, settings, host);
  if (preCompile) preCompile(program);
  const {compiler, reflector} = createAotCompiler(aotHost, options);
  return compiler.compileAll(program.getSourceFiles().map(sf => sf.fileName))
      .then(generatedFiles => {
        generatedFiles.forEach(
            file => isSource(file.genFileUrl) ? host.addScript(file.genFileUrl, file.source) :
                                                host.override(file.genFileUrl, file.source));
        const scripts = host.scriptNames.slice(0);
        const newProgram = ts.createProgram(scripts, settings, host);
        if (postCompile) postCompile(newProgram);
        return generatedFiles;
      });
}

const QUICKSTART = ['/quickstart/app/app.module.ts'];
const FILES: MockData = {
  quickstart: {
    app: {
      'app.component.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '<h1>Hello {{name}}</h1>'
        })
        export class AppComponent {
          name = 'Angular';
        }
      `,
      'app.module.ts': `
        import { NgModule }      from '@angular/core';
        import { toString }      from './utils';

        import { AppComponent }  from './app.component';

        @NgModule({
          declarations: [ AppComponent ],
          bootstrap:    [ AppComponent ]
        })
        export class AppModule { }
      `,
      // #15420
      'utils.ts': `
        export function toString(value: any): string {
          return  '';
        }
      `
    }
  }
};

const LIBRARY: MockData = {
  bolder: {
    'public-api.ts': `
      export * from './src/bolder.component';
      export * from './src/bolder.module';
    `,
    src: {
      'bolder.component.ts': `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'bolder',
          templateUrl: './bolder.component.html'
        })
        export class BolderComponent {
          @Input() data: string;
        }
      `,
      'bolder.component.html': `
        <b>{{data}}</b>
      `,
      'bolder.module.ts': `
        import {NgModule} from '@angular/core';
        import {BolderComponent} from './bolder.component';

        @NgModule({
          declarations: [BolderComponent],
          exports: [BolderComponent]
        })
        export class BolderModule {}
      `
    }
  }
};

const LIBRARY_USING_APP_MODULE = ['/lib-user/app/app.module.ts'];
const LIBRARY_USING_APP: MockData = {
  'lib-user': {
    app: {
      'app.component.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '<h1>Hello <bolder [data]="name"></bolder></h1>'
        })
        export class AppComponent {
          name = 'Angular';
        }
      `,
      'app.module.ts': `
        import { NgModule }      from '@angular/core';
        import { BolderModule }  from 'bolder';

        import { AppComponent }  from './app.component';

        @NgModule({
          declarations: [ AppComponent ],
          bootstrap:    [ AppComponent ],
          imports:      [ BolderModule ]
        })
        export class AppModule { }
      `
    }
  }
};

function expectPromiseToThrow(p: Promise<any>, msg: RegExp) {
  p.then(
      () => { throw new Error('Expected to throw'); }, (e) => { expect(e.message).toMatch(msg); });
}
