/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as ng from '../index';
import {FileChangeEvent, performWatchCompilation} from '../src/perform_watch';

import {TestSupport, expectNoDiagnostics, setup} from './test_support';

describe('perform watch', () => {
  let testSupport: TestSupport;
  let outDir: string;

  beforeEach(() => {
    testSupport = setup();
    outDir = path.resolve(testSupport.basePath, 'outDir');
  });

  function createConfig(): ng.ParsedConfiguration {
    const options = testSupport.createCompilerOptions({outDir});
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

    const mainTsPath = path.resolve(testSupport.basePath, 'src', 'main.ts');
    const utilTsPath = path.resolve(testSupport.basePath, 'src', 'util.ts');
    const mainNgFactory = path.resolve(outDir, 'src', 'main.ngfactory.js');
    performWatchCompilation(host);
    expect(fs.existsSync(mainNgFactory)).toBe(true);
    expect(fileExistsSpy !).toHaveBeenCalledWith(mainTsPath);
    expect(fileExistsSpy !).toHaveBeenCalledWith(utilTsPath);
    expect(getSourceFileSpy !).toHaveBeenCalledWith(mainTsPath, ts.ScriptTarget.ES5);
    expect(getSourceFileSpy !).toHaveBeenCalledWith(utilTsPath, ts.ScriptTarget.ES5);

    fileExistsSpy !.calls.reset();
    getSourceFileSpy !.calls.reset();

    // trigger a single file change
    // -> all other files should be cached
    host.triggerFileChange(FileChangeEvent.Change, utilTsPath);
    expectNoDiagnostics(config.options, host.diagnostics);

    expect(fileExistsSpy !).not.toHaveBeenCalledWith(mainTsPath);
    expect(fileExistsSpy !).toHaveBeenCalledWith(utilTsPath);
    expect(getSourceFileSpy !).not.toHaveBeenCalledWith(mainTsPath, ts.ScriptTarget.ES5);
    expect(getSourceFileSpy !).toHaveBeenCalledWith(utilTsPath, ts.ScriptTarget.ES5);

    // trigger a folder change
    // -> nothing should be cached
    host.triggerFileChange(
        FileChangeEvent.CreateDeleteDir, path.resolve(testSupport.basePath, 'src'));
    expectNoDiagnostics(config.options, host.diagnostics);

    expect(fileExistsSpy !).toHaveBeenCalledWith(mainTsPath);
    expect(fileExistsSpy !).toHaveBeenCalledWith(utilTsPath);
    expect(getSourceFileSpy !).toHaveBeenCalledWith(mainTsPath, ts.ScriptTarget.ES5);
    expect(getSourceFileSpy !).toHaveBeenCalledWith(utilTsPath, ts.ScriptTarget.ES5);
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

      @NgModule(() => (1===1 ? null as any : null as any))
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
      expect(errDiags[0].messageText).toContain('Function calls are not supported.');
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
  diagnostics: ng.Diagnostics = [];
  constructor(public config: ng.ParsedConfiguration) {}

  reportDiagnostics(diags: ng.Diagnostics) { this.diagnostics.push(...diags); }
  readConfiguration() { return this.config; }
  createCompilerHost(options: ng.CompilerOptions) { return ng.createCompilerHost({options}); }
  createEmitCallback() { return undefined; }
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
  clearTimeout(timeoutId: any): void { delete this.timeoutListeners[timeoutId]; }
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
