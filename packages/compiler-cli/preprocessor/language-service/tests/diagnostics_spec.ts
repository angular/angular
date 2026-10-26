/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import * as rpc from 'vscode-jsonrpc/node';
import {DiagnosticSeverity} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {TsGoFacade} from '../src/facade';

import {TestFileManager} from './test_file_manager';
import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';

describe('Diagnostics Mapping', () => {
  let connection: rpc.MessageConnection;
  let facade: TsGoFacade;
  let serverCleanup: () => Promise<void>;

  const testWorkspacePath = getTestWorkspacePath();

  beforeAll(async () => {
    await fs.mkdir(testWorkspacePath, {recursive: true});

    const server = await startTestServer(testWorkspacePath);
    facade = server.facade;
    connection = server.connection;
    serverCleanup = server.cleanup;
  });

  afterAll(async () => {
    await serverCleanup();
  });

  it('should map diagnostics from TCB back to template', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath), connection);
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-cmp',
        template: '<div>{{ nonExistent }}</div>',
      })
      export class AppCmp {
      }
    `;

    await env.run('app_diagnostics_test.ts', appTsContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const position = doc.positionAt(appTsContent.indexOf('nonExistent'));
      const tcb = await ls.getTcb(filePath, position);
      expect(tcb).toBeTruthy();

      if (!tcb) return;

      const match = /\/\*(\d+),(\d+)\*\//.exec(tcb.code);
      expect(match).toBeTruthy();
      if (!match) return;

      const commentOffset = match.index;
      const templateStart = parseInt(match[1], 10);

      const tcbDoc = TextDocument.create(tcb.filePath, 'typescript', 0, tcb.code);
      const tcbPosition = tcbDoc.positionAt(commentOffset);

      const mockDiagnostic = {
        range: {
          start: tcbPosition,
          end: tcbPosition,
        },
        message: 'Property nonExistent does not exist',
        severity: DiagnosticSeverity.Error,
      };

      const params = {
        filePath: tcb.filePath,
        diagnostics: [mockDiagnostic],
      };

      const result = await ls.handleDiagnostics(params);

      expect(result).toBeTruthy();
      expect(Object.keys(result!).length).toBe(1);
      expect(result![filePath]).toBeTruthy();
      expect(result![filePath].length).toBe(1);

      const mappedDiag = result![filePath][0];
      expect(mappedDiag).toBeTruthy();
      if (!mappedDiag) return;
      expect(mappedDiag.message).toBe(mockDiagnostic.message);

      const templateDoc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const expectedPosition = templateDoc.positionAt(templateStart);

      expect(mappedDiag.range.start.line).toBe(expectedPosition.line);
      expect(mappedDiag.range.start.character).toBe(expectedPosition.character);
    });
  });

  it('should map diagnostics for external templates', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath));
    const appHtmlContent = '<div>{{ nonExistent }}</div>';
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
      })
      export class AppCmp {
      }
    `;

    await env.createFile('app.html', appHtmlContent);

    await env.run('app_diagnostics_ext_test.ts', appTsContent, async (ls, filePath) => {
      const htmlPath = path.join(testWorkspacePath, 'app.html');
      const tcb = await ls.getTcb(htmlPath, {line: 0, character: 0});
      expect(tcb).toBeTruthy();

      if (!tcb) return;

      const match = /\/\*(\d+),(\d+)\*\//.exec(tcb.code);
      expect(match).toBeTruthy();
      if (!match) return;

      const commentOffset = match.index;
      const templateStart = parseInt(match[1], 10);

      const tcbDoc = TextDocument.create(tcb.filePath, 'typescript', 0, tcb.code);
      const tcbPosition = tcbDoc.positionAt(commentOffset);

      const mockDiagnostic = {
        range: {
          start: tcbPosition,
          end: tcbPosition,
        },
        message: 'Property nonExistent does not exist',
        severity: DiagnosticSeverity.Error,
      };

      const params = {
        filePath: tcb.filePath,
        diagnostics: [mockDiagnostic],
      };

      const result = await ls.handleDiagnostics(params);

      expect(result).toBeTruthy();
      const keys = Object.keys(result!);
      expect(keys.length).toBe(1);
      const normHtmlPath = keys[0];
      expect(result![normHtmlPath]).toBeTruthy();
      expect(result![normHtmlPath].length).toBe(1);

      const mappedDiag = result![normHtmlPath][0];
      expect(mappedDiag).toBeTruthy();
      if (!mappedDiag) return;
      expect(mappedDiag.message).toBe(mockDiagnostic.message);

      const templateDoc = TextDocument.create(
        `file://${path.join(testWorkspacePath, 'app.html')}`,
        'typescript',
        0,
        appHtmlContent,
      );
      const expectedPosition = templateDoc.positionAt(templateStart);

      expect(mappedDiag.range.start.line).toBe(expectedPosition.line);
      expect(mappedDiag.range.start.character).toBe(expectedPosition.character);
    });
  });

  it('should ignore diagnostics on lines containing /*D:ignore*/', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath));
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-cmp',
        template: '<div>{{ nonExistent }}</div>',
      })
      export class AppCmp {
      }
    `;

    await env.run('app_diagnostics_ignore_test.ts', appTsContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const position = doc.positionAt(appTsContent.indexOf('nonExistent'));
      const tcb = await ls.getTcb(filePath, position);
      expect(tcb).toBeTruthy();

      if (!tcb) return;

      const match = /\/\*(\d+),(\d+)\*\//.exec(tcb.code);
      expect(match).toBeTruthy();
      if (!match) return;

      const commentOffset = match.index;
      const lineStart = tcb.code.lastIndexOf('\n', commentOffset) + 1;
      const lineEnd = tcb.code.indexOf('\n', commentOffset);
      const line = tcb.code.substring(lineStart, lineEnd !== -1 ? lineEnd : tcb.code.length);

      const updatedTcbCode =
        tcb.code.substring(0, lineStart) +
        line +
        ' /*D:ignore*/' +
        tcb.code.substring(lineStart + line.length);

      const originalGetTcb = (ls as any).hybridCompiler.getTcbForFile.bind(
        (ls as any).hybridCompiler,
      );
      (ls as any).hybridCompiler.getTcbForFile = () => updatedTcbCode;

      const tcbDoc = TextDocument.create(tcb.filePath, 'typescript', 0, updatedTcbCode);
      const tcbPosition = tcbDoc.positionAt(commentOffset);

      const mockDiagnostic = {
        range: {
          start: tcbPosition,
          end: tcbPosition,
        },
        message: 'Property nonExistent does not exist',
        severity: DiagnosticSeverity.Error,
      };

      const params = {
        filePath: tcb.filePath,
        diagnostics: [mockDiagnostic],
      };

      const result = await ls.handleDiagnostics(params);

      (ls as any).hybridCompiler.getTcbForFile = originalGetTcb;

      expect(result).toBeNull();
    });
  });

  it('should handle input transforms in .d.ts files', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath));
    const dtsContent = `
      import * as i0 from "@angular/core";
      export declare class TestDir {
        static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {
          "width": "width";
        }, {}, never, never, true, never>;
        static ngAcceptInputType_width: unknown;
      }
    `;
    const appTsContent = `
      import {Component} from '@angular/core';
      import {TestDir} from 'test_dir';
      @Component({
        selector: 'app-cmp',
        template: '<div test width="100"></div>',
        imports: [TestDir],
      })
      export class AppCmp {
      }
    `;

    const nodeModulesDir = path.join(testWorkspacePath, 'node_modules', 'test_dir');
    await fs.mkdir(nodeModulesDir, {recursive: true});
    await env.createFile('node_modules/test_dir/index.d.ts', dtsContent);

    await env.run('app_diagnostics_dts_test.ts', appTsContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const position = doc.positionAt(appTsContent.indexOf('width="100"'));
      const tcb = await ls.getTcb(filePath, position);
      expect(tcb).toBeTruthy();

      if (!tcb) return;

      // The TCB should be generated successfully and contain the property.
      expect(tcb.code).toContain('width');
    });
  });

  it('should ignore diagnostics with specific error codes', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath));
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-cmp',
        template: '<div>{{ nonExistent }}</div>',
      })
      export class AppCmp {
      }
    `;

    await env.run('app_diagnostics_code_ignore_test.ts', appTsContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const position = doc.positionAt(appTsContent.indexOf('nonExistent'));
      const tcb = await ls.getTcb(filePath, position);
      expect(tcb).toBeTruthy();

      if (!tcb) return;

      const match = /\/\*(\d+),(\d+)\*\//.exec(tcb.code);
      expect(match).toBeTruthy();
      if (!match) return;

      const commentOffset = match.index;

      const tcbDoc = TextDocument.create(tcb.filePath, 'typescript', 0, tcb.code);
      const tcbPosition = tcbDoc.positionAt(commentOffset);

      const mockDiagnostic = {
        range: {
          start: tcbPosition,
          end: tcbPosition,
        },
        message: 'Property nonExistent does not exist',
        severity: DiagnosticSeverity.Error,
        code: 6133, // Ignored code
      };

      const params = {
        filePath: tcb.filePath,
        diagnostics: [mockDiagnostic],
      };

      const result = await ls.handleDiagnostics(params);

      expect(result).toBeNull();
    });
  });

  it('should generate TCB with host directive inputs and outputs', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath));
    const appTsContent = `
      import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

      @Directive({
      })
      export class HostDir {
        @Input() hostInput = 'default';
        @Output() hostOutput = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          inputs: ['hostInput'],
          outputs: ['hostOutput']
        }],
      })
      export class Dir {}

      @Component({
        selector: 'app-cmp',
        template: '<div dir [hostInput]="message" (hostOutput)="onMessage($event)"></div>',
        imports: [Dir],
      })
      export class AppCmp {
        message = 'hello';
        onMessage(msg: string) {}
      }
    `;

    await env.run('app_host_dir_tcb_test.ts', appTsContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const position = doc.positionAt(appTsContent.indexOf('[hostInput]'));
      const tcb = await ls.getTcb(filePath, position);
      expect(tcb).toBeTruthy();
      if (!tcb) return;

      // The TCB should generate the HostDir instance and assign the hostInput and hostOutput
      expect(tcb.code).toContain('HostDir');
      expect(tcb.code).toContain('hostInput');
      expect(tcb.code).toContain('hostOutput');
    });
  });

  it('should remap extended-check probe TS2345 diagnostics and suppress secondary probe diagnostics', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath));
    const appHtmlContent = '<div>{{ count }}</div>';
    const appTsContent = `
      import {Component, signal} from '@angular/core';
      @Component({
        selector: 'app-cmp',
        templateUrl: './ext_probe_app.html',
      })
      export class AppCmp {
        count = signal(0);
      }
    `;

    await env.createFile('ext_probe_app.html', appHtmlContent);

    await env.run('app_ext_probe_diagnostics_test.ts', appTsContent, async (ls, _filePath) => {
      const htmlPath = path.join(testWorkspacePath, 'ext_probe_app.html');
      const tcb = await ls.getTcb(htmlPath, {line: 0, character: 0});
      expect(tcb).toBeTruthy();
      if (!tcb) return;

      const probeMatch = /\b\w+\.ɵassertNotSignal\((\d+),\s*(.+?)\);/.exec(tcb.code);
      expect(probeMatch).toBeTruthy();
      if (!probeMatch) return;

      const argText = probeMatch[2];
      const argStartOffset = probeMatch.index + probeMatch[0].indexOf(argText);
      const argEndOffset = argStartOffset + argText.length;

      const tcbDoc = TextDocument.create(tcb.filePath, 'typescript', 0, tcb.code);
      const probeDiag = {
        range: {
          start: tcbDoc.positionAt(argStartOffset),
          end: tcbDoc.positionAt(argEndOffset),
        },
        code: 2345,
        message:
          "Argument of type 'WritableSignal<number>' is not assignable to parameter of type 'never'.",
        severity: DiagnosticSeverity.Error,
      };
      const secondaryProbeDiag = {
        range: {
          start: tcbDoc.positionAt(argStartOffset),
          end: tcbDoc.positionAt(argStartOffset + 4),
        },
        code: 2339,
        message: "Property 'count' does not exist on type 'AppCmp'.",
        severity: DiagnosticSeverity.Error,
      };

      const result = await ls.handleDiagnostics({
        filePath: tcb.filePath,
        diagnostics: [probeDiag, secondaryProbeDiag],
      });

      expect(result).toBeTruthy();
      const keys = Object.keys(result!);
      expect(keys.length).toBe(1);
      const diags = result![keys[0]];
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(8109);
      expect(diags[0].severity).toBe(DiagnosticSeverity.Warning);
      expect(diags[0].message).toContain(
        'NG8109: count is a function and should be invoked: count()',
      );

      const htmlDoc = TextDocument.create(`file://${htmlPath}`, 'html', 0, appHtmlContent);
      const expectedStart = htmlDoc.positionAt(appHtmlContent.indexOf('count'));
      const expectedEnd = htmlDoc.positionAt(appHtmlContent.indexOf('count') + 'count'.length);
      expect(diags[0].range.start).toEqual(expectedStart);
      expect(diags[0].range.end).toEqual(expectedEnd);
    });
  });

  it('should report uninvoked signal and function extended diagnostics end-to-end with TS 7', async () => {
    const env = new TestEnv(facade, new TestFileManager(testWorkspacePath), connection);
    const appHtmlContent = '<button [title]="label" (click)="onClick">Save</button>';
    const appTsContent = `
      import {Component, signal} from '@angular/core';
      @Component({
        selector: 'app-cmp',
        templateUrl: './ext_probe_ts7_app.html',
      })
      export class AppCmp {
        label = signal('hello');
        onClick(): void {}
      }
    `;

    await env.createFile('ext_probe_ts7_app.html', appHtmlContent);

    await env.run('app_ext_probe_ts7_test.ts', appTsContent, async (ls, _filePath) => {
      const htmlPath = path.join(testWorkspacePath, 'ext_probe_ts7_app.html');
      const tcb = await ls.getTcb(htmlPath, {line: 0, character: 0});
      expect(tcb).toBeTruthy();
      if (!tcb) return;

      await facade.ensureDocument(tcb.filePath, tcb.code);
      const tsgoDiagnostics = await facade.getDiagnostics(tcb.filePath);
      const result = await ls.handleDiagnostics({
        filePath: tcb.filePath,
        diagnostics: tsgoDiagnostics,
      });

      expect(result).toBeTruthy();
      const keys = Object.keys(result!);
      expect(keys.length).toBe(1);
      const diags = result![keys[0]];
      const codes = diags.map((d) => d.code).sort();
      expect(codes).toEqual([8109, 8111]);
      for (const diag of diags) {
        expect(diag.severity).toBe(DiagnosticSeverity.Warning);
      }
    });
  });
});
