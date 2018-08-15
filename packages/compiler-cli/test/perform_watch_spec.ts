/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ivyEnabled} from '@angular/private/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as ng from '../index';
import {FileChangeEvent, performWatchCompilation} from '../src/perform_watch';

import {expectNoDiagnostics, setup, TestSupport} from './test_support';

describe('perform watch', () => {
  let testSupport: TestSupport;
  let outDir: string;

  beforeEach(() => {
    testSupport = setup();
    outDir = path.resolve(testSupport.basePath, 'outDir');
  });

  function createConfig(overrideOptions: ng.CompilerOptions = {}): ng.ParsedConfiguration {
    const options = testSupport.createCompilerOptions({outDir, ...overrideOptions});
    return {
      options,
      rootNames: [path.resolve(testSupport.basePath, 'src/index.ts')],
      project: path.resolve(testSupport.basePath, 'src/tsconfig.json'),
      emitFlags: ng.EmitFlags.Default,
      errors: []
    };
  }

  it('should compile files during the initial run', () => {
    const config = createConfig();
    const host = new MockWatchHost(config);

    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
      'src/index.ts': `export * from './main'; `,
    });

    const watchResult = performWatchCompilation(host);
    expectNoDiagnostics(config.options, watchResult.firstCompileResult);

    expect(fs.existsSync(path.resolve(outDir, 'src', 'main.ngfactory.js'))).toBe(true);
  });

  it('should recompile components when its template changes', () => {
    const config = createConfig({enableIvy: ivyEnabled});
    const host = new MockWatchHost(config);

    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main', './main.html'),
      'src/main.html': 'initial',
      'src/index.ts': `export * from './main'; `,
    });

    const watchResult = performWatchCompilation(host);
    expectNoDiagnostics(config.options, watchResult.firstCompileResult);

    const htmlPath = path.join(testSupport.basePath, 'src', 'main.html');
    const genPath = ivyEnabled ? path.posix.join(outDir, 'src', 'main.js') :
                                 path.posix.join(outDir, 'src', 'main.ngfactory.js');

    const initial = fs.readFileSync(genPath, {encoding: 'utf8'});
    expect(initial).toContain('"initial"');

    testSupport.write(htmlPath, 'updated');
    host.triggerFileChange(FileChangeEvent.Change, htmlPath);

    const updated = fs.readFileSync(genPath, {encoding: 'utf8'});
    expect(updated).toContain('"updated"');
  });

  it('should cache files on subsequent runs', () => {
    const config = createConfig();
    const host = new MockWatchHost(config);
    let fileExistsSpy: jasmine.Spy;
    let getSourceFileSpy: jasmine.Spy;
    host.createCompilerHost = (options: ng.CompilerOptions) => {
      const ngHost = ng.createCompilerHost({options});
      fileExistsSpy = spyOn(ngHost, 'fileExists').and.callThrough();
      getSourceFileSpy = spyOn(ngHost, 'getSourceFile').and.callThrough();
      return ngHost;
    };

    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
      'src/util.ts': `export const x = 1;`,
      'src/index.ts': `
        export * from './main';
        export * from './util';
      `,
    });

    const mainTsPath = path.posix.join(testSupport.basePath, 'src', 'main.ts');
    const utilTsPath = path.posix.join(testSupport.basePath, 'src', 'util.ts');
    const mainNgFactory = path.posix.join(outDir, 'src', 'main.ngfactory.js');

    performWatchCompilation(host);
    expect(fs.existsSync(mainNgFactory)).toBe(true);
    expect(fileExistsSpy!).toHaveBeenCalledWith(mainTsPath);
    expect(fileExistsSpy!).toHaveBeenCalledWith(utilTsPath);
    expect(getSourceFileSpy!).toHaveBeenCalledWith(mainTsPath, ts.ScriptTarget.ES5);
    expect(getSourceFileSpy!).toHaveBeenCalledWith(utilTsPath, ts.ScriptTarget.ES5);

    fileExistsSpy!.calls.reset();
    getSourceFileSpy!.calls.reset();

    // trigger a single file change
    // -> all other files should be cached
    host.triggerFileChange(FileChangeEvent.Change, utilTsPath);
    expectNoDiagnostics(config.options, host.diagnostics);

    expect(fileExistsSpy!).not.toHaveBeenCalledWith(mainTsPath);
    expect(fileExistsSpy!).toHaveBeenCalledWith(utilTsPath);
    expect(getSourceFileSpy!).not.toHaveBeenCalledWith(mainTsPath, ts.ScriptTarget.ES5);
    expect(getSourceFileSpy!).toHaveBeenCalledWith(utilTsPath, ts.ScriptTarget.ES5);

    // trigger a folder change
    // -> nothing should be cached
    host.triggerFileChange(
        FileChangeEvent.CreateDeleteDir, path.resolve(testSupport.basePath, 'src'));
    expectNoDiagnostics(config.options, host.diagnostics);

    expect(fileExistsSpy!).toHaveBeenCalledWith(mainTsPath);
    expect(fileExistsSpy!).toHaveBeenCalledWith(utilTsPath);
    expect(getSourceFileSpy!).toHaveBeenCalledWith(mainTsPath, ts.ScriptTarget.ES5);
    expect(getSourceFileSpy!).toHaveBeenCalledWith(utilTsPath, ts.ScriptTarget.ES5);
  });

  // https://github.com/angular/angular/pull/26036
  it('should handle redirected source files', () => {
    const config = createConfig();
    const host = new MockWatchHost(config);
    host.createCompilerHost = (options: ng.CompilerOptions) => {
      const ngHost = ng.createCompilerHost({options});
      return ngHost;
    };

    // This file structure has an identical version of "a" under the root node_modules and inside
    // of "b". Because their package.json file indicates it is the exact same version of "a",
    // TypeScript will transform the source file of "node_modules/b/node_modules/a/index.d.ts"
    // into a redirect to "node_modules/a/index.d.ts". During watch compilations, we must assure
    // not to reintroduce "node_modules/b/node_modules/a/index.d.ts" as its redirected source file,
    // but instead using its original file.
    testSupport.writeFiles({
      'node_modules/a/index.js': `export class ServiceA {}`,
      'node_modules/a/index.d.ts': `export declare class ServiceA {}`,
      'node_modules/a/package.json': `{"name": "a", "version": "1.0"}`,
      'node_modules/b/node_modules/a/index.js': `export class ServiceA {}`,
      'node_modules/b/node_modules/a/index.d.ts': `export declare class ServiceA {}`,
      'node_modules/b/node_modules/a/package.json': `{"name": "a", "version": "1.0"}`,
      'node_modules/b/index.js': `export {ServiceA as ServiceB} from 'a';`,
      'node_modules/b/index.d.ts': `export {ServiceA as ServiceB} from 'a';`,
      'src/index.ts': `
        import {ServiceA} from 'a';
        import {ServiceB} from 'b';
      `,
    });

    const indexTsPath = path.posix.join(testSupport.basePath, 'src', 'index.ts');

    performWatchCompilation(host);

    // Trigger a file change. This recreates the program from the old program. If redirect sources
    // were introduced into the new program, this would fail due to an assertion failure in TS.
    host.triggerFileChange(FileChangeEvent.Change, indexTsPath);
    expectNoDiagnostics(config.options, host.diagnostics);
  });


  it('should recover from static analysis errors', () => {
    const config = createConfig();
    const host = new MockWatchHost(config);

    const okFileContent = `
      import {NgModule} from '@angular/core';

      @NgModule()
      export class MyModule {}
    `;
    const errorFileContent = `
      import {NgModule} from '@angular/core';

      @NgModule((() => (1===1 ? null as any : null as any)) as any)
      export class MyModule {}
    `;
    const indexTsPath = path.resolve(testSupport.basePath, 'src', 'index.ts');

    testSupport.write(indexTsPath, okFileContent);

    performWatchCompilation(host);
    expectNoDiagnostics(config.options, host.diagnostics);

    // Do it multiple times as the watch mode switches internal modes.
    // E.g. from regular compile to using summaries, ...
    for (let i = 0; i < 3; i++) {
      host.diagnostics = [];
      testSupport.write(indexTsPath, okFileContent);
      host.triggerFileChange(FileChangeEvent.Change, indexTsPath);
      expectNoDiagnostics(config.options, host.diagnostics);

      host.diagnostics = [];
      testSupport.write(indexTsPath, errorFileContent);
      host.triggerFileChange(FileChangeEvent.Change, indexTsPath);

      const errDiags = host.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
      expect(errDiags.length).toBe(1);
      expect(errDiags[0].messageText).toContain('Function expressions are not supported');
    }
  });
});

