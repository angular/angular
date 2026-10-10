import * as rpc from 'vscode-jsonrpc/node';
import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';

const testWorkspacePath = getTestWorkspacePath();

describe('Incremental Analysis', () => {
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

  it('should update hover info when file content changes', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-inc-test',
        template: '<div [title]="¦name"></div>',
        standalone: true,
      })
      export class AppIncTestComponent {
        name!: string;
      }
    `;

    await env.run('app_inc_test.ts', appTsContent, async (filePath) => {
      // Initial check
      await env.expectHoverAtCursor(filePath, ['string']);

      // Now change the file content
      const updatedContent = `
      import {Component} from '@angular/core';
      @Component({ template: '<div [title]="¦name"></div>'})
      export class AppIncTestComponent {
        name!: number;
      }
    `;
      await env.editFile(filePath, updatedContent, 'virtual');

      // Request again
      await env.expectHoverAtCursor(filePath, ['number']);
    });
  });

  it('should use virtual content while open and fallback to physical file content when closed', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        template: '<div [title]="¦name"></div>',
      })
      export class AppIncTestComponent {
        name!: string;
      }
    `;

    await env.run('app_inc_test_close.ts', appTsContent, async (filePath) => {
      await env.expectHoverAtCursor(filePath, ['string']);

      await env.editFile(filePath, appTsContent.replace('string', 'number'), 'virtual');
      await env.expectHoverAtCursor(filePath, ['number']);

      await env.editFile(filePath, appTsContent.replace('string', 'boolean'), 'physical');
      // Should still show virtual content
      await env.expectHoverAtCursor(filePath, ['number']);

      await env.closeFile(filePath);
      // After close, hover should reflect physical content (boolean)
      await env.expectHoverAtCursor(filePath, ['boolean']);
    });
  });

  it('should update hover info when external template content changes', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './app_inc_tmpl_test.component.html',
      })
      export class AppIncTmplTestComponent {
        nameStr!: string;
        nameNum!: number;
      }
    `;
    const templateContent = '<div [title]="¦nameStr"></div>';

    const tsName = 'app_inc_tmpl_test.component.ts';
    const htmlName = 'app_inc_tmpl_test.component.html';

    await env.run(htmlName, templateContent, async (htmlPath) => {
      await env.createFile(tsName, appTsContent);

      await env.expectHoverAtCursor(htmlPath, ['string']);

      const updatedTemplateContent = '<div [title]="¦nameNum"></div>';
      await env.editFile(htmlPath, updatedTemplateContent);

      // last update ignored because the file is open in the editor
      await env.expectHoverAtCursor(htmlPath, ['string']);

      // Closing file should result in invalidating contents and updating to physical
      await env.closeFile(htmlPath);
      await env.expectHoverAtCursor(htmlPath, ['number']);
    });
  });

  it('should update hover info when missing template is created', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        templateUrl: './missing.component.html',
      })
      export class AppMissingTmplTestComponent {
        nameStr!: string;
      }
    `;
    const templateContent = '<div [title]="¦nameStr"></div>';

    const tsName = 'app_missing_tmpl_test.component.ts';
    const htmlName = 'missing.component.html';

    // 1. Create the TS file first. The template is missing.
    const tsPath = await env.createFile(tsName, appTsContent);

    // 2. Open the TS file (this triggers analysis in server)
    await env.openFile(tsPath, appTsContent);

    // 3. Now create the template file (physical)
    const htmlPath = await env.createFile(htmlName, templateContent);

    // 4. Open the template file to check hover
    await env.openFile(htmlPath, await env.getFileContent(htmlPath));

    // 5. Check hover at cursor in the template
    await env.expectHoverAtCursor(htmlPath, ['string']);
  });
  it('should update diagnostics when file content changes', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-inc-test',
        template: '<div>{{ nonExistent }}</div>',
        standalone: true,
      })
      export class AppIncTestComponent {
      }
    `;

    await env.run('app_inc_diag_test.ts', appTsContent, async (filePath) => {
      // Initial check: should have diagnostic for nonExistent
      await env.expectDiagnostics(filePath, ['nonExistent']);

      // Now fix the error by adding the property
      const updatedContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-inc-test',
        template: '<div>{{ nonExistent }}</div>',
        standalone: true,
      })
      export class AppIncTestComponent {
        nonExistent = 'hello';
      }
    `;
      await env.editFile(filePath, updatedContent, 'virtual');

      // Request again: should have no diagnostics for nonExistent
      const result = await (env as any).lspClient.diagnostic(filePath);
      expect(result).toBeTruthy();
      expect(result.items).toBeTruthy();
      const messages = result.items.map((item: any) => item.message);
      expect(messages.some((m: string) => m.includes('nonExistent'))).toBe(false);
    });
  });
});
