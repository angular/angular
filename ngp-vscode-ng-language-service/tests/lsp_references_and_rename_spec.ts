import * as rpc from 'vscode-jsonrpc/node';
import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';
import {WorkspaceEdit} from 'vscode-languageserver';

const testWorkspacePath = getTestWorkspacePath();

describe('LSP References and Rename', () => {
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

  it('should find references for component member from template usage via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-ref-test',
        template: '<div>{{ myPr¦operty }}</div>',
        standalone: true,
      })
      export class AppRefTestComponent {
        myProperty: string = 'hello';
      }
    `;

    await env.run('app_ref_test.ts', appTsContent, async (filePath) => {
      const refs = await env.getReferencesAtCursor(filePath);
      expect(refs).not.toBeNull();
      expect(refs!.length).toBe(2);

      const fileContent = await env.getFileContent(filePath);
      for (const ref of refs!) {
        const startOffset = getOffsetFromPosition(fileContent, ref.range.start);
        const endOffset = getOffsetFromPosition(fileContent, ref.range.end);
        const text = fileContent.substring(startOffset, endOffset);
        expect(text).toBe('myProperty');
      }
    });
  });

  it('should find references from TS class declaration to template usage via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-ref-from-ts',
        template: '<div>{{ myTsProperty }}</div>',
        standalone: true,
      })
      export class AppRefFromTsComponent {
        myTsP¦roperty: string = 'hello';
      }
    `;

    await env.run('app_ref_from_ts.ts', appTsContent, async (filePath) => {
      const refs = await env.getReferencesAtCursor(filePath);
      expect(refs).not.toBeNull();
      expect(refs!.length).toBe(2);

      const fileContent = await env.getFileContent(filePath);
      for (const ref of refs!) {
        const startOffset = getOffsetFromPosition(fileContent, ref.range.start);
        const endOffset = getOffsetFromPosition(fileContent, ref.range.end);
        const text = fileContent.substring(startOffset, endOffset);
        expect(text).toBe('myTsProperty');
      }
    });
  });

  it('should provide prepareRename info for template property via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-prepare-rename',
        template: '<span>{{ rename¦Me }}</span>',
        standalone: true,
      })
      export class AppPrepareRenameComponent {
        renameMe: string = 'hello';
      }
    `;

    await env.run('app_prepare_rename.ts', appTsContent, async (filePath) => {
      const renameInfo = await env.prepareRenameAtCursor(filePath);
      expect(renameInfo).not.toBeNull();
      expect(renameInfo.range).toBeDefined();

      const fileContent = await env.getFileContent(filePath);
      const startOffset = getOffsetFromPosition(fileContent, renameInfo.range.start);
      const endOffset = getOffsetFromPosition(fileContent, renameInfo.range.end);
      const text = fileContent.substring(startOffset, endOffset);
      expect(text).toBe('renameMe');
    });
  });

  it('should perform rename across template and TS file via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-rename-test',
        template: '<button>{{ click¦Count }}</button>',
        standalone: true,
      })
      export class AppRenameTestComponent {
        clickCount: number = 0;
      }
    `;

    await env.run('app_rename_test.ts', appTsContent, async (filePath) => {
      const edit: WorkspaceEdit | null = await env.renameAtCursor(filePath, 'totalClicks');
      expect(edit).not.toBeNull();
      expect(edit!.changes).toBeDefined();

      const changes = Object.values(edit!.changes || {}).flat();
      expect(changes.length).toBe(2);
      for (const change of changes) {
        expect(change.newText).toBe('totalClicks');
      }
    });
  });

  it('should find references for @let declarations via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-let-ref',
        template: '@let my¦Var = 123; {{ myVar }}',
        standalone: true,
      })
      export class AppLetRefComponent {}
    `;

    await env.run('app_let_ref.ts', appTsContent, async (filePath) => {
      const refs = await env.getReferencesAtCursor(filePath);
      expect(refs).not.toBeNull();
      expect(refs!.length).toBe(2);

      const fileContent = await env.getFileContent(filePath);
      for (const ref of refs!) {
        const startOffset = getOffsetFromPosition(fileContent, ref.range.start);
        const endOffset = getOffsetFromPosition(fileContent, ref.range.end);
        const text = fileContent.substring(startOffset, endOffset);
        expect(text).toBe('myVar');
      }
    });
  });

  it('should rename @let declarations via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-let-rename',
        template: '@let old¦Var = 456; {{ oldVar + 1 }}',
        standalone: true,
      })
      export class AppLetRenameComponent {}
    `;

    await env.run('app_let_rename.ts', appTsContent, async (filePath) => {
      const edit: WorkspaceEdit | null = await env.renameAtCursor(filePath, 'newVar');
      expect(edit).not.toBeNull();
      expect(edit!.changes).toBeDefined();

      const changes = Object.values(edit!.changes || {}).flat();
      expect(changes.length).toBe(2);
      for (const change of changes) {
        expect(change.newText).toBe('newVar');
      }
    });
  });

  it('should find references and rename element references (#ref) via LSP', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-elem-ref',
        template: '<input #my¦Input /> {{ myInput.value }}',
        standalone: true,
      })
      export class AppElemRefComponent {}
    `;

    await env.run('app_elem_ref.ts', appTsContent, async (filePath) => {
      const refs = await env.getReferencesAtCursor(filePath);
      expect(refs).not.toBeNull();
      expect(refs!.length).toBe(2);

      const fileContent = await env.getFileContent(filePath);
      for (const ref of refs!) {
        const startOffset = getOffsetFromPosition(fileContent, ref.range.start);
        const endOffset = getOffsetFromPosition(fileContent, ref.range.end);
        const text = fileContent.substring(startOffset, endOffset);
        expect(text).toBe('myInput');
      }

      const edit: WorkspaceEdit | null = await env.renameAtCursor(filePath, 'renamedInput');
      expect(edit).not.toBeNull();
      const changes = Object.values(edit!.changes || {}).flat();
      expect(changes.length).toBe(2);
      for (const change of changes) {
        expect(change.newText).toBe('renamedInput');
      }
    });
  });

  it('should find references for pipes via LSP', async () => {
    const pipeTsContent = `
      import {Pipe, PipeTransform} from '@angular/core';

      @Pipe({
        name: 'myLspPipe',
        standalone: true,
      })
      export class MyLspPipe implements PipeTransform {
        transform(value: string): string {
          return value;
        }
      }
    `;
    await env.createFile('lsp_pipe.ts', pipeTsContent);

    const appTsContent = `
      import {Component} from '@angular/core';
      import {MyLspPipe} from './lsp_pipe';

      @Component({
        selector: 'app-pipe-test',
        template: '{{ "hello" | myLsp¦Pipe }}',
        standalone: true,
        imports: [MyLspPipe],
      })
      export class AppPipeTestComponent {}
    `;

    await env.run('app_pipe_test.ts', appTsContent, async (filePath) => {
      const refs = await env.getReferencesAtCursor(filePath);
      expect(refs).not.toBeNull();
      expect(refs!.length).toBe(2);
    });
  });
});

function getOffsetFromPosition(
  content: string,
  position: {line: number; character: number},
): number {
  const lines = content.split('\n');
  let offset = 0;
  for (let i = 0; i < position.line; i++) {
    offset += lines[i].length + 1;
  }
  return offset + position.character;
}