function createModuleAndCompSource(prefix: string, template: string = prefix + 'template') {
  const templateEntry =
      template.endsWith('.html') ? `templateUrl: '${template}'` : `template: \`${template}\``;
  return `
    import {Component, NgModule} from '@angular/core';

    @Component({selector: '${prefix}', ${templateEntry}})
    export class ${prefix}Comp {}

    @NgModule({declarations: [${prefix}Comp]})
    export class ${prefix}Module {}
  `;
}

class MockWatchHost {
  nextTimeoutListenerId = 1;
  timeoutListeners: {[id: string]: (() => void)} = {};
  fileChangeListeners: Array<((event: FileChangeEvent, fileName: string) => void)|null> = [];
  diagnostics: ng.Diagnostic[] = [];
  constructor(public config: ng.ParsedConfiguration) {}

  reportDiagnostics(diags: ng.Diagnostics) {
    this.diagnostics.push(...(diags as ng.Diagnostic[]));
  }
  readConfiguration() {
    return this.config;
  }
  createCompilerHost(options: ng.CompilerOptions) {
    return ng.createCompilerHost({options});
  }
  createEmitCallback() {
    return undefined;
  }
  onFileChange(
      options: ng.CompilerOptions, listener: (event: FileChangeEvent, fileName: string) => void,
      ready: () => void) {
    const id = this.fileChangeListeners.length;
    this.fileChangeListeners.push(listener);
    ready();
    return {
      close: () => this.fileChangeListeners[id] = null,
    };
  }
  setTimeout(callback: () => void): any {
    const id = this.nextTimeoutListenerId++;
    this.timeoutListeners[id] = callback;
    return id;
  }
  clearTimeout(timeoutId: any): void {
    delete this.timeoutListeners[timeoutId];
  }
  flushTimeouts() {
    const listeners = this.timeoutListeners;
    this.timeoutListeners = {};
    Object.keys(listeners).forEach(id => listeners[id]());
  }
  triggerFileChange(event: FileChangeEvent, fileName: string) {
    this.fileChangeListeners.forEach(listener => {
      if (listener) {
        listener(event, fileName);
      }
    });
    this.flushTimeouts();
  }
}
