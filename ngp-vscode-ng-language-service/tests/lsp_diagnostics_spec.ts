import * as path from 'path';
import * as rpc from 'vscode-jsonrpc/node';
import {URI} from 'vscode-uri';
import {TestEnv, startTestServer} from './test_helpers';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';

const testWorkspacePath = path.join(__dirname, 'test-workspace');

describe('LSP Diagnostics', () => {
  let connection: rpc.MessageConnection;
  let tsgoConnection: rpc.MessageConnection;
  let serverCleanup: () => Promise<void>;
  let env: TestEnv;

  beforeAll(async () => {
    const result = await startTestServer(testWorkspacePath);
    connection = result.connection;
    tsgoConnection = result.tsgoConnection;
    serverCleanup = result.cleanup;
  });

  afterAll(async () => {
    await serverCleanup();
  });

  beforeEach(() => {
    const fileManager = new TestFileManager(testWorkspacePath);
    env = new TestEnv(connection, tsgoConnection, fileManager);
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it('should clear diagnostics for associated file when errors disappear', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './app_diag_test.component.html',
      })
      export class AppDiagTestComponent {
        // name is missing initially
      }
    `;
    const templateContent = '<div [title]="name"></div>';

    const tsName = 'app_diag_test.component.ts';
    const htmlName = 'app_diag_test.component.html';

    // 1. Create TS file with missing property
    const tsPath = await env.createFile(tsName, appTsContent);
    await env.openFile(tsPath, appTsContent);

    // 2. Create template file
    const htmlPath = await env.createFile(htmlName, templateContent);
    await env.openFile(htmlPath, templateContent);

    // Wait for background analysis to complete after template creation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 3. Pull diagnostics for HTML file - should show error for 'name'
    const resultBefore = await env.lspClient.diagnostic(htmlPath);
    expect(resultBefore).toBeTruthy();
    expect(resultBefore.items.length).toBeGreaterThan(0);
    expect(
      resultBefore.items.some((i: any) => i.message.includes("Property 'name' does not exist")),
    ).toBe(true);

    // 4. Fix the error in TS file
    const updatedTsContent = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './app_diag_test.component.html',
      })
      export class AppDiagTestComponent {
        name = 'hello';
      }
    `;
    await env.editFile(tsPath, updatedTsContent, 'virtual');

    // 5. Pull diagnostics for HTML file again - should be empty
    const resultAfter = await env.lspClient.diagnostic(htmlPath);
    expect(resultAfter).toBeTruthy();
    expect(resultAfter.items.length).toBe(0);
  });

  it('should not clear diagnostics for unrelated files', async () => {
    const appTsContentA = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './app_diag_test_a.component.html',
      })
      export class AppDiagTestComponentA {
        // name is missing initially
      }
    `;
    const templateContentA = '<div [title]="name"></div>';
    const tsNameA = 'app_diag_test_a.component.ts';
    const htmlNameA = 'app_diag_test_a.component.html';

    const appTsContentC = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './app_diag_test_c.component.html',
      })
      export class AppDiagTestComponentC {
        // age is missing initially
      }
    `;
    const templateContentC = '<div [title]="age"></div>';
    const tsNameC = 'app_diag_test_c.component.ts';
    const htmlNameC = 'app_diag_test_c.component.html';

    // 1. Create files for A
    const htmlPathA = await env.createFile(htmlNameA, templateContentA);
    const tsPathA = await env.createFile(tsNameA, appTsContentA);
    await env.openFile(tsPathA, appTsContentA);
    await env.openFile(htmlPathA, templateContentA);

    // 2. Create files for C
    const htmlPathC = await env.createFile(htmlNameC, templateContentC);
    const tsPathC = await env.createFile(tsNameC, appTsContentC);
    await env.openFile(tsPathC, appTsContentC);
    await env.openFile(htmlPathC, templateContentC);

    // Wait for background analysis
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 3. Verify both have diagnostics
    const resultBeforeA = await env.lspClient.diagnostic(htmlPathA);
    expect(resultBeforeA.items.length).toBeGreaterThan(0);

    const resultBeforeC = await env.lspClient.diagnostic(htmlPathC);
    expect(resultBeforeC.items.length).toBeGreaterThan(0);

    // 4. Fix the error in TS file A
    const updatedTsContentA = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './app_diag_test_a.component.html',
      })
      export class AppDiagTestComponentA {
        name = 'hello';
      }
    `;
    await env.editFile(tsPathA, updatedTsContentA, 'virtual');

    // Wait for background analysis
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 5. Pull diagnostics for HTML file A - should be empty
    const resultAfterA = await env.lspClient.diagnostic(htmlPathA);
    expect(resultAfterA.items.length).toBe(0);

    // 6. Pull diagnostics for HTML file C - should STILL have errors!
    const resultAfterC = await env.lspClient.diagnostic(htmlPathC);
    expect(resultAfterC.items.length).toBeGreaterThan(0);
  });

  it('should clear published diagnostics for template when template error is fixed in template', async () => {
    const publishedDiagnostics = new Map<string, any[]>();
    const sub = connection.onNotification(
      'textDocument/publishDiagnostics',
      (params: {uri: string; diagnostics: any[]}) => {
        publishedDiagnostics.set(params.uri.toLowerCase(), params.diagnostics);
      },
    );

    try {
      const appTsContent = `
        import {Component} from '@angular/core';
        @Component({
          templateUrl: './app_tmpl_fix.component.html',
        })
        export class AppTmplFixComponent {
          validProp = 'test';
        }
      `;
      const templateWithError = '<div [title]="invalidProp"></div>';

      const tsName = 'app_tmpl_fix.component.ts';
      const htmlName = 'app_tmpl_fix.component.html';

      const tsPath = await env.createFile(tsName, appTsContent);
      const htmlPath = await env.createFile(htmlName, templateWithError);
      await env.openFile(tsPath, appTsContent);
      await env.openFile(htmlPath, templateWithError);

      // Wait for background analysis
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Pull TS file first - should push diagnostics to HTML file
      await env.lspClient.diagnostic(tsPath);

      const htmlUri = URI.file(htmlPath).toString().toLowerCase();
      expect(publishedDiagnostics.get(htmlUri)?.length).toBeGreaterThan(0);

      // Now fix the template in the HTML file
      const fixedTemplate = '<div [title]="validProp"></div>';
      await env.editFile(htmlPath, fixedTemplate, 'virtual');

      // Pull diagnostics for HTML file
      const report = await env.lspClient.diagnostic(htmlPath);
      expect(report.items.length).toBe(0);

      // Published diagnostics for HTML file must also be cleared (empty array)
      expect(publishedDiagnostics.get(htmlUri)?.length).toBe(0);
    } finally {
      sub.dispose();
    }
  });

  it('should clear diagnostics when a document is closed', async () => {
    const publishedDiagnostics = new Map<string, any[]>();
    const sub = connection.onNotification(
      'textDocument/publishDiagnostics',
      (params: {uri: string; diagnostics: any[]}) => {
        publishedDiagnostics.set(params.uri.toLowerCase(), params.diagnostics);
      },
    );

    try {
      const appTsContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-close-diag',
          template: '<div>{{ nonExistent }}</div>',
          standalone: true,
        })
        export class AppCloseDiagComponent {}
      `;

      const tsName = 'app_close_diag.component.ts';
      const tsPath = await env.createFile(tsName, appTsContent);
      await env.openFile(tsPath, appTsContent);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const result = await env.lspClient.diagnostic(tsPath);
      expect(result.items.length).toBeGreaterThan(0);

      const tsUri = URI.file(tsPath).toString().toLowerCase();

      // Close the file
      await env.closeFile(tsPath);

      // Wait for server to process close and publish empty diagnostics
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Server should publish empty diagnostics on close
      expect(publishedDiagnostics.get(tsUri)?.length).toBe(0);
    } finally {
      sub.dispose();
    }
  });

  it('should update diagnostic range accurately when template binding is edited', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-route-test',
        templateUrl: './app_route_test.component.html',
      })
      export class AppRouteTestComponent {
        route = {path: '/home'};
      }
    `;
    const templateContent = '<div>{{ route.path }}</div>';

    const tsName = 'app_route_test.component.ts';
    const htmlName = 'app_route_test.component.html';

    const tsPath = await env.createFile(tsName, appTsContent);
    await env.openFile(tsPath, appTsContent);

    const htmlPath = await env.createFile(htmlName, templateContent);
    await env.openFile(htmlPath, templateContent);

    // Initial check: no error
    const resultInitial = await env.lspClient.diagnostic(htmlPath);
    expect(resultInitial.items.length).toBe(0);

    // Edit template: delete 't' and 'h' -> route.pa
    const updatedHtml = '<div>{{ route.pa }}</div>';
    await env.editFile(htmlPath, updatedHtml, 'virtual');

    const resultAfter = await env.lspClient.diagnostic(htmlPath);
    expect(resultAfter.items.length).toBe(1);
    const diag = resultAfter.items[0];
    expect(diag.message).toContain("Property 'pa' does not exist");
    // "pa" starts at character 14 ('<div>{{ route.'.length) and ends at 16
    expect(diag.range.start.character).toBe(14);
    expect(diag.range.end.character).toBe(16);
  });

  it('should return workspace diagnostics across multiple components in the workspace', async () => {
    const tsA = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-ws-a',
        templateUrl: './app_ws_a.component.html',
        standalone: true,
      })
      export class AppWsAComponent {
        missingA: string = '';
      }
    `;
    const htmlA = '<div>{{ invalidPropA }}</div>';

    const tsB = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-ws-b',
        template: '<span>{{ invalidPropB }}</span>',
        standalone: true,
      })
      export class AppWsBComponent {}
    `;

    const tsPathA = await env.createFile('app_ws_a.component.ts', tsA);
    await env.openFile(tsPathA, tsA);

    const htmlPathA = await env.createFile('app_ws_a.component.html', htmlA);
    await env.openFile(htmlPathA, htmlA);

    const tsPathB = await env.createFile('app_ws_b.component.ts', tsB);
    await env.openFile(tsPathB, tsB);

    // Wait for background analysis
    await new Promise((resolve) => setTimeout(resolve, 800));

    const wsReport = await env.lspClient.workspaceDiagnostic();
    expect(wsReport).toBeTruthy();
    expect(wsReport.items).toBeDefined();

    const allDiags = wsReport.items.flatMap((item: any) => item.items || []);
    expect(
      allDiags.some((d: any) => d.message.includes("Property 'invalidPropA' does not exist")),
    ).toBe(true);
    expect(
      allDiags.some((d: any) => d.message.includes("Property 'invalidPropB' does not exist")),
    ).toBe(true);
  });
});
