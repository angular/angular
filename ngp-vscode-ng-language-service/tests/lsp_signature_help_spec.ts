import * as path from 'path';
import * as rpc from 'vscode-jsonrpc/node';
import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';

const testWorkspacePath = getTestWorkspacePath();

describe('LSP Signature Help', () => {
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

  it('should provide signature help for empty argument list via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-sig-lsp',
        template: '<div>{{ foo(¦) }}</div>',
        standalone: true,
      })
      export class AppSigLspComponent {
        foo(alpha: string, beta: number): string {
          return 'hello';
        }
      }
    `;

    await env.run('app_sig_empty.ts', appTsContent, async (filePath) => {
      const help = await env.getSignatureHelpAtCursor(filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.signatures[0].parameters).toBeDefined();
      expect(help!.signatures[0].parameters!.length).toBe(2);
      expect(help!.activeParameter === 0 || help!.activeParameter === undefined).toBe(true);
    });
  });

  it('should provide signature help with active parameter for single argument via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-sig-lsp',
        template: '<div>{{ foo("test"¦) }}</div>',
        standalone: true,
      })
      export class AppSigLspComponent {
        foo(alpha: string, beta: number): string {
          return 'hello';
        }
      }
    `;

    await env.run('app_sig_single.ts', appTsContent, async (filePath) => {
      const help = await env.getSignatureHelpAtCursor(filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(0);
    });
  });

  it('should provide signature help with active parameter for second argument via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-sig-lsp',
        template: '<div>{{ foo("test", ¦) }}</div>',
        standalone: true,
      })
      export class AppSigLspComponent {
        foo(alpha: string, beta: number): string {
          return 'hello';
        }
      }
    `;

    await env.run('app_sig_second.ts', appTsContent, async (filePath) => {
      const help = await env.getSignatureHelpAtCursor(filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(1);
    });
  });

  it('should provide signature help in external template via LSP', async () => {
    await env.createFile('app_sig_ext.html', '<div>{{ foo("test", ¦) }}</div>');
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-sig-ext',
        templateUrl: './app_sig_ext.html',
        standalone: true,
      })
      export class AppSigExtComponent {
        foo(alpha: string, beta: number): string {
          return 'hello';
        }
      }
    `;

    await env.createFile('app_sig_ext.ts', appTsContent);
    const htmlPath = path.join(testWorkspacePath, 'app_sig_ext.html');
    await env.openFile(htmlPath, await env.getFileContent(htmlPath));

    const help = await env.getSignatureHelpAtCursor(htmlPath);
    expect(help).not.toBeNull();
    expect(help!.signatures.length).toBe(1);
    expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
    expect(help!.activeParameter).toBe(1);
  });

  it('should provide signature help in event binding via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-sig-event',
        template: '<button (click)="handleClick($event, ¦)">Click</button>',
        standalone: true,
      })
      export class AppSigEventComponent {
        handleClick(event: MouseEvent, extra: number): void {}
      }
    `;

    await env.run('app_sig_event.ts', appTsContent, async (filePath) => {
      const help = await env.getSignatureHelpAtCursor(filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('handleClick(event: MouseEvent, extra: number)');
      expect(help!.activeParameter).toBe(1);
    });
  });

  it('should return null when cursor is on non-call expression via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-sig-null',
        template: '<div>{{ myPr¦op }}</div>',
        standalone: true,
      })
      export class AppSigNullComponent {
        myProp = 'hello';
      }
    `;

    await env.run('app_sig_null.ts', appTsContent, async (filePath) => {
      const help = await env.getSignatureHelpAtCursor(filePath);
      expect(help).toBeNull();
    });
  });

  it('should clean up TCB-specific prefixes from signature help via LSP', async () => {
    await env.createFile('lsp_types.ts', 'export interface LspData { id: number; }');
    const appTsContent = `
      import {Component} from '@angular/core';
      import {LspData} from './lsp_types';

      @Component({
        selector: 'app-sig-clean',
        template: '<div>{{ runTask(¦) }}</div>',
        standalone: true,
      })
      export class AppSigCleanComponent {
        runTask(data: LspData): LspData {
          return data;
        }
      }
    `;

    await env.run('app_sig_clean.ts', appTsContent, async (filePath) => {
      const help = await env.getSignatureHelpAtCursor(filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      const label = help!.signatures[0].label;
      expect(label).not.toMatch(/\bi[0-9]+\./);
      expect(label).not.toMatch(/_t[0-9]+/);
      expect(label).toContain('runTask(data: LspData): LspData');
    });
  });
});
